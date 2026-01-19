/**
 * @fileoverview IDE Layout Component
 * @module components/layout/IDELayout
 *
 * Main IDE layout component that orchestrates all IDE panels.
 * Uses react-resizable-panels for a VS Code-like layout.
 * Responsive: Uses MobileIDELayout for viewports <768px.
 *
 * @epic Epic-23 Story P1.1
 * @integration Design tokens implementation for consistent styling
 * @epic Epic-23 Story P1.9
 * @integration Error boundaries for critical components
 * @epic Epic-MRT Mobile Responsive Transformation
 * @integration Responsive branching for mobile/desktop layouts
 */

import { useEffect, useRef } from 'react';
import { SidebarProvider, ActivityBar, SidebarContent } from '../ide/IconSidebar';
import { StatusAnnouncerProvider } from '@/presentation/components/ui/StatusAnnouncer';
import { SkipLinks } from '@/presentation/components/ui/SkipLinks';
import { MobileCapabilityBanner } from '@/presentation/components/ui/MobileCapabilityBanner';
import { PermissionOverlay } from './PermissionOverlay';
import { IDEHeaderBar } from './IDEHeaderBar';
import { StatusBar } from '../ide/StatusBar';
import { MobileIDELayout } from './MobileIDELayout';
import { useResponsive } from '@/hooks/useResponsive';
import {
    useIDEKeyboardShortcuts,
    useWebContainerBoot,
    useIDEFileHandlers,
    useIDEStateRestoration,
    useIdeStatePersistence,
} from './hooks';
import { useFileTreeEventSubscriptions } from '../ide/FileTree/hooks/useFileTreeEventSubscriptions';
import { useMonacoEditorEventSubscriptions } from '../ide/MonacoEditor/hooks';
import { useVFSAutoWatch } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
import { createWebContainerFSAAdapter } from '@/infrastructure/webcontainer/fsa-adapter';
import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
import { getInstance } from '@/lib/webcontainer';
import type { WebContainerFSAAdapter as WebContainerFSAAdapterType } from '@/infrastructure/webcontainer/fsa-adapter';

// Import sub-components
import {
    IDEDiscoveryMechanisms,
    IDESidebarPanels,
    IDEResizableLayout,
    useIDELayoutState
} from './IDELayout';

/**
 * IDELayout - Main IDE layout orchestrator.
 *
 * Consumes WorkspaceContext and coordinates:
 * - Resizable panel layout
 * - File tree, editor, preview, terminal, chat panels
 * - IDE state persistence
 *
 * @responsive Uses MobileIDELayout for viewports <768px
 */
export function IDELayout(): React.JSX.Element {
    // Responsive branching using semantic hook
    const { isMobile, isTablet } = useResponsive();

    // Early return for mobile - use dedicated mobile layout
    if (isMobile) {
        return <MobileIDELayout />;
    }

    // Get all IDE layout state from custom hook
    const layoutState = useIDELayoutState();

    // Panel refs
    const {
        mainPanelGroupRef,
        centerPanelGroupRef,
        editorPanelGroupRef,
        projectId,
        openFiles: openFilesDerived,
        openFilePaths,
        activeFilePath,
        selectedFilePath,
        fileTreeRefreshKey,
        chatVisible,
        terminalTab,
        isCommandPaletteOpen,
        isFeatureSearchOpen,
        eventBus,
        permissionState,
        syncStatus,
        localAdapterRef,
        toast,
        setActiveFilePath,
        setChatVisible,
        setTerminalTab,
        setSelectedFilePath,
        setFileTreeRefreshKey,
        setFileContentCache,
        fileTools,
        terminalTools,
        setIsWebContainerBooted,
        restoreAccess,
        addOpenFile,
        removeOpenFile,
        setOpenFiles
    } = layoutState;

    // State persistence
    const {
        appliedPanelGroupsRef,
        didRestoreOpenFilesRef,
        activeFileScrollTopRef,
        openFilePathsRef,
        activeFilePathRef,
        terminalTabRef,
        chatVisibleRef,
        scheduleIdeStatePersistence,
        handlePanelLayoutChange,
        restoredIdeState
    } = useIdeStatePersistence({ projectId });

    // Extracted hooks
    useIDEKeyboardShortcuts({
        onChatToggle: () => setChatVisible(true),
        onCommandPaletteOpen: () => layoutState.setIsCommandPaletteOpen(true),
    });

    const { previewUrl, previewPort } = useWebContainerBoot({ 
        onBooted: () => {
            setIsWebContainerBooted(true);
            isWebContainerBootedRef.current = true;
        } 
    });

    // CC-IDE-05b: Storage gateway for IDE file operations
    const gatewayRef = useRef<import('@/domain/interfaces/storage-gateway.interface').StorageGateway | null>(null);

    // CC-IDE-05b: FSA adapter reference for WebContainer integration
    const fsaAdapterRef = useRef<WebContainerFSAAdapterType | null>(null);
    const isWebContainerBootedRef = useRef(false);

    const { handleFileSelect, handleContentChange, handleTabClose } = useIDEFileHandlers({
        openFiles: openFilesDerived,
        openFilePaths,
        activeFilePath: activeFilePath ?? null,
        setActiveFilePath: (path) => { if (path) setActiveFilePath(path); },
        addOpenFile,
        removeOpenFile,
        setSelectedFilePath: (path) => { if (typeof path === 'string') setSelectedFilePath(path); },
        setFileTreeRefreshKey,
        setFileContentCache,
        gatewayRef,
        eventBus,
        toast,
    });

    // Story 28-24: Subscribe FileTree to agent file events via EventBus
    useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey(k => k + 1));

    // MVP-3: Subscribe MonacoEditor to agent file:modified events
    useMonacoEditorEventSubscriptions({
        eventBus,
        openFiles: openFilesDerived,
        activeFilePath: activeFilePath ?? null,
        setOpenFiles,
        fsaAdapterRef,
    });

    // PS-02-B: Start VFS auto-watch for hot reload
    useVFSAutoWatch(projectId ?? null);

    // WB-8.3: Subscribe to all cross-workspace events for state synchronization
    // TEMPORARILY DISABLED - 2026-01-08 - Causing infinite loop via useAgentsStore.getState()
    // Ensures IDE workspace reacts to changes from Notes, Knowledge, Study workspaces
    // useAllCrossWorkspaceEvents();

    // State restoration hook
    useIDEStateRestoration({
        restoredIdeState,
        isChatVisible: chatVisible,
        openFilesCount: openFilesDerived.length,
        permissionState,
        syncStatus,
        localAdapterRef,
        appliedPanelGroupsRef,
        didRestoreOpenFilesRef,
        activeFileScrollTopRef,
        mainPanelGroupRef,
        centerPanelGroupRef,
        editorPanelGroupRef,
        setChatVisible,
        setTerminalTab,
        setActiveFilePath: (path) => { if (path) setActiveFilePath(path); },
        setSelectedFilePath,
        setOpenFiles: (files) => {
            setFileContentCache(new Map(files.map((f) => [f.path, f.content] as [string, string])));
        },
    });

     // FIX: Single useEffect for all ref syncs - eliminates cascading triggers
     // Refs are stable references, so we only depend on the actual state values
     // scheduleIdeStatePersistence is a no-op (Zustand persist middleware auto-saves)
     useEffect(() => {
         openFilePathsRef.current = openFilePaths;
         activeFilePathRef.current = activeFilePath ?? null;
         terminalTabRef.current = terminalTab;
         chatVisibleRef.current = chatVisible;
         // No scheduleIdeStatePersistence call - Zustand persist middleware auto-saves
     }, [openFilePaths, activeFilePath, terminalTab, chatVisible]);

    // CC-IDE-05b: Initialize StorageGateway when project is loaded
    useEffect(() => {
        if (!projectId || !layoutState.projectMetadata?.fsaHandle) {
            return;
        }

        // Create gateway for IDE file operations
        const gateway = createIdeFileGateway({
            projectId,
            fsaHandle: layoutState.projectMetadata.fsaHandle,
        });
        gatewayRef.current = gateway;
        console.log('[IDELayout] Storage gateway created for project:', projectId);

        return () => {
            gatewayRef.current = null;
            console.log('[IDELayout] Storage gateway cleaned up');
        };
    }, [projectId, layoutState.projectMetadata?.fsaHandle]);

    // CC-IDE-05b: Initialize FSA adapter when WebContainer boots
    useEffect(() => {
        // Only initialize if we have gateway, project, and WebContainer is booted
        if (!gatewayRef.current || !projectId || !isWebContainerBootedRef.current) {
            return;
        }

        // Prevent re-initialization
        if (fsaAdapterRef.current) {
            return;
        }

        const initializeAdapter = async () => {
            try {
                const gateway = gatewayRef.current;
                const container = getInstance();
                const eventBusRef = eventBus;

                if (!gateway || !container || !eventBusRef) {
                    console.warn('[IDELayout] Missing required resources for FSA adapter');
                    return;
                }

                console.log('[IDELayout] Initializing FSA adapter...');

                // Create FSA adapter
                const adapter = createWebContainerFSAAdapter({
                    fsaGateway: gateway,
                    container,
                    eventBus: eventBusRef,
                    mountPoint: '/project',
                    conflictResolution: 'fsa-wins',
                });

                fsaAdapterRef.current = adapter;

                // Mount FSA files to WebContainer
                await adapter.mountToContainer();

                // Start bidirectional sync
                await adapter.startBidirectionalSync();

                console.log('[IDELayout] FSA adapter initialized and synced');
            } catch (error) {
                console.error('[IDELayout] Failed to initialize FSA adapter:', error);
            }
        };

        initializeAdapter();

        // Cleanup on unmount
        return () => {
            if (fsaAdapterRef.current) {
                fsaAdapterRef.current.stopSync();
                fsaAdapterRef.current.dispose();
                fsaAdapterRef.current = null;
                console.log('[IDELayout] FSA adapter cleaned up');
            }
        };
    }, [projectId, eventBus, gatewayRef, isWebContainerBootedRef.current]);

    return (
        <StatusAnnouncerProvider>
            <SidebarProvider defaultPanel="explorer" defaultCollapsed={isTablet}>
                <div className="h-dvh w-dvw bg-background text-foreground overflow-hidden flex flex-col">
                    <SkipLinks />
                    <MobileCapabilityBanner />
                    {permissionState === 'prompt' && <PermissionOverlay projectMetadata={layoutState.projectMetadata} onRestoreAccess={restoreAccess} />}
                    <IDEHeaderBar projectId={projectId} isChatVisible={chatVisible} onToggleChat={() => setChatVisible(!chatVisible)} />

                    {/* Discovery mechanisms */}
                    <IDEDiscoveryMechanisms
                        isCommandPaletteOpen={isCommandPaletteOpen}
                        isFeatureSearchOpen={isFeatureSearchOpen}
                        onCommandPaletteClose={() => layoutState.setIsCommandPaletteOpen(false)}
                        onFeatureSearchClose={() => layoutState.setIsFeatureSearchOpen(false)}
                    />

                    {/* Main content area with sidebar and panels */}
                    <div id="main-content" className="flex-1 flex flex-col md:flex-row overflow-hidden" tabIndex={-1}>
                        {/* VS Code-style Activity Bar + Collapsible Sidebar */}
                        <ActivityBar />
                        <SidebarContent className="hidden md:flex">
                            <IDESidebarPanels
                                selectedFilePath={selectedFilePath}
                                onFileSelect={handleFileSelect}
                                fileTreeRefreshKey={fileTreeRefreshKey}
                            />
                        </SidebarContent>

                        {/* Main Resizable Panel Group */}
                        <IDEResizableLayout
                            projectId={projectId}
                            projectName={layoutState.projectMetadata?.name ?? projectId ?? 'Project'}
                            chatVisible={chatVisible}
                            setChatVisible={setChatVisible}
                            terminalTab={terminalTab}
                            setTerminalTab={setTerminalTab}
                            initialSyncCompleted={layoutState.initialSyncCompleted}
                            permissionState={permissionState}
                            openFiles={openFilesDerived}
                            activeFilePath={activeFilePath}
                            onSave={() => { }}
                            onActiveFileChange={setActiveFilePath}
                            onTabClose={handleTabClose}
                            onContentChange={handleContentChange}
                            restoredIdeState={restoredIdeState}
                            activeFileScrollTopRef={activeFileScrollTopRef}
                            scheduleIdeStatePersistence={scheduleIdeStatePersistence}
                            handlePanelLayoutChange={handlePanelLayoutChange}
                            previewUrl={previewUrl ?? undefined}
                            previewPort={previewPort ?? undefined}
                            fileTools={fileTools}
                            terminalTools={terminalTools}
                            eventBus={eventBus}
                            mainPanelGroupRef={mainPanelGroupRef}
                            centerPanelGroupRef={centerPanelGroupRef}
                            editorPanelGroupRef={editorPanelGroupRef}
                        />
                    </div>

                    {/* VS Code-style footer StatusBar */}
                    <StatusBar />

                </div>
            </SidebarProvider>
        </StatusAnnouncerProvider>
    );
}
