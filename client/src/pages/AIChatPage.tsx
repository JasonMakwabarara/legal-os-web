import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Plus, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import AILegalAssistant from '@/components/AILegalAssistant';

/**
 * AI Chat Page
 * Dedicated page for legal AI assistant with conversation history
 */
export default function AIChatPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-accent" />
                Legal AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about contracts, cases, and legal matters
              </p>
            </div>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setSelectedConversationId(null)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <AILegalAssistant />
          </div>

          {/* Sidebar - Future: Conversation History */}
          <div className="lg:col-span-1">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-lg">Conversation History</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Conversation history will appear here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
