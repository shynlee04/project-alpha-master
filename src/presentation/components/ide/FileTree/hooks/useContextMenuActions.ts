import { useCallback } from 'react';
import type { LocalFSAdapter } from '../../../../lib/filesystem/local-fs-adapter';
import type { TreeNode, ContextMenuState, ContextMenuAction } from '../types';
import { getAncestorPaths } from '../utils';

/**
 * Options for the useContextMenuActions hook.
 */
export interface UseContextMenuActionsOptions {
    /** Current context menu state */
    contextMenu: ContextMenuState;
    /** Set context menu state */
    setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
    /** Directory handle */
    directoryHandle: FileSystemDirectoryHandle | null | undefined;
    /** Get adapter function */
    getAdapter: () => LocalFSAdapter;
    /** Handle toggle for refresh */
    handleToggle: (node: TreeNode) => Promise<void>;
    /** Load root directory for refresh */
    loadRootDirectory: () => Promise<void>;
    /** Set expanded paths for state preservation */
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>;
    /** Set focused path for auto-selection */
    setFocusedPath: React.Dispatch<React.SetStateAction<string | undefined>>;
}

/**
 * Return type for the useContextMenuActions hook.
 */
export interface UseContextMenuActionsResult {
    /** Handle context menu event */
    handleContextMenu: (event: React.MouseEvent, node: TreeNode) => void;
    /** Close context menu */
    closeContextMenu: () => void;
    /** Handle context menu action */
    handleContextMenuAction: (action: ContextMenuAction) => Promise<void>;
}

/**
 * Hook for context menu actions.
 * 
 * @param options - Hook options
 * @returns Context menu handlers
 */
export function useContextMenuActions(
    options: UseContextMenuActionsOptions
): UseContextMenuActionsResult {
    const {
        contextMenu,
        setContextMenu,
        directoryHandle,
        getAdapter,
        loadRootDirectory,
        setExpandedPaths,
        setFocusedPath,
    } = options;

    /**
     * Handle context menu event.
     */
    const handleContextMenu = useCallback(
        (event: React.MouseEvent, node: TreeNode) => {
            event.preventDefault();
            setContextMenu({
                visible: true,
                x: event.clientX,
                y: event.clientY,
                targetNode: node,
            });
        },
        [setContextMenu],
    );

    /**
     * Close context menu.
     */
    const closeContextMenu = useCallback(() => {
        setContextMenu((prev) => ({ ...prev, visible: false, targetNode: null }));
    }, [setContextMenu]);

    /**
     * Handle context menu action.
     */
    const handleContextMenuAction = useCallback(
        async (action: ContextMenuAction) => {
            const targetNode = contextMenu.targetNode;
            if (!targetNode || !directoryHandle) return;

            const adapter = getAdapter();
            adapter.setDirectoryHandle(directoryHandle);

            try {
                switch (action) {
                    case 'new-file': {
                        const name = prompt('Enter file name:');
                        if (name) {
                            const newPath =
                                targetNode.type === 'directory'
                                    ? `${targetNode.path}/${name}`
                                    : name;
                            await adapter.createFile(newPath, '');

                            // Expand parent paths for visibility
                            const parentPath = targetNode.type === 'directory'
                                ? targetNode.path
                                : undefined;
                            if (parentPath) {
                                setExpandedPaths((prev) => {
                                    const next = new Set(prev);
                                    // Add parent and all ancestors
                                    next.add(parentPath);
                                    getAncestorPaths(parentPath).forEach((p) => next.add(p));
                                    return next;
                                });
                            }

                            // Auto-select the new file after tree reload
                            setFocusedPath(newPath);

                            // Reload tree (will restore expanded state)
                            await loadRootDirectory();
                        }
                        break;
                    }
                    case 'new-folder': {
                        const name = prompt('Enter folder name:');
                        if (name) {
                            const newPath =
                                targetNode.type === 'directory'
                                    ? `${targetNode.path}/${name}`
                                    : name;
                            await adapter.createDirectory(newPath);

                            // Expand parent paths for visibility
                            const parentPath = targetNode.type === 'directory'
                                ? targetNode.path
                                : undefined;
                            if (parentPath) {
                                setExpandedPaths((prev) => {
                                    const next = new Set(prev);
                                    // Add parent and all ancestors
                                    next.add(parentPath);
                                    getAncestorPaths(parentPath).forEach((p) => next.add(p));
                                    return next;
                                });
                            }

                            // Reload tree (will restore expanded state)
                            await loadRootDirectory();
                        }
                        break;
                    }
                    case 'rename': {
                        const newName = prompt('Enter new name:', targetNode.name);
                        if (newName && newName !== targetNode.name) {
                            const parentPath = targetNode.path.includes('/')
                                ? targetNode.path.substring(0, targetNode.path.lastIndexOf('/'))
                                : '';
                            const newPath = parentPath ? `${parentPath}/${newName}` : newName;
                            await adapter.rename(targetNode.path, newPath);
                            loadRootDirectory();
                        }
                        break;
                    }
                    case 'delete': {
                        const confirmed = confirm(
                            `Are you sure you want to delete "${targetNode.name}"?`,
                        );
                        if (confirmed) {
                            if (targetNode.type === 'directory') {
                                await adapter.deleteDirectory(targetNode.path);
                            } else {
                                await adapter.deleteFile(targetNode.path);
                            }
                            loadRootDirectory();
                        }
                        break;
                    }
                }
            } catch (err) {
                console.error('Context menu action error:', err);
                alert(
                    `Failed to ${action}: ${err instanceof Error ? err.message : 'Unknown error'}`,
                );
            }
        },
        [contextMenu.targetNode, directoryHandle, getAdapter, loadRootDirectory, setExpandedPaths, setFocusedPath],
    );

    return {
        handleContextMenu,
        closeContextMenu,
        handleContextMenuAction,
    };
}
