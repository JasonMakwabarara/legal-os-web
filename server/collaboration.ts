import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

/**
 * Collaborative Editing Manager
 * Manages real-time document synchronization using Yjs CRDT
 */

interface DocumentSession {
  docId: number;
  ydoc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Map<string, { userId: number; cursor?: { line: number; col: number } }>;
}

const activeSessions = new Map<number, DocumentSession>();

/**
 * Initialize a collaborative document session
 */
export function initializeDocumentSession(docId: number): DocumentSession {
  if (activeSessions.has(docId)) {
    return activeSessions.get(docId)!;
  }

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);

  const session: DocumentSession = {
    docId,
    ydoc,
    awareness,
    clients: new Map(),
  };

  activeSessions.set(docId, session);
  return session;
}

/**
 * Get or create a document session
 */
export function getDocumentSession(docId: number): DocumentSession {
  return initializeDocumentSession(docId);
}

/**
 * Add a client to a document session
 */
export function addClientToSession(
  docId: number,
  clientId: string,
  userId: number
): void {
  const session = getDocumentSession(docId);
  session.clients.set(clientId, { userId });

  // Update awareness with client info
  session.awareness.setLocalState({
    user: { name: `User ${userId}`, color: generateUserColor(userId) },
    cursor: null,
  });
}

/**
 * Remove a client from a document session
 */
export function removeClientFromSession(docId: number, clientId: string): void {
  const session = activeSessions.get(docId);
  if (session) {
    session.clients.delete(clientId);
    if (session.clients.size === 0) {
      activeSessions.delete(docId);
      session.ydoc.destroy();
    }
  }
}

/**
 * Update client cursor position
 */
export function updateClientCursor(
  docId: number,
  clientId: string,
  line: number,
  col: number
): void {
  const session = activeSessions.get(docId);
  if (session) {
    const client = session.clients.get(clientId);
    if (client) {
      client.cursor = { line, col };
    }
  }
}

/**
 * Get all active clients in a session
 */
export function getSessionClients(docId: number) {
  const session = activeSessions.get(docId);
  return session ? Array.from(session.clients.entries()) : [];
}

/**
 * Encode document state for transmission
 */
export function encodeDocumentState(docId: number): Uint8Array {
  const session = getDocumentSession(docId);
  return Y.encodeStateAsUpdate(session.ydoc);
}

/**
 * Decode and apply updates to document
 */
export function applyDocumentUpdate(
  docId: number,
  update: Uint8Array
): void {
  const session = getDocumentSession(docId);
  Y.applyUpdate(session.ydoc, update);
}

/**
 * Get document content as text
 */
export function getDocumentContent(docId: number): string {
  const session = activeSessions.get(docId);
  if (!session) return '';
  
  const ytext = session.ydoc.getText('content');
  return ytext.toString();
}

/**
 * Set document content
 */
export function setDocumentContent(docId: number, content: string): void {
  const session = getDocumentSession(docId);
  const ytext = session.ydoc.getText('content');
  ytext.delete(0, ytext.length);
  ytext.insert(0, content);
}

/**
 * Add a comment to the document
 */
export function addComment(
  docId: number,
  userId: number,
  content: string,
  line: number
): void {
  const session = getDocumentSession(docId);
  const yarray = session.ydoc.getArray('comments');
  
  yarray.push([{
    id: `comment-${Date.now()}-${Math.random()}`,
    userId,
    content,
    line,
    timestamp: Date.now(),
    resolved: false,
  }]);
}

/**
 * Get all comments for a document
 */
export function getDocumentComments(docId: number) {
  const session = activeSessions.get(docId);
  if (!session) return [];
  
  const yarray = session.ydoc.getArray('comments');
  return yarray.toArray();
}

/**
 * Resolve a comment
 */
export function resolveComment(docId: number, commentId: string): void {
  const session = activeSessions.get(docId);
  if (!session) return;
  
  const yarray = session.ydoc.getArray('comments');
  for (let i = 0; i < yarray.length; i++) {
    const comment = yarray.get(i) as any;
    if (comment?.id === commentId) {
      comment.resolved = true;
      break;
    }
  }
}

/**
 * Generate a consistent color for a user
 */
function generateUserColor(userId: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6',
  ];
  return colors[userId % colors.length];
}

/**
 * Get version history for a document
 */
export function getDocumentHistory(docId: number) {
  const session = activeSessions.get(docId);
  if (!session) return [];
  
  const yarray = session.ydoc.getArray('history');
  return yarray.toArray();
}

/**
 * Record a document change in history
 */
export function recordChange(
  docId: number,
  userId: number,
  changeType: 'insert' | 'delete' | 'modify',
  content: string
): void {
  const session = getDocumentSession(docId);
  const yarray = session.ydoc.getArray('history');
  
  yarray.push([{
    id: `change-${Date.now()}-${Math.random()}`,
    userId,
    changeType,
    content,
    timestamp: Date.now(),
  }]);
}
