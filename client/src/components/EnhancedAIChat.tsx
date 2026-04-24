import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, MessageSquare, Loader2, Plus, Settings, Copy, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    documentId?: number;
    caseId?: number;
    contractId?: number;
  };
  suggestedFollowUps?: string[];
}

interface EnhancedAIChatProps {
  conversationId?: string;
  onClose?: () => void;
  initialContext?: {
    documentId?: number;
    caseId?: number;
    contractId?: number;
  };
}

/**
 * Enhanced AI Chat Component
 * Multi-turn conversations with context awareness and suggested follow-ups
 */
export function EnhancedAIChat({
  conversationId: initialConversationId,
  onClose,
  initialContext,
}: EnhancedAIChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(initialContext);
  const [showSuggestions, setShowSuggestions] = useState(true);
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
          context: msg.context,
          suggestedFollowUps: msg.suggestedFollowUps,
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

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      context,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        content: textToSend,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        suggestedFollowUps: [
          'Can you clarify this point?',
          'How does this apply to our case?',
          'What are the next steps?',
        ],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const suggestedQuestions = [
    'What are the key obligations in this contract?',
    'What risks should I be aware of?',
    'How does this compare to our standard template?',
    'What clauses need legal review?',
    'What are the payment terms?',
  ];

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
        <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
          <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Start a new conversation</p>
            <Button
              onClick={handleStartConversation}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Conversation
            </Button>
          </div>

          {/* Suggested Questions */}
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={async () => {
                    await handleStartConversation();
                    setTimeout(() => handleSendMessage(question), 500);
                  }}
                >
                  <span className="text-xs">{question}</span>
                </Button>
              ))}
            </div>
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
            <CardDescription>Qwen 3.5 - Multi-turn Legal Conversation</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Loader2 className="w-4 h-4" />
            </Button>
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
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-foreground border border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Message Actions */}
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={() => handleCopyMessage(message.content)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Helpful
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      <ThumbsDown className="w-3 h-3 mr-1" />
                      Not helpful
                    </Button>
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {message.role === 'assistant' && message.suggestedFollowUps && showSuggestions && (
                  <div className="mt-3 ml-4 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Follow-up questions:</p>
                    {message.suggestedFollowUps.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left w-full h-auto py-2 px-2"
                        onClick={() => handleSendMessage(question)}
                      >
                        <span className="text-xs">{question}</span>
                      </Button>
                    ))}
                  </div>
                )}
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
            placeholder="Ask a follow-up question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-accent hover:bg-accent/90"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Model: Qwen 3.5
          </Badge>
          {context && (
            <div className="flex gap-1">
              {context.documentId && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <FileText className="w-3 h-3" />
                  Document attached
                </Badge>
              )}
              {context.caseId && (
                <Badge variant="secondary" className="text-xs">
                  Case #{context.caseId}
                </Badge>
              )}
              {context.contractId && (
                <Badge variant="secondary" className="text-xs">
                  Contract #{context.contractId}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
