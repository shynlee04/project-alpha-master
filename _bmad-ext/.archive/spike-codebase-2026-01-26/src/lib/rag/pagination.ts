/**
 * @fileoverview RAG Pagination Utilities
 * @module lib/rag/pagination
 * @governance EPIC-32-4
 *
 * Pagination utilities for RAG query results with configurable page size
 * and navigation controls.
 */

import type { SearchResult } from './types';

/**
 * Paginated results container
 */
export interface PaginatedResults<T> {
  /** Items on current page */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Pagination configuration options
 */
export interface PaginationConfig {
  /** Default page size (default: 10) */
  defaultPageSize?: number;
  /** Maximum page size allowed (default: 100) */
  maxPageSize?: number;
  /** Minimum page size allowed (default: 1) */
  minPageSize?: number;
}

/**
 * Create paginated results from a list of items
 *
 * @param items - Full list of items to paginate
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated results object
 *
 * @example
 * ```typescript
 * const allResults = await search("machine learning");
 * const paginated = paginateResults(allResults, 1, 10);
 * console.log(paginated.items); // First 10 results
 * console.log(paginated.hasNextPage); // true if more results
 * ```
 */
export function paginateResults<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResults<T> {
  // Validate inputs
  const validatedPage = Math.max(1, Math.round(page));
  const validatedPageSize = Math.max(1, Math.min(100, Math.round(pageSize)));

  const total = items.length;
  const totalPages = Math.ceil(total / validatedPageSize);

  // Ensure page is within bounds
  const validPage = Math.min(validatedPage, Math.max(1, totalPages || 1));

  // Calculate slice indices
  const startIndex = (validPage - 1) * validatedPageSize;
  const endIndex = Math.min(startIndex + validatedPageSize, total);

  // Get items for current page
  const pageItems = items.slice(startIndex, endIndex);

  return {
    items: pageItems,
    total,
    page: validPage,
    pageSize: validatedPageSize,
    totalPages: Math.max(1, totalPages),
    hasNextPage: validPage < totalPages,
    hasPreviousPage: validPage > 1,
  };
}

/**
 * Create a pagination controller for managing stateful pagination
 *
 * @param config - Pagination configuration
 * @returns Pagination controller instance
 *
 * @example
 * ```typescript
 * const pagination = createPaginationController({ defaultPageSize: 10 });
 * const results = await search(query);
 * pagination.setTotal(results.length);
 * const page1 = pagination.getPage(1);
 * const page2 = pagination.getPage(2);
 * ```
 */
export function createPaginationController(config: PaginationConfig = {}) {
  const defaultPageSize = config.defaultPageSize ?? 10;
  const maxPageSize = config.maxPageSize ?? 100;
  const minPageSize = config.minPageSize ?? 1;

  let totalItems = 0;
  let currentPageSize = defaultPageSize;
  let currentPage = 1;

  return {
    /**
     * Set total number of items
     */
    setTotal(total: number): void {
      totalItems = Math.max(0, total);
    },

    /**
     * Set page size
     */
    setPageSize(size: number): void {
      currentPageSize = Math.max(minPageSize, Math.min(maxPageSize, Math.round(size)));
      // Reset to first page when page size changes
      currentPage = 1;
    },

    /**
     * Get current page size
     */
    getPageSize(): number {
      return currentPageSize;
    },

    /**
     * Get total number of pages
     */
    getTotalPages(): number {
      return Math.max(1, Math.ceil(totalItems / currentPageSize));
    },

    /**
     * Get current page number
     */
    getCurrentPage(): number {
      return currentPage;
    },

    /**
     * Navigate to specific page
     */
    goToPage(page: number): PaginatedResults<SearchResult> | null {
      const totalPages = this.getTotalPages();
      const validPage = Math.max(1, Math.min(page, totalPages));
      currentPage = validPage;
      return null; // Will be filled when items are set
    },

    /**
     * Navigate to next page
     */
    nextPage(): PaginatedResults<SearchResult> | null {
      const totalPages = this.getTotalPages();
      if (currentPage < totalPages) {
        currentPage++;
        return null;
      }
      return null;
    },

    /**
     * Navigate to previous page
     */
    previousPage(): PaginatedResults<SearchResult> | null {
      if (currentPage > 1) {
        currentPage--;
        return null;
      }
      return null;
    },

    /**
     * Navigate to first page
     */
    firstPage(): PaginatedResults<SearchResult> | null {
      currentPage = 1;
      return null;
    },

    /**
     * Navigate to last page
     */
    lastPage(): PaginatedResults<SearchResult> | null {
      currentPage = this.getTotalPages();
      return null;
    },

    /**
     * Check if next page is available
     */
    hasNextPage(): boolean {
      return currentPage < this.getTotalPages();
    },

    /**
     * Check if previous page is available
     */
    hasPreviousPage(): boolean {
      return currentPage > 1;
    },

    /**
     * Get page info
     */
    getPageInfo(): {
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    } {
      return {
        page: currentPage,
        pageSize: currentPageSize,
        totalPages: this.getTotalPages(),
        hasNextPage: this.hasNextPage(),
        hasPreviousPage: this.hasPreviousPage(),
      };
    },

    /**
     * Calculate pagination metadata for UI display
     */
    getPaginationMetadata(): {
      showingStart: number;
      showingEnd: number;
      total: number;
      pageInfo: string;
    } {
      const totalPages = this.getTotalPages();
      const showingStart = (currentPage - 1) * currentPageSize + 1;
      const showingEnd = Math.min(currentPage * currentPageSize, totalItems);

      let pageInfo: string;
      if (totalItems === 0) {
        pageInfo = 'No results';
      } else if (totalPages === 1) {
        pageInfo = `All ${totalItems} results`;
      } else {
        pageInfo = `Page ${currentPage} of ${totalPages}`;
      }

      return {
        showingStart: Math.max(0, showingStart),
        showingEnd: Math.max(0, showingEnd),
        total: totalItems,
        pageInfo,
      };
    },

    /**
     * Get page range for display (e.g., [1, 2, 3, ..., 10])
     */
    getPageRange(maxVisible: number = 5): number[] {
      const totalPages = this.getTotalPages();
      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const halfVisible = Math.floor(maxVisible / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      const endPage = Math.min(totalPages, startPage + maxVisible - 1);

      // Adjust start if we're near the end
      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisible + 1);
      }

      const pages: number[] = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },

    /**
     * Reset pagination to initial state
     */
    reset(): void {
      currentPage = 1;
      currentPageSize = defaultPageSize;
      totalItems = 0;
    },
  };
}

/**
 * Type for pagination controller
 */
export type PaginationController = ReturnType<typeof createPaginationController>;

/**
 * Infinite scroll configuration
 */
export interface InfiniteScrollConfig {
  /** Initial batch size */
  initialBatchSize?: number;
  /** Additional batch size for each load */
  batchSize?: number;
  /** Maximum items to keep in memory */
  maxItems?: number;
}

/**
 * Create infinite scroll controller for progressive result loading
 *
 * @param config - Infinite scroll configuration
 * @returns Infinite scroll controller instance
 *
 * @example
 * ```typescript
 * const infiniteScroll = createInfiniteScrollController({ batchSize: 20 });
 * const results = await search(query);
 * infiniteScroll.setInitialResults(results);
 * await infiniteScroll.loadMore();
 * ```
 */
export function createInfiniteScrollController(config: InfiniteScrollConfig = {}) {
  const initialBatchSize = config.initialBatchSize ?? 10;
  const batchSize = config.batchSize ?? 20;
  const maxItems = config.maxItems ?? 1000;

  let allItems: SearchResult[] = [];
  let loadedCount = 0;
  let isLoading = false;
  let hasMore = true;

  return {
    /**
     * Set initial results
     */
    setInitialResults(results: SearchResult[]): void {
      allItems = results.slice(0, maxItems);
      loadedCount = Math.min(initialBatchSize, allItems.length);
      hasMore = loadedCount < allItems.length;
    },

    /**
     * Load more results
     */
    async loadMore(): Promise<SearchResult[]> {
      if (isLoading || !hasMore) {
        return allItems.slice(0, loadedCount);
      }

      isLoading = true;
      try {
        const nextBatch = allItems.slice(loadedCount, loadedCount + batchSize);
        loadedCount += nextBatch.length;
        hasMore = loadedCount < allItems.length;
        return allItems.slice(0, loadedCount);
      } finally {
        isLoading = false;
      }
    },

    /**
     * Get currently loaded results
     */
    getLoadedResults(): SearchResult[] {
      return allItems.slice(0, loadedCount);
    },

    /**
     * Check if more results are available
     */
    getHasMore(): boolean {
      return hasMore;
    },

    /**
     * Check if currently loading
     */
    getIsLoading(): boolean {
      return isLoading;
    },

    /**
     * Get load progress (0-1)
     */
    getProgress(): number {
      if (allItems.length === 0) return 0;
      return loadedCount / allItems.length;
    },

    /**
     * Reset infinite scroll state
     */
    reset(): void {
      allItems = [];
      loadedCount = 0;
      isLoading = false;
      hasMore = true;
    },

    /**
     * Get stats
     */
    getStats(): {
      loaded: number;
      total: number;
      progress: number;
      hasMore: boolean;
      isLoading: boolean;
    } {
      return {
        loaded: loadedCount,
        total: allItems.length,
        progress: this.getProgress(),
        hasMore,
        isLoading,
      };
    },
  };
}

/**
 * Type for infinite scroll controller
 */
export type InfiniteScrollController = ReturnType<typeof createInfiniteScrollController>;
