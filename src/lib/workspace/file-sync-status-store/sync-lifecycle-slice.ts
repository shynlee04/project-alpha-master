/**
 * @fileoverview Sync Lifecycle Slice - High-level sync operations
 * @module workspace/file-sync-status-store/sync-lifecycle-slice
 */

import { StateCreator } from 'zustand';
import { SyncStatusType } from './types';

export interface SyncLifecycleSliceState {
  /** Overall sync status type */
  status: SyncStatusType;

  /** Sync start time for elapsed time calculation */
  syncStartTime: number;

  /** Elapsed sync time in milliseconds */
  elapsedTime: number;

  /** Whether sync is currently running */
  isSyncing: boolean;

  /** Files processed count */
  filesProcessed: number;

  /** Total files count */
  totalFiles: number;

  /** Progress percentage */
  progressPercent: number;

  /** User-friendly error message */
  userMessage: string;

  /** Recovery action suggestion */
  recoveryAction: string;
}

export interface SyncLifecycleSliceActions {
  /** Start sync operation */
  startSync: () => void;

  /** Update sync progress (files processed, total files) */
  updateProgress: (filesProcessed: number, totalFiles: number) => void;

  /** Complete sync operation with file count */
  completeSync: (fileCount: number) => void;

  /** Fail sync operation with error */
  failSync: (error: Error) => void;
}

export type SyncLifecycleSlice = SyncLifecycleSliceState & SyncLifecycleSliceActions;

export const createSyncLifecycleSlice: StateCreator<
  SyncLifecycleSlice,
  [],
  [],
  SyncLifecycleSlice
> = (set, get) => ({
  status: 'idle' as SyncStatusType,
  syncStartTime: 0,
  elapsedTime: 0,
  isSyncing: false,
  filesProcessed: 0,
  totalFiles: 0,
  progressPercent: 0,
  userMessage: '',
  recoveryAction: '',

  startSync: () => {
    const startTime = Date.now();
    set({
      status: 'syncing' as SyncStatusType,
      syncStartTime: startTime,
      elapsedTime: 0,
      isSyncing: true,
      syncProgress: {
        isRunning: true,
        current: 0,
        total: 0,
        progress: 0,
        message: 'Syncing...',
      },
    });
  },

  updateProgress: (filesProcessed, totalFiles) => {
    const progress = totalFiles > 0
      ? Math.min((filesProcessed / totalFiles) * 100, 100)
      : 0;

    set((state) => ({
      syncProgress: {
        ...state.syncProgress,
        current: filesProcessed,
        total: totalFiles,
        progress,
        message: `Syncing ${filesProcessed}/${totalFiles} files...`,
      },
      // Update computed properties
      filesProcessed,
      totalFiles,
      progressPercent: progress,
      elapsedTime: state.syncStartTime ? Date.now() - state.syncStartTime : 0,
    }));
  },

  completeSync: (fileCount) => {
    const elapsed = get().syncStartTime ? Date.now() - get().syncStartTime : 0;
    const message = fileCount === 1
      ? 'Sync complete: 1 file'
      : `Sync complete: ${fileCount} files`;

    set({
      status: 'complete' as SyncStatusType,
      isSyncing: false,
      syncProgress: {
        isRunning: false,
        current: fileCount,
        total: fileCount,
        progress: 100,
        message,
      },
      filesProcessed: fileCount,
      totalFiles: fileCount,
      progressPercent: 100,
      elapsedTime: elapsed,
      userMessage: message,
      recoveryAction: '',
    });
  },

  failSync: (error) => {
    const elapsed = get().syncStartTime ? Date.now() - get().syncStartTime : 0;
    const errorName = error.name || '';
    const ERROR_MAPPINGS: Record<string, { userMessage: string; recoveryAction: string }> = {
      'QuotaExceededError': {
        userMessage: 'Storage quota exceeded. Some files could not be saved.',
        recoveryAction: 'Clear browser data or free up storage space.',
      },
      'NotAllowedError': {
        userMessage: 'Permission denied. Please grant file system access.',
        recoveryAction: 'Grant permission when prompted and try again.',
      },
      'PermissionDenied': {
        userMessage: 'Permission denied to access directory.',
        recoveryAction: 'Grant permission when prompted and try again.',
      },
      'NotFoundError': {
        userMessage: 'File or directory not found.',
        recoveryAction: 'Refresh the file list and try again.',
      },
    };
    const errorMapping = ERROR_MAPPINGS[errorName] || {
      userMessage: error.message || 'Sync failed',
      recoveryAction: 'Try again or check file permissions.',
    };

    set({
      status: 'error' as SyncStatusType,
      isSyncing: false,
      syncProgress: {
        isRunning: false,
        error: error.message,
        current: get().syncProgress.current,
        total: get().syncProgress.total,
        progress: get().syncProgress.progress,
      },
      elapsedTime: elapsed,
      userMessage: errorMapping.userMessage,
      recoveryAction: errorMapping.recoveryAction,
    });
  },
});
