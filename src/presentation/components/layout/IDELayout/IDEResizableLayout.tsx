/**
 * IDE Resizable Layout Component
 *
 * Orchestrates the main resizable panel structure for editor, preview, terminal, and chat.
 *
 * @layer Presentation
 * @component IDEResizableLayout
 */

import { useState } from 'react';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@/presentation/components/ui/resizable';
import { IDEEditorPreviewGroup } from './IDEEditorPreviewGroup';
import { IDETerminalPanel } from './IDETerminalPanel';
import { IDEChatPanel } from './IDEChatPanel';
import type { IDEResizableLayoutProps } from './types';

/**
 * IDE Resizable Layout Component
 */
export function IDEResizableLayout({
    projectId,
    projectName,
    chatVisible,
    setChatVisible,
    terminalTab,
    setTerminalTab,
    initialSyncCompleted,
    permissionState,
    openFiles,
    activeFilePath,
    onSave,
    onActiveFileChange,
    onTabClose,
    onContentChange,
    restoredIdeState,
    activeFileScrollTopRef,
    scheduleIdeStatePersistence,
    handlePanelLayoutChange,
    previewUrl,
    previewPort,
    fileTools,
    terminalTools,
    eventBus,
    mainPanelGroupRef,
    centerPanelGroupRef,
    editorPanelGroupRef
}: IDEResizableLayoutProps) {
    // P2-2: Terminal panel collapse state
    const [terminalCollapsed, setTerminalCollapsed] = useState(false);
    return (
        <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>
            {/* Center Panel (Editor + Preview + Terminal) */}
            <ResizablePanel id="ide-center-wrapper" order={2} defaultSize={chatVisible ? 75 : 100} minSize={30}>
                <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
                    {/* Editor + Preview Area */}
                    <ResizablePanel id="ide-main-area" order={1} defaultSize={70} minSize={30}>
                        <IDEEditorPreviewGroup
                            openFiles={openFiles}
                            activeFilePath={activeFilePath}
                            onSave={onSave}
                            onActiveFileChange={onActiveFileChange}
                            onTabClose={onTabClose}
                            onContentChange={onContentChange}
                            restoredIdeState={restoredIdeState}
                            activeFileScrollTopRef={activeFileScrollTopRef}
                            scheduleIdeStatePersistence={scheduleIdeStatePersistence}
                            handlePanelLayoutChange={handlePanelLayoutChange}
                            previewUrl={previewUrl}
                            previewPort={previewPort}
                            editorPanelGroupRef={editorPanelGroupRef}
                        />
                    </ResizablePanel>

                    <ResizableHandle
                        withHandle
                        className="h-2 bg-border hover:bg-accent transition-colors cursor-row-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                    />

                    {/* Terminal Panel - P2-2: Collapsible */}
                    <ResizablePanel
                        id="ide-terminal-panel"
                        order={2}
                        defaultSize={30}
                        minSize={10}
                        collapsible={true}
                        collapsedSize={5}
                        onCollapse={setTerminalCollapsed}
                    >
                        {terminalCollapsed ? (
                            <div className="h-full flex items-center justify-center border-t border-border bg-muted/30">
                                <div className="text-center">
                                    <span className="text-xs text-muted-foreground">Terminal</span>
                                </div>
                            </div>
                        ) : (
                            <IDETerminalPanel
                                terminalTab={terminalTab}
                                onTabChange={setTerminalTab}
                                initialSyncCompleted={initialSyncCompleted}
                                permissionState={permissionState}
                            />
                        )}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>

            {/* Chat Panel */}
            {chatVisible && (
                <>
                    <ResizableHandle
                        withHandle
                        className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                    />
                    <ResizablePanel id="ide-chat-panel" order={3} defaultSize={25} minSize={20} maxSize={40} className="bg-background">
                        <IDEChatPanel
                            projectId={projectId}
                            projectName={projectName}
                            fileTools={fileTools}
                            terminalTools={terminalTools}
                            eventBus={eventBus}
                            onClose={() => setChatVisible(false)}
                        />
                    </ResizablePanel>
                </>
            )}
        </ResizablePanelGroup>
    );
}
