/**
 * @fileoverview Workspace File System Hook - Orchestrator
 * @module infrastructure/persistence/stores/workspace/useWorkspaceFileSystem
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Split useWorkspaceFileSystem God Store
 *
 * REFACTORED: This hook is now an orchestrator that composes 3 focused slices:
 * 1. useFileLoaderSlice - Project loading
 * 2. useFileOpsSlice - CRUD folder actions
 * 3. useStorageAdapterSlice - Sync/adapter management
 *
 * Previous: 571 lines
 * Current: ~120 lines (orchestrator only)
 *
 * Manages file system operations, sync, and project metadata.
 * Handles File System Access API integration with WebContainer sync.
 */

import {
  useFileLoaderSlice,
  useFileOpsSlice,
  useStorageAdapterSlice,
} from './slices';

/**
 * File system hook configuration
 */
export interface UseWorkspaceFileSystemOptions {
  initialProjectId?: string | null;
  /** Initial directory handle restored from persistence (INF-04-02) */
  initialHandle?: FileSystemDirectoryHandle | null;
  setCurrentProject: (id: string) => void;
}

/**
 * Workspace file system hook - ORCHESTRATOR
 *
 * Composes 3 focused slices to provide file system operations:
 * - File loading (project hydration, permission detection)
 * - File operations (open, switch, close, restore)
 * - Storage adapter (sync, event bus, exclusion patterns)
 *
 * @param options - Configuration options
 * @returns Combined file system state and actions
 */
export function useWorkspaceFileSystem({
  initialProjectId,
  initialHandle,
  setCurrentProject,
}: UseWorkspaceFileSystemOptions) {
  // Slice 1: File Loader - Project loading and hydration
  const fileLoader = useFileLoaderSlice({
    initialProjectId,
    initialHandle,
  });

  // Slice 3: Storage Adapter - Sync and event bus management
  // (Created before fileOps because performSync is needed by fileOps)
  const storageAdapter = useStorageAdapterSlice({
    projectMetadata: fileLoader.projectMetadata,
    setProjectMetadata: fileLoader.setProjectMetadata,
    directoryHandle: fileLoader.directoryHandle,
    autoSync: fileLoader.autoSync,
    setAutoSyncState: fileLoader.setAutoSyncState,
    exclusionPatterns: fileLoader.exclusionPatterns,
    setExclusionPatterns: fileLoader.setExclusionPatterns,
    localAdapterRef: fileLoader.localAdapterRef,
  });

  // Slice 2: File Operations - Open, switch, close, restore
  const fileOps = useFileOpsSlice({
    projectMetadata: fileLoader.projectMetadata,
    setProjectMetadata: fileLoader.setProjectMetadata,
    directoryHandle: fileLoader.directoryHandle,
    setDirectoryHandle: fileLoader.setDirectoryHandle,
    permissionState: fileLoader.permissionState,
    setPermissionState: fileLoader.setPermissionState,
    autoSync: fileLoader.autoSync,
    localAdapterRef: fileLoader.localAdapterRef,
    syncManagerRef: storageAdapter.syncManagerRef,
    setCurrentProject,
    performSync: storageAdapter.performSync,
  });

  // Return the combined public API (unchanged from original)
  return {
    // State (from fileLoader)
    projectMetadata: fileLoader.projectMetadata,
    directoryHandle: fileLoader.directoryHandle,
    permissionState: fileLoader.permissionState,
    autoSync: fileLoader.autoSync,
    exclusionPatterns: fileLoader.exclusionPatterns,

    // State (from storageAdapter)
    syncStatus: storageAdapter.syncStatus,
    syncProgress: storageAdapter.syncProgress,
    lastSyncTime: storageAdapter.lastSyncTime,
    syncError: storageAdapter.syncError,
    isWebContainerBooted: storageAdapter.isWebContainerBooted,
    initialSyncCompleted: storageAdapter.initialSyncCompleted,

    // State (from fileOps)
    isOpeningFolder: fileOps.isOpeningFolder,

    // Actions (from fileOps)
    openFolder: fileOps.openFolder,
    switchFolder: fileOps.switchFolder,
    closeProject: fileOps.closeProject,
    restoreAccess: fileOps.restoreAccess,

    // Actions (from storageAdapter)
    syncNow: storageAdapter.syncNow,
    setAutoSync: storageAdapter.setAutoSync,
    setExclusionPatterns: storageAdapter.setExclusionPatternsFn,
    setIsWebContainerBooted: storageAdapter.setIsWebContainerBooted,
    setInitialSyncCompleted: storageAdapter.setInitialSyncCompleted,

    // Refs (for advanced use cases)
    localAdapterRef: fileLoader.localAdapterRef,
    syncManagerRef: storageAdapter.syncManagerRef,
    eventBus: storageAdapter.eventBus,
  };
}
