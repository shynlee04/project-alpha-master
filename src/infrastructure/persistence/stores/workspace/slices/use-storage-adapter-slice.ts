/**
 * @fileoverview Storage Adapter Slice - Sync & Adapter Management
 * @module infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Split useWorkspaceFileSystem God Store
 *
 * Manages:
 * - Sync operations (performSync, syncNow)
 * - Adapter lifecycle (LocalFSAdapter, SyncManager)
 * - Event bus initialization and bridging
 * - Auto-sync and exclusion patterns
 *
 * Part of the 3-slice architecture:
 * 1. use-file-loader-slice - Project loading
 * 2. use-file-ops-slice - CRUD folder actions
 * 3. use-storage-adapter-slice (THIS) - Sync/adapter management
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type RefObject,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { LocalFSAdapter } from '@/infrastructure/filesystem';
import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
import { SyncManager } from '@/infrastructure/sync';
import type {
  SyncStatus,
  SyncProgress,
  SyncResult,
} from '@/infrastructure/sync/types';
import { createWorkspaceEventBus } from '@/lib/events/workspace-events';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import { noteFolderBridge } from '@/infrastructure/sync/bridges/note-folder-bridge';
import type { ProjectMetadata } from '@/lib/workspace/project-store';
import { saveProject } from '@/lib/workspace/project-store';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';

/**
 * Storage adapter slice configuration
 */
export interface UseStorageAdapterSliceOptions {
  // State from loader slice
  projectMetadata: ProjectMetadata | null;
  setProjectMetadata: Dispatch<SetStateAction<ProjectMetadata | null>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  autoSync: boolean;
  setAutoSyncState: Dispatch<SetStateAction<boolean>>;
  exclusionPatterns: string[];
  setExclusionPatterns: Dispatch<SetStateAction<string[]>>;

  // Refs from loader slice
  localAdapterRef: RefObject<LocalFSAdapter | UnifiedStorageAdapter | null>;
}

/**
 * Storage adapter slice return type
 */
export interface StorageAdapterSliceResult {
  // State
  syncStatus: SyncStatus;
  syncProgress: SyncProgress | null;
  lastSyncTime: Date | null;
  syncError: string | null;
  isWebContainerBooted: boolean;
  setIsWebContainerBooted: Dispatch<SetStateAction<boolean>>;
  initialSyncCompleted: boolean;
  setInitialSyncCompleted: Dispatch<SetStateAction<boolean>>;

  // Actions
  performSync: (handle: FileSystemDirectoryHandle, options?: { fullSync?: boolean; projectId?: string }) => Promise<boolean>;
  syncNow: (handle?: FileSystemDirectoryHandle | null) => Promise<void>;
  setAutoSync: (enabled: boolean) => Promise<void>;
  setExclusionPatternsFn: (patterns: string[]) => Promise<void>;

  // Refs
  syncManagerRef: RefObject<SyncManager | null>;
  eventBus: any;
}

/**
 * Storage Adapter Slice Hook
 *
 * Handles sync operations, adapter management, and event bus bridging.
 *
 * @param options - Configuration options
 * @returns Storage adapter state and actions
 */
export function useStorageAdapterSlice({
  projectMetadata,
  setProjectMetadata,
  directoryHandle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passed for interface consistency
  autoSync: _autoSync,
  setAutoSyncState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- passed for interface consistency
  exclusionPatterns: _exclusionPatterns,
  setExclusionPatterns,
  localAdapterRef,
}: UseStorageAdapterSliceOptions): StorageAdapterSliceResult {
  const deviceType = useDeviceType();

  // Refs
  const syncManagerRef = useRef<SyncManager | null>(null);
  const eventBusRef = useRef<any>(null);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isWebContainerBooted, setIsWebContainerBooted] = useState(false);
  const [initialSyncCompleted, setInitialSyncCompleted] = useState(false);

  // Initialize event bus and bridge to cross-workspace events
  useEffect(() => {
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

    // Cleanup
    return () => {
      eventBus.off('sync:started', handleSyncStarted);
      eventBus.off('sync:completed', handleSyncCompleted);
      eventBus.off('sync:error', handleSyncError);
    };
  }, [projectMetadata?.id]);

  /**
   * Perform sync operation
   */
  const performSync = useCallback(
    async (handle: FileSystemDirectoryHandle, options?: { fullSync?: boolean; projectId?: string }): Promise<boolean> => {
      const fullSync = options?.fullSync ?? true;

      try {
        let adapter = localAdapterRef.current;
        let syncManager = syncManagerRef.current;

        if (!adapter || !syncManager) {
          const fsAdapter = new LocalFSAdapter();
          fsAdapter.setDirectoryHandle(handle);

          syncManager = new SyncManager(
            fsAdapter,
            {
              onProgress: (progress: SyncProgress) => {
                setSyncProgress(progress);
              },
              onError: (error: Error) => {
                if (deviceType.isMobile || deviceType.isTablet) {
                  showMobileWorkspaceError('openFailed');
                  return;
                }
                console.warn('[StorageAdapterSlice] Sync error:', error.message);
              },
              onComplete: (result: SyncResult) => {
                console.log('[StorageAdapterSlice] Sync complete:', result);
                if (result.failedFiles.length > 0) {
                  setSyncError(`Synced with ${result.failedFiles.length} failed files`);
                }
              },
            },
            eventBusRef.current
          );

          localAdapterRef.current = fsAdapter;
          syncManagerRef.current = syncManager;
          adapter = fsAdapter;
        } else if ('setDirectoryHandle' in adapter && typeof adapter.setDirectoryHandle === 'function') {
          (adapter as LocalFSAdapter).setDirectoryHandle(handle);
        }

        if (!fullSync) {
          return true;
        }

        setSyncStatus('syncing');
        setSyncError(null);

        await syncManager.syncToWebContainer();

        // Bridge to Notes
        const pid = options?.projectId || projectMetadata?.id;
        if (pid && adapter) {
          noteFolderBridge.syncFromAdapter(pid, adapter)
            .catch((err: unknown) => console.error('[StorageAdapterSlice] Note bridge sync failed:', err));
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
        console.error('[StorageAdapterSlice] Sync failed:', error);
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
        setSyncStatus('error');
        setSyncProgress(null);
        return false;
      }
    },
    [deviceType, projectMetadata?.id, localAdapterRef]
  );

  /**
   * Sync now (manual trigger)
   */
  const syncNow = useCallback(
    async (handle: FileSystemDirectoryHandle | null = directoryHandle): Promise<void> => {
      if (!handle) {
        console.warn('[StorageAdapterSlice] No directory handle, cannot sync');
        return;
      }

      if (syncStatus === 'syncing') {
        console.warn('[StorageAdapterSlice] Sync already in progress');
        return;
      }

      await performSync(handle);
    },
    [directoryHandle, syncStatus, performSync]
  );

  /**
   * Set auto-sync enabled
   */
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
    [projectMetadata, setAutoSyncState, setProjectMetadata]
  );

  /**
   * Update exclusion patterns
   */
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
    [projectMetadata, setExclusionPatterns, setProjectMetadata]
  );

  return {
    // State
    syncStatus,
    syncProgress,
    lastSyncTime,
    syncError,
    isWebContainerBooted,
    setIsWebContainerBooted,
    initialSyncCompleted,
    setInitialSyncCompleted,

    // Actions
    performSync,
    syncNow,
    setAutoSync,
    setExclusionPatternsFn,

    // Refs
    syncManagerRef,
    eventBus: eventBusRef.current,
  };
}
