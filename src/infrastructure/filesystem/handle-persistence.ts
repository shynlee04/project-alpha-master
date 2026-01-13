/**
 * @fileoverview Handle Persistence Service
 * @module infrastructure/filesystem/handle-persistence
 * @governance EPIC-CC-01 (Project Space Foundation)
 * @story PS-04 (Handle Persistence Architecture)
 *
 * Handles FileSystemDirectoryHandle persistence without DataCloneError.
 * Stores metadata only, restores handle with user interaction when needed.
 *
 * Problem: FileSystemDirectoryHandle cannot be serialized to IndexedDB.
 * Solution: Store serializable metadata, request new handle on restoration.
 */

import type {
  StorageHandleMetadata,
  HandleRestoreResult,
  HandlePersistenceConfig,
  HandlePermissionState,
} from './handle-types';
import {
  DEFAULT_HANDLE_PERSISTENCE_CONFIG,
  isFSASupported,
} from './handle-types';
import {
  storeFSAHandle,
  getFSAHandle,
  deleteFSAHandle,
  updateFSAHandlePermission,
  clearAllFSAHandles,
  getAllValidFSAHandles,
} from '@/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers';
import type { FSAHandleRecord } from '@/infrastructure/persistence/dexie-db-types';

// ============================================================================
// Handle Metadata Service
// ============================================================================

/**
 * Generate a unique ID for a FileSystemDirectoryHandle
 * Uses the handle's name and current timestamp as a fingerprint
 */
export function generateHandleId(handle: FileSystemDirectoryHandle): string {
  return `${handle.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Serialize FileSystemDirectoryHandle to storable metadata
 * NOTE: We do NOT store the handle itself - only metadata!
 */
export function serializeHandle(
  handle: FileSystemDirectoryHandle,
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
): StorageHandleMetadata {
  return {
    handleId: generateHandleId(handle),
    directoryName: handle.name,
    lastAccessTime: Date.now(),
    permissionGranted: true,
    workspaceId,
    kind: 'directory',
  };
}

/**
 * Check if FSA API is supported
 */
export function isFSAAvailable(): boolean {
  return isFSASupported();
}

// ============================================================================
// Handle Persistence Service
// ============================================================================

/**
 * Handle Persistence Service
 *
 * Manages the lifecycle of FileSystemDirectoryHandle metadata:
 * 1. Store metadata when user grants permission
 * 2. Attempt silent restore on project open
 * 3. Fall back to user prompt if silent restore fails
 */
export class HandlePersistenceService {
  private config: HandlePersistenceConfig;

  constructor(config: HandlePersistenceConfig = DEFAULT_HANDLE_PERSISTENCE_CONFIG) {
    this.config = config;
  }

  /**
   * Store handle metadata for a project
   *
   * @param projectId - The project ID
   * @param handle - The FSA directory handle
   * @param workspaceId - Workspace context
   */
  async persistHandle(
    projectId: string,
    handle: FileSystemDirectoryHandle,
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
  ): Promise<void> {
    const metadata = serializeHandle(handle, workspaceId);

    // Store in Dexie using existing helper (converts to FSAHandleRecord)
    await storeFSAHandle({
      projectId,
      workspaceId,
      handleData: null, // We DON'T store the actual handle!
      directoryPath: metadata.directoryName,
      permissionStatus: 'granted',
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });

    console.log(`[HandlePersistence] Persisted metadata for project: ${projectId}`);
  }

  /**
   * Restore handle for a project
   *
   * @param projectId - The project ID
   * @returns HandleRestoreResult with handle or null
   */
  async restoreHandle(projectId: string): Promise<HandleRestoreResult> {
    // Get stored metadata from Dexie
    const record = await getFSAHandle(projectId);
    
    if (!record) {
      return {
        success: false,
        handle: null,
        error: 'No stored handle metadata found',
        requiresUserInteraction: true,
      };
    }

    // Check permission status
    if (record.permissionStatus === 'denied') {
      return {
        success: false,
        handle: null,
        error: 'Permission was previously denied',
        requiresUserInteraction: true,
        restoredFromMetadata: {
          handleId: record.projectId,
          directoryName: record.directoryPath,
          lastAccessTime: record.lastAccessedAt,
          permissionGranted: false,
          workspaceId: record.workspaceId,
          kind: 'directory',
        },
      };
    }

    // Try silent restore first (if enabled)
    if (this.config.enableSilentRestore) {
      try {
        const handle = await this.trySilentRestore(projectId, record);
        if (handle) {
          // Update last accessed timestamp
          await updateFSAHandlePermission(projectId, 'granted');
          
          return {
            success: true,
            handle,
            requiresUserInteraction: false,
            restoredFromMetadata: {
              handleId: record.projectId,
              directoryName: record.directoryPath,
              lastAccessTime: Date.now(),
              permissionGranted: true,
              workspaceId: record.workspaceId,
              kind: 'directory',
            },
          };
        }
      } catch (error) {
        console.warn(`[HandlePersistence] Silent restore failed: ${error}`);
        // Continue to user prompt fallback
      }
    }

    // Fall back to user prompt
    return this.promptUserForHandle(projectId, record);
  }

  /**
   * Try to restore handle silently (without user prompt)
   */
  private async trySilentRestore(
    projectId: string,
    _record: FSAHandleRecord  // Unused but kept for clarity
  ): Promise<FileSystemDirectoryHandle | null> {
    if (!isFSAAvailable()) {
      return null;
    }

    try {
      // Some browsers may persist handles across sessions
      // Try to get the handle by ID
      const handle = await window.showDirectoryPicker({ id: projectId });
      return handle;
    } catch (error) {
      // Silent restore failed - this is expected in most browsers
      return null;
    }
  }

  /**
   * Prompt user to select a directory handle
   */
  private async promptUserForHandle(
    projectId: string,
    record: FSAHandleRecord
  ): Promise<HandleRestoreResult> {
    if (!isFSAAvailable()) {
      return {
        success: false,
        handle: null,
        error: 'File System Access API not supported',
        requiresUserInteraction: false,
      };
    }

    try {
      // Show directory picker
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      // Verify it's the same directory (by name)
      if (handle.name === record.directoryPath) {
        // Update permission status
        await updateFSAHandlePermission(projectId, 'granted');
        
        return {
          success: true,
          handle,
          requiresUserInteraction: true,
          restoredFromMetadata: {
            handleId: record.projectId,
            directoryName: handle.name,
            lastAccessTime: Date.now(),
            permissionGranted: true,
            workspaceId: record.workspaceId,
            kind: 'directory',
          },
        };
      }

      // Different directory selected
      return {
        success: false,
        handle: null,
        error: `Selected directory "${handle.name}" does not match expected "${record.directoryPath}"`,
        requiresUserInteraction: true,
      };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      
      if (err.name === 'AbortError') {
        // User cancelled
        await updateFSAHandlePermission(projectId, 'dismissed');
        return {
          success: false,
          handle: null,
          error: 'User cancelled directory selection',
          requiresUserInteraction: true,
        };
      }

      if (err.name === 'NotAllowedError') {
        // Permission denied
        await updateFSAHandlePermission(projectId, 'denied');
        return {
          success: false,
          handle: null,
          error: 'Permission denied',
          requiresUserInteraction: true,
        };
      }

      return {
        success: false,
        handle: null,
        error: err.message || 'Unknown error',
        requiresUserInteraction: true,
      };
    }
  }

  /**
   * Delete stored handle metadata
   */
  async deleteHandle(projectId: string): Promise<void> {
    await deleteFSAHandle(projectId);
    console.log(`[HandlePersistence] Deleted handle for project: ${projectId}`);
  }

  /**
   * Update permission status
   */
  async updatePermissionStatus(
    projectId: string,
    status: HandlePermissionState
  ): Promise<void> {
    await updateFSAHandlePermission(projectId, status);
  }

  /**
   * Get permission status for a project
   */
  async getPermissionStatus(
    projectId: string
  ): Promise<HandlePermissionState | undefined> {
    const record = await getFSAHandle(projectId);
    return record?.permissionStatus;
  }

  /**
   * Clear all stored handles (privacy operation)
   */
  async clearAll(): Promise<void> {
    await clearAllFSAHandles();
    console.log('[HandlePersistence] Cleared all stored handles');
  }

  /**
   * Get all valid handles (for dashboard display)
   */
  async getAllValidHandles(): Promise<FSAHandleRecord[]> {
    return getAllValidFSAHandles();
  }

  /**
   * Check if a handle can be silently restored
   */
  async canSilentRestore(projectId: string): Promise<boolean> {
    const record = await getFSAHandle(projectId);
    if (!record) return false;
    
    return record.permissionStatus === 'granted' && !!record.directoryPath;
  }
}

// Export singleton instance
export const handlePersistenceService = new HandlePersistenceService();

// Convenience exports
export const persistHandle = (projectId: string, handle: FileSystemDirectoryHandle, workspaceId?: string) =>
  handlePersistenceService.persistHandle(projectId, handle, workspaceId as any);

export const restoreHandle = (projectId: string) =>
  handlePersistenceService.restoreHandle(projectId);

export const deleteHandle = (projectId: string) =>
  handlePersistenceService.deleteHandle(projectId);
