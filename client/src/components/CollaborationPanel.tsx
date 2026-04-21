import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Send, MessageSquare, Eye, Edit2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Collaborator {
  id: number;
  name: string;
  email: string;
  role: 'lawyer' | 'paralegal' | 'admin';
  isActive: boolean;
  cursorPosition?: number;
  lastActivity?: string;
}

interface CollaborationMessage {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'edit' | 'system';
}

interface CollaborationPanelProps {
  contractId: number;
  collaborators: Collaborator[];
  messages: CollaborationMessage[];
  onSendMessage?: (message: string) => void;
  onAddCollaborator?: (email: string) => void;
}

export function CollaborationPanel({
  contractId,
  collaborators,
  messages,
  onSendMessage,
  onAddCollaborator,
}: CollaborationPanelProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'collaborators' | 'activity'>('collaborators');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage?.(messageInput);
      setMessageInput('');
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail.trim()) {
      onAddCollaborator?.(newCollaboratorEmail);
      setNewCollaboratorEmail('');
      setShowAddCollaborator(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive';
      case 'lawyer':
        return 'bg-accent/10 text-accent';
      case 'paralegal':
        return 'bg-success/10 text-success';
      default:
        return 'bg-secondary/10 text-foreground';
    }
  };

  const activeCollaborators = collaborators.filter((c) => c.isActive);
  const inactiveCollaborators = collaborators.filter((c) => !c.isActive);

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Collaboration
            </CardTitle>
            <CardDescription>{activeCollaborators.length} active collaborator(s)</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddCollaborator(true)}
            className="text-xs"
          >
            + Add
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-1 px-4 mb-3 border-b border-border">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'collaborators'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 px-4">
          {activeTab === 'collaborators' ? (
            <div className="space-y-4 pr-4">
              {/* Active Collaborators */}
              {activeCollaborators.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ACTIVE NOW</p>
                  <div className="space-y-2">
                    {activeCollaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(collaborator.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {collaborator.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {collaborator.email}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getRoleColor(collaborator.role)} text-xs ml-2`}>
                          {collaborator.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Collaborators */}
              {inactiveCollaborators.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">OFFLINE</p>
                  <div className="space-y-2">
                    {inactiveCollaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 opacity-60"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 opacity-60">
                            <AvatarFallback className="text-xs">
                              {getInitials(collaborator.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/60 truncate">
                              {collaborator.name}
                            </p>
                            <p className="text-xs text-muted-foreground/60 truncate">
                              {collaborator.lastActivity}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getRoleColor(collaborator.role)} text-xs ml-2`}
                        >
                          {collaborator.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Collaborator Form */}
              {showAddCollaborator && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
                  <p className="text-sm font-medium text-foreground">Add Collaborator</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email address"
                      value={newCollaboratorEmail}
                      onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddCollaborator}
                      className="bg-accent hover:bg-accent/90"
                    >
                      Add
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddCollaborator(false)}
                    className="w-full text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Activity Tab */
            <div className="space-y-3 pr-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity yet
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'system'
                        ? 'bg-secondary/50 border border-border'
                        : message.type === 'edit'
                          ? 'bg-warning/5 border border-warning/20'
                          : 'bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'system' ? (
                        <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      ) : message.type === 'edit' ? (
                        <Edit2 className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      ) : (
                        <Eye className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{message.author}</p>
                        <p className="text-sm text-foreground/80 break-words">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Input */}
      {activeTab === 'activity' && (
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
