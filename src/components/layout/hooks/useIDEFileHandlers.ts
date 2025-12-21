/**
 * @fileoverview IDE File Handlers Hook
 * @module components/layout/hooks/useIDEFileHandlers
 *
 * Manages file operations in the IDE: select, save, close, content change.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useCallback } from 'react';
import type { SyncManager } from '../../../lib/filesystem/sync-manager';
import type { WorkspaceEventBus } from '../../../lib/events';
import type { OpenFile } from '../../ide/MonacoEditor';

interface UseIDEFileHandlersOptions {
    /** Current open files */
    openFiles: OpenFile[];
    /** Setter for open files state */
    setOpenFiles: React.Dispatch<React.SetStateAction<OpenFile[]>>;
    /** Currently active file path */
    activeFilePath: string | null;
    /** Setter for active file path */
    setActiveFilePath: React.Dispatch<React.SetStateAction<string | null>>;
    /** Setter for selected file path (FileTree highlight) */
    setSelectedFilePath: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Setter for file tree refresh key */
    setFileTreeRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    /** Reference to sync manager */
    syncManagerRef: React.RefObject<SyncManager | null>;
    /** Event bus for file events */
    eventBus: WorkspaceEventBus;
    /** Toast notification function */
    toast: (message: string, type?: 'success' | 'warning' | 'error') => void;
}

interface UseIDEFileHandlersResult {
    /** Handle file selection from FileTree */
    handleFileSelect: (path: string, handle: FileSystemFileHandle) => Promise<void>;
    /** Handle file save */
    handleSave: (path: string, content: string) => Promise<void>;
    /** Handle content change in editor */
    handleContentChange: (path: string, content: string) => void;
    /** Handle tab close */
    handleTabClose: (path: string) => void;
}

/**
 * Hook to manage IDE file operations.
 *
 * Provides handlers for:
 * - File selection from FileTree
 * - File saving (via SyncManager)
 * - Content changes (marks dirty, emits event)
 * - Tab closing
 */
export function useIDEFileHandlers({
    openFiles,
    setOpenFiles,
    activeFilePath,
    setActiveFilePath,
    setSelectedFilePath,
    setFileTreeRefreshKey,
    syncManagerRef,
    eventBus,
    toast,
}: UseIDEFileHandlersOptions): UseIDEFileHandlersResult {
    const handleFileSelect = useCallback(
        async (path: string, handle: FileSystemFileHandle) => {
            setSelectedFilePath(path);
            console.log('[IDE] File selected:', path);

            const existingFile = openFiles.find((f) => f.path === path);
            if (existingFile) {
                setActiveFilePath(path);
                return;
            }

            try {
                const file = await handle.getFile();
                const content = await file.text();
                setOpenFiles((prev) => [...prev, { path, content, isDirty: false }]);
                setActiveFilePath(path);
            } catch (error) {
                console.error('[IDE] Failed to read file:', path, error);
            }
        },
        [openFiles, setOpenFiles, setActiveFilePath, setSelectedFilePath],
    );

    const handleSave = useCallback(
        async (path: string, content: string) => {
            console.log('[IDE] Saving file:', path);
            try {
                if (syncManagerRef.current) {
                    await syncManagerRef.current.writeFile(path, content);
                    setOpenFiles((prev) =>
                        prev.map((f) =>
                            f.path === path ? { ...f, content, isDirty: false } : f,
                        ),
                    );
                    console.log('[IDE] File saved successfully:', path);
                    setFileTreeRefreshKey((prev) => prev + 1);
                } else {
                    console.warn('[IDE] No SyncManager available for save');
                    toast('No project folder open - save skipped', 'warning');
                }
            } catch (error) {
                console.error('[IDE] Failed to save file:', path, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast(`Failed to save ${path.split('/').pop()}: ${errorMessage}`, 'error');
            }
        },
        [syncManagerRef, setOpenFiles, setFileTreeRefreshKey, toast],
    );

    const handleContentChange = useCallback(
        (path: string, content: string) => {
            setOpenFiles((prev) =>
                prev.map((f) =>
                    f.path === path ? { ...f, content, isDirty: true } : f,
                ),
            );
            eventBus.emit('file:modified', { path, source: 'editor', content });
        },
        [setOpenFiles, eventBus],
    );

    const handleTabClose = useCallback(
        (path: string) => {
            setOpenFiles((prev) => prev.filter((f) => f.path !== path));
            if (activeFilePath === path) {
                setActiveFilePath(openFiles.find((f) => f.path !== path)?.path ?? null);
            }
        },
        [activeFilePath, openFiles, setOpenFiles, setActiveFilePath],
    );

    return {
        handleFileSelect,
        handleSave,
        handleContentChange,
        handleTabClose,
    };
}
