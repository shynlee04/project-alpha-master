/**
 * @fileoverview Knowledge Store (Main Store - Combined Slices)
 * @module lib/state/knowledge/knowledge-store
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Main knowledge store combining all slices.
 * Persists to IndexedDB via Dexie adapter.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '../dexie-storage';
import type { KnowledgeStoreState } from './types';
import { createSourceCrudSlice } from './slices/knowledge-source-crud-slice';
import { createPreviewSlice } from './slices/knowledge-preview-slice';
import { createCollectionSlice } from './slices/knowledge-collection-slice';
import { createMetadataSlice } from './slices/knowledge-metadata-slice';
import { createSynthesisSlice } from './slices/knowledge-synthesis-slice';
import { createUndoSlice } from './slices/knowledge-undo-slice';

export const useKnowledgeStore = create<KnowledgeStoreState>()(
    persist(
        (set, get, api) => ({
            // Initial state
            sources: [],
            selectedSource: null,
            isPreviewOpen: false,
            loading: false,
            error: null,
            _hasHydrated: false,
            collections: [],
            filteredCollectionId: null,
            undoQueue: [],
            extractingMetadata: new Set<string>(),
            synthesizingSources: new Set<string>(),
            synthesisResults: new Map<string, any>(),

            // Combine all slices
            ...createSourceCrudSlice(set, get, api),
            ...createPreviewSlice(set, get, api),
            ...createCollectionSlice(set, get, api),
            ...createMetadataSlice(set, get, api),
            ...createSynthesisSlice(set, get, api),
            ...createUndoSlice(set, get, api),

            // Common actions
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            reset: () => {
                set({
                    sources: [],
                    selectedSource: null,
                    isPreviewOpen: false,
                    loading: false,
                    error: null,
                    collections: [],
                    filteredCollectionId: null,
                    undoQueue: [],
                    extractingMetadata: new Set<string>(),
                    synthesizingSources: new Set<string>(),
                    synthesisResults: new Map<string, any>(),
                });
            },
        }),
        {
            name: 'knowledge-state',
            storage: createJSONStorage(() => createDexieStorage('conversationState' as any)),
            partialize: (state) => ({
                sources: state.sources,
                selectedSource: state.selectedSource,
                isPreviewOpen: state.isPreviewOpen,
                collections: state.collections,
                filteredCollectionId: state.filteredCollectionId,
            }),
            onRehydrateStorage: () => (state) => {
                console.log('[KnowledgeStore] Rehydrated from IndexedDB:', state?.sources?.length || 0, 'sources,', state?.collections?.length || 0, 'collections');
                if (state) {
                    if (state.selectedSource && !state.sources.find(s => s.id === state.selectedSource?.id)) {
                        state.selectedSource = null;
                        state.isPreviewOpen = false;
                    }
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
