import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, DollarSign, Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Firm Settings Panel
 * Allows firm admins to configure branding, billing, and notification preferences
 */
export default function FirmSettingsPanel() {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only firm admins can access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">You don't have permission to access this page. Please contact your firm administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [firmName, setFirmName] = useState('');
  const [firmEmail, setFirmEmail] = useState('');
  const [firmPhone, setFirmPhone] = useState('');
  const [firmWebsite, setFirmWebsite] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a2847');
  const [accentColor, setAccentColor] = useState('#56CCF2');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Get firm details
  const { data: firm, isLoading: firmLoading } = trpc.firms.getById.useQuery(
    { id: user?.firmId || 0 },
    { enabled: !!user?.firmId }
  );

  const handleSaveBasicInfo = async () => {
    // TODO: Implement firm update mutation
    setSuccessMessage('Firm settings updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (firmLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Firm Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your firm's profile, branding, and preferences
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your firm's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Firm Name</label>
                <Input
                  placeholder={firm?.name || 'Your Law Firm'}
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder={firm?.email || 'contact@firm.com'}
                  value={firmEmail}
                  onChange={(e) => setFirmEmail(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  placeholder={firm?.phone || '+1 (555) 000-0000'}
                  value={firmPhone}
                  onChange={(e) => setFirmPhone(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Website</label>
                <Input
                  placeholder={firm?.website || 'https://yourfirm.com'}
                  value={firmWebsite}
                  onChange={(e) => setFirmWebsite(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>

              <Button
                onClick={handleSaveBasicInfo}
                className="bg-accent hover:bg-accent/90"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Customize your firm's brand colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Primary Color</label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Accent Color</label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 bg-background border-border"
                  />
                </div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Preview</p>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div
                    className="w-12 h-12 rounded"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              </div>

              <Button className="bg-accent hover:bg-accent/90">
                Save Brand Colors
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Manage your billing preferences and payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Billing Email</label>
                <Input
                  type="email"
                  placeholder="billing@firm.com"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Current Plan</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Professional</p>
                    <p className="text-sm text-muted-foreground">$299/month</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">Active</Badge>
                </div>
              </div>

              <Button className="bg-accent hover:bg-accent/90">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Case Updates</p>
                    <p className="text-sm text-muted-foreground">Notify about case status changes</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Deadline Alerts</p>
                    <p className="text-sm text-muted-foreground">Remind about upcoming deadlines</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Team Invitations</p>
                    <p className="text-sm text-muted-foreground">Notify when team members join</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Weekly Summary</p>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of activities</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
              </div>

              <Button className="bg-accent hover:bg-accent/90">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
