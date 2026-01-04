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

/** Overall sync operation status (Story 54-2 - AC1) */
export type SyncStatusType = 'idle' | 'syncing' | 'complete' | 'error';

export type FileSyncState = 'synced' | 'pending' | 'error';

/**
 * User-friendly error messages for common sync errors (Story 54-2 - AC1)
 */
interface ErrorMapping {
  [key: string]: {
    userMessage: string;
    recoveryAction: string;
  };
}

const ERROR_MAPPINGS: ErrorMapping = {
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

/**
 * Sync progress state for event bus integration
 *
 * Runtime-only state (not persisted to IndexedDB)
 */
export interface SyncProgress {
  /** Whether a sync operation is currently running */
  isRunning: boolean;
  /** Current file being synced */
  current: number;
  /** Total files to sync */
  total: number;
  /** Progress percentage (0-100) */
  progress: number;
  /** Optional status message */
  message?: string;
  /** Optional error message */
  error?: string;
}

interface SyncStatusState {
  /** Map of file path to sync status */
  statuses: Record<string, FileSyncStatus>;

  /** Computed counts (derived from statuses) */
  counts: FileSyncCounts;

  /** Sync operation progress (event bus integration, not persisted) */
  syncProgress: SyncProgress;

  /** Overall sync status type (Story 54-2 - AC1) */
  status: SyncStatusType;

  /** Sync start time for elapsed time calculation (Story 54-2 - AC1) */
  syncStartTime: number;

  /** Elapsed sync time in milliseconds (Story 54-2 - AC1) */
  elapsedTime: number;

  /** Whether the store has finished hydrating from persistence */
  _hasHydrated: boolean;

  // ========== Computed Properties (Story 54-2 - AC1) ==========

  /** Whether sync is currently running */
  isSyncing: boolean;

  /** Files processed count (same as syncProgress.current) */
  filesProcessed: number;

  /** Total files count (same as syncProgress.total) */
  totalFiles: number;

  /** Progress percentage (same as syncProgress.progress) */
  progressPercent: number;

  /** User-friendly error message (Story 54-2 - AC1) */
  userMessage: string;

  /** Recovery action suggestion (Story 54-2 - AC1) */
  recoveryAction: string;

  // ========== File Status Methods ==========

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

  // ========== Legacy Sync Progress Methods ==========

  /** Sync progress actions (event bus integration) */
  setSyncStarted: (total: number) => void;
  setSyncProgress: (current: number, total: number, message?: string) => void;
  setSyncCompleted: (message?: string) => void;
  setSyncFailed: (error: string) => void;

  // ========== New Sync Methods (Story 54-2 - AC1) ==========

  /** Start sync operation */
  startSync: () => void;

  /** Update sync progress (files processed, total files) */
  updateProgress: (filesProcessed: number, totalFiles: number) => void;

  /** Complete sync operation with file count */
  completeSync: (fileCount: number) => void;

  /** Fail sync operation with error */
  failSync: (error: Error) => void;
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
        syncProgress: {
          isRunning: false,
          current: 0,
          total: 0,
          progress: 0,
        },
        // Story 54-2 - AC1: New state values
        status: 'idle' as SyncStatusType,
        syncStartTime: 0,
        elapsedTime: 0,
        isSyncing: false,
        filesProcessed: 0,
        totalFiles: 0,
        progressPercent: 0,
        userMessage: '',
        recoveryAction: '',
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

        // Sync progress actions (event bus integration)
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

        // ========== Story 54-2 - AC1: New Sync Methods ==========

        /**
         * Start sync operation (Story 54-2 - AC1)
         * Sets status to 'syncing' and records start time
         */
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

        /**
         * Update sync progress (Story 54-2 - AC1)
         * @param filesProcessed - Number of files processed so far
         * @param totalFiles - Total number of files to sync
         */
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

        /**
         * Complete sync operation (Story 54-2 - AC1)
         * @param fileCount - Total number of files synced
         */
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

        /**
         * Fail sync operation (Story 54-2 - AC1)
         * @param error - The error that caused the failure
         */
        failSync: (error) => {
          const elapsed = get().syncStartTime ? Date.now() - get().syncStartTime : 0;
          const errorName = error.name || '';
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
      }),
    ),
    {
      name: 'via-gent-file-sync-status',
      storage: createJSONStorage(() => createDexieStorage('fileSyncStatus')),
      partialize: (state) => ({
        statuses: state.statuses,
        // counts are recomputed from statuses on hydration
        // syncProgress is NOT persisted (runtime-only state)
        // New AC1 fields are also runtime-only
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
            if (state) {
              state._hasHydrated = true;
            }
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
