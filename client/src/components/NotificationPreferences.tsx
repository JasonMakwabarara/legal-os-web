import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    sms?: boolean;
  };
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'deadlines',
      label: 'Contract Deadlines',
      description: 'Alerts for upcoming contract deadlines',
      enabled: true,
      channels: { inApp: true, email: true },
    },
    {
      id: 'case_updates',
      label: 'Case Updates',
      description: 'Notifications for case status changes',
      enabled: true,
      channels: { inApp: true, email: true },
    },
    {
      id: 'collaboration',
      label: 'Collaboration Invites',
      description: 'Alerts when invited to collaborate',
      enabled: true,
      channels: { inApp: true, email: false },
    },
    {
      id: 'contract_review',
      label: 'Contract Reviews',
      description: 'Notifications for contract review requests',
      enabled: true,
      channels: { inApp: true, email: true },
    },
  ]);

  const [saved, setSaved] = useState(false);

  const togglePreference = (id: string) => {
    setPreferences(prefs =>
      prefs.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    setSaved(false);
  };

  const toggleChannel = (id: string, channel: 'inApp' | 'email' | 'sms') => {
    setPreferences(prefs =>
      prefs.map(p =>
        p.id === id
          ? {
              ...p,
              channels: {
                ...p.channels,
                [channel]: !p.channels[channel as keyof typeof p.channels],
              },
            }
          : p
      )
    );
    setSaved(false);
  };

  const savePreferencesMutation = trpc.notifications.savePreferences.useMutation();

  const handleSave = async () => {
    try {
      await savePreferencesMutation.mutateAsync({
        preferences: preferences.map(p => ({
          type: p.id as any,
          enabled: p.enabled,
          channels: p.channels,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications
        </p>
      </div>

      <div className="space-y-4">
        {preferences.map(pref => (
          <Card key={pref.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{pref.label}</CardTitle>
                  <CardDescription>{pref.description}</CardDescription>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => togglePreference(pref.id)}
                />
              </div>
            </CardHeader>
            {pref.enabled && (
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Notification Channels</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={pref.channels.inApp}
                        onCheckedChange={() => toggleChannel(pref.id, 'inApp')}
                      />
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">In-App Notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={pref.channels.email}
                        onCheckedChange={() => toggleChannel(pref.id, 'email')}
                      />
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Email Notifications</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave} disabled={savePreferencesMutation.isPending}>
          {saved ? '✓ Saved' : savePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
