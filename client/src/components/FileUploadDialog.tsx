import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  documentType?: 'contract' | 'brief' | 'memo' | 'discovery' | 'other';
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  documentType = 'other',
}: FileUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({});
  const [selectedType, setSelectedType] = useState(documentType);
  const [clientId, setClientId] = useState("none");
  const [caseId, setCaseId] = useState("none");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: cases = [] } = trpc.cases.list.useQuery();
  const createContract = trpc.contracts.create.useMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    droppedFiles.forEach((file) => {
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'pending' }));
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    selectedFiles.forEach((file) => {
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'pending' }));
    });
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    let allSucceeded = true;

    for (const file of files) {
      setUploadStatus((prev) => ({ ...prev, [file.name]: 'uploading' }));

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[file.name] || 0;
          if (current >= 90) {
            return prev;
          }
          return { ...prev, [file.name]: current + Math.random() * 30 };
        });
      }, 300);

      try {
        const fileContent = await readFileAsDataUrl(file);
        await createContract.mutateAsync({
          name: file.name.replace(/\.[^.]+$/, ""),
          fileName: file.name,
          fileMimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          clientId: clientId === "none" ? null : Number(clientId),
          caseId: caseId === "none" ? null : Number(caseId),
          fileContent,
        });
        await utils.contracts.list.invalidate();
        await utils.documents.list.invalidate();

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'success' }));
      } catch (error) {
        allSucceeded = false;
        setUploadStatus((prev) => ({ ...prev, [file.name]: 'error' }));
      } finally {
        clearInterval(interval);
      }
    }

    // Only auto-close when every file uploaded; failed files stay visible for retry
    if (allSucceeded) {
      setTimeout(() => {
        if (onSuccess) onSuccess();
        setFiles([]);
        setUploadProgress({});
        setUploadStatus({});
        onOpenChange(false);
      }, 1500);
    }
  };

  const allUploaded = files.length > 0 && Object.values(uploadStatus).every((s) => s === 'success');
  const isUploading = Object.values(uploadStatus).some((s) => s === 'uploading');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>Upload contracts, briefs, memos, or other legal documents</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Document Type</label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="memo">Memo</SelectItem>
                <SelectItem value="discovery">Discovery</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Client</label>
              <Select value={clientId} onValueChange={setClientId} disabled={isUploading}>
                <SelectTrigger><SelectValue placeholder="Optional client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={String(client.id)}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Matter</label>
              <Select value={caseId} onValueChange={setCaseId} disabled={isUploading}>
                <SelectTrigger><SelectValue placeholder="Optional matter" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {cases.map(matter => (
                    <SelectItem key={matter.id} value={String(matter.id)}>{matter.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm font-semibold text-foreground mb-1">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground mb-3">or click to select files</p>
            <p className="text-xs text-muted-foreground">Supported: PDF, DOCX, DOC, TXT (Max 50MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{files.length} file(s) selected</p>
              {files.map((file) => {
                const status = uploadStatus[file.name];
                const progress = uploadProgress[file.name] || 0;

                return (
                  <div key={file.name} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {status === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
                        {status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
                        {status !== 'success' && status !== 'error' && (
                          <button
                            onClick={() => removeFile(file.name)}
                            disabled={isUploading}
                            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {Object.values(uploadStatus).some((s) => s === 'error') && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">Some files failed to upload. Please try again.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading || allUploaded}
              className="bg-accent hover:bg-accent/90"
            >
              {isUploading ? 'Uploading...' : allUploaded ? 'Uploaded' : 'Upload Files'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
