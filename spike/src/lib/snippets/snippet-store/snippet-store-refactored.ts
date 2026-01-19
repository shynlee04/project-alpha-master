/**
 * @fileoverview Snippet Store - Refactored (Zustand with 4 slices)
 * @module snippets/snippet-store/snippet-store-refactored
 *
 * Refactored from 482-line monolith to 4 focused slices:
 * - snippet-crud-slice.ts (195 lines) - Core CRUD operations
 * - snippet-filtering-slice.ts (115 lines) - Search + filter state
 * - snippet-export-slice.ts (110 lines) - Export/import operations
 * - snippet-utils-slice.ts (105 lines) - Utility functions
 *
 * Already follows December 2025 Zustand patterns:
 * - Slice composition for single responsibility
 * - Persist middleware with partialize
 * - Individual selector hooks
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { createSnippetCrudSlice, SnippetCrudSlice } from './snippet-crud-slice';
import { createSnippetFilteringSlice, SnippetFilteringSlice } from './snippet-filtering-slice';
import { createSnippetExportSlice, SnippetExportSlice } from './snippet-export-slice';
import { createSnippetUtilsSlice, SnippetUtilsSlice } from './snippet-utils-slice';
import { BUILT_IN_SNIPPETS } from '../snippet-templates';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';

// ============================================================================
// Combined Store Interface
// ============================================================================

export interface SnippetStore
  extends SnippetCrudSlice,
    SnippetFilteringSlice,
    SnippetExportSlice,
    SnippetUtilsSlice {}

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Zustand store for code snippet management (refactored from 482-line monolith)
 *
 * Uses December 2025 Zustand patterns:
 * - Slice composition for single responsibility
 * - Persist middleware with partialize for transient state exclusion
 * - Individual selector hooks for components
 */
export const useSnippetStore = create<SnippetStore>()(
  persist(
    subscribeWithSelector((set, get, api) => ({
      // Snippet CRUD Slice
      ...createSnippetCrudSlice(set, get, api),

      // Snippet Filtering Slice
      ...createSnippetFilteringSlice(set, get, api),

      // Snippet Export Slice
      ...createSnippetExportSlice(set, get, api),

      // Snippet Utils Slice
      ...createSnippetUtilsSlice(set, get, api),
    })),
    {
      name: 'via-gent-snippets',
      storage: createJSONStorage(() => createDexieStorage('codeSnippets')),
      partialize: (state) => ({
        // Persist: search and filter state
        searchQuery: state.searchQuery,
        selectedFolder: state.selectedFolder,
        selectedTags: state.selectedTags,

        // Persist: statistics
        exportStats: state.exportStats,
        utilStats: state.utilStats,

        // Do NOT persist: snippets (loaded from Dexie), isLoading (transient), error (transient), selectedSnippetId (transient)
      }),
    }
  )
);

// ============================================================================
// Store Initialization
// ============================================================================

/**
 * Initialize snippet store with built-in templates
 * Call this on app mount to load built-in snippets
 */
export async function initializeSnippetStore(): Promise<void> {
  const store = useSnippetStore.getState();
  await store.loadSnippets(BUILT_IN_SNIPPETS);
}

// ============================================================================
// Re-export Utility Functions for Backward Compatibility
// ============================================================================

export {
  parseSnippetPlaceholders,
  processSnippetForInsertionStandalone as processSnippetForInsertion,
} from './snippet-utils-slice';

// Backward compatibility re-exports
export function getSnippetFolders(snippets: CodeSnippetRecord[]): string[] {
  const store = useSnippetStore.getState();
  return store.getSnippetFolders(snippets);
}

export function getSnippetTags(snippets: CodeSnippetRecord[]): string[] {
  const store = useSnippetStore.getState();
  return store.getSnippetTags(snippets);
}

// ============================================================================
// Selector Hooks (Zustand v5 pattern)
// ============================================================================

/**
 * Get all snippets (filtered)
 */
export function useFilteredSnippets(): CodeSnippetRecord[] {
  const snippets = useSnippetStore((s) => s.snippets);
  const getFiltered = useSnippetStore((s) => s.getFilteredSnippets);
  return getFiltered(snippets);
}

/**
 * Get snippet by ID
 */
export function useSnippet(id: string | null): CodeSnippetRecord | undefined {
  const snippets = useSnippetStore((s) => s.snippets);
  return snippets.find((s) => s.id === id);
}

/**
 * Get all folders
 */
export function useSnippetFolders(): string[] {
  const snippets = useSnippetStore((s) => s.snippets);
  const getFolders = useSnippetStore((s) => s.getSnippetFolders);
  return getFolders(snippets);
}

/**
 * Get all tags
 */
export function useSnippetTags(): string[] {
  const snippets = useSnippetStore((s) => s.snippets);
  const getTags = useSnippetStore((s) => s.getSnippetTags);
  return getTags(snippets);
}

/**
 * Get selected snippet
 */
export function useSelectedSnippet(): CodeSnippetRecord | undefined {
  const selectedSnippetId = useSnippetStore((s) => s.selectedSnippetId);
  return useSnippet(selectedSnippetId);
}
