import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentAnalysisPanelProps {
  documentUrl?: string;
  documentName?: string;
  onAnalyze?: () => void;
}

/**
 * Document Analysis Panel
 * Provides summarization and key clause extraction for legal documents
 */
export function DocumentAnalysisPanel({
  documentUrl,
  documentName,
  onAnalyze,
}: DocumentAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [keyClauses, setKeyClauses] = useState<Array<{ title: string; content: string; riskLevel: string }>>([]);

  const handleAnalyze = async () => {
    if (!documentUrl) return;
    
    setIsAnalyzing(true);
    try {
      // TODO: Integrate with AI service for document analysis
      // For now, show mock data
      setSummary(
        'This contract outlines the terms and conditions for service delivery between the parties. Key obligations include delivery timelines, payment terms, and confidentiality requirements.'
      );
      setKeyClauses([
        {
          title: 'Limitation of Liability',
          content: 'Neither party shall be liable for indirect, incidental, or consequential damages...',
          riskLevel: 'medium',
        },
        {
          title: 'Termination',
          content: 'Either party may terminate this agreement with 30 days written notice...',
          riskLevel: 'low',
        },
        {
          title: 'Indemnification',
          content: 'Each party shall indemnify and hold harmless the other party from any claims...',
          riskLevel: 'high',
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Analysis
        </CardTitle>
        <CardDescription>
          {documentName || 'Analyze document for summary and key clauses'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!documentUrl ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload a document to analyze its contents
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Document'
              )}
            </Button>

            {(summary || keyClauses.length > 0) && (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="clauses">Key Clauses</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  {summary && (
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-foreground">{summary}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="clauses" className="space-y-3">
                  {keyClauses.map((clause, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{clause.title}</h4>
                        <Badge
                          variant={
                            clause.riskLevel === 'high'
                              ? 'destructive'
                              : clause.riskLevel === 'medium'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {clause.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{clause.content}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
