/**
 * Editor Tabs Position Slice
 *
 * Manages tab scroll/cursor position tracking, reordering, and pinning.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/editor-tabs/editor-tabs-position-slice
 * @story S-030 - Multi-Tab File Editor
 */

import type { StateCreator } from 'zustand';
import type { EditorTabsCrudState } from './editor-tabs-crud-slice';

/**
 * Editor Tabs Position State (empty, uses computed methods)
 */
export interface EditorTabsPositionState {}

/**
 * Editor Tabs Position Actions
 */
export interface EditorTabsPositionActions {
  /** Pin/unpin tab */
  togglePinTab: (path: string) => void;

  /** Reorder tabs (drag-drop) */
  reorderTabs: (fromPath: string, toPath: string) => void;

  /** Update scroll position for tab */
  updateScrollPosition: (path: string, scrollTop: number) => void;

  /** Update cursor position for tab */
  updateCursorPosition: (path: string, position: { lineNumber: number; column: number }) => void;
}

/**
 * Editor Tabs Position Slice Creator
 */
export const createEditorTabsPositionSlice: StateCreator<
  EditorTabsCrudState & EditorTabsPositionState & EditorTabsPositionActions,
  [],
  [],
  EditorTabsPositionState & EditorTabsPositionActions
> = (set) => ({
  togglePinTab: (path: string) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.path === path
          ? { ...t, isPinned: !t.isPinned }
          : t
      ),
    }));
  },

  reorderTabs: (fromPath: string, toPath: string) => {
    set(state => {
      const tabs = [...state.tabs];
      const fromIndex = tabs.findIndex(t => t.path === fromPath);
      const toIndex = tabs.findIndex(t => t.path === toPath);

      if (fromIndex === -1 || toIndex === -1) return state;

      // Remove from old position
      const [movedTab] = tabs.splice(fromIndex, 1);
      // Insert at new position
      tabs.splice(toIndex, 0, movedTab);

      // Update order values
      return {
        tabs: tabs.map((tab, index) => ({ ...tab, order: index })),
      };
    });
  },

  updateScrollPosition: (path: string, scrollTop: number) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.path === path
          ? { ...t, scrollTop }
          : t
      ),
    }));
  },

  updateCursorPosition: (path: string, position: { lineNumber: number; column: number }) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.path === path
          ? { ...t, cursorPosition: position }
          : t
      ),
    }));
  },
});
