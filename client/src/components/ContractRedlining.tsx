import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface RedlineChange {
  id: string;
  type: 'addition' | 'deletion' | 'modification';
  originalText: string;
  newText: string;
  lineNumber: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestion?: string;
  accepted: boolean;
}

interface ContractRedliningProps {
  originalText: string;
  revisedText: string;
  onAcceptChanges?: (changes: RedlineChange[]) => void;
}

/**
 * ContractRedlining Component
 * AI-powered side-by-side contract comparison with risk flagging and suggestions
 */
export const ContractRedlining: React.FC<ContractRedliningProps> = ({
  originalText,
  revisedText,
  onAcceptChanges,
}) => {
  const [changes, setChanges] = useState<RedlineChange[]>([]);
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [acceptedCount, setAcceptedCount] = useState(0);

  // Simulate diff analysis (in production, use a proper diff library)
  React.useEffect(() => {
    const simulatedChanges: RedlineChange[] = [
      {
        id: 'change-1',
        type: 'modification',
        originalText: 'The Vendor shall provide services within 30 days',
        newText: 'The Vendor shall provide services within 45 days',
        lineNumber: 12,
        riskLevel: 'medium',
        suggestion: 'Consider negotiating back to 30 days or adding penalty clauses for delays',
        accepted: false,
      },
      {
        id: 'change-2',
        type: 'addition',
        originalText: '',
        newText: 'Liability cap: $500,000',
        lineNumber: 28,
        riskLevel: 'high',
        suggestion: 'This significantly limits our recovery options. Recommend capping at $1,000,000 or negotiating higher',
        accepted: false,
      },
      {
        id: 'change-3',
        type: 'deletion',
        originalText: 'Indemnification clause for third-party claims',
        newText: '',
        lineNumber: 35,
        riskLevel: 'high',
        suggestion: 'Removing indemnification is high-risk. This should be retained or replaced with alternative protection',
        accepted: false,
      },
      {
        id: 'change-4',
        type: 'modification',
        originalText: 'Either party may terminate with 60 days notice',
        newText: 'Either party may terminate with 90 days notice',
        lineNumber: 42,
        riskLevel: 'low',
        suggestion: 'Standard commercial term. Acceptable change',
        accepted: false,
      },
    ];
    setChanges(simulatedChanges);
  }, []);

  const handleAcceptChange = (changeId: string) => {
    setChanges(
      changes.map((c) =>
        c.id === changeId ? { ...c, accepted: true } : c
      )
    );
    setAcceptedCount(acceptedCount + 1);
  };

  const handleRejectChange = (changeId: string) => {
    setChanges(
      changes.map((c) =>
        c.id === changeId ? { ...c, accepted: false } : c
      )
    );
    if (changes.find((c) => c.id === changeId)?.accepted) {
      setAcceptedCount(acceptedCount - 1);
    }
  };

  const handleSubmitChanges = () => {
    const acceptedChanges = changes.filter((c) => c.accepted);
    if (onAcceptChanges) {
      onAcceptChanges(acceptedChanges);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Contract Redlining</h2>
          <span className="text-sm text-slate-500">
            {changes.length} changes detected
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </Button>
          <Button
            size="sm"
            onClick={handleSubmitChanges}
            disabled={acceptedCount === 0}
          >
            Accept {acceptedCount} Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Original Text */}
        <div className="flex-1 flex flex-col">
          <div className="text-sm font-medium mb-2 text-slate-600">Original</div>
          <Card className="flex-1 p-4 bg-slate-950 border-slate-800 overflow-y-auto">
            <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
              {originalText}
            </div>
          </Card>
        </div>

        {/* Changes Panel */}
        <div className="w-96 flex flex-col gap-4">
          <div className="text-sm font-medium text-slate-600">Changes</div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {changes.map((change) => (
              <Card
                key={change.id}
                className={`p-3 border cursor-pointer transition ${
                  selectedChange === change.id
                    ? 'border-blue-500 bg-blue-50'
                    : getRiskColor(change.riskLevel)
                }`}
                onClick={() => setSelectedChange(change.id)}
              >
                <div className="flex items-start gap-2">
                  {getRiskIcon(change.riskLevel)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase">
                        {change.type}
                      </span>
                      <span className="text-xs text-slate-500">
                        Line {change.lineNumber}
                      </span>
                    </div>
                    <p className="text-sm mt-1 break-words">
                      {change.type === 'deletion'
                        ? change.originalText
                        : change.newText}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && change.suggestion && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-900">
                    💡 {change.suggestion}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={change.accepted ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptChange(change.id);
                    }}
                    className="flex-1 text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={!change.accepted ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectChange(change.id);
                    }}
                    className="flex-1 text-xs"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Revised Text */}
        <div className="flex-1 flex flex-col">
          <div className="text-sm font-medium mb-2 text-slate-600">Revised</div>
          <Card className="flex-1 p-4 bg-slate-950 border-slate-800 overflow-y-auto">
            <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
              {revisedText}
            </div>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-700 pt-3">
        <div>
          <span className="font-medium">
            {acceptedCount} of {changes.length}
          </span>{' '}
          changes accepted
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>
              {changes.filter((c) => c.riskLevel === 'high').length} High Risk
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span>
              {changes.filter((c) => c.riskLevel === 'medium').length} Medium Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractRedlining;
