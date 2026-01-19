/**
 * @fileoverview IDE Editor Slice
 * @module infrastructure/persistence/stores/ide/ide-editor-slice
 * @governance EPIC-CP-1
 *
 * Manages Monaco editor file state:
 * - Open files (editor tabs)
 * - Active file (currently focused)
 * - Scroll position (for restoration after navigation)
 *
 * Follows VSCode's "text editor" pattern:
 * - Model: File content (managed by Monaco internally)
 * - View: Open files, active file, scroll position (in store)
 * - Controller: Actions to manipulate view
 */

import { StateCreator } from 'zustand';
import type { IDEEditorState } from './ide-types';

export const createIDEEditorSlice: StateCreator<IDEEditorState> = (set, get) => ({
  // =========================================================================
  // State Initialization
  // =========================================================================

  openFiles: [],
  activeFile: null,
  activeFileScrollTop: 0,

  // =========================================================================
  // Actions
  // =========================================================================

  /**
   * Add a file to open files list
   * Auto-activates the file if not already open
   *
   * @param path - File path to add
   *
   * @example
   * addOpenFile('/project/src/index.ts')
   */
  addOpenFile: (path: string) => {
    const { openFiles } = get();

    if (!openFiles.includes(path)) {
      // File not open, add to list and activate
      set({
        openFiles: [...openFiles, path],
        activeFile: path,
      });
    } else {
      // File already open, just activate it
      set({ activeFile: path });
    }
  },

  /**
   * Remove a file from open files list
   * Activates the last file if closing the active file
   *
   * @param path - File path to remove
   *
   * @example
   * removeOpenFile('/project/src/index.ts')
   */
  removeOpenFile: (path: string) => {
    const { openFiles, activeFile } = get();
    const newOpenFiles = openFiles.filter((f) => f !== path);

    // If closing active file, activate the last file or null
    const newActiveFile =
      activeFile === path ? (newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null) : activeFile;

    set({
      openFiles: newOpenFiles,
      activeFile: newActiveFile,
    });
  },

  /**
   * Set the active file
   *
   * @param path - File path to activate (null to clear)
   *
   * @example
   * setActiveFile('/project/src/index.ts')
   */
  setActiveFile: (path: string | null) => {
    set({ activeFile: path });
  },

  /**
   * Set scroll position of active file
   * Used for restoring scroll position after navigation
   *
   * @param scrollTop - Scroll position in pixels
   *
   * @example
   * setActiveFileScrollTop(250)
   */
  setActiveFileScrollTop: (scrollTop: number) => {
    set({ activeFileScrollTop: scrollTop });
  },
});
