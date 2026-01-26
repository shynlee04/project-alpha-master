/**
 * @fileoverview File Comparison Types
 * @module infrastructure/sync/strategies/file-comparison-types
 *
 * Types for file comparison during bidirectional sync operations.
 */

import type { FileMetadata } from '../core/sync-types';

// ============================================================================
// File Comparison Types
// ============================================================================

/**
 * File change status during sync
 */
export type FileChangeStatus =
  | 'unchanged'      // No changes detected
  | 'local-only'     // Only exists/modified in local
  | 'remote-only'    // Only exists/modified in remote
  | 'both-unchanged' // Exists in both, identical
  | 'both-changed';  // Exists in both, both modified (potential conflict)

/**
 * File comparison result
 */
export interface FileComparison {
  /** File path relative to project root */
  path: string;
  /** Change status */
  status: FileChangeStatus;
  /** Local file metadata (if exists) */
  local?: FileMetadata;
  /** Remote file metadata (if exists) */
  remote?: FileMetadata;
  /** Whether local was deleted */
  localDeleted?: boolean;
  /** Whether remote was deleted */
  remoteDeleted?: boolean;
}
