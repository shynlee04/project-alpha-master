/**
 * @fileoverview Knowledge Preview Slice
 * @module infrastructure/persistence/stores/knowledge/slices/knowledge-preview-slice
 * @governance Epic 53-3 (State Management Consolidation)
 * @canonical This is the canonical location per ADR-024
 *
 * Preview panel state slice for knowledge store.
 * Manages open/close state of the source preview panel.
 */

import { StateCreator } from 'zustand';
import type { SourceRecord, KnowledgeStoreState } from '../types';

export interface PreviewState {
    /** Open preview panel with source */
    openPreview: (source: SourceRecord) => void;

    /** Close preview panel */
    closePreview: () => void;
}

export const createPreviewSlice: StateCreator<KnowledgeStoreState, [], []> = (set, _get, _api) => ({
    openPreview: (source) => {
        set({ selectedSource: source, isPreviewOpen: true });
    },

    closePreview: () => {
        set({ isPreviewOpen: false, selectedSource: null });
    },
});
