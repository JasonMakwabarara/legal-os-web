import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, Upload, FileText, Download, Eye, Trash2, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';

/**
 * Document Management Page
 * Design Philosophy: Modern Professional with Legal Authority
 * - Centralized document repository
 * - Version control and document history
 * - Search and categorization
 */
interface Document {
  id: string;
  name: string;
  type: 'contract' | 'brief' | 'memo' | 'discovery' | 'other';
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'active' | 'archived' | 'draft';
  versions: number;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    name: 'Service Agreement - TechCorp Inc.pdf',
    type: 'contract',
    size: '2.4 MB',
    uploadDate: '2026-04-18',
    uploadedBy: 'Sarah Johnson',
    status: 'active',
    versions: 3,
  },
  {
    id: 'doc-002',
    name: 'Legal Brief - Smith v. TechCorp.docx',
    type: 'brief',
    size: '1.8 MB',
    uploadDate: '2026-04-19',
    uploadedBy: 'Michael Chen',
    status: 'active',
    versions: 2,
  },
  {
    id: 'doc-003',
    name: 'Memo - Contract Analysis.docx',
    type: 'memo',
    size: '0.8 MB',
    uploadDate: '2026-04-17',
    uploadedBy: 'Jennifer Lee',
    status: 'active',
    versions: 1,
  },
  {
    id: 'doc-004',
    name: 'Discovery Documents - Batch 1.zip',
    type: 'discovery',
    size: '15.2 MB',
    uploadDate: '2026-04-16',
    uploadedBy: 'Sarah Johnson',
    status: 'archived',
    versions: 1,
  },
];

export default function DocumentManagement() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredDocuments = MOCK_DOCUMENTS.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || d.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'brief':
        return 'bg-success/10 text-success border-success/20';
      case 'memo':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'discovery':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted/30';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
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
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 text-accent" />
                Document Management
              </h1>
              <p className="text-sm text-muted-foreground">Centralized document repository and version control</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
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
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        {/* Document Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                              {getTypeIcon(doc.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{doc.size}</p>
                            </div>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div>
                          <Badge className={`${getTypeColor(doc.type)} border`}>
                            {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                          </Badge>
                        </div>

                        {/* Upload Info */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Uploaded</p>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm font-medium text-foreground">{doc.uploadDate}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">by {doc.uploadedBy}</p>
                        </div>

                        {/* Versions */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Versions</p>
                          <p className="text-sm font-semibold text-foreground">{doc.versions}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
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
