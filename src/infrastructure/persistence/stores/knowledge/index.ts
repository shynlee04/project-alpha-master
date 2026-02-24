/**
 * @fileoverview Knowledge store (stub - DEFERRED)
 * @module infrastructure/persistence/stores/knowledge
 * @status DEFERRED - Knowledge workspace is post-MVP
 *
 * Provides state management for Knowledge workspace.
 * Actual implementation will be added when Knowledge workspace epic begins.
 */

import { create } from 'zustand';

// ============================================================
// Types
// ============================================================

/**
 * Knowledge source type
 */
export interface KnowledgeSource {
  id: string;
  title: string;
  type: 'pdf' | 'url' | 'text' | 'image';
  content?: string;
  path?: string;
  url?: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
  keyConcepts?: string[];
}

/**
 * Knowledge store state
 */
export interface KnowledgeStoreState {
  sources: KnowledgeSource[];
  selectedSourceId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addSource: (source: Omit<KnowledgeSource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  removeSource: (id: string) => Promise<void>;
  updateSource: (id: string, updates: Partial<KnowledgeSource>) => Promise<void>;
  selectSource: (id: string | null) => void;
  loadSources: () => Promise<void>;
  clearAll: () => Promise<void>;
}

// ============================================================
// Store
// ============================================================

/**
 * Knowledge store (stub)
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export const useKnowledgeStore = create<KnowledgeStoreState>((set, _get) => ({
  sources: [],
  selectedSourceId: null,
  isLoading: false,
  error: null,

  addSource: async (_source) => {
    console.warn('[KnowledgeStore] Knowledge workspace is deferred to post-MVP');
    const id = crypto.randomUUID();
    return id;
  },

  removeSource: async (_id) => {
    console.warn('[KnowledgeStore] Knowledge workspace is deferred to post-MVP');
  },

  updateSource: async (_id, _updates) => {
    console.warn('[KnowledgeStore] Knowledge workspace is deferred to post-MVP');
  },

  selectSource: (id) => {
    set({ selectedSourceId: id });
  },

  loadSources: async () => {
    set({ sources: [], isLoading: false });
  },

  clearAll: async () => {
    set({ sources: [], selectedSourceId: null });
  },
}));

// ============================================================
// Export type alias for backward compatibility
// ============================================================

export type KnowledgeState = KnowledgeStoreState;
