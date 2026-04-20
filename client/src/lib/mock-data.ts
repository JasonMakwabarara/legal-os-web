// Legal OS Mock Data
// Design Philosophy: Modern Professional with Legal Authority
// Color Scheme: Deep Navy (#1a2847), Tealime (#56CCF2), Charge Green (#A8E063), Amber (#FF9800)

export interface Contract {
  id: string;
  name: string;
  client: string;
  status: 'draft' | 'review' | 'approved' | 'executed';
  riskLevel: 'low' | 'medium' | 'high';
  uploadDate: string;
  reviewProgress: number;
  exposure: number;
}

export interface WorkflowItem {
  id: string;
  type: 'contract_review' | 'due_diligence' | 'litigation_prep';
  title: string;
  status: 'processing' | 'completed' | 'awaiting_approval';
  progress: number;
  lastUpdated: string;
}

export interface AgentActivity {
  id: string;
  timestamp: string;
  agent: 'contract_analyzer' | 'risk_agent' | 'redline_agent' | 'due_diligence_agent' | 'litigation_agent';
  action: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface RiskAlert {
  id: string;
  contractId: string;
  level: 'high' | 'medium' | 'low';
  issue: string;
  exposure: number;
  recommendation: string;
}

export interface IntelligenceInsight {
  id: string;
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

// Mock Contracts
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'contract-001',
    name: 'Service Agreement - TechCorp Inc',
    client: 'TechCorp Inc',
    status: 'review',
    riskLevel: 'high',
    uploadDate: '2026-04-18',
    reviewProgress: 78,
    exposure: 2100000,
  },
  {
    id: 'contract-002',
    name: 'NDA - Global Partners LLC',
    client: 'Global Partners LLC',
    status: 'draft',
    riskLevel: 'low',
    uploadDate: '2026-04-19',
    reviewProgress: 45,
    exposure: 150000,
  },
  {
    id: 'contract-003',
    name: 'License Agreement - DataFlow Systems',
    client: 'DataFlow Systems',
    status: 'approved',
    riskLevel: 'medium',
    uploadDate: '2026-04-17',
    reviewProgress: 100,
    exposure: 750000,
  },
];

// Mock Workflows
export const MOCK_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'workflow-001',
    type: 'contract_review',
    title: 'Contract Review — TechCorp Service Agreement',
    status: 'processing',
    progress: 78,
    lastUpdated: '2026-04-20T10:15:00Z',
  },
  {
    id: 'workflow-002',
    type: 'due_diligence',
    title: 'Due Diligence — Global Partners Acquisition',
    status: 'processing',
    progress: 45,
    lastUpdated: '2026-04-20T09:30:00Z',
  },
  {
    id: 'workflow-003',
    type: 'litigation_prep',
    title: 'Litigation Preparation — Case #2026-1847',
    status: 'awaiting_approval',
    progress: 92,
    lastUpdated: '2026-04-20T08:45:00Z',
  },
];

// Mock Agent Activities
export const MOCK_AGENT_ACTIVITIES: AgentActivity[] = [
  {
    id: 'activity-001',
    timestamp: '10:02',
    agent: 'contract_analyzer',
    action: 'Contract parsed',
    status: 'completed',
  },
  {
    id: 'activity-002',
    timestamp: '10:03',
    agent: 'risk_agent',
    action: 'Risks detected',
    status: 'completed',
  },
  {
    id: 'activity-003',
    timestamp: '10:04',
    agent: 'redline_agent',
    action: 'Redline generated',
    status: 'completed',
  },
  {
    id: 'activity-004',
    timestamp: '10:05',
    agent: 'litigation_agent',
    action: 'Strategy analysis in progress',
    status: 'in_progress',
  },
];

// Mock Risk Alerts
export const MOCK_RISK_ALERTS: RiskAlert[] = [
  {
    id: 'risk-001',
    contractId: 'contract-001',
    level: 'high',
    issue: 'Unlimited liability clause detected',
    exposure: 2100000,
    recommendation: 'Recommend capping liability at 12 months of fees',
  },
  {
    id: 'risk-002',
    contractId: 'contract-001',
    level: 'medium',
    issue: 'Broad indemnification obligations',
    exposure: 500000,
    recommendation: 'Narrow scope to direct damages only',
  },
  {
    id: 'risk-003',
    contractId: 'contract-003',
    level: 'medium',
    issue: 'Ambiguous termination rights',
    exposure: 300000,
    recommendation: 'Clarify termination conditions and notice periods',
  },
];

// Mock Intelligence Insights
export const MOCK_INTELLIGENCE_INSIGHTS: IntelligenceInsight[] = [
  {
    id: 'insight-001',
    metric: 'Contract risk trending',
    value: '↑ 12%',
    trend: 'up',
    trendValue: 12,
  },
  {
    id: 'insight-002',
    metric: 'Similar case win rate',
    value: '71%',
    trend: 'stable',
    trendValue: 0,
  },
  {
    id: 'insight-003',
    metric: 'Recommended liability clauses',
    value: 'Stricter',
    trend: 'up',
    trendValue: 8,
  },
];

// Helper functions
export function getRiskLevelColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high':
      return '#FF9800'; // Amber
    case 'medium':
      return '#FFA500'; // Orange
    case 'low':
      return '#A8E063'; // Charge Green
  }
}

export function getWorkflowStatusLabel(status: 'processing' | 'completed' | 'awaiting_approval'): string {
  switch (status) {
    case 'processing':
      return 'Processing';
    case 'completed':
      return 'Completed';
    case 'awaiting_approval':
      return 'Awaiting Approval';
  }
}

export function getContractStatusLabel(status: 'draft' | 'review' | 'approved' | 'executed'): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'executed':
      return 'Executed';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
