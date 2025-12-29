/**
 * @fileoverview Knowledge State Management (Zustand)
 * @module lib/state/knowledge-store
 * @governance EPIC-6-2
 *
 * Single source of truth for knowledge source state.
 * Persists to IndexedDB via Dexie adapter.
 *
 * Features:
 * - Source list management
 * - Selected source tracking
 * - Preview panel state
 * - Source deletion
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';
import type { SourceRecord } from './dexie-db';
import { db } from './dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Knowledge Store State Interface
 */
interface KnowledgeStoreState {
    /** All sources for current project */
    sources: SourceRecord[];

    /** Currently selected source */
    selectedSource: SourceRecord | null;

    /** Whether preview panel is open */
    isPreviewOpen: boolean;

    /** Loading state for async operations */
    loading: boolean;

    /** Error state */
    error: string | null;

    /** Whether store has hydrated from persistence */
    _hasHydrated: boolean;

    // Actions

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Load sources for a project */
    loadSources: (projectId: string) => Promise<void>;

    /** Select a source (without opening preview) */
    selectSource: (source: SourceRecord | null) => void;

    /** Open preview panel with source */
    openPreview: (source: SourceRecord) => void;

    /** Close preview panel */
    closePreview: () => void;

    /** Delete a source */
    deleteSource: (sourceId: string) => Promise<void>;

    /** Reset store to initial state */
    reset: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useKnowledgeStore = create<KnowledgeStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            sources: [],
            selectedSource: null,
            isPreviewOpen: false,
            loading: false,
            error: null,
            _hasHydrated: false,

            // Actions
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            loadSources: async (projectId: string) => {
                set({ loading: true, error: null });
                try {
                    const sources = await db.sources
                        .where('projectId')
                        .equals(projectId)
                        .toArray();
                    set({ sources, loading: false });
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            selectSource: (source) => {
                set({ selectedSource: source });
            },

            openPreview: (source) => {
                set({
                    selectedSource: source,
                    isPreviewOpen: true,
                });
            },

            closePreview: () => {
                set({
                    isPreviewOpen: false,
                    selectedSource: null,
                });
            },

            deleteSource: async (sourceId: string) => {
                try {
                    await db.sources.delete(sourceId);
                    const sources = get().sources.filter(s => s.id !== sourceId);
                    set({ sources });

                    // Clear selected source if it was deleted
                    if (get().selectedSource?.id === sourceId) {
                        set({ selectedSource: null, isPreviewOpen: false });
                    }
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            reset: () => {
                set({
                    sources: [],
                    selectedSource: null,
                    isPreviewOpen: false,
                    loading: false,
                    error: null,
                });
            },
        }),
        {
            name: 'knowledge-state',
            // Use Dexie storage adapter for IndexedDB persistence
            storage: createJSONStorage(() => createDexieStorage('knowledgeState')),

            // Persist all essential state
            partialize: (state) => ({
                sources: state.sources,
                selectedSource: state.selectedSource,
                isPreviewOpen: state.isPreviewOpen,
            }),

            // Hydration handler
            onRehydrateStorage: () => (state) => {
                console.log('[KnowledgeStore] Rehydrated from IndexedDB:',
                    state?.sources?.length || 0, 'sources');

                if (state) {
                    // Clear selected source if no longer valid
                    if (state.selectedSource && !state.sources.find(s => s.id === state.selectedSource?.id)) {
                        state.selectedSource = null;
                        state.isPreviewOpen = false;
                    }

                    state.setHasHydrated(true);
                }
            },
        }
    )
);
