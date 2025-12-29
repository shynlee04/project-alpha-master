/**
 * @fileoverview Knowledge Store Tests
 * @module lib/state/__tests__/knowledge-store.test
 * @governance EPIC-6-3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKnowledgeStore } from '../knowledge-store';
import { db } from '../dexie-db';

// Mock Dexie database
// Note: Use relative path './dexie-db' because that's what knowledge-store.ts uses
vi.mock('../dexie-db', () => ({
    db: {
        sources: {
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    toArray: vi.fn(),
                })),
            })),
            delete: vi.fn(),
            update: vi.fn(),
        },
        collections: {
            add: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
    getCollectionsForProject: vi.fn(),
    saveCollection: vi.fn(),
    deleteCollection: vi.fn(),
    addSourceToCollection: vi.fn(),
    removeSourceFromCollection: vi.fn(),
}));

// Mock DexieStorage
vi.mock('../dexie-storage', () => ({
    createDexieStorage: vi.fn(() => ({
        getItem: vi.fn(() => Promise.resolve(null)),
        setItem: vi.fn(() => Promise.resolve()),
        removeItem: vi.fn(() => Promise.resolve()),
    })),
}));

describe('KnowledgeStore', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();

        // Reset store before each test
        const { result } = renderHook(() => useKnowledgeStore());
        act(() => {
            result.current.reset();
        });
    });

    describe('Initial State', () => {
        it('should have empty sources array', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.sources).toEqual([]);
        });

        it('should have no selected source', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.selectedSource).toBeNull();
        });

        it('should have preview closed', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.isPreviewOpen).toBe(false);
        });

        it('should have hydrated flag', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(typeof result.current._hasHydrated).toBe('boolean');
        });
    });

    describe('loadSources', () => {
        it('should load sources for project', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'source-2',
                    projectId: 'project-1',
                    type: 'url' as const,
                    title: 'Test URL',
                    content: 'URL content',
                    url: 'https://example.com',
                    wordCount: 200,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.sources).toEqual(mockSources);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should set loading state during fetch', async () => {
            const toArrayMock = vi.fn(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            const loadPromise = act(() => {
                result.current.loadSources('project-1');
            });

            // Should be loading immediately after call
            expect(result.current.loading).toBe(true);

            await loadPromise;
        });

        it('should handle load errors', async () => {
            const error = new Error('Database error');
            const toArrayMock = vi.fn().mockRejectedValue(error);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.error).toBe('Database error');
            expect(result.current.loading).toBe(false);
        });
    });

    describe('selectSource', () => {
        it('should select a source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.selectSource(mockSource);
            });

            expect(result.current.selectedSource).toEqual(mockSource);
        });

        it('should allow deselecting by passing null', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.selectSource(mockSource);
            });

            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.selectSource(null);
            });

            expect(result.current.selectedSource).toBeNull();
        });
    });

    describe('openPreview', () => {
        it('should open preview with source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);
        });
    });

    describe('closePreview', () => {
        it('should close preview and clear selected source', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.closePreview();
            });

            expect(result.current.isPreviewOpen).toBe(false);
            expect(result.current.selectedSource).toBeNull();
        });
    });

    describe('deleteSource', () => {
        it('should soft delete source in database and remove from store (Story 6-3)', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'source-2',
                    projectId: 'project-1',
                    type: 'url' as const,
                    title: 'Test URL',
                    content: 'URL content',
                    url: 'https://example.com',
                    wordCount: 200,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load sources first
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.sources).toHaveLength(2);

            // Delete one source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            // Story 6-3: Soft delete with update, not hard delete
            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                deleted: true,
                deletedAt: expect.any(Number),
            });
            expect(result.current.sources).toHaveLength(1);
            expect(result.current.sources[0].id).toBe('source-2');
            expect(result.current.undoQueue).toHaveLength(1);
            expect(result.current.undoQueue[0].sourceId).toBe('source-1');
        });

        it('should handle delete errors', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);

            const error = new Error('Delete failed');
            vi.mocked(db.sources.update).mockRejectedValue(error);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load sources first so the source exists in local state
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            // Now try to delete - should trigger the error
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.error).toBe('Delete failed');
        });

        it('should clear selected source if it was deleted', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load and select source
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            act(() => {
                result.current.openPreview(mockSources[0]);
            });

            expect(result.current.selectedSource).toEqual(mockSources[0]);
            expect(result.current.isPreviewOpen).toBe(true);

            // Delete the selected source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.selectedSource).toBeNull();
            expect(result.current.isPreviewOpen).toBe(false);
        });
    });

    describe('reset', () => {
        it('should reset store to initial state', () => {
            const mockSource = {
                id: 'source-1',
                projectId: 'project-1',
                type: 'pdf' as const,
                title: 'Test PDF',
                content: 'Test content',
                wordCount: 100,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.openPreview(mockSource);
            });

            expect(result.current.isPreviewOpen).toBe(true);
            expect(result.current.selectedSource).toEqual(mockSource);

            act(() => {
                result.current.reset();
            });

            expect(result.current.sources).toEqual([]);
            expect(result.current.selectedSource).toBeNull();
            expect(result.current.isPreviewOpen).toBe(false);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe('setHasHydrated', () => {
        it('should set hydration flag', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.setHasHydrated(true);
            });

            expect(result.current._hasHydrated).toBe(true);
        });
    });

    // ============================================================================
    // Story 6-3 Tests: Source Management
    // ============================================================================

    describe('Initial State (Story 6-3)', () => {
        it('should have empty collections array', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.collections).toEqual([]);
        });

        it('should have no filtered collection', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.filteredCollectionId).toBeNull();
        });

        it('should have empty undo queue', () => {
            const { result } = renderHook(() => useKnowledgeStore());
            expect(result.current.undoQueue).toEqual([]);
        });
    });

    describe('renameSource (Story 6-3)', () => {
        it('should rename source in database and store', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Original Title',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            // Load sources first
            await act(async () => {
                await result.current.loadSources('project-1');
            });

            expect(result.current.sources[0].title).toBe('Original Title');

            // Rename source
            await act(async () => {
                await result.current.renameSource('source-1', 'New Title');
            });

            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                title: 'New Title',
                updatedAt: expect.any(Number),
            });
            expect(result.current.sources[0].title).toBe('New Title');
        });

        it('should update selected source title when renamed', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Original Title',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            act(() => {
                result.current.openPreview(mockSources[0]);
            });

            expect(result.current.selectedSource?.title).toBe('Original Title');

            // Rename source
            await act(async () => {
                await result.current.renameSource('source-1', 'New Title');
            });

            expect(result.current.selectedSource?.title).toBe('New Title');
        });

        it('should handle rename errors', async () => {
            const error = new Error('Rename failed');
            vi.mocked(db.sources.update).mockRejectedValue(error);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.renameSource('source-1', 'New Title');
            });

            expect(result.current.error).toBe('Rename failed');
        });
    });

    describe('undoDelete (Story 6-3)', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should add deleted source to undo queue', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            // Delete source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.undoQueue).toHaveLength(1);
            expect(result.current.undoQueue[0].sourceId).toBe('source-1');
            expect(result.current.undoQueue[0].source.title).toBe('Test PDF');
        });

        it('should undo delete and restore source', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            // Delete source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.sources).toHaveLength(0);
            expect(result.current.undoQueue).toHaveLength(1);

            // Undo delete
            await act(async () => {
                await result.current.undoDelete('source-1');
            });

            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                deleted: false,
                deletedAt: undefined,
            });
            expect(result.current.sources).toHaveLength(1);
            expect(result.current.undoQueue).toHaveLength(0);
        });

        it('should auto-clear undo queue after 5 seconds', async () => {
            const mockSources = [
                {
                    id: 'source-1',
                    projectId: 'project-1',
                    type: 'pdf' as const,
                    title: 'Test PDF',
                    content: 'Test content',
                    wordCount: 100,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const toArrayMock = vi.fn().mockResolvedValue(mockSources);
            vi.mocked(db.sources.where).mockReturnValue({
                equals: vi.fn().mockReturnValue({ toArray: toArrayMock }),
            } as any);
            vi.mocked(db.sources.update).mockResolvedValue(1);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadSources('project-1');
            });

            // Delete source
            await act(async () => {
                await result.current.deleteSource('source-1');
            });

            expect(result.current.undoQueue).toHaveLength(1);

            // Fast-forward 5 seconds
            act(() => {
                vi.advanceTimersByTime(5000);
            });

            expect(result.current.undoQueue).toHaveLength(0);
        });
    });

    describe('loadCollections (Story 6-3)', () => {
        it('should load collections for project', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'ML Research',
                    sourceIds: ['source-1', 'source-2'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'collection-2',
                    projectId: 'project-1',
                    name: 'Web Dev',
                    sourceIds: ['source-3'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { getCollectionsForProject } = await import('../dexie-db');
            vi.mocked(getCollectionsForProject).mockResolvedValue(mockCollections);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadCollections('project-1');
            });

            expect(getCollectionsForProject).toHaveBeenCalledWith('project-1');
            expect(result.current.collections).toEqual(mockCollections);
            expect(result.current.loading).toBe(false);
        });

        it('should handle load collections errors', async () => {
            const error = new Error('Load collections failed');
            const { getCollectionsForProject } = await import('../dexie-db');
            vi.mocked(getCollectionsForProject).mockRejectedValue(error);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.loadCollections('project-1');
            });

            expect(result.current.error).toBe('Load collections failed');
        });
    });

    describe('createCollection (Story 6-3)', () => {
        it('should create new collection', async () => {
            vi.mocked(db.collections.add).mockResolvedValue('new-collection-id');

            const mockCollections = [
                {
                    id: 'new-collection-id',
                    projectId: 'current-project-id',
                    name: 'New Collection',
                    sourceIds: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { getCollectionsForProject } = await import('../dexie-db');
            vi.mocked(getCollectionsForProject).mockResolvedValue(mockCollections);

            const { result } = renderHook(() => useKnowledgeStore());

            await act(async () => {
                await result.current.createCollection('New Collection');
            });

            expect(db.collections.add).toHaveBeenCalledWith({
                id: expect.any(String),
                projectId: 'current-project-id',
                name: 'New Collection',
                sourceIds: [],
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
            });
            expect(result.current.collections).toEqual(mockCollections);
        });
    });

    describe('updateCollection (Story 6-3)', () => {
        it('should update collection', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Old Name',
                    sourceIds: ['source-1'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { saveCollection } = await import('../dexie-db');
            vi.mocked(saveCollection).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKnowledgeStore());

            // Set initial collections
            act(() => {
                result.current.collections = mockCollections;
            });

            await act(async () => {
                await result.current.updateCollection('collection-1', { name: 'New Name' });
            });

            expect(saveCollection).toHaveBeenCalledWith({
                ...mockCollections[0],
                name: 'New Name',
                updatedAt: expect.any(Number),
            });
            expect(result.current.collections[0].name).toBe('New Name');
        });

        it('should handle update collection errors', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Old Name',
                    sourceIds: ['source-1'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { saveCollection } = await import('../dexie-db');
            vi.mocked(saveCollection).mockRejectedValue(new Error('Update failed'));

            const { result } = renderHook(() => useKnowledgeStore());

            // Set initial collections so the collection exists
            act(() => {
                result.current.collections = mockCollections;
            });

            await act(async () => {
                await result.current.updateCollection('collection-1', { name: 'New Name' });
            });

            expect(result.current.error).toBe('Update failed');
        });
    });

    describe('deleteCollection (Story 6-3)', () => {
        it('should delete collection', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Test Collection',
                    sourceIds: ['source-1'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: 'collection-2',
                    projectId: 'project-1',
                    name: 'Another Collection',
                    sourceIds: ['source-2'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { deleteCollection: dbDeleteCollection } = await import('../dexie-db');
            vi.mocked(dbDeleteCollection).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKnowledgeStore());

            // Set initial collections and filter
            act(() => {
                result.current.collections = mockCollections;
                result.current.filteredCollectionId = 'collection-1';
            });

            await act(async () => {
                await result.current.deleteCollection('collection-1');
            });

            expect(dbDeleteCollection).toHaveBeenCalledWith('collection-1');
            expect(result.current.collections).toHaveLength(1);
            expect(result.current.collections[0].id).toBe('collection-2');
            expect(result.current.filteredCollectionId).toBeNull();
        });
    });

    describe('addSourceToCollection (Story 6-3)', () => {
        it('should add source to collection', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Test Collection',
                    sourceIds: ['source-2'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            const { addSourceToCollection: dbAddSourceToCollection, getCollectionsForProject } =
                await import('../dexie-db');
            vi.mocked(dbAddSourceToCollection).mockResolvedValue(undefined);
            vi.mocked(getCollectionsForProject).mockResolvedValue(mockCollections);

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.collections = mockCollections;
            });

            await act(async () => {
                await result.current.addSourceToCollection('source-1', 'collection-1');
            });

            expect(dbAddSourceToCollection).toHaveBeenCalledWith('collection-1', 'source-1');
            expect(getCollectionsForProject).toHaveBeenCalledWith('project-1');
        });
    });

    describe('removeSourceFromCollection (Story 6-3)', () => {
        it('should remove source from collection', async () => {
            const mockCollections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Test Collection',
                    sourceIds: ['source-1', 'source-2'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            // Get the mocked functions from the already-imported module
            const { removeSourceFromCollection: dbRemoveSourceFromCollection, getCollectionsForProject } =
                await import('../dexie-db');

            // The mock was set up at the module level, but we need to ensure it returns resolved value
            vi.mocked(dbRemoveSourceFromCollection).mockResolvedValue(undefined);
            vi.mocked(getCollectionsForProject).mockResolvedValue([...mockCollections]);

            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.collections = [...mockCollections];
            });

            await act(async () => {
                await result.current.removeSourceFromCollection('source-1', 'collection-1');
            });

            expect(dbRemoveSourceFromCollection).toHaveBeenCalledWith('collection-1', 'source-1');
            expect(getCollectionsForProject).toHaveBeenCalledWith('project-1');
        });
    });

    describe('filterByCollection (Story 6-3)', () => {
        it('should set filtered collection ID', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.filterByCollection('collection-1');
            });

            expect(result.current.filteredCollectionId).toBe('collection-1');
        });

        it('should clear filter when passing null', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.filterByCollection('collection-1');
            });

            expect(result.current.filteredCollectionId).toBe('collection-1');

            act(() => {
                result.current.filterByCollection(null);
            });

            expect(result.current.filteredCollectionId).toBeNull();
        });
    });

    describe('reset (Story 6-3)', () => {
        it('should reset all Story 6-3 state', () => {
            const { result } = renderHook(() => useKnowledgeStore());

            act(() => {
                result.current.collections = [
                    {
                        id: 'collection-1',
                        projectId: 'project-1',
                        name: 'Test',
                        sourceIds: [],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                ];
                result.current.filteredCollectionId = 'collection-1';
                result.current.undoQueue = [
                    {
                        sourceId: 'source-1',
                        source: {} as any,
                        timestamp: Date.now(),
                    },
                ];
            });

            expect(result.current.collections).toHaveLength(1);
            expect(result.current.filteredCollectionId).toBe('collection-1');
            expect(result.current.undoQueue).toHaveLength(1);

            act(() => {
                result.current.reset();
            });

            expect(result.current.collections).toEqual([]);
            expect(result.current.filteredCollectionId).toBeNull();
            expect(result.current.undoQueue).toEqual([]);
        });
    });
});
