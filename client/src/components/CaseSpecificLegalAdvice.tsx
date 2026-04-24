import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface CaseSpecificLegalAdviceProps {
  caseId?: number;
  caseName?: string;
  caseType?: string;
  onClose?: () => void;
}

/**
 * Case-Specific Legal Advice Component
 * Provides AI-generated advice based on firm's internal case data and historical outcomes
 */
export function CaseSpecificLegalAdvice({
  caseId,
  caseName = 'Case #2024-001',
  caseType = 'Contract Dispute',
  onClose,
}: CaseSpecificLegalAdviceProps) {
  const [activeTab, setActiveTab] = useState<'advice' | 'outcomes' | 'strategy'>('advice');

  // Historical outcomes data
  const outcomesTrend = [
    { month: 'Jan', winRate: 65, avgSettlement: 85000 },
    { month: 'Feb', winRate: 68, avgSettlement: 92000 },
    { month: 'Mar', winRate: 72, avgSettlement: 98000 },
    { month: 'Apr', winRate: 70, avgSettlement: 95000 },
    { month: 'May', winRate: 75, avgSettlement: 105000 },
    { month: 'Jun', winRate: 78, avgSettlement: 110000 },
  ];

  // Similar cases data
  const similarCases = [
    {
      id: '2024-045',
      name: 'Smith v. Corp Inc',
      type: 'Contract Dispute',
      outcome: 'Won',
      settlement: '$125,000',
      similarity: 92,
    },
    {
      id: '2024-032',
      name: 'Jones LLC v. Tech Co',
      type: 'Contract Dispute',
      outcome: 'Settled',
      settlement: '$95,000',
      similarity: 88,
    },
    {
      id: '2024-018',
      name: 'Brown Industries v. Services',
      type: 'Contract Dispute',
      outcome: 'Won',
      settlement: '$150,000',
      similarity: 85,
    },
  ];

  // AI-generated advice
  const aiAdvice = [
    {
      title: 'Likely Outcome Prediction',
      icon: <TrendingUp className="w-5 h-5 text-success" />,
      content: 'Based on 47 similar cases in your firm database, the predicted win rate is 78% with an average settlement of $112,500.',
      confidence: 'High (92%)',
    },
    {
      title: 'Strategic Recommendations',
      icon: <CheckCircle2 className="w-5 h-5 text-accent" />,
      content: 'Focus on the breach of warranty clause (similar to winning cases). Request early discovery on performance metrics.',
      confidence: 'High (89%)',
    },
    {
      title: 'Risk Factors',
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      content: 'Opposing party has strong precedent on limitation of liability. Consider settlement negotiations early.',
      confidence: 'Medium (76%)',
    },
    {
      title: 'Timeline Estimate',
      icon: <Clock className="w-5 h-5 text-warning" />,
      content: 'Based on historical data, expect 18-24 months to resolution. Early settlement typically occurs at 12 months.',
      confidence: 'High (85%)',
    },
  ];

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Case-Specific Legal Advice
            </CardTitle>
            <CardDescription>{caseName} - {caseType}</CardDescription>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
          <TabsTrigger value="advice">AI Advice</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        {/* AI Advice Tab */}
        <TabsContent value="advice" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-3">
            {aiAdvice.map((item, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {item.icon}
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {item.confidence}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent value="outcomes" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-6">
            {/* Win Rate Trend */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Win Rate Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={outcomesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="winRate" stroke="var(--color-success)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Settlement Trend */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-4">Average Settlement Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={outcomesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avgSettlement" fill="var(--color-accent)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-4">
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Similar Cases from Your Database</h3>
              <div className="space-y-3">
                {similarCases.map((caseItem, idx) => (
                  <div key={idx} className="border border-border rounded p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">{caseItem.name}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.type}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {caseItem.similarity}% Similar
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge
                          variant={caseItem.outcome === 'Won' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {caseItem.outcome}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{caseItem.settlement}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Recommended Actions</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-accent font-semibold">1.</span>
                  <span className="text-foreground">Request early discovery on performance metrics and communications</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-semibold">2.</span>
                  <span className="text-foreground">Prepare counter-arguments for limitation of liability clause</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-semibold">3.</span>
                  <span className="text-foreground">Schedule settlement negotiations for month 12 of litigation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-semibold">4.</span>
                  <span className="text-foreground">Leverage precedent from Smith v. Corp Inc (Case #2024-045)</span>
                </li>
              </ol>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
