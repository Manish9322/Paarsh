// lib/server/workerInit.js
import { autoInitializeWorker } from '../../lib/notificationWorker.js';

let isInitialized = false;

export function initWorkerIfNeeded() {
  if (!isInitialized && typeof window === 'undefined') {
    autoInitializeWorker()
      .then(() => {
        console.log('🚀 Notification Worker started automatically');
        isInitialized = true;
      })
      .catch((err) => {
        console.error('❌ Failed to start worker:', err);
      });
  }
}
