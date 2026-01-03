/**
 * @fileoverview Knowledge Synthesis Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-synthesis-slice.test.ts
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1148
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestKnowledgeStore } from '../../__tests__/test-store';
import type { SourceRecord, KnowledgeStoreState } from '../../types';

// Mock dexie-db
vi.mock('../../../dexie-db', () => ({
    db: {},
    createSynthesisResult: vi.fn(),
    updateSynthesisResultStatus: vi.fn(),
    getSynthesisResultForSource: vi.fn(),
}));

// Mock synthesis-service
vi.mock('@/lib/knowledge/synthesis-service', () => ({
    SynthesisService: {
        create: vi.fn(),
    },
}));

describe('knowledge-synthesis-slice', () => {
    let store: KnowledgeStoreState;
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF',
        content: 'Test content for synthesis',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        store = createTestKnowledgeStore();
        store.sources = [mockSource];
        vi.clearAllMocks();
    });

    describe('synthesizeSource', () => {
        beforeEach(() => {
            console.log = vi.fn();
            console.error = vi.fn();
        });

        it('should synthesize source using AI', async () => {
            const { createSynthesisResult, updateSynthesisResultStatus, getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');
            vi.mocked(updateSynthesisResultStatus).mockResolvedValue(undefined);
            vi.mocked(getSynthesisResultForSource).mockResolvedValue({
                id: 'synthesis-1',
                sourceId: 'source-1',
                status: 'completed',
                frontmatter: { title: 'Synthesized' },
            } as any);

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            const mockService = {
                synthesize: vi.fn().mockResolvedValue({
                    frontmatter: { title: 'Synthesized' },
                }),
            };
            vi.mocked(SynthesisService.create).mockResolvedValue(mockService as any);

            await store.synthesizeSource('source-1');

            expect(createSynthesisResult).toHaveBeenCalledWith('source-1', 'project-1', 'pdf');
            expect(SynthesisService.create).toHaveBeenCalledWith('gemini', undefined);
        });

        it('should add to synthesizing set during synthesis', async () => {
            const { createSynthesisResult } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            vi.mocked(SynthesisService.create).mockResolvedValue({
                synthesize: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 100))),
            });

            const synthesizePromise = store.synthesizeSource('source-1');

            expect(store.synthesizingSources.has('source-1')).toBe(true);

            await synthesizePromise;
        });

        it('should remove from synthesizing set after completion', async () => {
            const { createSynthesisResult, getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');
            vi.mocked(getSynthesisResultForSource).mockResolvedValue({ id: 'synthesis-1' } as any);

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            vi.mocked(SynthesisService.create).mockResolvedValue({
                synthesize: vi.fn().mockResolvedValue({ frontmatter: {} }),
            } as any);

            await store.synthesizeSource('source-1');

            expect(store.synthesizingSources.has('source-1')).toBe(false);
        });

        it('should cache synthesis result', async () => {
            const { createSynthesisResult, getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');
            const mockResult = { id: 'synthesis-1', sourceId: 'source-1', status: 'completed' };
            vi.mocked(getSynthesisResultForSource).mockResolvedValue(mockResult as any);

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            vi.mocked(SynthesisService.create).mockResolvedValue({
                synthesize: vi.fn().mockResolvedValue({ frontmatter: {} }),
            } as any);

            await store.synthesizeSource('source-1');

            expect(store.synthesisResults.get('source-1')).toEqual(mockResult);
        });

        it('should handle source not found', async () => {
            await store.synthesizeSource('non-existent');

            expect(store.error).toBe('Source not found or has no content');
        });

        it('should handle source with no content', async () => {
            store.sources = [{ ...mockSource, content: '' }];

            await store.synthesizeSource('source-1');

            expect(store.error).toBe('Source not found or has no content');
        });

        it('should handle synthesis errors', async () => {
            const { createSynthesisResult, updateSynthesisResultStatus, getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');
            vi.mocked(getSynthesisResultForSource).mockResolvedValue({ id: 'synthesis-1' } as any);
            vi.mocked(updateSynthesisResultStatus).mockResolvedValue(undefined);

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            vi.mocked(SynthesisService.create).mockResolvedValue({
                synthesize: vi.fn().mockRejectedValue(new Error('Synthesis failed')),
            } as any);

            await store.synthesizeSource('source-1');

            expect(store.error).toBe('Synthesis failed');
            expect(updateSynthesisResultStatus).toHaveBeenCalledWith('synthesis-1', 'failed', undefined, 'Synthesis failed');
        });
    });

    describe('loadSynthesisResult', () => {
        it('should load synthesis result for source', async () => {
            const { getSynthesisResultForSource } = await import('../../../dexie-db');
            const mockResult = { id: 'synthesis-1', sourceId: 'source-1', status: 'completed' };
            vi.mocked(getSynthesisResultForSource).mockResolvedValue(mockResult as any);

            await store.loadSynthesisResult('source-1');

            expect(store.synthesisResults.get('source-1')).toEqual(mockResult);
        });

        it('should handle no result found', async () => {
            const { getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(getSynthesisResultForSource).mockResolvedValue(null);

            await store.loadSynthesisResult('source-1');

            expect(store.synthesisResults.has('source-1')).toBe(false);
        });

        it('should handle errors gracefully', async () => {
            const { getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(getSynthesisResultForSource).mockRejectedValue(new Error('DB Error'));

            await store.loadSynthesisResult('source-1');

            expect(store.error).toBe('DB Error');
        });
    });

    describe('onProgress callback', () => {
        it('should call onProgress during synthesis', async () => {
            const { createSynthesisResult, getSynthesisResultForSource } = await import('../../../dexie-db');
            vi.mocked(createSynthesisResult).mockResolvedValue('synthesis-1');
            vi.mocked(getSynthesisResultForSource).mockResolvedValue({ id: 'synthesis-1' } as any);

            const { SynthesisService } = await import('@/lib/knowledge/synthesis-service');
            const onProgress = vi.fn();
            vi.mocked(SynthesisService.create).mockResolvedValue({
                synthesize: vi.fn().mockImplementation(async (_source: any, options: any) => {
                    options.onProgress?.({ progress: 0.5 });
                    return { frontmatter: {} };
                }),
            } as any);

            await store.synthesizeSource('source-1');

            expect(onProgress).toHaveBeenCalled();
        });
    });
});
