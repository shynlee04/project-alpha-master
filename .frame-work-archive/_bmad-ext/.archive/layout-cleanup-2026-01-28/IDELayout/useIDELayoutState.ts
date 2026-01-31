/**
 * IDE Layout State Hook
 *
 * Composes all IDE layout state from focused hooks.
 *
 * @layer Presentation
 * @hook useIDELayoutState
 */

import { useIDEStore } from '@/infrastructure/persistence/stores';
import { useToast } from '../../ui/Toast';
import { useIDELayoutFileState } from './useIDELayoutFileState';
import { useIDELayoutWorkspaceState } from './useIDELayoutWorkspaceState';
import { useIDELayoutDiscoveryState } from './useIDELayoutDiscoveryState';
import { useIDELayoutPanelRefs } from './useIDELayoutPanelRefs';
import type { UseIDELayoutStateResult } from './types';

/**
 * Hook to manage IDE layout state
 * Composes file state, workspace state, discovery state, and panel refs
 */
export function useIDELayoutState(): UseIDELayoutStateResult {
    const { toast } = useToast();

    // Zustand state (persisted to IndexedDB)
    const chatVisible = useIDEStore((s) => s.chatVisible);
    const setChatVisible = useIDEStore((s) => s.setChatVisible);
    const terminalTab = useIDEStore((s) => s.terminalTab);
    const setTerminalTab = useIDEStore((s) => s.setTerminalTab);

    // Compose focused state hooks
    const fileState = useIDELayoutFileState();
    const workspaceState = useIDELayoutWorkspaceState();
    const discoveryState = useIDELayoutDiscoveryState();
    const panelRefs = useIDELayoutPanelRefs();

    return {
        // Store state
        chatVisible,
        setChatVisible,
        terminalTab,
        setTerminalTab,

        // File state
        openFilePaths: fileState.openFilePaths,
        activeFilePath: fileState.activeFilePath,
        setActiveFilePath: fileState.setActiveFilePath,
        addOpenFile: fileState.addOpenFile,
        removeOpenFile: fileState.removeOpenFile,
        selectedFilePath: fileState.selectedFilePath,
        setSelectedFilePath: fileState.setSelectedFilePath,
        fileTreeRefreshKey: fileState.fileTreeRefreshKey,
        setFileTreeRefreshKey: fileState.setFileTreeRefreshKey,
        fileContentCache: fileState.fileContentCache,
        setFileContentCache: fileState.setFileContentCache,
        openFiles: fileState.openFiles,
        setOpenFiles: fileState.setOpenFiles,

        // Discovery state
        isCommandPaletteOpen: discoveryState.isCommandPaletteOpen,
        setIsCommandPaletteOpen: discoveryState.setIsCommandPaletteOpen,
        isFeatureSearchOpen: discoveryState.isFeatureSearchOpen,
        setIsFeatureSearchOpen: discoveryState.setIsFeatureSearchOpen,

        // Workspace state
        projectId: workspaceState.projectId,
        projectMetadata: workspaceState.projectMetadata,
        permissionState: workspaceState.permissionState,
        syncStatus: workspaceState.syncStatus,
        initialSyncCompleted: workspaceState.initialSyncCompleted,
        setIsWebContainerBooted: workspaceState.setIsWebContainerBooted,
        restoreAccess: workspaceState.restoreAccess,
        localAdapterRef: workspaceState.localAdapterRef,
        syncManagerRef: workspaceState.syncManagerRef,
        eventBus: workspaceState.eventBus,
        fileTools: workspaceState.fileTools,
        terminalTools: workspaceState.terminalTools,

        // Panel refs
        mainPanelGroupRef: panelRefs.mainPanelGroupRef,
        centerPanelGroupRef: panelRefs.centerPanelGroupRef,
        editorPanelGroupRef: panelRefs.editorPanelGroupRef,

        // Toast
        toast
    };
}
