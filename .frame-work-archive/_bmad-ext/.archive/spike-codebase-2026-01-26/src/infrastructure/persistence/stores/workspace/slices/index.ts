/**
 * @fileoverview Workspace Slices Barrel Export
 * @module infrastructure/persistence/stores/workspace/slices
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Split useWorkspaceFileSystem God Store
 *
 * Exports the 3 focused slices that replace the god store:
 * 1. useFileLoaderSlice - Project loading
 * 2. useFileOpsSlice - CRUD folder actions
 * 3. useStorageAdapterSlice - Sync/adapter management
 */

// Slice 1: File Loader
export {
  useFileLoaderSlice,
  type UseFileLoaderSliceOptions,
  type FileLoaderSliceResult,
} from './use-file-loader-slice';

// Slice 2: File Operations
export {
  useFileOpsSlice,
  type UseFileOpsSliceOptions,
  type FileOpsSliceResult,
} from './use-file-ops-slice';

// Slice 3: Storage Adapter
export {
  useStorageAdapterSlice,
  type UseStorageAdapterSliceOptions,
  type StorageAdapterSliceResult,
} from './use-storage-adapter-slice';
