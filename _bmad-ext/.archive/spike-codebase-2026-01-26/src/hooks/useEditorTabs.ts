/**
 * useEditorTabs Hook
 *
 * React hook for editor tab operations.
 * Wraps the editor tabs store with convenient methods.
 *
 * @module hooks/useEditorTabs
 * @story S-030 - Multi-Tab File Editor
 */

import { useCallback, useEffect } from 'react';
import { useEditorTabsStore, selectTabs, selectActiveTab, selectSortedTabs } from '@/infrastructure/persistence/stores/editor-tabs-store';
import { restoreProjectTabs, saveProjectTabs, clearProjectTabs } from '@/lib/editor/tab-persistence';
import { shouldWarnBeforeClosing, canCloseTab } from '@/lib/editor/tab-manager';
import { useCurrentWorkspace } from './useWorkspaceContext';

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseEditorTabsReturn {
    /** All open tabs */
    tabs: ReturnType<typeof selectSortedTabs>;
    /** Currently active tab */
    activeTab: ReturnType<typeof selectActiveTab>;
    /** Number of open tabs */
    tabCount: number;
    /** Open a new tab (or focus if exists) */
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
    /** Check if tab should warn before closing */
    shouldWarnBeforeClose: (path: string) => boolean;
    /** Check if tab can be closed */
    canClose: (path: string) => boolean;
    /** Save all tabs to persistence */
    saveTabs: () => void;
    /** Restore tabs from persistence */
    restoreTabs: () => void;
    /** Clear all tabs */
    clearTabs: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Main hook for editor tab management
 */
export function useEditorTabs(): UseEditorTabsReturn {
    // Select individual store items (Zustand v5 pattern)
    const tabs = useEditorTabsStore(selectSortedTabs);
    const activeTab = useEditorTabsStore(selectActiveTab);
    const tabCount = useEditorTabsStore((state) => state.tabs.length);

    // Store actions
    const storeOpenTab = useEditorTabsStore((state) => state.openTab);
    const storeCloseTab = useEditorTabsStore((state) => state.closeTab);
    const storeCloseAllTabs = useEditorTabsStore((state) => state.closeAllTabs);
    const storeCloseOtherTabs = useEditorTabsStore((state) => state.closeOtherTabs);
    const storeCloseSavedTabs = useEditorTabsStore((state) => state.closeSavedTabs);
    const storeSwitchTab = useEditorTabsStore((state) => state.switchTab);
    const storeUpdateTabContent = useEditorTabsStore((state) => state.updateTabContent);
    const storeSaveTab = useEditorTabsStore((state) => state.saveTab);
    const storeTogglePinTab = useEditorTabsStore((state) => state.togglePinTab);
    const storeReorderTabs = useEditorTabsStore((state) => state.reorderTabs);
    const storeUpdateScrollPosition = useEditorTabsStore((state) => state.updateScrollPosition);

    // Get current workspace for project-specific persistence
    const currentWorkspace = useCurrentWorkspace();
    const projectId = currentWorkspace ?? 'default';

    // Auto-save tabs on change
    useEffect(() => {
        const handleBeforeUnload = () => {
            saveTabs();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [tabs, activeTab]);

    // Save tabs to persistence
    const saveTabs = useCallback(() => {
        const allTabs = useEditorTabsStore.getState().tabs;
        const activePath = useEditorTabsStore.getState().activeTabPath;

        saveProjectTabs(projectId, allTabs, activePath);
    }, [projectId]);

    // Restore tabs from persistence
    const restoreTabs = useCallback(() => {
        const data = restoreProjectTabs(projectId);

        if (!data) return;

        // Restore tabs to store
        const state = useEditorTabsStore.getState();

        // Clear existing tabs
        state.closeAllTabs();

        // Restore persisted tabs
        data.tabs.forEach(tab => {
            state.openTab(tab.path, tab.content);
            if (tab.isDirty) {
                state.updateTabContent(tab.path, tab.content, true);
            }
            if (tab.isPinned) {
                state.togglePinTab(tab.path);
            }
        });

        // Restore active tab
        if (data.activeTabPath) {
            state.switchTab(data.activeTabPath);
        }
    }, [projectId]);

    // Clear all tabs
    const clearTabs = useCallback(() => {
        storeCloseAllTabs();
        clearProjectTabs(projectId);
    }, [projectId, storeCloseAllTabs]);

    // Wrapper functions
    const openTab = useCallback((path: string, content: string) => {
        storeOpenTab(path, content);
    }, [storeOpenTab]);

    const closeTab = useCallback((path: string, force: boolean = false) => {
        const tab = tabs.find(t => t.path === path);

        if (!tab) return;

        // Check if can close
        if (!canCloseTab(tab, force)) {
            return;
        }

        // Warn if dirty and not force
        if (shouldWarnBeforeClosing(tab) && !force) {
            // Component should show confirmation dialog
            // For now, we prevent the close
            console.warn('[useEditorTabs] Attempting to close dirty tab:', path);
            return;
        }

        storeCloseTab(path, force);
    }, [tabs, storeCloseTab]);

    const closeAllTabs = useCallback(() => {
        storeCloseAllTabs();
    }, [storeCloseAllTabs]);

    const closeOtherTabs = useCallback((path: string) => {
        storeCloseOtherTabs(path);
    }, [storeCloseOtherTabs]);

    const closeSavedTabs = useCallback(() => {
        storeCloseSavedTabs();
    }, [storeCloseSavedTabs]);

    const switchTab = useCallback((path: string) => {
        storeSwitchTab(path);
    }, [storeSwitchTab]);

    const updateTabContent = useCallback((path: string, content: string, isDirty: boolean = true) => {
        storeUpdateTabContent(path, content, isDirty);
    }, [storeUpdateTabContent]);

    const saveTab = useCallback((path: string, content: string) => {
        storeSaveTab(path, content);
    }, [storeSaveTab]);

    const togglePinTab = useCallback((path: string) => {
        storeTogglePinTab(path);
    }, [storeTogglePinTab]);

    const reorderTabs = useCallback((fromPath: string, toPath: string) => {
        storeReorderTabs(fromPath, toPath);
    }, [storeReorderTabs]);

    const updateScrollPosition = useCallback((path: string, scrollTop: number) => {
        storeUpdateScrollPosition(path, scrollTop);
    }, [storeUpdateScrollPosition]);

    const shouldWarnBeforeClose = useCallback((path: string) => {
        const tab = tabs.find(t => t.path === path);
        return tab ? shouldWarnBeforeClosing(tab) : false;
    }, [tabs]);

    const canClose = useCallback((path: string) => {
        const tab = tabs.find(t => t.path === path);
        return tab ? canCloseTab(tab) : false;
    }, [tabs]);

    return {
        tabs,
        activeTab,
        tabCount,
        openTab,
        closeTab,
        closeAllTabs,
        closeOtherTabs,
        closeSavedTabs,
        switchTab,
        updateTabContent,
        saveTab,
        togglePinTab,
        reorderTabs,
        updateScrollPosition,
        shouldWarnBeforeClose,
        canClose,
        saveTabs,
        restoreTabs,
        clearTabs,
    };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook for keyboard shortcuts (Cmd+1-9, Cmd+W, etc.)
 */
export function useEditorTabShortcuts(): void {
    const tabs = useEditorTabsStore(selectTabs);
    const switchTab = useEditorTabsStore((state) => state.switchTab);
    const closeTab = useEditorTabsStore((state) => state.closeTab);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

            if (!cmdOrCtrl) return;

            // Cmd+W - Close current tab
            if (e.key === 'w') {
                e.preventDefault();
                const activePath = useEditorTabsStore.getState().activeTabPath;
                if (activePath) {
                    closeTab(activePath);
                }
                return;
            }

            // Cmd+1-9 - Switch to tab by index
            if (e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                const tab = tabs[index];
                if (tab) {
                    switchTab(tab.path);
                }
                return;
            }

            // Cmd+Tab - Switch to next tab
            if (e.key === 'Tab') {
                e.preventDefault();
                const currentPath = useEditorTabsStore.getState().activeTabPath;
                const currentIndex = tabs.findIndex(t => t.path === currentPath);
                const nextIndex = e.shiftKey
                    ? (currentIndex - 1 + tabs.length) % tabs.length
                    : (currentIndex + 1) % tabs.length;
                const nextTab = tabs[nextIndex];
                if (nextTab) {
                    switchTab(nextTab.path);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tabs, switchTab, closeTab]);
}

/**
 * Hook for dirty tab tracking
 */
export function useDirtyTabs(): {
    dirtyTabs: ReturnType<typeof selectTabs>;
    dirtyCount: number;
    hasDirtyTabs: boolean;
} {
    const dirtyTabs = useEditorTabsStore((state) => state.tabs.filter(t => t.isDirty));
    const dirtyCount = dirtyTabs.length;
    const hasDirtyTabs = dirtyCount > 0;

    return {
        dirtyTabs,
        dirtyCount,
        hasDirtyTabs,
    };
}
