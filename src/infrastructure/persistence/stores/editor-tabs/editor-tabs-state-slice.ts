/**
 * Editor Tabs State Slice
 *
 * Manages tab content updates, dirty flag tracking, and save operations.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/editor-tabs/editor-tabs-state-slice
 * @story S-030 - Multi-Tab File Editor
 */

import type { StateCreator } from 'zustand';
import type { EditorTab } from '../editor-tabs-store';
import type { EditorTabsCrudState } from './editor-tabs-crud-slice';

/**
 * Editor Tabs Content State (empty, uses computed methods)
 */
export interface EditorTabsContentState {}

/**
 * Editor Tabs Content Actions
 */
export interface EditorTabsContentActions {
  /** Update tab content and dirty state */
  updateTabContent: (path: string, content: string, isDirty?: boolean) => void;

  /** Save tab content (clears dirty flag) */
  saveTab: (path: string, content: string) => void;

  /** Get dirty tabs count */
  getDirtyTabsCount: () => number;
}

/**
 * Editor Tabs Content Slice Creator
 */
export const createEditorTabsContentSlice: StateCreator<
  EditorTabsCrudState & EditorTabsContentState & EditorTabsContentActions,
  [],
  [],
  EditorTabsContentState & EditorTabsContentActions
> = (set, get) => ({
  updateTabContent: (path: string, content: string, isDirty: boolean = true) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.path === path
          ? { ...t, content, isDirty }
          : t
      ),
    }));
  },

  saveTab: (path: string, content: string) => {
    set(state => ({
      tabs: state.tabs.map(t =>
        t.path === path
          ? { ...t, content, isDirty: false }
          : t
      ),
    }));
  },

  getDirtyTabsCount: () => {
    return get().tabs.filter(t => t.isDirty).length;
  },
});
