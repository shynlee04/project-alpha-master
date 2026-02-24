/**
 * @fileoverview Note Indexer Unit Tests
 * @module lib/notes/__tests__/note-indexer.test
 * @governance EPIC-26-2
 *
 * Unit tests for the note indexer service.
 * Tests indexing, removal, search, and retry logic.
 */

import type { NoteRecord } from '../types';
import {
    extractTextFromBlocks,
    chunkTextForEmbedding,
    generateNoteDocumentId,
} from '../types-embedding';

// Mock dependencies before imports
vi.mock('@/lib/rag/orama-index', () => ({
    createIndex: vi.fn().mockResolvedValue({}),
    loadIndex: vi.fn().mockResolvedValue(null),
    saveIndex: vi.fn().mockResolvedValue(undefined),
    indexDocument: vi.fn().mockResolvedValue(undefined),
    removeFromIndex: vi.fn().mockResolvedValue(undefined),
    searchIndex: vi.fn().mockResolvedValue([]),
}));

vi.mock('../embedding-worker-bridge', () => ({
    embeddingWorkerBridge: {
        setProgressCallback: vi.fn(),
        cancelNote: vi.fn(),
    },
    embedChunksInWorker: vi.fn().mockResolvedValue([
        { noteId: 'note-1', chunkIndex: 0, totalChunks: 1, embedding: new Array(384).fill(0.1), latencyMs: 100 },
    ]),
}));

// Import after mocks
import {
    noteIndexer,
    indexNote,
    removeNoteFromIndex,
    searchNotes,
    rebuildNoteIndex,
} from '../note-indexer';
import * as oramaIndex from '@/lib/rag/orama-index';
import * as workerBridge from '../embedding-worker-bridge';

// ============================================================================
// Test Data
// ============================================================================

const createMockNote = (overrides: Partial<NoteRecord> = {}): NoteRecord => ({
    id: 'note-1',
    projectId: 'project-1',
    title: 'Test Note',
    blocks: [
        {
            type: 'paragraph',
            content: [{ type: 'text', text: 'This is test content for the note.', styles: {} }],
        },
    ] as any,
    isFavorite: false,
    order: 0,
    isIndexed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe('Note Indexer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('indexNote', () => {
        it('should create index if not exists and index note', async () => {
            const note = createMockNote();

            await indexNote(note, 'project-1');

            expect(oramaIndex.loadIndex).toHaveBeenCalled();
            expect(oramaIndex.createIndex).toHaveBeenCalled();
            expect(workerBridge.embedChunksInWorker).toHaveBeenCalled();
            expect(oramaIndex.indexDocument).toHaveBeenCalled();
            expect(oramaIndex.saveIndex).toHaveBeenCalled();
        });

        it('should skip indexing for notes with no text content', async () => {
            const note = createMockNote({ blocks: [] });

            await indexNote(note, 'project-1');

            expect(workerBridge.embedChunksInWorker).not.toHaveBeenCalled();
            expect(oramaIndex.indexDocument).not.toHaveBeenCalled();
        });

        it('should use existing index if available', async () => {
            vi.mocked(oramaIndex.loadIndex).mockResolvedValueOnce({} as any);
            const note = createMockNote();

            await indexNote(note, 'project-1');

            expect(oramaIndex.loadIndex).toHaveBeenCalled();
            expect(oramaIndex.createIndex).not.toHaveBeenCalled();
        });

        it('should update index state throughout process', async () => {
            const stateChanges: string[] = [];
            noteIndexer.setStateCallback((state) => {
                stateChanges.push(state.status);
            });

            const note = createMockNote();
            await indexNote(note, 'project-1');

            expect(stateChanges).toContain('indexing');
            expect(stateChanges).toContain('indexed');
        });
    });

    describe('removeNoteFromIndex', () => {
        it('should call removeFromIndex with correct parameters', async () => {
            await removeNoteFromIndex('note-1', 'project-1');

            expect(oramaIndex.removeFromIndex).toHaveBeenCalledWith(
                'project-1',
                'note-1'
            );
        });
    });

    describe('searchNotes', () => {
        it('should search with fulltext mode by default', async () => {
            await searchNotes('test query', 'project-1');

            expect(oramaIndex.searchIndex).toHaveBeenCalledWith(
                'project-1',
                'test query',
                expect.objectContaining({
                    mode: 'fulltext',
                })
            );
        });

        it('should search with vector mode when vector provided', async () => {
            const vector = new Array(384).fill(0.1);
            await searchNotes('test query', 'project-1', { vector });

            expect(oramaIndex.searchIndex).toHaveBeenCalledWith(
                'project-1',
                'test query',
                expect.objectContaining({
                    mode: 'vector',
                    vector,
                })
            );
        });

        it('should respect limit option', async () => {
            await searchNotes('test query', 'project-1', { limit: 5 });

            expect(oramaIndex.searchIndex).toHaveBeenCalledWith(
                'project-1',
                'test query',
                expect.objectContaining({
                    limit: 5,
                })
            );
        });
    });

    describe('rebuildNoteIndex', () => {
        it('should index all provided notes', async () => {
            const notes = [
                createMockNote({ id: 'note-1' }),
                createMockNote({ id: 'note-2' }),
            ];

            const indexed = await rebuildNoteIndex(notes, 'project-1');

            expect(indexed).toBe(2);
            expect(oramaIndex.createIndex).toHaveBeenCalled();
        });

        it('should continue indexing on partial failure', async () => {
            vi.mocked(workerBridge.embedChunksInWorker)
                .mockRejectedValueOnce(new Error('Embedding failed'))
                .mockResolvedValueOnce([
                    { noteId: 'note-2', chunkIndex: 0, totalChunks: 1, embedding: new Array(384).fill(0.1), latencyMs: 100 },
                ]);

            const notes = [
                createMockNote({ id: 'note-1' }),
                createMockNote({ id: 'note-2' }),
            ];

            const indexed = await rebuildNoteIndex(notes, 'project-1');

            expect(indexed).toBe(1); // Only second note indexed
        });
    });

    describe('cancelIndexing', () => {
        it('should call worker bridge cancelNote', () => {
            noteIndexer.cancelIndexing('note-1');

            expect(workerBridge.embeddingWorkerBridge.cancelNote).toHaveBeenCalledWith('note-1');
        });
    });

    describe('isNoteIndexed', () => {
        it('should return false for non-indexed notes', () => {
            expect(noteIndexer.isNoteIndexed('unknown-note')).toBe(false);
        });

        it('should return true after successful indexing', async () => {
            const note = createMockNote();
            await indexNote(note, 'project-1');

            expect(noteIndexer.isNoteIndexed('note-1')).toBe(true);
        });
    });
});

// ============================================================================
// Type Extraction Tests
// ============================================================================

describe('extractTextFromBlocks', () => {

    it('should extract text from simple paragraph blocks', () => {
        const blocks = [
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Hello' }],
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'World' }],
            },
        ];

        const result = extractTextFromBlocks(blocks);
        expect(result).toBe('Hello\nWorld');
    });

    it('should handle multiple content items in a block', () => {
        const blocks = [
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Hello ' },
                    { type: 'text', text: 'World' },
                ],
            },
        ];

        const result = extractTextFromBlocks(blocks);
        expect(result).toBe('Hello \nWorld');
    });

    it('should handle empty blocks', () => {
        const result = extractTextFromBlocks([]);
        expect(result).toBe('');
    });

    it('should ignore non-text content types', () => {
        const blocks = [
            {
                type: 'paragraph',
                content: [
                    { type: 'text', text: 'Hello' },
                    { type: 'link', url: 'https://example.com' },
                ],
            },
        ];

        const result = extractTextFromBlocks(blocks);
        expect(result).toBe('Hello');
    });
});

describe('chunkTextForEmbedding', () => {

    it('should return single chunk for short text', () => {
        const text = 'Short text';
        const chunks = chunkTextForEmbedding(text, 1000, 200);

        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toBe('Short text');
    });

    it('should chunk long text with overlap', () => {
        const text = 'A'.repeat(2500);
        const chunks = chunkTextForEmbedding(text, 1000, 200);

        expect(chunks.length).toBeGreaterThan(1);
        // First chunk should be 1000 chars
        expect(chunks[0].length).toBe(1000);
    });

    it('should preserve content with overlap', () => {
        const text = 'ABCDEFGHIJ';
        const chunks = chunkTextForEmbedding(text, 5, 2);

        // Overlap should cause some characters to appear in multiple chunks
        expect(chunks[0]).toBe('ABCDE');
        expect(chunks[1]).toBe('DEFGH');
    });
});

describe('generateNoteDocumentId', () => {

    it('should generate correct document ID format', () => {
        const id = generateNoteDocumentId('note-123', 0);
        expect(id).toBe('note-123-chunk-0');
    });

    it('should handle different chunk indices', () => {
        expect(generateNoteDocumentId('note-1', 5)).toBe('note-1-chunk-5');
        expect(generateNoteDocumentId('note-1', 99)).toBe('note-1-chunk-99');
    });
});
