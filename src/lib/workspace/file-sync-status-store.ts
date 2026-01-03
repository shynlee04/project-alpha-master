/**
 * @fileoverview File Sync Status Store (Zustand Migration)
 * @module lib/workspace/file-sync-status-store
 * 
 * Story 27-1b: Component Migration to Zustand + Dexie.js
 * 
 * BEFORE: TanStack Store with Map<string, FileSyncStatus>
 * AFTER: Zustand store with Record<string, FileSyncStatus>
 * 
 * CC-2025-12-29: Added Dexie persistence so sync status survives page reload.
 * CC-2025-12-29: Renamed from useSyncStatusStore to useFileSyncStatusStore
 * to avoid namespace collision with sync-status-store.ts.
 * 
 * @example
 * ```tsx
 * import { useFileSyncStatusStore } from '@/lib/workspace';
 * 
 * // Get status for a specific file
 * const status = useFileSyncStatusStore(s => s.statuses[filePath]);
 * 
 * // Get counts
 * const counts = useFileSyncStatusStore(s => s.counts);
 * ```
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '../state/dexie-storage';

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

  /** Whether the store has finished hydrating from persistence */
  _hasHydrated: boolean;

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

  /** Set hydration status */
  setHasHydrated: (hydrated: boolean) => void;
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
 * CC-2025-12-29: Added Dexie persistence so status survives reload.
 */
export const useFileSyncStatusStore = create<SyncStatusState>()(
  persist(
    subscribeWithSelector(
      (set, get) => ({
        statuses: {},
        counts: { synced: 0, pending: 0, error: 0, total: 0 },
        _hasHydrated: false,

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

        setHasHydrated: (hydrated) => {
          set({ _hasHydrated: hydrated } as Partial<SyncStatusState>);
        },
      }),
    ),
    {
      name: 'via-gent-file-sync-status',
      storage: createJSONStorage(() => createDexieStorage('fileSyncStatus')),
      partialize: (state) => ({
        statuses: state.statuses,
        // counts are recomputed from statuses on hydration
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
              state.counts = computeCounts(state.statuses);
            }
            state!._hasHydrated = true;
          }
        };
      },
    }
  )
);

// ============================================================================
// Backward Compatibility Exports (Legacy API)
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
// Legacy Store Compatibility Layer
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
