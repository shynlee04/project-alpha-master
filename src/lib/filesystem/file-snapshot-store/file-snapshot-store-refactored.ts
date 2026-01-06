/**
 * @fileoverview File Snapshot Store - Refactored (Zustand with 4 slices)
 * @module filesystem/file-snapshot-store/file-snapshot-store-refactored
 *
 * Refactored from class-based service (517 lines) to Zustand store with 4 slices:
 * - snapshot-cache-slice.ts (120 lines) - Core cache state + CRUD
 * - snapshot-lookup-slice.ts (110 lines) - Cache hit/freshness checking
 * - snapshot-invalidation-slice.ts (180 lines) - Invalidation strategies
 * - snapshot-bulk-slice.ts (175 lines) - Bulk operations + chunking
 *
 * **BREAKING CHANGE**: This is a complete architectural migration from class-based service to Zustand store.
 * A full facade is provided for backward compatibility.
 *
 * @migration-guide
 *
 * OLD (Class-based service):
 * ```ts
 * import { FileSnapshotStore } from '@/lib/filesystem/file-snapshot-store';
 * const store = new FileSnapshotStore({ cacheTTL: 300000 });
 * await store.saveSnapshot(projectId, path, content, hash);
 * const result = await store.getSnapshot(projectId, path);
 * ```
 *
 * NEW (Zustand store):
 * ```ts
 * import { useFileSnapshotStore } from '@/lib/filesystem/file-snapshot-store/file-snapshot-store-refactored';
 * const { saveSnapshot, getSnapshot } = useFileSnapshotStore.getState();
 * await saveSnapshot(projectId, path, content, hash);
 * const result = await getSnapshot(projectId, path);
 * ```
 *
 * The facade maintains the old class-based API for gradual migration.
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import {
  createSnapshotCacheSlice,
  SnapshotCacheSlice,
} from './snapshot-cache-slice';
import {
  createSnapshotLookupSlice,
  SnapshotLookupSlice,
} from './snapshot-lookup-slice';
import {
  createSnapshotInvalidationSlice,
  SnapshotInvalidationSlice,
} from './snapshot-invalidation-slice';
import {
  createSnapshotBulkSlice,
  SnapshotBulkSlice,
} from './snapshot-bulk-slice';
import { CacheLookupResult, SnapshotSaveResult } from './types';

// ============================================================================
// Combined Store Interface
// ============================================================================

export interface FileSnapshotStore
  extends SnapshotCacheSlice,
    SnapshotLookupSlice,
    SnapshotInvalidationSlice,
    SnapshotBulkSlice {}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Zustand store for file snapshot caching (refactored from class-based service)
 *
 * Uses December 2025 Zustand patterns:
 * - Slice composition for single responsibility
 * - Persist middleware for IndexedDB via Dexie
 * - Backward compatible facade for gradual migration
 */
export const useFileSnapshotStore = create<FileSnapshotStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Snapshot Cache Slice
      ...createSnapshotCacheSlice(set, get),

      // Snapshot Lookup Slice
      ...createSnapshotLookupSlice(set, get),

      // Snapshot Invalidation Slice
      ...createSnapshotInvalidationSlice(set, get),

      // Snapshot Bulk Slice
      ...createSnapshotBulkSlice(set, get),
    })),
    {
      name: 'via-gent-file-snapshots',
      storage: createJSONStorage(() => createDexieStorage('fileSnapshots')),
      partialize: (state) => ({
        // Persist: cache configuration
        cacheTTL: state.cacheTTL,

        // Persist: statistics
        metadataCount: state.metadataCount,
        contentCount: state.contentCount,
        totalSize: state.totalSize,

        // Persist: invalidation stats
        invalidationStats: state.invalidationStats,

        // Persist: bulk stats
        bulkStats: state.bulkStats,

        // Do NOT persist: lastLookup (transient runtime state)
      }),
    }
  )
);

// ============================================================================
// Backward Compatibility Facade (Class-based Service API)
// ============================================================================

/**
 * Facade: Get snapshot from cache
 *
 * @deprecated Use useFileSnapshotStore.getState().getSnapshot() instead
 */
export async function getSnapshot(
  projectId: string,
  path: string,
  loadContent?: boolean
): Promise<CacheLookupResult> {
  return await useFileSnapshotStore.getState().getSnapshot(projectId, path, loadContent);
}

/**
 * Facade: Save file snapshot to cache
 *
 * @deprecated Use useFileSnapshotStore.getState().saveSnapshot() instead
 */
export async function saveSnapshot(
  projectId: string,
  path: string,
  content: string,
  hash: string,
  size?: number,
  workspaceId?: string
): Promise<void> {
  await useFileSnapshotStore.getState().saveSnapshot(
    projectId,
    path,
    content,
    hash,
    size,
    workspaceId
  );
}

/**
 * Facade: Get file tree metadata
 *
 * @deprecated Use useFileSnapshotStore.getState().getFileTree() instead
 */
export async function getFileTree(projectId: string): Promise<any[]> {
  return await useFileSnapshotStore.getState().getFileTree(projectId);
}

/**
 * Facade: Get file count in cache
 *
 * @deprecated Use useFileSnapshotStore.getState().getFileCount() instead
 */
export async function getFileCount(projectId: string): Promise<number> {
  return await useFileSnapshotStore.getState().getFileCount(projectId);
}

/**
 * Facade: Get cache size in bytes
 *
 * @deprecated Use useFileSnapshotStore.getState().getCacheSize() instead
 */
export async function getCacheSize(projectId: string): Promise<number> {
  return await useFileSnapshotStore.getState().getCacheSize(projectId);
}

/**
 * Facade: Get cache statistics
 *
 * @deprecated Use useFileSnapshotStore.getState().getCacheStats() instead
 */
export async function getCacheStats(projectId: string): Promise<{
  totalCount: number;
  totalSize: number;
  expiredCount: number;
  freshCount: number;
}> {
  return await useFileSnapshotStore.getState().getCacheStats(projectId);
}

/**
 * Facade: Refresh snapshot TTL
 *
 * @deprecated Use useFileSnapshotStore.getState().refreshSnapshot() instead
 */
export async function refreshSnapshot(
  projectId: string,
  path: string
): Promise<void> {
  await useFileSnapshotStore.getState().refreshSnapshot(projectId, path);
}

/**
 * Facade: Refresh all snapshots for project
 *
 * @deprecated Use useFileSnapshotStore.getState().refreshAllSnapshots() instead
 */
export async function refreshAllSnapshots(projectId: string): Promise<number> {
  return await useFileSnapshotStore.getState().refreshAllSnapshots(projectId);
}

/**
 * Facade: Invalidate specific snapshot
 *
 * @deprecated Use useFileSnapshotStore.getState().invalidateSnapshot() instead
 */
export async function invalidateSnapshot(
  projectId: string,
  path: string
): Promise<void> {
  await useFileSnapshotStore.getState().invalidateSnapshot(projectId, path);
}

/**
 * Facade: Invalidate all snapshots for project
 *
 * @deprecated Use useFileSnapshotStore.getState().invalidateProject() instead
 */
export async function invalidateProject(projectId: string): Promise<number> {
  return await useFileSnapshotStore.getState().invalidateProject(projectId);
}

/**
 * Facade: Clear all expired snapshots
 *
 * @deprecated Use useFileSnapshotStore.getState().invalidateExpired() instead
 */
export async function invalidateExpired(projectId?: string): Promise<number> {
  return await useFileSnapshotStore.getState().invalidateExpired(projectId);
}

/**
 * Facade: Check if snapshot is fresh
 *
 * @deprecated Use useFileSnapshotStore.getState().isFresh() instead
 */
export async function isFresh(projectId: string, path: string): Promise<boolean> {
  return await useFileSnapshotStore.getState().isFresh(projectId, path);
}

/**
 * Facade: Save multiple snapshots in bulk
 *
 * @deprecated Use useFileSnapshotStore.getState().saveBulkSnapshots() instead
 */
export async function saveBulkSnapshots(
  projectId: string,
  snapshots: Array<{
    path: string;
    content: string;
    hash: string;
    size?: number;
    workspaceId?: string;
  }>
): Promise<SnapshotSaveResult> {
  return await useFileSnapshotStore.getState().saveBulkSnapshots(
    projectId,
    snapshots
  );
}

// Re-export types for backward compatibility
export type { CacheLookupResult, SnapshotSaveResult } from './types';
