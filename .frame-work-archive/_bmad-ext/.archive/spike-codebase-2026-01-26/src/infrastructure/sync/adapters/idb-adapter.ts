/**
 * @fileoverview IDB Adapter - IndexedDB Storage Backend
 * @module infrastructure/sync/adapters/idb-adapter
 *
 * Implements StorageAdapter interface using IndexedDB.
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

// ============================================================================
// Re-exports from split modules
// ============================================================================

// Type definitions
export type {
  IDBAdapterConfig,
  EvictionPolicy,
  QuotaInfo,
  EvictionResult,
} from './idb-adapter-types';

// Utility functions
export {
  sortForEviction,
  globToRegex,
  uint8ArrayToBase64,
  base64ToUint8Array,
  makeId,
} from './idb-adapter-utils';

// Main IDBAdapter class
export { IDBAdapter } from './idb-adapter-core';

// Factory functions
export {
  createIDBAdapter,
  idbAdapter,
} from './idb-adapter-factory';

// Quota management (exported for testing)
export {
  checkStorageQuota,
  emitQuotaWarning,
  emitQuotaExceeded,
  executeEvictionIfNeeded,
  type QuotaCheckResult,
  type IDBQuotaManagerConfig,
  type EvictionAttemptResult,
} from './idb-quota-manager';

// Eviction (exported for testing)
export {
  evictByPolicy,
  createBulkDeleter,
  clearProjectRecords,
  type EvictionExecutorConfig,
  type RecordDeleter,
} from './idb-eviction';

// Database operations (exported for testing)
export {
  openDatabase,
  closeDatabase,
  type DatabaseConfig,
} from './idb-database';

// CRUD operations (exported for testing)
export {
  getFileRecord,
  putRecord,
  deleteRecord as deleteRecordFromDB,
  getAllRecords,
  updateAccessTracking,
  type CRUDConfig,
} from './idb-crud';
