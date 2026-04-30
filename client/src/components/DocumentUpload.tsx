import React, { useState, useRef } from 'react';
import { Upload, File, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

/**
 * Document Upload Component
 * Handles drag-and-drop file uploads with S3 storage integration
 */
export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: (data: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === data.tempId
            ? {
                ...f,
                status: 'success',
                progress: 100,
              }
            : f
        )
      );
    },
    onError: (error: any) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === (error as any).tempId
            ? {
                ...f,
                status: 'error',
                error: error.message,
              }
            : f
        )
      );
    },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      const tempId = `${Date.now()}-${Math.random()}`;
      const uploadedFile: UploadedFile = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0,
      };

      setFiles((prev) => [...prev, uploadedFile]);

      // Convert file to base64 and upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          uploadMutation.mutate({
            fileName: file.name,
            fileContent: base64,
            fileMimeType: file.type,
            fileSize: file.size,
            tempId: file.name + Date.now(),
          });
        } catch (error) {
          console.error('Upload error:', error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supports PDF, DOCX, TXT, and images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-muted-foreground/25 bg-muted/50 hover:border-accent/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.txt,.doc,.jpg,.jpeg,.png,.gif"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  Drop your files here or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOCX, TXT, and image files up to 50MB each
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Uploaded Files</h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <Progress value={file.progress} className="w-24" />
                        <Loader2 className="w-4 h-4 animate-spin text-accent flex-shrink-0" />
                      </div>
                    )}

                    {file.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}

                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {files.some((f) => f.status === 'error') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some files failed to upload. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
