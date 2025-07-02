import AdminModel from 'models/Admin.model.js';
import { notificationQueue } from '../src/lib/queue.js';
import { NOTIFICATION_TYPES, NOTIFICATION_MESSAGES } from './constant.js';
import { v4 as uuidv4 } from 'uuid';

class NotificationHelper {
  
  // Send single notification
  async sendNotification({
    userId,
    senderId = null,
    type,
    message,
    link = null,
    metadata = {},
    priority = 'normal'
  }) {
    try {
      const jobId = `single-${uuidv4()}`;
      
      await notificationQueue.add(
        'send_single_notification',
        {
          type: 'send_single_notification',
          data: {
            userId,
            senderId,
            message,
            type,
            link,
            metadata
          }
        },
        {
          jobId,
          priority: priority === 'high' ? 10 : 0,
          delay: 0
        }
      );

      return { success: true, jobId };
    } catch (error) {
      console.error('Error queuing single notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send broadcast notification to all users
  async sendBroadcastNotification({
    type,
    message,
    link = null,
    metadata = {},
    excludeUserId = null,
    priority = 'normal'
  }) {
    try {
      const jobId = `broadcast-${uuidv4()}`;
      
      await notificationQueue.add(
        'send_broadcast_notification',
        {
          type: 'send_broadcast_notification',
          data: {
            message,
            type,
            link,
            metadata,
            excludeUserId
          }
        },
        {
          jobId,
          priority: priority === 'high' ? 10 : 0,
          delay: 0
        }
      );

      return { success: true, jobId };
    } catch (error) {
      console.error('Error queuing broadcast notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to admin users
  async sendAdminNotification({
    senderId = null,
    type,
    message,
    link = null,
    metadata = {}
  }) {
    try {
      // Get all admin user IDs (implement your admin fetching logic)
      const adminUsers = await this.getAdminUsers();
      
      const promises = adminUsers.map(adminUser => 
        this.sendNotification({
          userId: adminUser._id,
          senderId,
          type,
          message,
          link,
          metadata,
          priority: 'high'
        })
      );

      const results = await Promise.allSettled(promises);
      return { success: true, results };
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Course purchase notifications
  async notifyCoursesPurchase({ userId, courseName, courseId, userName, purchaseAmount }) {
    const promises = [];

    // Notify user
    promises.push(
      this.sendNotification({
        userId,
        type: NOTIFICATION_TYPES.COURSE_PURCHASE,
        message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.COURSE_PURCHASE].user(courseName),
        link: `/total-courses`,
        metadata: { courseId, purchaseAmount }
      })
    );

    // Notify admin
    promises.push(
      this.sendAdminNotification({
        senderId: userId,
        type: NOTIFICATION_TYPES.COURSE_PURCHASE,
        message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.COURSE_PURCHASE].admin(userName, courseName),
        link: `/admin/transactions`,
        metadata: { userId, courseId, purchaseAmount, userName }
      })
    );

    return Promise.allSettled(promises);
  }

  // New course notifications
  async notifyNewCourse({ courseName, courseId, createdBy }) {
    return this.sendBroadcastNotification({
      type: NOTIFICATION_TYPES.NEW_COURSE,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.NEW_COURSE].broadcast(courseName),
      link: `/course?courseId=${courseId}`,
      metadata: { courseId, createdBy },
      excludeUserId: createdBy,
      priority: 'high'
    });
  }

  // User registration notification
  async notifyUserRegistration({ userId, userName, email }) {
    return this.sendAdminNotification({
      senderId: userId,
      type: NOTIFICATION_TYPES.USER_REGISTRATION,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.USER_REGISTRATION].admin(userName, email),
      link: `/admin/users`,
      metadata: { userId, userName, email }
    });
  }

  // New offer notification
  async notifyNewOffer({ offerTitle, offerId, createdBy }) {
    return this.sendBroadcastNotification({
      type: NOTIFICATION_TYPES.NEW_OFFER,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.NEW_OFFER].broadcast(offerTitle),
      link: `/newcourses`,
      metadata: { offerId, createdBy },
      excludeUserId: createdBy,
      priority: 'high'
    });
  }

  // New blog notification
  async notifyNewBlog({ blogTitle, blogId, createdBy }) {
    return this.sendBroadcastNotification({
      type: NOTIFICATION_TYPES.NEW_BLOG,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.NEW_BLOG].broadcast(blogTitle),
      link: `/blog/${blogId}`,
      metadata: { blogId, createdBy },
      excludeUserId: createdBy
    });
  }

  // Job application notification
  async notifyJobApplication({ userId, userName, position, applicationId }) {
    return this.sendAdminNotification({
      senderId: userId,
      type: NOTIFICATION_TYPES.JOB_APPLICATION,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.JOB_APPLICATION].admin(userName, position),
      link: `/admin/job-applications`,
      metadata: { userId, userName, position, applicationId }
    });
  }

  // Enquiry notification
  async notifyEnquiry({ userId, userName, subject, enquiryId }) {
    return this.sendAdminNotification({
      senderId: userId,
      type: NOTIFICATION_TYPES.ENQUIRY,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.ENQUIRY].admin(userName, subject),
      link: `/admin/enquiries`,
      metadata: { userId, userName, subject, enquiryId }
    });
  }

  // Withdrawal request notification
  async notifyWithdrawalRequest({ userId, userName, amount, requestId }) {
    return this.sendAdminNotification({
      senderId: userId,
      type: NOTIFICATION_TYPES.WITHDRAWAL_REQUEST,
      message: NOTIFICATION_MESSAGES[NOTIFICATION_TYPES.WITHDRAWAL_REQUEST].admin(userName, amount),
      link: `/admin/withdrawals`,
      metadata: { userId, userName, amount, requestId }
    });
  }

  // Helper method to get admin users
  async getAdminUsers() {
    
    const adminUsers = await AdminModel.find();
    return adminUsers;
  }

  // Get queue stats
  async getQueueStats() {
    try {
      const waiting = await notificationQueue.getWaiting();
      const active = await notificationQueue.getActive();
      const completed = await notificationQueue.getCompleted();
      const failed = await notificationQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return null;
    }
  }
}

export default new NotificationHelper();