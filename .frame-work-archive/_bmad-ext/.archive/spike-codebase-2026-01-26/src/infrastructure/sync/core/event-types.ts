/**
 * @fileoverview Sync Event Type Definitions
 * @module infrastructure/sync/core/event-types
 *
 * All event-related types for the sync system.
 * Events are emitted by SyncEngine for UI consumption.
 */

import type { SyncDirection, ConflictStrategy } from './sync-core-types.js';
import type { FileMetadata } from './file-types.js';

/**
 * Sync event emitted by SyncEngine
 * Components subscribe to these events for UI updates
 */
export interface SyncEvent {
  /** Event type */
  type: SyncEventType;
  /** Event data */
  data: SyncEventData;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Sync event types
 */
export type SyncEventType =
  | 'sync:started'       // Sync operation started
  | 'sync:progress'       // Sync progress update
  | 'sync:completed'      // Sync completed successfully
  | 'sync:failed'         // Sync failed
  | 'file:synced'         // Single file synced
  | 'file:conflict'       // Conflict detected
  | 'file:error'          // File sync error
  | 'quota:warning'       // IndexedDB quota warning
  | 'quota:exceeded';     // IndexedDB quota exceeded

/**
 * Sync event data based on event type
 */
export type SyncEventData =
  | SyncStartedData
  | SyncProgressData
  | SyncCompletedData
  | SyncFailedData
  | FileSyncedData
  | FileConflictData
  | FileErrorData
  | QuotaWarningData
  | QuotaExceededData;

// ============================================================================
// Sync Event Data Types
// ============================================================================

export interface SyncStartedData {
  totalFiles: number;
  direction: SyncDirection;
}

export interface SyncProgressData {
  current: number;
  total: number;
  currentFile?: string;
  percentage: number;
}

export interface SyncCompletedData {
  totalFiles: number;
  syncedFiles: number;
  skippedFiles: number;
  duration: number;
}

export interface SyncFailedData {
  error: string;
  failedAt?: string;
  partialSuccess?: boolean;
}

export interface FileSyncedData {
  path: string;
  direction: 'uploaded' | 'downloaded' | 'synced';
}

export interface FileConflictData {
  path: string;
  localVersion: FileMetadata;
  remoteVersion: FileMetadata;
  strategy?: ConflictStrategy;
}

export interface FileErrorData {
  path: string;
  error: string;
}

export interface QuotaWarningData {
  used: number;
  total: number;
  available: number;
  threshold: number;
}

export interface QuotaExceededData {
  required: number;
  available: number;
}
