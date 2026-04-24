import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bell,
  Trash2,
  Filter,
  Archive,
  RefreshCw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

interface NotificationGroup {
  type: 'deadline' | 'case_update' | 'contract_review' | 'collaboration' | 'system';
  count: number;
  unread: number;
  notifications: any[];
}

/**
 * Notification Aggregator
 * Comprehensive dashboard aggregating all alerts across the system
 */
export function NotificationAggregator() {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch notifications
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Group notifications by type
  const groupedNotifications: Record<string, NotificationGroup> = {
    deadline: {
      type: 'deadline',
      count: 0,
      unread: 0,
      notifications: [],
    },
    case_update: {
      type: 'case_update',
      count: 0,
      unread: 0,
      notifications: [],
    },
    contract_review: {
      type: 'contract_review',
      count: 0,
      unread: 0,
      notifications: [],
    },
    collaboration: {
      type: 'collaboration',
      count: 0,
      unread: 0,
      notifications: [],
    },
    system: {
      type: 'system',
      count: 0,
      unread: 0,
      notifications: [],
    },
  };

  notifications.forEach((notif: any) => {
    const group = groupedNotifications[notif.type];
    if (group) {
      group.count++;
      if (!notif.isRead) group.unread++;
      group.notifications.push(notif);
    }
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  // const deleteNotificationMutation = trpc.notifications.delete.useMutation();

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsReadMutation.mutateAsync({ notificationId });
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    // TODO: Implement delete notification mutation
    console.log('Delete notification:', notificationId);
    refetch();
  };

  const handleBatchMarkAsRead = async () => {
    const ids = Array.from(selectedNotifications);
    for (const id of ids) {
      await handleMarkAsRead(id);
    }
    setSelectedNotifications(new Set());
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'Deadlines';
      case 'case_update':
        return 'Case Updates';
      case 'contract_review':
        return 'Contract Reviews';
      case 'collaboration':
        return 'Collaboration';
      default:
        return 'System';
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

  const totalUnread = Object.values(groupedNotifications).reduce(
    (sum, group) => sum + group.unread,
    0
  );

  const renderNotificationItem = (notification: any) => (
    <div
      key={notification.id}
      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
        notification.isRead
          ? 'bg-secondary/30 border-border'
          : 'bg-accent/5 border-accent/50'
      }`}
      onClick={() => {
        const newSet = new Set(selectedNotifications);
        if (newSet.has(notification.id)) {
          newSet.delete(notification.id);
        } else {
          newSet.add(notification.id);
        }
        setSelectedNotifications(newSet);
      }}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selectedNotifications.has(notification.id)}
          onChange={() => {}}
          className="mt-1"
        />
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
            <div className="flex gap-1">
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                >
                  Mark as read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" />
              Notification Center
            </CardTitle>
            <CardDescription>
              {totalUnread > 0 ? `${totalUnread} unread notification(s)` : 'All caught up'}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-3">
        {/* Controls */}
        <div className="flex gap-2 items-center justify-between">
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
          <div className="flex gap-2">
            {selectedNotifications.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleBatchMarkAsRead}
              >
                Mark {selectedNotifications.size} as read
              </Button>
            )}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
          </div>
        </div>

        {/* Tabs by Type */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            {Object.entries(groupedNotifications).map(([key, group]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {getTypeLabel(group.type)} ({group.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-4">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification: any) =>
                    renderNotificationItem(notification)
                  )
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {Object.entries(groupedNotifications).map(([key, group]) => (
            <TabsContent key={key} value={key} className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {group.notifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <p className="text-sm">No {getTypeLabel(group.type).toLowerCase()}</p>
                    </div>
                  ) : (
                    group.notifications.map((notification: any) =>
                      renderNotificationItem(notification)
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
