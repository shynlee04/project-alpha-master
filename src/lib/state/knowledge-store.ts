/**
 * @fileoverview Knowledge State Management (Zustand)
 * @module lib/state/knowledge-store
 * @governance EPIC-6-3, EPIC-6-4
 *
 * Single source of truth for knowledge source state.
 * Persists to IndexedDB via Dexie adapter.
 *
 * Features (Extended for Story 6.3):
 * - Source list management
 * - Selected source tracking
 * - Preview panel state
 * - Source deletion with undo
 * - Source rename
 * - Collection management
 *
 * Features (Extended for Story 6.4):
 * - AI metadata extraction
 * - User metadata editing
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';
import type { SourceRecord, CollectionRecord } from './dexie-db';
import {
    db,
    getCollectionsForProject as dbGetCollectionsForProject,
    saveCollection as dbSaveCollection,
    deleteCollection as dbDeleteCollection,
    addSourceToCollection as dbAddSourceToCollection,
    removeSourceFromCollection as dbRemoveSourceFromCollection,
} from './dexie-db';
import { metadataExtractor } from '@/lib/knowledge/metadata-extractor';

// ============================================================================
// Types
// ============================================================================

/**
 * Deleted source for undo functionality
 */
interface DeletedSource {
    sourceId: string;
    source: SourceRecord;
    timestamp: number;
}

/**
 * Metadata fields for editing (Story 6.4)
 */
export interface SourceMetadataFields {
    summary?: string;
    keyConcepts?: string[];
    suggestedQuestions?: string[];
}

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

    // Story 6-3: Collections
    /** All collections for current project */
    collections: CollectionRecord[];

    /** Currently filtered collection (null = show all) */
    filteredCollectionId: string | null;

    /** Undo queue for deleted sources */
    undoQueue: DeletedSource[];

    // Story 6-4: Metadata extraction state
    /** Source IDs currently being extracted */
    extractingMetadata: Set<string>;

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

    /** Delete a source (with undo support) */
    deleteSource: (sourceId: string) => Promise<void>;

    /** Undo delete source */
    undoDelete: (sourceId: string) => Promise<void>;

    /** Rename a source */
    renameSource: (sourceId: string, newName: string) => Promise<void>;

    /** Load collections for a project */
    loadCollections: (projectId: string) => Promise<void>;

    /** Create a new collection */
    createCollection: (name: string) => Promise<void>;

    /** Update collection */
    updateCollection: (collectionId: string, updates: Partial<CollectionRecord>) => Promise<void>;

    /** Delete collection */
    deleteCollection: (collectionId: string) => Promise<void>;

    /** Add source to collection */
    addSourceToCollection: (sourceId: string, collectionId: string) => Promise<void>;

    /** Remove source from collection */
    removeSourceFromCollection: (sourceId: string, collectionId: string) => Promise<void>;

    /** Filter sources by collection */
    filterByCollection: (collectionId: string | null) => void;

    // Story 6-4: Metadata actions
    /** Extract metadata for a source using AI */
    extractMetadata: (sourceId: string) => Promise<void>;

    /** Update metadata for a source (user edits) */
    updateMetadata: (sourceId: string, metadata: SourceMetadataFields) => Promise<void>;

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

            // Story 6-3: Collections
            collections: [],
            filteredCollectionId: null,
            undoQueue: [],

            // Story 6-4: Metadata extraction state
            extractingMetadata: new Set<string>(),

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

                    // Filter out soft-deleted sources
                    const activeSources = sources.filter(s => !s.deleted);

                    set({ sources: activeSources, loading: false });
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
                    set((state) => ({
                        undoQueue: [
                            ...state.undoQueue,
                            { sourceId, source, timestamp: Date.now() }
                        ]
                    }));

                    // Clear selected source if it was deleted
                    if (get().selectedSource?.id === sourceId) {
                        set({ selectedSource: null, isPreviewOpen: false });
                    }

                    // Remove source from all collections
                    for (const collection of get().collections) {
                        if (collection.sourceIds.includes(sourceId)) {
                            await dbRemoveSourceFromCollection(collection.id, sourceId);
                        }
                    }

                    // Auto-clear from undo queue after 5 seconds
                    setTimeout(() => {
                        set((state) => ({
                            undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId)
                        }));
                    }, 5000);
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            undoDelete: async (sourceId: string) => {
                try {
                    // Restore source: remove deleted flag
                    await db.sources.update(sourceId, {
                        deleted: false,
                        deletedAt: undefined,
                    });

                    // Get the source from undo queue
                    const undoItem = get().undoQueue.find(item => item.sourceId === sourceId);
                    if (!undoItem) return;

                    // Restore to local state
                    set((state) => ({
                        sources: [...state.sources, undoItem.source],
                        undoQueue: state.undoQueue.filter(item => item.sourceId !== sourceId)
                    }));
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            renameSource: async (sourceId: string, newName: string) => {
                try {
                    // Update in IndexedDB
                    await db.sources.update(sourceId, {
                        title: newName,
                        updatedAt: Date.now(),
                    });

                    // Update local state
                    set((state) => ({
                        sources: state.sources.map(s =>
                            s.id === sourceId ? { ...s, title: newName } : s
                        ),
                        selectedSource:
                            state.selectedSource?.id === sourceId
                                ? { ...state.selectedSource, title: newName }
                                : state.selectedSource
                    }));
                } catch (error) {
                    set({ error: (error as Error).message });
                }
            },

            loadCollections: async (projectId: string) => {
                set({ loading: true, error: null });
                try {
                    const collections = await dbGetCollectionsForProject(projectId);
                    set({ collections, loading: false });
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            createCollection: async (name: string) => {
                set({ loading: true, error: null });
                try {
                    // TODO: Get projectId from current project context
                    // This needs to be integrated with the active project selection
                    // For now, this is a placeholder that needs completion
                    const projectId = 'current-project-id'; // Placeholder
                    const collectionId = crypto.randomUUID();
                    const now = Date.now();

                    await db.collections.add({
                        id: collectionId,
                        projectId,
                        name,
                        sourceIds: [],
                        createdAt: now,
                        updatedAt: now,
                    });

                    // Reload collections
                    const collections = await dbGetCollectionsForProject(projectId);
                    set({ collections, loading: false });
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            updateCollection: async (collectionId: string, updates: Partial<CollectionRecord>) => {
                set({ loading: true, error: null });
                try {
                    const collection = get().collections.find(c => c.id === collectionId);
                    if (!collection) return;

                    const updated = { ...collection, ...updates, updatedAt: Date.now() };
                    await dbSaveCollection(updated);

                    set((state) => ({
                        collections: state.collections.map(c =>
                            c.id === collectionId ? updated : c
                        ),
                        loading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            deleteCollection: async (collectionId: string) => {
                set({ loading: true, error: null });
                try {
                    await dbDeleteCollection(collectionId);

                    set((state) => ({
                        collections: state.collections.filter(c => c.id !== collectionId),
                        filteredCollectionId:
                            state.filteredCollectionId === collectionId ? null : state.filteredCollectionId,
                        loading: false
                    }));
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            addSourceToCollection: async (sourceId: string, collectionId: string) => {
                set({ loading: true, error: null });
                try {
                    await dbAddSourceToCollection(collectionId, sourceId);

                    // TODO: Get projectId from current project context
                    // For now, get it from the collection being updated
                    const collection = get().collections.find(c => c.id === collectionId);
                    if (collection) {
                        const collections = await dbGetCollectionsForProject(collection.projectId);
                        set({ collections, loading: false });
                    } else {
                        set({ loading: false });
                    }
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            removeSourceFromCollection: async (sourceId: string, collectionId: string) => {
                set({ loading: true, error: null });
                try {
                    await dbRemoveSourceToCollection(collectionId, sourceId);

                    // TODO: Get projectId from current project context
                    // For now, get it from the collection being updated
                    const collection = get().collections.find(c => c.id === collectionId);
                    if (collection) {
                        const collections = await dbGetCollectionsForProject(collection.projectId);
                        set({ collections, loading: false });
                    } else {
                        set({ loading: false });
                    }
                } catch (error) {
                    set({ error: (error as Error).message, loading: false });
                }
            },

            filterByCollection: (collectionId: string | null) => {
                set({ filteredCollectionId: collectionId });
            },

            // Story 6-4: Extract metadata using AI
            extractMetadata: async (sourceId: string) => {
                const source = get().sources.find(s => s.id === sourceId);
                if (!source || !source.content) {
                    set({ error: 'Source not found or has no content' });
                    return;
                }

                // Add to extracting set
                set((state) => ({
                    extractingMetadata: new Set([...state.extractingMetadata, sourceId]),
                    error: null,
                }));

                try {
                    // Extract metadata using AI
                    const metadata = await metadataExtractor.extractAllMetadata(source);

                    // Update in IndexedDB
                    await db.sources.update(sourceId, {
                        summary: metadata.summary,
                        keyConcepts: metadata.keyConcepts,
                        suggestedQuestions: metadata.suggestedQuestions,
                        metadataExtracted: metadata.metadataExtracted,
                        metadataEdited: metadata.metadataEdited,
                        updatedAt: Date.now(),
                    });

                    // Update local state
                    set((state) => ({
                        sources: state.sources.map(s =>
                            s.id === sourceId
                                ? {
                                    ...s,
                                    summary: metadata.summary,
                                    keyConcepts: metadata.keyConcepts,
                                    suggestedQuestions: metadata.suggestedQuestions,
                                    metadataExtracted: metadata.metadataExtracted,
                                    metadataEdited: metadata.metadataEdited,
                                }
                                : s
                        ),
                        selectedSource:
                            state.selectedSource?.id === sourceId
                                ? {
                                    ...state.selectedSource,
                                    summary: metadata.summary,
                                    keyConcepts: metadata.keyConcepts,
                                    suggestedQuestions: metadata.suggestedQuestions,
                                    metadataExtracted: metadata.metadataExtracted,
                                    metadataEdited: metadata.metadataEdited,
                                }
                                : state.selectedSource,
                        extractingMetadata: new Set(
                            [...state.extractingMetadata].filter(id => id !== sourceId)
                        ),
                    }));
                } catch (error) {
                    set((state) => ({
                        error: (error as Error).message,
                        extractingMetadata: new Set(
                            [...state.extractingMetadata].filter(id => id !== sourceId)
                        ),
                    }));
                }
            },

            // Story 6-4: Update metadata (user edits)
            updateMetadata: async (sourceId: string, metadata: SourceMetadataFields) => {
                const source = get().sources.find(s => s.id === sourceId);
                if (!source) {
                    set({ error: 'Source not found' });
                    return;
                }

                try {
                    // Update in IndexedDB
                    await db.sources.update(sourceId, {
                        summary: metadata.summary,
                        keyConcepts: metadata.keyConcepts,
                        suggestedQuestions: metadata.suggestedQuestions,
                        metadataEdited: true,
                        updatedAt: Date.now(),
                    });

                    // Update local state
                    set((state) => ({
                        sources: state.sources.map(s =>
                            s.id === sourceId
                                ? {
                                    ...s,
                                    ...metadata,
                                    metadataEdited: true,
                                }
                                : s
                        ),
                        selectedSource:
                            state.selectedSource?.id === sourceId
                                ? {
                                    ...state.selectedSource,
                                    ...metadata,
                                    metadataEdited: true,
                                }
                                : state.selectedSource,
                    }));
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
                    collections: [],
                    filteredCollectionId: null,
                    undoQueue: [],
                    extractingMetadata: new Set<string>(),
                });
            },
        }),
        {
            name: 'knowledge-state',
            // Use Dexie storage adapter for IndexedDB persistence
            // Note: Using conversationState table for knowledge state persistence
            // The key 'knowledge-state' distinguishes it from conversation data
            storage: createJSONStorage(() => createDexieStorage('conversationState' as keyof typeof db)),

            // Persist all essential state
            partialize: (state) => ({
                sources: state.sources,
                selectedSource: state.selectedSource,
                isPreviewOpen: state.isPreviewOpen,
                collections: state.collections,
                filteredCollectionId: state.filteredCollectionId,
            }),

            // Hydration handler
            onRehydrateStorage: () => (state) => {
                console.log('[KnowledgeStore] Rehydrated from IndexedDB:',
                    state?.sources?.length || 0, 'sources,',
                    state?.collections?.length || 0, 'collections');

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
