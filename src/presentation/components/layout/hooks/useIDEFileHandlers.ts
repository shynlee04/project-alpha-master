/**
 * @fileoverview IDE File Handlers Hook
 * @module components/layout/hooks/useIDEFileHandlers
 *
 * Manages file operations in the IDE: select, save, close, content change.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useCallback } from 'react';
import type { SyncManager } from '@/infrastructure/sync';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';
import type { OpenFile } from '../../ide/MonacoEditor';
import type { LocalFSAdapter } from '@/infrastructure/filesystem';
import type { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { showMobileWorkspaceError } from '@/lib/utils/mobile-error-handling';

interface UseIDEFileHandlersOptions {
  openFiles: OpenFile[];
  openFilePaths: string[];
  activeFilePath: string | null;
  setActiveFilePath: (path: string | null) => void;
  addOpenFile: (path: string) => void;
  removeOpenFile: (path: string) => void;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFileTreeRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setFileContentCache: React.Dispatch<React.SetStateAction<Map<string, string>>>;
  syncManagerRef: React.RefObject<SyncManager | null>;
  localAdapterRef: React.RefObject<LocalFSAdapter | UnifiedStorageAdapter | null>;
  eventBus: WorkspaceEventEmitter;
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
    localAdapterRef,
    eventBus,
    toast,
}: UseIDEFileHandlersOptions): UseIDEFileHandlersResult {
    // Call hook at top level (React rules compliance)
    const { isMobile, isTablet } = useDeviceType();

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
                // Try syncManager first (preferred path)
                if (syncManagerRef.current) {
                    await syncManagerRef.current.writeFile(path, content);
                    setFileContentCache((prev) => new Map(prev).set(path, content));
                    console.log('[IDE] File saved via SyncManager:', path);
                    setFileTreeRefreshKey((prev) => prev + 1);
                    return;
                }

                // Fallback: Try to use localAdapterRef directly
                if (localAdapterRef.current) {
                    // UnifiedStorageAdapter takes string, LocalFSAdapter takes Uint8Array
                    if ('readFile' in localAdapterRef.current && typeof localAdapterRef.current.readFile === 'function') {
                        // Check which type of adapter we have
                        const adapter = localAdapterRef.current;
                        if ('writeFile' in adapter) {
                            const writeFile = adapter.writeFile as (path: string, content: string | Uint8Array) => Promise<void>;
                            await writeFile(path, content);
                            setFileContentCache((prev) => new Map(prev).set(path, content));
                            console.log('[IDE] File saved via localAdapter:', path);
                            setFileTreeRefreshKey((prev) => prev + 1);
                            return;
                        }
                    }
                }

                // Mobile users get specific error message
                if (isMobile || isTablet) {
                    showMobileWorkspaceError('openFailed');
                    return;
                }
                console.warn('[IDE] No storage available for save');
                toast('No project folder open - save skipped', 'warning');
            } catch (error) {
                console.error('[IDE] Failed to save file:', path, error);
                // Mobile users get specific error message
                if (isMobile || isTablet) {
                    showMobileWorkspaceError('openFailed');
                    return;
                }
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast(`Failed to save ${path.split('/').pop()}: ${errorMessage}`, 'error');
            }
        },
        [syncManagerRef, localAdapterRef, isMobile, isTablet, setFileTreeRefreshKey, setFileContentCache, toast],
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
