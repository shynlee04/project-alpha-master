/**
 * Editor Tabs CRUD Slice
 *
 * Manages tab creation, deletion, and switching operations.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/editor-tabs/editor-tabs-crud-slice
 * @story S-030 - Multi-Tab File Editor
 */

import type { StateCreator } from 'zustand';
import type { EditorTab } from '../editor-tabs-store';

/**
 * Editor Tabs CRUD State
 */
export interface EditorTabsCrudState {
  /** All open tabs */
  tabs: EditorTab[];

  /** Currently active tab path */
  activeTabPath: string | null;

  /** Maximum tabs before showing scroll (default: 10) */
  maxVisibleTabs: number;
}

/**
 * Editor Tabs CRUD Actions
 */
export interface EditorTabsCrudActions {
  /** Add a new tab (or focus if exists) */
  openTab: (path: string, content: string) => void;

  /** Close a tab (warns if dirty) */
  closeTab: (path: string, force?: boolean) => void;

  /** Close all tabs */
  closeAllTabs: () => void;

  /** Close other tabs (keep only specified) */
  closeOtherTabs: (path: string) => void;

  /** Close all saved (non-dirty) tabs */
  closeSavedTabs: () => void;

  /** Switch active tab */
  switchTab: (path: string) => void;

  /** Get tab by path */
  getTab: (path: string) => EditorTab | undefined;
}

/**
 * Initial CRUD state
 */
const MAX_VISIBLE_TABS_DEFAULT = 10;
const initialCrudState: EditorTabsCrudState = {
  tabs: [],
  activeTabPath: null,
  maxVisibleTabs: MAX_VISIBLE_TABS_DEFAULT,
};

/**
 * Editor Tabs CRUD Slice Creator
 */
export const createEditorTabsCrudSlice: StateCreator<
  EditorTabsCrudState & EditorTabsCrudActions,
  [],
  [],
  EditorTabsCrudState & EditorTabsCrudActions
> = (set, get) => ({
  ...initialCrudState,

  openTab: (path: string, content: string) => {
    const existingTab = get().tabs.find(t => t.path === path);

    if (existingTab) {
      // Tab already open, just switch to it
      set({ activeTabPath: path });
      return;
    }

    // Add new tab at the end
    const newTab: EditorTab = {
      path,
      content,
      isDirty: false,
      order: get().tabs.length,
      isPinned: false,
    };

    set(state => ({
      tabs: [...state.tabs, newTab],
      activeTabPath: path,
    }));
  },

  closeTab: (path: string, force: boolean = false) => {
    const tab = get().tabs.find(t => t.path === path);

    if (!tab) return;

    // Warn if dirty and not force closing
    if (tab.isDirty && !force) {
      console.warn('[EditorTabs] Attempting to close dirty tab:', path);
      // Component should show warning dialog
      // For now, prevent close
      return;
    }

    set(state => {
      const newTabs = state.tabs.filter(t => t.path !== path);

      // Update active tab if we closed the active one
      let newActiveTab = state.activeTabPath;
      if (state.activeTabPath === path) {
        // Try to keep a nearby tab active
        const closedIndex = state.tabs.findIndex(t => t.path === path);
        newActiveTab = newTabs[closedIndex]?.path ?? newTabs[closedIndex - 1]?.path ?? null;
      }

      return {
        tabs: newTabs,
        activeTabPath: newActiveTab,
      };
    });
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabPath: null });
  },

  closeOtherTabs: (keepPath: string) => {
    set(state => ({
      tabs: state.tabs.filter(t => t.path === keepPath),
      activeTabPath: keepPath,
    }));
  },

  closeSavedTabs: () => {
    set(state => ({
      tabs: state.tabs.filter(t => t.isDirty),
      // Update active if it was closed
      activeTabPath: state.tabs.find(t => t.path === state.activeTabPath && t.isDirty)?.path ?? null,
    }));
  },

  switchTab: (path: string) => {
    set({ activeTabPath: path });
  },

  getTab: (path: string) => {
    return get().tabs.find(t => t.path === path);
  },
});
