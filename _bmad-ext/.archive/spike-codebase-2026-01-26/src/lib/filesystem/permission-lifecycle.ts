/**
 * Permission lifecycle helper for File System Access API.
 *
 * This module encapsulates minimal logic for persisting and restoring a
 * FileSystemDirectoryHandle and checking its permission state.
 *
 * Uses the main Dexie database (via-gent-persistence) for FSA handle persistence,
 * following the unified state management approach.
 */

import type { FSAHandleRecord } from '@/infrastructure/persistence/dexie-db';
import {
  storeFSAHandle,
  getFSAHandle,
  updateFSAHandleStatus,
  deleteFSAHandle,
} from '@/infrastructure/persistence/dexie-db';

/**
 * Get permission state label for display
 * PS-04: Added 'dismissed' for user-cancelled permission dialogs
 */
export type FsaPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied' | 'dismissed';

interface PermissionCapableHandle extends FileSystemDirectoryHandle {
  queryPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
  requestPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
}

/**
 * Detect Chrome 129+ with structuredClone support for FileSystemDirectoryHandle.
 * 
 * Chrome 129+ introduced the ability to serialize/deserialize FileSystemDirectoryHandle
 * via structuredClone(), which allows the handle to be stored in IndexedDB and
 * restored without requiring the user to re-select the directory.
 * 
 * @returns true if browser supports structuredClone for FileSystemDirectoryHandle
 */
function isStructuredCloneSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (!('structuredClone' in window)) {
    return false;
  }

  // Extract Chrome version and check if >= 129
  const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : 0;

  return chromeVersion >= 129;
}

/**
 * Serialize FileSystemDirectoryHandle for storage.
 * 
 * In Chrome 129+: Uses structuredClone to serialize the full handle
 * In older browsers: Stores only metadata (kind, name) for re-requesting permissions
 */
function serializeHandle(handle: FileSystemDirectoryHandle): unknown {
  // Chrome 129+ can serialize the full handle via structuredClone
  if (isStructuredCloneSupported()) {
    try {
      return structuredClone(handle);
    } catch {
      // Fallback to metadata if structuredClone fails
      console.warn('[FSA] structuredClone failed, falling back to metadata');
    }
  }
  
  // Fallback: Store only key metadata for re-requesting permission
  return {
    kind: handle.kind,
    name: handle.name,
  };
}

/**
 * Deserialize handle data back to a FileSystemDirectoryHandle.
 * 
 * Chrome 129+: Returns the actual handle (stored via structuredClone)
 * Older browsers: Returns null (handle cannot be reconstructed from metadata alone)
 * 
 * @param data - Serialized handle data from storage
 * @returns The deserialized FileSystemDirectoryHandle or null if not supported
 */
function deserializeHandle(data: unknown): FileSystemDirectoryHandle | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Chrome 129+: Data is a full serialized handle
  if (isStructuredCloneSupported()) {
    try {
      const handle = structuredClone(data as FileSystemDirectoryHandle);
      // Verify it's a valid handle with expected methods
      if (handle && typeof (handle as FileSystemDirectoryHandle).kind === 'string' &&
          typeof (handle as FileSystemDirectoryHandle).name === 'string' &&
          typeof (handle as PermissionCapableHandle).queryPermission === 'function') {
        return handle as FileSystemDirectoryHandle;
      }
    } catch {
      console.warn('[FSA] Failed to deserialize handle via structuredClone');
    }
  }

  const handleData = data as { kind?: string; name?: string };
  
  // Verify it's directory metadata
  if (handleData.kind !== 'directory' || !handleData.name) {
    return null;
  }

  // Older browsers: Cannot reconstruct handle from metadata alone
  // The actual handle must be obtained via showDirectoryPicker again
  // This serialized data is stored for reference and path display purposes only
  return null;
}

/**
 * Save directory handle reference for the project using Dexie persistence.
 * Note: The actual handle cannot be serialized - only metadata is stored.
 */
export async function saveDirectoryHandleReference(
  handle: FileSystemDirectoryHandle,
  projectId: string,
  directoryPath: string,
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide' // PERSIST-S002: Workspace isolation
): Promise<boolean> {
  try {
    const record: Omit<FSAHandleRecord, 'createdAt' | 'updatedAt'> = {
      projectId,
      workspaceId, // PERSIST-S002: Workspace isolation
      handleData: serializeHandle(handle),
      directoryPath,
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
      permissionStatus: 'granted',
    };

    await storeFSAHandle(record);
    return true;
  } catch (error) {
    console.warn('[FSA] Failed to persist directory handle:', error);
    return false;
  }
}

/**
 * Load directory handle reference metadata from Dexie persistence.
 * Returns null if no stored handle exists.
 * Note: The actual handle cannot be restored - user must re-select directory.
 * However, we still update the access time for tracking purposes.
 */
export async function loadDirectoryHandleReference(
  projectId: string,
): Promise<{ handle: FileSystemDirectoryHandle; directoryPath: string } | null> {
  try {
    const record = await getFSAHandle(projectId);
    if (!record || !record.handleData) {
      return null;
    }

    // Always update access time when we find a stored handle
    await updateFSAHandleStatus(projectId, record.permissionStatus);

    // Note: Handles cannot be fully serialized/deserialized
    // The actual handle must be obtained via showDirectoryPicker again
    const handle = deserializeHandle(record.handleData);
    if (!handle) {
      return null;
    }

    return { handle, directoryPath: record.directoryPath };
  } catch (error) {
    console.warn('[FSA] Failed to load directory handle from IndexedDB:', error);
    return null;
  }
}

/**
 * Get the stored handle metadata for a project (without requiring user action).
 * Returns the directory path for display purposes.
 */
export async function getStoredHandleMetadata(
  projectId: string,
): Promise<{ directoryPath: string; permissionStatus: FsaPermissionState } | null> {
  try {
    const record = await getFSAHandle(projectId);
    if (!record) {
      return null;
    }

    return {
      directoryPath: record.directoryPath,
      permissionStatus: record.permissionStatus,
    };
  } catch {
    return null;
  }
}

/**
 * Get permission state for a handle.
 */
export async function getPermissionState(
  handle: FileSystemDirectoryHandle,
  mode: 'read' | 'readwrite' = 'readwrite',
): Promise<FsaPermissionState> {
  const permissionHandle = handle as PermissionCapableHandle;
  if (!permissionHandle || typeof permissionHandle.queryPermission !== 'function') {
    return 'denied';
  }

  try {
    const state = await permissionHandle.queryPermission({ mode });
    if (state === 'granted' || state === 'prompt' || state === 'denied') {
      return state;
    }
    return 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Ensure read-write permission for a handle.
 */
export async function ensureReadWritePermission(
  handle: FileSystemDirectoryHandle,
): Promise<'granted' | 'denied'> {
  const current = await getPermissionState(handle, 'readwrite');
  if (current === 'granted') return 'granted';

  const permissionHandle = handle as PermissionCapableHandle;
  if (!permissionHandle || typeof permissionHandle.requestPermission !== 'function') {
    return 'denied';
  }

  try {
    const next = await permissionHandle.requestPermission({ mode: 'readwrite' });
    return next === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Detect Chrome 122+ persistent permission support.
 *
 * Chrome 122+ shows three-way permission prompt:
 * - "Allow this time" (session only)
 * - "Allow on every visit" (persistent)
 * - "Block"
 *
 * No developer API changes needed - the browser handles persistence automatically
 * when the user selects "Allow on every visit".
 *
 * @returns true if browser supports persistent File System Access permissions
 */
export function isPersistentPermissionSupported(): boolean {
  // Feature detection: navigator.permissions.query is available in Chrome 122+
  // This doesn't directly detect persistent permissions, but it's a good proxy
  // for modern browsers that support the three-way permission prompt
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.permissions === 'undefined') return false;
  return typeof navigator.permissions.query === 'function';
}

/**
 * Restore permission for a previously granted handle.
 *
 * This is called when user clicks "Restore Access" button instead of
 * automatically prompting on load. This gives users control over when
 * the permission dialog appears.
 *
 * @param handle - The stored FileSystemDirectoryHandle
 * @returns The new permission state after restoration attempt
 */
export async function restorePermission(
  handle: FileSystemDirectoryHandle,
): Promise<FsaPermissionState> {
  const result = await ensureReadWritePermission(handle);
  return result;
}

/**
 * Delete stored handle reference (e.g., when user revokes access).
 */
export async function deleteStoredHandleReference(projectId: string): Promise<void> {
  try {
    await deleteFSAHandle(projectId);
  } catch (error) {
    console.warn('[FSA] Failed to delete stored handle:', error);
  }
}
