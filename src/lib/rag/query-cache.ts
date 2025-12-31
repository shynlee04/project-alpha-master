/**
 * @fileoverview RAG Query Cache
 * @module lib/rag/query-cache
 * @governance EPIC-32-4
 *
 * Query result caching layer with configurable TTL for RAG queries.
 * Provides in-memory caching with automatic expiration for optimized query performance.
 */

import type { SearchResult } from './types';

/**
 * Query cache entry with expiration tracking
 */
interface QueryCacheEntry {
  /** Original query string */
  query: string;
  /** Cached search results */
  results: SearchResult[];
  /** Timestamp when entry was created */
  timestamp: number;
  /** Timestamp when entry expires */
  expiresAt: number;
}

/**
 * Configuration options for RAG query cache
 */
interface QueryCacheConfig {
  /** Time-to-live in milliseconds (default: 5 minutes = 300000ms) */
  ttl?: number;
  /** Maximum number of cache entries (default: 100) */
  maxEntries?: number;
  /** Enable automatic pruning of expired entries */
  autoPrune?: boolean;
}

/**
 * RAG Query Cache
 *
 * Provides in-memory caching for RAG query results with configurable TTL.
 * Supports automatic pruning of expired entries to manage memory usage.
 *
 * @example
 * ```typescript
 * const cache = new RAGQueryCache({ ttl: 300000 }); // 5 minutes
 * const results = cache.get("machine learning");
 * if (results) {
 *   console.log("Cache hit!");
 * } else {
 *   // Perform search and cache results
 *   cache.set("machine learning", searchResults);
 * }
 * ```
 */
export class RAGQueryCache {
  private cache: Map<string, QueryCacheEntry>;
  private ttl: number;
  private maxEntries: number;
  private autoPrune: boolean;

  /**
   * Create a new RAG query cache
   * @param config - Configuration options
   */
  constructor(config: QueryCacheConfig = {}) {
    this.cache = new Map();
    this.ttl = config.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.maxEntries = config.maxEntries ?? 100;
    this.autoPrune = config.autoPrune ?? true;
  }

  /**
   * Get cached results for a query
   * Returns null if cache miss or entry expired
   *
   * @param query - The query string to look up
   * @returns Cached results or null if not found/expired
   */
  get(query: string): SearchResult[] | null {
    const normalizedQuery = this.normalizeQuery(query);
    const entry = this.cache.get(normalizedQuery);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normalizedQuery);
      return null;
    }

    return entry.results;
  }

  /**
   * Store query results in cache
   *
   * @param query - The query string
   * @param results - Search results to cache
   */
  set(query: string, results: SearchResult[]): void {
    const normalizedQuery = this.normalizeQuery(query);
    const now = Date.now();

    const entry: QueryCacheEntry = {
      query: normalizedQuery,
      results,
      timestamp: now,
      expiresAt: now + this.ttl,
    };

    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxEntries) {
      this.evictOldestEntries(this.cache.size - this.maxEntries + 1);
    }

    this.cache.set(normalizedQuery, entry);
  }

  /**
   * Invalidate cache entry for a specific query
   *
   * @param query - The query string to invalidate
   */
  invalidate(query: string): void {
    const normalizedQuery = this.normalizeQuery(query);
    this.cache.delete(normalizedQuery);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove all expired entries from cache
   * Returns count of removed entries
   *
   * @returns Number of expired entries removed
   */
  pruneExpired(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [query, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(query);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Get cache statistics for debugging/monitoring
   *
   * @returns Object containing cache statistics
   */
  getStats(): {
    size: number;
    maxEntries: number;
    ttl: number;
    hitRate: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      ttl: this.ttl,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? this.stats.hits / (this.stats.hits + this.stats.misses)
        : 0,
      hits: this.stats.hits,
      misses: this.stats.misses,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get all cached queries (for debugging)
   *
   * @returns Array of cached query strings
   */
  getCachedQueries(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if a query is currently cached
   *
   * @param query - The query string to check
   * @returns True if query is cached and not expired
   */
  has(query: string): boolean {
    return this.get(query) !== null;
  }

  /**
   * Normalize query string for consistent caching
   * Trims whitespace and converts to lowercase
   *
   * @param query - Original query string
   * @returns Normalized query string
   */
  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase();
  }

  /**
   * Remove oldest entries to make room for new entries
   *
   * @param count - Number of entries to remove
   */
  private evictOldestEntries(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private stats = { hits: 0, misses: 0 };
}

/**
 * Create a debounced search function that wraps a search implementation
 * with caching and debouncing for rapid successive queries
 *
 * @param searchFn - The actual search function to debounce
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @param cache - Optional cache instance to use
 * @returns Debounced search function
 *
 * @example
 * ```typescript
 * const debouncedSearch = createDebouncedSearch(
 *   async (query) => await hybridSearch.search(query),
 *   300,
 *   cache
 * );
 *
 * // Multiple rapid calls will be debounced
 * debouncedSearch("machine learning");
 * debouncedSearch("machine learning"); // Will wait for first to complete
 * ```
 */
export function createDebouncedSearch(
  searchFn: (query: string) => Promise<SearchResult[]>,
  delay: number = 300,
  cache?: RAGQueryCache
): (query: string) => Promise<SearchResult[]> {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingQuery: string | null = null;
  let pendingResolve: ((results: SearchResult[]) => void) | null = null;

  return async (query: string): Promise<SearchResult[]> => {
    // Check cache first
    if (cache) {
      const cached = cache.get(query);
      if (cached) {
        return cached;
      }
    }

    return new Promise<SearchResult[]>((resolve) => {
      // If there's a pending request for the same query, just update the resolver
      if (debounceTimer && pendingQuery === query) {
        pendingResolve = resolve;
        return;
      }

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set up new debounced request
      pendingQuery = query;
      pendingResolve = resolve;

      debounceTimer = setTimeout(async () => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }

        try {
          const results = await searchFn(query);
          
          // Cache the results
          if (cache) {
            cache.set(query, results);
          }

          // Resolve pending request
          if (pendingResolve) {
            pendingResolve(results);
          }
          pendingResolve = null;
          pendingQuery = null;
        } catch (error) {
          // On error, still resolve with empty results
          const emptyResults: SearchResult[] = [];
          if (pendingResolve) {
            pendingResolve(emptyResults);
          }
          pendingResolve = null;
          pendingQuery = null;
        }
      }, delay);
    });
  };
}
