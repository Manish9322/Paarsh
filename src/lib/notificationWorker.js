// lib/autoWorker.js
import { Worker } from 'bullmq';
import { connection } from './queue.js';
import _db from '../../utils/db.js';
import Notification from '../../models/Notification/Notification.model.js';
import PushSubscription from '../../models/Notification/PushScubscription.model.js';
import { sendPushNotification } from './webpush.js';
import UserModel from 'models/User.model.js';
import { getSocket } from '../lib/socket.js';
import { bootstrapSocketForWorker } from '../../utils/initSocketForWorker.js';

bootstrapSocketForWorker(); // 🔥 Full Socket.IO initialized now in worker

let notificationWorker = null;
let isWorkerRunning = false;

await _db(); // Ensure database connection is established

// Auto-initialize function
export async function autoInitializeWorker() {
  // Only initialize on server-side and if not already running
  if (typeof window !== 'undefined' || isWorkerRunning) {
    return null;
  }

  try {
    console.log('🚀 Auto-initializing notification worker...');
    
    notificationWorker = new Worker('notification-queue', async (job) => {
      console.log(`🔄 Processing job: ${job.id}`);
      
      const { type, data } = job.data;
    
      await _db();
      
      try {
        switch (type) {
          case 'send_single_notification':
            await processSingleNotification(data);
            break;
          case 'send_broadcast_notification':
            await processBroadcastNotification(data);
            break;
          default:
            throw new Error(`Unknown notification type: ${type}`);
        }
      } catch (error) {
        console.error('❌ Worker processing error:', error);
        throw error;
      }
    }, { 
      connection,
      concurrency: 3,
      removeOnComplete: 50,
      removeOnFail: 25
    });

    // Event listeners
    notificationWorker.on('completed', (job) => {
      console.log(`✅ Auto-worker completed job: ${job.id}`);
    });

    notificationWorker.on('failed', (job, err) => {
      console.error(`❌ Auto-worker failed job ${job.id}:`, err.message);
    });

    notificationWorker.on('error', (err) => {
      console.error('🚨 Auto-worker error:', err);
    });

    notificationWorker.on('ready', () => {
      console.log('🎉 Auto-notification worker is ready and listening!');
    });

    isWorkerRunning = true;
    return notificationWorker;
    
  } catch (error) {
    console.error('💥 Failed to auto-initialize worker:', error);
    return null;
  }
}

// Get worker status
export function getAutoWorkerStatus() {
  return {
    isRunning: isWorkerRunning,
    hasWorker: !!notificationWorker
  };
}

// Graceful shutdown (called when app shuts down)
export async function gracefulShutdown() {
  if (notificationWorker && isWorkerRunning) {
    console.log('🛑 Gracefully shutting down auto-worker...');
    try {
      await notificationWorker.close();
      isWorkerRunning = false;
      console.log('✅ Auto-worker shutdown complete');
    } catch (error) {
      console.error('❌ Error during auto-worker shutdown:', error);
    }
  }
}

// Process handlers with complete functionality from second file
async function processSingleNotification(data) {
  const { userId, senderId, message, type, link, metadata } = data;
  
  console.log(`📱 Processing single notification for user: ${userId}`);
  
  // Save notification to database
  const notification = await Notification.create({
    userId,
    senderId,
    message,
    type,
    link,
    metadata
  });

  // Send real-time notification via Socket.IO
  try {
    const io = getSocket();
    if (io) {
      io.to(`user:${userId}`).emit('new_notification', {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        createdAt: notification.createdAt,
        isRead: false
      });
      console.log(`📡 Real-time notification sent to user: ${userId}`);
    }
  } catch (socketError) {
    console.warn('⚠️ Socket.IO error:', socketError.message);
  }

  // Send push notification
  const pushSubscription = await PushSubscription.findOne({ userId, isActive: true });
  if (pushSubscription) {
    const pushPayload = {
      title: getNotificationTitle(type),
      body: message,
      url: link || '/',
      tag: `notification-${notification._id}`,
      notificationId: notification._id
    };

    const pushResult = await sendPushNotification(pushSubscription.subscription, pushPayload);
    if (pushResult.success) {
      console.log(`🔔 Push notification sent to user: ${userId}`);
    } else {
      console.error(`💥 Push notification failed for user ${userId}:`, pushResult.error);
      
      // Deactivate subscription if it's invalid
      if (pushResult.error.includes('410') || pushResult.error.includes('expired')) {
        await PushSubscription.updateOne(
          { userId },
          { isActive: false }
        );
        console.log(`🔕 Deactivated invalid push subscription for user: ${userId}`);
      }
    }
  }
}

async function processBroadcastNotification(data) {
  const { message, type, link, metadata, excludeUserId } = data;

  console.log('📡 Processing broadcast notification...');
  
  // Get all active users (implement your user fetching logic)
  const users = await getAllActiveUsers(excludeUserId);
  
  if (users.length === 0) {
    console.log('ℹ️ No active users found for broadcast');
    return;
  }

  const notifications = users.map(user => ({
    userId: user._id,
    senderId: null,
    message,
    type,
    link,
    metadata
  }));

  // Bulk insert notifications
  const savedNotifications = await Notification.insertMany(notifications);
  console.log(`💾 Created ${savedNotifications.length} broadcast notifications`);
  
  // Send real-time notifications
  try {
    const io = getSocket();
    if (io) {
      for (const notification of savedNotifications) {
        io.to(`user:${notification.userId}`).emit('new_notification', {
          id: notification._id,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          createdAt: notification.createdAt,
          isRead: false
        });
      }
      console.log(`📡 Sent ${savedNotifications.length} real-time broadcast notifications`);
    }
  } catch (socketError) {
    console.warn('⚠️ Socket.IO broadcast error:', socketError.message);
  }

  // Send push notifications in batches
  const batchSize = 100;
  for (let i = 0; i < savedNotifications.length; i += batchSize) {
    const batch = savedNotifications.slice(i, i + batchSize);
    await processPushNotificationBatch(batch);
  }
  console.log(`🔔 Processed push notifications for broadcast in batches`);
}

async function processPushNotificationBatch(notifications) {
  const userIds = notifications.map(n => n.userId);
  const subscriptions = await PushSubscription.find({
    userId: { $in: userIds },
    isActive: true
  });

  const pushPromises = subscriptions.map(async (sub) => {
    const notification = notifications.find(n => n.userId.toString() === sub.userId.toString());
    if (!notification) return;

    const pushPayload = {
      title: getNotificationTitle(notification.type),
      body: notification.message,
      url: notification.link || '/',
      tag: `notification-${notification._id}`,
      notificationId: notification._id
    };

    return sendPushNotification(sub.subscription, pushPayload);
  });

  const results = await Promise.allSettled(pushPromises);
  const successCount = results.filter(r => r.status === 'fulfilled').length;
  const failCount = results.filter(r => r.status === 'rejected').length;
  
  console.log(`📊 Push batch results: ${successCount} success, ${failCount} failed`);
}

function getNotificationTitle(type) {
  const titles = {
    course_purchase: '🎓 Course Purchase Confirmation',
    new_course: '📚 New Course Available',
    user_registration: '👤 New User Registration',
    new_offer: '🎉 Special Offer',
    new_blog: '📝 New Blog Post',
    job_application: '💼 Job Application Received',
    enquiry: '❓ New Enquiry',
    withdrawal_request: '💰 Withdrawal Request',
    test_notification: '🧪 Test Alert'
  };
  return titles[type] || '🔔 Notification';
}

async function getAllActiveUsers(excludeUserId) {
  const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};
  const users = await UserModel.find(query);
  console.log(`🔍 Found ${users.length} active users for notifications`);
  return users;
}
