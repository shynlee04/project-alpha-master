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
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
import type { ProjectMetadata } from '@/lib/workspace/project-store';
import {
  getPermissionState,
  ensureReadWritePermission,
  saveDirectoryHandleReference,
  restorePermission,
} from '@/lib/filesystem/permission-lifecycle';
import { saveProject, generateProjectId } from '@/lib/workspace/project-store';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';
import { serializeHandle } from '@/infrastructure/filesystem/handle-persistence';

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

      const projectId = generateProjectId();

      // Save to legacy permission-lifecycle store
      await saveDirectoryHandleReference(handle, projectId, handle.name);

      // Save to ProjectStore
      const project: ProjectMetadata = {
        id: projectId,
        name: handle.name,
        folderPath: handle.name,
        storageType: 'fsa',  // FSA-based project for IDE workspace
        storageMetadata: serializeHandle(handle, 'ide'), // PS-04: Use serializable metadata
        lastOpened: new Date(),
        autoSync,
        createdAt: new Date(),
        bindings: { ide: true, knowledge: true, notes: true, study: true },
        tags: [],
      };
      await saveProject(project);
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

      const newProjectId = generateProjectId();

      // Save to legacy permission-lifecycle store
      await saveDirectoryHandleReference(handle, newProjectId, handle.name);

      // Save to ProjectStore
      const project: ProjectMetadata = {
        id: newProjectId,
        name: handle.name,
        folderPath: handle.name,
        storageType: 'fsa',
        storageMetadata: serializeHandle(handle, 'ide'), // PS-04: Use serializable metadata
        lastOpened: new Date(),
        autoSync: true,
        createdAt: new Date(),
        bindings: { ide: true, knowledge: true, notes: true, study: true },
        tags: [],
      };
      await saveProject(project);
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
   */
  const restoreAccess = useCallback(async (): Promise<void> => {
    if (!directoryHandle) {
      console.warn('[FileOpsSlice] No directory handle to restore');
      return;
    }

    const result = await restorePermission(directoryHandle);
    setPermissionState(result);

    if (projectMetadata) {
      const updatedProject: ProjectMetadata = {
        ...projectMetadata,
        lastKnownPermissionState: result,
      };
      if (updatedProject.storageMetadata) { // PS-04: Check storageMetadata instead of fsaHandle
        await saveProject(updatedProject);
      }
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
