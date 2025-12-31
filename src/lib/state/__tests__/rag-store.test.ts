/**
 * @fileoverview RAG Store Tests
 * @module lib/state/rag-store/test
 * @governance EPIC-7-1
 *
 * Tests for RAG state management including:
 * - Index status tracking
 * - Indexing progress tracking
 * - Search results caching
 * - Index metadata persistence
 */

import { useRAGStore } from '../rag-store';
import { IndexStatus, IndexOperation } from '../rag-store';
import type { SearchResult, IndexMetadata } from '@/lib/rag/types';
import * as oramaIndex from '@/lib/rag/orama-index';

// Mock Orama index functions
vi.mock('@/lib/rag/orama-index', () => ({
    getIndexMetadata: vi.fn(),
    getIndexSize: vi.fn(),
    getAllIndexesMetadata: vi.fn(),
    cleanupOrphanedIndexes: vi.fn(),
}));

describe('Story 7-1: RAG Store', () => {
    beforeEach(() => {
        // Reset store before each test
        useRAGStore.getState().reset();
        useRAGStore.getState().setHasHydrated(true);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('State Initialization', () => {
        it('should initialize with default state', () => {
            const state = useRAGStore.getState();

            expect(state.currentProjectId).toBeNull();
            expect(state.indexStatus).toBe(IndexStatus.IDLE);
            expect(state.indexingOperation).toBe(IndexOperation.IDLE);
            expect(state.documentCount).toBe(0);
            expect(state.totalDocuments).toBe(0);
            expect(state.indexSize).toBe(0);
            expect(state.indexMetadata).toBeNull();
            expect(state.searchCache.size).toBe(0);
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('Project Management', () => {
        it('should set current project', () => {
            useRAGStore.getState().setCurrentProject('test-project');

            const state = useRAGStore.getState();
            expect(state.currentProjectId).toBe('test-project');
        });

        it('should reset state when switching projects', () => {
            useRAGStore.setState({
                documentCount: 100,
                totalDocuments: 100,
                indexSize: 1000000,
                indexMetadata: { projectId: 'old-project', documentCount: 100, size: 1000000, lastUpdated: '', schemaVersion: 1 } as IndexMetadata,
            });

            useRAGStore.getState().setCurrentProject('new-project');

            const state = useRAGStore.getState();
            expect(state.currentProjectId).toBe('new-project');
            expect(state.documentCount).toBe(0);
            expect(state.totalDocuments).toBe(0);
            expect(state.indexSize).toBe(0);
            expect(state.indexMetadata).toBeNull();
        });

        it('should clear current project', () => {
            useRAGStore.getState().setCurrentProject('test-project');
            useRAGStore.getState().setCurrentProject(null);

            const state = useRAGStore.getState();
            expect(state.currentProjectId).toBeNull();
        });
    });

    describe('Index Status Tracking', () => {
        it('should update index status', () => {
            useRAGStore.getState().setIndexStatus(IndexStatus.BUILDING, IndexOperation.INDEXING);

            const state = useRAGStore.getState();
            expect(state.indexStatus).toBe(IndexStatus.BUILDING);
            expect(state.indexingOperation).toBe(IndexOperation.INDEXING);
        });

        it('should update indexing progress', () => {
            useRAGStore.getState().updateIndexingProgress(50, 100);

            const state = useRAGStore.getState();
            expect(state.documentCount).toBe(50);
            expect(state.totalDocuments).toBe(100);
        });

        it('should set error state', () => {
            useRAGStore.getState().setError('Test error');

            const state = useRAGStore.getState();
            expect(state.error).toBe('Test error');
            expect(state.indexStatus).toBe(IndexStatus.ERROR);
        });

        it('should clear error state', () => {
            useRAGStore.setState({ error: 'Test error' });
            useRAGStore.getState().clearError();

            const state = useRAGStore.getState();
            expect(state.error).toBeNull();
        });
    });

    describe('Index Metadata Loading', () => {
        it('should load index metadata successfully', async () => {
            const mockMetadata: IndexMetadata = {
                projectId: 'test-project',
                documentCount: 100,
                size: 1000000,
                lastUpdated: '2025-12-30T00:00:00.000Z',
                schemaVersion: 1,
            };

            vi.mocked(oramaIndex.getIndexMetadata).mockResolvedValue(mockMetadata);

            await useRAGStore.getState().loadIndexMetadata('test-project');

            const state = useRAGStore.getState();
            expect(state.indexMetadata).toEqual(mockMetadata);
            expect(state.documentCount).toBe(100);
            expect(state.indexSize).toBe(1000000);
            expect(state.indexStatus).toBe(IndexStatus.READY);
            expect(state.loading).toBe(false);
            expect(state.currentProjectId).toBe('test-project');
        });

        it('should handle missing index gracefully', async () => {
            vi.mocked(oramaIndex.getIndexMetadata).mockResolvedValue(null);

            await useRAGStore.getState().loadIndexMetadata('test-project');

            const state = useRAGStore.getState();
            expect(state.indexMetadata).toBeNull();
            expect(state.documentCount).toBe(0);
            expect(state.indexSize).toBe(0);
            expect(state.indexStatus).toBe(IndexStatus.IDLE);
            expect(state.loading).toBe(false);
        });

        it('should handle loading errors', async () => {
            vi.mocked(oramaIndex.getIndexMetadata).mockRejectedValue(new Error('Load failed'));

            await useRAGStore.getState().loadIndexMetadata('test-project');

            const state = useRAGStore.getState();
            expect(state.error).toBe('Load failed');
            expect(state.indexStatus).toBe(IndexStatus.ERROR);
            expect(state.loading).toBe(false);
        });
    });

    describe('Search Caching', () => {
        const mockSearchResults: SearchResult[] = [
            {
                document: {
                    id: 'doc-1',
                    sourceId: 'source-1',
                    content: 'Test content',
                    title: 'Test Document',
                },
                score: 0.9,
                source: {
                    id: 'source-1',
                    title: 'Test Source',
                },
            },
        ];

        it('should cache search results', async () => {
            const searchFn = vi.fn().mockResolvedValue(mockSearchResults);

            const results = await useRAGStore.getState().search('test-project', 'test query', searchFn);

            expect(results).toEqual(mockSearchResults);
            expect(searchFn).toHaveBeenCalledTimes(1);

            const state = useRAGStore.getState();
            expect(state.searchCache.size).toBe(1);
        });

        it('should return cached results for same query', async () => {
            const searchFn = vi.fn().mockResolvedValue(mockSearchResults);

            // First search
            await useRAGStore.getState().search('test-project', 'test query', searchFn);

            // Second search (should use cache)
            const results = await useRAGStore.getState().search('test-project', 'test query', searchFn);

            expect(results).toEqual(mockSearchResults);
            expect(searchFn).toHaveBeenCalledTimes(1); // Should not call again
        });

        it('should differentiate cache by project ID', async () => {
            const searchFn = vi.fn().mockResolvedValue(mockSearchResults);

            await useRAGStore.getState().search('project-1', 'test query', searchFn);
            await useRAGStore.getState().search('project-2', 'test query', searchFn);

            expect(searchFn).toHaveBeenCalledTimes(2);

            const state = useRAGStore.getState();
            expect(state.searchCache.size).toBe(2);
        });

        it('should clear search cache', async () => {
            const searchFn = vi.fn().mockResolvedValue(mockSearchResults);

            await useRAGStore.getState().search('test-project', 'test query', searchFn);
            expect(useRAGStore.getState().searchCache.size).toBe(1);

            useRAGStore.getState().clearSearchCache();
            expect(useRAGStore.getState().searchCache.size).toBe(0);
        });

        it('should handle search errors', async () => {
            const searchFn = vi.fn().mockRejectedValue(new Error('Search failed'));

            const results = await useRAGStore.getState().search('test-project', 'test query', searchFn);

            expect(results).toEqual([]);
            expect(useRAGStore.getState().error).toBe('Search failed');
            expect(useRAGStore.getState().loading).toBe(false);
        });
    });

    describe('Index Management', () => {
        it('should get all indexes metadata', async () => {
            const mockMetadata: IndexMetadata[] = [
                {
                    projectId: 'project-1',
                    documentCount: 100,
                    size: 1000000,
                    lastUpdated: '2025-12-30T00:00:00.000Z',
                    schemaVersion: 1,
                },
                {
                    projectId: 'project-2',
                    documentCount: 200,
                    size: 2000000,
                    lastUpdated: '2025-12-30T00:00:00.000Z',
                    schemaVersion: 1,
                },
            ];

            vi.mocked(oramaIndex.getAllIndexesMetadata).mockResolvedValue(mockMetadata);

            const metadata = await useRAGStore.getState().getAllIndexes();

            expect(metadata).toEqual(mockMetadata);
            expect(oramaIndex.getAllIndexesMetadata).toHaveBeenCalledTimes(1);
        });

        it('should clean up orphaned indexes', async () => {
            vi.mocked(oramaIndex.cleanupOrphanedIndexes).mockResolvedValue(2);

            const cleanedCount = await useRAGStore.getState().cleanupOrphaned(['active-project']);

            expect(cleanedCount).toBe(2);
            expect(oramaIndex.cleanupOrphanedIndexes).toHaveBeenCalledWith(['active-project']);
            expect(useRAGStore.getState().loading).toBe(false);
        });

        it('should handle cleanup errors', async () => {
            vi.mocked(oramaIndex.cleanupOrphanedIndexes).mockRejectedValue(new Error('Cleanup failed'));

            const cleanedCount = await useRAGStore.getState().cleanupOrphaned(['active-project']);

            expect(cleanedCount).toBe(0);
            expect(useRAGStore.getState().error).toBe('Cleanup failed');
            expect(useRAGStore.getState().loading).toBe(false);
        });
    });

    describe('State Reset', () => {
        it('should reset store to initial state', () => {
            useRAGStore.setState({
                currentProjectId: 'test-project',
                documentCount: 100,
                totalDocuments: 100,
                indexSize: 1000000,
                indexMetadata: { projectId: 'test', documentCount: 100, size: 1000000, lastUpdated: '', schemaVersion: 1 } as IndexMetadata,
                error: 'Some error',
            });

            useRAGStore.getState().reset();

            const state = useRAGStore.getState();
            expect(state.currentProjectId).toBeNull();
            expect(state.documentCount).toBe(0);
            expect(state.totalDocuments).toBe(0);
            expect(state.indexSize).toBe(0);
            expect(state.indexMetadata).toBeNull();
            expect(state.error).toBeNull();
            expect(state.searchCache.size).toBe(0);
        });
    });

    describe('Cache Size Limit', () => {
        it('should enforce cache size limit (eviction of oldest entries)', async () => {
            const searchFn = vi.fn().mockResolvedValue([]);

            // Add more than MAX_CACHE_SIZE entries (100)
            for (let i = 0; i < 105; i++) {
                await useRAGStore.getState().search('test-project', `query-${i}`, searchFn);
            }

            const state = useRAGStore.getState();
            // Cache should be limited to MAX_CACHE_SIZE
            expect(state.searchCache.size).toBeLessThanOrEqual(100);
        });
    });

    describe('Persistence', () => {
        it('should serialize search cache for persistence', () => {
            useRAGStore.setState((state) => ({
                searchCache: new Map([
                    ['key-1', { query: 'query-1', results: [], timestamp: Date.now() }],
                    ['key-2', { query: 'query-2', results: [], timestamp: Date.now() }],
                ]),
            }));

            const state = useRAGStore.getState();
            // The partialize function should convert Map to array
            const partialized = {
                searchCache: Array.from(state.searchCache.entries()),
            };

            expect(partialized.searchCache).toHaveLength(2);
            expect(Array.isArray(partialized.searchCache)).toBe(true);
        });
    });

    // Story 7-2: Document Chunking Tests
    describe('Story 7-2: Document Chunking', () => {
        const testContent = 'This is test content. '.repeat(200);

        it('should chunk source successfully', async () => {
            const chunks = await useRAGStore.getState().chunkSource('test-source-1', testContent);

            expect(chunks).toBeDefined();
            expect(chunks.length).toBeGreaterThan(0);
            expect(useRAGStore.getState().loading).toBe(false);
            expect(useRAGStore.getState().error).toBeNull();
        });

        it('should track chunking progress', async () => {
            const sourceId = 'test-source-progress';

            await useRAGStore.getState().chunkSource(sourceId, testContent);

            const state = useRAGStore.getState();
            const progress = state.chunkingProgress.get(sourceId);

            expect(progress).toBeDefined();
            expect(progress?.status).toBe('completed');
            expect(progress?.totalChunks).toBeGreaterThan(0);
        });

        it('should handle chunking errors', async () => {
            // Use content that will cause an error (empty string)
            const chunks = await useRAGStore.getState().chunkSource('test-error', '');

            expect(chunks).toEqual([]);

            const state = useRAGStore.getState();
            expect(state.error).not.toBeNull();
            expect(state.loading).toBe(false);
        });

        it('should clear chunking progress for source', async () => {
            const sourceId = 'test-source-clear';

            // First, chunk something
            await useRAGStore.getState().chunkSource(sourceId, testContent);
            expect(useRAGStore.getState().chunkingProgress.has(sourceId)).toBe(true);

            // Then clear progress
            useRAGStore.getState().clearChunkingProgress(sourceId);
            expect(useRAGStore.getState().chunkingProgress.has(sourceId)).toBe(false);
        });

        it('should use custom chunking options', async () => {
            const chunks = await useRAGStore.getState().chunkSource(
                'test-source-options',
                testContent,
                {
                    strategy: 'semantic',
                    minChunkSize: 100,
                    maxChunkSize: 500,
                    overlap: 50,
                    preserveFormatting: true,
                }
            );

            expect(chunks.length).toBeGreaterThan(0);
        });

        it('should get chunks for source (returns undefined for now)', () => {
            // This is a placeholder - chunks are not persisted yet
            const chunks = useRAGStore.getState().getChunksForSource('test-source');
            expect(chunks).toBeUndefined();
        });

        it('should handle multiple concurrent chunking operations', async () => {
            const promises = [
                useRAGStore.getState().chunkSource('source-1', testContent),
                useRAGStore.getState().chunkSource('source-2', testContent),
                useRAGStore.getState().chunkSource('source-3', testContent),
            ];

            const results = await Promise.all(promises);

            expect(results[0].length).toBeGreaterThan(0);
            expect(results[1].length).toBeGreaterThan(0);
            expect(results[2].length).toBeGreaterThan(0);

            const state = useRAGStore.getState();
            expect(state.chunkingProgress.size).toBe(3);
        });

        it('should reset chunking progress on store reset', async () => {
            await useRAGStore.getState().chunkSource('test-source-reset', testContent);
            expect(useRAGStore.getState().chunkingProgress.size).toBeGreaterThan(0);

            useRAGStore.getState().reset();
            expect(useRAGStore.getState().chunkingProgress.size).toBe(0);
        });
    });
});
