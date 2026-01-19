/**
 * @fileoverview Snippet Utils Slice - Utility functions for snippets
 * @module snippets/snippet-store/snippet-utils-slice
 */

import { StateCreator } from 'zustand';
import type { CodeSnippetRecord, SnippetPlaceholder, InsertedSnippet } from '@/infrastructure/persistence/dexie-db-snippet-types';

// ============================================================================
// Standalone Utility Functions (for backward compatibility)
// ============================================================================

/**
 * Parse snippet placeholders from code
 * Pure function - can be used standalone or via store
 */
export function parseSnippetPlaceholders(code: string): SnippetPlaceholder[] {
  const placeholderRegex = /\$\{(\d+):?([^}]*)\}/g;
  const placeholders: SnippetPlaceholder[] = [];
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(code)) !== null) {
    const tabStop = parseInt(match[1], 10);
    const variableName = match[2] || `placeholder_${tabStop}`;

    placeholders.push({
      tabStop,
      variableName,
      defaultValue: match[2] || '',
      startPos: match.index,
      endPos: match.index + match[0].length,
    });
  }

  // Sort by tab stop order
  return placeholders.sort((a, b) => a.tabStop - b.tabStop);
}

/**
 * Process snippet code for insertion (standalone version)
 * Use this when you don't need store state tracking
 */
export function processSnippetForInsertionStandalone(snippet: CodeSnippetRecord): InsertedSnippet {
  const placeholders = parseSnippetPlaceholders(snippet.code);

  // Remove ${1:...} placeholders, leaving just the variable names
  let processedCode = snippet.code.replace(/\$\{\d+:([^}]*)\}/g, '$1');
  // Remove ${...} placeholders
  processedCode = processedCode.replace(/\$\{([^}]+)\}/g, '$1');

  return {
    code: processedCode,
    tabStops: placeholders,
    finalPosition: processedCode.length,
  };
}

// ============================================================================
// Slice Interface
// ============================================================================

export interface SnippetUtilsState {
  /** Utility statistics */
  utilStats: {
    totalPlaceholdersParsed: number;
    totalInsertions: number;
  };
}

export interface SnippetUtilsActions {
  /** Parse snippet placeholders from code (slice method - calls pure function) */
  parseSnippetPlaceholders: (code: string) => SnippetPlaceholder[];

  /** Process snippet code for insertion (slice method - tracks stats) */
  processSnippetForInsertion: (snippet: CodeSnippetRecord) => InsertedSnippet;

  /** Get unique folders from snippets */
  getSnippetFolders: (snippets: CodeSnippetRecord[]) => string[];

  /** Get unique tags from snippets */
  getSnippetTags: (snippets: CodeSnippetRecord[]) => string[];

  /** Reset utility statistics */
  resetUtilStats: () => void;
}

export type SnippetUtilsSlice = SnippetUtilsState & SnippetUtilsActions;

// ============================================================================
// Slice Implementation
// ============================================================================

export const createSnippetUtilsSlice: StateCreator<
  SnippetUtilsSlice,
  [],
  [],
  SnippetUtilsSlice
> = (set, _get, _api) => ({
  utilStats: {
    totalPlaceholdersParsed: 0,
    totalInsertions: 0,
  },

  // Slice method that calls the pure function
  parseSnippetPlaceholders,

  // Slice method that tracks stats
  processSnippetForInsertion: (snippet) => {
    const result = processSnippetForInsertionStandalone(snippet);

    // Track insertion statistics
    set((state) => ({
      utilStats: {
        ...state.utilStats,
        totalInsertions: state.utilStats.totalInsertions + 1,
      },
    }));

    return result;
  },

  getSnippetFolders: (snippets) => {
    const folders = new Set(snippets.map((snippet) => snippet.folder));
    return Array.from(folders).sort();
  },

  getSnippetTags: (snippets) => {
    const tags = new Set<string>();
    snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  },

  resetUtilStats: () => {
    set({
      utilStats: {
        totalPlaceholdersParsed: 0,
        totalInsertions: 0,
      },
    });
  },
});
