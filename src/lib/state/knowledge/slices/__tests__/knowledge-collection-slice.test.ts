/**
 * @fileoverview Knowledge Collection Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-collection-slice.test.ts
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1148
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestKnowledgeStore } from '../../__tests__/test-store';
import type { CollectionRecord, KnowledgeStoreState } from '../../types';

// Mock dexie-db
vi.mock('../../../dexie-db', () => ({
    db: {
        collections: {
            add: vi.fn(),
            where: () => ({
                equals: () => ({
                    toArray: vi.fn(),
                    modify: vi.fn(),
                }),
            }),
        },
    },
    getCollectionsForProject: vi.fn(),
    saveCollection: vi.fn(),
    deleteCollection: vi.fn(),
    addSourceToCollection: vi.fn(),
    removeSourceFromCollection: vi.fn(),
}));

describe('knowledge-collection-slice', () => {
    let store: KnowledgeStoreState;
    const mockCollections: CollectionRecord[] = [
        {
            id: 'collection-1',
            projectId: 'project-1',
            name: 'Collection 1',
            sourceIds: ['source-1', 'source-2'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: 'collection-2',
            projectId: 'project-1',
            name: 'Collection 2',
            sourceIds: ['source-3'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ];

    beforeEach(() => {
        store = createTestKnowledgeStore();
        vi.clearAllMocks();
    });

    describe('loadCollections', () => {
        it('should load collections for project', async () => {
            const { getCollectionsForProject } = await import('../../../dexie-db');
            vi.mocked(getCollectionsForProject).mockResolvedValue(mockCollections);

            await store.loadCollections('project-1');

            expect(store.collections).toEqual(mockCollections);
            expect(store.loading).toBe(false);
        });

        it('should handle errors gracefully', async () => {
            const { getCollectionsForProject } = await import('../../../dexie-db');
            vi.mocked(getCollectionsForProject).mockRejectedValue(new Error('DB Error'));

            await store.loadCollections('project-1');

            expect(store.error).toBe('DB Error');
            expect(store.loading).toBe(false);
        });
    });

    describe('createCollection', () => {
        it('should create new collection', async () => {
            const { db, getCollectionsForProject } = await import('../../../dexie-db');
            vi.mocked(db.collections.add).mockResolvedValue('new-collection-id');
            vi.mocked(getCollectionsForProject).mockResolvedValue([...mockCollections, {
                id: 'new-collection-id',
                projectId: 'current-project-id',
                name: 'New Collection',
                sourceIds: [],
                createdAt: expect.any(Number),
                updatedAt: expect.any(Number),
            }]);

            await store.createCollection('New Collection');

            expect(db.collections.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Collection',
                    sourceIds: [],
                })
            );
            expect(store.collections).toHaveLength(3);
        });
    });

    describe('updateCollection', () => {
        beforeEach(() => {
            store.collections = mockCollections;
        });

        it('should update collection', async () => {
            const { saveCollection } = await import('../../../dexie-db');
            vi.mocked(saveCollection).mockResolvedValue(undefined);

            await store.updateCollection('collection-1', { name: 'Updated Name' });

            expect(saveCollection).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Updated Name',
                })
            );
            expect(store.collections[0].name).toBe('Updated Name');
        });

        it('should not update if collection not found', async () => {
            const { saveCollection } = await import('../../../dexie-db');
            vi.mocked(saveCollection).mockResolvedValue(undefined);

            await store.updateCollection('non-existent', { name: 'Updated Name' });

            expect(saveCollection).not.toHaveBeenCalled();
        });
    });

    describe('deleteCollection', () => {
        beforeEach(() => {
            store.collections = mockCollections;
            store.filteredCollectionId = 'collection-1';
        });

        it('should delete collection', async () => {
            const { deleteCollection } = await import('../../../dexie-db');
            vi.mocked(deleteCollection).mockResolvedValue(undefined);

            await store.deleteCollection('collection-1');

            expect(deleteCollection).toHaveBeenCalledWith('collection-1');
            expect(store.collections).toHaveLength(1);
            expect(store.collections[0].id).toBe('collection-2');
        });

        it('should clear filter if deleted collection was filtered', async () => {
            const { deleteCollection } = await import('../../../dexie-db');
            vi.mocked(deleteCollection).mockResolvedValue(undefined);

            await store.deleteCollection('collection-1');

            expect(store.filteredCollectionId).toBe(null);
        });
    });

    describe('addSourceToCollection', () => {
        beforeEach(() => {
            store.collections = mockCollections;
        });

        it('should add source to collection', async () => {
            const { addSourceToCollection: dbAdd, getCollectionsForProject } = await import('../../../dexie-db');
            vi.mocked(dbAdd).mockResolvedValue(undefined);
            vi.mocked(getCollectionsForProject).mockResolvedValue([
                ...mockCollections[0],
                { ...mockCollections[0], sourceIds: ['source-1', 'source-2', 'source-3'] },
            ]);

            await store.addSourceToCollection('source-3', 'collection-1');

            expect(dbAdd).toHaveBeenCalledWith('collection-1', 'source-3');
        });
    });

    describe('removeSourceFromCollection', () => {
        beforeEach(() => {
            store.collections = mockCollections;
        });

        it('should remove source from collection', async () => {
            const { removeSourceFromCollection: dbRemove, getCollectionsForProject } = await import('../../../dexie-db');
            vi.mocked(dbRemove).mockResolvedValue(undefined);
            vi.mocked(getCollectionsForProject).mockResolvedValue([
                { ...mockCollections[0], sourceIds: ['source-2'] },
            ]);

            await store.removeSourceFromCollection('source-1', 'collection-1');

            expect(dbRemove).toHaveBeenCalledWith('collection-1', 'source-1');
        });
    });

    describe('filterByCollection', () => {
        it('should set filter by collection ID', () => {
            store.filterByCollection('collection-1');

            expect(store.filteredCollectionId).toBe('collection-1');
        });

        it('should clear filter when null passed', () => {
            store.filteredCollectionId = 'collection-1';

            store.filterByCollection(null);

            expect(store.filteredCollectionId).toBe(null);
        });
    });
});
