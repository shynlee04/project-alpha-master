/**
 * @fileoverview File Type Definitions
 * @module infrastructure/sync/core/file-types
 *
 * File metadata, content, and change event types.
 * Used for change detection and conflict resolution.
 */

import type { FileSyncState } from './sync-core-types.js';

/**
 * File metadata from sync operations
 * Used for change detection and conflict resolution
 */
export interface FileMetadata {
  /** File path relative to project root */
  path: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp (milliseconds since epoch) */
  lastModified: number;
  /** Content MIME type (optional) */
  contentType?: string;
  /** Checksum for content comparison (optional) */
  checksum?: string;
  /** Sync state of this file */
  syncState?: FileSyncState;
  /** Last sync timestamp */
  lastSyncedAt?: number;
}

/**
 * File content wrapper for sync operations
 */
export interface FileContent {
  /** File path */
  path: string;
  /** Content as Uint8Array for binary data */
  data: Uint8Array;
  /** Content as string (convenience accessor) */
  text?: string;
  /** Metadata */
  metadata: FileMetadata;
}

/**
 * File change event from watcher or sync operation
 */
export interface FileChangeEvent {
  /** Change type */
  type: 'created' | 'modified' | 'deleted';
  /** File path */
  path: string;
  /** Event timestamp */
  timestamp: number;
  /** Source of the change */
  source: 'local' | 'platform' | 'user';
}
