/**
 * Editor Tabs Store (Refactored)
 *
 * Zustand store for managing multi-tab editor state.
 * Refactored into 3 slices following December 2025 Zustand best practices.
 *
 * @module stores/editor-tabs
 * @story S-030 - Multi-Tab File Editor
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import type { EditorTab } from '../editor-tabs-store';
import { createEditorTabsCrudSlice, EditorTabsCrudState, EditorTabsCrudActions } from './editor-tabs-crud-slice';
import { createEditorTabsContentSlice, EditorTabsContentState, EditorTabsContentActions } from './editor-tabs-state-slice';
import { createEditorTabsPositionSlice, EditorTabsPositionState, EditorTabsPositionActions } from './editor-tabs-position-slice';

// Re-export types for backward compatibility
export type { EditorTab };

/**
 * Combined Editor Tabs Store State
 */
export type EditorTabsStoreState =
  & EditorTabsCrudState
  & EditorTabsContentState
  & EditorTabsPositionState;

/**
 * Combined Editor Tabs Store Actions
 */
export type EditorTabsStoreActions =
  & EditorTabsCrudActions
  & EditorTabsContentActions
  & EditorTabsPositionActions;

/**
 * Complete Editor Tabs Store Interface
 */
export interface EditorTabsStore extends EditorTabsStoreState, EditorTabsStoreActions {}

/**
 * Editor Tabs Store (Combined Slices with Persistence)
 *
 * Combines all 3 slices into a single store with Dexie persistence.
 */
export const useEditorTabsStore = create<EditorTabsStore>()(
  persist(
    (set, get, api) => ({
      // Slice 1: CRUD Operations
      ...createEditorTabsCrudSlice(set, get, api),

      // Slice 2: Content/State Management
      ...createEditorTabsContentSlice(set, get, api),

      // Slice 3: Position/Reorder/Pin Management
      ...createEditorTabsPositionSlice(set, get, api),
    }),
    {
      name: 'editor-tabs-storage',
      storage: createJSONStorage(() => createDexieStorage('editor-tabs')),

      // Partialize to only persist essential data
      partialize: (state) => ({
        tabs: state.tabs.map(({ path, content, isDirty, isPinned }) => ({
          path,
          content,
          isDirty,
          isPinned,
        })),
        activeTabPath: state.activeTabPath,
        maxVisibleTabs: state.maxVisibleTabs,
      }),
    }
  )
);

// ============================================================================
// SELECTORS (Optimized for component rendering)
// ============================================================================

/**
 * Select all tabs
 */
export const selectTabs = (state: EditorTabsStore) => state.tabs;

/**
 * Select active tab path
 */
export const selectActiveTabPath = (state: EditorTabsStore) => state.activeTabPath;

/**
 * Select active tab object
 */
export const selectActiveTab = (state: EditorTabsStore) => {
  if (!state.activeTabPath) return null;
  return state.tabs.find(t => t.path === state.activeTabPath) ?? null;
};

/**
 * Select tab count
 */
export const selectTabCount = (state: EditorTabsStore) => state.tabs.length;

/**
 * Select dirty tabs
 */
export const selectDirtyTabs = (state: EditorTabsStore) => state.tabs.filter(t => t.isDirty);

/**
 * Select tabs sorted by order
 */
export const selectSortedTabs = (state: EditorTabsStore) => {
  return [...state.tabs].sort((a, b) => a.order - b.order);
};

// ============================================================================
// FACADE (Backward compatibility with old editor-tabs-store.ts)
// ============================================================================

/**
 * @deprecated Use `useEditorTabsStore` directly instead.
 */
export const useEditorTabsStoreFacade = useEditorTabsStore;

/**
 * @deprecated Re-export of EditorTab type for backward compatibility.
 */
export type { EditorTab as EditorTabInterface } from '../editor-tabs-store';
