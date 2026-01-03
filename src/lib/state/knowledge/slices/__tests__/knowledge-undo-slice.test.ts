/**
 * @fileoverview Knowledge Undo Slice Tests
 * @module lib/state/knowledge/slices/__tests__/knowledge-undo-slice.test.ts
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

describe('knowledge-undo-slice', () => {
    let store: KnowledgeStoreState;
    const mockSource: SourceRecord = {
        id: 'source-1',
        projectId: 'project-1',
        type: 'pdf',
        title: 'Test PDF',
        content: 'Test content',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: true,
    };

    beforeEach(() => {
        store = createTestKnowledgeStore();
        store.undoQueue = [
            {
                sourceId: 'source-1',
                source: mockSource,
                timestamp: Date.now(),
            },
        ];
        vi.clearAllMocks();
    });

    describe('undoDelete', () => {
        it('should restore deleted source', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.undoDelete('source-1');

            expect(db.sources.update).toHaveBeenCalledWith('source-1', {
                deleted: false,
                deletedAt: undefined,
            });
        });

        it('should add source back to sources array', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.undoDelete('source-1');

            expect(store.sources).toContain(mockSource);
        });

        it('should remove from undo queue', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            expect(store.undoQueue).toHaveLength(1);

            await store.undoDelete('source-1');

            expect(store.undoQueue).toHaveLength(0);
        });

        it('should handle source not in undo queue', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.undoDelete('non-existent');

            expect(db.sources.update).not.toHaveBeenCalled();
            expect(store.undoQueue).toHaveLength(1);
        });

        it('should handle undo errors gracefully', async () => {
            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockRejectedValue(new Error('DB Error'));

            await store.undoDelete('source-1');

            expect(store.error).toBe('DB Error');
            expect(store.undoQueue).toHaveLength(1);
        });

        it('should preserve other undo queue entries', async () => {
            const anotherSource: SourceRecord = { ...mockSource, id: 'source-2' };
            store.undoQueue = [
                ...store.undoQueue,
                {
                    sourceId: 'source-2',
                    source: anotherSource,
                    timestamp: Date.now(),
                },
            ];

            const { db } = await import('../../../dexie-db');
            vi.mocked(db.sources.update).mockResolvedValue(1);

            await store.undoDelete('source-1');

            expect(store.undoQueue).toHaveLength(1);
            expect(store.undoQueue[0].sourceId).toBe('source-2');
        });
    });
});
