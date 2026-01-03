/**
 * @fileoverview Knowledge Metadata Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-metadata-slice.test.ts
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1148
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestKnowledgeStore } from '../../__tests__/test-store';
import type { SourceRecord, KnowledgeStoreState } from '../../types';

// Mock dexie-db
vi.mock('../../../dexie-db', () => ({
    db: {
        sources: {
            update: vi.fn(),
        },
    },
}));

// Mock metadata-extractor
vi.mock('@/lib/knowledge/metadata-extractor', () => ({
    metadataExtractor: {
        extractAllMetadata: vi.fn(),
    },
}));

describe('knowledge-metadata-slice', () => {
    let store: KnowledgeStoreState;
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        store = createTestKnowledgeStore();
        store.sources = [mockSource];
        vi.clearAllMocks();
    });

    describe('extractMetadata', () => {
        it('should extract metadata using AI', async () => {
            const { metadataExtractor } = await import('@/lib/knowledge/metadata-extractor');
            const extractedMetadata = {
                summary: 'Test summary',
                keyConcepts: ['concept1', 'concept2'],
                suggestedQuestions: ['question1'],
            };
            vi.mocked(metadataExtractor.extractAllMetadata).mockResolvedValue(extractedMetadata);

            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.extractMetadata('source-1');

            expect(metadataExtractor.extractAllMetadata).toHaveBeenCalledWith(mockSource);
            expect(db.sources.update).toHaveBeenCalledWith('source-1', expect.objectContaining({
                ...extractedMetadata,
                metadataExtracted: true,
            }));
        });

        it('should add to extracting set during extraction', async () => {
            const { metadataExtractor } = await import('@/lib/knowledge/metadata-extractor');
            vi.mocked(metadataExtractor.extractAllMetadata).mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({}), 100))
            );

            const extractPromise = store.extractMetadata('source-1');

            expect(store.extractingMetadata.has('source-1')).toBe(true);

            await extractPromise;
            expect(store.extractingMetadata.has('source-1')).toBe(false);
        });

        it('should remove from extracting set after completion', async () => {
            const { metadataExtractor } = await import('@/lib/knowledge/metadata-extractor');
            vi.mocked(metadataExtractor.extractAllMetadata).mockResolvedValue({});

            await store.extractMetadata('source-1');

            expect(store.extractingMetadata.has('source-1')).toBe(false);
        });

        it('should handle source not found', async () => {
            await store.extractMetadata('non-existent');

            expect(store.error).toBe('Source not found or has no content');
        });

        it('should handle source with no content', async () => {
            store.sources = [{ ...mockSource, content: '' }];

            await store.extractMetadata('source-1');

            expect(store.error).toBe('Source not found or has no content');
        });

        it('should handle extraction errors', async () => {
            const { metadataExtractor } = await import('@/lib/knowledge/metadata-extractor');
            vi.mocked(metadataExtractor.extractAllMetadata).mockRejectedValue(new Error('Extraction failed'));

            await store.extractMetadata('source-1');

            expect(store.error).toBe('Extraction failed');
            expect(store.extractingMetadata.has('source-1')).toBe(false);
        });
    });

    describe('updateMetadata', () => {
        it('should update metadata with user corrections', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const metadata = {
                summary: 'Updated summary',
                keyConcepts: ['new concept'],
                suggestedQuestions: ['new question'],
            };

            await store.updateMetadata('source-1', metadata);

            expect(db.sources.update).toHaveBeenCalledWith('source-1', expect.objectContaining({
                ...metadata,
                metadataEdited: true,
            }));
        });

        it('should update source in local state', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const metadata = { summary: 'Updated summary' };
            await store.updateMetadata('source-1', metadata);

            expect(store.sources[0].summary).toBe('Updated summary');
        });

        it('should update selected source if matches', async () => {
            store.selectedSource = mockSource;
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const metadata = { summary: 'Updated summary' };
            await store.updateMetadata('source-1', metadata);

            expect(store.selectedSource?.summary).toBe('Updated summary');
        });

        it('should handle source not found', async () => {
            await store.updateMetadata('non-existent', { summary: 'Updated' });

            expect(store.error).toBe('Source not found');
        });
    });

    describe('updateProcessingStatus', () => {
        it('should update processing status', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.updateProcessingStatus('source-1', 'processing');

            expect(db.sources.update).toHaveBeenCalledWith('source-1', expect.objectContaining({
                processingStatus: 'processing',
            }));
        });

        it('should update with error message', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.updateProcessingStatus('source-1', 'failed', 'Processing failed');

            expect(db.sources.update).toHaveBeenCalledWith('source-1', expect.objectContaining({
                processingStatus: 'failed',
                processingError: 'Processing failed',
            }));
        });
    });
});
