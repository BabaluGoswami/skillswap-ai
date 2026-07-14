import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

// Global map tracking online users: userId string -> Set of socketIds
export const onlineUsers = new Map();
export let ioInstance = null;

/**
 * Helper to emit socket events to a specific user.
 */
export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit(event, data);
  }
};

/**
 * Initializes and configures Socket.io handlers.
 */
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins in dev, or tie to VITE host if configured
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    }
  });
  ioInstance = io;

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token is required.'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track user socket ID association
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for targeting user alerts
    socket.join(userId);

    // Broadcast user online presence
    io.emit('user_online', { userId });

    // Handle typing indicator
    socket.on('typing', ({ conversationId, receiverId }) => {
      if (receiverId) {
        socket.to(receiverId.toString()).emit('typing', { conversationId, senderId: userId });
      }
    });

    // Handle stop typing indicator
    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      if (receiverId) {
        socket.to(receiverId.toString()).emit('stop_typing', { conversationId, senderId: userId });
      }
    });

    // Handle message read status feedback
    socket.on('message_read', ({ conversationId, senderId }) => {
      if (senderId) {
        socket.to(senderId.toString()).emit('message_read', { conversationId, readerId: userId });
      }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast user offline presence
          io.emit('user_offline', { userId });
        }
      }
    });
  });

  return io;
};
export default initSocket;
