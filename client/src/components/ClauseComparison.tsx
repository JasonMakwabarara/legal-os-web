import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileText,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  X,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

interface Clause {
  id: string;
  title: string;
  content: string;
  riskLevel: 'high' | 'medium' | 'low';
  category: string;
}

interface DocumentClause {
  documentName: string;
  clauses: Clause[];
}

interface ComparisonResult {
  clauseTitle: string;
  similarity: number;
  differences: string[];
  riskAnalysis: string;
  recommendation: string;
  riskDelta: number;
}

const mockDocuments: DocumentClause[] = [
  {
    documentName: 'Service Agreement - Acme Corp',
    clauses: [
      {
        id: '1a',
        title: 'Limitation of Liability',
        content:
          'Neither party shall be liable for indirect, incidental, or consequential damages, including lost profits, even if advised of the possibility of such damages. Total liability shall not exceed the fees paid in the preceding 12 months.',
        riskLevel: 'low',
        category: 'Liability',
      },
      {
        id: '2a',
        title: 'Confidentiality',
        content:
          'Each party agrees to maintain the confidentiality of proprietary information for a period of 3 years after termination. Exceptions include information that is publicly available or independently developed.',
        riskLevel: 'medium',
        category: 'IP & Confidentiality',
      },
      {
        id: '3a',
        title: 'Indemnification',
        content:
          'Each party shall indemnify the other against third-party claims arising from its breach of this agreement or violation of applicable law.',
        riskLevel: 'medium',
        category: 'Liability',
      },
    ],
  },
  {
    documentName: 'Service Agreement - TechStart Inc',
    clauses: [
      {
        id: '1b',
        title: 'Limitation of Liability',
        content:
          'Neither party shall be liable for any damages whatsoever, including direct, indirect, or consequential damages. This limitation applies regardless of the form of action or the nature of the claim.',
        riskLevel: 'high',
        category: 'Liability',
      },
      {
        id: '2b',
        title: 'Confidentiality',
        content:
          'Confidential information must be protected indefinitely. All information is considered confidential unless explicitly marked otherwise. No exceptions for publicly available information.',
        riskLevel: 'high',
        category: 'IP & Confidentiality',
      },
      {
        id: '3b',
        title: 'Indemnification',
        content:
          'Each party shall indemnify the other for all claims, damages, and costs arising from any action or inaction, including negligence and breach of contract.',
        riskLevel: 'high',
        category: 'Liability',
      },
    ],
  },
];

const mockComparisons: ComparisonResult[] = [
  {
    clauseTitle: 'Limitation of Liability',
    similarity: 75,
    differences: [
      'Acme Corp includes 12-month lookback period; TechStart has no cap',
      'TechStart covers all damages; Acme excludes indirect damages',
      'Acme includes carve-outs; TechStart has no exceptions',
    ],
    riskAnalysis:
      'TechStart agreement exposes your company to unlimited liability. The absence of damage caps and exclusions significantly increases financial risk.',
    recommendation:
      'Negotiate liability cap of $5M and restore exclusion for indirect damages. Consider adding carve-outs for gross negligence.',
    riskDelta: 45,
  },
  {
    clauseTitle: 'Confidentiality',
    similarity: 60,
    differences: [
      'TechStart requires indefinite protection vs. Acme\'s 3-year term',
      'TechStart treats all info as confidential by default',
      'Acme includes public domain exception; TechStart does not',
    ],
    riskAnalysis:
      'TechStart\'s indefinite confidentiality obligation creates long-term compliance burden and limits your ability to use knowledge gained.',
    recommendation:
      'Propose 5-year term with explicit exceptions for publicly available information and independently developed knowledge.',
    riskDelta: 35,
  },
];

export default function ClauseComparison() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([
    mockDocuments[0].documentName,
    mockDocuments[1].documentName,
  ]);
  const [expandedComparison, setExpandedComparison] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedDocs = useMemo(
    () => mockDocuments.filter((doc) => selectedDocuments.includes(doc.documentName)),
    [selectedDocuments]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    selectedDocs.forEach((doc) => {
      doc.clauses.forEach((clause) => cats.add(clause.category));
    });
    return Array.from(cats);
  }, [selectedDocs]);

  const filteredComparisons = useMemo(() => {
    return mockComparisons.filter(
      (comp) => !selectedCategory || mockComparisons.some((c) => c.clauseTitle === comp.clauseTitle)
    );
  }, [selectedCategory]);

  const totalRiskDelta = useMemo(
    () => filteredComparisons.reduce((sum, comp) => sum + comp.riskDelta, 0),
    [filteredComparisons]
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'low':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Clause Comparison & Analysis</h2>
        <p className="text-slate-400">
          Compare clauses across documents with AI-powered risk analysis and recommendations
        </p>
      </div>

      {/* Document Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Select Documents to Compare</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {mockDocuments.map((doc) => (
            <motion.button
              key={doc.documentName}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (selectedDocuments.includes(doc.documentName)) {
                  setSelectedDocuments(
                    selectedDocuments.filter((d) => d !== doc.documentName)
                  );
                } else {
                  setSelectedDocuments([...selectedDocuments, doc.documentName]);
                }
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedDocuments.includes(doc.documentName)
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{doc.documentName}</p>
                  <p className="text-xs text-slate-400">{doc.clauses.length} clauses</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                  : 'bg-slate-700/30 border border-slate-600/50 text-slate-300 hover:border-slate-500/50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                    : 'bg-slate-700/30 border border-slate-600/50 text-slate-300 hover:border-slate-500/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Risk Summary */}
      {selectedDocuments.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Risk Analysis Summary</h3>
              <p className="text-red-400 text-sm mb-4">
                Document comparison reveals significant risk differences
              </p>
              <div className="space-y-2">
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold">Total Risk Delta:</span>{' '}
                  <span className="text-red-400 font-bold">+{totalRiskDelta}%</span>
                </p>
                <p className="text-slate-300 text-sm">
                  <span className="font-semibold">Clauses Analyzed:</span> {filteredComparisons.length}
                </p>
              </div>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-400 flex-shrink-0" />
          </div>
        </motion.div>
      )}

      {/* Comparisons */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Clause Comparisons</h3>
        <AnimatePresence>
          {filteredComparisons.map((comparison, idx) => (
            <motion.div
              key={comparison.clauseTitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <motion.button
                  onClick={() =>
                    setExpandedComparison(
                      expandedComparison === comparison.clauseTitle
                        ? null
                        : comparison.clauseTitle
                    )
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">{comparison.clauseTitle}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">
                        Similarity: <span className="text-blue-400 font-semibold">{comparison.similarity}%</span>
                      </span>
                      <span className="text-slate-400">
                        Risk Delta: <span className="text-red-400 font-semibold">+{comparison.riskDelta}%</span>
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      expandedComparison === comparison.clauseTitle ? 'rotate-180' : ''
                    }`}
                  />
                </motion.button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedComparison === comparison.clauseTitle && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-700/50 p-4 space-y-4"
                    >
                      {/* Side-by-Side Comparison */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedDocs.map((doc) => {
                          const clause = doc.clauses.find(
                            (c) => c.title === comparison.clauseTitle
                          );
                          return (
                            <div key={doc.documentName} className="space-y-2">
                              <p className="text-sm font-semibold text-white">{doc.documentName}</p>
                              <div className={`p-3 rounded-lg border ${getRiskColor(clause?.riskLevel || 'low')}`}>
                                <p className="text-sm leading-relaxed text-slate-200">
                                  {clause?.content}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Differences */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-white">Key Differences</h5>
                        <div className="space-y-2">
                          {comparison.differences.map((diff, idx) => (
                            <div key={idx} className="flex gap-2 text-sm text-slate-300">
                              <span className="text-yellow-400 flex-shrink-0">•</span>
                              <span>{diff}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {showAnalysis && (
                        <div className="space-y-3 pt-3 border-t border-slate-700/50">
                          <div className="space-y-2">
                            <h5 className="text-sm font-semibold text-white flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              AI Risk Analysis
                            </h5>
                            <p className="text-sm text-slate-300">{comparison.riskAnalysis}</p>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-semibold text-white">Recommendation</h5>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                              <p className="text-sm text-green-400">{comparison.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button className="flex-1 px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          onClick={() => setShowAnalysis(!showAnalysis)}
                          className="px-3 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 rounded-lg text-sm transition-colors"
                        >
                          {showAnalysis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Export & Share */}
      {selectedDocuments.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg"
        >
          <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Comparison Report
          </Button>
          <Button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Team
          </Button>
        </motion.div>
      )}
    </div>
  );
}
