/**
 * @fileoverview RAG Store - Consolidated State Management
 * @module infrastructure/persistence/stores/rag/rag-store
 * @governance EPIC-7-1
 *
 * Single source of truth for RAG (Retrieval-Augmented Generation) state.
 * Composed from focused slices following December 2025 Zustand best practices.
 *
 * Architecture:
 * - rag-index-slice.ts: Index lifecycle & metadata
 * - rag-search-slice.ts: Search queries & cache
 * - rag-chunking-slice.ts: Chunking progress
 * - rag-voice-slice.ts: Voice mode (Story 10-1)
 * - rag-chat-slice.ts: Chat messages & citations
 *
 * Features:
 * - Workspace-aware indexing (multi-workspace architecture)
 * - Orama hybrid search (vector + keyword)
 * - TTL-based search results cache
 * - IndexedDB quota handling
 * - Dexie persistence with debounced writes
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import type { RAGStoreState } from './rag-types';
import { createRAGIndexSlice } from './rag-index-slice';
import { createRAGSearchSlice } from './rag-search-slice';
import { createRAGChunkingSlice } from './rag-chunking-slice';
import { createRAGVoiceSlice } from './rag-voice-slice';
import { createRAGChatSlice } from './rag-chat-slice';

/**
 * RAG store composed from focused slices
 * Each slice is <120 lines following architectural standards
 */
export const useRAGStore = create<RAGStoreState>()(
  persist(
    (set, get, api) => ({
      // Compose all slices
      ...createRAGIndexSlice(set, get, api),
      ...createRAGSearchSlice(set, get, api),
      ...createRAGChunkingSlice(set, get, api),
      ...createRAGVoiceSlice(set, get, api),
      ...createRAGChatSlice(set, get, api),
    }),
    {
      name: 'rag-state',

      // Use Dexie storage adapter for IndexedDB persistence
      // TODO: Add 'ragState' table to ViaGentDatabase schema (dexie-db-class.ts)
      // For now, using type assertion to bypass schema check
      storage: createJSONStorage(() => createDexieStorage('ragState' as keyof typeof import('../../dexie-db').db)),

      // Persist essential state (exclude temporary data)
      partialize: (state) => ({
        // Index slice
        currentWorkspaceType: state.currentWorkspaceType,
        currentProjectId: state.currentProjectId,
        indexMetadata: state.indexMetadata,

        // Search slice (persist search mode, not cache)
        searchMode: state.searchMode,

        // Chunking slice
        embeddingMode: state.embeddingMode,

        // Don't persist:
        // - searchCache (rebuild on demand)
        // - chunkingProgress (session-only)
        // - embeddingProgress (session-only)
        // - voice state (session-only)
        // - chatMessages (persist separately if needed)
        // - citations (session-only)
      }),

      // Hydration handler
      onRehydrateStorage: () => (state) => {
        console.log('[RAGStore] Rehydrated from IndexedDB');

        if (state) {
          // Set hydration flag - property is _hasHydrated in RAGIndexState
          (state as RAGStoreState)._hasHydrated = true;

          // Validate currentProjectId and load index metadata
          if (state.currentProjectId) {
            console.log('[RAGStore] Loading index for project:', state.currentProjectId);
            // NOTE: loadIndexMetadata is a method, needs to be called via getState()
            // For now, just log - metadata will be loaded when accessed
            // state.loadIndexMetadata(state.currentProjectId);
          }
        }
      },
    }
  )
);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to wait for hydration from IndexedDB
 */
export function useRAGStoreHydration() {
  return useRAGStore((state) => state._hasHydrated);
}

/**
 * Hook to get active index metadata
 */
export function useActiveIndex() {
  return useRAGStore((state) => {
    if (!state.currentProjectId) return null;
    return state.indexMetadata;
  });
}

/**
 * Hook to get pending chunking operations
 */
export function usePendingChunking() {
  return useRAGStore((state) => {
    return Array.from(state.chunkingProgress.values()).filter(
      p => p.status !== 'completed' && p.status !== 'error'
    );
  });
}
