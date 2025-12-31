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
    );
}
