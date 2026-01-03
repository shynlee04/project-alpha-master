/**
 * @fileoverview Knowledge Synthesis Slice
 * @module lib/state/knowledge/slices/knowledge-synthesis-slice
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Synthesis slice for knowledge store.
 * Manages AI synthesis functionality and result caching.
 */

import { StateCreator } from 'zustand';
import type { KnowledgeStoreState } from '../types';
import {
    db,
    createSynthesisResult as dbCreateSynthesisResult,
    updateSynthesisResultStatus as dbUpdateSynthesisResultStatus,
    getSynthesisResultForSource as dbGetSynthesisResultForSource,
} from '../../dexie-db';
import { SynthesisService } from '@/lib/knowledge/synthesis-service';

export interface SynthesisState {
    synthesizeSource: (sourceId: string) => Promise<void>;
    loadSynthesisResult: (sourceId: string) => Promise<void>;
}

export const createSynthesisSlice: StateCreator<KnowledgeStoreState> = (set, get, api) => ({
    synthesizeSource: async (sourceId: string) => {
        const source = get().sources.find(s => s.id === sourceId);
        if (!source || !source.content) {
            set({ error: 'Source not found or has no content' });
            return;
        }

        set((state) => ({ synthesizingSources: new Set([...state.synthesizingSources, sourceId]) }));

        try {
            const synthesisId = await dbCreateSynthesisResult(sourceId, source.projectId, source.type);
            await dbUpdateSynthesisResultStatus(synthesisId, 'pending');

            const providerId = 'gemini';
            const modelId = undefined;
            const synthesisService = await SynthesisService.create(providerId, modelId);

            const sourceDocument = {
                id: source.id,
                title: source.title,
                type: source.type,
                content: source.content,
                metadata: {} as Record<string, unknown>,
            };

            const result = await synthesisService.synthesize(sourceDocument, {
                onProgress: (progress) => {
                    console.log('[KSI] Synthesis progress:', progress);
                },
            });

            await dbUpdateSynthesisResultStatus(
                synthesisId,
                'completed',
                result.frontmatter as any
            );

            await get().loadSynthesisResult(sourceId);

        } catch (error) {
            console.error('[KSI] Synthesis failed:', error);
            set({ error: (error as Error).message });

            const synthesisResult = await dbGetSynthesisResultForSource(sourceId);
            if (synthesisResult) {
                await dbUpdateSynthesisResultStatus(
                    synthesisResult.id,
                    'failed',
                    undefined,
                    (error as Error).message
                );
            }
        } finally {
            set((state) => {
                const newSet = new Set(state.synthesizingSources);
                newSet.delete(sourceId);
                return { synthesizingSources: newSet };
            });
        }
    },

    loadSynthesisResult: async (sourceId: string) => {
        try {
            const result = await dbGetSynthesisResultForSource(sourceId);
            if (result) {
                set((state) => {
                    const newMap = new Map(state.synthesisResults);
                    newMap.set(sourceId, result);
                    return { synthesisResults: newMap };
                });
            }
        } catch (error) {
            console.error('[KSI] Failed to load synthesis result:', error);
            set({ error: (error as Error).message });
        }
    },
});
