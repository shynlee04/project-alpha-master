/**
 * IDE Layout File State Hook
 *
 * Manages file-related state and operations.
 *
 * @layer Presentation
 * @hook useIDELayoutFileState
 */

import { useState, useMemo } from 'react';
import { useIDEStore } from '@/lib/state';
import type { OpenFile } from '../../ide/Monaco';

interface UseIDELayoutFileStateResult {
    openFilePaths: string[];
    activeFilePath: string | undefined;
    setActiveFilePath: (path: string) => void;
    addOpenFile: (path: string) => void;
    removeOpenFile: (path: string) => void;
    selectedFilePath: string | undefined;
    setSelectedFilePath: (path: string | undefined) => void;
    fileTreeRefreshKey: number;
    setFileTreeRefreshKey: (key: number | ((prev: number) => number)) => void;
    fileContentCache: Map<string, string>;
    setFileContentCache: React.Dispatch<React.SetStateAction<Map<string, string>>>;
    openFiles: OpenFile[];
    setOpenFiles: (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => void;
}

/**
 * Hook to manage IDE layout file state
 */
export function useIDELayoutFileState(): UseIDELayoutFileStateResult {
    // Zustand state (persisted to IndexedDB)
    const openFilePaths = useIDEStore((s) => s.openFiles);
    const activeFilePath = useIDEStore((s) => s.activeFile);
    const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
    const addOpenFile = useIDEStore((s) => s.addOpenFile);
    const removeOpenFile = useIDEStore((s) => s.removeOpenFile);

    // Local state (ephemeral, not persisted)
    const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
    const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);

    // Local file content cache (ephemeral, not persisted)
    const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map());

    // Derive OpenFile[] from Zustand state + local cache
    const openFiles = useMemo<OpenFile[]>(() => {
        return openFilePaths.map((path) => ({
            path,
            content: fileContentCache.get(path) || '',
            isDirty: false,
        }));
    }, [openFilePaths, fileContentCache]);

    // Callback to update open files from hooks that need to modify file content
    const setOpenFiles = (filesOrUpdater: OpenFile[] | ((prev: OpenFile[]) => OpenFile[])) => {
        const newFiles = typeof filesOrUpdater === 'function'
            ? filesOrUpdater(openFiles)
            : filesOrUpdater;

        // Update the file content cache
        setFileContentCache(new Map(newFiles.map((f) => [f.path, f.content] as [string, string])));

        // Sync paths with Zustand if they changed
        const newPaths = newFiles.map(f => f.path);
        const currentPathsStr = openFilePaths.join('\0');
        const newPathsStr = newPaths.join('\0');
        if (currentPathsStr !== newPathsStr) {
            // Add new paths and remove old ones
            newPaths.forEach(path => {
                if (!openFilePaths.includes(path)) {
                    addOpenFile(path);
                }
            });
            openFilePaths.forEach(path => {
                if (!newPaths.includes(path)) {
                    removeOpenFile(path);
                }
            });
        }
    };

    return {
        openFilePaths,
        activeFilePath,
        setActiveFilePath,
        addOpenFile,
        removeOpenFile,
        selectedFilePath,
        setSelectedFilePath,
        fileTreeRefreshKey,
        setFileTreeRefreshKey,
        fileContentCache,
        setFileContentCache,
        openFiles,
        setOpenFiles
    };
}
