/**
 * @fileoverview Note State Management (Zustand + Dexie)
 * @module lib/notes/note-store
 * @governance EPIC-26-1
 *
 * Single source of truth for notes state.
 * Persists to IndexedDB via Dexie adapter.
 * 
 * Follows patterns from:
 * - Epic 6: knowledge-store.ts (Zustand + Dexie)
 * - Epic 9: flashcard-store.ts (CRUD operations)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import { db, type NoteRecord } from '@/lib/state/dexie-db';
import type { NoteSaveStatus, CreateNoteParams, UpdateNoteParams } from './types';
import { generateNoteId, extractTitleFromBlocks, DEFAULT_NOTE_BLOCKS } from './types';
import type { Block } from '@blocknote/core';
import { indexNote, removeNoteFromIndex } from './note-indexer';
import {
    emitNoteCreated,
    emitNoteUpdated,
    emitNoteDeleted,
    emitNoteSelected,
    emitNoteContentChanged,
    emitNoteTitleChanged,
    emitNoteMoved,
    emitNoteFavoriteChanged,
} from './note-event-emitter';

// ============================================================================
// Store State Interface
// ============================================================================

interface NoteStoreState {
    /** All notes for current project */
    notes: Map<string, NoteRecord>;

    /** Notes array for rendering (derived from Map) */
    notesArray: NoteRecord[];

    /** Set of note IDs currently being indexed */
    indexingNoteIds: Set<string>;

    /** Currently active note ID */
    activeNoteId: string | null;

    /** Current project ID */
    currentProjectId: string | null;

    /** Save status for auto-save indicator */
    saveStatus: NoteSaveStatus;

    /** Loading state */
    loading: boolean;

    /** Error state */
    error: string | null;

    /** Hydration status */
    _hasHydrated: boolean;

    // Actions

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Load notes for a project */
    loadNotes: (projectId: string) => Promise<void>;

    /** Create a new note */
    createNote: (params?: CreateNoteParams) => Promise<string>;

    /** Update an existing note */
    updateNote: (params: UpdateNoteParams) => Promise<void>;

    /** Delete a note */
    deleteNote: (noteId: string) => Promise<void>;

    /** Set active note */
    setActiveNote: (noteId: string | null) => void;

    /** Toggle favorite status */
    toggleFavorite: (noteId: string) => Promise<void>;

    /** Move note (change parent or order) */
    moveNote: (noteId: string, newParentId: string | null, newOrder: number) => Promise<void>;

    /** Get notes by parent ID (for tree rendering) */
    getNotesByParent: (parentId: string | null) => NoteRecord[];

    /** Get favorite notes */
    getFavoriteNotes: () => NoteRecord[];

    /** Reset store */
    reset: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNoteStore = create<NoteStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            notes: new Map(),
            notesArray: [],
            indexingNoteIds: new Set(),
            activeNoteId: null,
            currentProjectId: null,
            saveStatus: 'idle',
            loading: false,
            error: null,
            _hasHydrated: false,

            // Actions
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            loadNotes: async (projectId: string) => {
                set({ loading: true, error: null, currentProjectId: projectId });

                try {
                    const notes = await db.notes
                        .where('projectId')
                        .equals(projectId)
                        .sortBy('order');

                    const notesMap = new Map<string, NoteRecord>();
                    notes.forEach(note => notesMap.set(note.id, note));

                    set({
                        notes: notesMap,
                        notesArray: notes,
                        loading: false
                    });

                    console.log(`[NoteStore] Loaded ${notes.length} notes for project ${projectId}`);
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                    console.error('[NoteStore] Failed to load notes:', error);
                }
            },

            createNote: async (params?: CreateNoteParams) => {
                const { currentProjectId } = get();
                if (!currentProjectId) {
                    throw new Error('No project selected');
                }

                const now = Date.now();
                const noteId = generateNoteId();

                // Calculate order (append to end of parent's children)
                const parentId = params?.parentId || undefined;
                const siblings = get().getNotesByParent(parentId ?? null);
                const maxOrder = siblings.reduce((max, n) => Math.max(max, n.order), -1);

                const newNote: NoteRecord = {
                    id: noteId,
                    projectId: currentProjectId,
                    title: params?.title || 'Untitled',
                    emoji: params?.emoji,
                    blocks: (params?.blocks || DEFAULT_NOTE_BLOCKS) as unknown[],
                    parentId,
                    isFavorite: false,
                    order: maxOrder + 1,
                    createdAt: now,
                    updatedAt: now,
                };

                try {
                    await db.notes.add(newNote);

                    // Update local state and set indexing status
                    set((state) => {
                        const newMap = new Map(state.notes);
                        newMap.set(noteId, newNote);
                        const newIndexing = new Set(state.indexingNoteIds);
                        newIndexing.add(noteId);

                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                            activeNoteId: noteId,
                            indexingNoteIds: newIndexing
                        };
                    });

                    console.log(`[NoteStore] Created note ${noteId}`);

                    // Emit event for cross-workspace note access (NR-07)
                    emitNoteCreated(newNote);

                    // Trigger indexing (fire and forget)
                    indexNote(newNote as any, currentProjectId)
                        .then(async () => {
                            const updates = { isIndexed: true, indexedAt: Date.now() };
                            await db.notes.update(noteId, updates);
                            set((state) => {
                                const note = state.notes.get(noteId);
                                if (!note) return state;

                                const newMap = new Map(state.notes);
                                newMap.set(noteId, { ...note, ...updates });

                                const newIndexing = new Set(state.indexingNoteIds);
                                newIndexing.delete(noteId);

                                return {
                                    notes: newMap,
                                    notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                                    indexingNoteIds: newIndexing
                                };
                            });
                        })
                        .catch(err => {
                            console.error('[NoteStore] Indexing failed for new note:', err);
                            set(state => {
                                const newIndexing = new Set(state.indexingNoteIds);
                                newIndexing.delete(noteId);
                                return { indexingNoteIds: newIndexing };
                            });
                        });

                    return noteId;
                } catch (error) {
                    set({ error: (error as Error).message });
                    throw error;
                }
            },

            updateNote: async (params: UpdateNoteParams) => {
                const { notes } = get();
                const note = notes.get(params.id);

                if (!note) {
                    console.error(`[NoteStore] Note ${params.id} not found`);
                    return;
                }

                set({ saveStatus: 'saving' });

                try {
                    // Extract title from blocks if blocks are updated
                    let title = params.title || note.title;
                    if (params.blocks && !params.title) {
                        title = extractTitleFromBlocks(params.blocks as Block[]);
                    }

                    const contentChanged = !!(params.blocks || params.title);

                    const updates: Partial<NoteRecord> = {
                        ...params,
                        title,
                        updatedAt: Date.now(),
                        // Invalidate index if content changed
                        ...(contentChanged ? { isIndexed: false } : {})
                    };

                    const updatedNote = { ...note, ...updates } as NoteRecord;

                    await db.notes.update(params.id, updates);

                    // Update local state
                    set((state) => {
                        const newMap = new Map(state.notes);
                        newMap.set(params.id, updatedNote);
                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                            saveStatus: 'saved',
                        };
                    });

                    // Emit events for cross-workspace note access (NR-07)
                    emitNoteUpdated(updatedNote);
                    if (contentChanged) {
                        emitNoteContentChanged(updatedNote);
                        emitNoteTitleChanged(updatedNote);
                    }

                    // Reset save status after 2 seconds
                    setTimeout(() => {
                        set({ saveStatus: 'idle' });
                    }, 2000);

                    // Trigger indexing if content or title changed
                    if (contentChanged) {
                        set(state => {
                            const newIndexing = new Set(state.indexingNoteIds);
                            newIndexing.add(params.id);
                            return { indexingNoteIds: newIndexing };
                        });

                        indexNote(updatedNote as any, updatedNote.projectId)
                            .then(async () => {
                                const indexUpdates = { isIndexed: true, indexedAt: Date.now() };
                                await db.notes.update(params.id, indexUpdates);
                                set((state) => {
                                    const currentNote = state.notes.get(params.id);
                                    if (!currentNote) return state;

                                    const newMap = new Map(state.notes);
                                    newMap.set(params.id, { ...currentNote, ...indexUpdates });

                                    const newIndexing = new Set(state.indexingNoteIds);
                                    newIndexing.delete(params.id);

                                    return {
                                        notes: newMap,
                                        notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                                        indexingNoteIds: newIndexing
                                    };
                                });
                            })
                            .catch(err => {
                                console.error('[NoteStore] Indexing failed for updated note:', err);
                                set(state => {
                                    const newIndexing = new Set(state.indexingNoteIds);
                                    newIndexing.delete(params.id);
                                    return { indexingNoteIds: newIndexing };
                                });
                            });
                    }

                } catch (error) {
                    set({ saveStatus: 'error', error: (error as Error).message });
                    console.error('[NoteStore] Failed to update note:', error);
                }
            },

            deleteNote: async (noteId: string) => {
                try {
                    const projectId = get().currentProjectId;

                    // Capture the note before deletion for event emission
                    const deletedNote = get().notes.get(noteId);
                    if (!deletedNote) {
                        console.warn(`[NoteStore] Note ${noteId} not found, skipping deletion`);
                        return;
                    }

                    // Also delete all children recursively
                    const deleteRecursive = async (id: string) => {
                        const children = get().getNotesByParent(id);
                        for (const child of children) {
                            await deleteRecursive(child.id);
                        }
                        await db.notes.delete(id);
                    };

                    await deleteRecursive(noteId);

                    // Update local state
                    set((state) => {
                        const newMap = new Map(state.notes);

                        // Remove note and all descendants
                        const removeRecursive = (id: string) => {
                            const children = Array.from(newMap.values()).filter(n => n.parentId === id);
                            children.forEach(child => removeRecursive(child.id));
                            newMap.delete(id);
                        };

                        removeRecursive(noteId);

                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                            activeNoteId: state.activeNoteId === noteId ? null : state.activeNoteId,
                        };
                    });

                    console.log(`[NoteStore] Deleted note ${noteId} and children`);

                    // Emit event for cross-workspace note access (NR-07)
                    emitNoteDeleted(noteId, deletedNote.projectId);

                    // Remove from index
                    if (projectId) {
                        removeNoteFromIndex(noteId, projectId)
                            .catch(err => console.error('[NoteStore] Failed to remove from index:', err));
                    }
                } catch (error) {
                    set({ error: (error as Error).message });
                    console.error('[NoteStore] Failed to delete note:', error);
                }
            },

            setActiveNote: (noteId: string | null) => {
                const note = noteId ? get().notes.get(noteId) : null;
                set({ activeNoteId: noteId });
                // Emit event for cross-workspace note access (NR-07)
                if (note) {
                    emitNoteSelected(note);
                }
            },

            toggleFavorite: async (noteId: string) => {
                const { notes } = get();
                const note = notes.get(noteId);

                if (!note) return;

                const newIsFavorite = !note.isFavorite;

                try {
                    await db.notes.update(noteId, {
                        isFavorite: newIsFavorite,
                        updatedAt: Date.now(),
                    });

                    set((state) => {
                        const newMap = new Map(state.notes);
                        newMap.set(noteId, { ...note, isFavorite: newIsFavorite });
                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                        };
                    });

                    // Emit event for cross-workspace note access (NR-07)
                    emitNoteFavoriteChanged({ ...note, isFavorite: newIsFavorite });
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            moveNote: async (noteId: string, newParentId: string | null, newOrder: number) => {
                const { notes } = get();
                const note = notes.get(noteId);

                if (!note) return;

                try {
                    await db.notes.update(noteId, {
                        parentId: newParentId ?? undefined,
                        order: newOrder,
                        updatedAt: Date.now(),
                    });

                    set((state) => {
                        const newMap = new Map(state.notes);
                        newMap.set(noteId, {
                            ...note,
                            parentId: newParentId ?? undefined,
                            order: newOrder
                        });
                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                        };
                    });

                    // Emit event for cross-workspace note access (NR-07)
                    emitNoteMoved({ ...note, parentId: newParentId ?? undefined, order: newOrder });
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            getNotesByParent: (parentId: string | null) => {
                const { notesArray } = get();
                return notesArray
                    .filter(n => (n.parentId ?? null) === parentId)
                    .sort((a, b) => a.order - b.order);
            },

            getFavoriteNotes: () => {
                const { notesArray } = get();
                return notesArray.filter(n => n.isFavorite);
            },

            reset: () => {
                set({
                    notes: new Map(),
                    notesArray: [],
                    indexingNoteIds: new Set(),
                    activeNoteId: null,
                    currentProjectId: null,
                    saveStatus: 'idle',
                    loading: false,
                    error: null,
                });
            },
        }),
        {
            name: 'note-state',
            storage: createJSONStorage(() => createDexieStorage('conversationState' as keyof typeof db)),

            // Only persist essential state
            partialize: (state) => ({
                activeNoteId: state.activeNoteId,
                currentProjectId: state.currentProjectId,
            }),

            // Custom serializer for Map
            // Actual notes are persisted directly to Dexie, not via Zustand persist

            onRehydrateStorage: () => (state) => {
                console.log('[NoteStore] Rehydrated from storage');
                if (state) {
                    state.setHasHydrated(true);

                    // Reload notes for current project if exists
                    if (state.currentProjectId) {
                        state.loadNotes(state.currentProjectId);
                    }
                }
            },
        }
    )
);

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get active note
 */
export function useActiveNote(): NoteRecord | null {
    const activeNoteId = useNoteStore((state) => state.activeNoteId);
    const notes = useNoteStore((state) => state.notes);

    if (!activeNoteId) return null;
    return notes.get(activeNoteId) || null;
}

/**
 * Get save status
 */
export function useNoteSaveStatus(): NoteSaveStatus {
    return useNoteStore((state) => state.saveStatus);
}

/**
 * Get notes by parent ID
 */
export function useNotesByParent(parentId: string | null): NoteRecord[] {
    const notesArray = useNoteStore((state) => state.notesArray);
    return notesArray
        .filter(n => (n.parentId ?? null) === parentId)
        .sort((a, b) => a.order - b.order);
}

/**
 * Get favorite notes
 */
export function useFavoriteNotes(): NoteRecord[] {
    const notesArray = useNoteStore((state) => state.notesArray);
    return notesArray.filter(n => n.isFavorite);
}

/**
 * Check if a note is currently indexing
 */
export function useIsNoteIndexing(noteId: string): boolean {
    const indexingNoteIds = useNoteStore((state) => state.indexingNoteIds);
    return indexingNoteIds.has(noteId);
}
