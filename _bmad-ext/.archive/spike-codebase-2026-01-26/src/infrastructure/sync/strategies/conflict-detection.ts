/**
 * @fileoverview Conflict Detection Types and Utilities
 * @module infrastructure/sync/strategies/conflict-detection
 *
 * Types and utility functions for conflict detection.
 * Used to identify file conflicts during sync operations.
 */

import type {
  FileContent,
  FileMetadata,
  FileConflict,
} from '../core/sync-types';

// ============================================================================
// Conflict Detection Configuration
// ============================================================================

/**
 * Configuration for conflict detection
 */
export interface ConflictDetectionConfig {
  /** Time threshold in ms for detecting simultaneous edits (default: 1000ms) */
  simultaneousEditThreshold?: number;
  /** Whether to use content checksums for comparison */
  useChecksums?: boolean;
}

// ============================================================================
// User Prompt Types
// ============================================================================

/**
 * User choice for conflict resolution
 */
export type UserConflictChoice = 'local' | 'remote' | 'merge' | 'cancel';

/**
 * Result of user prompt
 */
export interface UserPromptResult {
  /** User's choice */
  choice: UserConflictChoice;
  /** Optional merged content if user chose to merge */
  mergedContent?: FileContent;
}

/**
 * User prompt callback for manual conflict resolution
 */
export type ConflictPromptCallback = (
  conflict: FileConflict
) => Promise<UserPromptResult>;

// ============================================================================
// Conflict Detection Utilities
// ============================================================================

/**
 * Detect conflicts between two sets of file metadata
 * @param localFiles - Local file metadata map
 * @param remoteFiles - Remote file metadata map
 * @param hasConflictFunc - Conflict detection function
 * @returns List of detected conflicts
 */
export function detectConflicts(
  localFiles: Map<string, FileMetadata>,
  remoteFiles: Map<string, FileMetadata>,
  hasConflictFunc: (local: FileMetadata, remote: FileMetadata) => boolean
): FileConflict[] {
  const conflicts: FileConflict[] = [];

  // Find files that exist in both and have been modified
  for (const [path, localMeta] of localFiles) {
    const remoteMeta = remoteFiles.get(path);

    if (remoteMeta && hasConflictFunc(localMeta, remoteMeta)) {
      conflicts.push({
        path,
        local: {
          content: { path, data: new Uint8Array(0), metadata: localMeta },
          metadata: localMeta,
        },
        remote: {
          content: { path, data: new Uint8Array(0), metadata: remoteMeta },
          metadata: remoteMeta,
        },
        detectedAt: Date.now(),
      });
    }
  }

  return conflicts;
}
