/**
 * @fileoverview Shared types for file sync status store
 * @module workspace/file-sync-status-store/types
 */

/** Overall sync operation status (Story 54-2 - AC1) */
export type SyncStatusType = 'idle' | 'syncing' | 'complete' | 'error';

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
