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
 *
 * Chrome 122+ Enhancement: Silent restore from stored handle with persistent permissions.
 * - If user granted "Allow on every visit" permission, handle can be restored by ID
 * - No user prompt required when permission is already granted
 * - Fall back to prompt ONLY if handle is truly unavailable (revoked, deleted)
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
// Chrome 129+ Structured Clone Support Detection
// ============================================================================

/**
 * Check if the browser supports structuredClone for FileSystemDirectoryHandle.
 * Chrome 129+ added support for cloning FileSystemDirectoryHandle objects,
 * which allows us to store the actual handle in IndexedDB instead of just metadata.
 *
 * This is critical for the "instant restore" feature - with structuredClone support,
 * we can persist the handle and restore it on page reload without user prompt.
 *
 * @returns true if browser supports structuredClone for handles (Chrome 129+)
 */
export function isStructuredCloneSupported(): boolean {
  // CC-V2-B01: Fixed Chrome version check - was exact match 'Chrome/129', now >= 129
  if (typeof window === 'undefined') return false;
  if (!('structuredClone' in window)) return false;

  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  return chromeVersion >= 129;  // Chrome 129+ supports structuredClone for FSA handles
}

/**
 * Chrome versions that support persistent FSA permissions without prompting.
 * Chrome 122+ allows restoring handles by ID without user interaction when
 * the user previously granted "Allow on every visit" permission.
 */
const CHROME_VERSIONS_WITH_PERSISTENT_PERMISSION = [
  122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135,
];

/**
 * Check if the current browser supports persistent FSA permissions.
 * Chrome 122+ with "Allow on every visit" permission allows silent handle
 * restoration without user prompt when using the same handle ID.
 *
 * @returns true if browser supports silent handle restoration
 */
export function isPersistentPermissionSupported(): boolean {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return false;
  }

  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
  if (!chromeMatch) {
    return false;
  }

  const version = parseInt(chromeMatch[1], 10);
  return CHROME_VERSIONS_WITH_PERSISTENT_PERMISSION.includes(version);
}

/**
 * Check if we can attempt silent restore for a given record.
 * Silent restore works when:
 * 1. FSA API is supported
 * 2. Browser supports persistent permissions (Chrome 122+)
 * 3. Permission status is 'granted'
 *
 * @param record - FSA handle record from Dexie
 * @returns true if silent restore should be attempted
 */
export function canAttemptSilentRestore(record: FSAHandleRecord): boolean {
  return (
    isFSASupported() &&
    isPersistentPermissionSupported() &&
    record.permissionStatus === 'granted' &&
    !!record.directoryPath
  );
}

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
   * Store handle for a project.
   *
   * Chrome 129+ Enhancement: If structuredClone is supported, we store the
   * actual FileSystemDirectoryHandle in Dexie. This enables true "instant restore"
   * without any user prompt on page reload.
   *
   * For older browsers: Store only metadata (directory name, permissions).
   * The handle must be requested from user on restoration.
   *
   * @param projectId - The project ID
   * @param handle - The FSA directory handle
   * @param workspaceId - Workspace context (default: 'ide')
   */
  async persistHandle(
    projectId: string,
    handle: FileSystemDirectoryHandle,
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide'
  ): Promise<void> {
    const metadata = serializeHandle(handle, workspaceId);

    // Chrome 129+ support: Store actual handle when structuredClone is available
    // This enables true "instant restore" without user prompt on page reload
    const handleData = isStructuredCloneSupported()
      ? structuredClone(handle) // Chrome 129+: Store actual handle
      : null; // Older browsers: Store metadata only (avoid DataCloneError)

    // Store in Dexie using existing helper (converts to FSAHandleRecord)
    await storeFSAHandle({
      projectId,
      workspaceId,
      handleData,
      directoryPath: metadata.directoryName,
      permissionStatus: 'granted',
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
    });

    console.log(
      `[HandlePersistence] Persisted ${isStructuredCloneSupported() ? 'handle' : 'metadata'
      } for project: ${projectId}`
    );
  }

  /**
   * Restore handle for a project
   *
   * @param projectId - The project ID
   * @returns HandleRestoreResult with handle or null
   */
  async restoreHandle(projectId: string): Promise<HandleRestoreResult> {
    console.log(`[HandlePersistence] restoreHandle called for project: ${projectId}`);

    // Get stored metadata from Dexie
    const record = await getFSAHandle(projectId);
    console.log(`[HandlePersistence] Record from Dexie:`, record ? {
      hasHandleData: !!record.handleData,
      permissionStatus: record.permissionStatus,
      directoryPath: record.directoryPath,
    } : 'NO RECORD FOUND');

    if (!record) {
      console.error(`[HandlePersistence] ❌ No stored handle found for project: ${projectId}`);
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
      let silentRestoreAttempted = false;

      try {
        silentRestoreAttempted = true;
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

      // Silent restore was attempted but failed - pass this info to prompt
      if (silentRestoreAttempted) {
        return this.promptUserForHandle(projectId, record, true);
      }
    }

    // Silent restore not enabled or not attempted
    return this.promptUserForHandle(projectId, record, false);
  }

  /**
   * Try to restore handle silently (without user prompt).
   *
   * Strategy for Chrome 122+ with persistent permissions:
   * 1. If permission already granted in record: try to restore by handle ID
   * 2. The showDirectoryPicker({ id: projectId }) call will NOT prompt
   *    if user previously granted "Allow on every visit" permission
   * 3. If handle is truly unavailable (revoked, deleted): return null
   *    to trigger fallback to user prompt
   *
   * @param projectId - The project ID (used as handle ID)
   * @param record - FSA handle record from Dexie
   * @returns Restored handle or null if silent restore not possible
   */
  private async trySilentRestore(
    projectId: string,
    record: FSAHandleRecord
  ): Promise<FileSystemDirectoryHandle | null> {
    if (!isFSASupported()) {
      console.log('[HandlePersistence] FSA not supported, cannot silent restore');
      return null;
    }

    // Chrome 129+ with structuredClone: Restore from stored handleData (truly silent)
    // This is the BEST case - we have the actual handle stored, no prompt needed
    if (isStructuredCloneSupported() && record.handleData) {
      console.log(
        `[HandlePersistence] Chrome 129+ detected, restoring handle from structuredClone for project: ${projectId}`
      );
      try {
        // structuredClone can restore the actual FileSystemDirectoryHandle
        const handle = structuredClone(record.handleData) as FileSystemDirectoryHandle;

        // CC-IDE-02-FIX: Verify permission is still granted after restoration
        // Even with structuredClone, permission may not persist if user only clicked "Allow this time"
        // instead of "Allow on every visit". We must verify permission before returning the handle.
        // Use type assertion for queryPermission which is not in standard TS lib types
        const handleWithPermission = handle as FileSystemDirectoryHandle & {
          queryPermission?: (options: { mode: 'readwrite' | 'read' }) => Promise<PermissionState>;
        };

        if (typeof handleWithPermission.queryPermission === 'function') {
          const permission = await handleWithPermission.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            console.log(`[HandlePersistence] Handle restored with valid permission for project: ${projectId}`);
            return handle;
          }

          console.log(
            `[HandlePersistence] Handle restored but permission not granted (status: ${permission}), ` +
            `will fall through to user interaction flow for project: ${projectId}`
          );
          // Fall through to other restoration methods which handle user interaction
        } else {
          // Browser doesn't support queryPermission - return handle and let it fail at usage
          console.log(`[HandlePersistence] Handle restored (queryPermission not available) for project: ${projectId}`);
          return handle;
        }
      } catch (error) {
        console.warn(`[HandlePersistence] Failed to restore handle from structuredClone: ${error}`);
        // Continue to other restoration methods
      }
    }

    // Chrome 122-128: Try persistent permission restoration
    // This may prompt user if they chose "Allow this time" instead of "Allow on every visit"
    if (isPersistentPermissionSupported()) {
      // Check if we have a granted permission record
      if (record.permissionStatus === 'granted') {
        console.log(
          `[HandlePersistence] Chrome 122-128 detected, attempting silent restore for project: ${projectId}`
        );

        try {
          // In Chrome 122+, if the user granted "Allow on every visit" permission,
          // showDirectoryPicker with the same ID will restore the handle WITHOUT prompting.
          // However, if user chose "Allow this time", this WILL prompt.
          const handle = await window.showDirectoryPicker({
            id: projectId,
            mode: 'readwrite',
          });

          console.log(
            `[HandlePersistence] Silent restore successful for project: ${projectId}`
          );
          return handle;
        } catch (error: unknown) {
          const err = error as { name?: string; message?: string };

          // Handle is truly unavailable - permission was revoked or handle deleted
          if (err.name === 'NotAllowedError') {
            console.warn(
              `[HandlePersistence] Permission revoked or handle deleted for project: ${projectId}`
            );
            // Update permission status to reflect the actual state
            await updateFSAHandlePermission(projectId, 'denied');
            return null;
          }

          // AbortError means user cancelled (shouldn't happen in silent mode,
          // but handle gracefully anyway)
          if (err.name === 'AbortError') {
            console.warn(
              `[HandlePersistence] Silent restore aborted for project: ${projectId}`
            );
            return null;
          }

          // Other errors - fall back to user prompt
          console.warn(
            `[HandlePersistence] Silent restore failed: ${err.message || err.name}`
          );
          return null;
        }
      }

      // Permission not granted yet - cannot silent restore
      console.log(
        `[HandlePersistence] Permission not granted (status: ${record.permissionStatus}), skipping silent restore`
      );
      return null;
    }

    // Pre-Chrome 122: Silent restore is not supported
    // The browser doesn't persist handles across sessions without prompting
    console.log(
      `[HandlePersistence] Browser doesn't support persistent permissions, skipping silent restore`
    );
    return null;
  }

  /**
   * Prompt user to select a directory handle.
   *
   * This is called when:
   * 1. No stored handle metadata exists
   * 2. Silent restore failed (handle revoked, deleted, or browser doesn't support)
   * 3. Permission was previously denied
   *
   * @param projectId - The project ID
   * @param record - FSA handle record from Dexie (optional, for context)
   * @param silentRestoreFailed - Whether silent restore was attempted and failed
   * @returns HandleRestoreResult with handle or null
   */
  private async promptUserForHandle(
    projectId: string,
    record?: FSAHandleRecord,
    silentRestoreFailed: boolean = false
  ): Promise<HandleRestoreResult> {
    if (!isFSAAvailable()) {
      return {
        success: false,
        handle: null,
        error: 'File System Access API not supported',
        requiresUserInteraction: false,
      };
    }

    // Build context-aware error message
    let contextMessage = '';
    if (silentRestoreFailed && record) {
      if (record.permissionStatus === 'denied') {
        contextMessage = 'Permission was previously denied. ';
      } else if (record.permissionStatus === 'dismissed') {
        contextMessage = 'Previous permission request was cancelled. ';
      } else {
        contextMessage =
          'Previous handle is no longer available (revoked or deleted). ';
      }
    }

    try {
      // Show directory picker with context-aware prompt
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      // Verify it's the same directory (by name) if we have a record
      const expectedPath = record?.directoryPath;
      if (expectedPath && handle.name !== expectedPath) {
        // Different directory selected - inform user
        console.warn(
          `[HandlePersistence] User selected different directory: "${handle.name}" != "${expectedPath}"`
        );
        return {
          success: false,
          handle: null,
          error: `Selected directory "${handle.name}" does not match expected "${expectedPath}". Please select the correct folder to continue.`,
          requiresUserInteraction: true,
        };
      }

      // Update permission status
      await updateFSAHandlePermission(projectId, 'granted');

      return {
        success: true,
        handle,
        requiresUserInteraction: true,
        restoredFromMetadata: {
          handleId: projectId,
          directoryName: handle.name,
          lastAccessTime: Date.now(),
          permissionGranted: true,
          workspaceId: record?.workspaceId ?? 'ide',
          kind: 'directory',
        },
      };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };

      if (err.name === 'AbortError') {
        // User cancelled
        await updateFSAHandlePermission(projectId, 'dismissed');
        return {
          success: false,
          handle: null,
          error: `${contextMessage}Permission request was cancelled. The project cannot access files without your permission.`,
          requiresUserInteraction: true,
        };
      }

      if (err.name === 'NotAllowedError') {
        // Permission denied
        await updateFSAHandlePermission(projectId, 'denied');
        return {
          success: false,
          handle: null,
          error: `${contextMessage}Permission was denied. Please grant access to the project folder to continue.`,
          requiresUserInteraction: true,
        };
      }

      return {
        success: false,
        handle: null,
        error: err.message || `${contextMessage}Unknown error occurred while requesting folder access.`,
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
