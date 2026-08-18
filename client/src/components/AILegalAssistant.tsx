import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Loader,
  AlertTriangle,
  FileText,
  Brain,
  Zap,
  Copy,
  Download,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMode {
  id: 'analyze' | 'ask' | 'summarize' | 'risks' | 'modify';
  name: string;
  description: string;
  icon: React.ReactNode;
}

const chatModes: ChatMode[] = [
  {
    id: 'analyze',
    name: 'Analyze Clause',
    description: 'Get detailed analysis of a specific clause',
    icon: <Brain className="w-5 h-5" />,
  },
  {
    id: 'ask',
    name: 'Ask Question',
    description: 'Ask questions about your contract',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Get a summary of the contract',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'risks',
    name: 'Identify Risks',
    description: 'Find potential risks and concerns',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    id: 'modify',
    name: 'Suggest Changes',
    description: 'Get modification suggestions',
    icon: <Zap className="w-5 h-5" />,
  },
];

const modeQuestionPrefix: Record<ChatMode['id'], (input: string) => string> = {
  analyze: (input) => `Analyze this clause: ${input}`,
  ask: (input) => input,
  summarize: (input) => input || 'Summarize the risks in this contract',
  risks: (input) => input || 'What are the main risks in this contract?',
  modify: (input) => input || 'Suggest changes to reduce risk in this contract',
};

/** Renders the assistant's simple markdown (bold + bullet lists) without a heavyweight renderer. */
function SimpleMarkdown({ content }: { content: string }) {
  const renderInline = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );

  return (
    <div className="text-sm space-y-2">
      {content.split(/\n{2,}/).map((block, bi) => {
        const lines = block.split('\n');
        const isList = lines.every((l) => l.trim().startsWith('- ') || l.trim() === '');
        if (isList && lines.some((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={bi} className="list-disc pl-5 space-y-1">
              {lines.filter((l) => l.trim().startsWith('- ')).map((l, li) => (
                <li key={li}>{renderInline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

interface AILegalAssistantProps {
  conversationId?: string | null;
  onConversationChange?: (id: string) => void;
}

export default function AILegalAssistant({ conversationId = null, onConversationChange }: AILegalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<ChatMode['id']>('ask');
  const [contractText, setContractText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();
  const { data: contracts } = trpc.contracts.list.useQuery();
  const { data: history } = trpc.aiChat.getMessages.useQuery(
    { conversationId: conversationId ?? '' },
    { enabled: !!conversationId },
  );

  useEffect(() => {
    if (contractText || !contracts?.length) return;
    const first = contracts[0] as { originalText?: string; description?: string | null; name: string };
    setContractText(first.originalText || first.description || first.name);
  }, [contractText, contracts]);

  // Load persisted history when a conversation is selected; clear on New Chat
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    if (history) {
      setMessages(
        history.map((m: any, idx: number) => ({
          id: String(m.id ?? idx),
          type: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
        })),
      );
    }
  }, [conversationId, history]);

  const startConversationMutation = trpc.aiChat.startConversation.useMutation();
  const sendMessageMutation = trpc.aiChat.sendMessage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = modeQuestionPrefix[currentMode](userInput.trim());
    if (!question || !contractText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const conversation = await startConversationMutation.mutateAsync({
          title: question.slice(0, 60),
        });
        activeConversationId = (conversation as unknown as { id: string }).id;
        onConversationChange?.(activeConversationId);
      }

      const response = await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        content: question,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
        },
      ]);
      await utils.aiChat.getConversations.invalidate();
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsText = (text: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', 'legal-analysis.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <h2 className="text-2xl font-bold text-foreground">AI Legal Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Analyze contracts, answer questions, and get legal insights powered by AI
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex gap-4 p-4">
        {/* Left Panel: Contract Input */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto">
          <Card className="p-4 flex-1 flex flex-col">
            <h3 className="font-semibold text-foreground mb-2">Contract Text</h3>
            <Textarea
              placeholder="Paste your contract or clause here..."
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className="flex-1 resize-none"
            />
            <div className="text-xs text-muted-foreground mt-2">
              {contractText.length} characters
            </div>
          </Card>

          {/* Chat Modes */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Analysis Mode</h3>
            <div className="grid grid-cols-1 gap-2">
              {chatModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCurrentMode(mode.id)}
                  className={`p-3 rounded-lg text-left transition-all ${
                    currentMode === mode.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    <div>
                      <div className="font-medium text-sm">{mode.name}</div>
                      <div className="text-xs opacity-75">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel: Chat */}
        <div className="w-2/3 flex flex-col gap-4">
          {/* Messages */}
          <Card className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <AnimatePresence>
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Ask about liability, indemnity, termination, or risks — or paste your own contract on the left
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.type === 'assistant' ? (
                      <SimpleMarkdown content={message.content} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {message.type === 'assistant' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                          title="Copy"
                          aria-label="Copy response"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadAsText(message.content)}
                          className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                          title="Download"
                          aria-label="Download response"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted text-foreground px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Card>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder={
                currentMode === 'summarize' || currentMode === 'risks' || currentMode === 'modify'
                  ? 'Press Enter to analyze...'
                  : 'Type your question or clause...'
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading || !contractText.trim()}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={
                isLoading ||
                !contractText.trim() ||
                (!userInput.trim() && (currentMode === 'analyze' || currentMode === 'ask'))
              }
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
