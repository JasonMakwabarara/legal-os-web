import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface ContractRisk {
  id: string;
  name: string;
  riskScore: number;
  expiryDate: Date;
  clauses: string[];
  status: 'active' | 'expiring' | 'expired';
}

/**
 * RiskAnalyticsDashboard Component
 * Real-time contract portfolio risk monitoring and compliance alerts
 */
export const RiskAnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('90d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock risk metrics
  const riskMetrics: RiskMetric[] = [
    { id: 'liability', name: 'Liability Risk', value: 72, trend: 'up', category: 'Financial' },
    { id: 'compliance', name: 'Compliance Risk', value: 45, trend: 'down', category: 'Legal' },
    { id: 'renewal', name: 'Renewal Risk', value: 38, trend: 'stable', category: 'Operational' },
    { id: 'termination', name: 'Termination Risk', value: 55, trend: 'up', category: 'Operational' },
  ];

  // Mock contract risks
  const contractRisks: ContractRisk[] = [
    {
      id: 'contract-1',
      name: 'Vendor Agreement - Acme Corp',
      riskScore: 85,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      clauses: ['Liability Cap: $500K', 'Auto-renewal enabled', 'No termination clause'],
      status: 'expiring',
    },
    {
      id: 'contract-2',
      name: 'Service Agreement - TechServe Inc',
      riskScore: 62,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      clauses: ['SLA: 99.5%', 'Indemnification included', 'Flexible termination'],
      status: 'active',
    },
    {
      id: 'contract-3',
      name: 'Employment Contract - John Doe',
      riskScore: 28,
      expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      clauses: ['Non-compete clause', 'IP assignment', 'Severance terms'],
      status: 'expired',
    },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskIcon = (score: number) => {
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <h2 className="text-lg font-semibold">Risk Analytics Dashboard</h2>
        </div>
        <div className="flex gap-2">
          {(['30d', '90d', '1y'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {riskMetrics.map((metric) => (
          <Card
            key={metric.id}
            className={`p-4 border-2 cursor-pointer transition ${
              selectedCategory === metric.category
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200'
            }`}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === metric.category ? null : metric.category
              )
            }
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-medium">{metric.name}</p>
                <p className="text-2xl font-bold mt-2">{metric.value}%</p>
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  metric.trend === 'up'
                    ? 'text-red-600'
                    : metric.trend === 'down'
                    ? 'text-green-600'
                    : 'text-slate-600'
                }`}
              >
                {metric.trend === 'up' && '↑'}
                {metric.trend === 'down' && '↓'}
                {metric.trend === 'stable' && '→'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Contract Risk Heatmap */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold mb-3">Contract Portfolio Risk</h3>
        <div className="space-y-2">
          {contractRisks.map((contract) => (
            <Card
              key={contract.id}
              className={`p-4 border-2 ${getRiskColor(contract.riskScore)}`}
            >
              <div className="flex items-start gap-3">
                {getRiskIcon(contract.riskScore)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{contract.name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadge(contract.status)}`}>
                      {contract.status === 'expiring' && 'Expiring Soon'}
                      {contract.status === 'expired' && 'Expired'}
                      {contract.status === 'active' && 'Active'}
                    </span>
                  </div>

                  {/* Risk Score Bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          contract.riskScore >= 70
                            ? 'bg-red-600'
                            : contract.riskScore >= 50
                            ? 'bg-yellow-600'
                            : 'bg-green-600'
                        }`}
                        style={{ width: `${contract.riskScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{contract.riskScore}</span>
                  </div>

                  {/* Expiry Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                    <Calendar className="w-3 h-3" />
                    {contract.expiryDate.toLocaleDateString()}
                  </div>

                  {/* Risk Clauses */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {contract.clauses.map((clause, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 px-2 py-1 rounded"
                      >
                        {clause}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-700 pt-4">
        <Button variant="outline" className="flex-1">
          Export Report
        </Button>
        <Button className="flex-1">
          Configure Alerts
        </Button>
      </div>
    </div>
  );
};

export default RiskAnalyticsDashboard;
