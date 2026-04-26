/**
 * WebSocket server setup for real-time notifications
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getDb } from './db';

interface ConnectedUser {
  userId: number;
  firmId: number;
  socketId: string;
}

const connectedUsers = new Map<string, ConnectedUser>();
let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.VITE_FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', (data: { userId: number; firmId: number }) => {
      const user: ConnectedUser = {
        userId: data.userId,
        firmId: data.firmId,
        socketId: socket.id,
      };
      connectedUsers.set(socket.id, user);
      socket.join(`firm:${data.firmId}`);
      socket.join(`user:${data.userId}`);
      console.log(`[WebSocket] User ${data.userId} authenticated on socket ${socket.id}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`[WebSocket] User ${user.userId} disconnected`);
        connectedUsers.delete(socket.id);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[WebSocket] Socket error: ${error}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.values());
}

/**
 * Emit notification to a specific user
 */
export async function emitNotificationToUser(
  userId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }
) {
  if (!io) return;

  // Save notification to database
  try {
    const db = await getDb();
    if (db) {
      // Get user's firm ID from users table
      const userResult = await db.select().from(require('../drizzle/schema').users).where(
        require('drizzle-orm').eq(require('../drizzle/schema').users.id, userId)
      );
      const user = userResult?.[0];
      const firmId = user?.firmId;

      if (firmId) {
        // Insert notification
        await db.insert(require('../drizzle/schema').realtimeNotifications).values({
          firmId,
          userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedEntityType: notification.relatedEntityType || null,
          relatedEntityId: notification.relatedEntityId || null,
          isRead: 0,
          createdAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[WebSocket] Failed to save notification:', error);
  }

  // Emit via WebSocket
  io.to(`user:${userId}`).emit('notification', notification);
}

/**
 * Emit notification to all users in a firm
 */
export async function emitNotificationToFirm(
  firmId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }
) {
  if (!io) return;

  // Save notification to database for all users in firm
  try {
    const db = await getDb();
    if (db) {
      // Get all users in firm
      const users = await db.select().from(require('../drizzle/schema').users).where(
        require('drizzle-orm').eq(require('../drizzle/schema').users.firmId, firmId)
      );

      // Insert notification for each user
      for (const user of users) {
        await db.insert(require('../drizzle/schema').realtimeNotifications).values({
          firmId,
          userId: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          relatedEntityType: notification.relatedEntityType || null,
          relatedEntityId: notification.relatedEntityId || null,
          isRead: 0,
          createdAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('[WebSocket] Failed to save firm notification:', error);
  }

  io.to(`firm:${firmId}`).emit('notification', notification);
}

/**
 * Emit real-time event (e.g., document shared, clause updated)
 */
export function emitRealtimeEvent(
  target: 'user' | 'firm',
  id: number,
  event: string,
  data: any
) {
  if (!io) return;

  const room = target === 'user' ? `user:${id}` : `firm:${id}`;
  io.to(room).emit(event, data);
}

/**
 * Broadcast to all connected clients
 */
export function broadcastEvent(event: string, data: any) {
  if (!io) return;

  io.emit(event, data);
}
