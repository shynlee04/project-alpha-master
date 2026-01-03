/**
 * @fileoverview Unified IDE Workspace Store
 * @module infrastructure/persistence/stores/ide/useIDEStore
 * @governance EPIC-CP-1
 *
 * Composed Zustand store for all IDE workspace state.
 * Combines 6 focused slices with persist middleware.
 *
 * Architecture:
 * - Compose slices with spread operator
 * - Persist middleware on combined store (not individual slices)
 * - Dexie storage adapter for IndexedDB persistence
 * - Cross-slice communication via get()
 * - Set<string> serialization in partialize/merge
 *
 * December 2025 Zustand Patterns Applied:
 * - Slice pattern for modularity
 * - Individual selectors (no destructuring)
 * - Persist on combined store only
 * - Convenience hooks for common use cases
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

// Import slices
import { createIDEEditorSlice } from './ide-editor-slice';
import { createIDEExplorerSlice } from './ide-explorer-slice';
import { createIDELayoutSlice } from './ide-layout-slice';
import { createIDETerminalSlice } from './ide-terminal-slice';
import { createIDEProjectSlice } from './ide-project-slice';
import { createIDESelectorsSlice } from './ide-selectors-slice';

// Import types
import type { CombinedIDEState } from './ide-types';

// ============================================================================
// Unified Store
// ============================================================================

/**
 * Main IDE workspace store with persistence
 *
 * Combines 6 focused slices:
 * 1. Editor (file management)
 * 2. Explorer (file tree)
 * 3. Layout (panels)
 * 4. Terminal (tabs)
 * 5. Project (scoping)
 * 6. Selectors (AI context)
 *
 * Uses Dexie.js (IndexedDB) for persistence.
 * Set<string> properly serialized to/from Array.
 */
export const useIDEStore = create<CombinedIDEState>()(
  persist(
    (set, get, api) => ({
      // Compose all slices (each slice initializes its own state)
      ...createIDEEditorSlice(set, get, api),
      ...createIDEExplorerSlice(set, get, api),
      ...createIDELayoutSlice(set, get, api),
      ...createIDETerminalSlice(set, get, api),
      ...createIDEProjectSlice(set, get, api),
      ...createIDESelectorsSlice(set, get, api),
    }),
    {
      name: 'ide-state',
      storage: createJSONStorage(() => createDexieStorage('ideState')),

      // Selective persistence (only critical data)
      partialize: (state) => ({
        // Editor state
        openFiles: state.openFiles,
        activeFile: state.activeFile,
        activeFileScrollTop: state.activeFileScrollTop,

        // Explorer state (convert Set to Array)
        expandedPaths: Array.from(state.expandedPaths),

        // Layout state
        panelLayouts: state.panelLayouts,
        chatVisible: state.chatVisible,

        // Terminal state
        terminalTab: state.terminalTab,

        // Project state
        projectId: state.projectId,

        // Selectors are pure functions, not persisted
      }),

      // Convert expandedPaths array back to Set on rehydration
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CombinedIDEState> & { expandedPaths?: string[] };
        return {
          ...current,
          ...persistedState,
          // Convert array back to Set
          expandedPaths: new Set(persistedState.expandedPaths ?? []),
        };
      },

      // Hydration handler
      onRehydrateStorage: () => {
        console.log('[IDESlice] Hydration starting...');
        return (state, error) => {
          if (error) {
            console.error('[IDESlice] Hydration error:', error);
          } else {
            console.log('[IDESlice] Hydration complete', {
              openFilesCount: state?.openFiles.length,
              activeFile: state?.activeFile,
              projectId: state?.projectId,
            });
            if (state) {
              state._hasHydrated = true;
            }
          }
        };
      },
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Editor Hooks
 */

export function useOpenFiles() {
  return useIDEStore((s) => s.openFiles);
}

export function useActiveFile() {
  return useIDEStore((s) => s.activeFile);
}

export function useActiveFileScrollTop() {
  return useIDEStore((s) => s.activeFileScrollTop);
}

/**
 * Explorer Hooks
 */

export function useExpandedPaths() {
  return useIDEStore((s) => s.expandedPaths);
}

/**
 * Layout Hooks
 */

export function usePanelLayouts() {
  return useIDEStore((s) => s.panelLayouts);
}

export function useChatVisible() {
  return useIDEStore((s) => s.chatVisible);
}

/**
 * Terminal Hooks
 */

export function useTerminalTab() {
  return useIDEStore((s) => s.terminalTab);
}

/**
 * Project Hooks
 */

export function useProjectId() {
  return useIDEStore((s) => s.projectId);
}

/**
 * AI Context Hooks
 */

export function useAIContext() {
  return useIDEStore((s) => s.selectForAIContext(s as CombinedIDEState));
}

export function useFileContext() {
  return useIDEStore((s) => s.selectFileContext(s as CombinedIDEState));
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Reset all IDE state
 * Clears all slices to initial state
 */
export function resetIDEStore() {
  useIDEStore.getState().reset();
  // TODO: Clear other slices via event bus
  console.log('[IDESlice] Store reset complete');
}

/**
 * Get direct state access (for non-React contexts)
 * Used by AI tools and other non-React code
 */
export function getIDEStoreState() {
  return useIDEStore.getState();
}
