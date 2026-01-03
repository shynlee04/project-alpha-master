/**
 * @fileoverview Knowledge Source CRUD Slice
 * @module lib/state/knowledge/slices/knowledge-source-crud-slice
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * Source CRUD operations slice for knowledge store.
 * Handles loading, selecting, deleting, renaming, and updating sources.
 *
 * @responsibility
 * - Load sources for project from IndexedDB
 * - Select source (active source for preview/edit)
 * - Delete source (soft delete with undo support)
 * - Rename source
 * - Update source metadata (internal action)
 * - Manage loading and error states
 */

import { StateCreator } from 'zustand';
import type {
    SourceRecord,
    SourceMetadata,
    DeletedSource,
    KnowledgeStoreState,
} from '../types';
import { db } from '../../dexie-db';

// ============================================================================
// Slice State & Actions
// ============================================================================

export interface SourceCrudState {
    /** Load sources for a project from IndexedDB */
    loadSources: (projectId: string) => Promise<void>;

    /** Select a source (without opening preview) */
    selectSource: (source: SourceRecord | null) => void;

    /** Delete a source (with undo support) */
    deleteSource: (sourceId: string) => Promise<void>;

    /** Rename a source */
    renameSource: (sourceId: string, newName: string) => Promise<void>;

    /** Update source metadata (internal action) */
    updateSourceMetadata: (sourceId: string, metadata: SourceMetadata) => Promise<void>;
}

// ============================================================================
// Slice Creator
// ============================================================================

export const createSourceCrudSlice: StateCreator<KnowledgeStoreState> = (set, get) => ({
    /**
     * Load sources for a project from IndexedDB
     *
     * @param projectId - Project ID to filter sources
     * @description
     * Fetches all non-deleted sources for the given project.
     * Filters out soft-deleted sources from the result.
     */
    loadSources: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
            const sources = await db.sources
                .where('projectId')
                .equals(projectId)
                .toArray();

            // Filter out soft-deleted sources
            const activeSources = sources.filter(s => !s.deleted);

            set({ sources: activeSources, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    /**
     * Select a source (without opening preview)
     *
     * @param source - Source to select (null to deselect)
     * @description
     * Sets the active source for preview/edit.
     * Use openPreview() to select and open preview panel together.
     */
    selectSource: (source) => {
        set({ selectedSource: source });
    },

    /**
     * Delete a source (soft delete with undo support)
     *
     * @param sourceId - Source ID to delete
     * @description
     * Soft deletes source by marking deleted flag in IndexedDB.
     * Adds to undo queue for 5-second window to allow undo.
     * Removes source from all collections automatically.
     * Clears selected source if it was deleted.
     */
    deleteSource: async (sourceId: string) => {
        try {
            const source = get().sources.find(s => s.id === sourceId);
            if (!source) return;

            // Soft delete: mark as deleted in IndexedDB
            await db.sources.update(sourceId, {
                deleted: true,
                deletedAt: Date.now(),
            });

            // Remove from local state
            const sources = get().sources.filter(s => s.id !== sourceId);
            set({ sources });

            // Add to undo queue (5 second window)
            const deletedSource: DeletedSource = {
                sourceId,
                source,
                timestamp: Date.now(),
            };

            set((state) => ({
                undoQueue: [...state.undoQueue, deletedSource],
            }));

            // Clear selected source if it was deleted
            if (get().selectedSource?.id === sourceId) {
                set({ selectedSource: null });
            }

            // Remove source from all collections
            // (Note: This uses collection slice's state)
            for (const collection of get().collections) {
                if (collection.sourceIds.includes(sourceId)) {
                    await db.collections
                        .where('id')
                        .equals(collection.id)
                        .modify(col => {
                            col.sourceIds = col.sourceIds.filter(id => id !== sourceId);
                        });
                }
            }

            // Auto-clear from undo queue after 5 seconds
            setTimeout(() => {
                set((state) => ({
                    undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId),
                }));
            }, 5000);
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    /**
     * Rename a source
     *
     * @param sourceId - Source ID to rename
     * @param newName - New title for the source
     * @description
     * Updates source title in IndexedDB and local state.
     * Also updates selectedSource if it matches.
     */
    renameSource: async (sourceId: string, newName: string) => {
        try {
            // Update in IndexedDB
            await db.sources.update(sourceId, {
                title: newName,
                updatedAt: Date.now(),
            });

            // Update in local state (both sources array and selectedSource)
            set((state) => ({
                sources: state.sources.map(s =>
                    s.id === sourceId
                        ? { ...s, title: newName, updatedAt: Date.now() }
                        : s
                ),
                selectedSource:
                    state.selectedSource?.id === sourceId
                        ? { ...state.selectedSource, title: newName, updatedAt: Date.now() }
                        : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    /**
     * Update source metadata (internal action)
     *
     * @param sourceId - Source ID to update
     * @param metadata - Metadata fields to update
     * @description
     * Internal action for updating source metadata.
     * Used by metadata extraction and user editing actions.
     * Updates IndexedDB and local state (sources array and selectedSource).
     */
    updateSourceMetadata: async (sourceId: string, metadata: SourceMetadata) => {
        try {
            // Update in IndexedDB
            await db.sources.update(sourceId, {
                ...metadata,
                updatedAt: Date.now(),
            });

            // Update in local state
            set((state) => ({
                sources: state.sources.map(s =>
                    s.id === sourceId
                        ? { ...s, ...metadata, updatedAt: Date.now() }
                        : s
                ),
                selectedSource:
                    state.selectedSource?.id === sourceId
                        ? { ...state.selectedSource, ...metadata, updatedAt: Date.now() }
                        : state.selectedSource,
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
});
