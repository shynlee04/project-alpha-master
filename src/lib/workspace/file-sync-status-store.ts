/**
 * @fileoverview File Sync Status Store (Zustand Migration)
 * @module lib/workspace/file-sync-status-store
 * 
 * Story 27-1b: Component Migration to Zustand + Dexie.js
 * 
 * BEFORE: TanStack Store with Map<string, FileSyncStatus>
 * AFTER: Zustand store with Record<string, FileSyncStatus>
 * 
 * Note: This store is NOT persisted - sync status is runtime-only.
 * It resets when the page reloads, which is correct behavior.
 * 
 * @example
 * ```tsx
 * import { useSyncStatusStore } from '@/lib/workspace';
 * 
 * // Get status for a specific file
 * const status = useSyncStatusStore(s => s.statuses[filePath]);
 * 
 * // Get counts
 * const counts = useSyncStatusStore(s => s.counts);
 * ```
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ============================================================================
// Types
// ============================================================================

export type FileSyncState = 'synced' | 'pending' | 'error';

export interface FileSyncStatus {
  state: FileSyncState;
  updatedAt: number;
  errorMessage?: string;
  errorStack?: string;
}

export interface FileSyncCounts {
  synced: number;
  pending: number;
  error: number;
  total: number;
}

interface SyncStatusState {
  /** Map of file path to sync status */
  statuses: Record<string, FileSyncStatus>;

  /** Computed counts (derived from statuses) */
  counts: FileSyncCounts;

  /** Set a file's status to pending */
  setFileSyncPending: (path: string) => void;

  /** Set a file's status to synced */
  setFileSyncSynced: (path: string) => void;

  /** Set a file's status to error */
  setFileSyncError: (path: string, error: Error) => void;

  /** Clear a specific file's status */
  clearFileSyncStatus: (path: string) => void;

  /** Clear all file sync statuses */
  clearAllFileSyncStatuses: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compute counts from statuses
 */
function computeCounts(statuses: Record<string, FileSyncStatus>): FileSyncCounts {
  let synced = 0;
  let pending = 0;
  let error = 0;

  for (const status of Object.values(statuses)) {
    if (status.state === 'synced') synced += 1;
    else if (status.state === 'pending') pending += 1;
    else error += 1;
  }

  return { synced, pending, error, total: Object.keys(statuses).length };
}

// ============================================================================
// Store
// ============================================================================

/**
 * Zustand store for file sync status
 * 
 * Replaces the TanStack Store implementation.
 * Note: No persistence - sync status is transient runtime state.
 */
export const useSyncStatusStore = create<SyncStatusState>()(
  subscribeWithSelector(
    (set, get) => ({
      statuses: {},
      counts: { synced: 0, pending: 0, error: 0, total: 0 },

      setFileSyncPending: (path) => {
        if (!path) return;
        const now = Date.now();
        set((state) => {
          const newStatuses = {
            ...state.statuses,
            [path]: { state: 'pending' as const, updatedAt: now },
          };
          return {
            statuses: newStatuses,
            counts: computeCounts(newStatuses),
          };
        });
      },

      setFileSyncSynced: (path) => {
        if (!path) return;
        const now = Date.now();
        set((state) => {
          const newStatuses = {
            ...state.statuses,
            [path]: { state: 'synced' as const, updatedAt: now },
          };
          return {
            statuses: newStatuses,
            counts: computeCounts(newStatuses),
          };
        });
      },

      setFileSyncError: (path, error) => {
        if (!path) return;
        const now = Date.now();
        set((state) => {
          const newStatuses = {
            ...state.statuses,
            [path]: {
              state: 'error' as const,
              updatedAt: now,
              errorMessage: error.message,
              errorStack: error.stack,
            },
          };
          return {
            statuses: newStatuses,
            counts: computeCounts(newStatuses),
          };
        });
      },

      clearFileSyncStatus: (path) => {
        if (!path) return;
        const current = get().statuses;
        if (!(path in current)) return;

        set((state) => {
          const { [path]: _, ...rest } = state.statuses;
          return {
            statuses: rest,
            counts: computeCounts(rest),
          };
        });
      },

      clearAllFileSyncStatuses: () => {
        set({
          statuses: {},
          counts: { synced: 0, pending: 0, error: 0, total: 0 },
        });
      },
    }),
  ),
);

// ============================================================================
// Backward Compatibility Exports (Legacy API)
// ============================================================================

// These functions maintain backward compatibility with the old TanStack Store API
// New code should use the store directly via useSyncStatusStore

export function setFileSyncPending(path: string): void {
  useSyncStatusStore.getState().setFileSyncPending(path);
}

export function setFileSyncSynced(path: string): void {
  useSyncStatusStore.getState().setFileSyncSynced(path);
}

export function setFileSyncError(path: string, error: Error): void {
  useSyncStatusStore.getState().setFileSyncError(path, error);
}

export function clearFileSyncStatus(path: string): void {
  useSyncStatusStore.getState().clearFileSyncStatus(path);
}

export function clearAllFileSyncStatuses(): void {
  useSyncStatusStore.getState().clearAllFileSyncStatuses();
}

// ============================================================================
// Legacy Store Compatibility Layer
// ============================================================================

/**
 * Legacy fileSyncStatusStore for backward compatibility
 * 
 * @deprecated Use useSyncStatusStore instead
 * 
 * Components using useStore(fileSyncStatusStore, selector) should migrate to:
 * useSyncStatusStore(s => s.statuses[path])
 */
export const fileSyncStatusStore = {
  // Simulate the TanStack Store interface for backward compatibility
  state: useSyncStatusStore.getState().statuses,
  subscribe: (callback: () => void) => useSyncStatusStore.subscribe(callback),
};

/**
 * Legacy fileSyncCountsStore for backward compatibility
 * 
 * @deprecated Use useSyncStatusStore(s => s.counts) instead
 */
export const fileSyncCountsStore = {
  state: useSyncStatusStore.getState().counts,
  subscribe: (callback: () => void) =>
    useSyncStatusStore.subscribe((state) => state.counts, callback),
};
