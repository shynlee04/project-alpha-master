/**
 * @fileoverview Knowledge Source CRUD Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-source-crud-slice.test.ts
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
            where: () => ({
                equals: () => ({
                    toArray: vi.fn(),
                }),
            }),
            update: vi.fn(),
        },
        collections: {
            where: () => ({
                equals: () => ({
                    modify: vi.fn(),
                }),
            }),
        },
    },
}));

describe('knowledge-source-crud-slice', () => {
    let store: KnowledgeStoreState;
    const mockSources: SourceRecord[] = [
        {
            id: 'source-1',
            projectId: 'project-1',
            type: 'pdf',
            title: 'Test PDF',
            content: 'Test content',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deleted: false,
        },
        {
            id: 'source-2',
            projectId: 'project-1',
            type: 'url',
            title: 'Test URL',
            content: 'Test content',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deleted: false,
        },
    ];

    beforeEach(() => {
        store = createTestKnowledgeStore();
        vi.clearAllMocks();
    });

    describe('loadSources', () => {
        it('should load sources for project', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.where().equals().toArray).mockResolvedValue(mockSources);

            await store.loadSources('project-1');

            expect(store.sources).toEqual(mockSources);
            expect(store.loading).toBe(false);
            expect(store.error).toBe(null);
        });

        it('should filter out soft-deleted sources', async () => {
            const sourcesWithDeleted = [
                ...mockSources,
                {
                    id: 'source-3',
                    projectId: 'project-1',
                    type: 'pdf',
                    title: 'Deleted Source',
                    content: 'Content',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    deleted: true,
                },
            ];

            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.where().equals().toArray).mockResolvedValue(sourcesWithDeleted);

            await store.loadSources('project-1');

            expect(store.sources).toHaveLength(2);
            expect(store.sources.every(s => !s.deleted)).toBe(true);
        });

        it('should set loading state during fetch', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.where().equals().toArray).mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(mockSources), 100))
            );

            const loadPromise = store.loadSources('project-1');
            expect(store.loading).toBe(true);

            await loadPromise;
            expect(store.loading).toBe(false);
        });

        it('should handle errors gracefully', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.where().equals().toArray).mockRejectedValue(new Error('DB Error'));

            await store.loadSources('project-1');

            expect(store.error).toBe('DB Error');
            expect(store.loading).toBe(false);
        });
    });

    describe('selectSource', () => {
        it('should select source', () => {
            store.sources = mockSources;

            store.selectSource(mockSources[0]);

            expect(store.selectedSource).toEqual(mockSources[0]);
        });

        it('should deselect source when null passed', () => {
            store.selectedSource = mockSources[0];

            store.selectSource(null);

            expect(store.selectedSource).toBe(null);
        });
    });

    describe('deleteSource', () => {
        beforeEach(() => {
            store.sources = mockSources;
            store.collections = [
                {
                    id: 'collection-1',
                    projectId: 'project-1',
                    name: 'Test Collection',
                    sourceIds: ['source-1'],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];
        });

        it('should soft delete source', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.deleteSource('source-1');

            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                deleted: true,
                deletedAt: expect.any(Number),
            });
            expect(store.sources.find(s => s.id === 'source-1')).toBeUndefined();
        });

        it('should add to undo queue', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.deleteSource('source-1');

            expect(store.undoQueue).toHaveLength(1);
            expect(store.undoQueue[0].sourceId).toBe('source-1');
        });

        it('should remove from all collections', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);
            vi.mocked(db.collections.where().equals().modify).mockImplementation((fn) => {
                fn({ sourceIds: ['source-1'] });
                return Promise.resolve();
            });

            await store.deleteSource('source-1');

            expect(db.collections.where).toHaveBeenCalled();
        });

        it('should clear selected source if deleted', async () => {
            store.selectedSource = mockSources[0];
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.deleteSource('source-1');

            expect(store.selectedSource).toBe(null);
        });
    });

    describe('renameSource', () => {
        beforeEach(() => {
            store.sources = mockSources;
            store.selectedSource = mockSources[0];
        });

        it('should rename source', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.renameSource('source-1', 'New Title');

            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                title: 'New Title',
                updatedAt: expect.any(Number),
            });
            expect(store.sources[0].title).toBe('New Title');
        });

        it('should update selected source if renamed', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.renameSource('source-1', 'New Title');

            expect(store.selectedSource?.title).toBe('New Title');
        });
    });
});
