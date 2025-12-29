/**
 * @fileoverview Knowledge Store Metadata Actions Tests (Story 6.4)
 * @module lib/state/__tests__/knowledge-store-metadata
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKnowledgeStore, type SourceMetadataFields } from '../knowledge-store';
import type { SourceRecord } from '../dexie-db';

// Mock Dexie database
vi.mock('../dexie-db', () => ({
    db: {
        sources: {
            update: vi.fn().mockResolvedValue(undefined),
        },
    },
    getCollectionsForProject: vi.fn().mockResolvedValue([]),
}));

// Mock metadata extractor
vi.mock('@/lib/knowledge/metadata-extractor', () => ({
    metadataExtractor: {
        extractAllMetadata: vi.fn().mockResolvedValue({
            summary: 'Test summary',
            keyConcepts: ['concept1', 'concept2', 'concept3'],
            suggestedQuestions: ['question1?', 'question2?', 'question3?'],
            metadataExtracted: true,
            metadataEdited: false,
        }),
    },
}));

describe('Knowledge Store Metadata Actions (Story 6.4)', () => {
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'test-project',
        type: 'text',
        title: 'Test Source',
        content: 'Test content with enough text to analyze.',
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store state
        const { result } = renderHook(() => useKnowledgeStore());
        act(() => {
            result.current.reset();
            result.current.setHasHydrated(true);
        });
    });

    describe('extractMetadata', () => {
        it('should extract metadata for a source', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            // Set up initial state with a source
            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                // Manually set sources since we're not going through loadSources
                (result.current as any).setState({
                    sources: [mockSource],
                });
            });

            // Extract metadata
            await act(async () => {
                await result.current.extractMetadata(mockSource.id);
            });

            await waitFor(() => {
                const sources = result.current.sources;
                expect(sources).toHaveLength(1);
                expect(sources[0].summary).toBe('Test summary');
                expect(sources[0].keyConcepts).toEqual(['concept1', 'concept2', 'concept3']);
                expect(sources[0].suggestedQuestions).toEqual(['question1?', 'question2?', 'question3?']);
                expect(sources[0].metadataExtracted).toBe(true);
            });
        });

        it('should add source to extracting set during extraction', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            // Set up initial state
            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                (result.current as any).setState({
                    sources: [mockSource],
                });
            });

            // Extract metadata
            const extractPromise = act(async () => {
                await result.current.extractMetadata(mockSource.id);
            });

            // Check that source is in extracting set
            expect(result.current.extractingMetadata.has(mockSource.id)).toBe(true);

            await extractPromise;

            // Check that source is removed from extracting set
            await waitFor(() => {
                expect(result.current.extractingMetadata.has(mockSource.id)).toBe(false);
            });
        });

        it('should update selected source if it matches', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            // Set up initial state with selected source
            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                (result.current as any).setState({
                    sources: [mockSource],
                    selectedSource: mockSource,
                });
            });

            // Extract metadata
            await act(async () => {
                await result.current.extractMetadata(mockSource.id);
            });

            await waitFor(() => {
                expect(result.current.selectedSource?.summary).toBe('Test summary');
                expect(result.current.selectedSource?.keyConcepts).toEqual(['concept1', 'concept2', 'concept3']);
            });
        });

        it('should handle missing source gracefully', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
            });

            // Try to extract metadata for non-existent source
            await act(async () => {
                await result.current.extractMetadata('non-existent');
            });

            // Should set error
            expect(result.current.error).toBe('Source not found or has no content');
        });

        it('should handle source with no content gracefully', async () => {
            const { result } = renderHook(() => useKnowledgeStore());
            const sourceWithoutContent: SourceRecord = {
                ...mockSource,
                content: '',
            };

            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                (result.current as any).setState({
                    sources: [sourceWithoutContent],
                });
            });

            // Try to extract metadata for source with no content
            await act(async () => {
                await result.current.extractMetadata(sourceWithoutContent.id);
            });

            // Should set error
            expect(result.current.error).toBe('Source not found or has no content');
        });
    });

    describe('updateMetadata', () => {
        it('should update metadata for a source', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            const sourceWithMetadata: SourceRecord = {
                ...mockSource,
                summary: 'Original summary',
                keyConcepts: ['concept1'],
                suggestedQuestions: ['question1?'],
            };

            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                (result.current as any).setState({
                    sources: [sourceWithMetadata],
                });
            });

            const updatedMetadata: SourceMetadataFields = {
                summary: 'Updated summary',
                keyConcepts: ['concept1', 'concept2', 'concept3'],
                suggestedQuestions: ['question1?', 'question2?', 'question3?'],
            };

            await act(async () => {
                await result.current.updateMetadata(sourceWithMetadata.id, updatedMetadata);
            });

            const sources = result.current.sources;
            expect(sources).toHaveLength(1);
            expect(sources[0].summary).toBe('Updated summary');
            expect(sources[0].keyConcepts).toEqual(['concept1', 'concept2', 'concept3']);
            expect(sources[0].suggestedQuestions).toEqual(['question1?', 'question2?', 'question3?']);
            expect(sources[0].metadataEdited).toBe(true);
        });

        it('should update selected source if it matches', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            const sourceWithMetadata: SourceRecord = {
                ...mockSource,
                summary: 'Original summary',
            };

            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
                (result.current as any).setState({
                    sources: [sourceWithMetadata],
                    selectedSource: sourceWithMetadata,
                });
            });

            const updatedMetadata: SourceMetadataFields = {
                summary: 'Updated summary',
            };

            await act(async () => {
                await result.current.updateMetadata(sourceWithMetadata.id, updatedMetadata);
            });

            expect(result.current.selectedSource?.summary).toBe('Updated summary');
            expect(result.current.selectedSource?.metadataEdited).toBe(true);
        });

        it('should handle missing source gracefully', async () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.reset();
                result.current.setHasHydrated(true);
            });

            const updatedMetadata: SourceMetadataFields = {
                summary: 'Updated summary',
            };

            await act(async () => {
                await result.current.updateMetadata('non-existent', updatedMetadata);
            });

            // Should set error
            expect(result.current.error).toBe('Source not found');
        });
    });

    describe('extractingMetadata state', () => {
        it('should initialize as empty set', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            expect(result.current.extractingMetadata).toBeInstanceOf(Set);
            expect(result.current.extractingMetadata.size).toBe(0);
        });

        it('should reset extracting set when store resets', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                (result.current as any).setState({
                    extractingMetadata: new Set(['source-1', 'source-2']),
                });
            });

            expect(result.current.extractingMetadata.size).toBe(2);

            act(() => {
                result.current.reset();
            });

            expect(result.current.extractingMetadata.size).toBe(0);
        });
    });
});
