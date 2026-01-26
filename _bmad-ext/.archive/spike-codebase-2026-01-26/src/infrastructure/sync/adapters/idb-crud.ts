/**
 * @fileoverview IDB CRUD - IndexedDB CRUD operations
 * @module infrastructure/sync/adapters/idb-crud
 *
 * Provides create, read, update, delete operations for IndexedDB records.
 */

import type { FileRecord } from './idb-adapter-types';

// ============================================================================
// CRUD Operations
// ============================================================================

export interface CRUDConfig {
  db: IDBDatabase;
  storeName: string;
  debug?: boolean;
}

/**
 * Get a file record from IndexedDB
 * @param id - Record ID
 * @param config - CRUD configuration
 * @returns File record or null if not found
 */
export function getFileRecord(
  id: string,
  config: CRUDConfig
): Promise<FileRecord | null> {
  return new Promise((resolve, reject) => {
    const tx = config.db.transaction([config.storeName], 'readonly');
    const store = tx.objectStore(config.storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error(`[IDBCRUD] Failed to get record: ${id}`, request.error);
      reject(request.error);
    };
  });
}

/**
 * Put a file record into IndexedDB
 * @param record - Record to put
 * @param config - CRUD configuration
 * @returns Promise resolving when put is complete
 */
export function putRecord(
  record: FileRecord,
  config: CRUDConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = config.db.transaction([config.storeName], 'readwrite');
    const store = tx.objectStore(config.storeName);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      if (request.error?.name === 'QuotaExceededError') {
        reject(request.error);
      } else {
        console.error(`[IDBCRUD] Failed to put record: ${record.path}`, request.error);
        reject(request.error);
      }
    };
  });
}

/**
 * Delete a record from IndexedDB
 * @param id - Record ID to delete
 * @param config - CRUD configuration
 * @returns Promise resolving when delete is complete
 */
export function deleteRecord(
  id: string,
  config: CRUDConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = config.db.transaction([config.storeName], 'readwrite');
    const store = tx.objectStore(config.storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      // Ignore if file doesn't exist (idempotent delete)
      if (request.error?.name !== 'NotFoundError') {
        console.error(`[IDBCRUD] Failed to delete record: ${id}`, request.error);
        reject(request.error);
      } else {
        resolve();
      }
    };
  });
}

/**
 * Get all file records for a specific project
 * @param projectId - Project ID to filter by
 * @param config - CRUD configuration
 * @returns Array of file records
 */
export function getAllRecords(
  projectId: string,
  config: CRUDConfig
): Promise<FileRecord[]> {
  return new Promise((resolve, reject) => {
    const tx = config.db.transaction([config.storeName], 'readonly');
    const store = tx.objectStore(config.storeName);
    const index = store.index('projectId');
    const request = index.getAll(IDBKeyRange.only(projectId));

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error('[IDBCRUD] Failed to get all records', request.error);
      reject(request.error);
    };
  });
}

/**
 * Update access tracking for LRU/LFU eviction
 * @param record - Record to update
 * @param config - CRUD configuration
 * @returns Promise resolving when update is complete
 */
export function updateAccessTracking(
  record: FileRecord,
  config: CRUDConfig
): Promise<void> {
  const now = Date.now();

  return new Promise((resolve) => {
    const tx = config.db.transaction([config.storeName], 'readwrite');
    const store = tx.objectStore(config.storeName);
    const request = store.put({
      ...record,
      lastAccessedAt: now,
      accessCount: (record.accessCount || 0) + 1,
    });

    request.onsuccess = () => resolve();
    request.onerror = () => {
      // Non-critical, don't fail on tracking update
      if (config.debug) {
        console.debug('[IDBCRUD] Failed to update access tracking:', request.error);
      }
      resolve();
    };
  });
}
