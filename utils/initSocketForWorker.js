import { createServer } from 'http';
import { initSocket } from '../src/lib/socket.js';

let initialized = false;

export function bootstrapSocketForWorker() {
  if (initialized) return;

  const dummyServer = createServer();
  dummyServer.listen(0); // secure random internal port

  initSocket(dummyServer);
  initialized = true;

  console.log('🚀 Socket.IO initialized inside worker');
}