/**
 * @fileoverview Note CRUD Operations Slice
 * @module lib/notes/slices/note-crud-slice
 * @governance EPIC-26-1
 *
 * Core CRUD operations for notes:
 * - loadNotes: Load notes from IndexedDB for a project
 * - createNote: Create new note with auto-generated ID and order
 * - updateNote: Update note fields with auto-save debouncing
 * - deleteNote: Delete note and all descendants recursively
 *
 * Cross-slice communication via get():
 * - Triggers note-sync-slice for auto-save
 * - Triggers note-indexing-slice for background indexing
 * - Triggers note-events-slice for event emission
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';
import type { CreateNoteParams, UpdateNoteParams } from '../types';
import { generateNoteId, DEFAULT_NOTE_BLOCKS } from '../types';
import { useNoteNavigationStore } from '../note-navigation-store';
import { createStorageGateway } from '@/infrastructure/filesystem/storage-gateway-factory';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { NoteGateway } from '@/domain/services/note-gateway';

/**
 * CRUD Operations Slice
 *
 * Manages core note lifecycle operations with IndexedDB persistence.
 * All operations update local state first, then persist to IndexedDB.
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function (for cross-slice calls)
 */
export const createNoteCRUDSlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<NoteStoreState, 'loadNotes' | 'loadAllNotes' | 'createNote' | 'updateNote' | 'deleteNote'>
> = (set, get) => ({
    /**
     * Load notes for a project from IndexedDB
     * @param projectId - Project ID to load notes for
     */
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

            console.log(`[NoteStore-CRUD] Loaded ${notes.length} notes for project ${projectId}`);
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            console.error('[NoteStore-CRUD] Failed to load notes:', error);
        }
    },

    /**
     * 45-04: Load notes for browser mode (isolated to browser-mode project)
     * 
     * FIX C-01: Previously loaded ALL projects' notes and set currentProjectId=null,
     * causing state boundary failure. Now properly isolates to browser-mode project.
     * 
     * @governance Team-B-Debug-2026-01-14
     */
    loadAllNotes: async () => {
        set({ loading: true, error: null });

        try {
            // FIX C-01: Import browser mode utilities
            const { getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID } = await import('@/lib/workspace/browser-mode');
            
            // Ensure browser mode project exists
            const browserProject = await getOrCreateBrowserModeProject();
            
            if (!browserProject) {
                throw new Error('Failed to create browser mode project');
            }

            // Load ONLY browser-mode project notes (isolated, not ALL projects)
            const notes = await db.notes
                .where('projectId')
                .equals(BROWSER_MODE_PROJECT_ID)
                .sortBy('order');

            const notesMap = new Map<string, NoteRecord>();
            notes.forEach(note => notesMap.set(note.id, note));

            set({
                notes: notesMap,
                notesArray: notes,
                loading: false,
                currentProjectId: BROWSER_MODE_PROJECT_ID, // FIX: Set to browser-mode project, not null
            });

            console.log(`[NoteStore-CRUD] Loaded ${notes.length} notes for browser mode project`);
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
            console.error('[NoteStore-CRUD] Failed to load browser mode notes:', error);
        }
    },

    /**
     * Create a new note
     * 
     * FIX C-02: Previously threw error when currentProjectId was null in browser mode.
     * Now auto-creates browser mode project if needed.
     * 
     * @param params - Optional note creation parameters
     * @returns Created note ID
     * @governance Team-B-Debug-2026-01-14
     */
    createNote: async (params?: CreateNoteParams) => {
        let { currentProjectId } = get();
        
        // FIX C-02: Auto-create browser mode project if no project selected
        if (!currentProjectId) {
            const { getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID } = await import('@/lib/workspace/browser-mode');
            const browserProject = await getOrCreateBrowserModeProject();
            
            if (browserProject) {
                currentProjectId = BROWSER_MODE_PROJECT_ID;
                set({ currentProjectId });
                console.log('[NoteStore-CRUD] Auto-created browser mode project for note creation');
            }
        }
        
        if (!currentProjectId) {
            throw new Error('No project selected and browser mode unavailable');
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
            workspaceId: 'notes',
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
            // Get platform contract and project for gateway creation
            const platform = getPlatformContract();
            const project = currentProjectId ? useProjectStore.getState().projects[currentProjectId] : null;

            if (!project) {
                throw new Error(`Project ${currentProjectId} not found`);
            }

            // Create gateway for current platform
            const gateway = createStorageGateway(platform, {
                directoryHandle: undefined, // Handle will be resolved by gateway internally
                projectId: currentProjectId ?? '',
            });

            const noteGateway = new NoteGateway(gateway);

            // Persist note through gateway
            await noteGateway.createNote(newNote);

            // Update local state
            set((state) => {
                const newMap = new Map(state.notes);
                newMap.set(noteId, newNote);

                return {
                    notes: newMap,
                    notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                    activeNoteId: noteId,
                };
            });

            console.log(`[NoteStore-CRUD] Created note ${noteId}`);

            // Trigger indexing via cross-slice call
            const { triggerIndexing } = get();
            triggerIndexing?.(noteId);

            return noteId;
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },

    /**
     * Update an existing note
     * @param params - Update parameters with note ID and fields to update
     */
    updateNote: async (params: UpdateNoteParams) => {
        const { notes, currentProjectId } = get();
        const note = notes.get(params.id);

        if (!note) {
            console.error(`[NoteStore-CRUD] Note ${params.id} not found`);
            return;
        }

        set({ saveStatus: 'saving' });

        try {
            // Extract title from blocks if blocks are updated
            let title = params.title || note.title;
            if (params.blocks && !params.title) {
                // Import extractTitleFromBlocks dynamically to avoid circular dep
                const { extractTitleFromBlocks } = await import('../types');
                title = extractTitleFromBlocks(params.blocks as any);
            }

            const contentChanged = !!(params.blocks || params.title);

            const updates: Partial<NoteRecord> = {
                ...params,
                title,
                updatedAt: Date.now(),
                ...(contentChanged ? { isIndexed: false } : {})
            };

            const updatedNote = { ...note, ...updates } as NoteRecord;

            // Get platform contract and project for gateway creation
            const platform = getPlatformContract();
            const project = currentProjectId ? useProjectStore.getState().projects[currentProjectId] : null;

            if (!project) {
                throw new Error(`Project ${currentProjectId} not found`);
            }

            // Create gateway for current platform
            const gateway = createStorageGateway(platform, {
                directoryHandle: undefined, // Handle will be resolved by gateway internally
                projectId: currentProjectId ?? '',
            });

            const noteGateway = new NoteGateway(gateway);

            // Persist update through gateway (gateway handles merge)
            await noteGateway.updateNote(params.id, updates);

            // Update local state
            set((state) => {
                const newMap = new Map(state.notes);
                newMap.set(params.id, updatedNote);
                const dirtyIds = new Set(state.dirtyNoteIds);

                // Mark as dirty if content changed
                if (contentChanged) {
                    dirtyIds.add(params.id);
                }

                return {
                    notes: newMap,
                    notesArray: Array.from(newMap.values()).sort((a, b) => a.order - b.order),
                    saveStatus: 'saved',
                    dirtyNoteIds: dirtyIds,
                };
            });

            // Trigger auto-save via cross-slice call
            if (contentChanged && currentProjectId) {
                const { triggerAutoSave } = get();
                triggerAutoSave?.(params.id, updatedNote);
            }

            // Trigger indexing via cross-slice call
            if (contentChanged) {
                const { triggerIndexing } = get();
                triggerIndexing?.(params.id);
            }

            // Reset save status after 2 seconds
            setTimeout(() => {
                set({ saveStatus: 'idle' });
            }, 2000);

        } catch (error) {
            set({ saveStatus: 'error', error: (error as Error).message });
            console.error('[NoteStore-CRUD] Failed to update note:', error);
        }
    },

    /**
     * Delete a note and all descendants recursively
     * @param noteId - Note ID to delete
     */
    deleteNote: async (noteId: string) => {
        try {
            const projectId = get().currentProjectId;

            // Capture the note before deletion for event emission
            const deletedNote = get().notes.get(noteId);
            if (!deletedNote) {
                console.warn(`[NoteStore-CRUD] Note ${noteId} not found, skipping deletion`);
                return;
            }

            // Also delete all children recursively
            const deleteRecursive = async (id: string) => {
                const children = get().getNotesByParent(id);
                for (const child of children) {
                    await deleteRecursive(child.id);
                }

                // Get platform contract and project for gateway creation
                const platform = getPlatformContract();
                const currentProjectId = get().currentProjectId;
                const project = currentProjectId ? useProjectStore.getState().projects[currentProjectId] : null;

                if (!project) {
                    console.warn(`[NoteStore-CRUD] Project not found, skipping note deletion`);
                    return;
                }

                // Create gateway for current platform
                const gateway = createStorageGateway(platform, {
                    directoryHandle: undefined,
                    projectId: currentProjectId ?? '',
                });

                const noteGateway = new NoteGateway(gateway);

                // Persist deletion through gateway
                await noteGateway.deleteNote(id);

                // 45-05: Clear scroll position for deleted note
                useNoteNavigationStore.getState().clearNoteScrollPosition(id);
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

            console.log(`[NoteStore-CRUD] Deleted note ${noteId} and children`);

            // Remove from index via cross-slice call
            const { removeFromIndex } = get();
            removeFromIndex?.(noteId, projectId);

        } catch (error) {
            set({ error: (error as Error).message });
            console.error('[NoteStore-CRUD] Failed to delete note:', error);
        }
    },
});
