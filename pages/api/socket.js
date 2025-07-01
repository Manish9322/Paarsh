import { initSocket } from '../../../Paarsh/src/lib/socket'; // ✅ Adjust if needed

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    const io = initSocket(res.socket.server);
    res.socket.server.io = io;
  } else {
    console.log('Socket.IO already running');
  }

  res.end();
}
