/**
 * @fileoverview IDE Layout Component
 * @module components/layout/IDELayout
 *
 * Main IDE layout component that orchestrates all IDE panels.
 * Uses react-resizable-panels for a VS Code-like layout.
 *
 * @epic Epic-23 Story P1.1
 * @integration Design tokens implementation for consistent styling
 * @epic Epic-23 Story P1.9
 * @integration Error boundaries for critical components
 *
 * @deprecated Use MainLayout instead. This component is being phased out as part of the Home Page Layout Redesign epic.
 * See: src/components/layout/MainLayout.tsx
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useIDEStore } from '@/lib/state';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import type { ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Layout sub-components
import { IDEHeaderBar } from './IDEHeaderBar';
import { TerminalPanel } from './TerminalPanel';
import { ChatPanelWrapper } from './ChatPanelWrapper';
import { PermissionOverlay } from './PermissionOverlay';
import { MinViewportWarning } from './MinViewportWarning';

// Agent tool facades (Story MVP-3: Wire tool facades to agent)
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools-impl';
import { createTerminalToolsFacade } from '@/lib/agent/facades/terminal-tools-impl';

// P1.9: Error boundary for critical components
import { WithErrorBoundary } from '@/components/common/ErrorBoundary';

// IDE components
import { FileTree } from '../ide/FileTree';
import { useFileTreeEventSubscriptions } from '../ide/FileTree/hooks/useFileTreeEventSubscriptions';
import { MonacoEditor, type OpenFile } from '../ide/MonacoEditor';
import { useMonacoEditorEventSubscriptions } from '../ide/MonacoEditor/hooks';
import { PreviewPanel } from '../ide/PreviewPanel';
import { StatusBar } from '../ide/StatusBar';

// NEW: IconSidebar integration (Story 28-5 → 28-14)
import {
  SidebarProvider,
  ActivityBar,
  SidebarContent,
  useSidebar
} from '../ide/IconSidebar';
import { ExplorerPanel } from '../ide/ExplorerPanel';
import { AgentsPanel } from '../ide/AgentsPanel';
import { SearchPanel } from '../ide/SearchPanel';
import { SettingsPanel } from '../ide/SettingsPanel';

import { CommandPalette } from '../ide/CommandPalette';
import { FeatureSearch } from '../ide/FeatureSearch';
// QuickActionsMenu available but not currently rendered

// Hooks
import { useIdeStatePersistence } from '../../hooks/useIdeStatePersistence';
import { useWorkspace } from '../../lib/workspace';
import { useToast } from '../ui/Toast';
import {
  useIDEKeyboardShortcuts,
  useWebContainerBoot,
  useIDEFileHandlers,
  useIDEStateRestoration,
} from './hooks';


/**
 * IDELayout - Main IDE layout orchestrator.
 *
 * Consumes WorkspaceContext and coordinates:
 * - Resizable panel layout
 * - File tree, editor, preview, terminal, chat panels
 * - IDE state persistence
 */
export function IDELayout(): React.JSX.Element {
  const { toast } = useToast();
  const {
    projectId, projectMetadata, permissionState, syncStatus, initialSyncCompleted,
    localAdapterRef, syncManagerRef, eventBus, setIsWebContainerBooted, restoreAccess,
  } = useWorkspace();

  // Zustand state (persisted to IndexedDB)
  const chatVisible = useIDEStore((s) => s.chatVisible);
  const setChatVisible = useIDEStore((s) => s.setChatVisible);
  const terminalTab = useIDEStore((s) => s.terminalTab);
  const setTerminalTab = useIDEStore((s) => s.setTerminalTab);
  const openFilePaths = useIDEStore((s) => s.openFiles);
  const activeFilePath = useIDEStore((s) => s.activeFile);
  const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
  const addOpenFile = useIDEStore((s) => s.addOpenFile);
  const removeOpenFile = useIDEStore((s) => s.removeOpenFile);

  // Local state (ephemeral, not persisted)
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
  const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);

  // P1.4: Discovery mechanisms state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFeatureSearchOpen, setIsFeatureSearchOpen] = useState(false);

  // Local file content cache (ephemeral, not persisted)
  // File paths are persisted in useIDEStore, but content is cached locally
  const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

  // Derive OpenFile[] from Zustand state + local cache
  const openFiles = useMemo<OpenFile[]>(() => {
    return openFilePaths.map((path) => ({
      path,
      content: fileContentCache.get(path) || '',
      isDirty: false,
    }));
  }, [openFilePaths, fileContentCache]);

  // Callback to update open files from hooks that need to modify file content
  // This updates both the local content cache and syncs with Zustand paths
  const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
    const newFiles = typeof filesOrUpdater === 'function'
      ? filesOrUpdater(openFiles)
      : filesOrUpdater;

    // Update the file content cache
    setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

    // Sync paths with Zustand if they changed
    const newPaths = newFiles.map(f => f.path);
    const currentPathsStr = openFilePaths.join('\0');
    const newPathsStr = newPaths.join('\0');
    if (currentPathsStr !== newPathsStr) {
      // Add new paths and remove old ones
      newPaths.forEach(path => {
        if (!openFilePaths.includes(path)) {
          addOpenFile(path);
        }
      });
      openFilePaths.forEach(path => {
        if (!newPaths.includes(path)) {
          removeOpenFile(path);
        }
      });
    }
  };

  // Panel refs
  const mainPanelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const centerPanelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const editorPanelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);

  // State persistence
  const {
    restoredIdeState, appliedPanelGroupsRef, didRestoreOpenFilesRef, activeFileScrollTopRef,
    openFilePathsRef, activeFilePathRef, terminalTabRef, chatVisibleRef,
    scheduleIdeStatePersistence, handlePanelLayoutChange,
  } = useIdeStatePersistence({ projectId });

  // Extracted hooks
  useIDEKeyboardShortcuts({
    onChatToggle: () => setChatVisible(true),
    onCommandPaletteOpen: () => setIsCommandPaletteOpen(true),
  });
  const { previewUrl, previewPort } = useWebContainerBoot({ onBooted: () => setIsWebContainerBooted(true) });
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

  // Story MVP-3: Create tool facades for agent
  // ADD: Create file tools facade
  const fileTools = useMemo(() => {
    if (!localAdapterRef.current || !syncManagerRef.current) return null;
    return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
  }, [localAdapterRef.current, syncManagerRef.current, eventBus]);

  // ADD: Create terminal tools facade
  const terminalTools = useMemo(() => {
    if (!syncManagerRef.current) return null;
    return createTerminalToolsFacade(syncManagerRef.current);
  }, [syncManagerRef.current]);

  // Story 28-24: Subscribe FileTree to agent file events via EventBus
  useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey(k => k + 1));

  // MVP-3: Subscribe MonacoEditor to agent file:modified events
  useMonacoEditorEventSubscriptions({
    eventBus,
    openFiles,
    activeFilePath,
    setOpenFiles,
  });

  // State restoration hook
  useIDEStateRestoration({
    restoredIdeState,
    isChatVisible: chatVisible,
    openFilesCount: openFiles.length,
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
    setOpenFiles: (files: OpenFile[]) => {
      // Update file content cache when open files are restored
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
    <SidebarProvider defaultPanel="explorer">
      <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
        {permissionState === 'prompt' && <PermissionOverlay projectMetadata={projectMetadata} onRestoreAccess={restoreAccess} />}
        <IDEHeaderBar projectId={projectId} isChatVisible={chatVisible} onToggleChat={() => setChatVisible(!chatVisible)} />

        {/* P1.4: Discovery mechanisms */}
        {isCommandPaletteOpen && (
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        )}

        {isFeatureSearchOpen && (
          <FeatureSearch
            isOpen={isFeatureSearchOpen}
            onClose={() => setIsFeatureSearchOpen(false)}
          />
        )}

        {/* P1.7: Responsive main content area with mobile-first layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* VS Code-style Activity Bar + Collapsible Sidebar (Story 28-14) */}
          {/* P1.7: Hide sidebar on mobile, show on tablet+ */}
          <ActivityBar />
          <SidebarContent className="hidden md:flex">
            <SidebarPanelRenderer
              selectedFilePath={selectedFilePath}
              onFileSelect={handleFileSelect}
              fileTreeRefreshKey={fileTreeRefreshKey}
            />
          </SidebarContent>

          {/* Main Resizable Panel Group */}
          <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>


            {/* Center Panel (Editor + Preview + Terminal) */}
            <ResizablePanel order={2} minSize={30}>
              <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
                {/* Editor + Preview */}
                <ResizablePanel defaultSize={70} minSize={30}>
                  <ResizablePanelGroup ref={editorPanelGroupRef} direction="horizontal" onLayout={(layout) => handlePanelLayoutChange('editor', layout)}>
                    <ResizablePanel defaultSize={60} minSize={30} className="bg-background">
                      <Card className="h-full rounded-none border-0 bg-background">
                        {/* P1.7: Responsive header height */}
                        <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                          <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Editor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0">
                          <WithErrorBoundary
                            fallback={
                              <div className="h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <p className="text-sm font-medium">Editor Error</p>
                                  <p className="text-xs text-muted-foreground/70 mt-1">
                                    The code editor encountered an error. Please refresh the page.
                                  </p>
                                </div>
                              </div>
                            }
                          >
                            <MonacoEditor
                              openFiles={openFiles} activeFilePath={activeFilePath} onSave={handleSave}
                              onActiveFileChange={setActiveFilePath} onTabClose={handleTabClose} onContentChange={handleContentChange}
                              initialScrollTop={activeFilePath && activeFilePath === restoredIdeState?.activeFile ? restoredIdeState.activeFileScrollTop : undefined}
                              onScrollTopChange={(_path, scrollTop) => { activeFileScrollTopRef.current = scrollTop; scheduleIdeStatePersistence(400); }}
                            />
                          </WithErrorBoundary>
                        </CardContent>
                      </Card>
                    </ResizablePanel>
                    <ResizableHandle
                      withHandle
                      orientation="vertical"
                      className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                      aria-label="Resize editor and preview panels"
                      aria-orientation="vertical"
                    />
                    {/* P1.7: Responsive header height and panel sizing */}
                    <ResizablePanel defaultSize={40} minSize={15} className="bg-background">
                      <Card className="h-full rounded-none border-0 bg-background">
                        <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                          <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0">
                          <WithErrorBoundary
                            fallback={
                              <div className="h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <p className="text-sm font-medium">Preview Error</p>
                                  <p className="text-xs text-muted-foreground/70 mt-1">
                                    The preview panel encountered an error.
                                  </p>
                                </div>
                              </div>
                            }
                          >
                            <PreviewPanel previewUrl={previewUrl} port={previewPort} />
                          </WithErrorBoundary>
                        </CardContent>
                      </Card>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  orientation="horizontal"
                  className="h-2 bg-border hover:bg-accent transition-colors cursor-row-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                  aria-label="Resize editor and terminal panels"
                  aria-orientation="horizontal"
                />
                {/* Terminal Panel */}
                {/* P1.7: Responsive header height and panel sizing */}
                <ResizablePanel defaultSize={30} minSize={10} maxSize={50} className="bg-background">
                  <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                      <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Terminal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <WithErrorBoundary
                        fallback={
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <p className="text-sm font-medium">Terminal Error</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                The terminal encountered an error. Please refresh the page.
                              </p>
                            </div>
                          </div>
                        }
                      >
                        <TerminalPanel activeTab={terminalTab} onTabChange={setTerminalTab} initialSyncCompleted={initialSyncCompleted} permissionState={permissionState} className="border-0" />
                      </WithErrorBoundary>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* Chat Panel */}
            {chatVisible && (
              <>
                <ResizableHandle
                  withHandle
                  className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                  aria-label="Resize chat panel"
                  aria-orientation="vertical"
                />
                {/* P1.7: Responsive header height and chat panel sizing */}
                <ResizablePanel order={3} defaultSize={25} minSize={15} maxSize={40} className="bg-background">
                  <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 border-b flex items-center bg-card">
                      <CardTitle className="text-xs md:text-sm font-semibold text-foreground">Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <WithErrorBoundary
                        fallback={
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <p className="text-sm font-medium">Chat Error</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                The chat panel encountered an error. Please refresh the page.
                              </p>
                            </div>
                          </div>
                        }
                      >
                        <ChatPanelWrapper
                            projectId={projectId}
                            projectName={projectMetadata?.name ?? projectId ?? 'Project'}
                            onClose={() => setChatVisible(false)}
                            // ADD: Pass tool facades to chat panel (Story MVP-3)
                            fileTools={fileTools}
                            terminalTools={terminalTools}
                            eventBus={eventBus}
                        />
                      </WithErrorBoundary>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        {/* VS Code-style footer StatusBar (Story 28-18) */}
        <StatusBar />

        <MinViewportWarning />
      </div>
    </SidebarProvider>
  );
}

/**
 * SidebarPanelRenderer - Renders the active sidebar panel content
 * 
 * @epic Epic-28 Story 28-14
 * Uses useSidebar hook to determine which panel to show
 */
function SidebarPanelRenderer({
  selectedFilePath,
  onFileSelect,
  fileTreeRefreshKey,
}: {
  selectedFilePath?: string;
  onFileSelect: (path: string, handle: FileSystemFileHandle) => void;
  fileTreeRefreshKey: number;
}) {
  const { activePanel } = useSidebar();

  switch (activePanel) {
    case 'explorer':
      return (
        <WithErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Explorer Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The file explorer encountered an error. Please refresh the page.
                </p>
              </div>
            </div>
          }
        >
          <ExplorerPanel>
            <FileTree
              selectedPath={selectedFilePath}
              onFileSelect={onFileSelect}
              refreshKey={fileTreeRefreshKey}
            />
          </ExplorerPanel>
        </WithErrorBoundary>
      );
    case 'agents':
      return (
        <WithErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Agents Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The agents panel encountered an error. Please refresh the page.
                </p>
              </div>
            </div>
          }
        >
          <AgentsPanel />
        </WithErrorBoundary>
      );
    case 'search':
      return (
        <WithErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Search Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The search panel encountered an error. Please refresh the page.
                </p>
              </div>
            </div>
          }
        >
          <SearchPanel />
        </WithErrorBoundary>
      );
    case 'settings':
      return (
        <WithErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Settings Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The settings panel encountered an error. Please refresh the page.
                </p>
              </div>
            </div>
          }
        >
          <SettingsPanel />
        </WithErrorBoundary>
      );
    default:
      return (
        <WithErrorBoundary
          fallback={
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Explorer Error</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  The file explorer encountered an error. Please refresh the page.
                </p>
              </div>
            </div>
          }
        >
          <ExplorerPanel>
            <FileTree
              selectedPath={selectedFilePath}
              onFileSelect={onFileSelect}
              refreshKey={fileTreeRefreshKey}
            />
          </ExplorerPanel>
        </WithErrorBoundary>
      );
  }
}

