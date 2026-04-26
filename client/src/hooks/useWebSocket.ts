import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';

interface WebSocketNotification {
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    // Create socket connection
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Authenticate with server
      socket.emit('authenticate', {
        userId: user.id,
        firmId: user.firmId,
      });
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      reconnectAttemptsRef.current += 1;
    });

    socket.on('error', (error) => {
      console.error('[WebSocket] Socket error:', error);
    });

    // Notification handler
    socket.on('notification', (notification: WebSocketNotification) => {
      console.log('[WebSocket] Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    // Real-time event handlers
    socket.on('document_shared', (data) => {
      console.log('[WebSocket] Document shared:', data);
      setNotifications(prev => [{
        type: 'collaboration',
        title: 'Document Shared',
        message: data.message || 'A document has been shared with you',
        relatedEntityType: 'document',
        relatedEntityId: data.documentId,
      }, ...prev]);
    });

    socket.on('access_revoked', (data) => {
      console.log('[WebSocket] Access revoked:', data);
      setNotifications(prev => [{
        type: 'collaboration',
        title: 'Access Revoked',
        message: data.message || 'Your access to a document has been revoked',
        relatedEntityType: 'document',
        relatedEntityId: data.documentId,
      }, ...prev]);
    });

    socket.on('template_approved', (data) => {
      console.log('[WebSocket] Template approved:', data);
      setNotifications(prev => [{
        type: 'system',
        title: 'Template Approved',
        message: `Template "${data.templateTitle}" has been approved`,
        relatedEntityType: 'template',
        relatedEntityId: data.templateId,
      }, ...prev]);
    });

    socket.on('template_rejected', (data) => {
      console.log('[WebSocket] Template rejected:', data);
      setNotifications(prev => [{
        type: 'system',
        title: 'Template Rejected',
        message: `Template "${data.templateTitle}" was rejected: ${data.reason}`,
        relatedEntityType: 'template',
        relatedEntityId: data.templateId,
      }, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user?.id, user?.firmId]);

  // Emit event to server
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('[WebSocket] Socket not connected, cannot emit event:', event);
    }
  }, []);

  // Broadcast to firm
  const broadcastToFirm = useCallback((event: string, data: any) => {
    emit('broadcast_firm', { event, data });
  }, [emit]);

  // Broadcast to user
  const broadcastToUser = useCallback((event: string, data: any) => {
    emit('broadcast_user', { event, data });
  }, [emit]);

  return {
    isConnected,
    notifications,
    setNotifications,
    emit,
    broadcastToFirm,
    broadcastToUser,
    socket: socketRef.current,
  };
}
