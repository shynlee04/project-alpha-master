import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import type { TreeNode, ContextMenuState, ContextMenuAction } from '../types';
import { getAncestorPaths } from '../utils';
import {
    duplicateFile,
    downloadFile,
    copyPathToClipboard,
    revealInFileManager,
} from '@/lib/filesystem/file-ops';

/**
 * Dialog state for file operations
 */
interface DialogState {
    open: boolean;
    operation: 'rename' | 'duplicate' | null;
    currentName: string;
}

/**
 * Confirm dialog state for delete operations
 */
interface ConfirmDialogState {
    open: boolean;
    itemName: string;
    isDirectory: boolean;
}

/**
 * Options for the useContextMenuActions hook.
 * S-024: Enhanced with dialog states and toast notifications
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
    /** Existing file names for duplicate checking */
    existingNames?: string[];
}

/**
 * Return type for the useContextMenuActions hook.
 * S-024: Enhanced with dialog states
 */
export interface UseContextMenuActionsResult {
    /** Handle context menu event */
    handleContextMenu: (event: React.MouseEvent, node: TreeNode) => void;
    /** Close context menu */
    closeContextMenu: () => void;
    /** Handle context menu action */
    handleContextMenuAction: (action: ContextMenuAction) => Promise<void>;
    /** File operation dialog state */
    operationDialog: DialogState;
    /** Close operation dialog */
    closeOperationDialog: () => void;
    /** Handle operation confirm */
    handleOperationConfirm: (newName: string) => Promise<void>;
    /** Confirm dialog state */
    confirmDialog: ConfirmDialogState;
    /** Close confirm dialog */
    closeConfirmDialog: () => void;
    /** Handle delete confirm */
    handleDeleteConfirm: () => Promise<void>;
}

/**
 * Hook for context menu actions.
 * S-024: Enhanced with dialogs, toasts, and all new file operations
 *
 * @param options - Hook options
 * @returns Context menu handlers with dialog states
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
        existingNames = [],
    } = options;

    // Dialog states
    const [operationDialog, setOperationDialog] = useState<DialogState>({
        open: false,
        operation: null,
        currentName: '',
    });

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        open: false,
        itemName: '',
        isDirectory: false,
    });

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
     * Close operation dialog.
     */
    const closeOperationDialog = useCallback(() => {
        setOperationDialog({ open: false, operation: null, currentName: '' });
    }, []);

    /**
     * Close confirm dialog.
     */
    const closeConfirmDialog = useCallback(() => {
        setConfirmDialog({ open: false, itemName: '', isDirectory: false });
    }, []);

    /**
     * Handle operation confirm (rename/duplicate).
     */
    const handleOperationConfirm = useCallback(
        async (newName: string) => {
            const targetNode = contextMenu.targetNode;
            if (!targetNode || !directoryHandle || !operationDialog.operation) return;

            const adapter = getAdapter();
            adapter.setDirectoryHandle(directoryHandle);

            try {
                const parentPath = targetNode.path.includes('/')
                    ? targetNode.path.substring(0, targetNode.path.lastIndexOf('/'))
                    : '';
                const newPath = parentPath ? `${parentPath}/${newName}` : newName;

                if (operationDialog.operation === 'rename') {
                    await adapter.rename(targetNode.path, newPath);
                    toast.success(`Renamed to "${newName}"`);
                } else if (operationDialog.operation === 'duplicate') {
                    await duplicateFile(directoryHandle, targetNode.path, newPath);
                    // Expand parent for visibility
                    if (parentPath) {
                        setExpandedPaths((prev) => {
                            const next = new Set(prev);
                            next.add(parentPath);
                            getAncestorPaths(parentPath).forEach((p) => next.add(p));
                            return next;
                        });
                    }
                    toast.success(`Duplicated as "${newName}"`);
                }

                closeOperationDialog();
                await loadRootDirectory();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Operation failed: ${errorMessage}`);
            }
        },
        [contextMenu.targetNode, directoryHandle, getAdapter, loadRootDirectory, setExpandedPaths, operationDialog.operation, closeOperationDialog],
    );

    /**
     * Handle delete confirm.
     */
    const handleDeleteConfirm = useCallback(
        async () => {
            const targetNode = contextMenu.targetNode;
            if (!targetNode || !directoryHandle) return;

            const adapter = getAdapter();
            adapter.setDirectoryHandle(directoryHandle);

            try {
                if (targetNode.type === 'directory') {
                    await adapter.deleteDirectory(targetNode.path);
                    toast.success(`Deleted folder "${targetNode.name}"`);
                } else {
                    await adapter.deleteFile(targetNode.path);
                    toast.success(`Deleted file "${targetNode.name}"`);
                }

                closeConfirmDialog();
                await loadRootDirectory();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Delete failed: ${errorMessage}`);
            }
        },
        [contextMenu.targetNode, directoryHandle, getAdapter, loadRootDirectory, closeConfirmDialog],
    );

    /**
     * Handle context menu action.
     * S-024: Enhanced with all new file operations
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

                            const parentPath = targetNode.type === 'directory'
                                ? targetNode.path
                                : undefined;
                            if (parentPath) {
                                setExpandedPaths((prev) => {
                                    const next = new Set(prev);
                                    next.add(parentPath);
                                    getAncestorPaths(parentPath).forEach((p) => next.add(p));
                                    return next;
                                });
                            }

                            setFocusedPath(newPath);
                            await loadRootDirectory();
                            toast.success(`Created file "${name}"`);
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

                            const parentPath = targetNode.type === 'directory'
                                ? targetNode.path
                                : undefined;
                            if (parentPath) {
                                setExpandedPaths((prev) => {
                                    const next = new Set(prev);
                                    next.add(parentPath);
                                    getAncestorPaths(parentPath).forEach((p) => next.add(p));
                                    return next;
                                });
                            }

                            await loadRootDirectory();
                            toast.success(`Created folder "${name}"`);
                        }
                        break;
                    }
                    case 'rename': {
                        setOperationDialog({
                            open: true,
                            operation: 'rename',
                            currentName: targetNode.name,
                        });
                        break;
                    }
                    case 'duplicate': {
                        setOperationDialog({
                            open: true,
                            operation: 'duplicate',
                            currentName: targetNode.name,
                        });
                        break;
                    }
                    case 'delete': {
                        setConfirmDialog({
                            open: true,
                            itemName: targetNode.name,
                            isDirectory: targetNode.type === 'directory',
                        });
                        break;
                    }
                    case 'download': {
                        await downloadFile(directoryHandle, targetNode.path);
                        toast.success(`Downloaded "${targetNode.name}"`);
                        break;
                    }
                    case 'copy-path': {
                        await copyPathToClipboard(targetNode.path, false);
                        toast.success('Copied path to clipboard');
                        break;
                    }
                    case 'copy-absolute-path': {
                        await copyPathToClipboard(targetNode.path, true);
                        toast.success('Copied absolute path to clipboard');
                        break;
                    }
                    case 'reveal-in-finder': {
                        await revealInFileManager(targetNode.path);
                        toast.info('File path copied (reveal not available in browser)');
                        break;
                    }
                    case 'duplicate-with-references': {
                        // Placeholder for advanced duplicate with reference updates
                        toast.info('Duplicate with references - coming soon');
                        break;
                    }
                    case 'run-script': {
                        // Placeholder for script execution
                        toast.info('Run script - coming soon');
                        break;
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Failed to ${action}: ${errorMessage}`);
            }
        },
        [contextMenu.targetNode, directoryHandle, getAdapter, loadRootDirectory, setExpandedPaths, setFocusedPath],
    );

    return {
        handleContextMenu,
        closeContextMenu,
        handleContextMenuAction,
        operationDialog,
        closeOperationDialog,
        handleOperationConfirm,
        confirmDialog,
        closeConfirmDialog,
        handleDeleteConfirm,
    };
}
