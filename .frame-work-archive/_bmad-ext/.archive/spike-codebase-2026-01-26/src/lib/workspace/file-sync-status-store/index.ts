/**
 * @fileoverview Barrel export for file-sync-status-store
 * @module workspace/file-sync-status-store
 */

// Main store (refactored)
export {
  useFileSyncStatusStore,
  setFileSyncPending,
  setFileSyncSynced,
  setFileSyncError,
  clearFileSyncStatus,
  clearAllFileSyncStatuses,
  fileSyncStatusStore,
  fileSyncCountsStore,
} from './file-sync-status-store-refactored';

// Types
export type {
  SyncStatusType,
  FileSyncState,
  FileSyncStatus,
  FileSyncCounts,
  SyncProgress,
} from './types';

// Slice types (for testing or advanced usage)
export type {
  FileStatusSlice,
  FileStatusSliceState,
  FileStatusSliceActions,
} from './file-status-slice';

export type {
  SyncProgressSlice,
  SyncProgressSliceState,
  SyncProgressSliceActions,
} from './sync-progress-slice';

export type {
  SyncLifecycleSlice,
  SyncLifecycleSliceState,
  SyncLifecycleSliceActions,
} from './sync-lifecycle-slice';

export type {
  HydrationSlice,
  HydrationSliceState,
  HydrationSliceActions,
} from './hydration-slice';

// Slice creators (for testing or advanced usage)
export { createFileStatusSlice } from './file-status-slice';
export { createSyncProgressSlice } from './sync-progress-slice';
export { createSyncLifecycleSlice } from './sync-lifecycle-slice';
export { createHydrationSlice } from './hydration-slice';
