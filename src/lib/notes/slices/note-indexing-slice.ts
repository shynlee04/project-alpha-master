/**
 * @fileoverview Note Indexing Slice
 * @module lib/notes/slices/note-indexing-slice
 * @governance EPIC-26-1
 *
 * Background RAG indexing management:
 * - triggerIndexing: Trigger background note indexing
 * - removeFromIndex: Remove note from search index
 * - Indexing state tracking (indexingNoteIds)
 *
 * Coordinates with note-indexer for async RAG pipeline integration.
 */

import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';
import { indexNote, removeNoteFromIndex } from '../note-indexer';
import { createStorageGateway } from '@/infrastructure/filesystem/storage-gateway-factory';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { NoteGateway } from '@/domain/services/note-gateway';

/**
 * Indexing Operations Slice
 *
 * Manages asynchronous note indexing for RAG search.
 * Indexing runs in background with fire-and-forget pattern.
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 */
export const createNoteIndexingSlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<NoteStoreState, 'triggerIndexing' | 'removeFromIndex'>
> = (set, get) => ({

    /**
     * Trigger background indexing for a note
     * Updates isIndexed flag and indexedAt timestamp on completion
     *
     * @param noteId - Note ID to index
     */
    triggerIndexing: async (noteId: string) => {
        const { notes, currentProjectId } = get();
        const note = notes.get(noteId);

        if (!note || !currentProjectId) {
            console.warn(`[NoteStore-Indexing] Cannot index note ${noteId}: note or project missing`);
            return;
        }

        // Set indexing status
        set((state) => {
            const newIndexing = new Set(state.indexingNoteIds);
            newIndexing.add(noteId);
            return { indexingNoteIds: newIndexing };
        });

        // Trigger indexing (fire and forget)
        indexNote(note as any, currentProjectId)
            .then(async () => {
                const updates = { isIndexed: true, indexedAt: Date.now() };

                // Get platform contract and project for gateway creation
                const platform = getPlatformContract();
                const currentProjectId = get().currentProjectId;
                const project = currentProjectId ? useProjectStore.getState().projects[currentProjectId] : null;

                if (!project) {
                    console.warn(`[NoteStore-Indexing] Project not found, skipping note update`);
                    // Still update local state without persistence
                    set((state) => {
                        const currentNote = state.notes.get(noteId);
                        if (!currentNote) return state;

                        const newMap = new Map(state.notes);
                        newMap.set(noteId, { ...currentNote, ...updates });

                        const newIndexing = new Set(state.indexingNoteIds);
                        newIndexing.delete(noteId);

                        return {
                            notes: newMap,
                            notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                            indexingNoteIds: newIndexing
                        };
                    });
                    return;
                }

                // Create gateway for current platform
                const gateway = createStorageGateway(platform, {
                    directoryHandle: undefined,
                    projectId: currentProjectId ?? '',
                });

                const noteGateway = new NoteGateway(gateway);

                // Persist update through gateway
                await noteGateway.updateNote(noteId, updates);

                set((state) => {
                    const currentNote = state.notes.get(noteId);
                    if (!currentNote) return state;

                    const newMap = new Map(state.notes);
                    newMap.set(noteId, { ...currentNote, ...updates });

                    const newIndexing = new Set(state.indexingNoteIds);
                    newIndexing.delete(noteId);

                    return {
                        notes: newMap,
                        notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                        indexingNoteIds: newIndexing
                    };
                });

                console.log(`[NoteStore-Indexing] Successfully indexed note ${noteId}`);
            })
            .catch(err => {
                console.error('[NoteStore-Indexing] Indexing failed for note:', err);
                set(state => {
                    const newIndexing = new Set(state.indexingNoteIds);
                    newIndexing.delete(noteId);
                    return { indexingNoteIds: newIndexing };
                });
            });
    },

    /**
     * Remove note from search index
     * Called after note deletion
     *
     * @param noteId - Note ID to remove from index
     * @param projectId - Project ID (optional, for logging)
     */
    removeFromIndex: async (noteId: string, projectId: string | null) => {
        if (!projectId) {
            console.warn(`[NoteStore-Indexing] No project ID, skipping index removal for note ${noteId}`);
            return;
        }

        removeNoteFromIndex(noteId, projectId)
            .then(() => {
                console.log(`[NoteStore-Indexing] Removed note ${noteId} from index`);
            })
            .catch(err => {
                console.error('[NoteStore-Indexing] Failed to remove from index:', err);
            });
    },
});
