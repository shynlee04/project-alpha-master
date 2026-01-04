/**
 * @fileoverview Bidirectional Sync Strategy Core
 * @module infrastructure/sync/strategies/bidirectional-sync-core
 *
 * Implements bidirectional synchronization between storage adapters.
 */

import type {
  StorageAdapter,
  SyncOptions,
  SyncResult,
} from '../core/sync-types';
import type { FileComparison } from './file-comparison-types';
import {
  generateOperations,
  executeOperation,
  getDirectionForOperation,
} from './sync-operation-executor';
import {
  emitSyncStarted,
  emitSyncProgress,
  emitSyncCompleted,
  emitSyncFailed,
  emitFileSynced,
} from '../core/sync-events';

// ============================================================================
// Bidirectional Sync Strategy
// ============================================================================

export class BidirectionalSync {
  private localAdapter: StorageAdapter;
  private remoteAdapter: StorageAdapter;
  private debugMode = false;

  constructor(
    localAdapter: StorageAdapter,
    remoteAdapter: StorageAdapter,
    debugMode = false
  ) {
    this.localAdapter = localAdapter;
    this.remoteAdapter = remoteAdapter;
    this.debugMode = debugMode;
  }

  /**
   * Execute sync operation
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const direction = options.direction ?? 'bidirectional';
    const conflictStrategy = options.conflictStrategy ?? 'last-write-wins';

    const allFiles = await this.listAllFiles(options.exclusions);
    emitSyncStarted(allFiles.length, direction);

    const result: SyncResult = {
      success: false,
      totalFiles: allFiles.length,
      syncedFiles: 0,
      skippedFiles: 0,
      failedFiles: [],
      duration: 0,
      direction,
    };

    const conflicts: import('../core/sync-types').FileConflict[] = [];

    try {
      const comparisons = await this.compareFiles(allFiles);
      this.debug(`Compared ${comparisons.length} files`);

      const operations = generateOperations(comparisons, direction);
      this.debug(`Generated ${operations.length} sync operations`);

      const batchSize = options.batchSize ?? 50;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);

        for (const op of batch) {
          emitSyncProgress(i + Math.min(batch.indexOf(op) + 1, batchSize), operations.length, op.path);

          try {
            await executeOperation(op, {
              localAdapter: this.localAdapter,
              remoteAdapter: this.remoteAdapter,
              debugMode: this.debugMode,
            }, conflictStrategy);
            result.syncedFiles++;
            emitFileSynced(op.path, getDirectionForOperation(op));
          } catch (error) {
            result.failedFiles.push({
              path: op.path,
              error: error instanceof Error ? error.message : String(error),
            });
            this.debug(`Failed to sync ${op.path}:`, error);
          }
        }
      }

      result.skippedFiles = operations.filter(op => op.operation === 'skip').length;
      result.conflicts = conflicts.length > 0 ? conflicts : undefined;
      result.success = result.failedFiles.length === 0;

      const duration = Date.now() - startTime;
      emitSyncCompleted(result.totalFiles, result.syncedFiles, result.skippedFiles, duration);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      emitSyncFailed(errorMsg, undefined, result.syncedFiles > 0);
      result.success = false;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Compare files between adapters to detect changes
   */
  private async compareFiles(paths: string[]): Promise<FileComparison[]> {
    const comparisons: FileComparison[] = [];

    for (const path of paths) {
      const localExists = await this.localAdapter.exists(path);
      const remoteExists = await this.remoteAdapter.exists(path);

      if (!localExists && !remoteExists) {
        continue;
      }

      const comparison: FileComparison = { path, status: 'unchanged' };

      if (localExists && !remoteExists) {
        comparison.status = 'local-only';
        comparison.local = await this.localAdapter.getMetadata(path);
      } else if (!localExists && remoteExists) {
        comparison.status = 'remote-only';
        comparison.remote = await this.remoteAdapter.getMetadata(path);
      } else {
        comparison.local = await this.localAdapter.getMetadata(path);
        comparison.remote = await this.remoteAdapter.getMetadata(path);

        const localMod = comparison.local.lastModified;
        const remoteMod = comparison.remote.lastModified;

        if (localMod === remoteMod) {
          comparison.status = 'both-unchanged';
        } else {
          comparison.status = 'both-changed';
        }
      }

      comparisons.push(comparison);
    }

    return comparisons;
  }

  /**
   * List all files from both adapters (combined and deduplicated)
   */
  private async listAllFiles(exclusions: string[] = []): Promise<string[]> {
    const localFiles = await this.localAdapter.listFiles('**/*');
    const remoteFiles = await this.remoteAdapter.listFiles('**/*');

    const allFiles = new Set([...localFiles, ...remoteFiles]);

    const excluded = new Set<string>();
    for (const pattern of exclusions) {
      const regex = this.globToRegex(pattern);
      for (const file of allFiles) {
        if (regex.test(file)) {
          excluded.add(file);
        }
      }
    }

    return Array.from(allFiles).filter(f => !excluded.has(f));
  }

  /**
   * Convert glob pattern to regex
   */
  private globToRegex(pattern: string): RegExp {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    return new RegExp(`^${regexPattern}$`);
  }

  /**
   * Log debug message
   */
  private debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[BidirectionalSync] ${message}`, ...args);
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createBidirectionalSync(
  localAdapter: StorageAdapter,
  remoteAdapter: StorageAdapter,
  debugMode = false
): BidirectionalSync {
  return new BidirectionalSync(localAdapter, remoteAdapter, debugMode);
}

export const bidirectionalSync = {
  create: createBidirectionalSync,
};
