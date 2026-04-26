import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { CheckCircle, XCircle, Clock, AlertCircle, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalRule {
  category: string;
  requiredApprovals: number;
  approverRoles: string[];
}

export function TemplateApprovalDashboard() {
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRuleSettings, setShowRuleSettings] = useState(false);
  const [approvalRules, setApprovalRules] = useState<Record<string, ApprovalRule>>({});

  const pendingApprovalsQuery = trpc.templates.getPendingApprovals.useQuery();
  const approveMutation = trpc.templates.approve.useMutation();
  const rejectMutation = trpc.templates.reject.useMutation();
  const setRulesMutation = trpc.templates.setApprovalRules.useMutation();

  const handleApprove = async (approvalId: number) => {
    try {
      await approveMutation.mutateAsync({ approvalId });
      pendingApprovalsQuery.refetch();
      alert('Template approved successfully!');
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve template');
    }
  };

  const handleReject = async (approvalId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({ approvalId, rejectionReason });
      pendingApprovalsQuery.refetch();
      setRejectionReason('');
      setSelectedApproval(null);
      alert('Template rejected successfully!');
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject template');
    }
  };

  const handleSaveRules = async (category: string, rules: ApprovalRule) => {
    try {
      await setRulesMutation.mutateAsync({
        category,
        requiredApprovals: rules.requiredApprovals,
        approverRoles: rules.approverRoles,
      });
      alert('Approval rules updated successfully!');
      setShowRuleSettings(false);
    } catch (error) {
      console.error('Failed to save rules:', error);
      alert('Failed to save approval rules');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Template Approval Dashboard</h1>
        <Dialog open={showRuleSettings} onOpenChange={setShowRuleSettings}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Approval Rules
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure Approval Rules</DialogTitle>
            </DialogHeader>
            <ApprovalRulesSettings onSave={handleSaveRules} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">
                {pendingApprovalsQuery.data?.filter((a: any) => a.status === 'pending').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-foreground">
                {pendingApprovalsQuery.data?.filter((a: any) => a.status === 'approved').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-foreground">
                {pendingApprovalsQuery.data?.filter((a: any) => a.status === 'rejected').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">
                {pendingApprovalsQuery.data?.length || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Pending Approvals</h2>

        {!pendingApprovalsQuery.data || pendingApprovalsQuery.data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovalsQuery.data.map((approval: any) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background hover:bg-accent/50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(approval.status)}
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Template #{approval.templateId}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Version {approval.versionId} • Requested{' '}
                        {formatDistanceToNow(new Date(approval.requestedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(approval.status)}

                  {approval.status === 'pending' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => setSelectedApproval(approval)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Template Approval</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2 text-foreground">Approval Details</h3>
                            <div className="bg-background p-4 rounded border border-border space-y-2">
                              <p className="text-sm">
                                <span className="font-medium">Template ID:</span> {approval.templateId}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Version:</span> {approval.versionId}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Requested By:</span> User #{approval.requestedBy}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Status:</span>{' '}
                                <Badge>{approval.status}</Badge>
                              </p>
                            </div>
                          </div>

                          {approval.status === 'pending' && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-foreground">
                                  Rejection Reason (if rejecting)
                                </label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Explain why this template is being rejected..."
                                  className="mt-1"
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApprove(approval.id)}
                                  disabled={approveMutation.isPending}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(approval.id)}
                                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit Trail */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border border-border rounded bg-background">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Template approved</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded bg-background">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">New approval request</p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border rounded bg-background">
            <XCircle className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Template rejected</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ApprovalRulesSettings({ onSave }: { onSave: (category: string, rules: ApprovalRule) => void }) {
  const [category, setCategory] = useState('Indemnification');
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [approverRoles, setApproverRoles] = useState(['admin', 'lawyer']);

  const CATEGORIES = [
    'Indemnification',
    'Limitation of Liability',
    'Confidentiality',
    'Termination',
    'Dispute Resolution',
  ];

  const ROLES = ['admin', 'lawyer', 'paralegal', 'user'];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Required Approvals</label>
        <Input
          type="number"
          min="1"
          max="5"
          value={requiredApprovals}
          onChange={(e) => setRequiredApprovals(parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Approver Roles</label>
        <div className="mt-2 space-y-2">
          {ROLES.map(role => (
            <label key={role} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={approverRoles.includes(role)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setApproverRoles([...approverRoles, role]);
                  } else {
                    setApproverRoles(approverRoles.filter(r => r !== role));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onSave(category, { category, requiredApprovals, approverRoles })}
        className="w-full"
      >
        Save Rules
      </Button>
    </div>
  );
}
