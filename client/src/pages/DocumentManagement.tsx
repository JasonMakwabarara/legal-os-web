import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, Upload, FileText, Download, Eye, Trash2, Clock, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

/**
 * Document Management Page
 * Displays all documents with categorization and version control
 * Integrates with backend APIs for live data
 */
export default function DocumentManagement() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

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

  // Fetch documents from backend
  const { data: documents = [], isLoading: documentsLoading, error: documentsError } = trpc.documents.list.useQuery();

  if (documentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (documentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border border-destructive/50 bg-destructive/10 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Failed to load documents. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredDocuments = (documents || []).filter((doc: any) => {
    const matchesSearch = (doc.name || doc.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || (doc.type || doc.fileType) === activeTab;
    return matchesSearch && matchesTab;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-accent/10 text-accent';
      case 'brief':
        return 'bg-warning/10 text-warning';
      case 'memo':
        return 'bg-success/10 text-success';
      case 'discovery':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary/10 text-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'archived':
        return 'bg-muted/50 text-muted-foreground border-muted/30';
      case 'draft':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-secondary/50 text-foreground border-secondary/30';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
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
                <FileText className="w-6 h-6 text-accent" />
                Document Management
              </h1>
              <p className="text-sm text-muted-foreground">Centralized document repository with version control</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="contract">Contracts</TabsTrigger>
            <TabsTrigger value="brief">Briefs</TabsTrigger>
            <TabsTrigger value="memo">Memos</TabsTrigger>
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No documents found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{doc.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getTypeColor(doc.type)}>
                              {doc.type?.toUpperCase()}
                            </Badge>
                            <Badge className={`${getStatusColor(doc.status)} border`}>
                              {doc.status?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          {doc.fileUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.fileUrl} download={doc.name}>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" disabled>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" disabled>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
