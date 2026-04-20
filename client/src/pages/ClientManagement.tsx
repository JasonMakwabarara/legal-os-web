import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search, Users, Mail, Phone, MapPin } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';

/**
 * Client Management Page
 * Design Philosophy: Modern Professional with Legal Authority
 * - Comprehensive client database and relationship management
 * - Contact information and communication history
 * - Case and matter tracking per client
 */
interface Client {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  activeCases: number;
  lastContact: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-001',
    name: 'TechCorp Inc',
    type: 'corporate',
    email: 'legal@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    status: 'active',
    activeCases: 3,
    lastContact: '2026-04-19',
  },
  {
    id: 'client-002',
    name: 'Global Partners LLC',
    type: 'corporate',
    email: 'contact@globalpartners.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
    status: 'active',
    activeCases: 2,
    lastContact: '2026-04-18',
  },
  {
    id: 'client-003',
    name: 'DataFlow Systems',
    type: 'corporate',
    email: 'legal@dataflow.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    status: 'active',
    activeCases: 1,
    lastContact: '2026-04-17',
  },
  {
    id: 'client-004',
    name: 'John Smith',
    type: 'individual',
    email: 'john.smith@email.com',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    status: 'active',
    activeCases: 1,
    lastContact: '2026-04-20',
  },
];

export default function ClientManagement() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'corporate'>('all');

  const filteredClients = MOCK_CLIENTS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesType;
  });

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
                <Users className="w-6 h-6 text-accent" />
                Client Management
              </h1>
              <p className="text-sm text-muted-foreground">Manage client relationships and matters</p>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'individual', 'corporate'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
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
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Client Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{client.name}</h3>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {client.type === 'corporate' ? 'Corporate' : 'Individual'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`mailto:${client.email}`} className="text-accent hover:underline truncate">
                          {client.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a href={`tel:${client.phone}`} className="text-foreground hover:text-accent">
                          {client.phone}
                        </a>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-foreground text-sm">{client.location}</p>
                      </div>
                    </div>

                    {/* Status & Cases */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge
                          className={client.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted/50 text-muted-foreground border-muted/30'}
                          variant="outline"
                        >
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Active Cases</p>
                        <p className="font-semibold text-foreground text-lg">{client.activeCases}</p>
                      </div>
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
