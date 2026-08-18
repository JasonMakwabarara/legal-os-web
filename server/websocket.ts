/**
 * WebSocket server setup for real-time notifications
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { parse as parseCookieHeader } from 'cookie';
import { COOKIE_NAME } from '@shared/const';
import { sdk } from './_core/sdk';
import { getDb, getUserByOpenId } from './db';

interface ConnectedUser {
  userId: number;
  firmId: number | null;
  socketId: string;
}

const connectedUsers = new Map<string, ConnectedUser>();
let io: SocketIOServer | null = null;

/**
 * Derive the connecting user's identity from the verified session JWT cookie
 * (app_session_id). Client-supplied identity fields are never trusted.
 */
async function resolveSocketUser(
  socket: Socket
): Promise<{ userId: number; firmId: number | null } | null> {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = parseCookieHeader(cookieHeader);
  const session = await sdk.verifySession(cookies[COOKIE_NAME]);
  if (!session) return null;

  const user = await getUserByOpenId(session.openId);
  if (!user) return null;

  return { userId: user.id, firmId: user.firmId ?? null };
}

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.VITE_FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Handshake middleware: reject sockets without a valid session cookie and
  // attach the server-side verified identity to socket.data.
  io.use(async (socket, next) => {
    try {
      const identity = await resolveSocketUser(socket);
      if (!identity) {
        next(new Error('Unauthorized'));
        return;
      }
      socket.data.userId = identity.userId;
      socket.data.firmId = identity.firmId;
      next();
    } catch (error) {
      console.error('[WebSocket] Handshake authentication failed:', error);
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as number;
    const firmId = (socket.data.firmId as number | null) ?? null;

    console.log(`[WebSocket] Client connected: ${socket.id} (user ${userId})`);

    // Join rooms based on the verified identity only.
    connectedUsers.set(socket.id, { userId, firmId, socketId: socket.id });
    socket.join(`user:${userId}`);
    if (firmId) {
      socket.join(`firm:${firmId}`);
    }

    // Kept for backward compatibility with clients that emit 'authenticate'.
    // Any client-supplied userId/firmId payload is ignored; rooms were already
    // joined from the verified session above.
    socket.on('authenticate', () => {
      socket.emit('authenticated', { userId, firmId });
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
