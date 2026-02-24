/**
 * @fileoverview Handle Persistence Types
 * @module infrastructure/filesystem/handle-types
 * @governance EPIC-CC-01 (Project Space Foundation)
 * @story PS-04 (Handle Persistence Architecture)
 *
 * Serializable types for FileSystemDirectoryHandle persistence.
 * FileSystemDirectoryHandle is NOT serializable - we store metadata only.
 */

import type { FSAHandleRecord } from '@/infrastructure/persistence/dexie-db-types';

/**
 * Serializable metadata about a FileSystemDirectoryHandle.
 * This is what we actually persist to IndexedDB/localStorage.
 *
 * WHY: FileSystemDirectoryHandle cannot be serialized (causes DataCloneError).
 * SOLUTION: Store metadata that enables restoration with user interaction.
 */
export interface StorageHandleMetadata {
  /** Unique ID for this handle (fingerprint) */
  handleId: string;
  /** Directory name for UI display and verification */
  directoryName: string;
  /** Last access timestamp for permission lifecycle */
  lastAccessTime: number;
  /** Whether permission was previously granted */
  permissionGranted: boolean;
  /** Workspace context (ide, knowledge, study, notes) */
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  /** Optional: Handle kind ('directory') */
  kind?: 'directory';
}

/**
 * Result of a handle restoration attempt
 */
export interface HandleRestoreResult {
  /** Whether restoration was successful */
  success: boolean;
  /** The restored handle (null if failed) */
  handle: FileSystemDirectoryHandle | null;
  /** Error message if restoration failed */
  error?: string;
  /** Whether user interaction was required */
  requiresUserInteraction: boolean;
  /** The metadata that was used for restoration */
  restoredFromMetadata?: StorageHandleMetadata;
}

/**
 * Permission state for FSA handles
 * NOTE: Aligned with Dexie FSAHandleRecord.permissionStatus values
 * PS-04: Added 'dismissed' for user-cancelled permission dialogs
 */
export type HandlePermissionState = 'granted' | 'denied' | 'prompt' | 'unknown' | 'dismissed';

/**
 * Configuration for handle persistence operations
 */
export interface HandlePersistenceConfig {
  /** Maximum age of metadata before requiring re-verification (ms) */
  maxMetadataAge?: number;
  /** Whether to attempt silent restore first */
  enableSilentRestore?: boolean;
  /** Silent restore timeout (ms) */
  silentRestoreTimeout?: number;
}

/**
 * Default configuration
 */
export const DEFAULT_HANDLE_PERSISTENCE_CONFIG: HandlePersistenceConfig = {
  maxMetadataAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  enableSilentRestore: true,
  silentRestoreTimeout: 5000, // 5 seconds
};

/**
 * Convert legacy FSAHandleRecord to new StorageHandleMetadata
 */
export function recordToMetadata(record: FSAHandleRecord): StorageHandleMetadata {
  return {
    handleId: record.projectId,
    directoryName: record.directoryPath,
    lastAccessTime: record.lastAccessedAt,
    permissionGranted: record.permissionStatus === 'granted',
    workspaceId: record.workspaceId,
    kind: 'directory',
  };
}

/**
 * Check if browser supports File System Access API
 */
export function isFSASupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}
