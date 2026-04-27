import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Accept Firm Invitation Page
 * Allows users to accept an invitation and join a firm
 */
export default function AcceptInvitation() {
  const [, params] = useRoute('/accept-invitation/:code');
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const code = params?.code as string | undefined;

  // Get invitation details
  const { data: invitation, isLoading: invitationLoading, error: invitationError } = trpc.invitations.getByCode.useQuery(
    { code: code || '' },
    { enabled: !!code && !authLoading }
  );

  // Accept invitation mutation
  const acceptMutation = trpc.invitations.accept.useMutation({
    onSuccess: () => {
      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      setError(error?.message || 'Failed to accept invitation');
    },
  });

  // If not authenticated, redirect to login with return URL
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // If user already has a firm, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.firmId) {
      setLocation('/dashboard');
    }
  }, [authLoading, isAuthenticated, user?.firmId, setLocation]);

  // Auto-accept invitation if user is authenticated and invitation is valid
  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated &&
      !user?.firmId &&
      invitation &&
      invitation.status === 'pending' &&
      !acceptMutation.isPending
    ) {
      acceptMutation.mutate({ code: code || '' });
    }
  }, [authLoading, isAuthenticated, user?.firmId, invitation, code, acceptMutation]);

  if (authLoading || invitationLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.firmId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Firm</CardTitle>
          <CardDescription>
            {success ? 'Successfully joined!' : 'Accept firm invitation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                You've successfully joined the firm! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {invitationError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Invalid or expired invitation
              </AlertDescription>
            </Alert>
          )}

          {invitation && invitation.status === 'pending' && !success && (
            <div className="space-y-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Invitation Details:</p>
                <p className="text-lg font-semibold text-foreground">
                  You're invited to join a firm
                </p>
                {invitation.email && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Invited to: {invitation.email}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => setLocation('/')}
                  variant="outline"
                >
                  Decline
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={() => acceptMutation.mutate({ code: code || '' })}
                  disabled={acceptMutation.isPending}
                >
                  {acceptMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </Button>
              </div>
            </div>
          )}

          {invitation && invitation.status !== 'pending' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This invitation is no longer valid
              </AlertDescription>
            </Alert>
          )}

          {!invitation && !invitationError && !invitationLoading && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Invalid invitation code
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
