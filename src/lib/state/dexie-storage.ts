/**
 * @fileoverview Custom Zustand Storage Adapter for Dexie.js
 * @module lib/state/dexie-storage
 * 
 * Provides a storage adapter that connects Zustand's persist middleware
 * to Dexie.js (IndexedDB), enabling automatic state persistence.
 * 
 * Story 27-1: State Architecture Stabilization
 * 
 * @example
 * ```tsx
 * import { create } from 'zustand';
 * import { persist, createJSONStorage } from 'zustand/middleware';
 * import { dexieStorage } from './dexie-storage';
 * 
 * const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     { 
 *       name: 'project-123',
 *       storage: createJSONStorage(() => dexieStorage) 
 *     }
 *   )
 * );
 * ```
 */

import type { StateStorage } from 'zustand/middleware';
import { db, type IDEStateRecord } from './dexie-db';

/**
 * Parse stored JSON safely
 */
function safeJSONParse<T>(str: string | null): T | null {
    if (!str) return null;
    try {
        return JSON.parse(str) as T;
    } catch {
        console.warn('[DexieStorage] Failed to parse stored state');
        return null;
    }
}

/**
 * Dexie-backed storage adapter for Zustand persist middleware
 * 
 * This adapter stores state in IndexedDB via Dexie.js, providing:
 * - Async persistence (non-blocking)
 * - Large storage capacity (browser limit, typically 50%+ of disk)
 * - Automatic schema migrations
 * 
 * The storage key (name) is used as the projectId in ideState table.
 */
export const dexieStorage: StateStorage = {
    /**
     * Get item from IndexedDB
     * Returns null if not found or on error
     */
    getItem: async (name: string): Promise<string | null> => {
        try {
            const record = await db.ideState.get(name);
            if (!record) return null;

            // Return the full record as JSON string (Zustand expects this)
            return JSON.stringify({
                state: {
                    openFiles: record.openFiles,
                    activeFile: record.activeFile,
                    expandedPaths: record.expandedPaths,
                    panelLayouts: record.panelLayouts,
                    terminalTab: record.terminalTab,
                    chatVisible: record.chatVisible,
                    activeFileScrollTop: record.activeFileScrollTop,
                },
                version: 0,
            });
        } catch (error) {
            console.error('[DexieStorage] getItem error:', error);
            return null;
        }
    },

    /**
     * Set item in IndexedDB
     * Creates or updates the record
     */
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            const parsed = safeJSONParse<{ state: Partial<IDEStateRecord> }>(value);
            if (!parsed?.state) return;

            const record: IDEStateRecord = {
                projectId: name,
                openFiles: parsed.state.openFiles ?? [],
                activeFile: parsed.state.activeFile ?? null,
                expandedPaths: parsed.state.expandedPaths ?? [],
                panelLayouts: parsed.state.panelLayouts ?? {},
                terminalTab: parsed.state.terminalTab ?? 'terminal',
                chatVisible: parsed.state.chatVisible ?? true,
                activeFileScrollTop: parsed.state.activeFileScrollTop,
                updatedAt: new Date(),
            };

            await db.ideState.put(record);
        } catch (error) {
            console.error('[DexieStorage] setItem error:', error);
        }
    },

    /**
     * Remove item from IndexedDB
     */
    removeItem: async (name: string): Promise<void> => {
        try {
            await db.ideState.delete(name);
        } catch (error) {
            console.error('[DexieStorage] removeItem error:', error);
        }
    },
};

/**
 * Create a project-scoped storage adapter
 * 
 * Use this when you need to scope storage to a specific project
 * outside of the Zustand persist middleware.
 * 
 * @param projectId - Project identifier
 */
export function createProjectStorage(projectId: string) {
    return {
        get: () => dexieStorage.getItem(projectId),
        set: (value: string) => dexieStorage.setItem(projectId, value),
        remove: () => dexieStorage.removeItem(projectId),
    };
}
