/**
 * Permission lifecycle helper for File System Access API (spike-only).
 *
 * This module encapsulates minimal logic for persisting and restoring a
 * FileSystemDirectoryHandle and checking its permission state.
 *
 * NOTE: This is scoped to spikes/project-alpha and is not part of the
 * main src/ infrastructure.
 */

// Simple IndexedDB-based persistence for a single directory handle
const DB_NAME = 'via-gent-fsa-spike';
const DB_VERSION = 1;
const STORE_NAME = 'handles';
const KEY_WORKSPACE = 'workspace-root';

interface HandleRecord {
  id: string;
  handle?: FileSystemDirectoryHandle;
}

function getWorkspaceKey(workspaceId?: string): string {
  return workspaceId ? `${KEY_WORKSPACE}:${workspaceId}` : KEY_WORKSPACE;
}

async function openDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    console.warn('[FSA] IndexedDB is not available; handle persistence disabled.');
    return null;
  }

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('[FSA] Failed to open IndexedDB for handle persistence.');
      resolve(null);
    };
  });
}

export async function saveDirectoryHandleReference(
  handle: FileSystemDirectoryHandle,
  workspaceId?: string,
): Promise<boolean> {
  const db = await openDB();
  if (!db) return false;

  const key = getWorkspaceKey(workspaceId);
  const record: HandleRecord = { id: key, handle };

  return new Promise<boolean>((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    try {
      store.put(record, key);
    } catch (error) {
      console.warn('[FSA] Failed to persist directory handle:', error);
      try {
        tx.abort();
      } catch {
      }
      resolve(false);
      return;
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => {
      console.warn('[FSA] Transaction error while persisting directory handle.');
      resolve(false);
    };
    tx.onabort = () => resolve(false);
  });
}

export async function loadDirectoryHandleReference(
  workspaceId?: string,
): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB();
  if (!db) return null;

  const key = getWorkspaceKey(workspaceId);

  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result as HandleRecord | undefined;
      if (!result || !result.handle) {
        resolve(null);
        return;
      }
      resolve(result.handle);
    };
    request.onerror = () => {
      console.warn('[FSA] Failed to load directory handle from IndexedDB.');
      resolve(null);
    };
    tx.onabort = () => resolve(null);
  });
}

export type FsaPermissionState = 'unknown' | 'granted' | 'prompt' | 'denied';

interface PermissionCapableHandle extends FileSystemDirectoryHandle {
  queryPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
  requestPermission?: (options: { mode: 'read' | 'readwrite' }) => Promise<PermissionState>;
}

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
 * Story 13-5: Detect Chrome 122+ persistent permission support.
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
 * Story 13-5: Restore permission for a previously granted handle.
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

