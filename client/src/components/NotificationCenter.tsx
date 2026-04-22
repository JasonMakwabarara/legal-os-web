import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bell,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

interface Notification {
  id: number;
  type: 'deadline' | 'case_update' | 'contract_review' | 'collaboration' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export function NotificationCenter() {
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Fetch notifications
  const { data: notifications = [] } = trpc.notifications.list.useQuery();

  // Mark as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'case_update':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'contract_review':
        return <AlertCircle className="w-4 h-4" />;
      case 'collaboration':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'case_update':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'contract_review':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'collaboration':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications =
    filterPriority === 'all'
      ? notifications
      : notifications.filter((n: any) => n.priority === filterPriority);

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Notifications
            </CardTitle>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.isRead
                      ? 'bg-secondary/30 border-border'
                      : 'bg-accent/5 border-accent/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.charAt(0).toUpperCase() +
                            notification.priority.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/70 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
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
