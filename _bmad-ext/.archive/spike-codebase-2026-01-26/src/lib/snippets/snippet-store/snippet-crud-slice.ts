/**
 * @fileoverview Snippet CRUD Slice - Core snippet management
 * @module snippets/snippet-store/snippet-crud-slice
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';

/**
 * Generate UUID v4
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface SnippetCrudState {
  /** All snippets including built-in and user-created */
  snippets: CodeSnippetRecord[];

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;
}

export interface SnippetCrudActions {
  /** Load snippets from Dexie */
  loadSnippets: (builtInSnippets: CodeSnippetRecord[]) => Promise<void>;

  /** Create a new snippet */
  createSnippet: (snippet: Omit<CodeSnippetRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;

  /** Update an existing snippet */
  updateSnippet: (id: string, updates: Partial<Omit<CodeSnippetRecord, 'id' | 'createdAt' | 'isBuiltIn'>>) => Promise<void>;

  /** Delete a snippet */
  deleteSnippet: (id: string) => Promise<void>;

  /** Set error state */
  setError: (error: string | null) => void;
}

export type SnippetCrudSlice = SnippetCrudState & SnippetCrudActions;

export const createSnippetCrudSlice: StateCreator<
  SnippetCrudSlice,
  [],
  [],
  SnippetCrudSlice
> = (set, _get, _api) => ({
  snippets: [],
  isLoading: false,
  error: null,

  loadSnippets: async (builtInSnippets) => {
    set({ isLoading: true, error: null });

    try {
      // Load user snippets from Dexie
      const userSnippets = await db.codeSnippets.toArray();

      // Combine with built-in snippets
      const allSnippets = [...builtInSnippets, ...userSnippets];

      set({ snippets: allSnippets, isLoading: false });
    } catch (error) {
      console.error('[SnippetCrudSlice] Failed to load snippets:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load snippets',
        isLoading: false,
      });
    }
  },

  createSnippet: async (snippetData) => {
    set({ isLoading: true, error: null });

    try {
      const id = uuidv4();
      const now = Date.now();

      const newSnippet: CodeSnippetRecord = {
        id,
        ...snippetData,
        isBuiltIn: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.codeSnippets.add(newSnippet);

      set((state) => ({
        snippets: [...state.snippets, newSnippet],
        isLoading: false,
      }));

      return id;
    } catch (error) {
      console.error('[SnippetCrudSlice] Failed to create snippet:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create snippet',
        isLoading: false,
      });
      throw error;
    }
  },

  updateSnippet: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const snippet = await db.codeSnippets.get(id);

      if (!snippet) {
        throw new Error(`Snippet not found: ${id}`);
      }

      if (snippet.isBuiltIn) {
        throw new Error('Cannot modify built-in snippets');
      }

      const updatedSnippet: CodeSnippetRecord = {
        ...snippet,
        ...updates,
        updatedAt: Date.now(),
      };

      await db.codeSnippets.put(updatedSnippet);

      set((state) => ({
        snippets: state.snippets.map((s) => (s.id === id ? updatedSnippet : s)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('[SnippetCrudSlice] Failed to update snippet:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update snippet',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteSnippet: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const snippet = await db.codeSnippets.get(id);

      if (!snippet) {
        throw new Error(`Snippet not found: ${id}`);
      }

      if (snippet.isBuiltIn) {
        throw new Error('Cannot delete built-in snippets');
      }

      await db.codeSnippets.delete(id);

      set((state) => ({
        snippets: state.snippets.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('[SnippetCrudSlice] Failed to delete snippet:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete snippet',
        isLoading: false,
      });
      throw error;
    }
  },

  setError: (error) => {
    set({ error });
  },
});
