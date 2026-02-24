import { useState, useCallback, useRef, useEffect } from 'react';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { TreeNode, ContextMenuState } from '../types';
import { getDb } from '@/infrastructure/persistence/dexie-db';

/**
 * Options for the useFileTreeState hook.
 */
export interface UseFileTreeStateOptions {
    /** Directory handle to use */
    directoryHandle: FileSystemDirectoryHandle | null | undefined;
    /** Key to trigger refresh */
    refreshKey?: number;
    /** Project ID for persistence */
    projectId?: string;
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

    // PHASE-1 FIX: Initialize gateway in useEffect (not during getGateway call)
    // This ensures gateway is ready before any code tries to use it
    useEffect(() => {
        let mounted = true;
        
        if (directoryHandle && !gatewayRef.current) {
            import('@/infrastructure/filesystem/fsa-gateway').then(({ FSAGateway }) => {
                if (mounted && directoryHandle) {
                    gatewayRef.current = new FSAGateway(directoryHandle);
                    console.log('[useFileTreeState] Gateway initialized');
                }
            }).catch((error) => {
                console.error('[useFileTreeState] Failed to initialize gateway:', error);
            });
        }
        
        return () => {
            mounted = false;
            // Don't clear gateway here - let it persist for the session
        };
    }, [directoryHandle]);

    // FIX-2026-01-20: Load tree state from Dexie on mount
    useEffect(() => {
        if (projectId) {
            const db = getDb();
            if (db) {
                db.ideState.get(projectId).then(state => {
                    if (state?.expandedPaths) {
                        setExpandedPaths(new Set(state.expandedPaths));
                    }
                    if (state?.focusedPath) {
                        setFocusedPath(state.focusedPath);
                    }
                });
            }
        }
    }, [projectId]);

    // FIX-2026-01-20: Save tree state to Dexie on change (debounced 500ms)
    useEffect(() => {
        if (projectId) {
            const timeout = setTimeout(() => {
                const db = getDb();
                if (db) {
                    const currentExpanded = Array.from(expandedPaths);
                    // Use update for partial record update
                    db.ideState.update(projectId, {
                        expandedPaths: currentExpanded,
                        focusedPath,
                    });
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [expandedPaths, focusedPath, projectId]);

    // PHASE-1 FIX: getGateway is now just a simple getter
    // Gateway initialization happens in useEffect above
    const getGateway = useCallback(() => {
        return gatewayRef.current;
    }, []);

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
