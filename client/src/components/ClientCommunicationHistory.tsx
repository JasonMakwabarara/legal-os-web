import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Phone, Calendar, FileText, MessageSquare, Plus, Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';

interface CommunicationRecord {
  id: number;
  type: 'email' | 'call' | 'meeting' | 'note' | 'document';
  subject?: string;
  content: string;
  participants?: string[];
  duration?: number;
  tags?: string[];
  createdAt: Date;
  userName: string;
}

interface ClientCommunicationHistoryProps {
  clientId: number;
  clientName: string;
}

export function ClientCommunicationHistory({
  clientId,
  clientName,
}: ClientCommunicationHistoryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'email' | 'call' | 'meeting' | 'note' | 'document'>('note');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch communications
  const { data: communications = [] } = trpc.communications.getClientCommunications.useQuery({
    clientId,
  });

  // Add communication mutation
  const addCommunicationMutation = trpc.communications.addCommunication.useMutation();

  const handleAddCommunication = async () => {
    if (!content.trim()) return;

    try {
      await addCommunicationMutation.mutateAsync({
        clientId,
        type: selectedType,
        subject: subject || undefined,
        content,
        participants: undefined,
        duration: undefined,
        tags: undefined,
      });

      // Reset form
      setSubject('');
      setContent('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add communication:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'call':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'meeting':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'document':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const filteredCommunications =
    filterType === 'all'
      ? communications
      : communications.filter((c: any) => c.type === filterType);

  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>All interactions with {clientName}</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Record
          </Button>
        </div>
      </CardHeader>

      {showAddForm && (
        <CardContent className="border-b border-border pb-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Communication Type</label>
            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedType !== 'call' && selectedType !== 'meeting' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject (optional)</label>
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Details</label>
            <Textarea
              placeholder="Communication details..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddCommunication}
              disabled={addCommunicationMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              Save Record
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      )}

      <CardContent className="space-y-4">
        {/* Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="call">Phone Call</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Communication Timeline */}
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {filteredCommunications.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No communications recorded</p>
              </div>
            ) : (
              filteredCommunications.map((comm: any) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(comm.type)}`}>
                      {getTypeIcon(comm.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {comm.subject && (
                        <p className="text-sm font-medium text-foreground mb-1">
                          {comm.subject}
                        </p>
                      )}
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {comm.content}
                      </p>
                      {comm.duration && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Duration: {comm.duration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
