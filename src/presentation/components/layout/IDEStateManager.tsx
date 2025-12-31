/**
 * IDEStateManager Hook
 * Centralizes IDE state management and file operations
 * Max 120 lines
 */

import { useState, useRef, useCallback } from 'react';
import { useIDEStore } from '@/lib/state';
import type { OpenFile } from '../ide/MonacoEditor';

interface UseIDEStateManagerResult {
  // Zustand state (persisted)
  chatVisible: boolean;
  setChatVisible: (visible: boolean) => void;
  terminalTab: string;
  setTerminalTab: (tab: string) => void;
  openFilePaths: string[];
  activeFilePath: string | undefined;
  setActiveFilePath: (path: string | undefined) => void;
  addOpenFile: (file: OpenFile) => void;
  removeOpenFile: (path: string) => void;

  // Local state (ephemeral)
  selectedFilePath: string | undefined;
  setSelectedFilePath: (path: string | undefined) => void;
  fileTreeRefreshKey: number;
  setFileTreeRefreshKey: (key: number) => void;
  activeFileScrollTop: number;
  activeFileScrollTopRef: React.RefObject<number>;

  // Computed
  openFiles: OpenFile[];
}

export function useIDEStateManager(): UseIDEStateManagerResult {
  // Zustand state (persisted to IndexedDB)
  const chatVisible = useIDEStore((s) => s.chatVisible);
  const setChatVisible = useIDEStore((s) => s.setChatVisible);
  const terminalTab = useIDEStore((s) => s.terminalTab);
  const setTerminalTab = useIDEStore((s) => s.setTerminalTab);
  const openFilePaths = useIDEStore((s) => s.openFiles);
  const activeFilePath = useIDEStore((s) => s.activeFile);
  const setActiveFilePath = useIDEStore((s) => s.setActiveFile);
  const addOpenFile = useIDEStore((s) => s.addOpenFile);
  const removeOpenFile = useIDEStore((s) => s.removeOpenFile);

  // Local state (ephemeral, not persisted)
  const [selectedFilePath, setSelectedFilePath] = useState<string | undefined>();
  const [fileTreeRefreshKey, setFileTreeRefreshKey] = useState(0);

  // Scroll tracking
  const activeFileScrollTopRef = useRef<number>(0);
  const [activeFileScrollTop, setActiveFileScrollTop] = useState(0);

  // Computed open files from store
  const openFiles = useIDEStore((s) => s.openFilesData);

  // File operations
  const handleTabClose = useCallback((path: string) => {
    removeOpenFile(path);
    if (activeFilePath === path) {
      const index = openFilePaths.indexOf(path);
      const newActiveFile = index > 0 ? openFilePaths[index - 1] : undefined;
      setActiveFilePath(newActiveFile);
    }
  }, [activeFilePath, openFilePaths, removeOpenFile, setActiveFilePath]);

  const handleContentChange = useCallback((path: string, content: string) => {
    addOpenFile({ path, content, modified: true });
  }, [addOpenFile]);

  const handleScrollTopChange = useCallback((path: string, scrollTop: number) => {
    if (path === activeFilePath) {
      activeFileScrollTopRef.current = scrollTop;
      setActiveFileScrollTop(scrollTop);
    }
  }, [activeFilePath]);

  return {
    // Persisted state
    chatVisible,
    setChatVisible,
    terminalTab,
    setTerminalTab,
    openFilePaths,
    activeFilePath,
    setActiveFilePath,
    addOpenFile,
    removeOpenFile,

    // Ephemeral state
    selectedFilePath,
    setSelectedFilePath,
    fileTreeRefreshKey,
    setFileTreeRefreshKey,
    activeFileScrollTop,
    activeFileScrollTopRef,

    // Computed
    openFiles,

    // File operations (exposed for use by parent)
    // @ts-ignore - these are used by parent component
    handleTabClose,
    handleContentChange,
    handleScrollTopChange
  } as UseIDEStateManagerResult;
}
