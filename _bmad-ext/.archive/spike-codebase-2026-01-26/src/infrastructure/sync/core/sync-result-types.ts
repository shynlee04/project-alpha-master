/**
 * @fileoverview Sync Result Type Definitions - Domain Re-exports
 * @module infrastructure/sync/core/sync-result-types
 *
 * ⚠️ DEPRECATED: StorageAdapter interface is now defined in the domain layer.
 * See: /src/domain/interfaces/storage-adapter.interface.ts
 *
 * This file re-exports StorageAdapter from domain for backward compatibility.
 */

import type { SyncDirection, ConflictStrategy } from './sync-core-types.js';
import type { FileContent, FileMetadata } from './file-types.js';

// Re-export from domain layer (Clean Architecture)
// See: /src/domain/interfaces/storage-adapter.interface.ts
export type {
  StorageAdapter,
  FileChangeCallback,
  FileChangeEvent,
} from '@/domain/interfaces/storage-adapter.interface';

// ============================================================================
// Conflict Types (Infrastructure-specific - keep here)
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
// Sync Direction & Strategy (Infrastructure-specific - keep here)
// ============================================================================

/**
 * Sync direction determines how changes flow between storage backends
 *
 * - **local-to-platform**: Local FS → IndexedDB (and optionally WebContainer)
 * - **platform-to-local**: IndexedDB → Local FS (restore from backup)
 * - **bidirectional**: Two-way sync with conflict detection and resolution
 */
export type { SyncDirection, ConflictStrategy } from './sync-core-types.js';
