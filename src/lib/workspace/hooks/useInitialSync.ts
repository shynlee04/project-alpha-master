/**
 * @module lib/workspace/hooks/useInitialSync
 * 
 * Story 13-2: Fixed auto-sync trigger logic.
 * Previous issue: Used ref-based check (!syncManagerRef.current) which only triggered once.
 * Fix: Use state-based checks (isWebContainerBooted, initialSyncCompleted) for reliable triggering.
 */

import { useEffect } from 'react';
import { getPermissionState } from '../../filesystem/permission-lifecycle';
import type { useWorkspaceState } from './useWorkspaceState';
import type { useSyncOperations } from './useSyncOperations';

type WorkspaceStateReturn = ReturnType<typeof useWorkspaceState>;
type SyncOperationsReturn = ReturnType<typeof useSyncOperations>;

export function useInitialSync(
    state: WorkspaceStateReturn['state'],
    setters: WorkspaceStateReturn['setters'],
    _refs: WorkspaceStateReturn['refs'],  // Unused after Story 13-2 fix - keeping for API compatibility
    syncOperations: SyncOperationsReturn
) {
    const {
        directoryHandle,
        syncStatus,
        autoSync,
        isWebContainerBooted,
        initialSyncCompleted
    } = state;

    const {
        setPermissionState,
        setInitialSyncCompleted
    } = setters;

    // Note: syncManagerRef still used by performSync internally
    const { performSync } = syncOperations;

    useEffect(() => {
        // Story 13-2 Fix: Use state-based checks instead of ref-based
        // Conditions for auto-sync:
        // 1. Have a directory handle
        // 2. WebContainer is booted
        // 3. Initial sync hasn't completed yet
        // 4. Not currently syncing
        // 5. Auto-sync is enabled
        if (
            directoryHandle &&
            isWebContainerBooted &&
            !initialSyncCompleted &&
            syncStatus === 'idle' &&
            autoSync
        ) {
            const initSync = async () => {
                console.log('[Workspace] Starting initial auto-sync...');
                const updatedState = await getPermissionState(directoryHandle, 'readwrite');
                setPermissionState(updatedState);

                if (updatedState === 'granted') {
                    try {
                        await performSync(directoryHandle, { fullSync: true });
                        setInitialSyncCompleted(true);
                        console.log('[Workspace] Initial auto-sync completed successfully');
                    } catch (error) {
                        console.error('[Workspace] Initial sync failed:', error);
                        // Don't set initialSyncCompleted so it can retry
                    }
                } else {
                    console.log('[Workspace] Permission needed for initial sync');
                    // Permission not granted - user can manually trigger sync
                }
            };
            initSync();
        }
    }, [
        directoryHandle,
        isWebContainerBooted,
        initialSyncCompleted,
        syncStatus,
        autoSync,
        performSync,
        setPermissionState,
        setInitialSyncCompleted
    ]);
}
