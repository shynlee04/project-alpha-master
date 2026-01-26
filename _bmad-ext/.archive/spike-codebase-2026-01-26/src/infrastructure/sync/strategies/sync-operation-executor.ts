/**
 * @fileoverview Sync Operation Executor - Execute individual sync operations
 * @module infrastructure/sync/strategies/sync-operation-executor
 *
 * Handles execution of individual sync operations including upload,
 * download, delete, and conflict resolution.
 */

import type {
  StorageAdapter,
  ConflictStrategy,
} from '../core/sync-types';
import type { FileComparison } from './file-comparison-types';
import type { FileSyncOperation } from './sync-operation-types';
import { emitFileConflict } from '../core/sync-events';

// ============================================================================
// Sync Operation Generation
// ============================================================================

export interface OperationGeneratorConfig {
  debugMode?: boolean;
}

/**
 * Generate sync operations based on comparisons and direction
 * @param comparisons - File comparisons
 * @param direction - Sync direction
 * @returns Sync operations to execute
 */
export function generateOperations(
  comparisons: FileComparison[],
  direction: import('../core/sync-types').SyncDirection
): FileSyncOperation[] {
  const operations: FileSyncOperation[] = [];

  for (const comp of comparisons) {
    const op = generateOperationForFile(comp, direction);
    if (op) {
      operations.push(op);
    }
  }

  return operations;
}

/**
 * Generate operation for a single file
 */
function generateOperationForFile(
  comp: FileComparison,
  direction: import('../core/sync-types').SyncDirection
): FileSyncOperation | null {
  switch (direction) {
    case 'local-to-platform':
      return generateLocalToRemoteOperation(comp);
    case 'platform-to-local':
      return generateRemoteToLocalOperation(comp);
    case 'bidirectional':
      return generateBidirectionalOperation(comp);
  }
}

function generateLocalToRemoteOperation(comp: FileComparison): FileSyncOperation | null {
  if (comp.status === 'local-only') {
    return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
  }
  if (comp.status === 'remote-only') {
    return { path: comp.path, operation: 'delete-remote', source: 'local', target: 'remote' };
  }
  if (comp.status === 'both-changed' || comp.status === 'both-unchanged') {
    if (comp.local!.lastModified > comp.remote!.lastModified) {
      return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
    }
  }
  return { path: comp.path, operation: 'skip', source: 'local', target: 'remote' };
}

function generateRemoteToLocalOperation(comp: FileComparison): FileSyncOperation | null {
  if (comp.status === 'remote-only') {
    return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
  }
  if (comp.status === 'local-only') {
    return { path: comp.path, operation: 'delete-local', source: 'remote', target: 'local' };
  }
  if (comp.status === 'both-changed' || comp.status === 'both-unchanged') {
    if (comp.remote!.lastModified > comp.local!.lastModified) {
      return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
    }
  }
  return { path: comp.path, operation: 'skip', source: 'remote', target: 'local' };
}

function generateBidirectionalOperation(comp: FileComparison): FileSyncOperation | null {
  if (comp.status === 'local-only') {
    return { path: comp.path, operation: 'upload', source: 'local', target: 'remote' };
  }
  if (comp.status === 'remote-only') {
    return { path: comp.path, operation: 'download', source: 'remote', target: 'local' };
  }
  if (comp.status === 'both-changed') {
    return { path: comp.path, operation: 'resolve-conflict', source: 'local', target: 'remote' };
  }
  return { path: comp.path, operation: 'skip', source: 'local', target: 'remote' };
}

// ============================================================================
// Sync Operation Execution
// ============================================================================

export interface ExecutorConfig {
  localAdapter: StorageAdapter;
  remoteAdapter: StorageAdapter;
  debugMode?: boolean;
}

/**
 * Execute a single sync operation
 * @param op - Operation to execute
 * @param config - Executor configuration
 * @param conflictStrategy - Strategy for conflict resolution
 */
export async function executeOperation(
  op: FileSyncOperation,
  config: ExecutorConfig,
  conflictStrategy: ConflictStrategy
): Promise<void> {
  switch (op.operation) {
    case 'skip':
      // No action needed
      break;
    case 'upload':
      await uploadToRemote(op.path, config);
      break;
    case 'download':
      await downloadFromRemote(op.path, config);
      break;
    case 'delete-local':
      await config.localAdapter.deleteFile(op.path);
      break;
    case 'delete-remote':
      await config.remoteAdapter.deleteFile(op.path);
      break;
    case 'resolve-conflict':
      await resolveConflict(op.path, config, conflictStrategy);
      break;
  }
}

/**
 * Upload file from local to remote
 */
async function uploadToRemote(path: string, config: ExecutorConfig): Promise<void> {
  const content = await config.localAdapter.readFile(path);
  await config.remoteAdapter.writeFile(path, content.data);
  if (config.debugMode) {
    console.log(`[SyncExecutor] Uploaded: ${path}`);
  }
}

/**
 * Download file from remote to local
 */
async function downloadFromRemote(path: string, config: ExecutorConfig): Promise<void> {
  const content = await config.remoteAdapter.readFile(path);
  await config.localAdapter.writeFile(path, content.data);
  if (config.debugMode) {
    console.log(`[SyncExecutor] Downloaded: ${path}`);
  }
}

/**
 * Resolve conflict using specified strategy
 */
async function resolveConflict(
  path: string,
  config: ExecutorConfig,
  strategy: ConflictStrategy
): Promise<void> {
  const localMeta = await config.localAdapter.getMetadata(path);
  const remoteMeta = await config.remoteAdapter.getMetadata(path);

  // Emit conflict event for UI
  emitFileConflict(path, localMeta, remoteMeta);

  switch (strategy) {
    case 'last-write-wins':
      if (localMeta.lastModified > remoteMeta.lastModified) {
        await uploadToRemote(path, config);
      } else {
        await downloadFromRemote(path, config);
      }
      break;
    case 'source-wins':
      await uploadToRemote(path, config);
      break;
    case 'target-wins':
      await downloadFromRemote(path, config);
      break;
    case 'manual-merge':
      // For now, use last-write-wins as default
      if (localMeta.lastModified > remoteMeta.lastModified) {
        await uploadToRemote(path, config);
      } else {
        await downloadFromRemote(path, config);
      }
      break;
  }
}

/**
 * Get direction string for event emission
 */
export function getDirectionForOperation(op: FileSyncOperation): 'uploaded' | 'downloaded' | 'synced' {
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
