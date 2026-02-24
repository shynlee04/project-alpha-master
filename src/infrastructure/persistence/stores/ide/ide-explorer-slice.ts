/**
 * @fileoverview IDE Explorer Slice
 * @module infrastructure/persistence/stores/ide/ide-explorer-slice
 * @governance EPIC-CP-1
 *
 * Manages file tree expanded state:
 * - expandedPaths: Set of folder paths that are expanded
 * - toggleExpanded: Toggle a folder's expansion state
 * - setExpandedPaths: Batch set expanded folders
 * - isExpanded: Check if a folder is expanded
 *
 * Uses Set<string> for O(1) lookup performance.
 * Converts to/from Array for JSON serialization (in persist middleware).
 */

import { StateCreator } from 'zustand';
import type { IDEExplorerState } from './ide-types';

export const createIDEExplorerSlice: StateCreator<IDEExplorerState> = (set, get) => ({
  // =========================================================================
  // State Initialization
  // =========================================================================

  expandedPaths: new Set<string>(),

  // =========================================================================
  // Actions
  // =========================================================================

  /**
   * Toggle a folder's expanded state
   *
   * @param path - Folder path to toggle
   *
   * @example
   * toggleExpanded('/project/src')
   */
  toggleExpanded: (path: string) => {
    const { expandedPaths } = get();
    const next = new Set(expandedPaths);

    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }

    set({ expandedPaths: next });
  },

  /**
   * Set multiple folders as expanded (batch operation)
   *
   * @param paths - Array of folder paths to expand
   *
   * @example
   * setExpandedPaths(['/project/src', '/project/lib'])
   */
  setExpandedPaths: (paths: string[]) => {
    set({ expandedPaths: new Set(paths) });
  },

  /**
   * Check if a folder is expanded
   *
   * @param path - Folder path to check
   * @returns true if folder is expanded, false otherwise
   *
   * @example
   * if (isExpanded('/project/src')) {
   *   // Folder is expanded
   * }
   */
  isExpanded: (path: string) => {
    return get().expandedPaths.has(path);
  },
});
