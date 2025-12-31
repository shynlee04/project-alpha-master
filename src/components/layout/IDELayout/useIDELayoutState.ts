/**
 * IDE Layout State Hook
 *
 * Composes all IDE layout state from focused hooks.
 *
 * @layer Presentation
 * @hook useIDELayoutState
 */

import { useIDEStore } from '@/lib/state';
import { useToast } from '../../ui/Toast';
import { useIDELayoutFileState } from './useIDELayoutFileState';
import { useIDELayoutWorkspaceState } from './useIDELayoutWorkspaceState';
import { useIDELayoutDiscoveryState } from './useIDELayoutDiscoveryState';
import { useIDELayoutPanelRefs } from './useIDELayoutPanelRefs';

interface UseIDELayoutStateResult {
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

/**
 * Hook to manage IDE layout state
 */
export function useIDELayoutState(): UseIDELayoutStateResult {
    const { toast } = useToast();
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
        restoreAccess
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
    const mainPanelGroupRef = useRef<any>(null);
    const centerPanelGroupRef = useRef<any>(null);
    const editorPanelGroupRef = useRef<any>(null);

    // Story MVP-3: Create tool facades for agent
    const fileTools = useMemo(() => {
        if (!localAdapterRef.current || !syncManagerRef.current) return null;
        return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
    }, [localAdapterRef.current, syncManagerRef.current, eventBus]);

    const terminalTools = useMemo(() => {
        if (!syncManagerRef.current) return null;
        return createTerminalToolsFacade(eventBus);
    }, [syncManagerRef.current, eventBus]);

    return {
        chatVisible,
        setChatVisible,
        terminalTab,
        setTerminalTab,
        openFilePaths,
        activeFilePath,
        setActiveFilePath,
        addOpenFile,
        removeOpenFile,
        selectedFilePath,
        setSelectedFilePath,
        fileTreeRefreshKey,
        setFileTreeRefreshKey,
        fileContentCache,
        setFileContentCache,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isFeatureSearchOpen,
        setIsFeatureSearchOpen,
        openFiles,
        setOpenFiles,
        localAdapterRef,
        syncManagerRef,
        eventBus,
        fileTools,
        terminalTools,
        projectId,
        projectMetadata,
        permissionState,
        syncStatus,
        initialSyncCompleted,
        setIsWebContainerBooted,
        restoreAccess,
        toast,
        mainPanelGroupRef,
        centerPanelGroupRef,
        editorPanelGroupRef
    };
}
