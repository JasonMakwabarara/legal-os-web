import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Save } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: number;
  initialContent: string;
  onSave?: (content: string) => void;
}

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; col: number };
}

/**
 * CollaborativeEditor Component
 * Real-time collaborative document editing with cursor tracking and comments
 */
export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  initialContent,
  onSave,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Simulate real-time collaboration
  useEffect(() => {
    // In production, this would connect to WebSocket
    const mockUsers: ActiveUser[] = [
      {
        id: 'user-1',
        name: 'John Doe',
        color: '#FF6B6B',
        cursor: { line: 5, col: 10 },
      },
      {
        id: 'user-2',
        name: 'Jane Smith',
        color: '#4ECDC4',
        cursor: { line: 12, col: 20 },
      },
    ];
    setActiveUsers(mockUsers);
  }, [documentId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || selectedLine === null) return;

    const comment = {
      id: `comment-${Date.now()}`,
      line: selectedLine,
      content: newComment,
      author: 'Current User',
      timestamp: new Date(),
      resolved: false,
    };

    setComments([...comments, comment]);
    setNewComment('');
    setSelectedLine(null);
  };

  const handleResolveComment = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(content);
      }
      // Show success feedback
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Failed to save:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">
            {activeUsers.length} active collaborators
          </span>
          <div className="flex gap-1 ml-4">
            {activeUsers.map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Comments ({comments.length})
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 p-4 bg-slate-950 border-slate-800">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              className="w-full h-full bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
              placeholder="Start typing your document..."
              spellCheck="false"
            />
          </Card>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="w-80 flex flex-col gap-4">
            {/* Add Comment */}
            <Card className="p-4 border-slate-800">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Line Number</label>
                  <input
                    type="number"
                    value={selectedLine ?? ''}
                    onChange={(e) =>
                      setSelectedLine(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Line number"
                  />
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || selectedLine === null}
                  className="w-full"
                >
                  Add Comment
                </Button>
              </div>
            </Card>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {comments.map((comment) => (
                <Card
                  key={comment.id}
                  className={`p-3 border-slate-700 ${
                    comment.resolved ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-400">
                          Line {comment.line}
                        </span>
                        <span className="text-xs text-slate-400">
                          {comment.author}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 break-words">
                        {comment.content}
                      </p>
                      <span className="text-xs text-slate-500 mt-1 block">
                        {comment.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {!comment.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-xs"
                      >
                        ✓
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Users Cursors Info */}
      <div className="text-xs text-slate-500 space-y-1">
        {activeUsers.map((user) => (
          <div key={user.id}>
            {user.name} is at line {user.cursor?.line}, column {user.cursor?.col}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeEditor;
