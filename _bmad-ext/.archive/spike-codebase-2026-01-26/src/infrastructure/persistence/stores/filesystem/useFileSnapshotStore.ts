/**
 * @fileoverview Unified File Snapshot Store
 * @module infrastructure/persistence/stores/filesystem/useFileSnapshotStore
 * @governance EPIC-CP-1.11
 *
 * January 2026 Zustand Pattern:
 * - Single store composed from 4 focused slices
 * - Each slice is <120 lines (single responsibility principle)
 * - Dexie IndexedDB persistence for metadata
 * - Content cache is ephemeral (in-memory only)
 *
 * Slices:
 * - snapshot-metadata-slice.ts: File tree metadata (137 lines)
 * - snapshot-cache-slice.ts: Lazy content loading with TTL (125 lines)
 * - snapshot-bulk-ops-slice.ts: Chunked bulk operations (134 lines)
 * - snapshot-quota-slice.ts: LRU eviction & quota management (111 lines)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SnapshotMetadataState,
  SnapshotMetadataMethods,
  SnapshotCacheState,
  SnapshotCacheMethods,
  SnapshotBulkOpsMethods,
  SnapshotQuotaState,
  SnapshotQuotaMethods,
} from './snapshot-types';
import { createSnapshotMetadataSlice } from './snapshot-metadata-slice';
import { createSnapshotCacheSlice } from './snapshot-cache-slice';
import { createSnapshotBulkOpsSlice } from './snapshot-bulk-ops-slice';
import { createSnapshotQuotaSlice } from './snapshot-quota-slice';

// Combined state interface
type CombinedSnapshotState = SnapshotMetadataState &
  SnapshotMetadataMethods &
  SnapshotCacheState &
  SnapshotCacheMethods &
  SnapshotBulkOpsMethods &
  SnapshotQuotaState &
  SnapshotQuotaMethods;

/**
 * Unified File Snapshot Store
 *
 * Composed from 4 focused slices following January 2026 Zustand pattern.
 * Persists metadata to Dexie IndexedDB with selective partialize.
 * Content cache is ephemeral (in-memory only, not persisted).
 */
export const useFileSnapshotStore = create<CombinedSnapshotState>()(
  persist(
    (set, get, api) => ({
      // State initialization
      metadata: {},
      content: {},
      quotaLimitMb: 50,

      // Compose all slices
      ...createSnapshotMetadataSlice(set, get, api),
      ...createSnapshotCacheSlice(set, get, api),
      ...createSnapshotBulkOpsSlice(set, get, api),
      ...createSnapshotQuotaSlice(set, get, api),
    }),
    {
      name: 'file-snapshot-state',

      // TODO: Add Dexie storage adapter
      // For now using localStorage as temporary storage
      // storage: createDexieStorage('fileSnapshotState'),

      // Selective persistence (metadata only, NOT content cache)
      partialize: (state) => ({
        metadata: state.metadata,
        quotaLimitMb: state.quotaLimitMb,
        // NOT persisted:
        // - content (ephemeral, rebuilt on demand)
      }),

      // Hydration handler
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        console.log('[FileSnapshotStore] Rehydrated from storage', {
          metadataCount: Object.keys(state.metadata || {}).length,
          quotaLimitMb: state.quotaLimitMb,
        });
      },
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get file tree for a project
 */
export function useFileTree(projectId: string) {
  return useFileSnapshotStore((state) => state.getFileTree(projectId));
}

/**
 * Hook to get quota statistics
 */
export function useQuotaStats() {
  return useFileSnapshotStore((state) => state.getQuotaStats());
}

/**
 * Hook to check if quota is near limit
 */
export function useQuotaWarning() {
  return useFileSnapshotStore((state) => state.getQuotaStats().nearLimit);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Reset the file snapshot store to empty state
 * Useful for testing or clearing all cache
 */
export function resetFileSnapshotStore() {
  useFileSnapshotStore.setState({
    metadata: {},
    content: {},
    quotaLimitMb: 50,
  });
}

/**
 * Get current store state (outside of React)
 * Useful for debugging, testing, or non-React contexts
 */
export function getFileSnapshotStoreState() {
  return useFileSnapshotStore.getState();
}
