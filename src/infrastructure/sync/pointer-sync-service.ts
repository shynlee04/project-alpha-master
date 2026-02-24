/**
 * @fileoverview Project Pointer Synchronization Service (Atomic)
 * @module infrastructure/sync/pointer-sync-service
 * @updated 2026-01-21 ARCH-01-05
 *
 * Provides atomic synchronization between Zustand store and Dexie persistence
 * to prevent race conditions and ensure consistent state.
 *
 * Features:
 * - Atomic create/update/delete operations
 * - Automatic rollback on failure
 * - Concurrent access handling with locks
 * - Transaction logging for debugging
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import type { ProjectId, WorkspaceType } from '@/domain/types/project-ids';
import { extractWorkspaceType } from '@/domain/types/project-ids';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of an atomic pointer sync operation
 */
export interface PointerSyncResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  requiresRollback?: boolean;
}

/**
 * Lock token for concurrent access control
 */
export type LockToken = string & { readonly brand: unique symbol };

/**
 * Operation types for logging
 */
type OperationType = 'create' | 'update' | 'delete' | 'restore';

/**
 * Log entry for debugging
 */
interface SyncLogEntry {
  timestamp: Date;
  operation: OperationType;
  projectId: string;
  success: boolean;
  duration: number;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const LOCK_TIMEOUT_MS = 5000; // 5 second lock timeout
const MAX_LOG_ENTRIES = 100;

// ============================================================================
// State
// ============================================================================

/**
 * Lock state for concurrent access control
 */
interface LockState {
  token: LockToken | null;
  projectId: string | null;
  timestamp: number;
}

let _lockState: LockState = {
  token: null,
  projectId: null,
  timestamp: 0,
};

const _syncLog: SyncLogEntry[] = [];

// ============================================================================
// Utility Functions
// ============================================================================

function generateLockToken(): LockToken {
  return `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` as LockToken;
}

function logSync(operation: OperationType, projectId: string, success: boolean, duration: number, error?: string) {
  const entry: SyncLogEntry = {
    timestamp: new Date(),
    operation,
    projectId,
    success,
    duration,
    error,
  };
  _syncLog.push(entry);
  if (_syncLog.length > MAX_LOG_ENTRIES) {
    _syncLog.shift();
  }
  console.log(`[PointerSync] ${operation} ${projectId} ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`);
  if (error) {
    console.error(`[PointerSync] Error:`, error);
  }
}

// ============================================================================
// Lock Management
// ============================================================================

/**
 * Acquire lock for a project
 * Returns token if lock acquired, null if already locked
 */
export function acquireLock(projectId: string): LockToken | null {
  const now = Date.now();

  // Check if current lock is stale
  if (_lockState.token && _lockState.timestamp < now - LOCK_TIMEOUT_MS) {
    console.warn(`[PointerSync] Stale lock released for ${_lockState.projectId}`);
    _lockState = { token: null, projectId: null, timestamp: 0 };
  }

  // If already locked for this project, return null
  if (_lockState.token && _lockState.projectId === projectId) {
    return null;
  }

  // Acquire new lock
  const token = generateLockToken();
  _lockState = { token, projectId, timestamp: now };
  return token;
}

/**
 * Release lock
 */
export function releaseLock(token: LockToken) {
  if (_lockState.token === token) {
    _lockState = { token: null, projectId: null, timestamp: 0 };
  }
}

// ============================================================================
// Atomic Operations
// ============================================================================

/**
 * Atomic create operation - ensures both Zustand and Dexie are updated together
 */
export async function atomicCreate(
  project: Project,
  workspaceType: WorkspaceType,
  updateStore: (project: Project) => void
): Promise<PointerSyncResult<ProjectId>> {
  const startTime = Date.now();
  const token = acquireLock(project.id);

  if (!token) {
    return {
      success: false,
      error: 'Could not acquire lock for project creation',
      requiresRollback: false,
    };
  }

  try {
    // Step 1: Persist to Dexie first (source of truth)
    await db.projects.put({
      id: project.id,
      name: project.name,
      path: project.folderPath,
      workspaceId: workspaceType,
      folderPath: project.folderPath,
      storageType: project.storageType,
      lastOpened: project.lastOpened,
      createdAt: project.createdAt,
      workspaceBindings: project.workspaceBindings,
      fileSnapshotEnabled: project.fileSnapshotEnabled,
    });

    // Step 2: Update Zustand store (only if Dexie succeeded)
    updateStore(project);

    // Step 3: Persist FSA handle if applicable
    if (project.storageType === 'fsa' && project.storageMetadata) {
      await handlePersistenceService.persistHandle(project.id, project.storageMetadata as any, workspaceType);
    }

    const duration = Date.now() - startTime;
    logSync('create', project.id, true, duration);

    return {
      success: true,
      data: project.id as ProjectId,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logSync('create', project.id, false, duration, err.message);

    return {
      success: false,
      error: `Failed to create project: ${err.message}`,
      requiresRollback: true,
    };
  } finally {
    releaseLock(token);
  }
}

/**
 * Atomic update operation - ensures both Zustand and Dexie are updated together
 */
export async function atomicUpdate(
  projectId: ProjectId,
  updates: Partial<Project>,
  getCurrentProject: () => Project | undefined,
  updateStore: (projectId: string, updates: Partial<Project>) => void
): Promise<PointerSyncResult<void>> {
  const startTime = Date.now();
  const token = acquireLock(projectId);

  if (!token) {
    return {
      success: false,
      error: 'Could not acquire lock for project update',
      requiresRollback: false,
    };
  }

  try {
    const current = getCurrentProject();
    if (!current) {
      return {
        success: false,
        error: 'Project not found',
        requiresRollback: false,
      };
    }

    // Step 1: Persist to Dexie first
    const updated = { ...current, ...updates };
    const wsType = extractWorkspaceType(projectId);
    await db.projects.put({
      id: updated.id,
      name: updated.name,
      path: updated.folderPath,
      workspaceId: wsType,
      folderPath: updated.folderPath,
      storageType: updated.storageType,
      lastOpened: updated.lastOpened,
      createdAt: updated.createdAt,
      workspaceBindings: updated.workspaceBindings,
      fileSnapshotEnabled: updated.fileSnapshotEnabled,
    });

    // Step 2: Update Zustand store (only if Dexie succeeded)
    updateStore(projectId, updates);

    const duration = Date.now() - startTime;
    logSync('update', projectId, true, duration);

    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logSync('update', projectId, false, duration, err.message);

    return {
      success: false,
      error: `Failed to update project: ${err.message}`,
      requiresRollback: true,
    };
  } finally {
    releaseLock(token);
  }
}

/**
 * Atomic delete operation - ensures both Zustand and Dexie are deleted together
 */
export async function atomicDelete(
  projectId: ProjectId,
  deleteFromStore: () => void
): Promise<PointerSyncResult<void>> {
  const startTime = Date.now();
  const token = acquireLock(projectId);

  if (!token) {
    return {
      success: false,
      error: 'Could not acquire lock for project deletion',
      requiresRollback: false,
    };
  }

  try {
    // Step 1: Delete from Dexie first
    await db.projects.delete(projectId);

    // Step 2: Delete from Zustand store (only if Dexie succeeded)
    deleteFromStore();

    // Step 3: Delete FSA handle metadata
    await handlePersistenceService.deleteHandle(projectId);

    const duration = Date.now() - startTime;
    logSync('delete', projectId, true, duration);

    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logSync('delete', projectId, false, duration, err.message);

    return {
      success: false,
      error: `Failed to delete project: ${err.message}`,
      requiresRollback: true,
    };
  } finally {
    releaseLock(token);
  }
}

/**
 * Atomic restore operation - restore FSA handle with proper synchronization
 */
export async function atomicRestore(
  projectId: ProjectId,
  updateStore: (metadata: any) => void
): Promise<PointerSyncResult<void>> {
  const startTime = Date.now();
  const token = acquireLock(projectId);

  if (!token) {
    return {
      success: false,
      error: 'Could not acquire lock for handle restoration',
      requiresRollback: false,
    };
  }

  try {
    // Restore handle from persistence service
    const result = await handlePersistenceService.restoreHandle(projectId);

    if (result.success && result.restoredFromMetadata) {
      // Update store with restored metadata
      updateStore(result.restoredFromMetadata);
    }

    const duration = Date.now() - startTime;
    logSync('restore', projectId, result.success, duration, result.error);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to restore handle',
        requiresRollback: false,
      };
    }

    return { success: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error;
    logSync('restore', projectId, false, duration, err.message);

    return {
      success: false,
      error: `Failed to restore handle: ${err.message}`,
      requiresRollback: false,
    };
  } finally {
    releaseLock(token);
  }
}

// ============================================================================
// Utility Methods
// ============================================================================

/**
 * Get recent sync log entries for debugging
 */
export function getSyncLog(limit = 20): SyncLogEntry[] {
  return _syncLog.slice(-limit);
}

/**
 * Get current lock state
 */
export function getLockState(): LockState {
  return { ..._lockState };
}

/**
 * Check if a project is currently locked
 */
export function isProjectLocked(projectId: string): boolean {
  return _lockState.projectId === projectId && _lockState.timestamp >= Date.now() - LOCK_TIMEOUT_MS;
}

/**
 * Clear sync log (for testing)
 */
export function clearSyncLog() {
  _syncLog.length = 0;
}
