import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Users,
  Zap,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  action: string;
}

interface RiskItem {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  severity: number;
}

const demoSteps: DemoStep[] = [
  {
    id: 'upload',
    title: 'Upload Contract',
    description: 'Drag and drop your contract document for instant analysis',
    icon: <FileText className="w-8 h-8" />,
    duration: 2,
    action: 'Uploading sample_contract.pdf...',
  },
  {
    id: 'analyze',
    title: 'AI Analysis',
    description: 'Advanced LLM analyzes contract terms, clauses, and risks in real-time',
    icon: <Brain className="w-8 h-8" />,
    duration: 3,
    action: 'Analyzing 47 clauses across 12 sections...',
  },
  {
    id: 'risks',
    title: 'Risk Detection',
    description: 'Identifies high-risk clauses and potential legal exposure',
    icon: <AlertTriangle className="w-8 h-8" />,
    duration: 2,
    action: 'Detected 3 high-risk items requiring attention',
  },
  {
    id: 'collaborate',
    title: 'Real-Time Collaboration',
    description: 'Invite team members to review and edit simultaneously',
    icon: <Users className="w-8 h-8" />,
    duration: 2,
    action: 'Sarah Chen joined the review session',
  },
  {
    id: 'insights',
    title: 'Actionable Insights',
    description: 'Get AI-powered recommendations and suggested revisions',
    icon: <CheckCircle2 className="w-8 h-8" />,
    duration: 2,
    action: 'Generated 5 revision recommendations',
  },
];

const mockRisks: RiskItem[] = [
  {
    id: '1',
    type: 'high',
    title: 'Unlimited Liability Clause',
    description: 'Section 8.2: No cap on damages exposure',
    severity: 95,
  },
  {
    id: '2',
    type: 'high',
    title: 'Broad Indemnification',
    description: 'Section 6.1: Covers third-party claims without limitation',
    severity: 88,
  },
  {
    id: '3',
    type: 'medium',
    title: 'Ambiguous Termination Rights',
    description: 'Section 4.3: Unclear notice period requirements',
    severity: 62,
  },
];

export default function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedRisks, setDisplayedRisks] = useState<RiskItem[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < demoSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, demoSteps[currentStep].duration * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep]);

  useEffect(() => {
    if (currentStep === 2) {
      const timer = setInterval(() => {
        setDisplayedRisks((prev) => {
          if (prev.length < mockRisks.length) {
            return [...prev, mockRisks[prev.length]];
          }
          clearInterval(timer);
          return prev;
        });
      }, 400);
      return () => clearInterval(timer);
    } else {
      setDisplayedRisks([]);
    }
  }, [currentStep]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setDisplayedRisks([]);
    setProgress(0);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-900/50 to-slate-950/50 rounded-xl border border-slate-700/50 p-3 sm:p-4 backdrop-blur-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <p className="text-slate-400 text-xs sm:text-sm">
          Watch how Legal OS analyzes contracts, detects risks, and enables real-time collaboration
        </p>
      </div>

      {/* Controls - Moved Below Description */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlayPause}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30 text-xs"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Play Demo</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg font-semibold transition-all border border-slate-700/50 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </motion.button>

        <div className="text-slate-400 text-xs ml-auto">
          {currentStep + 1}/{demoSteps.length}
        </div>
      </div>

      {/* Main Demo Area */}
      <div className="grid lg:grid-cols-3 gap-2 sm:gap-3 mb-3">
        {/* Left: Steps Timeline */}
        <div className="lg:col-span-1 space-y-1.5">
          {demoSteps.map((step, index) => (
            <motion.button
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all text-xs sm:text-sm ${
                currentStep === index
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/50'
                  : index < currentStep
                  ? 'bg-slate-800/50 border border-slate-700/50 opacity-60'
                  : 'bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    currentStep === index
                      ? 'bg-blue-500/20 text-blue-400'
                      : index < currentStep
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-700/50 text-slate-400'
                  }`}
                >
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{step.title}</p>
                  <p className="text-xs text-slate-400 truncate">{step.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right: Live Demo Display */}
        <div className="lg:col-span-2 min-h-0">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-blue-500/50 rounded-xl p-12 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                  </motion.div>
                  <p className="text-white font-semibold mb-2">Drag & Drop Contract</p>
                  <p className="text-slate-400 text-sm">sample_contract.pdf (2.4 MB)</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-300 text-sm">
                    Upload any contract in PDF, DOCX, or TXT format. Legal OS will instantly begin analysis.
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-8 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Brain className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <div>
                      <p className="text-white font-semibold">AI Analysis in Progress</p>
                      <p className="text-slate-400 text-sm">{demoSteps[1].action}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Processing</span>
                      <span>{Math.min(Math.round(progress), 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Analysis Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: 'Clauses', value: '47' },
                      { label: 'Sections', value: '12' },
                      { label: 'Terms', value: '156' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-slate-700/30 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{stat.value}</p>
                        <p className="text-xs text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <p className="text-white font-semibold mb-4">{demoSteps[2].action}</p>
                {displayedRisks.map((risk) => (
                  <motion.div
                    key={risk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${
                      risk.type === 'high'
                        ? 'bg-red-500/10 border-red-500/30'
                        : risk.type === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-1 ${
                          risk.type === 'high'
                            ? 'bg-red-500/20 text-red-400'
                            : risk.type === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{risk.title}</p>
                        <p className="text-slate-400 text-xs mt-1">{risk.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                risk.type === 'high'
                                  ? 'bg-red-500'
                                  : risk.type === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }`}
                              initial={{ width: '0%' }}
                              animate={{ width: `${risk.severity}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{risk.severity}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="collaborate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                  <p className="text-white font-semibold mb-4">{demoSteps[3].action}</p>

                  {/* Collaborators */}
                  <div className="space-y-3">
                    {[
                      { name: 'You', role: 'Owner', color: 'bg-blue-500', status: 'editing' },
                      { name: 'Sarah Chen', role: 'Lawyer', color: 'bg-purple-500', status: 'viewing' },
                      { name: 'Michael Rodriguez', role: 'Paralegal', color: 'bg-emerald-500', status: 'idle' },
                    ].map((user) => (
                      <div key={user.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{user.name}</p>
                            <p className="text-slate-400 text-xs">{user.role}</p>
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.status === 'editing'
                              ? 'bg-blue-500/20 text-blue-400'
                              : user.status === 'viewing'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-slate-600/20 text-slate-400'
                          }`}
                        >
                          {user.status === 'editing' ? '✏️ Editing' : user.status === 'viewing' ? '👁️ Viewing' : '⏸️ Idle'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                  <p className="text-white font-semibold mb-4">{demoSteps[4].action}</p>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    {[
                      'Add liability cap at $5M maximum exposure',
                      'Narrow indemnification scope to direct damages only',
                      'Clarify 30-day termination notice requirement',
                      'Include force majeure clause for unforeseen events',
                      'Add dispute resolution and arbitration clause',
                    ].map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-sm">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>



      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-2.5 sm:p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg text-center"
      >
        <p className="text-white font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">Ready to transform your legal practice?</p>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-blue-500/30 text-xs px-2.5 sm:px-3 py-1 sm:py-1.5">
          Start Your Free Trial <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </motion.div>
    </div>
  );
}
