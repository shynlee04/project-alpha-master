/**
 * @module lib/workspace/hooks/useWorkspaceActions
 */

import { useCallback } from 'react';
import type { NavigateFn } from '@tanstack/react-router';
import { LocalFSAdapter } from '../../filesystem';
import {
    type ProjectMetadata,
    saveProject,
    generateProjectId
} from '@/infrastructure/persistence/stores/project';
import {
    getPermissionState,
    ensureReadWritePermission,
    saveDirectoryHandleReference,
    restorePermission,
} from '../../filesystem/permission-lifecycle';
import type { useWorkspaceState } from './useWorkspaceState';
import type { useSyncOperations } from './useSyncOperations';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceRedirect } from '@/lib/utils/mobile-error-handling';
import {
    serializeHandle,
    handlePersistenceService,
} from '@/infrastructure/filesystem/handle-persistence';

type WorkspaceStateReturn = ReturnType<typeof useWorkspaceState>;
type SyncOperationsReturn = ReturnType<typeof useSyncOperations>;

export function useWorkspaceActions(
    navigate: NavigateFn,
    state: WorkspaceStateReturn['state'],
    setters: WorkspaceStateReturn['setters'],
    refs: WorkspaceStateReturn['refs'],
    syncOperations: SyncOperationsReturn,
    projectId: string
) {
    const deviceType = useDeviceType();
    const {
        projectMetadata,
        directoryHandle,
        autoSync,
    } = state;

    const {
        setProjectMetadata,
        setDirectoryHandle,
        setPermissionState,
        setAutoSyncState,
        setIsOpeningFolder,
        setExclusionPatterns: setExclusionPatternsState,
    } = setters;

    const {
        localAdapterRef,
        syncManagerRef
    } = refs;

    const { performSync } = syncOperations;

    const openFolder = useCallback(async (): Promise<void> => {
        if (!LocalFSAdapter.isSupported()) {
            // Check if mobile/tablet and redirect to Notes workspace
            const { isMobile, isTablet } = deviceType;
            if (isMobile || isTablet) {
                showMobileWorkspaceRedirect((path) => navigate({ to: path }));
                return;
            }
            console.warn('[Workspace] File System Access API not supported');
            return;
        }

        // If we have an existing handle, try to restore permission first
        if (directoryHandle) {
            const state = await getPermissionState(directoryHandle, 'readwrite');
            if (state === 'granted') {
                // Already have permission, just sync
                await performSync(directoryHandle, { fullSync: autoSync });
                return;
            }

            // Try to request permission
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

            // Save to legacy permission-lifecycle store
            await saveDirectoryHandleReference(handle, projectId, handle.name);

            // Save to ProjectStore (Story 3-7)
            const project: ProjectMetadata = {
                id: projectId,
                name: handle.name,
                folderPath: handle.name,
                storageType: 'fsa',
                storageMetadata: serializeHandle(handle, 'ide'), // PS-04: Use serializable metadata
                lastOpened: new Date(),
                autoSync,
                createdAt: new Date(),
                workspaceBindings: { ide: true, knowledge: true, notes: true, study: true }, // ARC-D03
                tags: [],
            };
            await saveProject(project);
            setProjectMetadata(project);

            // Perform initial sync
            await performSync(handle, { fullSync: autoSync });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                // Check if mobile/tablet and redirect to Notes workspace
                const { isMobile, isTablet } = deviceType;
                if (isMobile || isTablet) {
                    showMobileWorkspaceRedirect((path) => navigate({ to: path }));
                    return;
                }
                console.error('[Workspace] Failed to open folder:', error);
            }
        } finally {
            setIsOpeningFolder(false);
        }
    }, [directoryHandle, performSync, projectId, autoSync, setDirectoryHandle, setPermissionState, setProjectMetadata, setIsOpeningFolder, setAutoSyncState, deviceType, navigate]); // Added deviceType and navigate to deps

    const switchFolder = useCallback(async (): Promise<void> => {
        if (!LocalFSAdapter.isSupported()) {
            // Check if mobile/tablet and redirect to Notes workspace
            const { isMobile, isTablet } = deviceType;
            if (isMobile || isTablet) {
                showMobileWorkspaceRedirect((path) => navigate({ to: path }));
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

            // Generate new project ID for the new folder
            const newProjectId = generateProjectId();

            setAutoSyncState(true);

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
                workspaceBindings: { ide: true, knowledge: true, notes: true, study: true }, // ARC-D03
                tags: [],
            };
            await saveProject(project);
            setProjectMetadata(project);

            // Perform sync with new folder
            await performSync(handle, { fullSync: true });

            // Navigate to new project
            navigate({ to: '/$projectId', params: { projectId: newProjectId } });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                // Check if mobile/tablet and redirect to Notes workspace
                const { isMobile, isTablet } = deviceType;
                if (isMobile || isTablet) {
                    showMobileWorkspaceRedirect((path) => navigate({ to: path }));
                    return;
                }
                console.error('[Workspace] Failed to switch folder:', error);
            }
        } finally {
            setIsOpeningFolder(false);
        }
    }, [navigate, performSync, setDirectoryHandle, setPermissionState, setAutoSyncState, setProjectMetadata, setIsOpeningFolder, localAdapterRef, syncManagerRef, deviceType]); // Added deviceType to deps

    const setAutoSync = useCallback(
        async (enabled: boolean): Promise<void> => {
            setAutoSyncState(enabled);

            if (!projectMetadata) return;

            const updatedProject: ProjectMetadata = {
                ...projectMetadata,
                autoSync: enabled,
            };

            const saved = await saveProject(updatedProject);
            if (saved) {
                setProjectMetadata(updatedProject);
            }
        },
        [projectMetadata, setAutoSyncState, setProjectMetadata]
    );

    const setExclusionPatterns = useCallback(
        async (patterns: string[]): Promise<void> => {
            setExclusionPatternsState(patterns);

            // Update SyncManager if available
            if (syncManagerRef.current) {
                syncManagerRef.current.setExcludePatterns(patterns);
            }

            // Persist to ProjectStore
            if (!projectMetadata) return;

            const updatedProject: ProjectMetadata = {
                ...projectMetadata,
                exclusionPatterns: patterns,
            };

            const saved = await saveProject(updatedProject);
            if (saved) {
                setProjectMetadata(updatedProject);
            }
        },
        [projectMetadata, syncManagerRef, setExclusionPatternsState, setProjectMetadata]
    );

    const closeProject = useCallback((): void => {
        // Clear refs
        localAdapterRef.current = null;
        syncManagerRef.current = null;

        // Navigate to dashboard
        navigate({ to: '/' });
    }, [navigate, localAdapterRef, syncManagerRef]);

    /**
     * Story 13-5: Restore access to a project folder.
     * Called when user clicks "Restore Access" button for handles with 'prompt' state.
     * This gives users control over when the permission dialog appears.
     *
     * FSA-010: Permission state updated in FSAHandleRecord, not in Project.lastKnownPermissionState
     */
    const restoreAccess = useCallback(async (): Promise<void> => {
        if (!directoryHandle) {
            console.warn('[Workspace] No directory handle to restore');
            return;
        }

        const result = await restorePermission(directoryHandle);
        setPermissionState(result);

        // FSA-010: Update permission state in FSAHandleRecord (single source of truth)
        if (projectMetadata) {
            await handlePersistenceService.updatePermissionStatus(projectMetadata.id, result);

            // Update the project's storageMetadata with new access time
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

        // If granted, trigger sync
        if (result === 'granted') {
            await performSync(directoryHandle, { fullSync: autoSync });
        }
    }, [directoryHandle, projectMetadata, autoSync, performSync, setPermissionState, setProjectMetadata]);

    return {
        openFolder,
        switchFolder,
        setAutoSync,
        setExclusionPatterns,
        closeProject,
        restoreAccess,  // Story 13-5
    };
}
