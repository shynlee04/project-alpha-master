/**
 * @fileoverview Unified Knowledge Store
 * @module infrastructure/persistence/stores/knowledge/useKnowledgeStore
 * @governance EPIC-6-3, EPIC-6-4
 *
 * January 2026 Zustand Pattern:
 * - Single store composed from 5 focused slices
 * - Each slice is <120 lines (single responsibility principle)
 * - Dexie IndexedDB persistence (TODO)
 * - Cross-slice communication via get()
 *
 * Slices:
 * - knowledge-sources-slice.ts: Source CRUD operations
 * - knowledge-collections-slice.ts: Collection management
 * - knowledge-metadata-slice.ts: Metadata extraction
 * - knowledge-synthesis-slice.ts: Synthesis operations
 * - knowledge-ui-slice.ts: UI state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  KnowledgeSourcesState,
  KnowledgeCollectionsState,
  KnowledgeMetadataState,
  KnowledgeSynthesisState,
  KnowledgeUIState,
} from './knowledge-types';
import { createKnowledgeSourcesSlice } from './knowledge-sources-slice';
import { createKnowledgeCollectionsSlice } from './knowledge-collections-slice';
import { createKnowledgeMetadataSlice } from './knowledge-metadata-slice';
import { createKnowledgeSynthesisSlice } from './knowledge-synthesis-slice';
import { createKnowledgeUISlice } from './knowledge-ui-slice';

// Combined state interface
type CombinedKnowledgeState =
  KnowledgeSourcesState &
  KnowledgeCollectionsState &
  KnowledgeMetadataState &
  KnowledgeSynthesisState &
  KnowledgeUIState;

/**
 * Unified Knowledge Store
 *
 * Composed from 5 focused slices following January 2026 Zustand pattern.
 * Persists to IndexedDB with Dexie (TODO: add storage adapter).
 */
export const useKnowledgeStore = create<CombinedKnowledgeState>()(
  persist(
    (set, get, api) => ({
      // Compose all slices (each slice initializes its own state)
      ...createKnowledgeSourcesSlice(set, get, api),
      ...createKnowledgeCollectionsSlice(set, get, api),
      ...createKnowledgeMetadataSlice(set, get, api),
      ...createKnowledgeSynthesisSlice(set, get, api),
      ...createKnowledgeUISlice(set, get, api),
    }),
    {
      name: 'knowledge-state',

      // TODO: Add Dexie storage adapter
      // For now using localStorage as temporary storage
      // storage: createDexieStorage('knowledgeState'),

      // Selective persistence (only critical data)
      partialize: (state) => ({
        sources: state.sources,
        selectedSourceId: state.selectedSourceId,
        collections: state.collections,
        filteredCollectionId: state.filteredCollectionId,
        synthesisResults: state.synthesisResults,
        // NOT persisted:
        // - extractingMetadata (ephemeral operation state)
        // - synthesizingSources (ephemeral operation state)
        // - UI state (loading, error, isPreviewOpen)
      }),

      // Hydration handler
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        console.log('[KnowledgeStore] Rehydrated from storage', {
          sourcesCount: Object.keys(state.sources).length,
          collectionsCount: Object.keys(state.collections).length,
        });
        state._hasHydrated = true;
      },
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get selected source
 */
export function useSelectedKnowledgeSource() {
  return useKnowledgeStore((state) => {
    if (!state.selectedSourceId) return null;
    return state.sources[state.selectedSourceId] || null;
  });
}

/**
 * Hook to get all sources
 */
export function useAllKnowledgeSources() {
  return useKnowledgeStore((state) => Object.values(state.sources));
}

/**
 * Hook to get all collections
 */
export function useAllKnowledgeCollections() {
  return useKnowledgeStore((state) => Object.values(state.collections));
}

/**
 * Hook to get filtered sources
 */
export function useFilteredKnowledgeSources() {
  return useKnowledgeStore((state) => state.getFilteredSources(state.sources));
}

/**
 * Hook for metadata extraction state
 */
export function useKnowledgeMetadataExtraction(sourceId: string) {
  return useKnowledgeStore((state) => ({
    isExtracting: state.extractingMetadata.has(sourceId),
  }));
}

/**
 * Hook for synthesis state
 */
export function useKnowledgeSynthesis(sourceId: string) {
  return useKnowledgeStore((state) => ({
    isSynthesizing: state.synthesizingSources.has(sourceId),
    result: state.synthesisResults[sourceId],
  }));
}

/**
 * Hook for hydration status
 */
export function useKnowledgeStoreHydration() {
  return useKnowledgeStore((state) => state._hasHydrated);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Reset the knowledge store to empty state
 * Useful for testing or workspace switching
 */
export function resetKnowledgeStore() {
  useKnowledgeStore.setState({
    sources: {},
    selectedSourceId: null,
    undoQueue: [],
    collections: {},
    filteredCollectionId: null,
    extractingMetadata: new Set<string>(),
    synthesizingSources: new Set<string>(),
    synthesisResults: {},
    isPreviewOpen: false,
    loading: false,
    error: null,
  });
}

/**
 * Get current store state (outside of React)
 * Useful for debugging, testing, or non-React contexts
 */
export function getKnowledgeStoreState() {
  return useKnowledgeStore.getState();
}
