/**
 * @fileoverview Sync Progress Slice - Event bus progress tracking
 * @module workspace/file-sync-status-store/sync-progress-slice
 */

import { StateCreator } from 'zustand';
import { SyncProgress } from './types';

export interface SyncProgressSliceState {
  /** Sync operation progress (event bus integration, not persisted) */
  syncProgress: SyncProgress;
}

export interface SyncProgressSliceActions {
  /** Sync progress actions (event bus integration) */
  setSyncStarted: (total: number) => void;
  setSyncProgress: (current: number, total: number, message?: string) => void;
  setSyncCompleted: (message?: string) => void;
  setSyncFailed: (error: string) => void;
}

export type SyncProgressSlice = SyncProgressSliceState & SyncProgressSliceActions;

export const createSyncProgressSlice: StateCreator<
  SyncProgressSlice,
  [],
  [],
  SyncProgressSlice
> = (set) => ({
  syncProgress: {
    isRunning: false,
    current: 0,
    total: 0,
    progress: 0,
  },

  setSyncStarted: (total) => {
    set({
      syncProgress: {
        isRunning: true,
        current: 0,
        total,
        progress: 0,
        message: `Starting sync of ${total} files...`,
      },
    });
  },

  setSyncProgress: (current, total, message) => {
    set((state) => ({
      syncProgress: {
        ...state.syncProgress,
        current,
        total,
        progress: total > 0 ? (current / total) * 100 : 0,
        message: message || `Syncing ${current}/${total} files...`,
      },
    }));
  },

  setSyncCompleted: (message) => {
    set((state) => ({
      syncProgress: {
        ...state.syncProgress,
        isRunning: false,
        progress: 100,
        message: message || `Synced ${state.syncProgress.total} files successfully`,
      },
    }));
  },

  setSyncFailed: (error) => {
    set((state) => ({
      syncProgress: {
        ...state.syncProgress,
        isRunning: false,
        error,
      },
    }));
  },
});
