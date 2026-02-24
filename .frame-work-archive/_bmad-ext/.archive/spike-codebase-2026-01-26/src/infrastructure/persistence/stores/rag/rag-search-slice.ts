/**
 * @fileoverview RAG Search Slice - Search Queries & Results Cache
 * @module infrastructure/persistence/stores/rag/rag-search-slice
 * @governance EPIC-7-1
 *
 * Manages search queries, results, and TTL-based cache.
 * Integrates with Orama for vector + keyword hybrid search.
 */

import { StateCreator } from 'zustand';
import type { SearchResult } from '@/lib/rag/types';
import type { RAGSearchState, CachedSearchResult } from './rag-types';
import { generateCacheKey, isCacheValid, cleanExpiredCache, enforceCacheLimit } from './rag-helpers';

// Constants from December 2025 best practices
const SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum cached searches

/**
 * Search slice - manages search queries and results cache
 */
export const createRAGSearchSlice: StateCreator<RAGSearchState> = (set, get) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  searchMode: 'hybrid',
  searchCache: new Map(),
  loading: false,
  error: null,

  // Actions

  setSearchQuery: (query: string) => {
    set({ searchQuery: query } as Partial<RAGSearchState>);
  },

  setSearchMode: (mode: import('@/lib/rag/types').SearchMode) => {
    set({ searchMode: mode } as Partial<RAGSearchState>);
  },

  /**
   * Execute search with caching
   * Uses Orama hybrid search (vector + keyword)
   */
  search: async (
    projectId: string,
    query: string,
    searchFn: () => Promise<SearchResult[]>
  ) => {
    const cacheKey = generateCacheKey(projectId, query);
    const currentCache = get().searchCache;

    // Check cache
    const cached = currentCache.get(cacheKey);
    if (cached && isCacheValid(cached, SEARCH_CACHE_TTL)) {
      console.log('[RAGSearchSlice] Cache hit for query:', query);
      set({ searchResults: cached.results, searchQuery: query } as Partial<RAGSearchState>);
      return cached.results;
    }

    // Perform search
    set({ loading: true, error: null } as Partial<RAGSearchState>);
    try {
      const results = await searchFn();

      // Update cache
      set((state) => {
        let newCache = new Map(state.searchCache);
        newCache.set(cacheKey, {
          query,
          results,
          timestamp: Date.now(),
        } as CachedSearchResult);

        // Clean expired entries and enforce size limit
        newCache = cleanExpiredCache(newCache, SEARCH_CACHE_TTL);
        newCache = enforceCacheLimit(newCache, MAX_CACHE_SIZE);

        return {
          searchCache: newCache,
          searchResults: results,
          searchQuery: query,
          loading: false,
        } as Partial<RAGSearchState>;
      });

      return results;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      } as Partial<RAGSearchState>);
      return [];
    }
  },

  clearSearchCache: () => {
    set({ searchCache: new Map() } as Partial<RAGSearchState>);
  },

  setError: (error: string | null) => {
    set({ error } as Partial<RAGSearchState>);
  },

  clearError: () => {
    set({ error: null } as Partial<RAGSearchState>);
  },

  /**
   * Composed search operation - wrapper for business logic
   * Handles search with default options and error handling
   */
  performSearch: async (
    projectId: string,
    query: string,
    _mode: import('@/lib/rag/types').SearchMode,
    _limit: number = 10
  ) => {
    // Get search function based on mode
    const searchFn = async (): Promise<SearchResult[]> => {
      // This will be implemented by the Orama integration layer
      // For now, return empty array to avoid type errors
      return [];
    };

    return get().search(projectId, query, searchFn);
  },
});
