import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Clock, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CustomNotificationCreatorProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function CustomNotificationCreator({ onClose, onSuccess }: CustomNotificationCreatorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'deadline' | 'case_update' | 'contract_review' | 'collaboration' | 'system'>('deadline');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Add create mutation to notifications router
  // const createNotificationMutation = trpc.notifications.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Implement create notification mutation
      console.log('Creating notification:', { title, description, type, priority, dueDate });
      // await createNotificationMutation.mutateAsync({
      //   title,
      //   description,
      //   type,
      //   priority,
      //   dueDate: dueDate ? new Date(dueDate) : undefined,
      //   isRead: false,
      // });

      // Reset form
      setTitle('');
      setDescription('');
      setType('deadline');
      setPriority('medium');
      setDueDate('');

      onSuccess?.();
    } catch (error) {
      console.error('Failed to create notification:', error);
      alert('Notification created successfully!');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'deadline', label: 'Deadline', icon: '⏰' },
    { value: 'case_update', label: 'Case Update', icon: '📋' },
    { value: 'contract_review', label: 'Contract Review', icon: '📄' },
    { value: 'collaboration', label: 'Collaboration', icon: '👥' },
    { value: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            Create Custom Notification
          </CardTitle>
          <CardDescription>Set up a custom alert for your team</CardDescription>
        </div>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Title *</label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Description *</label>
            <Textarea
              placeholder="Detailed notification message"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Type and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
              <Select value={type} onValueChange={(value: any) => setType(value)} disabled={isLoading}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)} disabled={isLoading}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <Badge variant="destructive" className="text-xs">High</Badge>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Badge variant="secondary" className="text-xs">Medium</Badge>
                  </SelectItem>
                  <SelectItem value="low">
                    <Badge variant="outline" className="text-xs">Low</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Due Date (Optional)
            </label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="text-sm"
            />
          </div>

          {/* Preview */}
          {(title || description) && (
            <div className="bg-secondary/50 border border-border rounded-lg p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Preview:</p>
              <div className="space-y-1">
                {title && <p className="text-sm font-medium text-foreground">{title}</p>}
                {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {typeOptions.find((o) => o.value === type)?.label}
                  </Badge>
                  <Badge
                    variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={!title.trim() || !description.trim() || isLoading}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              {isLoading ? 'Creating...' : 'Create Notification'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
