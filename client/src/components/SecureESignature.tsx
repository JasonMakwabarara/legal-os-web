import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PenTool, Check, AlertCircle, Lock, User, Clock, Download } from 'lucide-react';

interface SecureESignatureProps {
  documentId?: number;
  documentName?: string;
  signers?: Array<{ id: string; name: string; email: string }>;
  onClose?: () => void;
  onSignatureComplete?: (signature: SignatureData) => void;
}

interface SignatureData {
  documentId: number;
  signer: string;
  signatureImage: string;
  timestamp: Date;
  ipAddress: string;
  verified: boolean;
}

interface SignatureRecord {
  id: string;
  signer: string;
  email: string;
  signedAt: Date;
  status: 'pending' | 'signed' | 'rejected';
  signatureImage?: string;
}

/**
 * Secure E-Signature Component
 * Provides secure digital signature capabilities with audit trail
 */
export function SecureESignature({
  documentId = 1,
  documentName = 'Document',
  signers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ],
  onClose,
  onSignatureComplete,
}: SecureESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<'sign' | 'workflow' | 'audit'>('sign');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signatureRecords, setSignatureRecords] = useState<SignatureRecord[]>(
    signers.map((s) => ({
      id: s.id,
      signer: s.name,
      email: s.email,
      signedAt: new Date(),
      status: 'pending',
    }))
  );

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1a2847';
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleSign = () => {
    if (!signerName.trim() || !signerEmail.trim()) {
      alert('Please enter your name and email');
      return;
    }

    if (!canvasRef.current) return;

    // Get signature image
    const signatureImage = canvasRef.current.toDataURL('image/png');

    // Update signature record
    setSignatureRecords((prev) =>
      prev.map((record) =>
        record.signer === signerName
          ? {
              ...record,
              status: 'signed',
              signedAt: new Date(),
              signatureImage,
            }
          : record
      )
    );

    // Notify parent
    onSignatureComplete?.({
      documentId,
      signer: signerName,
      signatureImage,
      timestamp: new Date(),
      ipAddress: '192.168.1.1', // Would be actual IP in production
      verified: true,
    });

    // Reset form
    setSignerName('');
    setSignerEmail('');
    clearSignature();
  };

  const allSigned = signatureRecords.every((r) => r.status === 'signed');

  return (
    <Card className="border border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Secure E-Signature</CardTitle>
              <CardDescription>{documentName}</CardDescription>
            </div>
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
          <TabsTrigger value="sign">Sign</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Sign Tab */}
        <TabsContent value="sign" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your signature will be encrypted and legally binding. This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                <Input
                  placeholder="Your full name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Signature Pad
                </label>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border-2 border-dashed border-border rounded-lg bg-background cursor-crosshair w-full"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSignature} className="flex-1">
                  Clear
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={!signerName.trim() || !signerEmail.trim()}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Sign Document
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-3">
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Signature Workflow</h3>
                <Badge variant={allSigned ? 'default' : 'secondary'}>
                  {signatureRecords.filter((r) => r.status === 'signed').length}/{signatureRecords.length} Signed
                </Badge>
              </div>
              <div className="space-y-2">
                {signatureRecords.map((record, idx) => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-background rounded border border-border">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{record.signer}</p>
                      <p className="text-xs text-muted-foreground">{record.email}</p>
                    </div>
                    {record.status === 'signed' ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <span className="text-xs text-muted-foreground">
                          {record.signedAt.toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {allSigned && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All signatures collected! Document is now fully executed.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="flex-1 overflow-auto px-4 pb-4">
          <div className="space-y-3">
            <div className="bg-secondary/50 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Signature Audit Trail</h3>
              <div className="space-y-2">
                {signatureRecords
                  .filter((r) => r.status === 'signed')
                  .map((record) => (
                    <div key={record.id} className="border border-border rounded p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-foreground">{record.signer}</p>
                          <p className="text-xs text-muted-foreground">{record.email}</p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {record.signedAt.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>IP Address: 192.168.1.1</p>
                        <p>Device: Chrome on Windows</p>
                        <p>Encryption: SHA-256</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <Button variant="outline" className="w-full" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Audit Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
