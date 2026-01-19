/**
 * @fileoverview File Operations Slice - Folder CRUD Actions
 * @module infrastructure/persistence/stores/workspace/slices/use-file-ops-slice
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Split useWorkspaceFileSystem God Store
 *
 * Manages:
 * - Open folder (showDirectoryPicker)
 * - Switch folder (new picker, save new project)
 * - Close project (navigate away)
 * - Restore access (re-request permission)
 *
 * Part of the 3-slice architecture:
 * 1. use-file-loader-slice - Project loading
 * 2. use-file-ops-slice (THIS) - CRUD folder actions
 * 3. use-storage-adapter-slice - Sync/adapter management
 */

import { useState, useCallback, type RefObject, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { LocalFSAdapter } from '@/infrastructure/filesystem';
import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
import { SyncManager } from '@/infrastructure/sync';
// ARC-E04: Use canonical path for type (re-exported via infrastructure)
import type { FsaPermissionState } from '@/infrastructure/filesystem';
import type { ProjectMetadata } from '@/infrastructure/persistence/stores/project';
// NOTE: Functions remain in lib/filesystem until migrated
import {
  getPermissionState,
  ensureReadWritePermission,
  saveDirectoryHandleReference,
  restorePermission,
} from '@/lib/filesystem/permission-lifecycle';
import { saveProject, useProjectStore } from '@/infrastructure/persistence/stores/project';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';
import {
  serializeHandle,
  handlePersistenceService,
} from '@/infrastructure/filesystem/handle-persistence';

/**
 * File operations slice configuration
 */
export interface UseFileOpsSliceOptions {
  // State from loader slice
  projectMetadata: ProjectMetadata | null;
  setProjectMetadata: Dispatch<SetStateAction<ProjectMetadata | null>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: Dispatch<SetStateAction<FileSystemDirectoryHandle | null>>;
  permissionState: FsaPermissionState;
  setPermissionState: Dispatch<SetStateAction<FsaPermissionState>>;
  autoSync: boolean;

  // Refs
  localAdapterRef: RefObject<LocalFSAdapter | UnifiedStorageAdapter | null>;
  syncManagerRef: RefObject<SyncManager | null>;

  // Callbacks
  setCurrentProject: (id: string) => void;
  performSync: (handle: FileSystemDirectoryHandle, options?: { fullSync?: boolean; projectId?: string }) => Promise<boolean>;
}

/**
 * File operations slice return type
 */
export interface FileOpsSliceResult {
  isOpeningFolder: boolean;
  openFolder: () => Promise<void>;
  switchFolder: () => Promise<void>;
  closeProject: () => void;
  restoreAccess: () => Promise<void>;
}

/**
 * File Operations Slice Hook
 *
 * Handles folder CRUD actions: open, switch, close, restore access.
 *
 * @param options - Configuration options including state and callbacks
 * @returns File operations actions
 */
export function useFileOpsSlice({
  projectMetadata,
  setProjectMetadata,
  directoryHandle,
  setDirectoryHandle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- available for future permission checks
  permissionState: _permissionState,
  setPermissionState,
  autoSync,
  localAdapterRef,
  syncManagerRef,
  setCurrentProject,
  performSync,
}: UseFileOpsSliceOptions): FileOpsSliceResult {
  const navigate = useNavigate();
  const deviceType = useDeviceType();

  const [isOpeningFolder, setIsOpeningFolder] = useState(false);

  /**
   * Open folder via picker
   */
  const openFolder = useCallback(async (): Promise<void> => {
    if (!LocalFSAdapter.isSupported()) {
      const { isMobile, isTablet } = deviceType;
      if (isMobile || isTablet) {
        showMobileWorkspaceError('openFailed');
        return;
      }
      console.warn('[FileOpsSlice] File System Access API not supported');
      return;
    }

    // If we have an existing handle, try to restore permission first
    if (directoryHandle) {
      const state = await getPermissionState(directoryHandle, 'readwrite');
      if (state === 'granted') {
        await performSync(directoryHandle, { fullSync: autoSync });
        return;
      }

      const granted = await ensureReadWritePermission(directoryHandle);
      if (granted) {
        setPermissionState('granted');
        await performSync(directoryHandle, { fullSync: autoSync });
        return;
      }
    }

    // Show directory picker
    setIsOpeningFolder(true);
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      setDirectoryHandle(handle);
      setPermissionState('granted');

      // Use store's createProject() which generates namespaced ID and persists to Dexie
      const projectInput = {
        name: handle.name,
        folderPath: handle.name,
        storageType: 'fsa' as const,
        storageMetadata: serializeHandle(handle, 'ide'),
        autoSync,
        workspaceType: 'ide' as const,  // IDE workspace creates projects with 'ide:' prefix
        workspaceBindings: { ide: true, knowledge: true, notes: true, study: true },
        tags: [],
      };
      const projectId = await useProjectStore.getState().createProject(projectInput);

      // Get the full project object from store
      const project = useProjectStore.getState().getProject(projectId);
      if (!project) {
        throw new Error(`Failed to retrieve created project: ${projectId}`);
      }

      // Save to legacy permission-lifecycle store
      await saveDirectoryHandleReference(handle, projectId, handle.name);

      setProjectMetadata(project);
      setCurrentProject(projectId);

      // Perform initial sync
      await performSync(handle, { fullSync: autoSync, projectId });
      
      // FIX-2026-01-13: Navigate to the new IDE project page
      // Without this, user selects folder but URL stays on old project - nothing happens
      navigate({ to: '/ide/$projectId', params: { projectId } });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const { isMobile, isTablet } = deviceType;
        if (isMobile || isTablet) {
          showMobileWorkspaceError('openFailed');
          return;
        }
        console.error('[FileOpsSlice] Failed to open folder:', error);
      }
    } finally {
      setIsOpeningFolder(false);
    }
  }, [directoryHandle, performSync, autoSync, deviceType, setCurrentProject, setDirectoryHandle, setPermissionState, setProjectMetadata]);

  /**
   * Switch to different folder
   */
  const switchFolder = useCallback(async (): Promise<void> => {
    if (!LocalFSAdapter.isSupported()) {
      const { isMobile, isTablet } = deviceType;
      if (isMobile || isTablet) {
        showMobileWorkspaceError('openFailed');
        return;
      }
      console.warn('[FileOpsSlice] File System Access API not supported');
      return;
    }

    setIsOpeningFolder(true);
    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      // Clear old adapter refs
      localAdapterRef.current = null;
      syncManagerRef.current = null;

      setDirectoryHandle(handle);
      setPermissionState('granted');

      // Use store's createProject() which generates namespaced ID and persists to Dexie
      const projectInput = {
        name: handle.name,
        folderPath: handle.name,
        storageType: 'fsa' as const,
        storageMetadata: serializeHandle(handle, 'ide'),
        autoSync: true,
        workspaceType: 'ide' as const,  // IDE workspace creates projects with 'ide:' prefix
        workspaceBindings: { ide: true, knowledge: true, notes: true, study: true },
        tags: [],
      };
      const newProjectId = await useProjectStore.getState().createProject(projectInput);

      // Get the full project object from store
      const project = useProjectStore.getState().getProject(newProjectId);
      if (!project) {
        throw new Error(`Failed to retrieve created project: ${newProjectId}`);
      }

      // Save to legacy permission-lifecycle store
      await saveDirectoryHandleReference(handle, newProjectId, handle.name);

      setProjectMetadata(project);
      setCurrentProject(newProjectId);

      // Perform sync with new folder
      await performSync(handle, { fullSync: true, projectId: newProjectId });

      // Navigate to new project
      navigate({ to: '/workspace/$projectId', params: { projectId: newProjectId } });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const { isMobile, isTablet } = deviceType;
        if (isMobile || isTablet) {
          showMobileWorkspaceError('openFailed');
          return;
        }
        console.error('[FileOpsSlice] Failed to switch folder:', error);
      }
    } finally {
      setIsOpeningFolder(false);
    }
  }, [navigate, performSync, setCurrentProject, deviceType, localAdapterRef, syncManagerRef, setDirectoryHandle, setPermissionState, setProjectMetadata]);

  /**
   * Close project and navigate to dashboard
   */
  const closeProject = useCallback((): void => {
    localAdapterRef.current = null;
    syncManagerRef.current = null;
    navigate({ to: '/' });
  }, [navigate, localAdapterRef, syncManagerRef]);

  /**
   * Restore access for 'prompt' state handles
   * FSA-010: Permission state updated in FSAHandleRecord, not in Project
   */
  const restoreAccess = useCallback(async (): Promise<void> => {
    if (!directoryHandle) {
      console.warn('[FileOpsSlice] No directory handle to restore');
      return;
    }

    const result = await restorePermission(directoryHandle);
    setPermissionState(result);

    // FSA-010: Update permission state in FSAHandleRecord (single source of truth)
    if (projectMetadata) {
      await handlePersistenceService.updatePermissionStatus(projectMetadata.id, result);

      // Update the project's storageMetadata with new access time
      // Preserve existing handleId, directoryName, workspaceId, kind
      const updatedProject: ProjectMetadata = {
        ...projectMetadata,
        storageMetadata: projectMetadata.storageMetadata
          ? {
              ...projectMetadata.storageMetadata,
              lastAccessTime: Date.now(),
              permissionGranted: result === 'granted',
            }
          : undefined,
      };
      await saveProject(updatedProject);
      setProjectMetadata(updatedProject);
    }

    if (result === 'granted') {
      await performSync(directoryHandle, { fullSync: autoSync });
    }
  }, [directoryHandle, projectMetadata, autoSync, performSync, setPermissionState, setProjectMetadata]);

  return {
    isOpeningFolder,
    openFolder,
    switchFolder,
    closeProject,
    restoreAccess,
  };
}
