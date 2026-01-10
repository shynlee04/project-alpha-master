/**
 * @fileoverview IDE State Storage Adapter
 * @module infrastructure/persistence/stores/ide/ide-state-storage
 * @governance EPIC-CP-1
 * @created 2026-01-06
 *
 * Custom Zustand StateStorage adapter for IDE workspace state.
 *
 * PROBLEM: The generic `createDexieStorage` writes { id, state, updatedAt }
 * but the ideState table uses 'projectId' as key path, not 'id'.
 *
 * SOLUTION: Custom adapter that:
 * - Writes IDEStateRecord structure (projectId as key)
 * - Reads state scoped to current projectId
 * - Handles null projectId (no state to persist)
 *
 * @see dexie-db-migrations.ts line 147: ideState: 'projectId, updatedAt'
 */

import type { StateStorage } from 'zustand/middleware';
import type { IDEStateRecord } from '@/infrastructure/persistence/dexie-db';
import type { CombinedIDEState } from './ide-types';
import { db } from '@/infrastructure/persistence/dexie-db';

/**
 * Module-level reference to the store's getState function.
 * Set by useIDEStore after creation, used by storage adapter.
 */
let getIDEStoreState: (() => CombinedIDEState) | null = null;

/**
 * BUG-FIX-2026-01-11: Track if we've already warned about missing projectId
 * Prevents console spam during early initialization when projectId is not yet set.
 */
let hasWarnedMissingProject = false;

/**
 * Set the store reference. Called by useIDEStore after creation.
 */
export function setIDEStoreRef(getState: () => CombinedIDEState): void {
  getIDEStoreState = getState;
}

/**
 * Create a custom storage adapter for IDE workspace state.
 *
 * The adapter uses the module-level store reference to access current projectId.
 *
 * @returns StateStorage adapter compatible with Zustand persist middleware
 */
export function createIDEStateStorage(): StateStorage {
  return {
    /**
     * Read persisted state from IndexedDB.
     *
     * CRITICAL FIX: This is called during store creation, BEFORE getIDEStoreState is set.
     * We cannot use the store reference here. Instead, we query IndexedDB directly
     * to find the most recently used project's state.
     *
     * Strategy:
     * 1. Try to get the most recent record from ideState table (ordered by updatedAt)
     * 2. If found, return it (this will include projectId for state recovery)
     * 3. If none found, return null (first run or no state persisted)
     */
    getItem: async (_name: string): Promise<string | null> => {
      try {
        // CRITICAL: During store initialization, getIDEStoreState is null.
        // We must query IndexedDB directly to find persisted state.
        const record = await db.ideState
          .orderBy('updatedAt')
          .reverse()
          .first();

        if (!record) {
          console.debug('[IDEStateStorage] No persisted state found (first run or cleared)');
          return null;
        }

        console.debug(`[IDEStateStorage] Hydrating most recent state for project: ${record.projectId}`, {
          openFilesCount: record.openFiles.length,
          activeFile: record.activeFile,
          updatedAt: record.updatedAt,
        });

        // Return JSON string of the record (Zustand will parse it)
        return JSON.stringify(record);
      } catch (error) {
        console.error('[IDEStateStorage] Failed to read state:', error);
        return null;
      }
    },

    /**
     * Write state to IndexedDB.
     *
     * Creates/updates an IDEStateRecord with the current projectId as key.
     * The state now includes projectId (fixed in useIDEStore partialize function).
     */
    setItem: async (_name: string, value: string): Promise<void> => {
      try {
        // Parse the persisted state (now includes projectId at top level)
        const state = JSON.parse(value) as Partial<CombinedIDEState>;
        const projectId = state.projectId;

        // No projectId = don't persist empty state
        if (!projectId) {
          // BUG-FIX-2026-01-11: Only warn once per session to prevent console spam
          if (!hasWarnedMissingProject) {
            console.debug('[IDEStateStorage] No projectId in state, skipping persistence');
            hasWarnedMissingProject = true;
          }
          return;
        }

        // BUG-FIX-2026-01-11: Reset warning flag when projectId is available
        hasWarnedMissingProject = false;

        // Create IDEStateRecord structure
        const record: IDEStateRecord = {
          projectId,
          workspaceId: 'ide', // PERSIST-S002: IDE workspace state
          openFiles: state.openFiles ?? [],
          activeFile: state.activeFile ?? null,
          expandedPaths: Array.isArray(state.expandedPaths)
            ? Array.from(state.expandedPaths)
            : [],
          panelLayouts: state.panelLayouts ?? {},
          terminalTab: state.terminalTab ?? 'terminal',
          chatVisible: state.chatVisible ?? false,
          activeFileScrollTop: state.activeFileScrollTop,
          updatedAt: new Date(),
        };

        // Write to ideState table (projectId is primary key)
        await db.ideState.put(record);

        console.debug(`[IDEStateStorage] Persisted state for project: ${projectId}`, {
          openFilesCount: record.openFiles.length,
          activeFile: record.activeFile,
          expandedPathsCount: record.expandedPaths.length,
        });
      } catch (error) {
        console.error('[IDEStateStorage] Failed to write state:', error);
        throw error;
      }
    },

    /**
     * Remove persisted state for the current project.
     *
     * Called when clearing state or switching projects.
     */
    removeItem: async (_name: string): Promise<void> => {
      try {
        if (!getIDEStoreState) {
          return;
        }

        const currentState = getIDEStoreState();
        const projectId = currentState.projectId;

        if (!projectId) {
          return; // No project, nothing to remove
        }

        await db.ideState.delete(projectId);
        console.debug(`[IDEStateStorage] Removed persisted state for project: ${projectId}`);
      } catch (error) {
        console.error('[IDEStateStorage] Failed to remove state:', error);
      }
    },
  };
}

/**
 * Type alias for the store getter function.
 * Used to pass the store's getState method to the storage adapter.
 */
export type IDEStoreGetter = () => CombinedIDEState;
