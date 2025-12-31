/**
 * IDE Layout State Types
 *
 * Shared types for IDE layout hooks.
 *
 * @layer Presentation
 */

import type { OpenFile } from '../../ide/Monaco';
import type { ImperativePanelGroupHandle } from '@/components/ui/resizable';

export interface UseIDELayoutStateResult {
    // Store state
    chatVisible: boolean;
    setChatVisible: (visible: boolean) => void;
    terminalTab: string;
    setTerminalTab: (tab: string) => void;
    openFilePaths: string[];
    activeFilePath: string | undefined;
    setActiveFilePath: (path: string) => void;
    addOpenFile: (path: string) => void;
    removeOpenFile: (path: string) => void;

    // Local state
    selectedFilePath: string | undefined;
    setSelectedFilePath: (path: string | undefined) => void;
    fileTreeRefreshKey: number;
    setFileTreeRefreshKey: (key: number | ((prev: number) => number)) => void;
    fileContentCache: Map<string, string>;
    setFileContentCache: React.Dispatch<React.SetStateAction<Map<string, string>>>;

    // Discovery mechanisms
    isCommandPaletteOpen: boolean;
    setIsCommandPaletteOpen: (open: boolean) => void;
    isFeatureSearchOpen: boolean;
    setIsFeatureSearchOpen: (open: boolean) => void;

    // Derived state
    openFiles: OpenFile[];
    setOpenFiles: (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => void;

    // Workspace refs
    localAdapterRef: React.RefObject<any>;
    syncManagerRef: React.RefObject<any>;
    eventBus: any;

    // Tool facades
    fileTools: any;
    terminalTools: any;

    // Project metadata
    projectId: string | null;
    projectMetadata: any;
    permissionState: any;
    syncStatus: any;
    initialSyncCompleted: boolean;
    setIsWebContainerBooted: (booted: boolean) => void;
    restoreAccess: () => void;

    // Toast
    toast: any;

    // Panel refs
    mainPanelGroupRef: React.RefObject<any>;
    centerPanelGroupRef: React.RefObject<any>;
    editorPanelGroupRef: React.RefObject<any>;
}

export interface IDEResizableLayoutProps {
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

export interface IDEEditorPreviewGroupProps {
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
    editorPanelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
}
