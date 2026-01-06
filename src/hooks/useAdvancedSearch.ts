/**
 * @fileoverview Advanced Search Hook
 * @module hooks/useAdvancedSearch
 *
 * React hook for advanced search with filters and debouncing.
 * Provides state management for search queries, filters, and results.
 *
 * @story S-027 Advanced Search with Filters
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SearchIndexer,
  type SearchDocument,
  type SearchFilters,
  type SearchResult,
  type SearchOptions,
} from '@/lib/search/search-indexer';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: Date;
  lastUsed: Date;
}

export interface UseAdvancedSearchOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;

  /** Maximum results */
  maxResults?: number;

  /** Auto-index flag */
  autoIndex?: boolean;
}

export interface UseAdvancedSearchReturn {
  /** Search query */
  query: string;

  /** Set search query */
  setQuery: (query: string) => void;

  /** Search filters */
  filters: SearchFilters;

  /** Set filters */
  setFilters: (filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => void;

  /** Search results */
  results: SearchResult[];

  /** Loading state */
  isLoading: boolean;

  /** Error */
  error: string | null;

  /** Total results count */
  resultCount: number;

  /** Current page */
  page: number;

  /** Set page */
  setPage: (page: number) => void;

  /** Results per page */
  perPage: number;

  /** Sort option */
  sortBy: 'relevance' | 'date' | 'name';

  /** Set sort option */
  setSortBy: (sortBy: 'relevance' | 'date' | 'name') => void;

  /** Grouped results */
  groupedResults: Map<string, SearchResult[]>;

  /** Saved searches */
  savedSearches: SavedSearch[];

  /** Save current search */
  saveSearch: (name: string) => void;

  /** Load saved search */
  loadSearch: (id: string) => void;

  /** Delete saved search */
  deleteSearch: (id: string) => void;

  /** Clear search */
  clearSearch: () => void;

  /** Index statistics */
  indexStats: {
    documentCount: number;
    tokenCount: number;
    trigramCount: number;
  };

  /** Rebuild index */
  rebuildIndex: (documents: SearchDocument[]) => void;
}

const STORAGE_KEY = 'advanced-search-saved';

/**
 * Hook for advanced search functionality
 */
export function useAdvancedSearch(
  options: UseAdvancedSearchOptions = {}
): UseAdvancedSearchReturn {
  const { debounceMs = 300, maxResults = 100, autoIndex = true } = options;

  // Search state
  const [query, setQueryState] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'name'>('relevance');

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Refs
  const debounceRef = useRef<NodeJS.Timeout>();
  const searchAbortRef = useRef<AbortController>();

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedSearches(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          lastUsed: new Date(s.lastUsed),
        })));
      }
    } catch (err) {
      console.error('Failed to load saved searches:', err);
    }
  }, []);

  // Debounced search
  const performSearch = useCallback(() => {
    // Cancel previous search
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    // Create new abort controller
    searchAbortRef.current = new AbortController();
    const { signal } = searchAbortRef.current;

    if (!query.trim() && Object.keys(filters).length === 0) {
      setResults([]);
      setPage(1);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use setTimeout to allow abort checking
    setTimeout(() => {
      if (signal.aborted) return;

      try {
        const searchOptions: SearchOptions = {
          maxResults,
          previewLength: 100,
        };

        const searchResults = SearchIndexer.search(
          query,
          filters,
          searchOptions
        );

        let sortedResults = [...searchResults];

        // Apply sorting
        switch (sortBy) {
          case 'date':
            sortedResults.sort((a, b) =>
              b.document.modifiedAt.getTime() - a.document.modifiedAt.getTime()
            );
            break;
          case 'name':
            sortedResults.sort((a, b) =>
              a.document.filename.localeCompare(b.document.filename)
            );
            break;
          case 'relevance':
          default:
            // Already sorted by relevance
            break;
        }

        setResults(sortedResults);
        setPage(1);
      } catch (err) {
        if (!signal.aborted) {
          const message = err instanceof Error ? err.message : 'Search failed';
          setError(message);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 0);
  }, [query, filters, maxResults, sortBy]);

  // Debounce effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch();
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [performSearch, debounceMs]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  // Set query
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Set filters
  const setFilters = useCallback((newFilters: SearchFilters | ((prev: SearchFilters) => SearchFilters)) => {
    setFiltersState(prev => ({
      ...prev,
      ...(typeof newFilters === 'function' ? newFilters(prev) : newFilters),
    }));
  }, []);

  // Save current search
  const saveSearch = useCallback((name: string) => {
    const savedSearch: SavedSearch = {
      id: `search-${Date.now()}`,
      name,
      query,
      filters,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    setSavedSearches(prev => {
      const updated = [savedSearch, ...prev];
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save searches:', err);
      }
      return updated;
    });
  }, [query, filters]);

  // Load saved search
  const loadSearch = useCallback((id: string) => {
    const search = savedSearches.find(s => s.id === id);
    if (search) {
      setQuery(search.query);
      setFilters(search.filters);

      // Update last used
      setSavedSearches(prev => {
        const updated = prev.map(s =>
          s.id === id
            ? { ...s, lastUsed: new Date() }
            : s
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to update searches:', err);
        }
        return updated;
      });
    }
  }, [savedSearches, setQuery, setFilters]);

  // Delete saved search
  const deleteSearch = useCallback((id: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to delete search:', err);
      }
      return updated;
    });
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
    setPage(1);
    setError(null);
  }, [setQuery, setFilters]);

  // Group results by project/folder
  const groupedResults = new Map<string, SearchResult[]>();
  results.forEach(result => {
    const key = result.document.projectId || result.document.path.split('/')[0] || 'root';
    if (!groupedResults.has(key)) {
      groupedResults.set(key, []);
    }
    groupedResults.get(key)!.push(result);
  });

  // Calculate index stats
  const indexStats = SearchIndexer.getStats();

  // Rebuild index
  const rebuildIndex = useCallback((documents: SearchDocument[]) => {
    SearchIndexer.clear();
    documents.forEach(doc => SearchIndexer.indexDocument(doc));
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    error,
    resultCount: results.length,
    page,
    setPage,
    perPage,
    sortBy,
    setSortBy,
    groupedResults,
    savedSearches,
    saveSearch,
    loadSearch,
    deleteSearch,
    clearSearch,
    indexStats,
    rebuildIndex,
  };
}
