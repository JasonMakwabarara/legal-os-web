import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Users, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

/**
 * Client Management Page
 * Displays all clients with contact information and case tracking
 * Integrates with backend APIs for live data
 */
export default function ClientManagement() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch clients from backend
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (clientsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border border-destructive/50 bg-destructive/10 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Failed to load clients. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getTypeColor = (type: string) => {
    return type === 'corporate' ? 'bg-accent/10 text-accent' : 'bg-success/10 text-success';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/50 text-muted-foreground border-muted/30';
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
                <Users className="w-6 h-6 text-accent" />
                Client Management
              </h1>
              <p className="text-sm text-muted-foreground">Manage client relationships and contact information</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled>
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No clients found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Client Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{client.name}</h3>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(client.type)}>
                            {client.type.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(client.status)} border`}>
                            {client.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <a href={`mailto:${client.email}`} className="text-sm text-accent hover:underline truncate">
                            {client.email}
                          </a>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <a href={`tel:${client.phone}`} className="text-sm text-foreground hover:text-accent">
                            {client.phone}
                          </a>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{client.address}</p>
                        </div>
                      )}
                    </div>

                    {/* Case Summary */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Active Cases</p>
                      <p className="text-lg font-semibold text-foreground">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
