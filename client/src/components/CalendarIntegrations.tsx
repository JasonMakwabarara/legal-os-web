import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, CheckCircle, Link2 } from 'lucide-react';

interface CalendarIntegration {
  id: string;
  name: string;
  provider: 'google' | 'outlook' | 'apple';
  status: 'connected' | 'disconnected' | 'error';
  email?: string;
  lastSync?: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
}

export function CalendarIntegrations() {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    {
      id: 'google-1',
      name: 'Google Calendar',
      provider: 'google',
      status: 'connected',
      email: 'user@gmail.com',
      lastSync: new Date(),
      syncFrequency: 'realtime',
    },
    {
      id: 'outlook-1',
      name: 'Outlook Calendar',
      provider: 'outlook',
      status: 'disconnected',
      syncFrequency: 'daily',
    },
  ]);

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncDeadlines: true,
    syncMeetings: true,
    syncReminders: true,
    reminderMinutes: 24 * 60, // 24 hours before
  });

  const handleConnect = (provider: string) => {
    // TODO: Implement OAuth flow for calendar connection
    console.log(`Connecting ${provider} calendar`);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, status: 'disconnected' } : i
    ));
  };

  const getProviderIcon = (provider: string) => {
    return <Calendar className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Calendar Integrations</h2>
        <p className="text-muted-foreground">
          Sync Legal OS deadlines and events with your calendar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Calendars</CardTitle>
          <CardDescription>Manage your calendar integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map(integration => (
            <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getProviderIcon(integration.provider)}
                <div>
                  <p className="font-medium">{integration.name}</p>
                  {integration.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {integration.email}
                    </p>
                  )}
                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {integration.lastSync.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadge(integration.status)}>
                  {integration.status === 'connected' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </span>
                  ) : (
                    'Disconnected'
                  )}
                </Badge>
                {integration.status === 'connected' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.provider)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Connect additional calendar services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {['Google Calendar', 'Microsoft Outlook', 'Apple Calendar', 'Zoom'].map(cal => (
            <div key={cal} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{cal}</span>
              <Button size="sm" variant="outline">
                <Link2 className="h-4 w-4 mr-1" />
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how events are synchronized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncSettings.autoSync}
                onChange={e => setSyncSettings({ ...syncSettings, autoSync: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Auto-sync enabled</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncSettings.syncDeadlines}
                onChange={e => setSyncSettings({ ...syncSettings, syncDeadlines: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Sync contract deadlines</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncSettings.syncMeetings}
                onChange={e => setSyncSettings({ ...syncSettings, syncMeetings: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Sync client meetings</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncSettings.syncReminders}
                onChange={e => setSyncSettings({ ...syncSettings, syncReminders: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Create calendar reminders</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reminder time before event</label>
            <select
              value={syncSettings.reminderMinutes}
              onChange={e => setSyncSettings({ ...syncSettings, reminderMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={60}>1 hour</option>
              <option value={24 * 60}>24 hours</option>
              <option value={2 * 24 * 60}>2 days</option>
            </select>
          </div>

          <Button className="w-full">Save Sync Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
