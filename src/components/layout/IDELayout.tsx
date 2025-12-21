/**
 * @fileoverview IDE Layout Component
 * @module components/layout/IDELayout
 *
 * Main IDE layout component that orchestrates all IDE panels.
 * Uses react-resizable-panels for a VS Code-like layout.
 *
 * @example
 * ```tsx
 * <WorkspaceProvider projectId="my-project">
 *   <IDELayout />
 * </WorkspaceProvider>
 * ```
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
import { MonacoEditor, type OpenFile } from '../ide/MonacoEditor';
import { PreviewPanel } from '../ide/PreviewPanel';

// Hooks
import { useIdeStatePersistence } from '../../hooks/useIdeStatePersistence';
import { useWorkspace, type TerminalTab } from '../../lib/workspace';
import { useToast } from '../ui/Toast';
import {
  useIDEKeyboardShortcuts,
  useWebContainerBoot,
  useIDEFileHandlers,
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

  // Workspace context
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
    restoreAccess,
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
    restoredIdeState,
    appliedPanelGroupsRef,
    didRestoreOpenFilesRef,
    activeFileScrollTopRef,
    openFilePathsRef,
    activeFilePathRef,
    terminalTabRef,
    chatVisibleRef,
    scheduleIdeStatePersistence,
    handlePanelLayoutChange,
  } = useIdeStatePersistence({ projectId });

  // Extracted hooks
  useIDEKeyboardShortcuts({
    onChatToggle: () => setIsChatVisible(true),
  });

  const { previewUrl, previewPort } = useWebContainerBoot({
    onBooted: () => setIsWebContainerBooted(true),
  });

  const { handleFileSelect, handleSave, handleContentChange, handleTabClose } =
    useIDEFileHandlers({
      openFiles,
      setOpenFiles,
      activeFilePath,
      setActiveFilePath,
      setSelectedFilePath,
      setFileTreeRefreshKey,
      syncManagerRef,
      eventBus,
      toast,
    });

  // State sync with refs
  const openFilePathsKey = openFiles.map((f) => f.path).join('\0');

  useEffect(() => {
    openFilePathsRef.current = openFiles.map((f) => f.path);
  }, [openFilePathsKey, openFilePathsRef]);

  useEffect(() => {
    activeFilePathRef.current = activeFilePath;
  }, [activeFilePath, activeFilePathRef]);

  useEffect(() => {
    terminalTabRef.current = terminalTab;
  }, [terminalTab, terminalTabRef]);

  useEffect(() => {
    chatVisibleRef.current = isChatVisible;
  }, [isChatVisible, chatVisibleRef]);

  useEffect(() => {
    scheduleIdeStatePersistence(250);
  }, [scheduleIdeStatePersistence, openFilePathsKey, activeFilePath, terminalTab, isChatVisible]);

  // State restoration
  useEffect(() => {
    if (!restoredIdeState) return;
    setIsChatVisible(restoredIdeState.chatVisible);
    setTerminalTab(restoredIdeState.terminalTab);
    setActiveFilePath(restoredIdeState.activeFile);
    activeFileScrollTopRef.current = restoredIdeState.activeFileScrollTop;
  }, [restoredIdeState, activeFileScrollTopRef]);

  // Apply panel layouts
  useEffect(() => {
    const layouts = restoredIdeState?.panelLayouts;
    if (!layouts) return;

    const applyLayout = (
      groupKey: string,
      ref: ImperativePanelGroupHandle | null,
      expectedLength?: number,
    ) => {
      if (appliedPanelGroupsRef.current.has(groupKey)) return;
      const layout = layouts[groupKey];
      if (!ref || !layout) return;
      if (expectedLength !== undefined && layout.length !== expectedLength) return;
      ref.setLayout(layout);
      appliedPanelGroupsRef.current.add(groupKey);
    };

    applyLayout('center', centerPanelGroupRef.current);
    applyLayout('editor', editorPanelGroupRef.current);
    applyLayout('main', mainPanelGroupRef.current, isChatVisible ? 3 : 2);
  }, [restoredIdeState, isChatVisible, appliedPanelGroupsRef]);

  // Restore open files
  useEffect(() => {
    if (didRestoreOpenFilesRef.current || !restoredIdeState) return;
    if (openFiles.length > 0) {
      didRestoreOpenFilesRef.current = true;
      return;
    }
    if (restoredIdeState.openFiles.length === 0) {
      didRestoreOpenFilesRef.current = true;
      return;
    }
    if (permissionState !== 'granted' || syncStatus === 'syncing') return;

    const adapter = localAdapterRef.current;
    if (!adapter) return;

    didRestoreOpenFilesRef.current = true;

    void (async () => {
      const restoredFiles: OpenFile[] = [];
      for (const path of restoredIdeState.openFiles) {
        try {
          const result = await adapter.readFile(path);
          if ('content' in result) {
            restoredFiles.push({ path, content: result.content, isDirty: false });
          }
        } catch (error) {
          console.warn('[IDE] Failed to restore tab:', path, error);
        }
      }
      if (restoredFiles.length === 0) return;
      setOpenFiles(restoredFiles);
      const preferredActive =
        restoredIdeState.activeFile &&
          restoredFiles.some((f) => f.path === restoredIdeState.activeFile)
          ? restoredIdeState.activeFile
          : restoredFiles[0].path;
      setActiveFilePath(preferredActive);
      setSelectedFilePath(preferredActive);
    })();
  }, [restoredIdeState, openFiles.length, permissionState, syncStatus, localAdapterRef, didRestoreOpenFilesRef]);

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      {permissionState === 'prompt' && (
        <PermissionOverlay projectMetadata={projectMetadata} onRestoreAccess={restoreAccess} />
      )}
      <IDEHeaderBar projectId={projectId} isChatVisible={isChatVisible} onToggleChat={() => setIsChatVisible(!isChatVisible)} />

      <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>
        <ResizablePanel order={1} defaultSize={20} minSize={10} maxSize={30} className="bg-background">
          <Card className="h-full rounded-none border-0 border-r bg-background">
            <CardHeader className="h-9 px-4 py-2 border-b bg-card">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Explorer</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <FileTree selectedPath={selectedFilePath} onFileSelect={handleFileSelect} refreshKey={fileTreeRefreshKey} />
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle withHandle orientation="vertical" className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize" />

        <ResizablePanel order={2} minSize={30}>
          <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
            <ResizablePanel defaultSize={70} minSize={30}>
              <ResizablePanelGroup ref={editorPanelGroupRef} direction="horizontal" onLayout={(layout) => handlePanelLayoutChange('editor', layout)}>
                <ResizablePanel defaultSize={60} minSize={30} className="bg-background">
                  <Card className="h-full rounded-none border-0 bg-background">
                    <CardHeader className="h-10 px-4 py-2 border-b flex items-center bg-card">
                      <CardTitle className="text-sm font-semibold text-foreground">Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 min-h-0">
                      <MonacoEditor
                        openFiles={openFiles}
                        activeFilePath={activeFilePath}
                        onSave={handleSave}
                        onActiveFileChange={setActiveFilePath}
                        onTabClose={handleTabClose}
                        onContentChange={handleContentChange}
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

      <MinViewportWarning />
    </div>
  );
}
