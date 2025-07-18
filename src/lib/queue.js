import { Queue } from 'bullmq';
import redisClient from './redis.js';

// Create a BullMQ-compatible connection object
const connection = {
  connect: () => redisClient.connect(),
  disconnect: () => redisClient.disconnect(),
  duplicate: () => redisClient.duplicate(), // Required by BullMQ
  get options() {
    return redisClient.options;
  }
};

// Notification Queue
export const notificationQueue = new Queue('notification-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Email Queue (new)
export const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Queue events
notificationQueue.on('error', (error) => {
  console.error('Notification queue error:', error);
});

emailQueue.on('error', (error) => {
  console.error('Email queue error:', error);
});


export { connection };