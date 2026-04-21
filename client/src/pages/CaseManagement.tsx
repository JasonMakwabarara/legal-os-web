import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, Briefcase, Users, Calendar, FileText, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

/**
 * Case Management Page
 * Displays all cases with filtering and search
 * Integrates with backend APIs for live data
 */
export default function CaseManagement() {
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

  // Fetch cases from backend
  const { data: cases = [], isLoading: casesLoading, error: casesError } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (casesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border border-destructive/50 bg-destructive/10 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Failed to load cases. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted/50 text-muted-foreground border-muted/30';
      case 'on_hold':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-secondary/50 text-foreground border-secondary/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#A8E063';
      default:
        return '#56CCF2';
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
                <Briefcase className="w-6 h-6 text-accent" />
                Case Management
              </h1>
              <p className="text-sm text-muted-foreground">Track and manage all active cases</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
              <Plus className="w-4 h-4 mr-2" />
              New Case
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by name or number..."
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
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredCases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No cases found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCases.map((caseItem) => (
                  <Card key={caseItem.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Case Info */}
                        <div className="md:col-span-2">
                          <h3 className="font-semibold text-foreground mb-1">{caseItem.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">Case #{caseItem.caseNumber || 'N/A'}</p>
                          <div className="flex gap-2">
                            <Badge className={`${getStatusColor(caseItem.status)} border`}>
                              {caseItem.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge
                              style={{
                                backgroundColor: getPriorityColor(caseItem.priority),
                                color: '#ffffff',
                                border: 'none',
                              }}
                            >
                              {caseItem.priority.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                              <Users className="w-4 h-4 text-accent" />
                            </div>
                            <p className="font-medium text-foreground text-sm">{caseItem.assignedTo ? `User #${caseItem.assignedTo}` : 'Unassigned'}</p>
                          </div>
                        </div>

                        {/* Due Date & Documents */}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <p className="font-medium text-foreground text-sm">
                                {caseItem.dueDate ? new Date(caseItem.dueDate).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Documents</p>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <p className="font-medium text-foreground text-sm">0</p>
                            </div>
                          </div>
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
