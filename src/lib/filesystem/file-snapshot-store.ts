/**
 * @fileoverview File Snapshot Store - Content Caching Layer
 * @module lib/filesystem/file-snapshot-store
 * @governance Story WB-2: File Snapshot Store
 *
 * Caches file content in IndexedDB to avoid re-reading from File System Access API
 * on every workspace reload. Provides instant file tree loads and lazy content loading.
 *
 * Architecture:
 * - Two-table schema: metadata (lightweight) + content (lazy-loaded)
 * - Time-based cache invalidation (5min default freshness)
 * - Hash-based change detection (SHA-256)
 * - Chunked bulk operations for large projects
 *
 * @see Architectural Decision: epic-wb-story-2-adr-2026-01-01.md
 */

import { db } from '../state/dexie-db';
import type { FileSnapshotRecord } from '../state/dexie-db-core-types';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const BULK_OPERATION_CHUNK_SIZE = 100;
const SNAPSHOT_VERSION = 1;

// ============================================================================
// Cache Entry Types
// ============================================================================

/**
 * Result of a cache lookup operation
 */
export interface CacheLookupResult {
    /** Whether cache hit was found */
    hit: boolean;
    /** Whether cached content is fresh (within TTL) */
    fresh: boolean;
    /** Snapshot metadata if found */
    snapshot?: FileSnapshotRecord;
    /** File content if loaded */
    content?: string;
}

/**
 * Snapshot save result
 */
export interface SnapshotSaveResult {
    /** Number of metadata records saved */
    metadataCount: number;
    /** Number of content records saved */
    contentCount: number;
    /** Time taken in milliseconds */
    durationMs: number;
}

// ============================================================================
// File Snapshot Store
// ============================================================================

/**
 * FileSnapshotStore - IndexedDB-backed file content cache
 *
 * Features:
 * - Fast file tree loads (<100ms) via metadata table
 * - Lazy content loading (only when user opens file)
 * - Automatic cache invalidation (time-based + hash-based)
 * - Chunked operations for large projects
 * - IndexedDB quota management
 *
 * @example
 * ```tsx
 * const snapshotStore = new FileSnapshotStore();
 *
 * // Save snapshot after file sync
 * await snapshotStore.saveSnapshot(projectId, filePath, content, fileHash);
 *
 * // Load file tree (instant, metadata only)
 * const tree = await snapshotStore.getFileTree(projectId);
 *
 * // Get file content (lazy, loads content if cached)
 * const result = await snapshotStore.getSnapshot(projectId, filePath);
 * if (result.fresh) {
 *   return result.content; // Use cached content
 * }
 * ```
 */
export class FileSnapshotStore {
    private cacheTTL: number;

    constructor(options?: { cacheTTL?: number }) {
        this.cacheTTL = options?.cacheTTL ?? DEFAULT_CACHE_TTL_MS;
    }

    // ========================================================================
    // Snapshot Operations (AC-WB-2-2)
    // ========================================================================

    /**
     * Save file snapshot to cache
     * @param projectId - Project identifier
     * @param path - File path relative to project root
     * @param content - File content to cache
     * @param hash - SHA-256 hash for change detection
     * @param size - File size in bytes (for quota management)
     */
    async saveSnapshot(
        projectId: string,
        path: string,
        content: string,
        hash: string,
        size: number = content.length
    ): Promise<void> {
        const now = Date.now();
        const expiresAt = now + this.cacheTTL;

        // Use Dexie's put operation which handles both insert and update
        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
            // Save metadata (lightweight, always saved)
            await db.fileSnapshots.put({
                projectId,
                path,
                hash,
                size,
                version: SNAPSHOT_VERSION,
                lastCachedAt: now,
                expiresAt,
                hasContent: true, // Mark that content exists
            });

            // Save content (lazy-loaded, only if within quota)
            try {
                await db.fileContentCache.put({
                    projectId,
                    path,
                    content,
                });
            } catch (error: unknown) {
                // Handle IndexedDB quota exceeded
                if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                    console.warn('[FileSnapshotStore] Quota exceeded, clearing old cache entries');
                    await this.evictOldestEntries(projectId, Math.ceil(size / 1024)); // Evict ~size KB
                    // Retry once after eviction
                    await db.fileContentCache.put({
                        projectId,
                        path,
                        content,
                    });
                } else {
                    throw error; // Re-throw other errors
                }
            }
        });
    }

    // ========================================================================
    // Cache Lookup (AC-WB-2-3)
    // ========================================================================

    /**
     * Get file snapshot from cache (metadata + content)
     * @param projectId - Project identifier
     * @param path - File path
     * @returns Cache lookup result with freshness info
     */
    async getSnapshot(projectId: string, path: string): Promise<CacheLookupResult> {
        const now = Date.now();

        // Query metadata first (fast, indexed query)
        const snapshot = await db.fileSnapshots
            .where('[projectId+path]')
            .equals([projectId, path])
            .first();

        if (!snapshot) {
            return { hit: false, fresh: false };
        }

        // Check freshness
        const fresh = now < snapshot.expiresAt;

        // Lazy load content if fresh
        let content: string | undefined;
        if (fresh && snapshot.hasContent) {
            const contentRecord = await db.fileContentCache
                .where('[projectId+path]')
                .equals([projectId, path])
                .first();

            content = contentRecord?.content;
        }

        return {
            hit: true,
            fresh,
            snapshot,
            content,
        };
    }

    /**
     * Check if snapshot exists and is fresh (without loading content)
     * @param projectId - Project identifier
     * @param path - File path
     * @returns True if snapshot exists and is fresh
     */
    async isFresh(projectId: string, path: string): Promise<boolean> {
        const snapshot = await db.fileSnapshots
            .where('[projectId+path]')
            .equals([projectId, path])
            .first();

        if (!snapshot) {
            return false;
        }

        return Date.now() < snapshot.expiresAt;
    }

    // ========================================================================
    // File Tree Operations (AC-WB-2-3)
    // ========================================================================

    /**
     * Get file tree metadata (instant, content not loaded)
     * @param projectId - Project identifier
     * @returns Array of file metadata (paths, sizes, hashes)
     */
    async getFileTree(projectId: string): Promise<FileSnapshotRecord[]> {
        return await db.fileSnapshots
            .where('projectId')
            .equals(projectId)
            .toArray();
    }

    /**
     * Get file count in cache
     * @param projectId - Project identifier
     * @returns Number of cached files
     */
    async getFileCount(projectId: string): Promise<number> {
        return await db.fileSnapshots
            .where('projectId')
            .equals(projectId)
            .count();
    }

    // ========================================================================
    // Bulk Operations (AC-WB-2-2)
    // ========================================================================

    /**
     * Save multiple snapshots in a single transaction
     * @param projectId - Project identifier
     * @param snapshots - Array of snapshot data
     * @returns Save result with counts
     */
    async saveBulkSnapshots(
        projectId: string,
        snapshots: Array<{
            path: string;
            content: string;
            hash: string;
            size?: number;
        }>
    ): Promise<SnapshotSaveResult> {
        const startTime = Date.now();
        const now = Date.now();
        const expiresAt = now + this.cacheTTL;

        let metadataCount = 0;
        let contentCount = 0;

        // Process in chunks to avoid blocking
        for (let i = 0; i < snapshots.length; i += BULK_OPERATION_CHUNK_SIZE) {
            const chunk = snapshots.slice(i, i + BULK_OPERATION_CHUNK_SIZE);

            await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
                for (const { path, content, hash, size = content.length } of chunk) {
                    // Save metadata
                    await db.fileSnapshots.put({
                        projectId,
                        path,
                        hash,
                        size,
                        version: SNAPSHOT_VERSION,
                        lastCachedAt: now,
                        expiresAt,
                        hasContent: true,
                    });
                    metadataCount++;

                    // Save content
                    await db.fileContentCache.put({
                        projectId,
                        path,
                        content,
                    });
                    contentCount++;
                }
            });
        }

        return {
            metadataCount,
            contentCount,
            durationMs: Date.now() - startTime,
        };
    }

    // ========================================================================
    // Cache Invalidation (AC-WB-2-5)
    // ========================================================================

    /**
     * Invalidate single file snapshot
     * @param projectId - Project identifier
     * @param path - File path to invalidate
     */
    async invalidateSnapshot(projectId: string, path: string): Promise<void> {
        await db.fileSnapshots.where('[projectId+path]').equals([projectId, path]).delete();
        await db.fileContentCache.where('[projectId+path]').equals([projectId, path]).delete();
    }

    /**
     * Invalidate all snapshots for a project (AC-WB-2-4)
     * @param projectId - Project identifier
     */
    async deleteSnapshots(projectId: string): Promise<void> {
        await db.fileSnapshots.where('projectId').equals(projectId).delete();
        await db.fileContentCache.where('projectId').equals(projectId).delete();
    }

    /**
     * Invalidate expired snapshots (automatic cleanup)
     * @param projectId - Project identifier (optional, cleans all if not provided)
     * @returns Number of snapshots invalidated
     */
    async invalidateExpired(projectId?: string): Promise<number> {
        const now = Date.now();
        let count = 0;

        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
            const expiredSnapshots = await db.fileSnapshots
                .where('expiresAt')
                .below(now)
                .filter(snapshot => !projectId || snapshot.projectId === projectId)
                .toArray();

            for (const snapshot of expiredSnapshots) {
                await db.fileSnapshots.delete(snapshot.id!);
                await db.fileContentCache.where('[projectId+path]').equals([snapshot.projectId, snapshot.path]).delete();
                count++;
            }
        });

        return count;
    }

    /**
     * Invalidate snapshots that don't match current file hash
     * @param projectId - Project identifier
     * @param currentHashes - Map of file paths to current hashes
     * @returns Number of snapshots invalidated
     */
    async invalidateByHashMismatch(projectId: string, currentHashes: Map<string, string>): Promise<number> {
        let count = 0;

        const snapshots = await db.fileSnapshots.where('projectId').equals(projectId).toArray();

        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
            for (const snapshot of snapshots) {
                const currentHash = currentHashes.get(snapshot.path);

                // Invalidate if: file no longer exists OR hash changed
                if (!currentHash || snapshot.hash !== currentHash) {
                    await db.fileSnapshots.delete(snapshot.id!);
                    await db.fileContentCache.where('[projectId+path]').equals([snapshot.projectId, snapshot.path]).delete();
                    count++;
                }
            }
        });

        return count;
    }

    // ========================================================================
    // Cache Management
    // ========================================================================

    /**
     * Get cache statistics for a project
     * @param projectId - Project identifier
     * @returns Cache stats
     */
    async getCacheStats(projectId: string): Promise<{
        totalCount: number;
        totalSize: number;
        expiredCount: number;
        freshCount: number;
    }> {
        const now = Date.now();
        const snapshots = await db.fileSnapshots.where('projectId').equals(projectId).toArray();

        const totalSize = snapshots.reduce((sum, s) => sum + s.size, 0);
        const expiredCount = snapshots.filter(s => now >= s.expiresAt).length;
        const freshCount = snapshots.filter(s => now < s.expiresAt).length;

        return {
            totalCount: snapshots.length,
            totalSize,
            expiredCount,
            freshCount,
        };
    }

    /**
     * Evict oldest cache entries to free space
     * @param projectId - Project identifier
     * @param targetKB - Target KB to free (approximate)
     * @private
     */
    private async evictOldestEntries(projectId: string, targetKB: number): Promise<void> {
        const oldestSnapshots = await db.fileSnapshots
            .where('projectId')
            .equals(projectId)
            .sortBy('lastCachedAt');

        const toEvict = oldestSnapshots.slice(0, Math.ceil(targetKB / 100)); // Evict roughly targetKB

        await db.transaction('rw', db.fileSnapshots, db.fileContentCache, async () => {
            for (const snapshot of toEvict) {
                await db.fileSnapshots.delete(snapshot.id!);
                await db.fileContentCache.where('[projectId+path]').equals([snapshot.projectId, snapshot.path]).delete();
            }
        });
    }

    /**
     * Refresh snapshot TTL (extend cache lifetime)
     * @param projectId - Project identifier
     * @param path - File path
     */
    async refreshSnapshot(projectId: string, path: string): Promise<void> {
        const now = Date.now();
        const expiresAt = now + this.cacheTTL;

        await db.fileSnapshots.where('[projectId+path]').equals([projectId, path]).modify({
            lastCachedAt: now,
            expiresAt,
        });
    }

    /**
     * Refresh all snapshots for a project (extend TTL)
     * @param projectId - Project identifier
     * @returns Number of snapshots refreshed
     */
    async refreshAllSnapshots(projectId: string): Promise<number> {
        const now = Date.now();
        const expiresAt = now + this.cacheTTL;

        return await db.fileSnapshots.where('projectId').equals(projectId).modify({
            lastCachedAt: now,
            expiresAt,
        });
    }

    // ========================================================================
    // Batch Operations
    // ========================================================================

    /**
     * Get all expired snapshots for batch cleanup
     * @param projectId - Project identifier (optional)
     * @returns Array of expired snapshot IDs
     */
    async getExpiredSnapshots(projectId?: string): Promise<Array<number>> {
        const now = Date.now();
        const expired = await db.fileSnapshots
            .where('expiresAt')
            .below(now)
            .filter(snapshot => !projectId || snapshot.projectId === projectId)
            .toArray();

        return expired.map(s => s.id!).filter(Boolean);
    }

    /**
     * Get cache size in bytes
     * @param projectId - Project identifier
     * @returns Total cache size in bytes
     */
    async getCacheSize(projectId: string): Promise<number> {
        const snapshots = await db.fileSnapshots.where('projectId').equals(projectId).toArray();
        return snapshots.reduce((sum, s) => sum + s.size, 0);
    }
}

// ============================================================================
// Default Singleton
// ============================================================================

/**
 * Default file snapshot store instance
 */
export const fileSnapshotStore = new FileSnapshotStore();
