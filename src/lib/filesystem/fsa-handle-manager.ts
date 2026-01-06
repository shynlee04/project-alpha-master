import type { FSAHandleRecord } from '../state/dexie-db';
import {
  db,
  storeFSAHandle,
  getFSAHandle,
  deleteFSAHandle,
  updateFSAHandlePermission,
  clearAllFSAHandles
} from '../state/dexie-db';

/**
 * FSAHandleManager - Manages File System Access handle persistence.
 * Enables instant re-grant of folder access on project return.
 */
export class FSAHandleManager {
  /**
   * Persist a directory handle's metadata to IndexedDB.
   * Note: FileSystemDirectoryHandle cannot be serialized directly,
   * so we store metadata that enables re-creation.
   */
  async persistHandle(
    handle: FileSystemDirectoryHandle,
    projectId: string,
    workspaceId: 'ide' | 'knowledge' | 'study' | 'notes' = 'ide' // PERSIST-S002: Workspace isolation
  ): Promise<void> {
    const record: FSAHandleRecord = {
      projectId,
      workspaceId, // PERSIST-S002: Workspace isolation
      handleData: handle as any, // Serialize handle for storage
      directoryPath: handle.name || '',
      permissionStatus: 'granted',
      grantedAt: Date.now(),
      lastAccessedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await storeFSAHandle(record);
  }

  /**
   * Attempt to restore a previously granted handle.
   * Returns null if handle doesn't exist or silent re-grant fails.
   */
  async restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
    const record = await getFSAHandle(projectId);

    if (!record || record.permissionStatus !== 'granted') {
      return null;
    }

    try {
      // Attempt to get handle by ID (browser may persist it)
      // This is the ideal path for instant re-grant
      const handle = await window.showDirectoryPicker({ id: projectId });

      // Update last accessed timestamp
      await this.updateLastAccessed(projectId);

      return handle;
    } catch (error) {
      // Silent re-grant failed - likely browser doesn't support handle persistence
      console.warn('[FSAHandleManager] Silent re-grant failed:', error);

      // Clear the invalid record
      await deleteFSAHandle(projectId);

      return null;
    }
  }

  /**
   * Delete a stored handle (e.g., when user revokes permission).
   */
  async deleteHandle(projectId: string): Promise<void> {
    await deleteFSAHandle(projectId);
  }

  /**
   * Get the current permission status for a project.
   */
  async getPermissionStatus(projectId: string): Promise<FSAHandleRecord['permissionStatus'] | undefined> {
    const record = await getFSAHandle(projectId);
    return record?.permissionStatus;
  }

  /**
   * Update permission status after a permission check.
   */
  async updatePermissionStatus(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
  ): Promise<void> {
    await updateFSAHandlePermission(projectId, status);
  }

  /**
   * Clear all stored handles (privacy operation).
   */
  async clearAll(): Promise<void> {
    await clearAllFSAHandles();
  }

  /**
   * Get list of all stored handles (for settings UI).
   */
  async getAllStoredHandles(): Promise<FSAHandleRecord[]> {
    return db.fsaHandles.toArray();
  }

  /**
   * Update the last accessed timestamp.
   */
  private async updateLastAccessed(projectId: string): Promise<void> {
    await db.fsaHandles.update(projectId, {
      lastAccessedAt: Date.now()
    });
  }

  /**
   * Check if a handle can be silently restored (for UI hints).
   */
  async canSilentRestore(projectId: string): Promise<boolean> {
    const record = await getFSAHandle(projectId);
    if (!record) return false;

    // Check if we have valid stored data
    return record.permissionStatus === 'granted' && !!record.directoryPath;
  }
}

// Export singleton instance
export const fsaHandleManager = new FSAHandleManager();
