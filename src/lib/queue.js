import { Queue, Worker } from 'bullmq';
import { REDIS_URL } from 'config/config';
import Redis from 'ioredis';

console.log('Connecting to Redis at:', REDIS_URL);

const connection = new Redis(REDIS_URL , {
  maxRetriesPerRequest: null,
});

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