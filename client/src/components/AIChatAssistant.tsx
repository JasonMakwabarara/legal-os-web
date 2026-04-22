import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare, Loader2, Plus, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  conversationId?: string;
  onClose?: () => void;
}

export function AIChatAssistant({ conversationId: initialConversationId, onClose }: AIChatAssistantProps) {
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages when conversation changes
  const { data: fetchedMessages } = trpc.aiChat.getMessages.useQuery(
    { conversationId: conversationId || '' },
    { enabled: !!conversationId }
  );

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(
        fetchedMessages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }))
      );
    }
  }, [fetchedMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startConversationMutation = trpc.aiChat.startConversation.useMutation();

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      const newConversation = await startConversationMutation.mutateAsync({
        title: 'Legal Query',
      });
      setConversationId((newConversation as any).id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation();

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        content: input,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <Card className="border border-border h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent" />
            Legal AI Assistant
          </CardTitle>
          <CardDescription>Ask questions about contracts, cases, and legal matters</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground">Start a new conversation</p>
            <Button
              onClick={handleStartConversation}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              New Conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Legal AI Assistant
            </CardTitle>
            <CardDescription>Qwen 3.5 - Legal Query Assistant</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pr-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-sm">Start typing to ask a legal question...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-foreground border border-border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-foreground border border-border px-4 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a legal question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-accent hover:bg-accent/90"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <Badge variant="outline" className="text-xs">
          Model: Qwen 3.5
        </Badge>
      </div>
    </Card>
  );
}
