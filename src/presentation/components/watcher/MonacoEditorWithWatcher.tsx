/**
 * @fileoverview Monaco Editor with File Watcher Integration
 * @module presentation/components/watcher/MonacoEditorWithWatcher
 *
 * Wraps MonacoEditor with file watching capabilities.
 * Handles external file changes and conflict resolution.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 */

import { useEffect, useCallback } from 'react';
import { MonacoEditor } from '@/presentation/components/ide/MonacoEditor/MonacoEditor';
import type { OpenFile } from '@/presentation/components/ide/MonacoEditor/EditorTabBar';
import { useFileWatcher } from '@/hooks/useFileWatcher';
import { FileChangeDialog } from './FileChangeDialog';
import { useStopWatchingAllFiles } from '@/hooks/useFileWatcher';
import { getChangeDetector } from '@/lib/watcher/change-detector';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';

export interface MonacoEditorWithWatcherProps {
  /** Currently open files */
  openFiles: OpenFile[];
  /** Active file path */
  activeFilePath: string | null;
  /** Save callback */
  onSave?: (path: string, content: string) => void;
  /** Active file change callback */
  onActiveFileChange?: (path: string) => void;
  /** Tab close callback */
  onTabClose?: (path: string) => void;
  /** Content change callback */
  onContentChange?: (path: string, content: string) => void;
  /** Initial scroll position */
  initialScrollTop?: number;
  /** Scroll position change callback */
  onScrollTopChange?: (path: string, scrollTop: number) => void;
  /** Current file users */
  currentFileUsers?: Array<{ userId: string; userName: string; cursorLine?: number }>;
  /** Diff mode */
  diffMode?: boolean;
  /** Original content for diff */
  originalContent?: string;
  /** Diff view mode */
  diffViewMode?: 'unified' | 'side-by-side' | 'line-by-line';
  /** Diff mode toggle callback */
  onDiffModeToggle?: (enabled: boolean) => void;
  /** External reload callback (called when file is reloaded from disk) */
  onExternalReload?: (path: string) => Promise<string>;
}

/**
 * Monaco Editor with File Watcher
 *
 * Adds automatic file watching and external change detection
 * to the Monaco Editor component.
 */
export function MonacoEditorWithWatcher({
  openFiles,
  activeFilePath,
  onSave,
  onActiveFileChange,
  onTabClose,
  onContentChange,
  initialScrollTop,
  onScrollTopChange,
  currentFileUsers = [],
  diffMode = false,
  originalContent = '',
  diffViewMode = 'unified',
  onDiffModeToggle,
  onExternalReload
}: MonacoEditorWithWatcherProps): React.JSX.Element {
  // Get active file
  const activeFile = openFiles.find(f => f.path === activeFilePath);

  // File watcher for active file
  const {
    checkForChanges: _checkForChanges,
    markUnsavedChanges
  } = useFileWatcher({
    path: activeFilePath || '',
    contentType: 'code',
    content: activeFile?.content,
    onExternalChange: handleExternalChange
  });

  // Stop watching when component unmounts
  const stopWatchingAll = useStopWatchingAllFiles();

  // Sync status for workspace awareness
  const { syncStatus: _syncStatus } = useWorkspaceSync();

  // Track external changes - TODO: Remove if store-based approach is fully adopted
  // const [externalChangePath, setExternalChangePath] = useState<string | null>(null);
  // const [pendingNewContent, setPendingNewContent] = useState<string | null>(null);

  /**
   * Handle external file change
   */
  async function handleExternalChange(event: { path: string }): Promise<void> {
    if (!event.path) return;

    // If auto-reload is enabled and no unsaved changes
    if (!activeFile?.isDirty) {
      await handleReload(event.path);
    } else {
      // Show dialog for conflict resolution
      // setExternalChangePath(event.path); // Now handled by store
    }
  }

  /**
   * Handle reload from disk
   */
  const handleReload = useCallback(async (path: string) => {
    if (!onExternalReload) {
      console.warn('[MonacoEditorWithWatcher] No onExternalReload callback provided');
      // setExternalChangePath(null); // Now handled by store
      return;
    }

    try {
      // Get new content from external source
      const newContent = await onExternalReload(path);

      // Update change detector
      const detector = getChangeDetector();
      await detector.updateSavedHash(path, newContent);

      // Trigger save to update editor content
      onSave?.(path, newContent);

      console.log('[MonacoEditorWithWatcher] Reloaded from disk:', path);
    } catch (error) {
      console.error('[MonacoEditorWithWatcher] Failed to reload:', path, error);
    } finally {
      // setExternalChangePath(null); // Now handled by store
      // setPendingNewContent(null); // Now handled by store
    }
  }, [onExternalReload, onSave]);

  /**
   * Handle overwrite (keep local changes, discard external)
   */
  const handleOverwrite = useCallback((path: string) => {
    if (!activeFile) return;

    // Update detector with local content
    const detector = getChangeDetector();
    detector.updateSavedHash(path, activeFile.content);

    // Save local content
    onSave?.(path, activeFile.content);

    console.log('[MonacoEditorWithWatcher] Overwrote external changes:', path);
    // setExternalChangePath(null); // Now handled by store
    // setPendingNewContent(null); // Now handled by store
  }, [activeFile, onSave]);

  /**
   * Handle ignore (dismiss dialog, take no action)
   */
  const handleIgnore = useCallback((path: string) => {
    console.log('[MonacoEditorWithWatcher] Ignored external changes:', path);
    // setExternalChangePath(null); // Now handled by store
    // setPendingNewContent(null); // Now handled by store
  }, []);

  /**
   * Track unsaved changes
   */
  useEffect(() => {
    if (activeFile) {
      markUnsavedChanges(activeFile.isDirty);
    }
  }, [activeFile?.isDirty, markUnsavedChanges]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopWatchingAll();
    };
  }, [stopWatchingAll]);

  return (
    <>
      <MonacoEditor
        openFiles={openFiles}
        activeFilePath={activeFilePath}
        onSave={onSave}
        onActiveFileChange={onActiveFileChange}
        onTabClose={onTabClose}
        onContentChange={onContentChange}
        initialScrollTop={initialScrollTop}
        onScrollTopChange={onScrollTopChange}
        currentFileUsers={currentFileUsers}
        diffMode={diffMode}
        originalContent={originalContent}
        diffViewMode={diffViewMode}
        onDiffModeToggle={onDiffModeToggle}
      />

      <FileChangeDialog
        onReload={handleReload}
        onOverwrite={handleOverwrite}
        onIgnore={handleIgnore}
      />
    </>
  );
}
