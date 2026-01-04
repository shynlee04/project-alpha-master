/**
 * @fileoverview Bidirectional Sync Strategy Core
 * @module infrastructure/sync/strategies/bidirectional-sync-core
 *
 * Implements bidirectional synchronization between storage adapters.
 * Detects local vs platform changes and handles conflict resolution.
 *
 * **Sync Directions:**
 * - **local-to-platform**: Local FS is source of truth (push changes)
 * - **platform-to-local**: IndexedDB is source of truth (pull/restore)
 * - **bidirectional**: Two-way sync with conflict detection
 *
 * **Change Detection:**
 * - Compares `lastModified` timestamps
 * - Detects created, modified, and deleted files
 * - Uses checksums for content comparison (optional)
 *
 * @example
 * ```ts
 * import { BidirectionalSync } from '@/infrastructure/sync/strategies/bidirectional-sync-core';
 *
 * const sync = new BidirectionalSync(fsaAdapter, idbAdapter);
 * const result = await sync.sync({
 *   direction: 'bidirectional',
 *   conflictStrategy: 'last-write-wins',
 * });
 * ```
 */

import type {
  StorageAdapter,
  SyncOptions,
  SyncResult,
  SyncDirection,
  ConflictStrategy,
} from '../core/sync-types';
import type { FileComparison } from './file-comparison-types';
import type { FileSyncOperation } from './sync-operation-types';
import { emitSyncStarted, emitSyncProgress, emitSyncCompleted, emitSyncFailed, emitFileSynced, emitFileConflict } from '../core/sync-events';

// ============================================================================
// Bidirectional Sync Strategy
// ============================================================================

/**
 * Bidirectional Sync Strategy
 *
 * Orchestrates sync between two storage adapters with change detection
 * and conflict resolution support.
 */
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
   * @param options - Sync options
   * @returns Sync result with statistics
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const direction = options.direction ?? 'bidirectional';
    const conflictStrategy = options.conflictStrategy ?? 'last-write-wins';

    // Emit sync started event
    const allFiles = await this.listAllFiles(options.exclusions);
    emitSyncStarted(allFiles.length, direction);

    // Track sync state
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
      // Compare files between adapters
      const comparisons = await this.compareFiles(allFiles);
      this.debug(`Compared ${comparisons.length} files`);

      // Generate sync operations based on direction
      const operations = this.generateOperations(comparisons, direction);
      this.debug(`Generated ${operations.length} sync operations`);

      // Execute operations in batches
      const batchSize = options.batchSize ?? 50;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);

        for (const op of batch) {
          emitSyncProgress(i + Math.min(batch.indexOf(op) + 1, batchSize), operations.length, op.path);

          try {
            await this.executeOperation(op, conflictStrategy);
            result.syncedFiles++;
            emitFileSynced(op.path, this.getDirectionForOperation(op));
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

      // Emit sync completed event
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
   * @param paths - File paths to compare
   * @returns File comparison results
   */
  private async compareFiles(paths: string[]): Promise<FileComparison[]> {
    const comparisons: FileComparison[] = [];

    for (const path of paths) {
      const localExists = await this.localAdapter.exists(path);
      const remoteExists = await this.remoteAdapter.exists(path);

      if (!localExists && !remoteExists) {
        continue; // Skip files that don't exist anywhere
      }

      const comparison: FileComparison = { path, status: 'unchanged' };

      if (localExists && !remoteExists) {
        comparison.status = 'local-only';
        comparison.local = await this.localAdapter.getMetadata(path);
      } else if (!localExists && remoteExists) {
        comparison.status = 'remote-only';
        comparison.remote = await this.remoteAdapter.getMetadata(path);
      } else {
        // File exists in both - compare metadata
        comparison.local = await this.localAdapter.getMetadata(path);
        comparison.remote = await this.remoteAdapter.getMetadata(path);

        const localMod = comparison.local.lastModified;
        const remoteMod = comparison.remote.lastModified;

        // Determine status based on timestamps
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
   * Generate sync operations based on comparisons and direction
   * @param comparisons - File comparisons
   * @param direction - Sync direction
   * @returns Sync operations to execute
   */
  private generateOperations(
    comparisons: FileComparison[],
    direction: SyncDirection
  ): FileSyncOperation[] {
    const operations: FileSyncOperation[] = [];

    for (const comp of comparisons) {
      const op = this.generateOperationForFile(comp, direction);
      if (op) {
        operations.push(op);
      }
    }

    return operations;
  }

  /**
   * Generate operation for a single file
   * @param comp - File comparison
   * @param direction - Sync direction
   * @returns Sync operation or null if no operation needed
   */
  private generateOperationForFile(
    comp: FileComparison,
    direction: SyncDirection
  ): FileSyncOperation | null {
    switch (direction) {
      case 'local-to-platform':
        return this.generateLocalToRemoteOperation(comp);

      case 'platform-to-local':
        return this.generateRemoteToLocalOperation(comp);

      case 'bidirectional':
        return this.generateBidirectionalOperation(comp);
    }
  }

  /**
   * Generate operation for local-to-platform sync
   */
  private generateLocalToRemoteOperation(comp: FileComparison): FileSyncOperation | null {
    if (comp.status === 'local-only') {
      return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
    }
    if (comp.status === 'remote-only') {
      return { path: comp.path, operation: 'delete-remote', source: 'local', target: 'remote' };
    }
    if (comp.status === 'both-changed' || comp.status === 'both-unchanged') {
      // Local is newer - upload
      if (comp.local!.lastModified > comp.remote!.lastModified) {
        return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
      }
    }
    return { path: comp.path, operation: 'skip', source: 'local', target: 'remote' };
  }

  /**
   * Generate operation for platform-to-local sync
   */
  private generateRemoteToLocalOperation(comp: FileComparison): FileSyncOperation | null {
    if (comp.status === 'remote-only') {
      return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
    }
    if (comp.status === 'local-only') {
      return { path: comp.path, operation: 'delete-local', source: 'remote', target: 'local' };
    }
    if (comp.status === 'both-changed' || comp.status === 'both-unchanged') {
      // Remote is newer - download
      if (comp.remote!.lastModified > comp.local!.lastModified) {
        return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
      }
    }
    return { path: comp.path, operation: 'skip', source: 'remote', target: 'local' };
  }

  /**
   * Generate operation for bidirectional sync
   */
  private generateBidirectionalOperation(comp: FileComparison): FileSyncOperation | null {
    if (comp.status === 'local-only') {
      return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
    }
    if (comp.status === 'remote-only') {
      return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
    }
    if (comp.status === 'both-changed') {
      // Conflict - will be resolved during execution
      return { path: comp.path, operation: 'resolve-conflict', source: 'local', target: 'remote' };
    }
    return { path: comp.path, operation: 'skip', source: 'local', target: 'remote' };
  }

  /**
   * Execute a single sync operation
   * @param op - Operation to execute
   * @param conflictStrategy - Strategy for conflict resolution
   */
  private async executeOperation(
    op: FileSyncOperation,
    conflictStrategy: ConflictStrategy
  ): Promise<void> {
    switch (op.operation) {
      case 'skip':
        // No action needed
        break;

      case 'upload':
        await this.uploadToRemote(op.path);
        break;

      case 'download':
        await this.downloadFromRemote(op.path);
        break;

      case 'delete-local':
        await this.localAdapter.deleteFile(op.path);
        break;

      case 'delete-remote':
        await this.remoteAdapter.deleteFile(op.path);
        break;

      case 'resolve-conflict':
        await this.resolveConflict(op.path, conflictStrategy);
        break;
    }
  }

  /**
   * Upload file from local to remote
   */
  private async uploadToRemote(path: string): Promise<void> {
    const content = await this.localAdapter.readFile(path);
    await this.remoteAdapter.writeFile(path, content.data);
  }

  /**
   * Download file from remote to local
   */
  private async downloadFromRemote(path: string): Promise<void> {
    const content = await this.remoteAdapter.readFile(path);
    await this.localAdapter.writeFile(path, content.data);
  }

  /**
   * Resolve conflict using specified strategy
   * @param path - File path with conflict
   * @param strategy - Conflict resolution strategy
   */
  private async resolveConflict(
    path: string,
    strategy: ConflictStrategy
  ): Promise<void> {
    const localMeta = await this.localAdapter.getMetadata(path);
    const remoteMeta = await this.remoteAdapter.getMetadata(path);

    // Emit conflict event for UI
    emitFileConflict(path, localMeta, remoteMeta);

    switch (strategy) {
      case 'last-write-wins':
        // Most recent timestamp wins
        if (localMeta.lastModified > remoteMeta.lastModified) {
          await this.uploadToRemote(path);
        } else {
          await this.downloadFromRemote(path);
        }
        break;

      case 'source-wins':
        // Local always wins
        await this.uploadToRemote(path);
        break;

      case 'target-wins':
        // Remote always wins
        await this.downloadFromRemote(path);
        break;

      case 'manual-merge':
        // For now, use last-write-wins as default
        // In production, this would trigger a user prompt
        if (localMeta.lastModified > remoteMeta.lastModified) {
          await this.uploadToRemote(path);
        } else {
          await this.downloadFromRemote(path);
        }
        break;
    }
  }

  /**
   * List all files from both adapters (combined and deduplicated)
   * @param exclusions - Glob patterns to exclude
   * @returns Combined list of file paths
   */
  private async listAllFiles(exclusions: string[] = []): Promise<string[]> {
    const localFiles = await this.localAdapter.listFiles('**/*');
    const remoteFiles = await this.remoteAdapter.listFiles('**/*');

    // Combine and deduplicate
    const allFiles = new Set([...localFiles, ...remoteFiles]);

    // Apply exclusions
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
   * Get direction string for event emission
   */
  private getDirectionForOperation(op: FileSyncOperation): 'uploaded' | 'downloaded' | 'synced' {
    switch (op.operation) {
      case 'upload':
        return 'uploaded';
      case 'download':
        return 'downloaded';
      case 'resolve-conflict':
        return 'synced';
      default:
        return 'synced';
    }
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

/**
 * Create a bidirectional sync instance
 */
export function createBidirectionalSync(
  localAdapter: StorageAdapter,
  remoteAdapter: StorageAdapter,
  debugMode = false
): BidirectionalSync {
  return new BidirectionalSync(localAdapter, remoteAdapter, debugMode);
}

/**
 * Default bidirectional sync instance (requires adapters to be set later)
 */
export const bidirectionalSync = {
  create: createBidirectionalSync,
};
