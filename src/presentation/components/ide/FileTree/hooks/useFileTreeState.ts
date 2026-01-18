import { useState, useCallback, useRef } from 'react';
import type { StorageGateway, FileEntry } from '@/domain/interfaces/storage-gateway.interface';
import { createIdeFileGateway } from '@/infrastructure/filesystem/ide-file-gateway';
import type { TreeNode, ContextMenuState } from '../types';

/**
 * Options for useFileTreeState hook.
 */
export interface UseFileTreeStateOptions {
    /** Directory handle to use */
    directoryHandle: FileSystemDirectoryHandle | null | undefined;
    /** Key to trigger refresh */
    refreshKey?: number | undefined;
    /** Project ID for IndexedDB storage (mobile) */
    projectId?: string;
}

/**
 * Return type for useFileTreeState hook.
 */
export interface UseFileTreeStateResult {
    /** Root nodes of the tree */
    rootNodes: TreeNode[];
    /** Set root nodes */
    setRootNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;
    /** Currently focused path */
    focusedPath: string | undefined;
    /** Set focused path */
    setFocusedPath: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Paths of expanded folders (for state preservation) */
    expandedPaths: Set<string>;
    /** Set expanded paths */
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
    /** Error message if any */
    error: string | null;
    /** Set error */
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    /** Whether tree is loading */
    isLoading: boolean;
    /** Set loading state */
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    /** Context menu state */
    contextMenu: ContextMenuState;
    /** Set context menu state */
    setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
    /** Ref to StorageGateway */
    gatewayRef: React.MutableRefObject<StorageGateway | null>;
    /** Get or create gateway */
    getGateway: () => StorageGateway;
}

/**
 * Hook for managing FileTree state with StorageGateway integration.
 *
 * @remarks
 * **CC-IDE-02**: Migrated from LocalFSAdapter to StorageGateway.
 * Uses createIdeFileGateway() from CC-IDE-01 for platform-aware file operations.
 *
 * @param options - Hook options
 * @returns FileTree state and setters
 */
export function useFileTreeState(
    options: UseFileTreeStateOptions
): UseFileTreeStateResult {
    const { directoryHandle, projectId } = options;

    const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);
    const [focusedPath, setFocusedPath] = useState<string | undefined>();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetNode: null,
    });

    const gatewayRef = useRef<StorageGateway | null>(null);

    const getGateway = useCallback(() => {
        if (!gatewayRef.current) {
            gatewayRef.current = createIdeFileGateway({
                projectId: projectId || '',
                fsaHandle: directoryHandle || undefined,
            });
        }
        return gatewayRef.current;
    }, [projectId, directoryHandle]);

    return {
        rootNodes,
        setRootNodes,
        focusedPath,
        setFocusedPath,
        expandedPaths,
        setExpandedPaths,
        error,
        setError,
        isLoading,
        setIsLoading,
        contextMenu,
        setContextMenu,
        gatewayRef,
        getGateway,
    };
}

/**
 * Return type for the useFileTreeState hook.
 */
export interface UseFileTreeStateResult {
    /** Root nodes of the tree */
    rootNodes: TreeNode[];
    /** Set root nodes */
    setRootNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;
    /** Currently focused path */
    focusedPath: string | undefined;
    /** Set focused path */
    setFocusedPath: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Paths of expanded folders (for state preservation) */
    expandedPaths: Set<string>;
    /** Set expanded paths */
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
    /** Error message if any */
    error: string | null;
    /** Set error */
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    /** Whether tree is loading */
    isLoading: boolean;
    /** Set loading state */
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    /** Context menu state */
    contextMenu: ContextMenuState;
    /** Set context menu state */
    setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
    /** Ref to LocalFSAdapter */
    adapterRef: React.MutableRefObject<LocalFSAdapter | null>;
    /** Get or create adapter */
    getAdapter: () => LocalFSAdapter;
}

/**
 * Hook for managing FileTree state.
 * 
 * @param options - Hook options
 * @returns FileTree state and setters
 */
export function useFileTreeState(
    options: UseFileTreeStateOptions
): UseFileTreeStateResult {
    const { directoryHandle } = options;

    const [rootNodes, setRootNodes] = useState<TreeNode[]>([]);
    const [focusedPath, setFocusedPath] = useState<string | undefined>();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetNode: null,
    });

    const adapterRef = useRef<LocalFSAdapter | null>(null);

    const getAdapter = useCallback(() => {
        if (!adapterRef.current) {
            adapterRef.current = new LocalFSAdapter();
        }
        if (directoryHandle) {
            adapterRef.current.setDirectoryHandle(directoryHandle);
        }
        return adapterRef.current;
    }, [directoryHandle]);

    return {
        rootNodes,
        setRootNodes,
        focusedPath,
        setFocusedPath,
        expandedPaths,
        setExpandedPaths,
        error,
        setError,
        isLoading,
        setIsLoading,
        contextMenu,
        setContextMenu,
        adapterRef,
        getAdapter,
    };
}
