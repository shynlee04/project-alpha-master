/**
 * @fileoverview Snippet Export Slice - Export/import functionality
 * @module snippets/snippet-store/snippet-export-slice
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

export interface SnippetExportState {
  /** Export statistics */
  exportStats: {
    totalExports: number;
    totalImports: number;
    lastExportTime: number | null;
    lastImportTime: number | null;
  };
}

export interface SnippetExportActions {
  /** Export snippets as JSON */
  exportSnippets: () => Promise<string>;

  /** Import snippets from JSON */
  importSnippets: (
    json: string,
    onAddSnippets?: (snippets: CodeSnippetRecord[]) => void
  ) => Promise<void>;

  /** Reset export statistics */
  resetExportStats: () => void;
}

export type SnippetExportSlice = SnippetExportState & SnippetExportActions;

export const createSnippetExportSlice: StateCreator<
  SnippetExportSlice,
  [],
  [],
  SnippetExportSlice
> = (set, _get, _api) => ({
  exportStats: {
    totalExports: 0,
    totalImports: 0,
    lastExportTime: null,
    lastImportTime: null,
  },

  exportSnippets: async () => {
    try {
      const userSnippets = (await db.codeSnippets.toArray()).filter(
        (s: CodeSnippetRecord) => !s.isBuiltIn
      );

      const json = JSON.stringify(userSnippets, null, 2);

      set((state) => ({
        exportStats: {
          ...state.exportStats,
          totalExports: state.exportStats.totalExports + 1,
          lastExportTime: Date.now(),
        },
      }));

      return json;
    } catch (error) {
      console.error('[SnippetExportSlice] Failed to export snippets:', error);
      throw error;
    }
  },

  importSnippets: async (json, onAddSnippets) => {
    try {
      const importedSnippets = JSON.parse(json) as CodeSnippetRecord[];

      if (!Array.isArray(importedSnippets)) {
        throw new Error('Invalid import format: expected array');
      }

      // Validate and add snippets
      const validSnippets = importedSnippets
        .filter((s) => s.name && s.language && s.code)
        .map((snippet) => ({
          ...snippet,
          id: uuidv4(), // Generate new IDs to avoid conflicts
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isBuiltIn: false,
        }));

      await db.codeSnippets.bulkAdd(validSnippets);

      // Call callback to add snippets to state
      if (onAddSnippets) {
        onAddSnippets(validSnippets);
      }

      set((state) => ({
        exportStats: {
          ...state.exportStats,
          totalImports: state.exportStats.totalImports + 1,
          lastImportTime: Date.now(),
        },
      }));
    } catch (error) {
      console.error('[SnippetExportSlice] Failed to import snippets:', error);
      throw error;
    }
  },

  resetExportStats: () => {
    set({
      exportStats: {
        totalExports: 0,
        totalImports: 0,
        lastExportTime: null,
        lastImportTime: null,
      },
    });
  },
});
