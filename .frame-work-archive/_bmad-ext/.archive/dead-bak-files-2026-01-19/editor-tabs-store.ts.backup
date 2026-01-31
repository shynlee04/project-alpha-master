/**
 * Editor Tabs Store - Zustand Slice
 *
 * Manages tab state for multi-tab file editor.
 * Follows December 2025 Zustand v5 patterns.
 *
 * @module stores/editor-tabs-store
 * @story S-030 - Multi-Tab File Editor
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

// ============================================================================
// Types
// ============================================================================

/**
 * Represents a single open file tab
 */
export interface EditorTab {
    /** Unique file path (tab identifier) */
    path: string;
    /** File content */
    content: string;
    /** Whether file has unsaved changes */
    isDirty: boolean;
    /** Tab display order */
    order: number;
    /** Scroll position in editor */
    scrollTop?: number;
    /** Cursor position (line, column) */
    cursorPosition?: { lineNumber: number; column: number };
    /** Whether tab is pinned (prevents closing) */
    isPinned: boolean;
}

/**
 * Tab state structure
 */
export interface EditorTabsState {
    /** All open tabs */
    tabs: EditorTab[];
    /** Currently active tab path */
    activeTabPath: string | null;
    /** Maximum tabs before showing scroll (default: 10) */
    maxVisibleTabs: number;
}

/**
 * Tab actions
 */
export interface EditorTabsActions {
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
    /** Update tab content and dirty state */
    updateTabContent: (path: string, content: string, isDirty?: boolean) => void;
    /** Save tab content (clears dirty flag) */
    saveTab: (path: string, content: string) => void;
    /** Pin/unpin tab */
    togglePinTab: (path: string) => void;
    /** Reorder tabs (drag-drop) */
    reorderTabs: (fromPath: string, toPath: string) => void;
    /** Update scroll position for tab */
    updateScrollPosition: (path: string, scrollTop: number) => void;
    /** Update cursor position for tab */
    updateCursorPosition: (path: string, position: { lineNumber: number; column: number }) => void;
    /** Get tab by path */
    getTab: (path: string) => EditorTab | undefined;
    /** Get dirty tabs count */
    getDirtyTabsCount: () => number;
}

// ============================================================================
// Slice
// ============================================================================

const MAX_VISIBLE_TABS_DEFAULT = 10;

/**
 * Editor Tabs Slice
 *
 * Manages multi-tab state with drag-drop, persistence, and dirty tracking.
 */
export interface EditorTabsStore extends EditorTabsState, EditorTabsActions {}

export const useEditorTabsStore = create<EditorTabsStore>()(
    persist(
        (set, get) => ({
            // Initial state
            tabs: [],
            activeTabPath: null,
            maxVisibleTabs: MAX_VISIBLE_TABS_DEFAULT,

            // Actions
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

            getTab: (path: string) => {
                return get().tabs.find(t => t.path === path);
            },

            getDirtyTabsCount: () => {
                return get().tabs.filter(t => t.isDirty).length;
            },
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
// Selectors (for optimized component rendering)
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
