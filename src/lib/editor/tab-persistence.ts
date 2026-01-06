/**
 * Tab Persistence Utilities
 *
 * Handles saving and restoring editor tabs across sessions.
 * Per-project tab state stored in localStorage.
 *
 * @module lib/editor/tab-persistence
 * @story S-030 - Multi-Tab File Editor
 */

import type { EditorTab } from '@/infrastructure/persistence/stores/editor-tabs-store';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_PREFIX = 'editor-tabs-';
const PROJECT_KEY_SEPARATOR = '::';

// ============================================================================
// Types
// ============================================================================

/**
 * Persisted tab data (simplified for storage)
 */
export interface PersistedTabData {
    /** Project identifier */
    projectId: string;
    /** Tabs for this project */
    tabs: Array<{
        path: string;
        content: string;
        isDirty: boolean;
        isPinned: boolean;
    }>;
    /** Active tab path */
    activeTabPath: string | null;
    /** Timestamp of last save */
    timestamp: number;
}

// ============================================================================
// Storage Keys
// ============================================================================

/**
 * Get storage key for a specific project
 */
function getStorageKey(projectId: string): string {
    return `${STORAGE_PREFIX}${projectId}`;
}

/**
 * Get storage key for workspace-level tab state (cross-project)
 */
function getWorkspaceStorageKey(): string {
    return `${STORAGE_PREFIX}workspace`;
}

// ============================================================================
// Save Operations
// ============================================================================

/**
 * Save tabs for a specific project
 */
export function saveProjectTabs(
    projectId: string,
    tabs: EditorTab[],
    activeTabPath: string | null
): void {
    if (typeof window === 'undefined') return;

    try {
        const data: PersistedTabData = {
            projectId,
            tabs: tabs.map(({ path, content, isDirty, isPinned }) => ({
                path,
                content,
                isDirty,
                isPinned,
            })),
            activeTabPath,
            timestamp: Date.now(),
        };

        const key = getStorageKey(projectId);
        localStorage.setItem(key, JSON.stringify(data));

        // Update workspace index
        updateWorkspaceIndex(projectId, tabs.length);
    } catch (error) {
        console.error('[TabPersistence] Failed to save tabs:', error);
    }
}

/**
 * Save workspace-level tab metadata
 */
function updateWorkspaceIndex(projectId: string, tabCount: number): void {
    if (typeof window === 'undefined') return;

    try {
        const key = getWorkspaceStorageKey();
        const existing = localStorage.getItem(key);
        const index: Record<string, { tabCount: number; timestamp: number }> = existing
            ? JSON.parse(existing)
            : {};

        index[projectId] = {
            tabCount,
            timestamp: Date.now(),
        };

        localStorage.setItem(key, JSON.stringify(index));
    } catch (error) {
        console.error('[TabPersistence] Failed to update workspace index:', error);
    }
}

// ============================================================================
// Restore Operations
// ============================================================================

/**
 * Restore tabs for a specific project
 */
export function restoreProjectTabs(projectId: string): PersistedTabData | null {
    if (typeof window === 'undefined') return null;

    try {
        const key = getStorageKey(projectId);
        const data = localStorage.getItem(key);

        if (!data) return null;

        const parsed: PersistedTabData = JSON.parse(data);

        // Verify data integrity
        if (!isValidTabData(parsed)) {
            console.warn('[TabPersistence] Invalid tab data, ignoring');
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('[TabPersistence] Failed to restore tabs:', error);
        return null;
    }
}

/**
 * Get all projects with persisted tabs
 */
export function getProjectsWithTabs(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const key = getWorkspaceStorageKey();
        const data = localStorage.getItem(key);

        if (!data) return [];

        const index: Record<string, { tabCount: number; timestamp: number }> = JSON.parse(data);
        return Object.keys(index);
    } catch (error) {
        console.error('[TabPersistence] Failed to get projects with tabs:', error);
        return [];
    }
}

/**
 * Clear tabs for a specific project
 */
export function clearProjectTabs(projectId: string): void {
    if (typeof window === 'undefined') return;

    try {
        const key = getStorageKey(projectId);
        localStorage.removeItem(key);

        // Update workspace index
        const workspaceKey = getWorkspaceStorageKey();
        const existing = localStorage.getItem(workspaceKey);
        if (existing) {
            const index: Record<string, { tabCount: number; timestamp: number }> = JSON.parse(existing);
            delete index[projectId];
            localStorage.setItem(workspaceKey, JSON.stringify(index));
        }
    } catch (error) {
        console.error('[TabPersistence] Failed to clear tabs:', error);
    }
}

/**
 * Clear all persisted tabs (all projects)
 */
export function clearAllTabs(): void {
    if (typeof window === 'undefined') return;

    try {
        // Clear all editor-tabs keys
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.error('[TabPersistence] Failed to clear all tabs:', error);
    }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate persisted tab data structure
 */
function isValidTabData(data: unknown): data is PersistedTabData {
    if (!data || typeof data !== 'object') return false;

    const parsed = data as Partial<PersistedTabData>;

    if (!parsed.projectId || typeof parsed.projectId !== 'string') return false;
    if (!Array.isArray(parsed.tabs)) return false;
    if (parsed.timestamp && typeof parsed.timestamp !== 'number') return false;

    // Validate each tab
    for (const tab of parsed.tabs) {
        if (!tab.path || typeof tab.path !== 'string') return false;
        if (typeof tab.content !== 'string') return false;
        if (typeof tab.isDirty !== 'boolean') return false;
        if (typeof tab.isPinned !== 'boolean') return false;
    }

    return true;
}

// ============================================================================
// Migration
// ============================================================================

/**
 * Migrate old tab data format to new format
 * Called on app initialization if needed
 */
export function migrateTabData(): void {
    if (typeof window === 'undefined') return;

    try {
        // Check for old format (single key without project prefix)
        const oldKey = 'editor-tabs';
        const oldData = localStorage.getItem(oldKey);

        if (!oldData) return;

        console.log('[TabPersistence] Migrating old tab data to new format');

        // Parse old data
        const parsed = JSON.parse(oldData);

        // Create default project entry
        const defaultProjectId = 'default';
        const newData: PersistedTabData = {
            projectId: defaultProjectId,
            tabs: parsed.tabs || [],
            activeTabPath: parsed.activeTabPath || null,
            timestamp: Date.now(),
        };

        // Save in new format
        saveProjectTabs(defaultProjectId, newData.tabs, newData.activeTabPath);

        // Remove old data
        localStorage.removeItem(oldKey);

        console.log('[TabPersistence] Migration complete');
    } catch (error) {
        console.error('[TabPersistence] Failed to migrate tab data:', error);
    }
}
