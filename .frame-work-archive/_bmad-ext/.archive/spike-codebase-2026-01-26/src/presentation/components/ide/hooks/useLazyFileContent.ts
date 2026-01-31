/**
 * @fileoverview Lazy File Content Hook
 * @module presentation/components/ide/hooks/useLazyFileContent
 * @governance Story WB-7: Lazy Content Loading
 *
 * Hook for lazy-loading file content using ProjectContextProvider.
 * Provides cache-first loading with metadata-only file tree.
 *
 * Features:
 * - Load file tree instantly (metadata only from FileSnapshotStore)
 * - Load file content on-demand (when file opened in editor)
 * - Show cache hit/miss indicators
 * - Automatic snapshot saving after FSA reads
 *
 * @see Research: Zustand selector patterns, TanStack Router deferred loading
 */

import { useState, useCallback, useRef } from 'react';
import { ProjectContextProvider } from '@/lib/filesystem/project-context-provider';
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of lazy file content load
 */
export interface LazyFileContentResult {
  /** File content */
  content: string;
  /** Whether content was loaded from cache */
  fromCache: boolean;
  /** SHA-256 hash of content */
  hash: string;
  /** Whether snapshot was fresh (within TTL) */
  cacheHit: boolean;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * File metadata for instant tree display
 */
export interface FileMetadata {
  path: string;
  size: number;
  hash: string;
  lastCachedAt: number;
}

// ============================================================================
// Hook Options
// ============================================================================

export interface UseLazyFileContentOptions {
  /** Project ID for FileSnapshotStore */
  projectId: string;
  /** LocalFSAdapter instance for FSA operations */
  localAdapter: LocalFSAdapter;
  /** Whether cache is enabled */
  cacheEnabled?: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * useLazyFileContent - Lazy file content loading with cache
 *
 * Features:
 * - Instant file tree loading (metadata only)
 * - On-demand file content loading (when opened in editor)
 * - Cache-first strategy (check snapshot → FSA fallback)
 * - Cache hit/miss indicators
 * - Automatic snapshot saving
 *
 * @param options - Hook options
 * @returns Lazy loading functions and state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { project } = useProjectContext();
 *   const localAdapter = useWorkspace().localAdapterRef.current;
 *
 *   const {
 *     loadFileTree,
 *     loadFileContent,
 *     fileContentCache,
 *   } = useLazyFileContent({
 *     projectId: project.id,
 *     localAdapter,
 *   });
 *
 *   // Load file tree instantly (metadata only)
 *   const tree = await loadFileTree();
 *
 *   // Load file content on demand
 *   const content = await loadFileContent('src/index.ts');
 *   if (content.fromCache) {
 *     console.log('Loaded from cache instantly!');
 *   }
 *
 *   return (
 *     <div>
 *       {tree.map(file => (
 *         <div key={file.path} onClick={() => loadFileContent(file.path)}>
 *           {file.path} ({file.size} bytes)
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLazyFileContent(options: UseLazyFileContentOptions) {
  const { projectId, localAdapter, cacheEnabled = true } = options;

  // Create ProjectContextProvider instance
  const providerRef = useRef<ProjectContextProvider | null>(null);

  if (!providerRef.current) {
    providerRef.current = new ProjectContextProvider(
      localAdapter,
      projectId,
      { cacheEnabled }
    );
  }

  // Cache for loaded file content
  const [fileContentCache, setFileContentCache] = useState<
    Map<string, LazyFileContentResult>
  >(new Map());

  // Loading states
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // ========================================================================
  // Load File Tree (Metadata Only, Instant)
  // ========================================================================

  /**
   * Load file tree metadata (instant, no content loading)
   * @returns Array of file metadata
   *
   * This is the primary performance optimization:
   * - Loads only metadata (paths, sizes, hashes)
   * - No content loading (10x faster)
   * - <100ms for 1000 files
   */
  const loadFileTree = useCallback(async (): Promise<FileMetadata[]> => {
    if (!providerRef.current) {
      return [];
    }

    const tree = await providerRef.current.getFileTree();
    return tree;
  }, []);

  // ========================================================================
  // Load File Content (On-Demand, Cache-First)
  // ========================================================================

  /**
   * Load file content with cache-first strategy
   * @param path - File path
   * @returns File content with cache metadata
   *
   * Cache-First Flow:
   * 1. Check in-memory cache (already loaded)
   * 2. Check ProjectContextProvider snapshot (IndexedDB)
   * 3. If fresh + has content: return cached content (instant load)
   * 4. Else: read from FSA, compute hash, save snapshot, return content
   */
  const loadFileContent = useCallback(
    async (path: string): Promise<LazyFileContentResult> => {
      // Check in-memory cache first
      const cached = fileContentCache.get(path);
      if (cached) {
        return cached;
      }

      // Set loading state
      setLoadingFiles((prev) => new Set(prev).add(path));
      setErrors((prev) => {
        const next = new Map(prev);
        next.delete(path);
        return next;
      });

      try {
        if (!providerRef.current) {
          throw new Error('ProjectContextProvider not initialized');
        }

        // Load with cache-first strategy
        const result = await providerRef.current.readFile(path);

        const lazyResult: LazyFileContentResult = {
          content: result.content,
          fromCache: result.fromCache,
          hash: result.hash,
          cacheHit: result.cacheHit,
          loading: false,
          error: null,
        };

        // Cache in memory
        setFileContentCache((prev) => new Map(prev).set(path, lazyResult));

        return lazyResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setErrors((prev) => new Map(prev).set(path, errorMessage));

        const errorResult: LazyFileContentResult = {
          content: '',
          fromCache: false,
          hash: '',
          cacheHit: false,
          loading: false,
          error: errorMessage,
        };

        return errorResult;
      } finally {
        // Clear loading state
        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }
    },
    [fileContentCache]
  );

  // ========================================================================
  // Batch Load Multiple Files
  // ========================================================================

  /**
   * Load multiple files in parallel (for initial IDE load)
   * @param paths - Array of file paths
   * @returns Map of path → content result
   *
   * Use this for loading recently opened files on IDE startup.
   */
  const loadMultipleFiles = useCallback(
    async (paths: string[]): Promise<Map<string, LazyFileContentResult>> => {
      const results = new Map<string, LazyFileContentResult>();

      await Promise.all(
        paths.map(async (path) => {
          const result = await loadFileContent(path);
          results.set(path, result);
        })
      );

      return results;
    },
    [loadFileContent]
  );

  // ========================================================================
  // Invalidate Cache
  // ========================================================================

  /**
   * Invalidate cached content for a file
   * @param path - File path to invalidate
   *
   * Use this after external file modifications or manual edits.
   */
  const invalidateCache = useCallback(async (path: string): Promise<void> => {
    // Remove from in-memory cache
    setFileContentCache((prev) => {
      const next = new Map(prev);
      next.delete(path);
      return next;
    });

    // Invalidate snapshot
    if (!providerRef.current) {
      return;
    }

    await providerRef.current.invalidateFile(path);
  }, []);

  /**
   * Clear all caches (in-memory and snapshots)
   *
   * Use this after bulk external modifications.
   */
  const clearAllCaches = useCallback(async (): Promise<void> => {
    setFileContentCache(new Map());
    setLoadingFiles(new Set());
    setErrors(new Map());

    if (!providerRef.current) {
      return;
    }

    await providerRef.current.invalidateAll();
  }, []);

  // ========================================================================
  // Cache Statistics
  // ========================================================================

  /**
   * Get cache statistics for monitoring
   * @returns Cache stats
   */
  const getCacheStats = useCallback(async () => {
    if (!providerRef.current) {
      return {
        totalCount: 0,
        totalSize: 0,
        expiredCount: 0,
        freshCount: 0,
      };
    }

    return await providerRef.current.getCacheStats();
  }, []);

  // ========================================================================
  // Return Public API
  // ========================================================================

  return {
    // File tree (instant, metadata only)
    loadFileTree,

    // File content (on-demand, cache-first)
    loadFileContent,
    loadMultipleFiles,

    // Cache management
    invalidateCache,
    clearAllCaches,

    // State
    fileContentCache,
    loadingFiles,
    errors,

    // Utilities
    getCacheStats,
    isLoading: (path: string) => loadingFiles.has(path),
    hasError: (path: string) => errors.has(path),
    getError: (path: string) => errors.get(path) || null,
    isCached: (path: string) => fileContentCache.has(path),
  };
}
