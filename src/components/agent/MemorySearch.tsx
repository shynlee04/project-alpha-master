/**
 * @fileoverview Memory Search Component
 * @module components/agent/MemorySearch
 * @governance EPIC-31-1
 *
 * Search interface for conversation memory with semantic and keyword search.
 *
 * Story 31.1: Conversation Memory & Long-Term Context
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Filter, Clock, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConversationCard } from './ConversationCard';
import {
  searchByKeyword,
  type SearchResult,
  type SearchOptions,
} from '@/lib/agent/memory/memory-index';
import { getConversationStats } from '@/lib/agent/memory/conversation-memory';

interface MemorySearchProps {
  /**
   * Click handler for conversation card
   */
  onConversationClick?: (threadId: string) => void;
}

export function MemorySearch({ onConversationClick }: MemorySearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    oldestConversation: 0,
  });

  // Search options state
  const [options, setOptions] = useState<SearchOptions>({
    limit: 10,
    threshold: 0.3,
    includeExcluded: false,
    recencyBoost: 1.0,
  });

  // Show advanced filters
  const [showFilters, setShowFilters] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const conversationStats = await getConversationStats();
      setStats({
        totalConversations: conversationStats.totalConversations,
        totalMessages: conversationStats.totalMessages,
        oldestConversation: conversationStats.oldestConversation,
      });
    } catch (error) {
      console.error('Failed to load memory stats:', error);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, options]);

  const performSearch = useCallback(async () => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = await searchByKeyword(query, options);
      setResults(searchResults);
    } catch (error) {
      console.error('Memory search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, options]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleResetFilters = () => {
    setOptions({
      limit: 10,
      threshold: 0.3,
      includeExcluded: false,
      recencyBoost: 1.0,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats */}
      <div className="p-4 border-b border-border bg-panel">
        <h2 className="text-lg font-semibold text-primary mb-2">
          {t('memory.title', 'Conversation Memory')}
        </h2>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {t('memory.stats.conversations', '{{count}} conversations', {
                count: stats.totalConversations,
              })}
            </span>
          </div>

          <div>
            {t('memory.stats.messages', '{{count}} messages', {
              count: stats.totalMessages,
            })}
          </div>
        </div>
      </div>

      {/* Search input */}
      <div className="p-4 border-b border-border bg-panel">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('memory.search.placeholder', 'Search conversations...')}
            className="pl-10 pr-10"
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Advanced filters toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full justify-start"
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('memory.filters.title', 'Advanced Filters')}
        </Button>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-muted rounded-lg space-y-3">
            {/* Threshold */}
            <div>
              <label className="block text-xs font-medium text-secondary-foreground mb-1">
                {t('memory.filters.threshold', 'Relevance Threshold: {{value}}', {
                  value: Math.round(options.threshold! * 100) + '%',
                })}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={options.threshold}
                onChange={(e) => setOptions({
                  ...options,
                  threshold: parseFloat(e.target.value),
                })}
                className="w-full"
              />
            </div>

            {/* Recency boost */}
            <div>
              <label className="block text-xs font-medium text-secondary-foreground mb-1">
                {t('memory.filters.recencyBoost', 'Recency Boost: {{value}}x', {
                  value: options.recencyBoost?.toFixed(1),
                })}
              </label>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={options.recencyBoost}
                onChange={(e) => setOptions({
                  ...options,
                  recencyBoost: parseFloat(e.target.value),
                })}
                className="w-full"
              />
            </div>

            {/* Include excluded */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-excluded"
                checked={options.includeExcluded}
                onChange={(e) => setOptions({
                  ...options,
                  includeExcluded: e.target.checked,
                })}
                className="rounded"
              />
              <label
                htmlFor="include-excluded"
                className="text-xs text-secondary-foreground"
              >
                {t('memory.filters.includeExcluded', 'Include excluded conversations')}
              </label>
            </div>

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('memory.filters.reset', 'Reset Filters')}
            </Button>
          </div>
        )}
      </div>

      {/* Search results */}
      <div className="flex-1 overflow-y-auto p-4">
        {isSearching ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-3" />
            <p className="text-sm">
              {t('memory.search.searching', 'Searching...')}
            </p>
          </div>
        ) : query.length >= 2 ? (
          results.length > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground mb-3">
                {t('memory.search.results', '{{count}} results found', {
                  count: results.length,
                })}
              </p>

              {results.map((result) => (
                <ConversationCard
                  key={result.document.threadId}
                  conversation={result.document}
                  score={result.score}
                  onClick={() => onConversationClick?.(result.document.threadId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-1">
                {t('memory.search.noResults', 'No results found')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('memory.search.tryDifferent', 'Try a different search term')}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-1">
              {t('memory.search.enterQuery', 'Enter at least 2 characters to search')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('memory.search.searchTip', 'Search summaries, insights, and tags')}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-panel text-center">
        <p className="text-xs text-muted-foreground">
          {t('memory.footer.hint', 'Memory is automatically pruned after 30 days')}
        </p>
      </div>
    </div>
  );
}
