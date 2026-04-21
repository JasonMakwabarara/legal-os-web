import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Upload, Zap, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import {
  MOCK_WORKFLOWS,
  MOCK_AGENT_ACTIVITIES,
  MOCK_INTELLIGENCE_INSIGHTS,
  getRiskLevelColor,
  getWorkflowStatusLabel,
  getContractStatusLabel,
  formatCurrency,
  formatDate,
} from '@/lib/mock-data';

/**
 * Legal OS Dashboard (Cockpit)
 * Displays real-time contract analysis, risk summary, and AI agent activity
 * Integrates with backend APIs for live data
 */
export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch contracts from backend
  const { data: contracts, isLoading: contractsLoading, error: contractsError } = trpc.contracts.list.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
  });

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Redirect happens in useEffect, but show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Calculate risk metrics from contracts
  const highRiskContracts = contracts?.filter((c) => c.riskLevel === 'high') || [];
  const totalExposure = highRiskContracts.reduce((sum, c) => {
    const exposure = typeof c.totalExposure === 'string' ? parseFloat(c.totalExposure) : c.totalExposure || 0;
    return sum + exposure;
  }, 0);

  const handleUploadClick = () => {
    // TODO: Implement file upload modal
    alert('File upload feature coming soon');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Command Bar */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Legal OS Cockpit</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Legal Operations</p>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Contract
            </Button>
          </div>

          {/* Command Bar */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="text-xs">
              /analyze contract
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              /explore due diligence
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              /prepare case strategy
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {contractsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : contractsError ? (
          <div className="flex items-center justify-center py-12">
            <Card className="border border-destructive/50 bg-destructive/10 max-w-md">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{contractsError.message || 'Failed to load contracts. Please try again.'}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Active Workflows */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Workflows Card */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Active Workflows
                  </CardTitle>
                  <CardDescription>Real-time AI agent processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {MOCK_WORKFLOWS.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active workflows</p>
                  ) : (
                    MOCK_WORKFLOWS.map((workflow) => (
                      <div key={workflow.id} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{workflow.title}</p>
                            <p className="text-xs text-muted-foreground">{workflow.status} • Updated {formatDate(workflow.lastUpdated)}</p>
                          </div>
                          <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                            {workflow.progress}%
                          </Badge>
                        </div>
                        <Progress value={workflow.progress} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Contracts */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Recent Contracts
                  </CardTitle>
                  <CardDescription>Active contract reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  {contracts && contracts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No contracts yet. Upload one to get started.</p>
                  ) : (
                    <div className="space-y-3">
                      {contracts?.slice(0, 5).map((contract) => (
                        <div key={contract.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">{contract.name}</p>
                            <p className="text-xs text-muted-foreground">{contract.fileName || 'Unknown file'}</p>
                            <p className="text-xs text-muted-foreground mt-1">{contract.reviewProgress}% Complete</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getRiskLevelColor(contract.riskLevel)}>
                              {contract.riskLevel?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Risk Summary & Intelligence */}
            <div className="space-y-6">
              {/* Risk Summary Card */}
              <Card className="border border-warning/30 bg-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertCircle className="w-5 h-5" />
                    Risk Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">High Risk Contracts</p>
                    <p className="text-3xl font-bold text-foreground">{highRiskContracts.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
                    <p className="text-2xl font-bold text-warning">{formatCurrency(totalExposure)}</p>
                  </div>
                  {highRiskContracts.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-semibold text-foreground mb-2">Flagged Contracts:</p>
                      <div className="space-y-1">
                        {highRiskContracts.slice(0, 3).map((contract) => (
                          <p key={contract.id} className="text-xs text-muted-foreground truncate">
                            • {contract.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent Activity Card */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Agent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {MOCK_AGENT_ACTIVITIES.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground">{activity.action}</p>
                        <p className="text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Intelligence Insights Card */}
              <Card className="border border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <TrendingUp className="w-5 h-5" />
                    Intelligence Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {MOCK_INTELLIGENCE_INSIGHTS.slice(0, 4).map((insight, idx) => (
                    <div key={idx} className="text-xs">
                      <p className="font-semibold text-foreground mb-1">{insight.metric}</p>
                      <p className="text-muted-foreground">{insight.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
