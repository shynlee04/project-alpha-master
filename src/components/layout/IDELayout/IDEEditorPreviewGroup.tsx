/**
 * IDE Editor + Preview Panel Group Component
 *
 * Orchestrates the editor and preview panels.
 *
 * @layer Presentation
 * @component IDEEditorPreviewGroup
 */

import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle,
} from '@/components/ui/resizable';
import { IDEEditorPanel } from './IDEEditorPanel';
import { IDEPreviewPanel } from './IDEPreviewPanel';
import type { IDEEditorPreviewGroupProps } from './types';

/**
 * IDE Editor + Preview Panel Group Component
 */
export function IDEEditorPreviewGroup({
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
    editorPanelGroupRef
}: IDEEditorPreviewGroupProps) {
    return (
        <ResizablePanelGroup ref={editorPanelGroupRef} direction="horizontal" onLayout={(layout) => handlePanelLayoutChange('editor', layout)}>
            <ResizablePanel id="ide-editor-panel" defaultSize={60} minSize={30} className="bg-background">
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
            </ResizablePanel>

            <ResizableHandle
                withHandle
                orientation="vertical"
                className="w-2 bg-border hover:bg-accent transition-colors cursor-col-resize focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                aria-label="Resize editor and preview panels"
                aria-orientation="vertical"
            />

            <ResizablePanel id="ide-preview-panel" defaultSize={40} minSize={15} className="bg-background">
                <IDEPreviewPanel previewUrl={previewUrl} previewPort={previewPort} />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
