/**
 * Real-Time Updates Service using WebSocket
 * Handles live notifications, collaboration updates, and data sync
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

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

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const userId = parseInt(url.searchParams.get('userId') || '0');
      const firmId = parseInt(url.searchParams.get('firmId') || '0');

      if (!userId || !firmId) {
        ws.close(1008, 'Missing userId or firmId');
        return;
      }

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
