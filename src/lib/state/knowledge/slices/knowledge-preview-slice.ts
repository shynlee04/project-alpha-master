/**
 * @fileoverview Knowledge Preview Slice
 * @module lib/state/knowledge/slices/knowledge-preview-slice
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
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

export const createPreviewSlice: StateCreator<KnowledgeStoreState> = (set, get, api) => ({
    openPreview: (source) => {
        set({ selectedSource: source, isPreviewOpen: true });
    },

    closePreview: () => {
        set({ isPreviewOpen: false, selectedSource: null });
    },
});
