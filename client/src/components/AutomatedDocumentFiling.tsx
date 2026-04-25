import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FilingTask {
  id: number;
  documentName: string;
  court: string;
  deadline: Date;
  status: 'pending' | 'processing' | 'filed' | 'error';
  filingNumber?: string;
  errorMessage?: string;
}

export function AutomatedDocumentFiling() {
  const [filings, setFilings] = useState<FilingTask[]>([
    {
      id: 1,
      documentName: 'Motion for Summary Judgment',
      court: 'Federal District Court - Southern District',
      deadline: new Date('2026-04-28'),
      status: 'filed',
      filingNumber: 'SDNY-2026-04-12345',
    },
    {
      id: 2,
      documentName: 'Notice of Appeal',
      court: 'Court of Appeals - 2nd Circuit',
      deadline: new Date('2026-05-05'),
      status: 'processing',
    },
    {
      id: 3,
      documentName: 'Complaint',
      court: 'State Court - County Clerk',
      deadline: new Date('2026-04-30'),
      status: 'pending',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      filed: 'default',
      processing: 'secondary',
      pending: 'secondary',
      error: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const handleFilingAction = (id: number, action: string) => {
    // TODO: Call API to perform filing action
    console.log(`Filing action: ${action} for filing ${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Automated Document Filing</h2>
        <p className="text-muted-foreground">
          Automatically file documents with courts and track filing status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filing Queue</CardTitle>
          <CardDescription>Documents ready for automated filing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filings.map(filing => (
              <div key={filing.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(filing.status)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{filing.documentName}</p>
                    <p className="text-sm text-muted-foreground">{filing.court}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deadline: {filing.deadline.toLocaleDateString()}
                    </p>
                    {filing.filingNumber && (
                      <p className="text-xs text-green-600 mt-1">
                        Filing #: {filing.filingNumber}
                      </p>
                    )}
                    {filing.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {filing.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadge(filing.status)}>
                    {filing.status.charAt(0).toUpperCase() + filing.status.slice(1)}
                  </Badge>
                  {filing.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleFilingAction(filing.id, 'file')}
                    >
                      File Now
                    </Button>
                  )}
                  {filing.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFilingAction(filing.id, 'retry')}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successfully Filed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filings.filter(f => f.status === 'filed').length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filings.filter(f => f.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filings.filter(f => f.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filing Integrations</CardTitle>
          <CardDescription>Connected court filing systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">Federal Court E-Filing System (CM/ECF)</span>
            <Badge>Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">State Court Filing Portal</span>
            <Badge>Connected</Badge>
          </div>
          <div className="flex items-center justify-between p-2 border rounded">
            <span className="text-sm">County Clerk Systems</span>
            <Badge variant="secondary">Pending Setup</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
