/**
 * @fileoverview Note Store (Refactored - Slice Pattern)
 * @module lib/notes/note-store-refactored
 * @governance EPIC-26-1
 *
 * Unified note store composed of 7 focused slices:
 * - CRUD operations (create, read, update, delete)
 * - Metadata management (favorite, move)
 * - Query operations (search, filter)
 * - Sync & auto-save (debounced file saves)
 * - Background indexing (RAG search)
 * - Event emission (cross-workspace communication)
 * - UI state (active note, loading, error)
 *
 * Follows December 2025 Zustand patterns:
 * - Slice pattern with single bounded store
 * - Individual selectors (no infinite loops)
 * - Cross-slice communication via get()
 * - Dexie persistence with partialize
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import { createNoteCRUDSlice } from './slices/note-crud-slice';
import { createNoteMetadataSlice } from './slices/note-metadata-slice';
import { createNoteQuerySlice } from './slices/note-query-slice';
import { createNoteSyncSlice } from './slices/note-sync-slice';
import { createNoteIndexingSlice } from './slices/note-indexing-slice';
import { createNoteEventsSlice } from './slices/note-events-slice';
import { createNoteUISlice } from './slices/note-ui-slice';
import type { NoteStoreState } from './types-slice';

// ============================================================================
// Unified Store Composition
// ============================================================================

/**
 * Note Store - Single Bounded Store
 *
 * Combines all slices into one unified store following December 2025 patterns.
 * All cross-slice communication happens via get() to avoid circular dependencies.
 *
 * Persistence Strategy:
 * - Active note ID and project ID persist to IndexedDB
 * - Full note records persist to Dexie notes table (not via Zustand persist)
 * - UI state (loading, error, saveStatus) is ephemeral
 */
export const useNoteStore = create<NoteStoreState>()(
    persist(
        (...args) => ({
            // ====================================================================
            // Initial State
            // ====================================================================

            notes: new Map(),
            notesArray: [],
            indexingNoteIds: new Set(),
            activeNoteId: null,
            currentProjectId: null,
            saveStatus: 'idle',
            dirtyNoteIds: new Set(),
            loading: false,
            error: null,
            _hasHydrated: false,

            // ====================================================================
            // Slice Composition (Order Matters!)
            // ====================================================================

            // 1. UI State (must be first - no dependencies)
            ...createNoteUISlice(...args),

            // 2. Query Operations (read-only, no state mutations)
            ...createNoteQuerySlice(...args),

            // 3. Event Emission (orchestration layer)
            ...createNoteEventsSlice(...args),

            // 4. Indexing Operations (background RAG)
            ...createNoteIndexingSlice(...args),

            // 5. Sync Operations (auto-save, file handlers)
            ...createNoteSyncSlice(...args),

            // 6. Metadata Operations (favorite, move)
            ...createNoteMetadataSlice(...args),

            // 7. CRUD Operations (core lifecycle, depends on all above)
            ...createNoteCRUDSlice(...args),

            // ====================================================================
            // Store Methods (Defined Here, Not In Slices)
            // ====================================================================

            setHasHydrated: (state: boolean) => {
                const [set] = args;
                set({ _hasHydrated: state });
            },

            reset: () => {
                const [set] = args;

                // Clear all debounce timers
                // Note: Timers are module-level in sync slice

                set({
                    notes: new Map(),
                    notesArray: [],
                    indexingNoteIds: new Set(),
                    activeNoteId: null,
                    currentProjectId: null,
                    saveStatus: 'idle',
                    dirtyNoteIds: new Set(),
                    loading: false,
                    error: null,
                });
            },
        }),
        {
            name: 'note-state',
            storage: createJSONStorage(() => createDexieStorage('conversationState' as any)),

            // Only persist essential state (not full note records)
            partialize: (state) => ({
                activeNoteId: state.activeNoteId,
                currentProjectId: state.currentProjectId,
            }),

            // Custom serializer for Map/Set (not used due to partialize, but documented)
            // Actual notes are persisted directly to Dexie notes table

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
// Selector Hooks (Individual Selectors - No Infinite Loops)
// ============================================================================

/**
 * Get active note
 * Uses individual selector to prevent infinite re-renders
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
export function useNoteSaveStatus() {
    return useNoteStore((state) => state.saveStatus);
}

/**
 * Get notes by parent ID
 */
export function useNotesByParent(parentId: string | null) {
    const notesArray = useNoteStore((state) => state.notesArray);
    return notesArray
        .filter(n => (n.parentId ?? null) === parentId)
        .sort((a, b) => a.order - b.order);
}

/**
 * Get favorite notes
 */
export function useFavoriteNotes() {
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

// ============================================================================
// Barrel Exports
// ============================================================================

export type { NoteStoreState } from './types-slice';

// Re-export file save handler registry from sync slice
export { registerFileSaveHandler, unregisterFileSaveHandler } from './slices/note-sync-slice';
