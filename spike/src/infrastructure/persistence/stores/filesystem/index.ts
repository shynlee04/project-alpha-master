/**
 * @fileoverview File Snapshot Store Barrel Export
 * @module infrastructure/persistence/stores/filesystem
 * @governance EPIC-CP-1.11
 *
 * Public API for file snapshot store system.
 * Exports unified store, convenience hooks, and utilities.
 */

// Main store
export { useFileSnapshotStore } from './useFileSnapshotStore';

// Convenience hooks
export {
  useFileTree,
  useQuotaStats,
  useQuotaWarning,
} from './useFileSnapshotStore';

// Utilities
export {
  resetFileSnapshotStore,
  getFileSnapshotStoreState,
} from './useFileSnapshotStore';

// Slice creators (for testing or advanced usage)
export { createSnapshotMetadataSlice } from './snapshot-metadata-slice';
export { createSnapshotCacheSlice } from './snapshot-cache-slice';
export { createSnapshotBulkOpsSlice } from './snapshot-bulk-ops-slice';
export { createSnapshotQuotaSlice } from './snapshot-quota-slice';

// Types
export type {
  SnapshotMetadataState,
  SnapshotMetadataMethods,
  SnapshotCacheState,
  SnapshotCacheMethods,
  SnapshotBulkOpsState,
  SnapshotBulkOpsMethods,
  SnapshotQuotaState,
  SnapshotQuotaMethods,
  CacheEntry,
  CacheLookupResult,
  SnapshotSaveResult,
  QuotaStats,
  EvictionResult,
  FileTreeNode,
  FileTree,
} from './snapshot-types';

export type { FileSnapshotRecord } from './snapshot-types';
