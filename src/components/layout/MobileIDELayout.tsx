/**
 * @fileoverview Mobile IDE Layout Component
 * @module components/layout/MobileIDELayout
 *
 * Mobile-first layout for the IDE.
 * Uses tab-based panel switching with single-panel focus mode.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-3 Implement Mobile IDE Layout
 *
 * Design:
 * - Single visible panel at a time (phone-optimized)
 * - Bottom tab bar for navigation
 * - Full-screen panel content
 * - Optimized for phone portrait (375px-414px)
 */

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useIDEStore } from '@/lib/state';
import { useWorkspace } from '@/lib/workspace';
import { useToast } from '@/components/ui/Toast';

// Layout components
import { IDEHeaderBar } from './IDEHeaderBar';
import { MobileTabBar, useMobilePanel } from './MobileTabBar';
import { PermissionOverlay } from './PermissionOverlay';

// Agent tool facades
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

// Error boundary
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

// IDE components (lazy loaded for performance)
const FileTree = lazy(() =>
    import('../ide/FileTree').then((m) => ({ default: m.FileTree }))
);
const MonacoEditor = lazy(() =>
    import('../ide/MonacoEditor').then((m) => ({ default: m.MonacoEditor }))
);
const PreviewPanel = lazy(() =>
    import('../ide/PreviewPanel').then((m) => ({ default: m.PreviewPanel }))
);
const TerminalPanel = lazy(() =>
    import('./TerminalPanel').then((m) => ({ default: m.TerminalPanel }))
);
const ChatPanelWrapper = lazy(() =>
    import('./ChatPanelWrapper').then((m) => ({ default: m.ChatPanelWrapper }))
);

// Hooks
import { useIdeStatePersistence } from '@/hooks/useIdeStatePersistence';
import { useFileTreeEventSubscriptions } from '../ide/FileTree/hooks/useFileTreeEventSubscriptions';
import { useMonacoEditorEventSubscriptions } from '../ide/MonacoEditor/hooks';
import {
    useIDEKeyboardShortcuts,
    useWebContainerBoot,
    useIDEFileHandlers,
} from './hooks';

import type { OpenFile } from '../ide/MonacoEditor';

/**
 * Loading skeleton for lazy-loaded panels
 */
function PanelLoadingSkeleton({ label }: { label: string }) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm font-mono">Loading {label}...</span>
            </div>
        </div>
    );
}

/**
 * Error fallback for panels
 */
function PanelErrorFallback({ label }: { label: string }) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center px-4">
                <p className="text-sm font-medium text-destructive">{label} Error</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Please refresh the page to try again.
                </p>
            </div>
        </div>
    );
}

/**
 * MobileIDELayout - Main mobile IDE layout orchestrator
 *
 * Features:
 * - Tab-based panel switching (Files, Editor, Preview, Terminal, Chat)
 * - Single-panel focus mode for phone optimization
 * - Bottom tab bar navigation
 * - State persistence across panel switches
 * - Touch-optimized interactions
 */
export function MobileIDELayout(): React.JSX.Element {
    const { toast } = useToast();
    const {
        projectId,
        projectMetadata,
        permissionState,
        // syncStatus - unused for now, but will be needed for status indicators
        initialSyncCompleted,
        localAdapterRef,
        syncManagerRef,
        eventBus,
        setIsWebContainerBooted,
        restoreAccess,
    } = useWorkspace();

    // Mobile panel state
    const [activePanel, setActivePanel] = useMobilePanel('files');

    // Zustand state
    const openFilePaths = useIDEStore((s) => s.openFiles);
    const activeFilePath = useIDEStore((s) => s.activeFile);
    const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
    const addOpenFile = useIDEStore((s) => s.addOpenFile);
    const removeOpenFile = useIDEStore((s) => s.removeOpenFile);
    const terminalTab = useIDEStore((s) => s.terminalTab);
    const setTerminalTab = useIDEStore((s) => s.setTerminalTab);

    // Local state
    const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
    const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);
    const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

    // Derive OpenFile[] from Zustand state + local cache
    const openFiles = useMemo<OpenFile[]>(() => {
        return openFilePaths.map((path) => ({
            path,
            content: fileContentCache.get(path) || '',
            isDirty: false,
        }));
    }, [openFilePaths, fileContentCache]);

    // State persistence
    const {
        restoredIdeState,
        scheduleIdeStatePersistence,
    } = useIdeStatePersistence({ projectId });

    // Keyboard shortcuts
    useIDEKeyboardShortcuts({
        onChatToggle: () => setActivePanel('chat'),
        onCommandPaletteOpen: () => {
            // Command palette on mobile - show simplified message
            toast('Use tab bar for navigation', 'info');
        },
    });

    // WebContainer boot
    const { previewUrl, previewPort } = useWebContainerBoot({
        onBooted: () => setIsWebContainerBooted(true),
    });

    // File handlers
    const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
        const newFiles = typeof filesOrUpdater === 'function' ? filesOrUpdater(openFiles) : filesOrUpdater;
        setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

        const newPaths = newFiles.map((f) => f.path);
        newPaths.forEach((path) => {
            if (!openFilePaths.includes(path)) addOpenFile(path);
        });
        openFilePaths.forEach((path) => {
            if (!newPaths.includes(path)) removeOpenFile(path);
        });
    };

    const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
        openFiles,
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

    // Handle file selection - switch to editor panel after selecting
    const handleMobileFileSelect = (path: string, handle: FileSystemFileHandle) => {
        handleFileSelect(path, handle);
        // Auto-switch to editor after file selection for better mobile UX
        setActivePanel('editor');
    };

    // Tool facades for agent
    const fileTools = useMemo(() => {
        if (!localAdapterRef.current || !syncManagerRef.current) return null;
        return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
    }, [localAdapterRef.current, syncManagerRef.current, eventBus]);

    const terminalTools = useMemo(() => {
        // createTerminalToolsFacade expects WorkspaceEventEmitter
        return createTerminalToolsFacade(eventBus);
    }, [eventBus]);

    // Event subscriptions
    useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey((k) => k + 1));
    useMonacoEditorEventSubscriptions({
        eventBus,
        openFiles,
        activeFilePath,
        setOpenFiles,
    });

    return (
        <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
            {/* Permission overlay */}
            {permissionState === 'prompt' && (
                <PermissionOverlay projectMetadata={projectMetadata} onRestoreAccess={restoreAccess} />
            )}

            {/* Compact header for mobile */}
            <IDEHeaderBar
                projectId={projectId}
                isChatVisible={activePanel === 'chat'}
                onToggleChat={() => setActivePanel(activePanel === 'chat' ? 'files' : 'chat')}
            // compact prop can be added later for mobile-specific header
            />

            {/* Main content area - single panel at a time */}
            <main className="flex-1 overflow-hidden pb-14">
                <Suspense fallback={<PanelLoadingSkeleton label={activePanel} />}>
                    {/* Files Panel */}
                    {activePanel === 'files' && (
                        <WithErrorBoundary fallback={<PanelErrorFallback label="File Explorer" />}>
                            <div className="h-full overflow-auto bg-sidebar">
                                <div className="p-2">
                                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                                        Explorer
                                    </h2>
                                    <FileTree
                                        selectedPath={selectedFilePath}
                                        onFileSelect={handleMobileFileSelect}
                                        refreshKey={fileTreeRefreshKey}
                                    />
                                </div>
                            </div>
                        </WithErrorBoundary>
                    )}

                    {/* Editor Panel */}
                    {activePanel === 'editor' && (
                        <WithErrorBoundary fallback={<PanelErrorFallback label="Editor" />}>
                            <div className="h-full">
                                <MonacoEditor
                                    openFiles={openFiles}
                                    activeFilePath={activeFilePath}
                                    onSave={handleSave}
                                    onActiveFileChange={setActiveFilePath}
                                    onTabClose={handleTabClose}
                                    onContentChange={handleContentChange}
                                    initialScrollTop={
                                        activeFilePath && activeFilePath === restoredIdeState?.activeFile
                                            ? restoredIdeState.activeFileScrollTop
                                            : undefined
                                    }
                                    onScrollTopChange={(_path, _scrollTop) => {
                                        scheduleIdeStatePersistence(400);
                                    }}
                                />
                            </div>
                        </WithErrorBoundary>
                    )}

                    {/* Preview Panel */}
                    {activePanel === 'preview' && (
                        <WithErrorBoundary fallback={<PanelErrorFallback label="Preview" />}>
                            <div className="h-full">
                                <PreviewPanel previewUrl={previewUrl} port={previewPort} />
                            </div>
                        </WithErrorBoundary>
                    )}

                    {/* Terminal Panel */}
                    {activePanel === 'terminal' && (
                        <WithErrorBoundary fallback={<PanelErrorFallback label="Terminal" />}>
                            <div className="h-full">
                                <TerminalPanel
                                    activeTab={terminalTab}
                                    onTabChange={setTerminalTab}
                                    initialSyncCompleted={initialSyncCompleted}
                                    permissionState={permissionState}
                                    className="border-0"
                                />
                            </div>
                        </WithErrorBoundary>
                    )}

                    {/* Chat Panel */}
                    {activePanel === 'chat' && (
                        <WithErrorBoundary fallback={<PanelErrorFallback label="Chat" />}>
                            <div className="h-full">
                                <ChatPanelWrapper
                                    projectId={projectId}
                                    projectName={projectMetadata?.name ?? projectId ?? 'Project'}
                                    onClose={() => setActivePanel('files')}
                                    fileTools={fileTools}
                                    terminalTools={terminalTools}
                                    eventBus={eventBus}
                                />
                            </div>
                        </WithErrorBoundary>
                    )}
                </Suspense>
            </main>

            {/* Mobile Tab Bar */}
            <MobileTabBar activePanel={activePanel} onPanelChange={setActivePanel} />
        </div>
    );
}

export default MobileIDELayout;
