import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Mail, Trash2, RotateCcw, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Team Member Management Dashboard
 * Allows firm admins to manage team members, roles, and invitations
 */
export default function TeamMemberManagement() {
  const { user } = useAuth();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get firm members
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = trpc.firms.getMembers.useQuery(
    undefined,
    { enabled: !!user?.firmId }
  );

  // Get pending invitations
  const { data: invitations = [], isLoading: invitationsLoading } = trpc.invitations.listPending.useQuery(
    undefined,
    { enabled: !!user?.firmId }
  );

  // Create invitation mutation
  const createInviteMutation = trpc.invitations.create.useMutation({
    onSuccess: (data) => {
      setSuccessMessage(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('user');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error: any) => {
      setSuccessMessage(null);
    },
  });

  // Revoke invitation mutation
  const revokeInviteMutation = trpc.invitations.revoke.useMutation({
    onSuccess: () => {
      setSuccessMessage('Invitation revoked');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m: any) => m.id));
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    await createInviteMutation.mutateAsync({
      email: inviteEmail,
      expiresInDays: 7,
    });
  };

  const handleRevokeInvitation = async (invitationId: number) => {
    await revokeInviteMutation.mutateAsync({ invitationId });
  };

  if (membersLoading || invitationsLoading) {
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
          <Users className="w-6 h-6" />
          Team Members
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your firm's team members and send invitations
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

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Invite new team members to join your firm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="email"
              placeholder="team@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-background border-border"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Team Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail || createInviteMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {createInviteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Members */}
      <Card>
        <CardHeader>
          <CardTitle>
            Current Members ({members.length})
          </CardTitle>
          <CardDescription>
            Active team members in your firm
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members yet
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <Checkbox
                  checked={selectedMembers.length === members.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  Select All
                </span>
              </div>

              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/5 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleSelectMember(member.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={member.role === 'admin' ? 'default' : 'secondary'}
                      className={
                        member.role === 'admin'
                          ? 'bg-accent text-accent-foreground'
                          : ''
                      }
                    >
                      {member.role}
                    </Badge>
                    {member.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement remove member
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>
              Invitations waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation: any) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {invitation.email || 'Pending'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sent on {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Pending</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvitation(invitation.id)}
                      disabled={revokeInviteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
