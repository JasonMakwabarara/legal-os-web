/**
 * Real-Time Updates Service using WebSocket
 * Handles live notifications, collaboration updates, and data sync
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import { parse as parseCookieHeader } from 'cookie';
import { COOKIE_NAME } from '@shared/const';
import { sdk } from '../_core/sdk';
import { getUserByOpenId } from '../db';

interface WebSocketMessage {
  type: 'notification' | 'collaboration' | 'contract_update' | 'case_update' | 'ping';
  data: any;
  userId?: number;
  firmId?: number;
}

export class RealtimeService {
  private wss: WebSocketServer;
  private userConnections: Map<number, Set<WebSocket>> = new Map();
  private firmConnections: Map<number, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });
    this.setupWebSocketHandlers();
    this.startHeartbeat();
  }

  /**
   * Derive the connecting user's identity from the verified session JWT cookie
   * (app_session_id) on the upgrade request. Client-supplied identity (query
   * params, message fields) is never trusted.
   */
  private async resolveConnectionUser(
    req: IncomingMessage
  ): Promise<{ userId: number; firmId: number } | null> {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = parseCookieHeader(cookieHeader);
    const session = await sdk.verifySession(cookies[COOKIE_NAME]);
    if (!session) return null;

    const user = await getUserByOpenId(session.openId);
    if (!user || !user.firmId) return null;

    return { userId: user.id, firmId: user.firmId };
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', async (ws: WebSocket, req) => {
      let identity: { userId: number; firmId: number } | null = null;
      try {
        identity = await this.resolveConnectionUser(req);
      } catch (error) {
        console.error('[RealtimeService] Authentication failed:', error);
      }

      if (!identity) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      const { userId, firmId } = identity;

      // Register connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(ws);

      if (!this.firmConnections.has(firmId)) {
        this.firmConnections.set(firmId, new Set());
      }
      this.firmConnections.get(firmId)!.add(ws);

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(message, userId, firmId, ws);
        } catch (error) {
          console.error('[RealtimeService] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        this.userConnections.get(userId)?.delete(ws);
        this.firmConnections.get(firmId)?.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[RealtimeService] WebSocket error:', error);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({ type: 'connected', data: { userId, firmId } }));
    });
  }

  private handleMessage(message: WebSocketMessage, userId: number, firmId: number, ws: WebSocket) {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'notification':
        this.broadcastToFirm(firmId, message);
        break;
      case 'collaboration':
        this.broadcastToFirm(firmId, message);
        break;
      case 'contract_update':
        this.broadcastToFirm(firmId, message);
        break;
      case 'case_update':
        this.broadcastToFirm(firmId, message);
        break;
    }
  }

  private startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as any).isAlive === false) {
          ws.terminate();
          return;
        }
        (ws as any).isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  public broadcastToUser(userId: number, message: WebSocketMessage) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public broadcastToFirm(firmId: number, message: WebSocketMessage) {
    const connections = this.firmConnections.get(firmId);
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  public broadcastNotification(firmId: number, notification: any) {
    this.broadcastToFirm(firmId, {
      type: 'notification',
      data: notification,
    });
  }

  public broadcastCollaborationUpdate(firmId: number, update: any) {
    this.broadcastToFirm(firmId, {
      type: 'collaboration',
      data: update,
    });
  }

  public broadcastContractUpdate(firmId: number, update: any) {
    this.broadcastToFirm(firmId, {
      type: 'contract_update',
      data: update,
    });
  }

  public broadcastCaseUpdate(firmId: number, update: any) {
    this.broadcastToFirm(firmId, {
      type: 'case_update',
      data: update,
    });
  }
}
