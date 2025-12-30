/**
 * @fileoverview RAG Search Panel Component
 * @module components/rag/RAGSearchPanel
 * @governance EPIC-7-WIRE
 *
 * Search interface for RAG-powered knowledge base queries.
 * Supports keyword, semantic, and hybrid search modes.
 */

import { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Database, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ExtendedSearchResult, SearchMode } from '@/lib/rag/types';

interface RAGSearchPanelProps {
  /** Current search query */
  query: string;
  /** Search results to display */
  results: ExtendedSearchResult[];
  /** Current search mode */
  mode: SearchMode;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Number of documents indexed */
  documentCount: number;
  /** Total documents being indexed (for progress) */
  totalDocuments?: number;
  /** Index status */
  indexStatus?: 'idle' | 'building' | 'ready' | 'error';
  /** Called when search query changes */
  onQueryChange: (query: string) => void;
  /** Called when search is submitted */
  onSearch: (query: string) => void;
  /** Called when search mode changes */
  onModeChange: (mode: SearchMode) => void;
  /** Called when a result is clicked */
  onResultClick?: (result: ExtendedSearchResult) => void;
}

/**
 * Format score as percentage
 */
function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Highlight matched terms in text
 */
function HighlightedText({ text }: { text: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHTML: HTML is sanitized from search results
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

/**
 * RAGSearchPanel - Search interface for knowledge base queries
 */
export const RAGSearchPanel = memo(function RAGSearchPanel({
  query,
  results,
  mode,
  loading,
  error,
  documentCount,
  totalDocuments,
  indexStatus = 'idle',
  onQueryChange,
  onSearch,
  onModeChange,
  onResultClick,
}: RAGSearchPanelProps) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState(query);

  const handleQueryChange = useCallback((value: string) => {
    setLocalQuery(value);
    onQueryChange(value);
  }, [onQueryChange]);

  const handleSearch = useCallback(() => {
    onSearch(localQuery);
  }, [localQuery, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setLocalQuery('');
      onQueryChange('');
    }
  }, [handleSearch, onQueryChange]);

  const handleModeChange = useCallback((value: string) => {
    onModeChange(value as SearchMode);
  }, [onModeChange]);

  const handleResultClick = useCallback((result: ExtendedSearchResult) => {
    onResultClick?.(result);
  }, [onResultClick]);

  return (
    <div className="flex flex-col h-full bg-background border-2 border-border rounded-none">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono font-bold text-sm flex items-center gap-2">
            <Search size={14} className="text-primary" />
            {t('rag.search.title', 'Semantic Search')}
          </h3>
          <IndexStatusBadge
            status={indexStatus}
            documentCount={documentCount}
            totalDocuments={totalDocuments}
          />
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('rag.search.placeholder', 'Search your knowledge base...')}
              className="pr-10 border-2 border-input rounded-none"
              disabled={loading}
            />
            {loading && (
              <Loader2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
              />
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !localQuery.trim()}
            className="border-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          >
            {t('action.search', 'Search')}
          </Button>
        </div>

        {/* Search Mode Selector */}
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-muted-foreground">
            {t('rag.search.mode.label', 'Search Mode')}
          </label>
          <Select value={mode} onValueChange={handleModeChange}>
            <SelectTrigger className="h-7 text-xs border-2 rounded-none w-auto min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword">
                {t('rag.search.mode.keyword', 'Keyword')}
              </SelectItem>
              <SelectItem value="semantic">
                {t('rag.search.mode.semantic', 'Semantic')}
              </SelectItem>
              <SelectItem value="hybrid">
                {t('rag.search.mode.hybrid', 'Hybrid')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-3 mt-3 p-2 border-2 border-destructive bg-destructive/10 rounded-none flex items-center gap-2">
          <AlertCircle size={14} className="text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span>{t('rag.search.loading', 'Searching...')}</span>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              {t('rag.search.results.count', '{{count}} results found', {
                count: results.length,
              })}
            </p>
            {results.map((result) => (
              <SearchResultCard
                key={result.document.id}
                result={result}
                onClick={() => handleResultClick(result)}
              />
            ))}
          </>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search size={32} className="mb-2 opacity-50" />
            <p>{t('rag.search.results.empty', 'No results found')}</p>
            <p className="text-xs mt-1">
              {t('rag.search.results.hint', 'Try different keywords or search mode')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Database size={32} className="mb-2 opacity-50" />
            <p>{t('rag.search.placeholder', 'Search your knowledge base...')}</p>
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Index Status Badge Component
 */
function IndexStatusBadge({
  status,
  documentCount,
  totalDocuments,
}: {
  status: string;
  documentCount: number;
  totalDocuments?: number;
}) {
  const { t } = useTranslation();

  if (status === 'building' && totalDocuments) {
    return (
      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-none animate-pulse">
        {t('rag.index.status.building', 'Indexing: {{current}} of {{total}}', {
          current: documentCount,
          total: totalDocuments,
        })}
      </span>
    );
  }

  if (status === 'ready' && documentCount > 0) {
    return (
      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 border border-green-300 rounded-none">
        {t('rag.index.status.ready', 'Index Ready')}
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-none">
        {t('rag.index.status.error', 'Index Error')}
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-300 rounded-none">
      {t('rag.index.status.empty', 'No Index')}
    </span>
  );
}

/**
 * Search Result Card Component
 */
function SearchResultCard({
  result,
  onClick,
}: {
  result: ExtendedSearchResult;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 border-2 border-border bg-surface hover:bg-surface-darker transition-colors rounded-none group"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
          {result.document.title || t('rag.search.untitled', 'Untitled')}
        </h4>
        <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-none flex-shrink-0">
          {formatScore(result.score)}
        </span>
      </div>
      {result.highlightedText && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          <HighlightedText text={result.highlightedText} />
        </p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">
          {result.source.title || result.source.id}
        </span>
        {result.matchedTerms.length > 0 && (
          <span className="text-xs px-1 py-0.5 bg-muted rounded-none">
            {result.matchedTerms.slice(0, 3).join(', ')}
          </span>
        )}
      </div>
    </button>
  );
}

export default RAGSearchPanel;
