/**
 * @fileoverview Sync Operation Types
 * @module infrastructure/sync/strategies/sync-operation-types
 *
 * Types for sync operations during bidirectional sync.
 */

// ============================================================================
// Sync Operation Types
// ============================================================================

/**
 * Sync operation for a single file
 */
export interface FileSyncOperation {
  /** File path */
  path: string;
  /** Operation to perform */
  operation: 'skip' | 'upload' | 'download' | 'delete-local' | 'delete-remote' | 'resolve-conflict';
  /** Source adapter to read from */
  source: 'local' | 'remote';
  /** Target adapter to write to */
  target: 'local' | 'remote';
}
