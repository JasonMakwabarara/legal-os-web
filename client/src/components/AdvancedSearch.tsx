import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Star,
  Trash2,
  Share2,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface SearchFilter {
  documentType?: string;
  riskLevel?: 'high' | 'medium' | 'low';
  dateRange?: { from: Date; to: Date };
  minRelevance?: number;
}

interface SearchResult {
  id: string;
  documentName: string;
  documentType: string;
  excerpt: string;
  relevance: number;
  riskLevel: 'high' | 'medium' | 'low';
  lastModified: Date;
  isSaved?: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  createdAt: Date;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    documentName: 'Service Agreement - Acme Corp',
    documentType: 'Contract',
    excerpt: 'The service provider shall maintain all confidential information in accordance with applicable laws and regulations...',
    relevance: 98,
    riskLevel: 'medium',
    lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    documentName: 'NDA - Tech Startup Inc',
    documentType: 'Legal Brief',
    excerpt: 'Confidentiality obligations extend to all parties involved in the transaction, including advisors and consultants...',
    relevance: 92,
    riskLevel: 'low',
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    documentName: 'Employment Contract - Senior Developer',
    documentType: 'Contract',
    excerpt: 'The employee agrees to maintain confidentiality regarding trade secrets and proprietary information...',
    relevance: 87,
    riskLevel: 'high',
    lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

const mockSavedSearches: SavedSearch[] = [
  {
    id: 's1',
    name: 'Confidentiality Clauses',
    query: 'confidential information',
    filters: { riskLevel: 'high' },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 's2',
    name: 'Liability Limitations',
    query: 'limitation of liability',
    filters: { documentType: 'Contract' },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(mockSavedSearches);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  const filteredResults = useMemo(() => {
    return mockSearchResults.filter((result) => {
      if (searchQuery && !result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filters.documentType && result.documentType !== filters.documentType) {
        return false;
      }
      if (filters.riskLevel && result.riskLevel !== filters.riskLevel) {
        return false;
      }
      if (filters.minRelevance && result.relevance < filters.minRelevance) {
        return false;
      }
      return true;
    });
  }, [searchQuery, filters]);

  const handleSaveSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    const newSavedSearch: SavedSearch = {
      id: `s${Date.now()}`,
      name: searchQuery,
      query: searchQuery,
      filters,
      createdAt: new Date(),
    };

    setSavedSearches([newSavedSearch, ...savedSearches]);
  }, [searchQuery, filters, savedSearches]);

  const handleDeleteSavedSearch = useCallback((id: string) => {
    setSavedSearches(savedSearches.filter((s) => s.id !== id));
  }, [savedSearches]);

  const handleApplySavedSearch = useCallback((search: SavedSearch) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    setShowSavedSearches(false);
  }, []);

  const toggleResultSelection = useCallback((id: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResults(newSelected);
  }, [selectedResults]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'low':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      default:
        return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-white">Advanced Document Search</h2>
        <p className="text-slate-400">
          Search across all your documents with powerful filtering and AI-powered insights
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search contracts, clauses, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:border-blue-500/50 transition-colors flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSavedSearches(!showSavedSearches)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 hover:border-blue-500/50 transition-colors flex items-center gap-2"
        >
          <Clock className="w-5 h-5" />
          Saved
        </motion.button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 space-y-4"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {/* Document Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Document Type</label>
                <select
                  value={filters.documentType || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, documentType: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">All Types</option>
                  <option value="Contract">Contract</option>
                  <option value="Legal Brief">Legal Brief</option>
                  <option value="Memo">Memo</option>
                </select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Risk Level</label>
                <select
                  value={filters.riskLevel || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      riskLevel: (e.target.value as any) || undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">All Levels</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
              </div>

              {/* Relevance Filter */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Min. Relevance: {filters.minRelevance || 0}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minRelevance || 0}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRelevance: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setFilters({})}
                className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Searches */}
      <AnimatePresence>
        {showSavedSearches && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4"
          >
            <h3 className="font-semibold text-white mb-3">Saved Searches</h3>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <button
                    onClick={() => handleApplySavedSearch(search)}
                    className="flex-1 text-left"
                  >
                    <p className="text-white font-medium">{search.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteSavedSearch(search.id)}
                    className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {(searchQuery || Object.keys(filters).length > 0) && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm flex items-center gap-2">
              {searchQuery}
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-blue-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.documentType && (
            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm flex items-center gap-2">
              Type: {filters.documentType}
              <button
                onClick={() => setFilters({ ...filters, documentType: undefined })}
                className="hover:text-purple-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.riskLevel && (
            <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm flex items-center gap-2">
              Risk: {filters.riskLevel}
              <button
                onClick={() => setFilters({ ...filters, riskLevel: undefined })}
                className="hover:text-yellow-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="text-slate-400 text-sm">
        Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
        {selectedResults.size > 0 && ` • ${selectedResults.size} selected`}
      </div>

      {/* Bulk Actions */}
      {selectedResults.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share ({selectedResults.size})
          </Button>
          <Button className="bg-slate-700 hover:bg-slate-600 text-white text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export ({selectedResults.size})
          </Button>
        </motion.div>
      )}

      {/* Search Results */}
      <div className="space-y-3">
        {filteredResults.map((result, idx) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              onClick={() => toggleResultSelection(result.id)}
              className={`bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50 backdrop-blur-xl p-4 cursor-pointer transition-all ${
                selectedResults.has(result.id) ? 'border-blue-500/50 bg-blue-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedResults.has(result.id)}
                  onChange={() => toggleResultSelection(result.id)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{result.documentName}</h3>
                      <p className="text-xs text-slate-400">{result.documentType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${getRiskColor(result.riskLevel)}`}>
                        {getRiskIcon(result.riskLevel)}
                        {result.riskLevel}
                      </div>
                    </div>
                  </div>

                  {/* Excerpt with Highlighting */}
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                    {result.excerpt}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Relevance: {result.relevance}%</span>
                      <span>Modified: {result.lastModified.toLocaleDateString()}</span>
                    </div>
                    <button className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-yellow-400 transition-colors">
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Save Search CTA */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between"
        >
          <p className="text-slate-300">Save this search for quick access later</p>
          <Button
            onClick={handleSaveSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Save Search
          </Button>
        </motion.div>
      )}
    </div>
  );
}
