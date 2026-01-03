/**
 * IDE Layout Workspace State Hook
 *
 * Manages workspace refs, tool facades, and project metadata.
 *
 * @layer Presentation
 * @hook useIDELayoutWorkspaceState
 */

import { useMemo } from 'react';
import { useWorkspace } from '@/lib/workspace';
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

interface UseIDELayoutWorkspaceStateResult {
    // Project metadata
    projectId: string | null;
    projectMetadata: any;
    permissionState: any;
    syncStatus: any;
    initialSyncCompleted: boolean;
    setIsWebContainerBooted: (booted: boolean) => void;
    restoreAccess: () => void;

    // Workspace refs
    localAdapterRef: React.RefObject<any>;
    syncManagerRef: React.RefObject<any>;
    eventBus: any;

    // Tool facades
    fileTools: any;
    terminalTools: any;
}

/**
 * Hook to manage workspace state and tool facades
 */
export function useIDELayoutWorkspaceState(): UseIDELayoutWorkspaceStateResult {
    const {
        projectId,
        projectMetadata,
        permissionState,
        syncStatus,
        initialSyncCompleted,
        localAdapterRef,
        syncManagerRef,
        eventBus,
        setIsWebContainerBooted,
        restoreAccess
    } = useWorkspace();

    // Story MVP-3: Create tool facades for agent
    const fileTools = useMemo(() => {
        if (!localAdapterRef.current || !syncManagerRef.current) return null;
        return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
    }, [localAdapterRef.current, syncManagerRef.current, eventBus]);

    const terminalTools = useMemo(() => {
        if (!syncManagerRef.current) return null;
        return createTerminalToolsFacade(eventBus);
    }, [syncManagerRef.current, eventBus]);

    return {
        projectId,
        projectMetadata,
        permissionState,
        syncStatus,
        initialSyncCompleted,
        setIsWebContainerBooted,
        restoreAccess,
        localAdapterRef,
        syncManagerRef,
        eventBus,
        fileTools,
        terminalTools
    };
}
