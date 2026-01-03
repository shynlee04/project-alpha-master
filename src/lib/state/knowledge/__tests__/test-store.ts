/**
 * @fileoverview Test Helper for Knowledge Store
 * @module lib/state/knowledge/__tests__/test-store
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1149
 *
 * Test helper that creates a combined knowledge store for testing.
 */

import { create } from 'zustand';
import type { KnowledgeStoreState } from '../types';
import { createSourceCrudSlice } from '../slices/knowledge-source-crud-slice';
import { createPreviewSlice } from '../slices/knowledge-preview-slice';
import { createCollectionSlice } from '../slices/knowledge-collection-slice';
import { createMetadataSlice } from '../slices/knowledge-metadata-slice';
import { createSynthesisSlice } from '../slices/knowledge-synthesis-slice';
import { createUndoSlice } from '../slices/knowledge-undo-slice';

export function createTestKnowledgeStore() {
    return create<KnowledgeStoreState>()((set, get, api) => ({
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
    }));
}
