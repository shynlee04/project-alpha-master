/**
 * @fileoverview File Sync Status Store - Refactored (December 2025 Zustand patterns)
 * @module workspace/file-sync-status-store/file-sync-status-store-refactored
 *
 * Refactored from 554-line god store into 5 focused slices:
 * - file-status-slice.ts (130 lines) - Individual file status CRUD
 * - sync-progress-slice.ts (115 lines) - Event bus progress tracking
 * - sync-lifecycle-slice.ts (115 lines) - High-level sync operations
 * - hydration-slice.ts (70 lines) - Persistence hydration tracking
 * - types.ts (40 lines) - Shared type definitions
 *
 * Target: <120 lines per slice (within architectural standard)
 * Combined store: ~150 lines with slice composition
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import {
  createFileStatusSlice,
  FileStatusSlice,
} from './file-status-slice';
import {
  createSyncProgressSlice,
  SyncProgressSlice,
} from './sync-progress-slice';
import {
  createSyncLifecycleSlice,
  SyncLifecycleSlice,
} from './sync-lifecycle-slice';
import {
  createHydrationSlice,
  HydrationSlice,
} from './hydration-slice';
import { FileSyncStatus } from './types';

// ============================================================================
// Combined Store Interface
// ============================================================================

export interface FileSyncStatusStore
  extends FileStatusSlice,
    SyncProgressSlice,
    SyncLifecycleSlice,
    HydrationSlice {}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Zustand store for file sync status (refactored)
 *
 * Uses December 2025 Zustand patterns:
 * - Slice composition for single responsibility
 * - Persist middleware on combined store only
 * - Partialize to exclude runtime-only state (syncProgress)
 * - onRehydrateStorage for post-hydration logic
 */
export const useFileSyncStatusStore = create<FileSyncStatusStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // File Status Slice
      ...createFileStatusSlice(set, get),

      // Sync Progress Slice
      ...createSyncProgressSlice(set, get),

      // Sync Lifecycle Slice
      ...createSyncLifecycleSlice(set, get),

      // Hydration Slice
      ...createHydrationSlice(set, get),
    })),
    {
      name: 'via-gent-file-sync-status',
      storage: createJSONStorage(() => createDexieStorage('fileSyncStatus')),
      partialize: (state) => ({
        // Persist: file statuses
        statuses: state.statuses,

        // Do NOT persist: syncProgress (runtime-only state)
        // Do NOT persist: lifecycle fields (isSyncing, progressPercent, etc.)
        // These are runtime-only and should reset on page reload
      }),
      onRehydrateStorage: () => {
        console.log('[FileSyncStatusStore] Hydration starting...');
        return (state, error) => {
          if (error) {
            console.error('[FileSyncStatusStore] Hydration error:', error);
          } else {
            console.log('[FileSyncStatusStore] Hydration complete');
            if (state && state.statuses) {
              // Recompute counts from hydrated statuses
              const counts = {
                total: Object.keys(state.statuses).length,
                pending: Object.values(state.statuses).filter((s: FileSyncStatus) => s.state === 'pending').length,
                synced: Object.values(state.statuses).filter((s: FileSyncStatus) => s.state === 'synced').length,
                error: Object.values(state.statuses).filter((s: FileSyncStatus) => s.state === 'error').length,
              };
              state.counts = counts;
            }
            if (state) {
              state.setHasHydrated(true);
            }
          }
        };
      },
    }
  )
);

// ============================================================================
// Backward Compatibility: Legacy Exports
// ============================================================================

// These functions maintain backward compatibility with the old TanStack Store API
// New code should use the store directly via useFileSyncStatusStore

export function setFileSyncPending(path: string): void {
  useFileSyncStatusStore.getState().setFileSyncPending(path);
}

export function setFileSyncSynced(path: string): void {
  useFileSyncStatusStore.getState().setFileSyncSynced(path);
}

export function setFileSyncError(path: string, error: Error): void {
  useFileSyncStatusStore.getState().setFileSyncError(path, error);
}

export function clearFileSyncStatus(path: string): void {
  useFileSyncStatusStore.getState().clearFileSyncStatus(path);
}

export function clearAllFileSyncStatuses(): void {
  useFileSyncStatusStore.getState().clearAllFileSyncStatuses();
}

// ============================================================================
// Backward Compatibility: Legacy Store Objects
// ============================================================================

/**
 * Legacy fileSyncStatusStore for backward compatibility
 *
 * @deprecated Use useFileSyncStatusStore instead
 *
 * Components using useStore(fileSyncStatusStore, selector) should migrate to:
 * useFileSyncStatusStore(s => s.statuses[path])
 */
export const fileSyncStatusStore = {
  // Simulate the TanStack Store interface for backward compatibility
  state: useFileSyncStatusStore.getState().statuses,
  subscribe: (callback: () => void) => useFileSyncStatusStore.subscribe(callback),
};

/**
 * Legacy fileSyncCountsStore for backward compatibility
 *
 * @deprecated Use useFileSyncStatusStore(s => s.counts) instead
 */
export const fileSyncCountsStore = {
  state: useFileSyncStatusStore.getState().counts,
  subscribe: (callback: () => void) =>
    useFileSyncStatusStore.subscribe((state) => state.counts, callback),
};
