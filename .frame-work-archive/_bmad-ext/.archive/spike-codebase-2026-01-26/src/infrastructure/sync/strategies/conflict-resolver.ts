/**
 * @fileoverview Conflict Resolver Implementation
 * @module infrastructure/sync/strategies/conflict-resolver
 *
 * Implements four conflict resolution strategies for bidirectional sync.
 * Detects and resolves file conflicts during sync operations.
 */

import type {
  FileContent,
  FileMetadata,
  ConflictResolution as ConflictResolutionType,
  FileConflict,
  ConflictStrategy,
} from '../core/sync-types';
import type {
  ConflictDetectionConfig,
  ConflictPromptCallback,
} from './conflict-detection';

// ============================================================================
// Conflict Resolver
// ============================================================================

/**
 * Conflict Resolver
 *
 * Detects and resolves file conflicts during sync operations.
 */
export class ConflictResolver {
  private simultaneousThreshold: number;
  private useChecksums: boolean;
  private userPromptCallback?: ConflictPromptCallback;

  constructor(config: ConflictDetectionConfig = {}) {
    this.simultaneousThreshold = config.simultaneousEditThreshold ?? 1000;
    this.useChecksums = config.useChecksums ?? false;
  }

  /**
   * Set user prompt callback for manual conflict resolution
   * @param callback - Function to prompt user for conflict resolution
   */
  setUserPromptCallback(callback: ConflictPromptCallback): void {
    this.userPromptCallback = callback;
  }

  /**
   * Detect if there's a conflict between two file versions
   * @param local - Local file metadata
   * @param remote - Remote file metadata
   * @returns Whether conflict exists
   */
  hasConflict(local: FileMetadata, remote: FileMetadata): boolean {
    // Conflict exists if both have different modification times
    const timeDiff = Math.abs(local.lastModified - remote.lastModified);

    // Consider simultaneous if within threshold
    if (timeDiff < this.simultaneousThreshold) {
      return true; // Simultaneous edit
    }

    // Check if both were modified after last sync
    if (local.lastSyncedAt && remote.lastSyncedAt) {
      const localModifiedAfter = local.lastModified > local.lastSyncedAt;
      const remoteModifiedAfter = remote.lastModified > remote.lastSyncedAt;

      return localModifiedAfter && remoteModifiedAfter;
    }

    // Assume conflict if timestamps differ significantly
    return local.lastModified !== remote.lastModified;
  }

  /**
   * Resolve conflict using specified strategy
   * @param conflict - File conflict details
   * @param strategy - Resolution strategy
   * @returns Resolution result
   */
  async resolve(
    conflict: FileConflict,
    strategy: ConflictStrategy
  ): Promise<ConflictResolutionType> {
    const timestamp = Date.now();

    switch (strategy) {
      case 'last-write-wins':
        return this.resolveLastWriteWins(conflict, timestamp);

      case 'source-wins':
        return this.resolveSourceWins(conflict, timestamp);

      case 'target-wins':
        return this.resolveTargetWins(conflict, timestamp);

      case 'manual-merge':
        return await this.resolveManualMerge(conflict, timestamp);

      default:
        return this.resolveLastWriteWins(conflict, timestamp);
    }
  }

  /**
   * Last-write-wins strategy: most recent modification wins
   */
  private resolveLastWriteWins(
    conflict: FileConflict,
    timestamp: number
  ): ConflictResolutionType {
    const localTime = conflict.local.metadata.lastModified;
    const remoteTime = conflict.remote.metadata.lastModified;

    const strategy = localTime > remoteTime ? 'source-wins' : 'target-wins';
    const winner = localTime > remoteTime ? conflict.local.content : conflict.remote.content;

    return {
      strategy,
      content: winner,
      userPrompted: false,
      resolvedAt: timestamp,
    };
  }

  /**
   * Source-wins strategy: local version always wins
   */
  private resolveSourceWins(
    conflict: FileConflict,
    timestamp: number
  ): ConflictResolutionType {
    return {
      strategy: 'source-wins',
      content: conflict.local.content,
      userPrompted: false,
      resolvedAt: timestamp,
    };
  }

  /**
   * Target-wins strategy: platform version always wins
   */
  private resolveTargetWins(
    conflict: FileConflict,
    timestamp: number
  ): ConflictResolutionType {
    return {
      strategy: 'target-wins',
      content: conflict.remote.content,
      userPrompted: false,
      resolvedAt: timestamp,
    };
  }

  /**
   * Manual merge strategy: prompt user to choose
   */
  private async resolveManualMerge(
    conflict: FileConflict,
    timestamp: number
  ): Promise<ConflictResolutionType> {
    if (!this.userPromptCallback) {
      // Fallback to last-write-wins if no callback set
      return this.resolveLastWriteWins(conflict, timestamp);
    }

    try {
      const result = await this.userPromptCallback(conflict);

      switch (result.choice) {
        case 'local':
          return {
            strategy: 'manual-merge',
            content: conflict.local.content,
            userPrompted: true,
            resolvedAt: timestamp,
          };

        case 'remote':
          return {
            strategy: 'manual-merge',
            content: conflict.remote.content,
            userPrompted: true,
            resolvedAt: timestamp,
          };

        case 'merge':
          return {
            strategy: 'manual-merge',
            content: result.mergedContent ?? conflict.local.content,
            userPrompted: true,
            resolvedAt: timestamp,
          };

        case 'cancel':
          // User cancelled - keep local version
          return {
            strategy: 'manual-merge',
            content: conflict.local.content,
            userPrompted: true,
            resolvedAt: timestamp,
          };

        default:
          return this.resolveLastWriteWins(conflict, timestamp);
      }
    } catch {
      // Error in prompt - fallback to last-write-wins
      return this.resolveLastWriteWins(conflict, timestamp);
    }
  }

  /**
   * Create checksum for content comparison
   * @param content - File content
   * @returns Checksum string
   */
  createChecksum(content: FileContent): string {
    // Simple checksum based on content length and first/last bytes
    // In production, use crypto.subtle.digest for proper hashing
    const data = content.data;
    const len = data.length;
    if (len === 0) return 'empty';

    const first = data[0].toString(16).padStart(2, '0');
    const last = data[len - 1].toString(16).padStart(2, '0');
    return `${len}-${first}-${last}`;
  }

  /**
   * Compare two file contents for equality
   * @param content1 - First file content
   * @param content2 - Second file content
   * @returns Whether contents are identical
   */
  contentsEqual(content1: FileContent, content2: FileContent): boolean {
    if (content1.data.length !== content2.data.length) {
      return false;
    }

    if (this.useChecksums) {
      return this.createChecksum(content1) === this.createChecksum(content2);
    }

    // Byte-by-byte comparison
    for (let i = 0; i < content1.data.length; i++) {
      if (content1.data[i] !== content2.data[i]) {
        return false;
      }
    }

    return true;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a conflict resolver with config
 */
export function createConflictResolver(
  config?: ConflictDetectionConfig
): ConflictResolver {
  return new ConflictResolver(config);
}

/**
 * Default conflict resolver instance
 */
export const conflictResolver = new ConflictResolver();

/**
 * Detect conflicts between two sets of file metadata
 * @param localFiles - Local file metadata map
 * @param remoteFiles - Remote file metadata map
 * @param resolver - Conflict resolver instance
 * @returns List of detected conflicts
 */
// Re-export detectConflicts from conflict-detection module
export { detectConflicts } from './conflict-detection.js';
