import { useState, useCallback, useRef } from 'react';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { TreeNode, ContextMenuState } from '../types';

/**
 * Options for the useFileTreeState hook.
 */
export interface UseFileTreeStateOptions {
    /** Directory handle to use */
    directoryHandle: FileSystemDirectoryHandle | null | undefined;
    /** Key to trigger refresh */
    refreshKey?: number;
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
    /** Ref to StorageGateway */
    gatewayRef: React.MutableRefObject<StorageGateway | null>;
    /** Get or create gateway */
    getGateway: () => StorageGateway | null;
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

    const gatewayRef = useRef<StorageGateway | null>(null);

    const getGateway = useCallback(() => {
        if (!gatewayRef.current && directoryHandle) {
            // Dynamic import to avoid circular dependencies
            import('@/infrastructure/filesystem/fsa-gateway').then(({ FSAGateway }) => {
                gatewayRef.current = new FSAGateway(directoryHandle);
            });
        }
        return gatewayRef.current;
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
        gatewayRef,
        getGateway,
    };
}
