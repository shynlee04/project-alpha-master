/**
 * @fileoverview Sync Result Type Definitions
 * @module infrastructure/sync/core/sync-result-types
 *
 * Sync options, results, conflicts, and storage adapter interface.
 * Core configuration types for sync operations.
 */

import type { SyncDirection, ConflictStrategy } from './sync-core-types.js';
import type { FileChangeEvent, FileContent, FileMetadata } from './file-types.js';

// ============================================================================
// Conflict Types
// ============================================================================

/**
 * File conflict detected during sync
 */
export interface FileConflict {
  /** Conflicting file path */
  path: string;
  /** Local file version */
  local: {
    content: FileContent;
    metadata: FileMetadata;
  };
  /** Remote/platform file version */
  remote: {
    content: FileContent;
    metadata: FileMetadata;
  };
  /** Timestamp when conflict was detected */
  detectedAt: number;
  /** Resolution strategy to apply */
  strategy?: ConflictStrategy;
  /** Resolved content after user choice */
  resolvedContent?: FileContent;
}

/**
 * Conflict resolution result
 */
export interface ConflictResolution {
  /** Chosen strategy */
  strategy: ConflictStrategy;
  /** Resolved file content */
  content: FileContent;
  /** Whether user was prompted for resolution */
  userPrompted: boolean;
  /** Timestamp of resolution */
  resolvedAt: number;
}

// ============================================================================
// Sync Options
// ============================================================================

/**
 * Sync options for fine-tuning behavior
 */
export interface SyncOptions {
  /** Sync direction */
  direction?: SyncDirection;
  /** Conflict resolution strategy */
  conflictStrategy?: ConflictStrategy;
  /** Exclusion patterns (glob patterns) */
  exclusions?: string[];
  /** Batch size for batch operations */
  batchSize?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether to emit events during sync */
  emitEvents?: boolean;
  /** Whether to show progress updates */
  showProgress?: boolean;
  /** Maximum concurrent file operations */
  maxConcurrent?: number;
}

// ============================================================================
// Sync Result
// ============================================================================

/**
 * Sync operation result
 * Provides statistics and error details for sync operations
 */
export interface SyncResult {
  /** Whether sync completed without critical errors */
  success: boolean;
  /** Total files considered for sync */
  totalFiles: number;
  /** Files successfully synced */
  syncedFiles: number;
  /** Files skipped (exclusions, unchanged, etc.) */
  skippedFiles: number;
  /** Files that failed to sync */
  failedFiles: FailedFile[];
  /** Duration in milliseconds */
  duration: number;
  /** Files with conflicts (if any) */
  conflicts?: FileConflict[];
  /** Sync direction used */
  direction: SyncDirection;
}

/**
 * Failed file details
 */
export interface FailedFile {
  /** File path */
  path: string;
  /** Error message */
  error: string;
  /** Error code/name */
  code?: string;
  /** Whether retry was attempted */
  retried?: boolean;
}

// ============================================================================
// Storage Adapter Interface
// ============================================================================

/**
 * File change callback type
 */
export type FileChangeCallback = (event: FileChangeEvent) => void;

/**
 * Storage adapter interface
 * All storage backends (FSA, IndexedDB, WebContainer) must implement this interface
 */
export interface StorageAdapter {
  /**
   * Read file content
   * @param path - File path relative to storage root
   * @returns File content with metadata
   */
  readFile(path: string): Promise<FileContent>;

  /**
   * Write file content
   * @param path - File path relative to storage root
   * @param content - Content to write
   */
  writeFile(path: string, content: Uint8Array): Promise<void>;

  /**
   * Delete file
   * @param path - File path relative to storage root
   */
  deleteFile(path: string): Promise<void>;

  /**
   * List files matching pattern
   * @param pattern - Glob pattern for matching files
   * @returns Array of file paths
   */
  listFiles(pattern: string): Promise<string[]>;

  /**
   * Get file metadata
   * @param path - File path relative to storage root
   * @returns File metadata
   */
  getMetadata(path: string): Promise<FileMetadata>;

  /**
   * Check if file exists
   * @param path - File path relative to storage root
   * @returns Whether file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Watch for file changes
   * @param callback - Callback invoked on file changes
   * @returns Unsubscribe function
   */
  watch?(callback: FileChangeCallback): () => void;

  /**
   * Check adapter availability
   * @returns Whether adapter is ready for use
   */
  isAvailable?(): boolean;

  /**
   * Get adapter name for debugging
   */
  readonly name: string;
}
