/**
 * @fileoverview Knowledge Sources Slice
 * @module infrastructure/persistence/stores/knowledge/knowledge-sources-slice
 * @governance EPIC-6-3
 *
 * Source CRUD operations with undo support.
 */

import { StateCreator } from 'zustand';
import type {
  KnowledgeSource,
  CreateSourceInput,
  UpdateSourceInput,
  KnowledgeSourcesState,
} from './knowledge-types';

/**
 * Generate unique source ID
 */
function generateSourceId(): string {
  return `src_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const createKnowledgeSourcesSlice: StateCreator<
  KnowledgeSourcesState,
  [],
  [],
  KnowledgeSourcesState
> = (set, get, _api) => ({
  // State initialization
  sources: {},
  selectedSourceId: null,
  undoQueue: [],

  // Create new source
  createSource: (input: CreateSourceInput) => {
    const sourceId = generateSourceId();
    const now = new Date();
    const source: KnowledgeSource = {
      id: sourceId,
      projectId: input.projectId,
      title: input.title,
      type: input.type,
      content: input.content,
      wordCount: input.wordCount,
      charCount: input.charCount,
      createdAt: now,
      updatedAt: now,
      processingStatus: 'pending',
    };

    set((state) => ({
      sources: { ...state.sources, [sourceId]: source },
    }));

    // TODO: Persist to Dexie
    console.log('[KnowledgeStore] Created source:', sourceId);

    return sourceId;
  },

  // Update existing source
  updateSource: (sourceId: string, updates: UpdateSourceInput) => {
    set((state) => {
      const existing = state.sources[sourceId];
      if (!existing) {
        console.warn('[KnowledgeStore] Source not found:', sourceId);
        return state;
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };

      return {
        sources: { ...state.sources, [sourceId]: updated },
      };
    });

    // TODO: Persist to Dexie
  },

  // Delete source (soft delete with undo support)
  deleteSource: (sourceId: string) => {
    set((state) => {
      const existing = state.sources[sourceId];
      if (!existing) {
        console.warn('[KnowledgeStore] Source not found:', sourceId);
        return state;
      }

      // Add to undo queue
      const undoItem = {
        sourceId,
        source: existing,
        timestamp: Date.now(),
      };

      return {
        sources: {
          ...state.sources,
          [sourceId]: { ...existing, deleted: true, updatedAt: new Date() },
        },
        undoQueue: [undoItem, ...state.undoQueue].slice(0, 10), // Keep last 10
        selectedSourceId:
          state.selectedSourceId === sourceId ? null : state.selectedSourceId,
      };
    });

    // TODO: Persist to Dexie
  },

  // Select a source
  selectSource: (sourceId: string | null) => {
    set({ selectedSourceId: sourceId });
  },

  // Undo delete
  undoDelete: (sourceId: string) => {
    set((state) => {
      const existing = state.sources[sourceId];
      if (!existing) {
        console.warn('[KnowledgeStore] Source not found:', sourceId);
        return state;
      }

      // Restore from undo queue
      // const undoItem = state.undoQueue.find((u) => u.sourceId === sourceId);
      // TODO: Could use undoItem to validate the restore operation

      return {
        sources: {
          ...state.sources,
          [sourceId]: { ...existing, deleted: false, updatedAt: new Date() },
        },
        undoQueue: state.undoQueue.filter((u) => u.sourceId !== sourceId),
      };
    });

    // TODO: Persist to Dexie
  },

  // Get source by ID
  getSource: (sourceId: string) => {
    return get().sources[sourceId];
  },

  // Get all sources
  getAllSources: () => {
    return Object.values(get().sources);
  },

  // Get selected source
  getSelectedSource: () => {
    const { selectedSourceId, sources } = get();
    if (!selectedSourceId) return null;
    return sources[selectedSourceId] || null;
  },

  // Rename source (convenience method)
  renameSource: async (sourceId: string, newName: string) => {
    get().updateSource(sourceId, { title: newName });
  },

  // Load sources from persistence (Dexie integration TODO)
  loadSources: async (_projectId: string) => {
    // TODO: Load from Dexie IndexedDB
    // For now, sources are loaded via persist middleware on hydration
    console.log('[KnowledgeStore] loadSources called for project:', _projectId);
  },
});
