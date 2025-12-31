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
import { StatusAnnouncerProvider } from '@/components/ui/StatusAnnouncer';
import { SkipLinks } from '@/components/ui/SkipLinks';
import { MobileCapabilityBanner } from '@/components/ui/MobileCapabilityBanner';
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
        openFiles,
        openFilePaths,
        activeFilePath,
        selectedFilePath,
        fileTreeRefreshKey,
        chatVisible,
        terminalTab,
        fileContentCache,
        isCommandPaletteOpen,
        isFeatureSearchOpen,
        eventBus,
        permissionState,
        syncStatus,
        restoredIdeState,
        localAdapterRef,
        syncManagerRef,
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
        openFiles: openFilesDerived,
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
        handlePanelLayoutChange
    } = useIdeStatePersistence({ projectId });

    // Extracted hooks
    useIDEKeyboardShortcuts({
        onChatToggle: () => setChatVisible(true),
        onCommandPaletteOpen: () => layoutState.setIsCommandPaletteOpen(true),
    });

    const { previewUrl, previewPort } = useWebContainerBoot({ onBooted: () => setIsWebContainerBooted(true) });

    const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
        openFiles: openFilesDerived,
        openFilePaths,
        activeFilePath,
        setActiveFilePath,
        addOpenFile,
        removeOpenFile,
        setSelectedFilePath,
        setFileTreeRefreshKey,
        setFileContentCache,
        syncManagerRef,
        eventBus,
        toast,
    });

    // Story 28-24: Subscribe FileTree to agent file events via EventBus
    useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey(k => k + 1));

    // MVP-3: Subscribe MonacoEditor to agent file:modified events
    useMonacoEditorEventSubscriptions({
        eventBus,
        openFiles: openFilesDerived,
        activeFilePath,
        setOpenFiles,
    });

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
        setActiveFilePath,
        setSelectedFilePath,
        setOpenFiles: (files) => {
            setFileContentCache(new Map(files.map((f) => [f.path, f.content] as [string, string])));
        },
    });

    // State sync with refs
    const openFilePathsKey = openFilePaths.join('\0');
    useEffect(() => { openFilePathsRef.current = openFilePaths; }, [openFilePathsKey, openFilePathsRef]);
    useEffect(() => { activeFilePathRef.current = activeFilePath; }, [activeFilePath, activeFilePathRef]);
    useEffect(() => { terminalTabRef.current = terminalTab; }, [terminalTab, terminalTabRef]);
    useEffect(() => { chatVisibleRef.current = chatVisible; }, [chatVisible, chatVisibleRef]);
    useEffect(() => { scheduleIdeStatePersistence(250); }, [scheduleIdeStatePersistence, openFilePathsKey, activeFilePath, terminalTab, chatVisible]);

    return (
        <StatusAnnouncerProvider>
            <SidebarProvider defaultPanel="explorer" defaultCollapsed={isTablet}>
                <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
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
                            onSave={handleSave}
                            onActiveFileChange={setActiveFilePath}
                            onTabClose={handleTabClose}
                            onContentChange={handleContentChange}
                            restoredIdeState={restoredIdeState}
                            activeFileScrollTopRef={activeFileScrollTopRef}
                            scheduleIdeStatePersistence={scheduleIdeStatePersistence}
                            handlePanelLayoutChange={handlePanelLayoutChange}
                            previewUrl={previewUrl}
                            previewPort={previewPort}
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
