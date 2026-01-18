/**
 * @fileoverview IDE File Handlers Hook
 * @module components/layout/hooks/useIDEFileHandlers
 *
 * **CC-IDE-03**: Manages file operations using StorageGateway
 *
 * Manages file operations in the IDE: select, save, close, content change.
 * Extracted from IDELayout.tsx for code organization.
 */

import { useCallback } from 'react';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';
import type { OpenFile } from '../../ide/MonacoEditor';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import { useDeviceType } from '@/hooks/useMediaQuery';

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
  gatewayRef: React.RefObject<StorageGateway | null>;
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
 * **CC-IDE-03**: Manages file operations using StorageGateway
 *
 * Provides handlers for:
 * - File selection from FileTree (via StorageGateway)
 * - File saving (via StorageGateway)
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
    gatewayRef,
    eventBus,
    toast,
}: UseIDEFileHandlersOptions): UseIDEFileHandlersResult {
    // Call hook at top level (React rules compliance)
    const { isMobile, isTablet } = useDeviceType();

    const handleFileSelect = useCallback(
        async (path: string, _handle: FileSystemFileHandle) => {
            setSelectedFilePath(path);
            console.log('[IDE] File selected:', path);

            const existingFile = openFiles.find((f) => f.path === path);
            if (existingFile) {
                setActiveFilePath(path);
                return;
            }

            // CC-IDE-03: Read file via StorageGateway
            const gateway = gatewayRef.current;
            if (!gateway) {
                console.warn('[IDE] File gateway not available');
                return;
            }

            try {
                // Read file as Uint8Array, decode to string
                const data = await gateway.read(path);
                const content = new TextDecoder().decode(data);
                console.log('[IDE] File read via gateway:', path, { size: data.length });

                // Update Zustand store and local cache
                addOpenFile(path);
                setFileContentCache((prev) => new Map(prev).set(path, content));
                setActiveFilePath(path);
            } catch (error) {
                console.error('[IDE] Failed to read file:', path, error);
            }
        },
        [openFiles, addOpenFile, setActiveFilePath, setSelectedFilePath, setFileContentCache, gatewayRef],
    );

    const handleSave = useCallback(
        async (path: string, content: string) => {
            console.log('[IDE] Saving file:', path);

            // CC-IDE-03: Save file via StorageGateway
            const gateway = gatewayRef.current;
            if (!gateway) {
                console.warn('[IDE] File gateway not available');
                toast('No project folder open - save skipped', 'warning');
                return;
            }

            try {
                // Encode string to Uint8Array for gateway.write()
                const encoder = new TextEncoder();
                const uint8Data = encoder.encode(content);

                // Write via gateway
                await gateway.write(path, uint8Data);
                setFileContentCache((prev) => new Map(prev).set(path, content));
                setFileTreeRefreshKey((prev) => prev + 1);

                console.log('[IDE] File saved via gateway:', path, { size: uint8Data.length });

                // CC-IDE-03: Show success toast
                toast('File saved successfully', 'success');
            } catch (error) {
                console.error('[IDE] Failed to save file:', path, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast(`Failed to save ${path.split('/').pop()}: ${errorMessage}`, 'error');
            }
        },
        [gatewayRef, setFileTreeRefreshKey, setFileContentCache, toast],
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
