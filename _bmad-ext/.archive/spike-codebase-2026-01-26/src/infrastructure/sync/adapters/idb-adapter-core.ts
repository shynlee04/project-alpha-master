/**
 * @fileoverview IDB Adapter - IndexedDB Storage Backend
 * P0-critical quota management prevents data loss when IndexedDB is full.
 */

import type {
  FileContent,
  FileMetadata,
} from '../core/sync-types';
import {
  BaseStorageAdapter,
  QuotaExceededError,
} from './base-adapter';
import type {
  IDBAdapterConfig,
  FileRecord,
  EvictionPolicy,
} from './idb-adapter-types';
import {
  globToRegex,
  uint8ArrayToBase64,
  base64ToUint8Array,
  makeId,
} from './idb-adapter-utils';
import {
  checkStorageQuota,
  emitQuotaWarning,
  emitQuotaExceeded,
  executeEvictionIfNeeded,
} from './idb-quota-manager';
import {
  evictByPolicy,
  createBulkDeleter,
  clearProjectRecords,
} from './idb-eviction';
import {
  openDatabase,
  closeDatabase,
} from './idb-database';
import {
  getFileRecord,
  putRecord,
  deleteRecord as deleteRecordFromDB,
  getAllRecords,
  updateAccessTracking,
} from './idb-crud';

// ============================================================================
// IDB Adapter Implementation
// ============================================================================

/**
 * IDB Adapter - IndexedDB Storage Backend
 *
 * Wraps IndexedDB to provide persistent file storage.
 * Includes P0-critical quota management to prevent data loss.
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

  /** @override */
  async readFile(path: string): Promise<FileContent> {
    await this.ensureInitialized();

    const id = makeId(this.projectId, path);
    const record = await getFileRecord(id, { db: this.db!, storeName: this.storeName });
    if (!record) {
      throw new Error(`File not found: ${path}`);
    }

    // Update access tracking for eviction
    await updateAccessTracking(record, { db: this.db!, storeName: this.storeName, debug: this.debugMode });

    // Decode base64 content back to Uint8Array
    const data = base64ToUint8Array(record.content);
    return this.createFileContent(path, data);
  }

  /** @override */
  async writeFile(path: string, content: Uint8Array): Promise<void> {
    await this.ensureInitialized();

    const contentSize = content.length;

    // P0: Check quota before write (prevent data loss)
    const quotaCheck = await checkStorageQuota({
      quotaThreshold: this.quotaThreshold,
      evictionPolicy: this.evictionPolicy,
      debug: this.debugMode,
    });

    if (!quotaCheck.hasEnoughSpace) {
      this.debug(`Quota check failed: need ${contentSize} bytes, have ${quotaCheck.quota.available}`);
      emitQuotaWarning(quotaCheck.quota, this.quotaThreshold);

      // Try to evict old files
      const evicted = await this.evictIfNeeded(contentSize);
      if (!evicted) {
        emitQuotaExceeded(contentSize, quotaCheck.quota.available);
        throw new QuotaExceededError(this.name, contentSize, quotaCheck.quota.available);
      }
    }

    // Encode content as base64 for IndexedDB storage
    const base64Content = uint8ArrayToBase64(content);
    const now = Date.now();
    const id = makeId(this.projectId, path);

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

    await putRecord(record, { db: this.db!, storeName: this.storeName });
    this.debug(`Wrote file: ${path} (${contentSize} bytes)`);
  }

  /** @override */
  async deleteFile(path: string): Promise<void> {
    await this.ensureInitialized();

    const id = makeId(this.projectId, path);
    await deleteRecordFromDB(id, { db: this.db!, storeName: this.storeName });
    this.debug(`Deleted file: ${path}`);
  }

  /** @override */
  async listFiles(pattern: string): Promise<string[]> {
    await this.ensureInitialized();

    const allRecords = await getAllRecords(this.projectId, { db: this.db!, storeName: this.storeName });
    const regexPattern = globToRegex(pattern);

    return allRecords
      .filter(record => regexPattern.test(record.path))
      .map(record => record.path);
  }

  /** @override */
  async getMetadata(path: string): Promise<FileMetadata> {
    await this.ensureInitialized();

    const id = makeId(this.projectId, path);
    const record = await getFileRecord(id, { db: this.db!, storeName: this.storeName });
    if (!record) {
      throw new Error(`File not found: ${path}`);
    }

    return this.createMetadata(path, record.size, record.lastModified, record.contentType);
  }

  /** @override */
  async exists(path: string): Promise<boolean> {
    await this.ensureInitialized();

    const id = makeId(this.projectId, path);
    const record = await getFileRecord(id, { db: this.db!, storeName: this.storeName });
    return record !== null;
  }

  // ========== Eviction Orchestration ==========

  /**
   * Evict old files if quota is exceeded
   */
  async evictIfNeeded(requiredBytes: number): Promise<boolean> {
    this.debug(`Checking if eviction needed for ${requiredBytes} bytes`);

    const quotaCheck = await checkStorageQuota({
      quotaThreshold: this.quotaThreshold,
      evictionPolicy: this.evictionPolicy,
      debug: this.debugMode,
    });

    const result = await executeEvictionIfNeeded(
      requiredBytes,
      quotaCheck,
      {
        quotaThreshold: this.quotaThreshold,
        evictionPolicy: this.evictionPolicy,
        debug: this.debugMode,
      },
      async (bytesToFree) => {
        const allRecords = await getAllRecords(this.projectId, { db: this.db!, storeName: this.storeName });
        const bulkDelete = createBulkDeleter(this.db!, this.storeName);
        return evictByPolicy(
          allRecords,
          bytesToFree,
          { projectId: this.projectId, policy: this.evictionPolicy, debug: this.debugMode },
          bulkDelete
        );
      }
    );

    return result.success;
  }

  // ========== Initialization ==========

  /** @override */
  async initialize(): Promise<void> {
    if (this._ready) return;

    this.db = await openDatabase({
      databaseName: this.dbName,
      storeName: this.storeName,
      debug: this.debugMode,
    });

    this._ready = true;
    this.debug('IDB adapter initialized');
  }

  /** @override */
  async close(): Promise<void> {
    closeDatabase(this.db);
    this.db = null;
    this._ready = false;
    this.debug('IDB adapter closed');
  }

  // ========== Public Methods ==========

  /**
   * Clear all files for this project
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    await clearProjectRecords(this.db!, this.storeName, this.projectId);
  }

  // ========== Private Helper Methods ==========

  /** Ensure database is initialized */
  private async ensureInitialized(): Promise<void> {
    if (!this._ready) {
      await this.initialize();
    }
  }
}

// Factory functions exported separately to reduce file size
