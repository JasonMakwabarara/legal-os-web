import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Loader2, MessageSquare } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatCurrency } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function ContractDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams() as { id?: string };
  const contractId = params?.id ? parseInt(params.id, 10) : null;
  const utils = trpc.useUtils();
  const [clientId, setClientId] = useState<string>("none");
  const [caseId, setCaseId] = useState<string>("none");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: contract, isLoading: contractLoading, error: contractError } = trpc.contracts.getById.useQuery(
    { id: contractId ?? 0 },
    { enabled: isAuthenticated && !!contractId }
  );
  const { data: risks = [] } = trpc.contracts.getRisks.useQuery(
    { contractId: contractId ?? 0 },
    { enabled: isAuthenticated && !!contract }
  );
  const { data: redlines } = trpc.contracts.getRedlines.useQuery(
    { contractId: contractId ?? 0 },
    { enabled: isAuthenticated && !!contract }
  );
  const { data: clients = [] } = trpc.clients.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: cases = [] } = trpc.cases.list.useQuery(undefined, { enabled: isAuthenticated });

  const attachMutation = trpc.contracts.attach.useMutation({
    onSuccess: async () => {
      await utils.contracts.getById.invalidate({ id: contractId ?? 0 });
      toast.success('Contract attached to client and matter');
    },
    onError: error => toast.error(error.message),
  });

  const updateStatusMutation = trpc.contracts.updateStatus.useMutation({
    onSuccess: async (updated) => {
      await utils.contracts.getById.invalidate({ id: contractId ?? 0 });
      await utils.contracts.list.invalidate();
      toast.success(
        updated?.status === 'approved'
          ? 'Redline approved — contract marked as approved'
          : 'Changes requested — contract moved back to review',
      );
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!contract) return;
    setClientId(contract.clientId ? String(contract.clientId) : "none");
    const linkedCaseId = "caseId" in contract && contract.caseId ? String(contract.caseId) : "none";
    setCaseId(linkedCaseId);
  }, [contract]);

  if (authLoading || contractLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !contractId) return null;

  if (contractError || !contract) {
    return (
      <Card className="border border-destructive/50 bg-destructive/10 max-w-md mx-auto mt-12">
        <CardHeader>
          <CardTitle className="text-destructive">Contract Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">This contract is not in the demo firm, or you do not have access.</p>
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>Back to Cockpit</Button>
        </CardContent>
      </Card>
    );
  }

  const originalText = redlines?.originalText || contract.description || 'No original text available.';
  const redlinedText = redlines?.redlinedText || 'No redline available yet.';
  const clientName = clients.find(c => c.id === contract.clientId)?.name;
  const matterName = cases.find(c => String(c.id) === caseId)?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{contract.name}</h1>
          <p className="text-sm text-muted-foreground">
            {contract.fileName}
            {clientName ? ` · ${clientName}` : ''}
            {matterName ? ` · ${matterName}` : ''}
          </p>
        </div>
        <Badge variant="outline">{contract.status?.toUpperCase()}</Badge>
        <Button variant="outline" onClick={() => setLocation('/ai-chat')}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask assistant
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Review progress</span>
          <span className="font-semibold">{contract.reviewProgress}%</span>
        </div>
        <Progress value={contract.reviewProgress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Original vs redline
              </CardTitle>
              <CardDescription>Suggested changes are marked [REDLINE]. This is a demo review, not legal advice.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="compare" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="compare">Side by side</TabsTrigger>
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="redlined">Redlined</TabsTrigger>
                </TabsList>
                <TabsContent value="compare" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <pre className="whitespace-pre-wrap text-sm bg-secondary/50 rounded-lg p-4 h-[28rem] overflow-auto border border-border font-mono">{originalText}</pre>
                    <pre className="whitespace-pre-wrap text-sm bg-secondary/50 rounded-lg p-4 h-[28rem] overflow-auto border border-accent/40 font-mono">{redlinedText}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="original" className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-secondary/50 rounded-lg p-4 h-[28rem] overflow-auto border border-border font-mono">{originalText}</pre>
                </TabsContent>
                <TabsContent value="redlined" className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-secondary/50 rounded-lg p-4 h-[28rem] overflow-auto border border-accent/40 font-mono">{redlinedText}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" style={{ color: '#FF9800' }} />
                Risks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {risks.length > 0 ? risks.map((risk) => (
                <div key={risk.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h4 className="font-semibold text-foreground">{risk.issue}</h4>
                    <Badge>{risk.level.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{risk.recommendation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estimated exposure</span>
                    <span className="font-semibold">{formatCurrency(typeof risk.exposure === 'string' ? parseFloat(risk.exposure) : risk.exposure || 0)}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No risks identified</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle className="text-lg">Attach to firm work</CardTitle>
              <CardDescription>Link this review to a client and matter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Client</p>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Matter</p>
                <Select value={caseId} onValueChange={setCaseId}>
                  <SelectTrigger><SelectValue placeholder="Select matter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {cases.map(matter => (
                      <SelectItem key={matter.id} value={String(matter.id)}>{matter.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={attachMutation.isPending}
                onClick={() => attachMutation.mutate({
                  id: contract.id,
                  clientId: clientId === "none" ? null : Number(clientId),
                  caseId: caseId === "none" ? null : Number(caseId),
                })}
              >
                {attachMutation.isPending ? "Saving..." : "Save attachment"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contract details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Risk</p>
                <Badge>{contract.riskLevel.toUpperCase()}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total exposure</p>
                <p className="font-semibold text-lg">{formatCurrency(typeof contract.totalExposure === 'string' ? parseFloat(contract.totalExposure) : contract.totalExposure || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Uploaded</p>
                <p className="font-medium">{new Date(contract.uploadedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                disabled={updateStatusMutation.isPending || contract.status === 'approved'}
                onClick={() => updateStatusMutation.mutate({ id: contract.id, status: 'approved' })}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {contract.status === 'approved' ? 'Redline approved' : 'Approve redline'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate({ id: contract.id, status: 'review' })}
              >
                Request changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
