import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  clauses?: Array<{
    text: string;
    category: string;
    riskLevel: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
  error?: string;
  uploadedAt: Date;
}

export default function DocumentUploadWidget() {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: (data: any) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === data.fileKey
            ? { ...doc, status: 'processing', progress: 50 }
            : doc
        )
      );
    },
    onError: (error: any) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.status === 'uploading'
            ? { ...doc, status: 'failed', error: error.message }
            : doc
        )
      );
    },
  });

  const extractMutation = trpc.documents.extractClauses.useMutation({
    onSuccess: (data: any) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.status === 'processing'
            ? {
                ...doc,
                status: 'completed',
                progress: 100,
                clauses: data.clauses,
              }
            : doc
        )
      );
    },
    onError: (error: any) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.status === 'processing'
            ? { ...doc, status: 'failed', error: error.message }
            : doc
        )
      );
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !isAuthenticated) return;

    for (const file of Array.from(files)) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
        alert('Please upload PDF, DOCX, or TXT files only');
        continue;
      }

      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDoc: UploadedDocument = {
        id: docId,
        fileName: file.name,
        fileSize: file.size / 1024 / 1024,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date(),
      };

      setDocuments((prev) => [newDoc, ...prev]);

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Content = (e.target?.result as string).split(',')[1];
          const fileMimeType = file.type || 'application/octet-stream';

          await uploadMutation.mutateAsync({
            fileName: file.name,
            fileContent: base64Content,
            fileMimeType: fileMimeType,
            fileSize: file.size,
            tempId: docId,
          });

          // Simulate text extraction for demo
          const mockText = `This is extracted text from ${file.name}. In a production environment, this would contain the actual document content extracted via OCR or text parsing.`;

          await extractMutation.mutateAsync({
            documentText: mockText,
            documentName: file.name,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === docId
              ? { ...doc, status: 'failed', error: 'Upload failed' }
              : doc
          )
        );
      }
    }
  };

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
    handleFileSelect(e.dataTransfer.files);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-semibold text-white mb-2">Upload Documents</h3>
        <p className="text-slate-400 mb-4">Drag and drop PDF, DOCX, or TXT files here, or click to browse</p>
        <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </motion.div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Uploaded Documents</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{doc.fileName}</p>
                      <p className="text-sm text-slate-400">
                        {doc.fileSize.toFixed(2)} MB • {doc.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDocument(doc.id);
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                {(doc.status === 'uploading' || doc.status === 'processing') && (
                  <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Document Details */}
      {selectedDoc && selectedDoc.status === 'completed' && selectedDoc.clauses && (
        <Card className="bg-slate-900/50 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Extracted Clauses</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedDoc.clauses.map((clause, idx) => (
              <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(clause.riskLevel)}`}>
                    {clause.category}
                  </span>
                  <span className="text-xs text-slate-400">{clause.confidence}% confidence</span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">{clause.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
