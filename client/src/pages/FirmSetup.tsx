import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Firm Setup Page
 * Allows authenticated users without a firm to create or join a firm
 */
export default function FirmSetup() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    firmName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation("/");
    return null;
  }

  // Redirect to dashboard if user already has a firm
  if (user?.firmId) {
    setLocation("/dashboard");
    return null;
  }

  // Create firm mutation
  const createFirmMutation = trpc.firms.create.useMutation({
    onSuccess: () => {
      // Refresh user data to get firmId
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setError(error?.message || "Failed to create firm");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firmName.trim()) {
      setError("Firm name is required");
      return;
    }

    await createFirmMutation.mutateAsync({
      name: formData.firmName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      website: formData.website || undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Legal OS</CardTitle>
          <CardDescription>
            Set up your law firm to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firmName">Firm Name *</Label>
              <Input
                id="firmName"
                placeholder="Your Law Firm"
                value={formData.firmName}
                onChange={(e) =>
                  setFormData({ ...formData, firmName: e.target.value })
                }
                disabled={createFirmMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@firm.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={createFirmMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={createFirmMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Legal St, City, State"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={createFirmMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourfirm.com"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                disabled={createFirmMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createFirmMutation.isPending}
            >
              {createFirmMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Firm...
                </>
              ) : (
                "Create Firm"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            You can invite team members after creating your firm
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
