import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Share2, Lock, Eye } from 'lucide-react';

interface SharedDocument {
  id: number;
  title: string;
  sharedWith: string;
  firmName: string;
  accessLevel: 'view' | 'edit' | 'admin';
  sharedDate: Date;
  expiresAt?: Date;
}

export function CrossFirmCollaboration() {
  const [sharedDocs, setSharedDocs] = useState<SharedDocument[]>([
    {
      id: 1,
      title: 'Joint Venture Agreement',
      sharedWith: 'partner@lawfirm.com',
      firmName: 'Smith & Associates',
      accessLevel: 'edit',
      sharedDate: new Date('2026-04-20'),
      expiresAt: new Date('2026-05-20'),
    },
    {
      id: 2,
      title: 'Settlement Proposal',
      sharedWith: 'counsel@opposing.com',
      firmName: 'Opposing Counsel LLC',
      accessLevel: 'view',
      sharedDate: new Date('2026-04-18'),
    },
  ]);

  const [newShare, setNewShare] = useState({ email: '', accessLevel: 'view' as const });

  const handleShare = () => {
    if (newShare.email) {
      // TODO: Call API to share document
      setNewShare({ email: '', accessLevel: 'view' });
    }
  };

  const getAccessIcon = (level: string) => {
    return level === 'edit' ? <Share2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
  };

  const getAccessBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      view: 'secondary',
      edit: 'default',
      admin: 'destructive',
    };
    return variants[level] || 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Cross-Firm Collaboration</h2>
        <p className="text-muted-foreground">
          Securely share documents and collaborate with external firms
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Share New Document
          </CardTitle>
          <CardDescription>Invite external firms to collaborate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient Email</label>
            <Input
              placeholder="partner@lawfirm.com"
              value={newShare.email}
              onChange={e => setNewShare({ ...newShare, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Access Level</label>
            <div className="flex gap-2">
              {['view', 'edit', 'admin'].map(level => (
                <Button
                  key={level}
                  variant={newShare.accessLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewShare({ ...newShare, accessLevel: level as any })}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={handleShare} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Document
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Active Collaborations
          </CardTitle>
          <CardDescription>{sharedDocs.length} documents shared</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sharedDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {doc.firmName}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shared with: {doc.sharedWith}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getAccessBadge(doc.accessLevel)}>
                    <span className="flex items-center gap-1">
                      {getAccessIcon(doc.accessLevel)}
                      {doc.accessLevel.charAt(0).toUpperCase() + doc.accessLevel.slice(1)}
                    </span>
                  </Badge>
                  {doc.expiresAt && (
                    <Badge variant="outline" className="text-xs">
                      Expires {doc.expiresAt.toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✓ End-to-end encryption for all shared documents</p>
          <p>✓ Audit trail of all access and modifications</p>
          <p>✓ Automatic expiration of access links</p>
          <p>✓ IP-based access restrictions available</p>
          <p>✓ GDPR and data protection compliant</p>
        </CardContent>
      </Card>
    </div>
  );
}
