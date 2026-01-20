import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { FileSystemError, PermissionDeniedError } from '@/infrastructure/filesystem/fs-errors';
import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
import type { TreeNode } from '../types';
import { buildTreeNode, updateNodeByPath, restoreExpandedState } from '../utils';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';

/**
 * Options for the useFileTreeActions hook.
 */
export interface UseFileTreeActionsOptions {
    /** Directory handle */
    directoryHandle: FileSystemDirectoryHandle | null | undefined;
    /** Get gateway function */
    getGateway: () => StorageGateway | null;
    /** Set root nodes */
    setRootNodes: React.Dispatch<React.SetStateAction<TreeNode[]>>;
    /** Set error */
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    /** Set loading */
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    /** Expanded paths for state preservation */
    expandedPaths: Set<string>;
    /** Set expanded paths */
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
    /** Local adapter ref from workspace - can be LocalFSAdapter (FSA) or UnifiedStorageAdapter (IndexedDB) */
    localAdapterRef: React.RefObject<LocalFSAdapter | UnifiedStorageAdapter | null>;
    /** Sync manager ref from workspace */
    syncManagerRef: React.RefObject<import('@/lib/filesystem').SyncManager | null>;
}

/**
 * Return type for the useFileTreeActions hook.
 */
export interface UseFileTreeActionsResult {
    /** Load root directory */
    loadRootDirectory: () => Promise<void>;
    /** Load children of a node */
    loadChildren: (node: TreeNode) => Promise<TreeNode[]>;
    /** Toggle folder expand/collapse */
    handleToggle: (node: TreeNode) => Promise<void>;
    /** Retry syncing a file */
    handleRetryFile: (path: string) => Promise<void>;
}

/**
 * Hook for FileTree actions.
 * 
 * @param options - Hook options
 * @returns FileTree actions
 */
export function useFileTreeActions(
    options: UseFileTreeActionsOptions
): UseFileTreeActionsResult {
    const { t } = useTranslation();
    const { isMobile } = useDeviceType();
    const {
        directoryHandle,
        getGateway,
        setRootNodes,
        setError,
        setIsLoading,
        expandedPaths,
        setExpandedPaths,
        localAdapterRef,
        syncManagerRef,
    } = options;

    /**
     * Load root directory contents.
     * R2 FIX: Now handles IndexedDB projects via localAdapterRef when directoryHandle is null
     */
    const loadRootDirectory = useCallback(async () => {
        // For IndexedDB projects (temp projects), use localAdapterRef
        if (!directoryHandle) {
            if (localAdapterRef.current) {
                // IndexedDB project - use UnifiedStorageAdapter
                setIsLoading(true);
                setError(null);
                try {
                    const entries = await localAdapterRef.current.listDirectory();
                    const nodes = entries.map((entry: any) => buildTreeNode(entry, ''));
                    const restoredNodes = restoreExpandedState(nodes, expandedPaths);
                    setRootNodes(restoredNodes);
                } catch (err) {
                    setError(`Error loading files: ${err instanceof Error ? err.message : String(err)}`);
                    setRootNodes([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // No directory and no local adapter
                setRootNodes([]);
                setError(null);
            }
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // V3-FIX-003: Wait for gateway initialization with retry
            // This fixes race condition on page reload where FileTree loads before gateway is ready
            let gateway = getGateway();
            let retries = 0;
            const maxRetries = 10;
            const retryDelay = 100; // ms

            while (!gateway && retries < maxRetries) {
                console.log(`[FileTree] Waiting for gateway initialization (attempt ${retries + 1}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                gateway = getGateway();
                retries++;
            }

            if (!gateway) {
                throw new FileSystemError(
                    'Gateway initialization timeout. Please try refreshing the page.',
                    'GATEWAY_INIT_TIMEOUT'
                );
            }

            const entries = await gateway.list('.');
            const nodes = entries.map((entry) => buildTreeNode(entry, ''));

            // Restore expanded state from saved paths
            const restoredNodes = restoreExpandedState(nodes, expandedPaths);
            setRootNodes(restoredNodes);
        } catch (err) {
            if (err instanceof PermissionDeniedError) {
                // Show mobile-specific error on mobile devices
                if (isMobile) {
                    setError(null); // Clear the error state for toast handling
                    showMobileWorkspaceError('permissionDenied', () => {
                        window.location.href = '/hub';
                    });
                } else {
                    setError(t('errors.workspace.permissionDenied.description', 'Permission was denied to access this folder. Please grant access in your browser settings.'));
                }
            } else if (err instanceof FileSystemError) {
                // Show mobile-specific error on mobile devices
                if (isMobile) {
                    setError(null); // Clear the error state for toast handling
                    showMobileWorkspaceError('openFailed', () => {
                        window.location.href = '/hub';
                    });
                } else {
                    setError(t('errors.workspace.openFailed.description', `Error loading directory: ${err.message}`));
                }
            } else {
                // Show mobile-specific error on mobile devices
                if (isMobile) {
                    setError(null); // Clear the error state for toast handling
                    showMobileWorkspaceError('openFailed', () => {
                        window.location.href = '/hub';
                    });
                } else {
                    setError(t('errors.workspace.openFailed.description', `Error loading directory: ${err instanceof Error ? err.message : String(err)}`));
                    console.error('FileTree error:', err);
                }
            }
            setRootNodes([]);
        } finally {
            setIsLoading(false);
        }
    }, [directoryHandle, getGateway, setRootNodes, setError, setIsLoading, expandedPaths, isMobile, localAdapterRef, t]);

    /**
     * Load children of a directory node.
     * R2 FIX: Now handles IndexedDB projects via localAdapterRef when directoryHandle is null
     */
    const loadChildren = useCallback(
        async (node: TreeNode): Promise<TreeNode[]> => {
            // For IndexedDB projects, use localAdapterRef
            if (!directoryHandle) {
                if (localAdapterRef.current) {
                    try {
                        const entries = await localAdapterRef.current.listDirectory(node.path);
                        return entries.map((entry: any) => buildTreeNode(entry, node.path));
                    } catch (err) {
                        console.error('Error loading children (IndexedDB):', err);
                        return [];
                    }
                }
                return [];
            }

            try {
                const gateway = getGateway();
                if (!gateway) {
                    return [];
                }

                const entries = await gateway.list(node.path);
                return entries.map((entry) => buildTreeNode(entry, node.path));
            } catch (err) {
                console.error('Error loading children:', err);
                return [];
            }
        },
        [directoryHandle, getGateway, localAdapterRef],
    );

    /**
     * Toggle folder expand/collapse.
     */
    const handleToggle = useCallback(
        async (node: TreeNode) => {
            if (node.type !== 'directory') return;

            if (node.expanded) {
                // Collapse - remove from expandedPaths
                setExpandedPaths((prev) => {
                    const next = new Set(prev);
                    next.delete(node.path);
                    return next;
                });
                setRootNodes((prev) =>
                    updateNodeByPath(prev, node.path, (n) => ({
                        ...n,
                        expanded: false,
                    })),
                );
            } else {
                // Expand - add to expandedPaths
                setExpandedPaths((prev) => new Set(prev).add(node.path));

                // Load children if needed
                if (!node.children) {
                    // Set loading
                    setRootNodes((prev) =>
                        updateNodeByPath(prev, node.path, (n) => ({
                            ...n,
                            loading: true,
                        })),
                    );

                    const children = await loadChildren(node);

                    setRootNodes((prev) =>
                        updateNodeByPath(prev, node.path, (n) => ({
                            ...n,
                            loading: false,
                            expanded: true,
                            children,
                        })),
                    );
                } else {
                    setRootNodes((prev) =>
                        updateNodeByPath(prev, node.path, (n) => ({
                            ...n,
                            expanded: true,
                        })),
                    );
                }
            }
        },
        [loadChildren, setRootNodes, setExpandedPaths],
    );

    /**
     * Retry syncing a file.
     */
    const handleRetryFile = useCallback(
        async (path: string) => {
            if (!directoryHandle) return;

            const adapter = localAdapterRef.current;
            const syncManager = syncManagerRef.current;
            if (!adapter || !syncManager) return;

            try {
                // Dynamic import to avoid circular dependencies
                const { setFileSyncPending } = await import('@/lib/workspace');

                if ('setDirectoryHandle' in adapter) {
                    adapter.setDirectoryHandle(directoryHandle);
                }
                setFileSyncPending(path);
                const fileResult = await adapter.readFile(path);
                await syncManager.writeFile(path, fileResult.content);
            } catch (error) {
                // We need to import setFileSyncError here as well if it failed before the previous import
                const { setFileSyncError } = await import('@/lib/workspace');
                const err = error instanceof Error ? error : new Error('Unknown error');
                setFileSyncError(path, err);
            }
        },
        [directoryHandle, localAdapterRef, syncManagerRef],
    );

    return {
        loadRootDirectory,
        loadChildren,
        handleToggle,
        handleRetryFile,
    };
}
