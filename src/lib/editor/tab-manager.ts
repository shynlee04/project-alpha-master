/**
 * Tab Manager
 *
 * High-level tab operations and validation logic.
 * Provides business rules for tab management.
 *
 * @module lib/editor/tab-manager
 * @story S-030 - Multi-Tab File Editor
 */

import type { EditorTab } from '@/infrastructure/persistence/stores/editor-tabs-store';

// ============================================================================
// Constants
// ============================================================================

/** Maximum tabs before showing scroll */
export const MAX_VISIBLE_TABS = 10;

/** Minimum tab width in pixels */
export const MIN_TAB_WIDTH = 120;

/** Maximum tab width in pixels */
export const MAX_TAB_WIDTH = 200;

/** Auto-close inactive tabs after milliseconds (20 minutes) */
export const INACTIVE_TAB_TIMEOUT = 20 * 60 * 1000;

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate tab structure
 */
export function isValidTab(tab: unknown): tab is EditorTab {
    if (!tab || typeof tab !== 'object') return false;

    const t = tab as Partial<EditorTab>;

    if (!t.path || typeof t.path !== 'string') return false;
    if (typeof t.content !== 'string') return false;
    if (typeof t.isDirty !== 'boolean') return false;
    if (typeof t.isPinned !== 'boolean') return false;
    if (typeof t.order !== 'number') return false;

    return true;
}

/**
 * Validate all tabs in array
 */
export function validateTabs(tabs: unknown[]): tabs is EditorTab[] {
    if (!Array.isArray(tabs)) return false;

    return tabs.every(isValidTab);
}

// ============================================================================
// Tab Operations
// ============================================================================

/**
 * Check if tab can be closed (not pinned or force close)
 */
export function canCloseTab(tab: EditorTab, force: boolean = false): boolean {
    if (tab.isPinned && !force) {
        console.warn('[TabManager] Cannot close pinned tab:', tab.path);
        return false;
    }
    return true;
}

/**
 * Check if tab should warn before closing (has unsaved changes)
 */
export function shouldWarnBeforeClosing(tab: EditorTab): boolean {
    return tab.isDirty;
}

/**
 * Get tabs that should warn on close
 */
export function getDirtyTabs(tabs: EditorTab[]): EditorTab[] {
    return tabs.filter(t => t.isDirty);
}

/**
 * Get tabs that can be closed (not pinned)
 */
export function getClosableTabs(tabs: EditorTab[]): EditorTab[] {
    return tabs.filter(t => !t.isPinned);
}

/**
 * Check if tabs should show scroll (exceeds max visible)
 */
export function shouldShowScroll(tabCount: number): boolean {
    return tabCount > MAX_VISIBLE_TABS;
}

// ============================================================================
// Tab Reordering
// ============================================================================

/**
 * Calculate new tab order after drag-drop
 */
export function calculateNewOrder(
    tabs: EditorTab[],
    fromPath: string,
    toPath: string
): EditorTab[] {
    const reordered = [...tabs];
    const fromIndex = reordered.findIndex(t => t.path === fromPath);
    const toIndex = reordered.findIndex(t => t.path === toPath);

    if (fromIndex === -1 || toIndex === -1) {
        console.warn('[TabManager] Invalid tab paths for reorder');
        return tabs;
    }

    if (fromIndex === toIndex) {
        return tabs; // No change
    }

    // Remove from old position
    const [movedTab] = reordered.splice(fromIndex, 1);
    // Insert at new position
    reordered.splice(toIndex, 0, movedTab);

    // Update order values
    return reordered.map((tab, index) => ({ ...tab, order: index }));
}

/**
 * Validate drag-drop target
 */
export function isValidDropTarget(fromPath: string, toPath: string): boolean {
    // Can't drop on itself
    if (fromPath === toPath) return false;

    // Both paths must be non-empty
    if (!fromPath || !toPath) return false;

    return true;
}

// ============================================================================
// Tab Navigation
// ============================================================================

/**
 * Get next tab (for keyboard navigation)
 */
export function getNextTab(tabs: EditorTab[], currentPath: string | null): EditorTab | null {
    if (!currentPath) return tabs[0] ?? null;

    const currentIndex = tabs.findIndex(t => t.path === currentPath);
    if (currentIndex === -1) return tabs[0] ?? null;

    const nextIndex = (currentIndex + 1) % tabs.length;
    return tabs[nextIndex] ?? null;
}

/**
 * Get previous tab (for keyboard navigation)
 */
export function getPreviousTab(tabs: EditorTab[], currentPath: string | null): EditorTab | null {
    if (!currentPath) return tabs[0] ?? null;

    const currentIndex = tabs.findIndex(t => t.path === currentPath);
    if (currentIndex === -1) return tabs[0] ?? null;

    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    return tabs[prevIndex] ?? null;
}

/**
 * Get tab by index (for Cmd+1-9 shortcuts)
 */
export function getTabByIndex(tabs: EditorTab[], index: number): EditorTab | null {
    if (index < 0 || index >= tabs.length) return null;
    return tabs[index] ?? null;
}

// ============================================================================
// Tab Cleanup
// ============================================================================

/**
 * Get tabs that should be auto-closed (inactive for too long)
 */
export function getInactiveTabs(tabs: EditorTab[], timeoutMs: number = INACTIVE_TAB_TIMEOUT): EditorTab[] {
    const now = Date.now();

    return tabs.filter(tab => {
        // Skip pinned and dirty tabs
        if (tab.isPinned || tab.isDirty) return false;

        // Skip if no timestamp data
        // Note: We'd need to add lastAccessed timestamp to EditorTab type
        // For now, this is a placeholder for future enhancement
        return false;
    });
}

/**
 * Cleanup unused tabs to free memory
 */
export function cleanupInactiveTabs(tabs: EditorTab[]): EditorTab[] {
    const inactive = getInactiveTabs(tabs);

    if (inactive.length === 0) return tabs;

    console.log(`[TabManager] Cleaning up ${inactive.length} inactive tabs`);

    return tabs.filter(t => !inactive.includes(t));
}

// ============================================================================
// Tab Display
// ============================================================================

/**
 * Calculate tab width based on available space and tab count
 */
export function calculateTabWidth(
    availableWidth: number,
    tabCount: number,
    min: number = MIN_TAB_WIDTH,
    max: number = MAX_TAB_WIDTH
): number {
    if (tabCount === 0) return max;

    const idealWidth = availableWidth / tabCount;

    // Clamp between min and max
    return Math.max(min, Math.min(max, idealWidth));
}

/**
 * Get truncated filename for display
 */
export function getDisplayFilename(path: string, maxLength: number = 20): string {
    const filename = path.split('/').pop() ?? path;

    if (filename.length <= maxLength) return filename;

    // Truncate with ellipsis
    return filename.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// Context Menu Actions
// ============================================================================

/**
 * Context menu action types
 */
export type TabContextMenuAction =
    | 'close'
    | 'close-others'
    | 'close-saved'
    | 'close-all'
    | 'copy-path'
    | 'reveal-in-finder'
    | 'pin'
    | 'unpin';

/**
 * Validate if context menu action is available for tab
 */
export function isContextMenuActionAvailable(
    action: TabContextMenuAction,
    tab: EditorTab,
    allTabs: EditorTab[]
): boolean {
    switch (action) {
        case 'close':
            return !tab.isPinned;
        case 'close-others':
            return allTabs.filter(t => t.path !== tab.path && !t.isPinned).length > 0;
        case 'close-saved':
            return allTabs.filter(t => !t.isDirty && !t.isPinned).length > 0;
        case 'close-all':
            return allTabs.filter(t => !t.isPinned).length > 0;
        case 'copy-path':
            return true;
        case 'reveal-in-finder':
            return true;
        case 'pin':
            return !tab.isPinned;
        case 'unpin':
            return tab.isPinned;
        default:
            return false;
    }
}

/**
 * Execute context menu action
 */
export function executeContextMenuAction(
    action: TabContextMenuAction,
    tab: EditorTab,
    allTabs: EditorTab[]
): {
    type: 'close' | 'close-multiple' | 'info' | 'none';
    paths: string[];
    message?: string;
} {
    switch (action) {
        case 'close':
            return { type: 'close', paths: [tab.path] };

        case 'close-others':
            return {
                type: 'close-multiple',
                paths: allTabs.filter(t => t.path !== tab.path && !t.isPinned).map(t => t.path),
            };

        case 'close-saved':
            return {
                type: 'close-multiple',
                paths: allTabs.filter(t => !t.isDirty && !t.isPinned).map(t => t.path),
            };

        case 'close-all':
            return {
                type: 'close-multiple',
                paths: allTabs.filter(t => !t.isPinned).map(t => t.path),
            };

        case 'copy-path':
            // Copy to clipboard would be handled by component
            return { type: 'info', paths: [], message: `Copied: ${tab.path}` };

        case 'reveal-in-finder':
            // Reveal in Finder would be handled by component
            return { type: 'info', paths: [], message: `Revealed: ${tab.path}` };

        case 'pin':
        case 'unpin':
            return { type: 'none', paths: [] };

        default:
            return { type: 'none', paths: [] };
    }
}
