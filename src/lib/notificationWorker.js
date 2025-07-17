// lib/autoWorker.js
import { Worker } from 'bullmq';
import { connection } from './queue.js';
import _db from '../../utils/db.js';
import Notification from '../../models/Notification/Notification.model.js';
import PushSubscription from '../../models/Notification/PushScubscription.model.js';
import pushNotificationEmail from '../../utils/MailTemplates/customPushTemplate.js';
import emailSender from '../../utils/mailSender.js';
import { sendPushNotification } from './webpush.js';
import UserModel from 'models/User.model.js';
import { getSocket } from '../lib/socket.js';
import { bootstrapSocketForWorker } from '../../utils/initSocketForWorker.js';
import AgentModel from 'models/Agent.model.js';

bootstrapSocketForWorker(); // 🔥 Full Socket.IO initialized now in worker

let notificationWorker = null;
let emailWorker = null;
let isNotificationWorkerRunning = false;
let isEmailWorkerRunning = false;


await _db(); // Ensure database connection is established

// Auto-initialize function
export async function autoInitializeWorker() {
  // Only initialize on server-side and if not already running
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    console.log('🚀 Auto-initializing notification worker...');
    
  // Initialize notification worker
    if (!isNotificationWorkerRunning) {
      notificationWorker = new Worker('notification-queue', async (job) => {
        console.log(`🔄 Processing notification job: ${job.id}`);
        
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
          console.error('❌ Notification worker processing error:', error);
          throw error;
        }
      }, { 
        connection,
        concurrency: 3,
        removeOnComplete: 50,
        removeOnFail: 25
      });

      // Notification worker event listeners
      notificationWorker.on('completed', (job) => {
        console.log(`✅ Notification worker completed job: ${job.id}`);
      });

      notificationWorker.on('failed', (job, err) => {
        console.error(`❌ Notification worker failed job ${job.id}:`, err.message);
      });

      notificationWorker.on('error', (err) => {
        console.error('🚨 Notification worker error:', err);
      });

      notificationWorker.on('ready', () => {
        console.log('🎉 Notification worker is ready and listening!');
      });

      isNotificationWorkerRunning = true;
    }

    // Initialize email worker
    if (!isEmailWorkerRunning) {
      emailWorker = new Worker('email-queue', async (job) => {
        console.log(`📧 Processing email job: ${job.id}`);
        
        const { type, data } = job.data;
      
        await _db();
        
        try {
          switch (type) {
            case 'send_single_email':
              await processSingleEmail(data);
              break;
            case 'send_broadcast_email':
              await processBroadcastEmail(data);
              break;
            default:
              throw new Error(`Unknown email type: ${type}`);
          }
        } catch (error) {
          console.error('❌ Email worker processing error:', error);
          throw error;
        }
      }, { 
        connection,
        concurrency: 5, // Higher concurrency for emails
        removeOnComplete: 50,
        removeOnFail: 25
      });

      // Email worker event listeners
      emailWorker.on('completed', (job) => {
        console.log(`✅ Email worker completed job: ${job.id}`);
      });

      emailWorker.on('failed', (job, err) => {
        console.error(`❌ Email worker failed job ${job.id}:`, err.message);
      });

      emailWorker.on('error', (err) => {
        console.error('🚨 Email worker error:', err);
      });

      emailWorker.on('ready', () => {
        console.log('🎉 Email worker is ready and listening!');
      });

      isEmailWorkerRunning = true;
    }

    return { notificationWorker, emailWorker };
    
  } catch (error) {
    console.error('💥 Failed to auto-initialize workers:', error);
    return null;
  }
}

// Get worker status
export function getAutoWorkerStatus() {
  return {
    notification: {
      isRunning: isNotificationWorkerRunning,
      hasWorker: !!notificationWorker
    },
    email: {
      isRunning: isEmailWorkerRunning,
      hasWorker: !!emailWorker
    }
  };
}


// Graceful shutdown
export async function gracefulShutdown() {
  console.log('🛑 Gracefully shutting down workers...');
  
  const shutdownPromises = [];
  
  if (notificationWorker && isNotificationWorkerRunning) {
    shutdownPromises.push(
      notificationWorker.close().then(() => {
        console.log('✅ Notification worker shutdown complete');
        isNotificationWorkerRunning = false;
      })
    );
  }
  
  if (emailWorker && isEmailWorkerRunning) {
    shutdownPromises.push(
      emailWorker.close().then(() => {
        console.log('✅ Email worker shutdown complete');
        isEmailWorkerRunning = false;
      })
    );
  }
  
  try {
    await Promise.all(shutdownPromises);
    console.log('✅ All workers shutdown complete');
  } catch (error) {
    console.error('❌ Error during workers shutdown:', error);
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
  const { message, type, link, metadata, excludeUserId, recipientType } = data;

  console.log('📡 Processing broadcast notification...');
  
  // Get all active users (implement your user fetching logic)
  const users = await getAllActiveUsers(excludeUserId, recipientType);
  
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

async function processSingleEmail(data) {
  const { userId, subject, message, type, metadata } = data;
  
  console.log(`📧 [${new Date().toISOString()}] Processing single email for user: ${userId}`);
  
  try {
    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    if (!user.email) {
      throw new Error(`User has no email: ${userId}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error(`Invalid email format for user ${userId}: ${user.email}`);
    }

    // Prepare email data
    const emailData = {
      email: user.email.trim(),
      subject: subject || 'Notification',
      message: pushNotificationEmail(message, user.name || 'User'),
    };

    console.log(`📧 [${new Date().toISOString()}] Sending email to ${user.email} with subject: "${emailData.subject}"`);

    // Send email
    const emailResult = await emailSender(emailData);
    
    if (emailResult.success) {
      console.log(`✅ [${new Date().toISOString()}] Email sent successfully to user: ${userId} (${user.email})`);
      return emailResult;
    } else {
      console.error(`❌ [${new Date().toISOString()}] Email failed for user ${userId}:`, emailResult.error);
      throw new Error(`Email failed for user ${userId}: ${emailResult.error}`);
    }

  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] processSingleEmail error:`, error.message);
    throw error;
  }
}

// Updated processBroadcastEmail function
// Updated processBroadcastEmail function with proper error handling
async function processBroadcastEmail(data) {
  const { message, type, subject, metadata, excludeUserId, recipientType } = data;

  console.log(`📧 Processing broadcast email...`);
  
  try {
    // Get all active users
    const users = await getAllActiveUsers(excludeUserId, recipientType);
    console.log(`🔍 Found ${users.length} active recipients for notifications (recipientType: ${recipientType})`);
    
    if (users.length === 0) {
      console.log(`ℹ️ No active users found for email broadcast`);
      return;
    }

    // Filter users with valid emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usersWithEmails = users.filter(user => {
      if (!user.email) {
        console.log(`⚠️ User ${user._id} has no email`);
        return false;
      }
      if (!emailRegex.test(user.email)) {
        console.log(`⚠️ User ${user._id} has invalid email: ${user.email}`);
        return false;
      }
      return true;
    });
    
    console.log(`📧 Found ${usersWithEmails.length} users with valid emails`);

    if (usersWithEmails.length === 0) {
      console.log(`ℹ️ No users with valid emails found for broadcast`);
      return;
    }

    // Create email promises for each user
    const emailPromises = usersWithEmails.map(user => {
      const emailData = {
        email: user.email.trim(),
        subject: subject || 'Notification',
        message: pushNotificationEmail(message, user.name || 'User'),
      };

      console.log(`Sending email to: ${user.email}`);
      return emailSender(emailData);
    });

    // Execute all email promises
    const results = await Promise.allSettled(emailPromises);
    
    // FIXED: Properly handle undefined values and check for success property
    const successCount = results.filter(r => {
      return r.status === 'fulfilled' && r.value && r.value.success === true;
    }).length;
    
    const failCount = results.filter(r => {
      return r.status === 'rejected' || !r.value || r.value.success !== true;
    }).length;

    console.log(`📊 Email batch results: ${successCount} success, ${failCount} failed`);

    // Log detailed results for debugging
    results.forEach((result, index) => {
      const email = usersWithEmails[index].email;
      if (result.status === 'fulfilled') {
        if (result.value && result.value.success) {
          console.log(`✅ Email sent successfully to: ${email}`);
        } else {
          console.error(`❌ Email failed for ${email}:`, result.value?.error || 'Unknown error');
        }
      } else {
        console.error(`❌ Email promise rejected for ${email}:`, result.reason);
      }
    });

  } catch (error) {
    console.error(`❌ processBroadcastEmail error:`, error.message);
    throw error;
  }
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
    test_notification: '🧪 Test Alert',
    custom_push: '🔔 Custom Notification'
  };
  return titles[type] || '🔔 Notification';
}

async function getAllActiveUsers(excludeUserId, recipientType) {
  let query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};
  let users = [];

  if (recipientType === 'all') {
    // Fetch both users and agents
    const regularUsers = await UserModel.find(query);
    const agents = await AgentModel.find(query);
    users = [...regularUsers, ...agents];
  } else if (recipientType === 'users') {
    users = await UserModel.find(query);
  } else if (recipientType === 'agents') {
    users = await AgentModel.find(query);
  }

  console.log(`🔍 Found ${users.length} active recipients for notifications (recipientType: ${recipientType})`);
  return users;
}