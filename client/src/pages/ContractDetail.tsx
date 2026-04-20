import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Eye, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { MOCK_CONTRACTS, MOCK_RISK_ALERTS, formatCurrency, getContractStatusLabel } from '@/lib/mock-data';

/**
 * Contract Detail Page
 * Design Philosophy: Modern Professional with Legal Authority
 * - Side-by-side document viewer for original vs. redlined versions
 * - Risk panel with detailed analysis
 * - Approval workflow interface
 */
export default function ContractDetail() {
  const [, setLocation] = useLocation();
  const contract = MOCK_CONTRACTS[0]; // Demo with first contract
  const contractRisks = MOCK_RISK_ALERTS.filter((r) => r.contractId === contract.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{contract.name}</h1>
              <p className="text-sm text-muted-foreground">{contract.client}</p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {getContractStatusLabel(contract.status)}
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
                {contractRisks.map((risk) => (
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
                      <span className="font-semibold text-foreground">{formatCurrency(risk.exposure)}</span>
                    </div>
                  </div>
                ))}
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
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="font-medium text-foreground">{contract.client}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Upload Date</p>
                  <p className="font-medium text-foreground">{contract.uploadDate}</p>
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
                  <p className="font-semibold text-foreground text-lg">{formatCurrency(contract.exposure)}</p>
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
                    {contractRisks.filter((r) => r.level === 'high').length}
                  </p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(contractRisks.reduce((sum, r) => sum + r.exposure, 0))}
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
