import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { formatCurrency, getContractStatusLabel } from '@/lib/mock-data';

/**
 * Contract Detail Page
 * Design Philosophy: Modern Professional with Legal Authority
 * - Side-by-side document viewer for original vs. redlined versions
 * - Risk panel with detailed analysis
 * - Approval workflow interface
 */
export default function ContractDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const contractId = params?.id ? parseInt(params.id) : null;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !contractId) {
    return null;
  }

  // Fetch contract details
  const { data: contract, isLoading: contractLoading, error: contractError } = trpc.contracts.getById.useQuery(
    { id: contractId },
    { enabled: isAuthenticated }
  );

  // Fetch contract risks
  const { data: risks = [] } = trpc.contracts.getRisks.useQuery(
    { contractId },
    { enabled: isAuthenticated && !!contract }
  );

  if (contractLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (contractError || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border border-destructive/50 bg-destructive/10 max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Contract Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">The contract you're looking for doesn't exist or you don't have access to it.</p>
            <Button variant="outline" onClick={() => setLocation('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{contract.name}</h1>
              <p className="text-sm text-muted-foreground">{contract.fileName}</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {contract.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Review Progress</span>
              <span className="font-semibold text-foreground">{contract.reviewProgress}%</span>
            </div>
            <Progress value={contract.reviewProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Document Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Document Comparison
                </CardTitle>
                <CardDescription>Original vs. Redlined Version</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="original" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="redlined">Redlined</TabsTrigger>
                  </TabsList>
                  <TabsContent value="original" className="mt-4">
                    <div className="bg-secondary/50 rounded-lg p-6 h-96 flex items-center justify-center border border-border">
                      <div className="text-center">
                        <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">Original contract document preview</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="redlined" className="mt-4">
                    <div className="bg-secondary/50 rounded-lg p-6 h-96 flex items-center justify-center border border-border">
                      <div className="text-center">
                        <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">AI-generated redlined version with suggested changes</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Detailed Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" style={{ color: '#FF9800' }} />
                  Detailed Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {risks && risks.length > 0 ? risks.map((risk) => (
                  <div key={risk.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{risk.issue}</h4>
                      <Badge
                        style={{
                          backgroundColor: risk.level === 'high' ? '#FF9800' : '#FFA500',
                          color: '#ffffff',
                          border: 'none',
                        }}
                      >
                        {risk.level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{risk.recommendation}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Estimated Exposure</span>
                      <span className="font-semibold text-foreground">{formatCurrency(typeof risk.exposure === 'string' ? parseFloat(risk.exposure) : risk.exposure || 0)}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No risks identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Approval Panel & Metadata */}
          <div className="space-y-6">
            {/* Approval Panel */}
            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="text-lg">Approval Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-success hover:bg-success/90 text-foreground">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Redline
                </Button>
                <Button variant="outline" className="w-full">
                  Request Changes
                </Button>
                <Button variant="outline" className="w-full">
                  Send to Client
                </Button>
              </CardContent>
            </Card>

            {/* Contract Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">File Name</p>
                  <p className="font-medium text-foreground">{contract.fileName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Upload Date</p>
                  <p className="font-medium text-foreground">{new Date(contract.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                  <Badge
                    style={{
                      backgroundColor: contract.riskLevel === 'high' ? '#FF9800' : contract.riskLevel === 'medium' ? '#FFA500' : '#A8E063',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  >
                    {contract.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
                  <p className="font-semibold text-foreground text-lg">{formatCurrency(typeof contract.totalExposure === 'string' ? parseFloat(contract.totalExposure) : contract.totalExposure || 0)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">High Risk Issues</p>
                  <p className="text-2xl font-bold text-foreground">
                    {risks?.filter((r) => r.level === 'high').length || 0}
                  </p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(risks?.reduce((sum, r) => sum + (typeof r.exposure === 'string' ? parseFloat(r.exposure) : r.exposure || 0), 0) || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
