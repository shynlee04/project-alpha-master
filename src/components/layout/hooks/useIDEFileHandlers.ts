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
    /** Open file paths from Zustand */
    openFilePaths: string[];
    /** Currently active file path */
    activeFilePath: string | null;
    /** Setter for active file path */
    setActiveFilePath: (path: string | null) => void;
    /** Add file to open files */
    addOpenFile: (path: string) => void;
    /** Remove file from open files */
    removeOpenFile: (path: string) => void;
    /** Setter for selected file path (FileTree highlight) */
    setSelectedFilePath: React.Dispatch<React.SetStateAction<string | undefined>>;
    /** Setter for file tree refresh key */
    setFileTreeRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    /** Setter for file content cache */
    setFileContentCache: React.Dispatch<React.SetStateAction<Map<string, string>>>;
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
    openFilePaths,
    activeFilePath,
    setActiveFilePath,
    addOpenFile,
    removeOpenFile,
    setSelectedFilePath,
    setFileTreeRefreshKey,
    setFileContentCache,
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
                // Update Zustand store and local cache
                addOpenFile(path);
                setFileContentCache((prev) => new Map(prev).set(path, content));
                setActiveFilePath(path);
            } catch (error) {
                console.error('[IDE] Failed to read file:', path, error);
            }
        },
        [openFiles, addOpenFile, setActiveFilePath, setSelectedFilePath, setFileContentCache],
    );

    const handleSave = useCallback(
        async (path: string, content: string) => {
            console.log('[IDE] Saving file:', path);
            try {
                if (syncManagerRef.current) {
                    await syncManagerRef.current.writeFile(path, content);
                    // Update local content cache
                    setFileContentCache((prev) => new Map(prev).set(path, content));
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
        [syncManagerRef, setFileTreeRefreshKey, setFileContentCache, toast],
    );

    const handleContentChange = useCallback(
        (path: string, content: string) => {
            // Update local content cache
            setFileContentCache((prev) => new Map(prev).set(path, content));
            eventBus.emit('file:modified', { path, source: 'editor', content });
        },
        [setFileContentCache, eventBus],
    );

    const handleTabClose = useCallback(
        (path: string) => {
            removeOpenFile(path);
            if (activeFilePath === path) {
                // Find the last open file after removing current
                const remainingFiles = openFilePaths.filter((p) => p !== path);
                setActiveFilePath(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
            }
        },
        [activeFilePath, openFilePaths, removeOpenFile, setActiveFilePath],
    );

    return {
        handleFileSelect,
        handleSave,
        handleContentChange,
        handleTabClose,
    };
}
