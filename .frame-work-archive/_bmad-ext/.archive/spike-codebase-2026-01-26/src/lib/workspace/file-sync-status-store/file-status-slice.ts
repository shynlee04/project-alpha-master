/**
 * @fileoverview File Status Slice - Individual file status CRUD operations
 * @module workspace/file-sync-status-store/file-status-slice
 */

import { StateCreator } from 'zustand';
import { FileSyncStatus, FileSyncCounts } from './types';

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

export interface FileStatusSliceState {
  /** Map of file path to sync status */
  statuses: Record<string, FileSyncStatus>;

  /** Computed counts (derived from statuses) */
  counts: FileSyncCounts;
}

export interface FileStatusSliceActions {
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

export type FileStatusSlice = FileStatusSliceState & FileStatusSliceActions;

export const createFileStatusSlice: StateCreator<
  FileStatusSlice,
  [],
  [],
  FileStatusSlice
> = (set, get) => ({
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
});
