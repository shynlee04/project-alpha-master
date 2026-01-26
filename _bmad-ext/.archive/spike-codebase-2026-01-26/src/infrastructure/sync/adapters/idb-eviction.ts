/**
 * @fileoverview IDB Eviction - Policy-based file eviction logic
 * @module infrastructure/sync/adapters/idb-eviction
 *
 * Handles policy-specific eviction for IndexedDB when quota is exceeded.
 * Supports LRU, LFU, and oldest-first policies.
 */

import type { FileRecord, EvictionPolicy, EvictionResult } from './idb-adapter-types';
import { sortForEviction } from './idb-adapter-utils';

// ============================================================================
// Eviction Policy Executor
// ============================================================================

export interface EvictionExecutorConfig {
  projectId: string;
  policy: EvictionPolicy;
  debug?: boolean;
}

export interface RecordDeleter {
  (ids: string[]): Promise<void>;
}

/**
 * Execute eviction based on configured policy
 * @param records - All file records to consider for eviction
 * @param bytesToFree - Number of bytes that need to be freed
 * @param config - Eviction configuration
 * @param deleteFn - Function to delete records by ID
 * @returns Eviction result with bytes freed and paths evicted
 */
export async function evictByPolicy(
  records: FileRecord[],
  bytesToFree: number,
  config: EvictionExecutorConfig,
  deleteFn: RecordDeleter
): Promise<EvictionResult> {
  // Sort records based on eviction policy
  const sortedRecords = sortForEviction(records, config.policy);

  let bytesFreed = 0;
  const evictedPaths: string[] = [];

  for (const record of sortedRecords) {
    if (bytesFreed >= bytesToFree) break;

    evictedPaths.push(record.path);
    bytesFreed += record.size;
  }

  // Delete evicted records
  if (evictedPaths.length > 0) {
    const idsToDelete = evictedPaths.map((path) =>
      `${config.projectId}:${path}`
    );
    await deleteFn(idsToDelete);

    if (config.debug) {
      console.debug(
        `[IDBEviction] Evicted ${evictedPaths.length} files, freed ${Math.round(bytesFreed)} bytes`
      );
    }
  }

  return {
    bytesFreed,
    filesEvicted: evictedPaths.length,
    evictedPaths,
  };
}

/**
 * Create a bulk delete function for IndexedDB
 * @param db - IndexedDB database instance
 * @param storeName - Object store name
 * @returns Function that deletes records by ID
 */
export function createBulkDeleter(
  db: IDBDatabase,
  storeName: string
): RecordDeleter {
  return (ids: string[]) =>
    new Promise((resolve) => {
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      let completed = 0;
      const total = ids.length;

      for (const id of ids) {
        const request = store.delete(id);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          console.error(`[IDBEviction] Failed to delete: ${id}`, request.error);
          // Continue with other deletions even if one fails
          completed++;
          if (completed === total) {
            resolve();
          }
        };
      }
    });
}

/**
 * Clear all records for a specific project
 * @param db - IndexedDB database instance
 * @param storeName - Object store name
 * @param projectId - Project ID to clear
 * @returns Promise resolving when clear is complete
 */
export async function clearProjectRecords(
  db: IDBDatabase,
  storeName: string,
  projectId: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const index = store.index('projectId');
    const request = index.openCursor(IDBKeyRange.only(projectId));

    const toDelete: string[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        toDelete.push(cursor.value.id);
        cursor.continue();
      } else {
        // Delete all collected keys
        const deleteTx = db.transaction([storeName], 'readwrite');
        const deleteStore = deleteTx.objectStore(storeName);

        for (const id of toDelete) {
          deleteStore.delete(id);
        }

        deleteTx.oncomplete = () => {
          console.debug(`[IDBEviction] Cleared ${toDelete.length} records`);
          resolve(toDelete.length);
        };
        deleteTx.onerror = () => reject(deleteTx.error);
      }
    };

    request.onerror = () => reject(request.error);
  });
}
