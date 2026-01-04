/**
 * @fileoverview IDB Adapter - IndexedDB Storage Backend
 * @module infrastructure/sync/adapters/idb-adapter
 *
 * Implements StorageAdapter interface using IndexedDB via Dexie.
 * Provides persistent storage with quota management and eviction policies.
 *
 * **Key Features:**
 * - Quota checking before writes (P0 - prevents data loss)
 * - Automatic eviction when storage is full
 * - Binary content support (Uint8Array stored as base64)
 * - Event emission for quota warnings/exceeded
 *
 * **P0 Critical Fix:**
 * - Quota handling prevents silent data loss when IndexedDB is full
 * - Emits quota:warning at 90% threshold
 * - Emits quota:exceeded when write fails
 *
 * @example
 * ```ts
 * import { IDBAdapter } from '@/infrastructure/sync/adapters';
 *
 * const idbAdapter = new IDBAdapter('my-project');
 * await idbAdapter.initialize();
 * const content = await idbAdapter.readFile('src/index.ts');
 * ```
 */

import type {
  FileContent,
  FileMetadata,
} from '../core/sync-types';
import {
  BaseStorageAdapter,
  QuotaExceededError,
} from './base-adapter';
import { syncEventBus } from '../core/sync-events';

// ============================================================================
// IDB Adapter Configuration
// ============================================================================

/**
 * IDB adapter configuration options
 */
export interface IDBAdapterConfig {
  /** Database name (defaults to 'via-gent-persistence') */
  databaseName?: string;
  /** Table name for storing file content (defaults to 'fileContentCache') */
  tableName?: string;
  /** Project ID for namespacing (required) */
  projectId: string;
  /** Quota threshold (0-1, defaults to 0.9 = 90%) */
  quotaThreshold?: number;
  /** Eviction policy (defaults to 'least-recently-used') */
  evictionPolicy?: EvictionPolicy;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Eviction policy for quota management
 */
export type EvictionPolicy =
  | 'least-recently-used'    // Evict files not accessed recently
  | 'least-frequently-used'  // Evict files rarely accessed
  | 'largest-first'         // Evict largest files first
  | 'oldest-first';          // Evict oldest synced files first

/**
 * Internal file record for IndexedDB storage
 */
interface FileRecord {
  /** Composite key: projectId:path */
  id: string;
  /** Project ID for namespacing */
  projectId: string;
  /** File path relative to project root */
  path: string;
  /** File content as base64-encoded Uint8Array */
  content: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** Content MIME type */
  contentType?: string;
  /** Last access timestamp (for LRU eviction) */
  lastAccessedAt: number;
  /** Access count (for LFU eviction) */
  accessCount: number;
  /** Created timestamp */
  createdAt: number;
}

/**
 * Quota information
 */
export interface QuotaInfo {
  /** Used bytes */
  used: number;
  /** Total available bytes */
  total: number;
  /** Available bytes (total - used) */
  available: number;
  /** Usage percentage (0-100) */
  usagePercentage: number;
}

// ============================================================================
// IDB Adapter Implementation
// ============================================================================

/**
 * IDB Adapter - IndexedDB Storage Backend
 *
 * Wraps IndexedDB (via Dexie) to provide persistent file storage.
 * Includes P0-critical quota management to prevent data loss.
 *
 * **Quota Management:**
 * - Checks quota before every write operation
 * - Emits quota:warning at 90% threshold
 * - Emits quota:exceeded when write fails
 * - Automatically evicts old files when needed
 *
 * **Binary Storage:**
 * - Uint8Array content is base64-encoded for storage
 * - Automatically decoded on read
 */
export class IDBAdapter extends BaseStorageAdapter {
  readonly name = 'idb';

  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private projectId: string;
  private quotaThreshold: number;
  private evictionPolicy: EvictionPolicy;
  private config: IDBAdapterConfig;

  // Internal table name (will be checked/created in initialize)
  private static readonly TABLE_NAME = 'syncFileContent';

  constructor(config: IDBAdapterConfig) {
    super();
    this.config = {
      databaseName: 'via-gent-persistence',
      tableName: IDBAdapter.TABLE_NAME,
      quotaThreshold: 0.9,
      evictionPolicy: 'least-recently-used',
      debug: false,
      ...config,
    };
    this.dbName = this.config.databaseName!;
    this.storeName = this.config.tableName!;
    this.projectId = this.config.projectId;
    this.quotaThreshold = this.config.quotaThreshold!;
    this.evictionPolicy = this.config.evictionPolicy!;
    this._ready = false;
    this.debugMode = this.config.debug ?? false;
  }

  // ========== StorageAdapter Interface ==========

  /**
   * Read file content from IndexedDB
   * @param path - File path relative to project root
   * @returns File content with metadata
   * @throws {FileNotFoundError} If file doesn't exist
   */
  async readFile(path: string): Promise<FileContent> {
    await this.ensureInitialized();

    const record = await this.getFileRecord(path);
    if (!record) {
      throw new Error(`File not found: ${path}`);
    }

    // Update access tracking for eviction
    await this.updateAccessTracking(record);

    // Decode base64 content back to Uint8Array
    const data = this.base64ToUint8Array(record.content);

    return this.createFileContent(path, data);
  }

  /**
   * Write file content to IndexedDB with quota checking
   * @param path - File path relative to project root
   * @param content - Content to write as Uint8Array
   * @throws {QuotaExceededError} If quota exceeded and eviction failed
   */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    await this.ensureInitialized();

    const contentSize = content.length;

    // P0: Check quota before write (prevent data loss)
    const quotaCheck = await this.checkQuota();
    if (!quotaCheck.hasEnoughSpace) {
      this.debug(`Quota check failed: need ${contentSize} bytes, have ${quotaCheck.quota.available}`);

      // Emit quota warning event
      syncEventBus.emit('quota:warning', {
        used: quotaCheck.quota.used,
        total: quotaCheck.quota.total,
        available: quotaCheck.quota.available,
        threshold: this.quotaThreshold,
      });

      // Try to evict old files
      const evicted = await this.evictIfNeeded(contentSize);
      if (!evicted) {
        // Quota exceeded after eviction attempt
        syncEventBus.emit('quota:exceeded', {
          required: contentSize,
          available: quotaCheck.quota.available,
        });

        throw new QuotaExceededError(this.name, contentSize, quotaCheck.quota.available);
      }
    }

    // Encode content as base64 for IndexedDB storage
    const base64Content = this.uint8ArrayToBase64(content);
    const now = Date.now();
    const id = this.makeId(path);

    const record: FileRecord = {
      id,
      projectId: this.projectId,
      path,
      content: base64Content,
      size: contentSize,
      lastModified: now,
      lastAccessedAt: now,
      accessCount: 1,
      createdAt: now,
    };

    await this.putRecord(record);
    this.debug(`Wrote file: ${path} (${contentSize} bytes)`);
  }

  /**
   * Delete file from IndexedDB
   * @param path - File path relative to project root
   */
  async deleteFile(path: string): Promise<void> {
    await this.ensureInitialized();

    const id = this.makeId(path);
    await this.deleteRecord(id);

    this.debug(`Deleted file: ${path}`);
  }

  /**
   * List files matching a glob pattern
   * @param pattern - Glob pattern (supports double-star wildcards)
   * @returns Array of file paths
   */
  async listFiles(pattern: string): Promise<string[]> {
    await this.ensureInitialized();

    const allRecords = await this.getAllRecords();
    const regexPattern = this.globToRegex(pattern);

    const results: string[] = [];
    for (const record of allRecords) {
      if (regexPattern.test(record.path)) {
        results.push(record.path);
      }
    }

    return results;
  }

  /**
   * Get file metadata
   * @param path - File path relative to project root
   * @returns File metadata
   */
  async getMetadata(path: string): Promise<FileMetadata> {
    await this.ensureInitialized();

    const record = await this.getFileRecord(path);
    if (!record) {
      throw new Error(`File not found: ${path}`);
    }

    return this.createMetadata(
      path,
      record.size,
      record.lastModified,
      record.contentType
    );
  }

  /**
   * Check if file exists
   * @param path - File path relative to project root
   * @returns Whether file exists
   */
  async exists(path: string): Promise<boolean> {
    await this.ensureInitialized();
    const record = await this.getFileRecord(path);
    return record !== null;
  }

  // ========== Quota Management (P0 Critical) ==========

  /**
   * Check current storage quota
   * @returns Quota information including usage, total, available
   */
  async checkQuota(): Promise<{
    hasEnoughSpace: boolean;
    quota: QuotaInfo;
  }> {
    try {
      const estimate = await navigator.storage.estimate();
      if (!estimate) {
        this.debug('Storage estimate not available');
        return {
          hasEnoughSpace: true, // Optimistic default
          quota: {
            used: 0,
            total: Number.MAX_SAFE_INTEGER,
            available: Number.MAX_SAFE_INTEGER,
            usagePercentage: 0,
          },
        };
      }

      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const available = total - used;
      const usagePercentage = total > 0 ? (used / total) * 100 : 0;

      return {
        hasEnoughSpace: usagePercentage < (this.quotaThreshold * 100),
        quota: {
          used,
          total,
          available,
          usagePercentage,
        },
      };
    } catch (error) {
      this.debug('Failed to check quota:', error);
      return {
        hasEnoughSpace: true, // Fail open
        quota: {
          used: 0,
          total: Number.MAX_SAFE_INTEGER,
          available: Number.MAX_SAFE_INTEGER,
          usagePercentage: 0,
        },
      };
    }
  }

  /**
   * Evict old files if quota is exceeded
   * @param requiredBytes - Number of bytes needed
   * @returns true if eviction succeeded, false otherwise
   */
  async evictIfNeeded(requiredBytes: number): Promise<boolean> {
    this.debug(`Checking if eviction needed for ${requiredBytes} bytes`);

    const quotaCheck = await this.checkQuota();
    const quota = quotaCheck.quota;

    // Calculate how much we need to free
    // Add 10% buffer for safety
    const neededBytes = requiredBytes * 1.1;
    const bytesToFree = neededBytes - quota.available;

    if (bytesToFree <= 0) {
      this.debug('No eviction needed, enough space available');
      return true;
    }

    this.debug(`Need to free ${Math.round(bytesToFree)} bytes`);

    try {
      const result = await this.evictByPolicy(bytesToFree);
      this.debug(
        `Evicted ${result.filesEvicted} files, freed ${Math.round(result.bytesFreed)} bytes`
      );

      // Verify we now have enough space
      const newQuotaCheck = await this.checkQuota();
      return newQuotaCheck.quota.available >= requiredBytes;
    } catch (error) {
      this.error('Eviction failed:', error);
      return false;
    }
  }

  // ========== Initialization ==========

  /**
   * Initialize the adapter (opens database)
   */
  async initialize(): Promise<void> {
    if (this._ready) return;

    await this.openDatabase();
    this._ready = true;
    this.debug('IDB adapter initialized');
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this._ready = false;
      this.debug('IDB adapter closed');
    }
  }

  // ========== Public Methods ==========

  /**
   * Clear all files for this project
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    const tx = this.db!.transaction([this.storeName], 'readwrite');
    const store = tx.objectStore(this.storeName);
    const index = store.index('projectId');
    const request = index.openCursor(IDBKeyRange.only(this.projectId));

    await new Promise<void>((resolve, reject) => {
      const toDelete: string[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          toDelete.push(cursor.value.id);
          cursor.continue();
        } else {
          // Delete all collected keys
          const deleteTx = this.db!.transaction([this.storeName], 'readwrite');
          const deleteStore = deleteTx.objectStore(this.storeName);

          for (const id of toDelete) {
            deleteStore.delete(id);
          }

          deleteTx.oncomplete = () => {
            this.debug(`Cleared ${toDelete.length} files`);
            resolve();
          };
          deleteTx.onerror = () => reject(deleteTx.error);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // ========== Private Helper Methods ==========

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this._ready) {
      await this.initialize();
    }
  }

  /**
   * Open IndexedDB database and create object store if needed
   */
  private async openDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          // Create indexes for efficient querying
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('path', 'path', { unique: false });
          store.createIndex('[projectId+path]', ['projectId', 'path'], { unique: true });
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false });
          store.createIndex('accessCount', 'accessCount', { unique: false });
          store.createIndex('size', 'size', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });

          this.debug(`Created object store: ${this.storeName}`);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        this.error('Failed to open database:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get a file record from IndexedDB
   */
  private async getFileRecord(path: string): Promise<FileRecord | null> {
    const id = this.makeId(path);

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        this.error(`Failed to get file record: ${path}`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Put a file record into IndexedDB
   */
  private async putRecord(record: FileRecord): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        if (request.error?.name === 'QuotaExceededError') {
          reject(request.error);
        } else {
          this.error(`Failed to put record: ${record.path}`, request.error);
          reject(request.error);
        }
      };
    });
  }

  /**
   * Delete a record from IndexedDB
   */
  private async deleteRecord(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        // Ignore if file doesn't exist (idempotent delete)
        if (request.error?.name !== 'NotFoundError') {
          this.error(`Failed to delete record: ${id}`, request.error);
          reject(request.error);
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Get all file records for this project
   */
  private async getAllRecords(): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('projectId');
      const request = index.getAll(IDBKeyRange.only(this.projectId));

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        this.error('Failed to get all records', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update access tracking for LRU/LFU eviction
   */
  private async updateAccessTracking(record: FileRecord): Promise<void> {
    const now = Date.now();

    return new Promise((resolve) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put({
        ...record,
        lastAccessedAt: now,
        accessCount: (record.accessCount || 0) + 1,
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        // Non-critical, don't fail on tracking update
        this.debug('Failed to update access tracking:', request.error);
        resolve();
      };
    });
  }

  /**
   * Evict files based on configured policy
   */
  private async evictByPolicy(
    bytesToFree: number
  ): Promise<{ bytesFreed: number; filesEvicted: number; evictedPaths: string[] }> {
    const allRecords = await this.getAllRecords();

    // Sort records based on eviction policy
    const sortedRecords = this.sortForEviction(allRecords);

    let bytesFreed = 0;
    const evictedPaths: string[] = [];

    for (const record of sortedRecords) {
      if (bytesFreed >= bytesToFree) break;

      evictedPaths.push(record.path);
      bytesFreed += record.size;
    }

    // Delete evicted records
    if (evictedPaths.length > 0) {
      await this.bulkDelete(evictedPaths);
    }

    return {
      bytesFreed,
      filesEvicted: evictedPaths.length,
      evictedPaths,
    };
  }

  /**
   * Sort records for eviction based on policy
   */
  private sortForEviction(records: FileRecord[]): FileRecord[] {
    switch (this.evictionPolicy) {
      case 'least-recently-used':
        // Sort by lastAccessedAt ascending (oldest access first)
        return [...records].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

      case 'least-frequently-used':
        // Sort by accessCount ascending (least accessed first)
        return [...records].sort((a, b) => (a.accessCount || 0) - (b.accessCount || 0));

      case 'largest-first':
        // Sort by size descending (largest first)
        return [...records].sort((a, b) => b.size - a.size);

      case 'oldest-first':
        // Sort by createdAt ascending (oldest first)
        return [...records].sort((a, b) => a.createdAt - b.createdAt);

      default:
        return records;
    }
  }

  /**
   * Bulk delete records by path
   */
  private async bulkDelete(paths: string[]): Promise<void> {
    return new Promise((resolve) => {
      const tx = this.db!.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);

      let completed = 0;
      const total = paths.length;

      for (const path of paths) {
        const id = this.makeId(path);
        const request = store.delete(id);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          this.error(`Failed to delete: ${path}`, request.error);
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
   * Make a composite ID for a file path
   */
  private makeId(path: string): string {
    return `${this.projectId}:${path}`;
  }

  /**
   * Convert Uint8Array to base64 string
   */
  private uint8ArrayToBase64(data: Uint8Array): string {
    const binary = Array.from(data)
      .map(byte => String.fromCharCode(byte))
      .join('');
    return btoa(binary);
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convert glob pattern to regex
   */
  private globToRegex(pattern: string): RegExp {
    const regexPattern = pattern
      .replace(/\./g, '\\.') // Escape dots
      .replace(/\*\*/g, '.*') // ** -> any characters
      .replace(/\*/g, '[^/]*') // * -> any characters except slash
      .replace(/\?/g, '[^/]'); // ? -> single character

    return new RegExp(`^${regexPattern}$`);
  }
}

// ============================================================================
// Export singleton factory
// ============================================================================

/**
 * Create an IDB adapter for a specific project
 * @param projectId - Project ID for namespacing
 * @param config - Optional configuration
 * @returns Configured IDB adapter
 */
export function createIDBAdapter(
  projectId: string,
  config?: Partial<IDBAdapterConfig>
): IDBAdapter {
  return new IDBAdapter({ ...config, projectId });
}

/**
 * Default IDB adapter instance (deprecated - use createIDBAdapter)
 * @deprecated Use createIDBAdapter(projectId) instead for proper namespacing
 */
export const idbAdapter = new IDBAdapter({ projectId: 'default' });
