import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Eye, TrendingUp, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ClauseFilter {
  category?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  jurisdiction?: string;
  industry?: string;
}

export function ClauseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClauseFilter>({});
  const [selectedClauseId, setSelectedClauseId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = trpc.clauses.search.useQuery(
    { searchTerm, ...filters },
    { enabled: searchTerm.length > 0 }
  );

  const listQuery = trpc.clauses.list.useQuery();
  const topUsedQuery = trpc.clauses.getTopUsed.useQuery({ limit: 5 });
  const trackUsageMutation = trpc.clauses.trackUsage.useMutation();

  const clauses = searchTerm.length > 0 ? searchQuery.data || [] : listQuery.data || [];
  const topUsedClauses = topUsedQuery.data || [];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    clauses.forEach(c => cats.add(c.category));
    return Array.from(cats).sort();
  }, [clauses]);

  const handleCopyClause = async (clauseId: number) => {
    try {
      await trackUsageMutation.mutateAsync({
        clauseId,
        usageType: 'copied',
      });
      // Copy to clipboard
      const clause = clauses.find(c => c.id === clauseId);
      if (clause) {
        await navigator.clipboard.writeText(clause.content);
        alert('Clause copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy clause:', error);
    }
  };

  const handleViewClause = async (clauseId: number) => {
    try {
      await trackUsageMutation.mutateAsync({
        clauseId,
        usageType: 'viewed',
      });
      setSelectedClauseId(clauseId);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const selectedClause = clauses.find(c => c.id === selectedClauseId);

  const getRiskColor = (level: string) => {
    const colors: Record<string, 'default' | 'secondary' | 'destructive'> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return colors[level] || 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Legal Clauses Library</h2>
        <p className="text-muted-foreground">
          Search and manage reusable legal clauses with categorization and usage analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Search Clauses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clauses by title, content, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value || undefined })
                      }
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <select
                      value={filters.riskLevel || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, riskLevel: (e.target.value as any) || undefined })
                      }
                      className="w-full mt-1 px-2 py-1 text-sm border rounded"
                    >
                      <option value="">All Levels</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Jurisdiction</label>
                    <Input
                      placeholder="e.g., US, UK, EU"
                      value={filters.jurisdiction || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, jurisdiction: e.target.value || undefined })
                      }
                      className="mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Industry</label>
                    <Input
                      placeholder="e.g., tech, finance"
                      value={filters.industry || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, industry: e.target.value || undefined })
                      }
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clauses List */}
          <div className="space-y-3">
            {clauses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {searchTerm ? 'No clauses found matching your search' : 'No clauses available'}
                </CardContent>
              </Card>
            ) : (
              clauses.map(clause => (
                <Card
                  key={clause.id}
                  className={`cursor-pointer transition-colors ${
                    selectedClauseId === clause.id ? 'border-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{clause.title}</CardTitle>
                        <CardDescription>{clause.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewClause(clause.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyClause(clause.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{clause.category}</Badge>
                      {clause.subcategory && (
                        <Badge variant="outline">{clause.subcategory}</Badge>
                      )}
                      <Badge variant={getRiskColor(clause.riskLevel || 'medium')}>
                        {clause.riskLevel || 'medium'} risk
                      </Badge>
                      {clause.jurisdiction && (
                        <Badge variant="outline">{clause.jurisdiction}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {clause.usageCount || 0} uses
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected Clause Details */}
          {selectedClause && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Clause Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{selectedClause.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedClause.description}
                  </p>
                  <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                    {selectedClause.content}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleCopyClause(selectedClause.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full Clause
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Top Used Clauses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Used Clauses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topUsedClauses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No usage data yet</p>
              ) : (
                topUsedClauses.map((clause, idx) => (
                  <div
                    key={clause.id}
                    className="p-2 rounded bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => handleViewClause(clause.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{clause.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {clause.usageCount || 0}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
