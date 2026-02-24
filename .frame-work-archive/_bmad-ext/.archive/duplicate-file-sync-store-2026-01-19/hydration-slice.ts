/**
 * @fileoverview Hydration Slice - Persistence hydration tracking
 * @module workspace/file-sync-status-store/hydration-slice
 */

import { StateCreator } from 'zustand';
import { FileSyncStatus, FileSyncCounts } from './types';

/**
 * Compute counts from statuses (reused from file-status-slice)
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

export interface HydrationSliceState {
  /** Whether the store has finished hydrating from persistence */
  _hasHydrated: boolean;
}

export interface HydrationSliceActions {
  /** Set hydration status */
  setHasHydrated: (hydrated: boolean) => void;

  /** Rehydrate counts from persisted statuses (called by onRehydrateStorage) */
  recomputeCounts: (statuses: Record<string, FileSyncStatus>) => FileSyncCounts;
}

export type HydrationSlice = HydrationSliceState & HydrationSliceActions;

export const createHydrationSlice: StateCreator<
  HydrationSlice,
  [],
  [],
  HydrationSlice
> = (set) => ({
  _hasHydrated: false,

  setHasHydrated: (hydrated) => {
    set({ _hasHydrated: hydrated });
  },

  recomputeCounts: (statuses) => {
    return computeCounts(statuses);
  },
});
