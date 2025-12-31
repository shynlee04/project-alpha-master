/**
 * @fileoverview Unit tests for Note Store
 * @module lib/notes/__tests__/note-store.test
 * @governance EPIC-26-1
 *
 * Tests CRUD operations, auto-save, and Dexie persistence.
 * Pattern follows Epic 6 retrospective: Zustand + Dexie testing patterns.
 */

import { useNoteStore } from '../note-store';
import { generateNoteId, DEFAULT_NOTE_BLOCKS } from '../types';

// Mock Dexie database
const mockNotes: Map<string, { id: string; projectId: string; title: string; blocks: unknown[]; isFavorite: boolean; order: number; createdAt: number; updatedAt: number; parentId?: string; emoji?: string }> = new Map();

vi.mock('@/lib/state/dexie-db', () => ({
    db: {
        notes: {
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    sortBy: vi.fn(async () => Array.from(mockNotes.values())),
                })),
            })),
            add: vi.fn(async (note) => {
                mockNotes.set(note.id, note);
                return note.id;
            }),
            update: vi.fn(async (id, updates) => {
                const note = mockNotes.get(id);
                if (note) {
                    mockNotes.set(id, { ...note, ...updates });
                }
                return 1;
            }),
            delete: vi.fn(async (id) => {
                mockNotes.delete(id);
                return 1;
            }),
        },
    },
}));

// Mock Dexie storage
vi.mock('@/lib/state/dexie-storage', () => ({
    createDexieStorage: vi.fn(() => ({
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    })),
}));

describe('Story 26-1: Note Store', () => {
    beforeEach(() => {
        // Reset mock data
        mockNotes.clear();

        // Reset store state
        useNoteStore.setState({
            notes: new Map(),
            notesArray: [],
            activeNoteId: null,
            currentProjectId: 'test-project',
            saveStatus: 'idle',
            loading: false,
            error: null,
            _hasHydrated: true,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('CRUD Operations', () => {
        it('creates a new note with default content', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            expect(noteId).toBeDefined();
            expect(typeof noteId).toBe('string');

            // Verify note was added to store
            const notes = useNoteStore.getState().notes;
            const note = notes.get(noteId);

            expect(note).toBeDefined();
            expect(note?.title).toBe('Untitled');
            expect(note?.isFavorite).toBe(false);
            expect(note?.blocks).toEqual(DEFAULT_NOTE_BLOCKS as unknown[]);
        });

        it('creates a note with custom title and emoji', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote({
                title: 'My Custom Note',
                emoji: '📝',
            });

            const notes = useNoteStore.getState().notes;
            const note = notes.get(noteId);

            expect(note?.title).toBe('My Custom Note');
            expect(note?.emoji).toBe('📝');
        });

        it('creates a nested note with parentId', async () => {
            const store = useNoteStore.getState();

            // Create parent note
            const parentId = await store.createNote({ title: 'Parent' });

            // Create child note
            const childId = await store.createNote({
                title: 'Child',
                parentId,
            });

            const notes = useNoteStore.getState().notes;
            const child = notes.get(childId);

            expect(child?.parentId).toBe(parentId);
        });

        it('updates note blocks on change', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            const newBlocks = [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }];

            await store.updateNote({
                id: noteId,
                blocks: newBlocks,
            });

            const notes = useNoteStore.getState().notes;
            const note = notes.get(noteId);

            expect(note?.blocks).toEqual(newBlocks);
        });

        it('updates note title explicitly', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            await store.updateNote({
                id: noteId,
                title: 'New Title',
            });

            const notes = useNoteStore.getState().notes;
            const note = notes.get(noteId);

            expect(note?.title).toBe('New Title');
        });

        it('persists note to Dexie on create', async () => {
            const { db } = await import('@/lib/state/dexie-db');
            const store = useNoteStore.getState();

            await store.createNote({ title: 'Test Note' });

            expect(db.notes.add).toHaveBeenCalled();
            expect(mockNotes.size).toBe(1);
        });

        it('persists note updates to Dexie', async () => {
            const { db } = await import('@/lib/state/dexie-db');
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            vi.clearAllMocks();

            await store.updateNote({
                id: noteId,
                title: 'Updated Title',
            });

            expect(db.notes.update).toHaveBeenCalledWith(
                noteId,
                expect.objectContaining({ title: 'Updated Title' })
            );
        });

        it('loads notes from Dexie on init', async () => {
            // Add some notes to mock storage
            const testNote = {
                id: 'test-id',
                projectId: 'test-project',
                title: 'Test Note',
                blocks: [],
                isFavorite: false,
                order: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            mockNotes.set(testNote.id, testNote);

            const store = useNoteStore.getState();
            await store.loadNotes('test-project');

            const notes = useNoteStore.getState().notes;
            expect(notes.size).toBe(1);
            expect(notes.get('test-id')).toBeDefined();
        });

        it('deletes note and removes from Dexie', async () => {
            const { db } = await import('@/lib/state/dexie-db');
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            vi.clearAllMocks();

            await store.deleteNote(noteId);

            expect(db.notes.delete).toHaveBeenCalledWith(noteId);

            const notes = useNoteStore.getState().notes;
            expect(notes.get(noteId)).toBeUndefined();
        });

        it('deletes note and all children recursively', async () => {
            const store = useNoteStore.getState();

            // Create parent and child
            const parentId = await store.createNote({ title: 'Parent' });
            const childId = await store.createNote({ title: 'Child', parentId });

            // Delete parent
            await store.deleteNote(parentId);

            const notes = useNoteStore.getState().notes;
            expect(notes.get(parentId)).toBeUndefined();
            expect(notes.get(childId)).toBeUndefined();
        });
    });

    describe('Auto-Save', () => {
        it('sets saveStatus to saving when update starts', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            // Start update - should set saving status
            const updatePromise = store.updateNote({
                id: noteId,
                blocks: [{ type: 'paragraph', content: [] }],
            });

            // Check status during update
            expect(useNoteStore.getState().saveStatus).toBe('saving');

            await updatePromise;
        });

        it('sets saveStatus to saved after successful save', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            await store.updateNote({
                id: noteId,
                blocks: [{ type: 'paragraph', content: [] }],
            });

            expect(useNoteStore.getState().saveStatus).toBe('saved');
        });

        it('handles save errors gracefully', async () => {
            const { db } = await import('@/lib/state/dexie-db');

            // Mock error
            vi.mocked(db.notes.update).mockRejectedValueOnce(new Error('Save failed'));

            const store = useNoteStore.getState();
            const noteId = await store.createNote();

            await store.updateNote({
                id: noteId,
                title: 'New Title',
            });

            expect(useNoteStore.getState().saveStatus).toBe('error');
            expect(useNoteStore.getState().error).toBe('Save failed');
        });

        it('resets saveStatus to idle after timeout', async () => {
            vi.useFakeTimers();
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            await store.updateNote({
                id: noteId,
                blocks: [{ type: 'paragraph', content: [] }],
            });

            expect(useNoteStore.getState().saveStatus).toBe('saved');

            // Fast-forward 2 seconds
            vi.advanceTimersByTime(2000);

            expect(useNoteStore.getState().saveStatus).toBe('idle');

            vi.useRealTimers();
        });
    });

    describe('Favorites', () => {
        it('toggles favorite status on', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            expect(useNoteStore.getState().notes.get(noteId)?.isFavorite).toBe(false);

            await store.toggleFavorite(noteId);

            expect(useNoteStore.getState().notes.get(noteId)?.isFavorite).toBe(true);
        });

        it('toggles favorite status off', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            await store.toggleFavorite(noteId); // Toggle on
            await store.toggleFavorite(noteId); // Toggle off

            expect(useNoteStore.getState().notes.get(noteId)?.isFavorite).toBe(false);
        });

        it('returns favorite notes via getFavoriteNotes', async () => {
            const store = useNoteStore.getState();

            const noteId1 = await store.createNote({ title: 'Note 1' });
            const noteId2 = await store.createNote({ title: 'Note 2' });

            await store.toggleFavorite(noteId1);

            const favorites = useNoteStore.getState().getFavoriteNotes();

            expect(favorites.length).toBe(1);
            expect(favorites[0].id).toBe(noteId1);
        });
    });

    describe('Move Note', () => {
        it('changes note parent', async () => {
            const store = useNoteStore.getState();

            const note1 = await store.createNote({ title: 'Note 1' });
            const note2 = await store.createNote({ title: 'Note 2' });

            await store.moveNote(note2, note1, 0);

            const notes = useNoteStore.getState().notes;
            expect(notes.get(note2)?.parentId).toBe(note1);
        });

        it('changes note order', async () => {
            const store = useNoteStore.getState();

            await store.createNote({ title: 'Note 1' });
            const note2 = await store.createNote({ title: 'Note 2' });

            await store.moveNote(note2, null, 10);

            const notes = useNoteStore.getState().notes;
            expect(notes.get(note2)?.order).toBe(10);
        });

        it('gets notes by parent via getNotesByParent', async () => {
            const store = useNoteStore.getState();

            const parent = await store.createNote({ title: 'Parent' });
            await store.createNote({ title: 'Child 1', parentId: parent });
            await store.createNote({ title: 'Child 2', parentId: parent });
            await store.createNote({ title: 'Sibling' });

            const children = useNoteStore.getState().getNotesByParent(parent);

            expect(children.length).toBe(2);
            children.forEach(child => {
                expect(child.parentId).toBe(parent);
            });
        });
    });

    describe('Active Note', () => {
        it('sets active note', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();

            // Note is automatically set as active on create
            expect(useNoteStore.getState().activeNoteId).toBe(noteId);

            // Set another note as active
            const noteId2 = await store.createNote();
            store.setActiveNote(noteId);

            expect(useNoteStore.getState().activeNoteId).toBe(noteId);
        });

        it('clears active note', () => {
            const store = useNoteStore.getState();

            store.setActiveNote(null);

            expect(useNoteStore.getState().activeNoteId).toBeNull();
        });

        it('clears active note when it is deleted', async () => {
            const store = useNoteStore.getState();

            const noteId = await store.createNote();
            expect(useNoteStore.getState().activeNoteId).toBe(noteId);

            await store.deleteNote(noteId);

            expect(useNoteStore.getState().activeNoteId).toBeNull();
        });
    });

    describe('Reset', () => {
        it('clears all state on reset', async () => {
            const store = useNoteStore.getState();

            await store.createNote();
            await store.createNote();

            store.reset();

            const state = useNoteStore.getState();
            expect(state.notes.size).toBe(0);
            expect(state.notesArray.length).toBe(0);
            expect(state.activeNoteId).toBeNull();
            expect(state.currentProjectId).toBeNull();
        });
    });

    describe('Utility Functions', () => {
        it('generateNoteId creates unique IDs', () => {
            const id1 = generateNoteId();
            const id2 = generateNoteId();

            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });
    });
});
