// utils/socketServer.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserModel from '../../models/User.model';
import AdminModel from '../../models/Admin.model';
import AgentModel from '../../models/Agent.model';
import { JWT_SECRET_ADMIN, JWT_SECRET_AGENT, JWT_SECRET_USER, NEXT_PUBLIC_APP_URL } from '../../config/config';

let io;

const ROLE_SECRET_MAP = {
  user: JWT_SECRET_USER,
  admin: JWT_SECRET_ADMIN,
  agent: JWT_SECRET_AGENT,
};

const ROLE_MODEL_MAP = {
  user: UserModel,
  admin: AdminModel,
  agent: AgentModel,
};

export function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));

      let decoded, role;
      for (const r of Object.keys(ROLE_SECRET_MAP)) {
        try {
          decoded = jwt.verify(token, ROLE_SECRET_MAP[r]);
          role = r;
          break;
        } catch (_) {
          continue;
        }
      }

      if (!decoded || !role) {
        return next(new Error("Invalid or expired token"));
      }

      const Model = ROLE_MODEL_MAP[role];
      const user = await Model.findById(decoded.userId).lean();

      if (!user) {
        return next(new Error(`${role} not found`));
      }

      // 👉 Validate session ID for user
      if (role === 'user') {
        const tokenSessionId = decoded.sessionId;

        if (
          !user.currentSessionId ||
          user.currentSessionId !== tokenSessionId
        ) {
          return next(new Error("Session expired or logged in elsewhere"));
        }
      }

      // Attach data to socket
      socket.userId = decoded.userId;
      socket.userRole = role;

      return next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      return next(new Error("Unauthorized socket connection"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`✅ ${socket.userRole} ${socket.userId} connected`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join admin room if needed
    if (socket.userRole === 'admin') {
      socket.join('admin');
    }

    // Join agent room if needed
    if (socket.userRole === 'agent') {
      socket.join('agent');
    }

    socket.on("disconnect", () => {
      console.log(`❌ ${socket.userRole} ${socket.userId} disconnected`);
    });
  });

  return io;
}

export function getSocket() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}


