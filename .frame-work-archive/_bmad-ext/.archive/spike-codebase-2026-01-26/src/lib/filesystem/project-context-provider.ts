/**
 * @fileoverview Project Context Provider - Cache-First File Loading
 * @module lib/filesystem/project-context-provider
 * @governance Story WB-3: Project Context Provider
 *
 * Integrates FileSnapshotStore with LocalFSAdapter to provide instant file loads.
 * Implements cache-first strategy: check snapshot → if fresh use cache → else read FSA.
 *
 * Architecture:
 * - Wrap LocalFSAdapter with caching layer
 * - Compute SHA-256 hashes for change detection
 * - Save snapshots after FSA reads
 * - Lazy content loading via FileSnapshotStore
 *
 * @see Research: Dexie transaction patterns, Web Crypto API, WebContainer fs operations
 */

import type { LocalFSAdapter } from './local-fs-adapter';
import type { FileReadResult, FileReadBinaryResult } from './fs-types';
import { FileSnapshotStore } from './file-snapshot-store';
import { computeSHA256 } from './hash-utils';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CACHE_ENABLED = true; // Cache enabled by default

// ============================================================================
// Result Types
// ============================================================================

/**
 * File read result with cache metadata
 */
export interface CachedFileReadResult extends FileReadResult {
    /** Whether content was loaded from cache */
    fromCache: boolean;
    /** SHA-256 hash of file content */
    hash: string;
    /** Whether snapshot was fresh (within TTL) */
    cacheHit: boolean;
}

/**
 * Binary file read result with cache metadata
 */
export interface CachedFileReadBinaryResult extends FileReadBinaryResult {
    /** Whether content was loaded from cache */
    fromCache: boolean;
    /** SHA-256 hash of file content */
    hash: string;
    /** Whether snapshot was fresh (within TTL) */
    cacheHit: boolean;
}

// ============================================================================
// Project Context Provider
// ============================================================================

/**
 * ProjectContextProvider - Cache-first file loading integration
 *
 * Features:
 * - Instant file loads (<100ms) via IndexedDB snapshots
 * - SHA-256 hash computation for change detection
 * - Automatic snapshot saving after FSA reads
 * - Lazy content loading (metadata only until file opened)
 * - Cache invalidation on hash mismatch
 *
 * @example
 * ```tsx
 * import { ProjectContextProvider } from '@/lib/filesystem';
 *
 * const provider = new ProjectContextProvider(localFS, 'project-123');
 *
 * // Check cache first, then fallback to FSA
 * const result = await provider.readFile('src/index.ts');
 * if (result.fromCache) {
 *   console.log('Loaded from cache instantly!');
 * }
 *
 * // Get file tree (instant, metadata only)
 * const tree = await provider.getFileTree();
 * ```
 */
export class ProjectContextProvider {
    private fsAdapter: LocalFSAdapter;
    private projectId: string;
    private snapshotStore: FileSnapshotStore;
    private cacheEnabled: boolean;

    /**
     * Create a new ProjectContextProvider
     * @param fsAdapter - LocalFSAdapter instance for FSA operations
     * @param projectId - Project identifier for snapshot storage
     * @param options - Configuration options
     */
    constructor(
        fsAdapter: LocalFSAdapter,
        projectId: string,
        options?: { cacheEnabled?: boolean }
    ) {
        this.fsAdapter = fsAdapter;
        this.projectId = projectId;
        this.snapshotStore = new FileSnapshotStore();
        this.cacheEnabled = options?.cacheEnabled ?? DEFAULT_CACHE_ENABLED;
    }

    // ========================================================================
    // Cache-First File Reading (AC-WB-3-1)
    // ========================================================================

    /**
     * Read file with cache-first strategy
     * @param path - File path relative to project root
     * @param options - Read options
     * @returns File content with cache metadata
     *
     * Cache-First Flow:
     * 1. Check snapshot freshness
     * 2. If fresh + has content: return cached content (instant load)
     * 3. Else: read from FSA, compute hash, save snapshot, return content
     */
    async readFile(path: string, options?: { encoding?: 'utf-8' }): Promise<CachedFileReadResult>;
    async readFile(path: string, options: { encoding: 'binary' }): Promise<CachedFileReadBinaryResult>;
    async readFile(
        path: string,
        options: { encoding?: 'utf-8' | 'binary' } = { encoding: 'utf-8' }
    ): Promise<CachedFileReadResult | CachedFileReadBinaryResult> {
        if (options.encoding === 'binary') {
            return this.readFileBinary(path);
        }

        // Cache-first strategy
        if (this.cacheEnabled) {
            const cached = await this.snapshotStore.getSnapshot(this.projectId, path);

            if (cached.fresh && cached.content !== undefined) {
                // Cache hit - return instantly
                return {
                    content: cached.content,
                    encoding: 'utf-8',
                    fromCache: true,
                    hash: cached.snapshot!.hash,
                    cacheHit: true,
                };
            }

            // Cache miss or stale - continue to FSA read
        }

        // Fallback to FSA read
        const result = await this.fsAdapter.readFile(path, { encoding: 'utf-8' });

        // Compute SHA-256 hash
        const hash = await computeSHA256(result.content);

        // Save snapshot for next read
        if (this.cacheEnabled) {
            await this.snapshotStore.saveSnapshot(
                this.projectId,
                path,
                result.content,
                hash,
                result.content.length
            );
        }

        return {
            content: result.content,
            encoding: 'utf-8',
            fromCache: false,
            hash,
            cacheHit: false,
        };
    }

    /**
     * Read binary file with cache-first strategy
     * @param path - File path
     * @returns Binary file content with cache metadata
     *
     * Note: Binary files are NOT cached (size concerns)
     */
    async readFileBinary(path: string): Promise<CachedFileReadBinaryResult> {
        // Binary files: always read from FSA (no caching)
        const result = await this.fsAdapter.readFile(path, { encoding: 'binary' });

        // Compute hash from buffer
        const hash = await this.computeSHA256FromBuffer(result.data);

        return {
            data: result.data,
            mimeType: result.mimeType,
            fromCache: false,
            hash,
            cacheHit: false,
        };
    }

    // ========================================================================
    // File Tree Operations (AC-WB-3-2)
    // ========================================================================

    /**
     * Get file tree metadata (instant, no content loading)
     * @returns Array of file metadata
     *
     * This is the primary performance optimization:
     * - Loads only metadata (paths, sizes, hashes)
     * - No content loading (10x faster)
     * - <100ms for 1000 files
     */
    async getFileTree(): Promise<
        Array<{
            path: string;
            size: number;
            hash: string;
            lastCachedAt: number;
        }>
    > {
        const snapshots = await this.snapshotStore.getFileTree(this.projectId);

        return snapshots.map((snap) => ({
            path: snap.path,
            size: snap.size,
            hash: snap.hash,
            lastCachedAt: snap.lastCachedAt,
        }));
    }

    /**
     * Invalidate cached snapshots for a single file
     * @param path - File path to invalidate
     *
     * Use this after external file modifications
     */
    async invalidateFile(path: string): Promise<void> {
        await this.snapshotStore.invalidateSnapshot(this.projectId, path);
    }

    /**
     * Invalidate all cached snapshots for this project
     *
     * Use this after bulk external modifications
     */
    async invalidateAll(): Promise<void> {
        await this.snapshotStore.deleteSnapshots(this.projectId);
    }

    /**
     * Refresh cache TTL for a file
     * @param path - File path
     *
     * Extends cache lifetime without re-reading from FSA
     */
    async refreshFile(path: string): Promise<void> {
        await this.snapshotStore.refreshSnapshot(this.projectId, path);
    }

    /**
     * Refresh cache TTL for all project files
     *
     * Extends cache lifetime after user session extension
     */
    async refreshAll(): Promise<number> {
        return await this.snapshotStore.refreshAllSnapshots(this.projectId);
    }

    // ========================================================================
    // Cache Invalidation (AC-WB-3-3)
    // ========================================================================

    /**
     * Invalidate snapshots that don't match current file hashes
     * @param currentHashes - Map of file paths to current hashes
     * @returns Number of snapshots invalidated
     *
     * Detects external file modifications by comparing hashes
     */
    async invalidateByHashMismatch(currentHashes: Map<string, string>): Promise<number> {
        return await this.snapshotStore.invalidateByHashMismatch(this.projectId, currentHashes);
    }

    /**
     * Invalidate expired snapshots (automatic cleanup)
     * @returns Number of snapshots invalidated
     */
    async invalidateExpired(): Promise<number> {
        return await this.snapshotStore.invalidateExpired(this.projectId);
    }

    // ========================================================================
    // Cache Statistics
    // ========================================================================

    /**
     * Get cache statistics for this project
     * @returns Cache stats
     */
    async getCacheStats(): Promise<{
        totalCount: number;
        totalSize: number;
        expiredCount: number;
        freshCount: number;
    }> {
        return await this.snapshotStore.getCacheStats(this.projectId);
    }

    /**
     * Check if a file is cached and fresh
     * @param path - File path
     * @returns True if fresh snapshot exists
     */
    async isCached(path: string): Promise<boolean> {
        return await this.snapshotStore.isFresh(this.projectId, path);
    }

    // ========================================================================
    // Private Helpers
    // ========================================================================

    /**
     * Compute SHA-256 hash from ArrayBuffer
     * @param buffer - Binary data
     * @returns Hex hash string
     * @private
     */
    private async computeSHA256FromBuffer(buffer: ArrayBuffer): Promise<string> {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
}
