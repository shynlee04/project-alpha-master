/**
 * @fileoverview IDB Database - IndexedDB connection and schema management
 * @module infrastructure/sync/adapters/idb-database
 *
 * Handles IndexedDB opening, schema creation, and connection management.
 */

export interface DatabaseConfig {
  databaseName: string;
  storeName: string;
  debug?: boolean;
}

/**
 * Open IndexedDB database and create object store if needed
 * @param config - Database configuration
 * @returns IDBDatabase instance
 */
export async function openDatabase(config: DatabaseConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.databaseName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(config.storeName)) {
        const store = db.createObjectStore(config.storeName, { keyPath: 'id' });

        // Create indexes for efficient querying
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('path', 'path', { unique: false });
        store.createIndex('[projectId+path]', ['projectId', 'path'], { unique: true });
        store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
        store.createIndex('accessCount', 'accessCount', { unique: false });
        store.createIndex('size', 'size', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });

        if (config.debug) {
          console.debug(`[IDBDatabase] Created object store: ${config.storeName}`);
        }
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('[IDBDatabase] Failed to open database:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Close an IndexedDB database connection
 * @param db - Database to close
 */
export function closeDatabase(db: IDBDatabase | null): void {
  if (db) {
    db.close();
  }
}
