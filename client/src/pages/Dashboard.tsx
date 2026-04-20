import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Upload, Zap } from 'lucide-react';
import {
  MOCK_CONTRACTS,
  MOCK_WORKFLOWS,
  MOCK_AGENT_ACTIVITIES,
  MOCK_RISK_ALERTS,
  MOCK_INTELLIGENCE_INSIGHTS,
  getRiskLevelColor,
  getWorkflowStatusLabel,
  getContractStatusLabel,
  formatCurrency,
  formatDate,
} from '@/lib/mock-data';

/**
 * Legal OS Dashboard
 * Design Philosophy: Modern Professional with Legal Authority
 * - Deep Navy primary color (#1a2847) for authority
 * - Tealime accents (#56CCF2) for AI intelligence
 * - Charge Green (#A8E063) for positive outcomes
 * - Asymmetric layout with command bar, workflows, risk panel, and intelligence insights
 */
export default function Dashboard() {
  const highRiskCount = MOCK_RISK_ALERTS.filter((a) => a.level === 'high').length;
  const totalExposure = MOCK_RISK_ALERTS.reduce((sum, alert) => sum + alert.exposure, 0);

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
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Workflows & Risk Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Workflows Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Active Workflows
                </CardTitle>
                <CardDescription>Real-time AI agent processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_WORKFLOWS.map((workflow) => (
                  <div key={workflow.id} className="space-y-2 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{workflow.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {getWorkflowStatusLabel(workflow.status)} • Updated {workflow.lastUpdated.split('T')[1]}
                        </p>
                      </div>
                      <Badge
                        variant={workflow.status === 'awaiting_approval' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {workflow.progress}%
                      </Badge>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Panel */}
            <Card className="border-l-4" style={{ borderLeftColor: '#FF9800' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" style={{ color: '#FF9800' }} />
                  Risk Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">High Risk Contracts</p>
                    <p className="text-2xl font-bold text-foreground">{highRiskCount}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(totalExposure)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {MOCK_RISK_ALERTS.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-3 bg-secondary/30 rounded-lg border border-border">
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: alert.level === 'high' ? '#FF9800' : '#FFA500' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{alert.issue}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Contracts & Intelligence */}
          <div className="space-y-6">
            {/* Contracts Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Contracts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_CONTRACTS.map((contract) => (
                  <div key={contract.id} className="p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{contract.name}</p>
                        <p className="text-xs text-muted-foreground">{contract.client}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-2 flex-shrink-0"
                        style={{
                          backgroundColor: contract.riskLevel === 'high' ? '#FF9800' : contract.riskLevel === 'medium' ? '#FFA500' : '#A8E063',
                          color: '#ffffff',
                          border: 'none',
                        }}
                      >
                        {contract.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress value={contract.reviewProgress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-2">{contract.reviewProgress}% Complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Agent Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_AGENT_ACTIVITIES.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-accent animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Intelligence Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Atlas Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_INTELLIGENCE_INSIGHTS.map((insight) => (
                  <div key={insight.id} className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{insight.metric}</p>
                      <span className="text-sm font-semibold text-foreground">{insight.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
