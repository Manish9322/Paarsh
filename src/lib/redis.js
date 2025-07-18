// lib/redisClient.js
import Redis from 'ioredis';
import { REDIS_URL } from '../../config/config.js';

let redisClient = global.redisClient;

if (!redisClient) {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    lazyConnect: false, // <- keep it false to ensure immediate reuse
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  global.redisClient = redisClient;
}

export default redisClient;
