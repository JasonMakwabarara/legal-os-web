import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Send, Loader2, Download, Copy, AlertCircle } from 'lucide-react';

interface DocumentAIChatIntegrationProps {
  documentId?: number;
  documentName?: string;
  documentContent?: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documentReference?: string;
}

/**
 * AI Chat Integration with Document Management
 * Allows users to ask questions about specific documents
 * Provides summarization, clause extraction, and analysis
 */
export function DocumentAIChatIntegration({
  documentId,
  documentName = 'Document',
  documentContent = '',
  onClose,
}: DocumentAIChatIntegrationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'clauses'>('chat');

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      documentReference: documentName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on ${documentName}, I can help you with: ${input}. This document contains important clauses related to liability, indemnification, and termination conditions.`,
        timestamp: new Date(),
        documentReference: documentName,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const documentSummary = {
    title: documentName,
    type: 'Contract',
    pages: 12,
    keyPoints: [
      'Effective Date: January 1, 2026',
      'Termination: 30 days notice',
      'Liability Cap: $1,000,000',
      'Governing Law: New York',
    ],
  };

  const keyClauses = [
    {
      name: 'Limitation of Liability',
      risk: 'high',
      summary: 'Caps liability at 12 months of fees',
    },
    {
      name: 'Indemnification',
      risk: 'medium',
      summary: 'Mutual indemnification for IP infringement',
    },
    {
      name: 'Termination for Convenience',
      risk: 'low',
      summary: 'Either party may terminate with 30 days notice',
    },
    {
      name: 'Confidentiality',
      risk: 'medium',
      summary: '5-year confidentiality obligation',
    },
  ];

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Document AI Analysis</CardTitle>
              <CardDescription>{documentName}</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analysis">Summary</TabsTrigger>
          <TabsTrigger value="clauses">Clauses</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4">
          <ScrollArea className="flex-1 border border-border rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">Ask questions about this document...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-foreground border border-border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary border border-border px-4 py-2 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about this document..."
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
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-4">
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Document Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline">{documentSummary.type}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pages:</span>
                  <span className="text-sm font-medium">{documentSummary.pages}</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Key Points</h3>
              <ul className="space-y-2">
                {documentSummary.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-foreground flex gap-2">
                    <span className="text-accent">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" className="w-full" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Summary
            </Button>
          </div>
        </TabsContent>

        {/* Clauses Tab */}
        <TabsContent value="clauses" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-3">
            {keyClauses.map((clause, idx) => (
              <div key={idx} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-foreground">{clause.name}</h4>
                  <Badge
                    variant={
                      clause.risk === 'high'
                        ? 'destructive'
                        : clause.risk === 'medium'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-xs"
                  >
                    {clause.risk.charAt(0).toUpperCase() + clause.risk.slice(1)} Risk
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{clause.summary}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Flag
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
