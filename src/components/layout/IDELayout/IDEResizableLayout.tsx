/**
 * IDE Resizable Layout Component
 *
 * Orchestrates the main resizable panel structure for editor, preview, terminal, and chat.
 *
 * @layer Presentation
 * @component IDEResizableLayout
 */

import { useRef } from 'react';
import {
    ResizablePanelGroup,
    type ImperativePanelGroupHandle,
} from '@/components/ui/resizable';
import { IDEEditorPanel } from './IDEEditorPanel';
import { IDEPreviewPanel } from './IDEPreviewPanel';
import { IDETerminalPanel } from './IDETerminalPanel';
import { IDEChatPanel } from './IDEChatPanel';
import type { OpenFile } from '../../ide/Monaco';

interface IDEResizableLayoutProps {
    projectId: string | null;
    projectName: string;
    chatVisible: boolean;
    setChatVisible: (visible: boolean) => void;
    terminalTab: string;
    setTerminalTab: (tab: string) => void;
    initialSyncCompleted: boolean;
    permissionState: any;
    openFiles: OpenFile[];
    activeFilePath: string | undefined;
    onSave: () => void;
    onActiveFileChange: (path: string) => void;
    onTabClose: (path: string) => void;
    onContentChange: (path: string, content: string) => void;
    restoredIdeState: any;
    activeFileScrollTopRef: React.RefObject<number | undefined>;
    scheduleIdeStatePersistence: (ms: number) => void;
    handlePanelLayoutChange: (group: string, layout: number[]) => void;
    previewUrl: string | undefined;
    previewPort: number | undefined;
    fileTools: any;
    terminalTools: any;
    eventBus: any;
    mainPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
    centerPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
    editorPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
}

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
    return (
        <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>
            {/* Center Panel (Editor + Preview + Terminal) */}
            <ResizablePanel id="ide-center-wrapper" order={2} defaultSize={75} minSize={30}>
                <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
                    {/* Editor + Preview */}
                    <ResizablePanel id="ide-editor-preview-wrapper" defaultSize={70} minSize={30}>
                        <ResizablePanelGroup ref={editorPanelGroupRef} direction="horizontal" onLayout={(layout) => handlePanelLayoutChange('editor', layout)}>
                            <IDEEditorPanel
                                openFiles={openFiles}
                                activeFilePath={activeFilePath}
                                onSave={onSave}
                                onActiveFileChange={onActiveFileChange}
                                onTabClose={onTabClose}
                                onContentChange={onContentChange}
                                restoredIdeState={restoredIdeState}
                                activeFileScrollTopRef={activeFileScrollTopRef}
                                scheduleIdeStatePersistence={scheduleIdeStatePersistence}
                            />
                            <IDEPreviewPanel previewUrl={previewUrl} previewPort={previewPort} />
                        </ResizablePanelGroup>
                    </ResizablePanel>
                    <IDETerminalPanel
                        terminalTab={terminalTab}
                        onTabChange={setTerminalTab}
                        initialSyncCompleted={initialSyncCompleted}
                        permissionState={permissionState}
                    />
                </ResizablePanelGroup>
            </ResizablePanel>

            {/* Chat Panel */}
            {chatVisible && (
                <IDEChatPanel
                    projectId={projectId}
                    projectName={projectName}
                    fileTools={fileTools}
                    terminalTools={terminalTools}
                    eventBus={eventBus}
                    onClose={() => setChatVisible(false)}
                />
            )}
        </ResizablePanelGroup>
    );
}
