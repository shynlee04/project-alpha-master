/**
 * @fileoverview Note Sync Slice
 * @module lib/notes/slices/note-sync-slice
 * @governance EPIC-26-1
 *
 * Auto-save and file synchronization:
 * - triggerAutoSave: Debounced auto-save to file system
 * - saveNoteToFile: Manual save to file system
 * - File save handler registry
 * - Debounce timer management
 *
 * Handles syncing note changes to local file system via NoteFolderBridge.
 */

import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { StateCreator } from 'zustand';
import type { NoteStoreState } from '../types-slice';
import { NoteFolderBridge } from '@/infrastructure/sync/workspace-services/notes/note-folder-bridge';

// ============================================================================
// Debounce Timer Management
// ============================================================================

/**
 * Active debounce timers for auto-save
 * Maps noteId -> timer ID
 */
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Clear debounce timer for a note
 */
function clearDebounceTimer(noteId: string): void {
    const timer = debounceTimers.get(noteId);
    if (timer) {
        clearTimeout(timer);
        debounceTimers.delete(noteId);
    }
}

/**
 * Set debounce timer for auto-save
 */
function setDebounceTimer(noteId: string, callback: () => void, delay: number): void {
    clearDebounceTimer(noteId);
    const timer = setTimeout(callback, delay);
    debounceTimers.set(noteId, timer);
}

// ============================================================================
// File Save Handler Registry
// ============================================================================

/**
 * Registered file save handlers for different projects
 * Maps projectId -> NoteFolderBridge instance
 */
const fileSaveHandlers = new Map<string, NoteFolderBridge>();

/**
 * Register file save handler for a project
 */
export function registerFileSaveHandler(projectId: string, handler: NoteFolderBridge): void {
    fileSaveHandlers.set(projectId, handler);
    console.log(`[NoteStore-Sync] Registered file save handler for project ${projectId}`);
}

/**
 * Unregister file save handler for a project
 */
export function unregisterFileSaveHandler(projectId: string): void {
    fileSaveHandlers.delete(projectId);
    console.log(`[NoteStore-Sync] Unregistered file save handler for project ${projectId}`);
}

// ============================================================================
// Sync Slice
// ============================================================================

/**
 * Sync Operations Slice
 *
 * Manages auto-save debouncing and file system synchronization.
 * Coordinates with NoteFolderBridge for saving notes to local files.
 *
 * @param set - Zustand setState function
 * @param get - Zustand getState function
 */
export const createNoteSyncSlice: StateCreator<
    NoteStoreState,
    [],
    [],
    Pick<NoteStoreState, 'triggerAutoSave' | 'saveNoteToFile'>
> = (set, get) => ({

    /**
     * Trigger debounced auto-save to file system
     * Called by note-crud-slice after content changes
     *
     * @param noteId - Note ID to save
     * @param note - Updated note record
     */
    triggerAutoSave: async (noteId: string, note: NoteRecord) => {
        const { currentProjectId } = get();

        if (!currentProjectId) {
            console.log(`[NoteStore-Sync] No project selected, skipping auto-save for note ${noteId}`);
            return;
        }

        const handler = fileSaveHandlers.get(currentProjectId);
        if (!handler) {
            console.log(`[NoteStore-Sync] No file save handler registered for project ${currentProjectId}`);
            return;
        }

        // Clear existing timer and set new one
        setDebounceTimer(noteId, async () => {
            try {
                const result = await handler.saveNoteToFile(note, '');
                if (result.success) {
                    // Remove from dirty set on successful save
                    set(state => {
                        const dirtyIds = new Set(state.dirtyNoteIds);
                        dirtyIds.delete(noteId);
                        return { dirtyNoteIds: dirtyIds };
                    });
                    console.log(`[NoteStore-Sync] Auto-saved note ${noteId} to file`);
                } else {
                    console.error(`[NoteStore-Sync] Auto-save failed for note ${noteId}:`, result.error);
                }
            } catch (error) {
                console.error(`[NoteStore-Sync] Auto-save error for note ${noteId}:`, error);
            }
        }, 2000); // 2s debounce
    },

    /**
     * Manually save note to file system
     * Clears pending debounce timer and saves immediately
     *
     * @param noteId - Note ID to save
     */
    saveNoteToFile: async (noteId: string) => {
        const { notes, currentProjectId, dirtyNoteIds } = get();
        const note = notes.get(noteId);

        if (!note) {
            console.error(`[NoteStore-Sync] Cannot save note ${noteId}: not found`);
            return;
        }

        if (!currentProjectId) {
            console.error(`[NoteStore-Sync] Cannot save note ${noteId}: no project selected`);
            return;
        }

        const handler = fileSaveHandlers.get(currentProjectId);
        if (!handler) {
            console.error(`[NoteStore-Sync] No file save handler registered for project ${currentProjectId}`);
            return;
        }

        try {
            // Clear any pending debounce timer
            clearDebounceTimer(noteId);

            // Save to file
            const result = await handler.saveNoteToFile(note, '');

            if (result.success) {
                // Remove from dirty set on successful save
                const dirtyIds = new Set(dirtyNoteIds);
                dirtyIds.delete(noteId);
                set({ dirtyNoteIds: dirtyIds });

                console.log(`[NoteStore-Sync] Manually saved note ${noteId} to file`);
            } else {
                console.error(`[NoteStore-Sync] Manual save failed for note ${noteId}:`, result.error);
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error(`[NoteStore-Sync] Manual save error for note ${noteId}:`, error);
            throw error;
        }
    },
});
