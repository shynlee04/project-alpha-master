/**
 * IDE Resizable Layout Component
 *
 * Orchestrates the main resizable panel structure for editor, preview, terminal, and chat.
 *
 * @layer Presentation
 * @component IDEResizableLayout
 */

import {
    ResizablePanelGroup,
    ResizablePanel,
} from '@/components/ui/resizable';
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
    centerPanelGroupRef
}: IDEResizableLayoutProps) {
    return (
        <ResizablePanelGroup ref={mainPanelGroupRef} direction="horizontal" className="flex-1" onLayout={(layout) => handlePanelLayoutChange('main', layout)}>
            {/* Center Panel (Editor + Preview + Terminal) */}
            <ResizablePanel id="ide-center-wrapper" order={2} defaultSize={75} minSize={30}>
                <ResizablePanelGroup ref={centerPanelGroupRef} direction="vertical" onLayout={(layout) => handlePanelLayoutChange('center', layout)}>
                    {/* Editor + Preview */}
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
                    />
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
