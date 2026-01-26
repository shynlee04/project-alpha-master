/**
 * @fileoverview IDE State Storage Adapter
 * @module infrastructure/persistence/stores/ide/ide-state-storage
 * @governance EPIC-CP-1
 * @created 2026-01-06
 * @updated 2026-01-19 - STATE-002 Fix: Project-scoped hydration
 *
 * Custom Zustand StateStorage adapter for IDE workspace state.
 *
 * PROBLEM: The generic `createDexieStorage` writes { id, state, updatedAt }
 * but the ideState table uses 'projectId' as key path, not 'id'.
 *
 * SOLUTION: Custom adapter that:
 * - Writes IDEStateRecord structure (projectId as key)
 * - Reads state scoped to current projectId (FIXED STATE-002)
 * - Handles null projectId (no state to persist)
 *
 * STATE-002 FIX: Use sessionStorage to track current projectId for hydration
 * - When setting projectId, also store in sessionStorage
 * - During hydration, read projectId from sessionStorage first
 * - Query ideState by projectId for correct project-scoped restore
 *
 * @see dexie-db-migrations.ts line 147: ideState: 'projectId, updatedAt'
 */

import type { StateStorage } from 'zustand/middleware';
import type { IDEStateRecord } from '@/infrastructure/persistence/dexie-db';
import type { CombinedIDEState } from './ide-types';
import { getDb } from '@/infrastructure/persistence/dexie-db';

/**
 * SessionStorage key for current projectId (used during hydration)
 * This allows the storage adapter to know which project to hydrate during store creation
 */
const CURRENT_PROJECT_ID_KEY = 'viagent_current_ide_project';

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
 * Get current projectId from sessionStorage for hydration.
 * This is needed because during store creation, getIDEStoreState is not yet available.
 */
function getProjectIdForHydration(): string | null {
  try {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(CURRENT_PROJECT_ID_KEY);
    }
  } catch {
    // sessionStorage may not be available
  }
  return null;
}

/**
 * Set current projectId in sessionStorage for hydration.
 * Called when user navigates to an IDE project.
 */
export function setProjectIdForHydration(projectId: string | null): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (projectId) {
        sessionStorage.setItem(CURRENT_PROJECT_ID_KEY, projectId);
      } else {
        sessionStorage.removeItem(CURRENT_PROJECT_ID_KEY);
      }
    }
  } catch {
    // sessionStorage may not be available
  }
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
        // CRITICAL: During SSR, IndexedDB is not available.
        // Return null immediately during server-side rendering.
        if (typeof window === 'undefined') {
          return null;
        }

        // CRITICAL: During store initialization, getIDEStoreState is null.
        // We must query IndexedDB directly to find persisted state.
        const db = getDb();
        if (!db) {
          return null;
        }

        // FIX STATE-002: Try to get projectId from sessionStorage for scoped hydration
        const projectId = getProjectIdForHydration();
        
        let record: IDEStateRecord | undefined;
        
         if (!projectId) {
           // No projectId in sessionStorage - this is first visit or session lost
           // ROOT CAUSE FIX (2026-01-20): Removed "most recent" fallback
           // Workspace state must ONLY load by projectId (no cross-project contamination per ADR-033)
           console.debug('[IDEStateStorage] No projectId in session, skipping hydration');
           return null;
         }

         // We know which project to hydrate - query by projectId directly
         record = await db.ideState.get(projectId);
         console.debug(`[IDEStateStorage] Hydrating state for project: ${projectId}`);

        if (!record) {
          console.debug('[IDEStateStorage] No persisted state found (first run or cleared)');
          return null;
        }

        console.debug(`[IDEStateStorage] Hydrated state for project: ${record.projectId}`, {
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
        // During SSR, there's no IndexedDB to write to
        if (typeof window === 'undefined') {
          return;
        }

        // Parse the persisted state (now includes projectId at top level)
        const state = JSON.parse(value) as Partial<CombinedIDEState>;
        const projectId = state.projectId ?? null;

        // FIX STATE-002: Store projectId in sessionStorage for hydration
        setProjectIdForHydration(projectId);

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
        const db = getDb();
        if (!db) {
          return;
        }
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
        // During SSR, there's no IndexedDB to delete from
        if (typeof window === 'undefined') {
          return;
        }

        if (!getIDEStoreState) {
          return;
        }

        const currentState = getIDEStoreState();
        const projectId = currentState.projectId;

        if (!projectId) {
          return; // No project, nothing to remove
        }

        const db = getDb();
        if (!db) {
          return;
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
