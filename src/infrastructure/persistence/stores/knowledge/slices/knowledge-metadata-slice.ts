/**
 * @fileoverview Knowledge Metadata Slice
 * @module infrastructure/persistence/stores/knowledge/slices/knowledge-metadata-slice
 * @governance Epic 53-3 (State Management Consolidation)
 * @canonical This is the canonical location per ADR-024
 *
 * Metadata extraction slice for knowledge store.
 * Manages AI metadata extraction and user editing.
 */

import { StateCreator } from 'zustand';
import type { SourceMetadataFields, KnowledgeStoreState } from '../types';
import { db } from '../../../dexie-db';
import { metadataExtractor } from '@/lib/knowledge/metadata-extractor';

export interface MetadataState {
    extractMetadata: (sourceId: string) => Promise<void>;
    updateMetadata: (sourceId: string, metadata: SourceMetadataFields) => Promise<void>;
    updateProcessingStatus: (sourceId: string, status: 'pending' | 'processing' | 'completed' | 'failed', error?: string) => Promise<void>;
}

export const createMetadataSlice: StateCreator<KnowledgeStoreState, [], [], MetadataState> = (set, get, _api) => ({
    extractMetadata: async (sourceId: string) => {
        const source = get().sources.find(s => s.id === sourceId);
        if (!source || !source.content) {
            set({ error: 'Source not found or has no content' });
            return;
        }

        set((state) => ({ extractingMetadata: new Set([...state.extractingMetadata, sourceId]) }));

        try {
            const metadata = await metadataExtractor.extractAllMetadata(source);
            await db.sources.update(sourceId, { ...metadata, metadataExtracted: true, updatedAt: Date.now() });
            set((state) => ({
                sources: state.sources.map(s => s.id === sourceId ? { ...s, ...metadata, metadataExtracted: true, updatedAt: Date.now() } : s),
                selectedSource: state.selectedSource?.id === sourceId ? { ...state.selectedSource, ...metadata, metadataExtracted: true, updatedAt: Date.now() } : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set((state) => {
                const newSet = new Set(state.extractingMetadata);
                newSet.delete(sourceId);
                return { extractingMetadata: newSet };
            });
        }
    },

    updateMetadata: async (sourceId: string, metadata: SourceMetadataFields) => {
        const source = get().sources.find(s => s.id === sourceId);
        if (!source) {
            set({ error: 'Source not found' });
            return;
        }

        try {
            await db.sources.update(sourceId, { ...metadata, metadataEdited: true, updatedAt: Date.now() });
            set((state) => ({
                sources: state.sources.map(s => s.id === sourceId ? { ...s, ...metadata, metadataEdited: true, updatedAt: Date.now() } : s),
                selectedSource: state.selectedSource?.id === sourceId ? { ...state.selectedSource, ...metadata, metadataEdited: true, updatedAt: Date.now() } : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateProcessingStatus: async (sourceId: string, status: 'pending' | 'processing' | 'completed' | 'failed', processingError?: string) => {
        try {
            await db.sources.update(sourceId, { processingStatus: status, processingError, updatedAt: Date.now() } as any);
            set((state) => ({
                sources: state.sources.map(s => s.id === sourceId ? { ...s, processingStatus: status, processingError } as any : s),
                selectedSource: state.selectedSource?.id === sourceId ? { ...state.selectedSource, processingStatus: status, processingError } as any : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
});
