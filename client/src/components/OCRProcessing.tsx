import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Upload,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Download,
  Eye,
  Loader,
} from 'lucide-react';

interface OCRJob {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  extractedText?: string;
  pageCount?: number;
  processedPages?: number;
  confidence?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const mockJobs: OCRJob[] = [
  {
    id: '1',
    fileName: 'Contract_2024_Final.pdf',
    fileSize: 2.4,
    status: 'completed',
    progress: 100,
    pageCount: 12,
    processedPages: 12,
    confidence: 94,
    extractedText: 'Sample extracted text from contract...',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  },
  {
    id: '2',
    fileName: 'NDA_Agreement.pdf',
    fileSize: 1.8,
    status: 'processing',
    progress: 65,
    pageCount: 8,
    processedPages: 5,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '3',
    fileName: 'Employment_Contract.docx',
    fileSize: 0.9,
    status: 'pending',
    progress: 0,
    pageCount: 5,
    processedPages: 0,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
];

export default function OCRProcessing() {
  const [jobs, setJobs] = useState<OCRJob[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<OCRJob | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Simulate OCR processing
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === 'processing' && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 15, 100);
            const newProcessedPages = Math.ceil((newProgress / 100) * (job.pageCount || 0));

            if (newProgress === 100) {
              return {
                ...job,
                progress: 100,
                status: 'completed',
                processedPages: job.pageCount,
                confidence: 85 + Math.random() * 15,
                completedAt: new Date(),
              };
            }

            return {
              ...job,
              progress: newProgress,
              processedPages: newProcessedPages,
            };
          }

          if (job.status === 'pending' && Math.random() > 0.7) {
            return {
              ...job,
              status: 'processing',
              progress: Math.random() * 20,
            };
          }

          return job;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    const newJobs = files.map((file) => ({
      id: `job-${Date.now()}-${Math.random()}`,
      fileName: file.name,
      fileSize: file.size / 1024 / 1024,
      status: 'pending' as const,
      progress: 0,
      pageCount: Math.ceil(Math.random() * 15) + 1,
      processedPages: 0,
      createdAt: new Date(),
    }));

    setJobs([...newJobs, ...jobs]);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'processing':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Loader className="w-5 h-5 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const processingJobs = jobs.filter((j) => j.status === 'processing').length;
  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">OCR Processing Pipeline</h2>
        <p className="text-slate-400">
          Automatically extract text from documents using advanced OCR technology
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'from-blue-500 to-cyan-500' },
          { label: 'Completed', value: completedJobs, color: 'from-green-500 to-emerald-500' },
          { label: 'Processing', value: processingJobs, color: 'from-yellow-500 to-orange-500' },
          { label: 'Pending', value: pendingJobs, color: 'from-purple-500 to-pink-500' },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 p-4"
          >
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#3b82f6' : '#475569',
        }}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging ? 'bg-blue-500/10' : 'bg-slate-800/30'
        }`}
      >
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          className="space-y-4"
        >
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="inline-flex p-4 bg-blue-500/20 rounded-lg"
          >
            <Upload className="w-8 h-8 text-blue-400" />
          </motion.div>
          <div>
            <p className="text-white font-semibold mb-1">Drag documents here or click to upload</p>
            <p className="text-slate-400 text-sm">PDF, DOCX, TIFF, and image files supported</p>
          </div>
          <label>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.tiff,.jpg,.png"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Select Files
            </Button>
          </label>
        </motion.div>
      </motion.div>

      {/* Jobs List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Processing Jobs</h3>
        <AnimatePresence>
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                onClick={() => setSelectedJob(job)}
                className={`bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-xl p-4 cursor-pointer transition-all ${
                  selectedJob?.id === job.id ? 'border-blue-500/50 bg-blue-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`p-3 rounded-lg ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{job.fileName}</h4>
                        <p className="text-xs text-slate-400">
                          {job.fileSize.toFixed(2)} MB • {job.pageCount} pages
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'completed' && job.confidence && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-400">
                              {Math.round(job.confidence)}% confidence
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>
                          {job.status === 'completed'
                            ? 'Completed'
                            : `${job.processedPages || 0}/${job.pageCount} pages`}
                        </span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {job.status === 'completed' && job.completedAt
                          ? `Completed ${Math.round((Date.now() - job.completedAt.getTime()) / 60000)} min ago`
                          : `Created ${Math.round((Date.now() - job.createdAt.getTime()) / 60000)} min ago`}
                      </span>
                      <div className="flex gap-2">
                        {job.status === 'completed' && (
                          <>
                            <button className="p-1 hover:bg-blue-500/20 rounded text-slate-400 hover:text-blue-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:bg-green-500/20 rounded text-slate-400 hover:text-green-400 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveJob(job.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Job Details */}
      {selectedJob && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Job Details</h3>
            <button
              onClick={() => setSelectedJob(null)}
              className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">File Name</p>
              <p className="text-white font-medium">{selectedJob.fileName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(selectedJob.status)}`}>
                {getStatusIcon(selectedJob.status)}
                <span className="capitalize">{selectedJob.status}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Progress</p>
              <p className="text-white font-medium">{Math.round(selectedJob.progress)}%</p>
            </div>
            {selectedJob.confidence && (
              <div>
                <p className="text-sm text-slate-400 mb-1">OCR Confidence</p>
                <p className="text-white font-medium">{Math.round(selectedJob.confidence)}%</p>
              </div>
            )}
          </div>

          {selectedJob.extractedText && (
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Extracted Text Preview</p>
              <div className="bg-slate-700/30 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-slate-300 text-sm">{selectedJob.extractedText}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Batch Actions */}
      {jobs.some((j) => j.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg"
        >
          <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-400 font-semibold text-sm mb-2">
              {completedJobs} document{completedJobs !== 1 ? 's' : ''} ready for analysis
            </p>
            <p className="text-green-400/70 text-xs">
              Extracted text is now available for clause categorization and risk analysis
            </p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600 text-white text-sm">
            Analyze Now
          </Button>
        </motion.div>
      )}
    </div>
  );
}
