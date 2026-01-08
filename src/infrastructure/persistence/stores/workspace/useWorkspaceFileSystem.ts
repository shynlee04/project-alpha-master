/**
 * @fileoverview Workspace File System Hook
 * @module infrastructure/persistence/stores/workspace/useWorkspaceFileSystem
 *
 * Manages file system operations, sync, and project metadata.
 * Handles File System Access API integration with WebContainer sync.
 *
 * Part of P0-2 refactoring: Extracted from unified-workspace-provider.tsx
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  LocalFSAdapter,
} from '@/infrastructure/filesystem';
import { SyncManager } from '@/infrastructure/sync';
import type {
  SyncStatus,
  SyncProgress,
  SyncResult,
} from '@/infrastructure/sync/types';
import { createWorkspaceEventBus } from '@/lib/events/workspace-events';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
import type { ProjectMetadata } from '@/lib/workspace/project-store';
import {
  getProject,
  saveProject,
  generateProjectId,
} from '@/lib/workspace/project-store';
import { useWorkspaceStore } from './workspace-store';
import {
  getPermissionState,
  ensureReadWritePermission,
  saveDirectoryHandleReference,
  restorePermission,
} from '@/lib/filesystem/permission-lifecycle';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';
import { noteFolderBridge } from '@/infrastructure/sync/bridges/note-folder-bridge';

/**
 * File system hook configuration
 */
export interface UseWorkspaceFileSystemOptions {
  initialProjectId?: string | null;
  setCurrentProject: (id: string) => void;
}

/**
 * Workspace file system hook
 *
 * Manages:
 * - File system state (directory handle, permissions, sync status)
 * - Sync operations (performSync, syncNow)
 * - File system actions (openFolder, switchFolder, restoreAccess)
 * - Project metadata persistence
 */
export function useWorkspaceFileSystem({
  initialProjectId,
  setCurrentProject,
}: UseWorkspaceFileSystemOptions) {
  const navigate = useNavigate();
  const deviceType = useDeviceType();

  // Get currentProjectId from workspace store for reactive loading
  const currentProjectId = useWorkspaceStore((s) => s.currentProjectId);

  // Infrastructure refs
  const localAdapterRef = useRef<LocalFSAdapter | null>(null);
  const syncManagerRef = useRef<SyncManager | null>(null);
  const eventBusRef = useRef<any>(null);

  // File system state
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  // Initial state 'unknown' prevents flash of "No Folder Selected" overlay before project load
  const [permissionState, setPermissionState] = useState<FsaPermissionState>('unknown');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSync, setAutoSyncState] = useState(true);
  const [isOpeningFolder, setIsOpeningFolder] = useState(false);
  const [exclusionPatterns, setExclusionPatterns] = useState<string[]>([]);
  const [isWebContainerBooted, setIsWebContainerBooted] = useState(false);
  const [initialSyncCompleted, setInitialSyncCompleted] = useState(false);

  // Load project on mount (if initialProjectId provided) OR when currentProjectId changes
  // This ensures that navigating to /ide/$projectId triggers project load in the file system
  useEffect(() => {
    const projectIdToLoad = currentProjectId || initialProjectId;

    if (!projectIdToLoad || (projectMetadata && projectMetadata.id === projectIdToLoad)) {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const project = await getProject(projectIdToLoad);
        if (!active) return;

        if (project) {
          console.log('[WorkspaceProvider] Hydrated project:', project.name);
          setProjectMetadata(project);
          setDirectoryHandle(project.fsaHandle || null);

          // FIX-2026-01-06: Check actual permission state instead of always setting 'prompt'
          // This prevents the "No Folder Selected" overlay from showing incorrectly
          if (project.storageType === 'indexeddb') {
            // Dexie-stored projects have no FSA handle - auto-grant permission
            setPermissionState('granted');
          } else if (project.fsaHandle) {
            const actualState = await getPermissionState(project.fsaHandle, 'readwrite');
            console.log('[WorkspaceProvider] Actual permission state:', actualState);
            setPermissionState(actualState);
          } else {
            // No handle means we need to prompt for folder selection
            setPermissionState('prompt');
          }

          if (project.autoSync !== undefined) {
            setAutoSyncState(project.autoSync);
          }
          if (project.exclusionPatterns) {
            setExclusionPatterns(project.exclusionPatterns);
          }
        } else {
          console.warn('[WorkspaceProvider] Project not found:', projectIdToLoad);
        }
      } catch (err) {
        console.error('[WorkspaceProvider] Failed to load project:', err);
      }
    };
    load();
    return () => { active = false; };
  }, [currentProjectId, initialProjectId, projectMetadata?.id]);

  // Initialize event bus and bridge to cross-workspace events
  // This bridge forwards workspace sync events to the cross-workspace event bus
  // so SyncStatusPanel can receive real-time sync updates
  useEffect(() => {
    // Create workspace event bus if not exists
    if (!eventBusRef.current) {
      eventBusRef.current = createWorkspaceEventBus();
    }

    const eventBus = eventBusRef.current;
    const projectId = projectMetadata?.id || 'unknown';

    // Bridge: Listen to workspace sync events and emit to crossWorkspaceEventBus
    const handleSyncStarted = () => {
      crossWorkspaceEventBus.emitSyncStatus({
        workspaceId: 'ide',
        projectPath: projectId,
        status: 'syncing',
      });
    };

    const handleSyncCompleted = (data: { success: boolean }) => {
      if (data.success) {
        crossWorkspaceEventBus.emitSyncStatus({
          workspaceId: 'ide',
          projectPath: projectId,
          status: 'synced',
        });
      } else {
        crossWorkspaceEventBus.emitSyncStatus({
          workspaceId: 'ide',
          projectPath: projectId,
          status: 'error',
          error: 'Sync completed with errors',
        });
      }
    };

    const handleSyncError = (data: { error: Error }) => {
      crossWorkspaceEventBus.emitSyncStatus({
        workspaceId: 'ide',
        projectPath: projectId,
        status: 'error',
        error: data.error.message,
      });
    };

    // Subscribe to workspace events
    eventBus.on('sync:started', handleSyncStarted);
    eventBus.on('sync:completed', handleSyncCompleted);
    eventBus.on('sync:error', handleSyncError);

    // Cleanup on unmount or projectId change
    return () => {
      eventBus.off('sync:started', handleSyncStarted);
      eventBus.off('sync:completed', handleSyncCompleted);
      eventBus.off('sync:error', handleSyncError);
    };
  }, [projectMetadata?.id]);

  // Sync operations
  const performSync = useCallback(
    async (handle: FileSystemDirectoryHandle, options?: { fullSync?: boolean; projectId?: string }): Promise<boolean> => {
      const fullSync = options?.fullSync ?? true;

      try {
        let adapter = localAdapterRef.current;
        let syncManager = syncManagerRef.current;

        if (!adapter || !syncManager) {
          adapter = new LocalFSAdapter();
          adapter.setDirectoryHandle(handle);

          syncManager = new SyncManager(
            adapter,
            {
              onProgress: (progress: SyncProgress) => {
                setSyncProgress(progress);
              },
              onError: (error: Error) => {
                if (deviceType.isMobile || deviceType.isTablet) {
                  showMobileWorkspaceError('openFailed');
                  return;
                }
                console.warn('[Workspace] Sync error:', error.message);
              },
              onComplete: (result: SyncResult) => {
                console.log('[Workspace] Sync complete:', result);
                if (result.failedFiles.length > 0) {
                  setSyncError(`Synced with ${result.failedFiles.length} failed files`);
                }
              },
            },
            eventBusRef.current
          );

          localAdapterRef.current = adapter;
          syncManagerRef.current = syncManager;
        } else {
          adapter.setDirectoryHandle(handle);
        }

        if (!fullSync) {
          return true;
        }

        setSyncStatus('syncing');
        setSyncError(null);

        await syncManager.syncToWebContainer();

        // S-008: Bridge to Notes (Story 27-2)
        const pid = options?.projectId || projectMetadata?.id;
        if (pid && adapter) {
          // Non-blocking sync to notes
          noteFolderBridge.syncFromAdapter(pid, adapter)
            .catch((err: unknown) => console.error('[Workspace] Note bridge sync failed:', err));
        }

        setLastSyncTime(new Date());
        setSyncStatus('idle');
        setSyncProgress(null);
        return true;
      } catch (error) {
        if (deviceType.isMobile || deviceType.isTablet) {
          showMobileWorkspaceError('openFailed');
          setSyncError('Sync failed on mobile device');
          setSyncStatus('error');
          setSyncProgress(null);
          return false;
        }
        console.error('[Workspace] Sync failed:', error);
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
        setSyncStatus('error');
        setSyncProgress(null);
        return false;
      }
    },
    [deviceType, projectMetadata?.id]
  );

  const syncNow = useCallback(
    async (handle: FileSystemDirectoryHandle | null = directoryHandle): Promise<void> => {
      if (!handle) {
        console.warn('[Workspace] No directory handle, cannot sync');
        return;
      }

      if (syncStatus === 'syncing') {
        console.warn('[Workspace] Sync already in progress');
        return;
      }

      await performSync(handle);
    },
    [directoryHandle, syncStatus, performSync]
  );

  // File system actions
  const openFolder = useCallback(async (): Promise<void> => {
    if (!LocalFSAdapter.isSupported()) {
      const { isMobile, isTablet } = deviceType;
      if (isMobile || isTablet) {
        showMobileWorkspaceError('openFailed');
        return;
      }
      console.warn('[Workspace] File System Access API not supported');
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
        fsaHandle: handle,
        lastOpened: new Date(),
        autoSync,
        createdAt: new Date(), // Required by Project entity
        bindings: { ide: true }, // Default binding
        tags: [], // Required by Project entity
      };
      await saveProject(project);
      setProjectMetadata(project);
      setCurrentProject(projectId);

      // Perform initial sync
      await performSync(handle, { fullSync: autoSync, projectId });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        const { isMobile, isTablet } = deviceType;
        if (isMobile || isTablet) {
          showMobileWorkspaceError('openFailed');
          return;
        }
        console.error('[Workspace] Failed to open folder:', error);
      }
    } finally {
      setIsOpeningFolder(false);
    }
  }, [directoryHandle, performSync, autoSync, deviceType, setCurrentProject]);

  const switchFolder = useCallback(async (): Promise<void> => {
    if (!LocalFSAdapter.isSupported()) {
      const { isMobile, isTablet } = deviceType;
      if (isMobile || isTablet) {
        showMobileWorkspaceError('openFailed');
        return;
      }
      console.warn('[Workspace] File System Access API not supported');
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
      setAutoSyncState(true);

      // Save to legacy permission-lifecycle store
      await saveDirectoryHandleReference(handle, newProjectId, handle.name);

      // Save to ProjectStore
      const project: ProjectMetadata = {
        id: newProjectId,
        name: handle.name,
        folderPath: handle.name,
        storageType: 'fsa',  // FSA-based project for IDE workspace
        fsaHandle: handle,
        lastOpened: new Date(),
        autoSync: true,
        createdAt: new Date(), // Required by Project entity
        bindings: { ide: true }, // Default binding
        tags: [], // Required by Project entity
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
        console.error('[Workspace] Failed to switch folder:', error);
      }
    } finally {
      setIsOpeningFolder(false);
    }
  }, [navigate, performSync, setCurrentProject, deviceType]);

  const setAutoSync = useCallback(
    async (enabled: boolean): Promise<void> => {
      setAutoSyncState(enabled);

      if (!projectMetadata) return;

      const updatedProject: ProjectMetadata = {
        ...projectMetadata,
        autoSync: enabled,
      };

      if (updatedProject.fsaHandle) {
        const saved = await saveProject(updatedProject);
        if (saved) {
          setProjectMetadata(updatedProject);
        }
      } else {
        setProjectMetadata(updatedProject);
      }
    },
    [projectMetadata]
  );

  const setExclusionPatternsFn = useCallback(
    async (patterns: string[]): Promise<void> => {
      setExclusionPatterns(patterns);

      if (syncManagerRef.current) {
        syncManagerRef.current.setExcludePatterns(patterns);
      }

      if (!projectMetadata) return;

      const updatedProject: ProjectMetadata = {
        ...projectMetadata,
        exclusionPatterns: patterns,
      };

      if (updatedProject.fsaHandle) {
        const saved = await saveProject(updatedProject);
        if (saved) {
          setProjectMetadata(updatedProject);
        }
      } else {
        setProjectMetadata(updatedProject);
      }
    },
    [projectMetadata]
  );

  const closeProject = useCallback((): void => {
    localAdapterRef.current = null;
    syncManagerRef.current = null;
    navigate({ to: '/' });
  }, [navigate]);

  const restoreAccess = useCallback(async (): Promise<void> => {
    if (!directoryHandle) {
      console.warn('[Workspace] No directory handle to restore');
      return;
    }

    const result = await restorePermission(directoryHandle);
    setPermissionState(result);

    if (projectMetadata) {
      const updatedProject: ProjectMetadata = {
        ...projectMetadata,
        lastKnownPermissionState: result,
      };
      if (updatedProject.fsaHandle) {
        await saveProject(updatedProject);
      }
      setProjectMetadata(updatedProject);
    }

    if (result === 'granted') {
      await performSync(directoryHandle, { fullSync: autoSync });
    }
  }, [directoryHandle, projectMetadata, autoSync, performSync]);

  return {
    // State
    projectMetadata: projectMetadata,
    directoryHandle,
    permissionState,
    syncStatus,
    syncProgress,
    lastSyncTime,
    syncError,
    autoSync,
    isOpeningFolder,
    exclusionPatterns,
    isWebContainerBooted,
    initialSyncCompleted,
    // Actions
    openFolder,
    switchFolder,
    syncNow,
    setAutoSync,
    setExclusionPatterns: setExclusionPatternsFn,
    closeProject,
    restoreAccess,
    setIsWebContainerBooted,
    setInitialSyncCompleted,
    // Refs (for advanced use cases)
    localAdapterRef,
    syncManagerRef,
    eventBus: eventBusRef.current,
  };
}
