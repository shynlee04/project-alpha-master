/**
 * @fileoverview IDE Layout Component
 * @module components/layout/IDELayout
 *
 * Main IDE layout component that orchestrates all IDE panels.
 * Uses react-resizable-panels for a VS Code-like layout.
 * 
 * @epic Epic-28 Story 28-14
 * @integration Wires IconSidebar (Story 28-5) into actual layout
 */

import { useState, useEffect, useRef } from 'react';
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

// IDE components
import { FileTree } from '../ide/FileTree';
import { useFileTreeEventSubscriptions } from '../ide/FileTree/hooks/useFileTreeEventSubscriptions';
import { MonacoEditor, type OpenFile } from '../ide/MonacoEditor';
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

// Hooks
import { useIdeStatePersistence } from '../../hooks/useIdeStatePersistence';
import { useWorkspace, type TerminalTab } from '../../lib/workspace';
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

  // UI state
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
  const [terminalTab, setTerminalTab] = useState<TerminalTab>('terminal');
  const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);

  // Editor state
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);

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
  useIDEKeyboardShortcuts({ onChatToggle: () => setIsChatVisible(true) });
  const { previewUrl, previewPort } = useWebContainerBoot({ onBooted: () => setIsWebContainerBooted(true) });
  const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
    openFiles, setOpenFiles, activeFilePath, setActiveFilePath,
    setSelectedFilePath, setFileTreeRefreshKey, syncManagerRef, eventBus, toast,
  });

  // Story 28-24: Subscribe FileTree to agent file events via EventBus
  useFileTreeEventSubscriptions(eventBus, () => setFileTreeRefreshKey(k => k + 1));

  // State restoration hook
  useIDEStateRestoration({
    restoredIdeState, isChatVisible, openFilesCount: openFiles.length, permissionState, syncStatus, localAdapterRef,
    appliedPanelGroupsRef, didRestoreOpenFilesRef, activeFileScrollTopRef,
    mainPanelGroupRef, centerPanelGroupRef, editorPanelGroupRef,
    setIsChatVisible, setTerminalTab, setActiveFilePath, setSelectedFilePath, setOpenFiles,
  });

  // State sync with refs
  const openFilePathsKey = openFiles.map((f) => f.path).join('\0');
  useEffect(() => { openFilePathsRef.current = openFiles.map((f) => f.path); }, [openFilePathsKey, openFilePathsRef]);
  useEffect(() => { activeFilePathRef.current = activeFilePath; }, [activeFilePath, activeFilePathRef]);
  useEffect(() => { terminalTabRef.current = terminalTab; }, [terminalTab, terminalTabRef]);
  useEffect(() => { chatVisibleRef.current = isChatVisible; }, [isChatVisible, chatVisibleRef]);
  useEffect(() => { scheduleIdeStatePersistence(250); }, [scheduleIdeStatePersistence, openFilePathsKey, activeFilePath, terminalTab, isChatVisible]);

  return (
    <SidebarProvider defaultPanel="explorer">
      <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
        {permissionState === 'prompt' && <PermissionOverlay projectMetadata={projectMetadata} onRestoreAccess={restoreAccess} />}
        <IDEHeaderBar projectId={projectId} isChatVisible={isChatVisible} onToggleChat={() => setIsChatVisible(!isChatVisible)} />

        <div className="flex-1 flex overflow-hidden">
          {/* VS Code-style Activity Bar + Collapsible Sidebar (Story 28-14) */}
          <ActivityBar />
          <SidebarContent>
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
                        <CardHeader className="h-10 px-4 py-2 border-b flex items-center bg-card">
                          <CardTitle className="text-sm font-semibold text-foreground">Editor</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0">
                          <MonacoEditor
                            openFiles={openFiles} activeFilePath={activeFilePath} onSave={handleSave}
                            onActiveFileChange={setActiveFilePath} onTabClose={handleTabClose} onContentChange={handleContentChange}
                            initialScrollTop={activeFilePath && activeFilePath === restoredIdeState?.activeFile ? restoredIdeState.activeFileScrollTop : undefined}
                            onScrollTopChange={(_path, scrollTop) => { activeFileScrollTopRef.current = scrollTop; scheduleIdeStatePersistence(400); }}
                          />
                        </CardContent>
                      </Card>
                    </ResizablePanel>
                    <ResizableHandle withHandle orientation="vertical" className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize" />
                    <ResizablePanel defaultSize={40} minSize={15} className="bg-background">
                      <Card className="h-full rounded-none border-0 bg-background">
                        <CardHeader className="h-10 px-4 py-2 border-b flex items-center bg-card">
                          <CardTitle className="text-sm font-semibold text-foreground">Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0">
                          <PreviewPanel previewUrl={previewUrl} port={previewPort} />
                        </CardContent>
                      </Card>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle withHandle orientation="horizontal" className="h-2 bg-border hover:bg-accent transition-colors cursor-row-resize" />
                {/* Terminal Panel */}
                <ResizablePanel defaultSize={30} minSize={10} maxSize={50} className="bg-background">
                  <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-10 px-4 py-2 border-b flex items-center bg-card">
                      <CardTitle className="text-sm font-semibold text-foreground">Terminal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <TerminalPanel activeTab={terminalTab} onTabChange={setTerminalTab} initialSyncCompleted={initialSyncCompleted} permissionState={permissionState} className="border-0" />
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* Chat Panel */}
            {isChatVisible && (
              <>
                <ResizableHandle withHandle className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize" />
                <ResizablePanel order={3} defaultSize={25} minSize={15} maxSize={40} className="bg-background">
                  <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-10 px-4 py-2 border-b flex items-center bg-card">
                      <CardTitle className="text-sm font-semibold text-foreground">Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <ChatPanelWrapper projectId={projectId} projectName={projectMetadata?.name ?? projectId ?? 'Project'} onClose={() => setIsChatVisible(false)} />
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
        <ExplorerPanel>
          <FileTree
            selectedPath={selectedFilePath}
            onFileSelect={onFileSelect}
            refreshKey={fileTreeRefreshKey}
          />
        </ExplorerPanel>
      );
    case 'agents':
      return <AgentsPanel />;
    case 'search':
      return <SearchPanel />;
    case 'settings':
      return <SettingsPanel />;
    default:
      return (
        <ExplorerPanel>
          <FileTree
            selectedPath={selectedFilePath}
            onFileSelect={onFileSelect}
            refreshKey={fileTreeRefreshKey}
          />
        </ExplorerPanel>
      );
  }
}

