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
  CheckCircle2,
  FileText,
  Brain,
  Zap,
  Copy,
  Download,
  X,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: 'analyze' | 'ask' | 'summarize' | 'risks' | 'modify';
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

export default function AILegalAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMode, setCurrentMode] = useState<ChatMode['id']>('ask');
  const [contractText, setContractText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContractInput, setShowContractInput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // tRPC mutations
  const analyzeClauseMutation = trpc.aiChat.analyzeClause.useMutation();
  const askAboutContractMutation = trpc.aiChat.askAboutContract.useMutation();
  const summarizeContractMutation = trpc.aiChat.summarizeContract.useMutation();
  const identifyRisksMutation = trpc.aiChat.identifyRisks.useMutation();
  const suggestModificationsMutation = trpc.aiChat.suggestModifications.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !contractText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
      action: currentMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      let response;

      switch (currentMode) {
        case 'analyze':
          response = await analyzeClauseMutation.mutateAsync({
            clauseText: userInput,
            clauseType: 'General',
          });
          break;

        case 'ask':
          response = await askAboutContractMutation.mutateAsync({
            contractText,
            question: userInput,
          });
          break;

        case 'summarize':
          response = await summarizeContractMutation.mutateAsync({
            contractText,
            detailLevel: 'standard',
          });
          break;

        case 'risks':
          response = await identifyRisksMutation.mutateAsync({
            contractText,
          });
          break;

        case 'modify':
          response = await suggestModificationsMutation.mutateAsync({
            contractText,
          });
          break;

        default:
          response = null;
      }

      if (response?.success) {
        let content = 'Response generated';
        const resp = response as any;
        if (resp.analysis) {
          content = typeof resp.analysis === 'string' ? resp.analysis : JSON.stringify(resp.analysis);
        } else if (resp.answer) {
          content = typeof resp.answer === 'string' ? resp.answer : JSON.stringify(resp.answer);
        } else if (resp.summary) {
          content = typeof resp.summary === 'string' ? resp.summary : JSON.stringify(resp.summary);
        } else if (resp.risks) {
          content = typeof resp.risks === 'string' ? resp.risks : JSON.stringify(resp.risks);
        } else if (resp.suggestions) {
          content = typeof resp.suggestions === 'string' ? resp.suggestions : JSON.stringify(resp.suggestions);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content,
          timestamp: new Date(),
          action: currentMode,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
                      Paste a contract and select an analysis mode to get started
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
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
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {message.type === 'assistant' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadAsText(message.content)}
                          className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                          title="Download"
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
              disabled={isLoading || !contractText.trim() || !userInput.trim()}
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
