/**
 * @fileoverview Snippet Filtering Slice - Search, selection, and filter state
 * @module snippets/snippet-store/snippet-filtering-slice
 */

import { StateCreator } from 'zustand';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';

export interface SnippetFilteringState {
  /** Currently selected snippet for editing */
  selectedSnippetId: string | null;

  /** Search query for filtering snippets */
  searchQuery: string;

  /** Selected folder for filtering */
  selectedFolder: string | null;

  /** Selected tags for filtering */
  selectedTags: string[];
}

export interface SnippetFilteringActions {
  /** Select a snippet */
  selectSnippet: (id: string | null) => void;

  /** Set search query */
  setSearchQuery: (query: string) => void;

  /** Set selected folder */
  setSelectedFolder: (folder: string | null) => void;

  /** Set selected tags */
  setSelectedTags: (tags: string[]) => void;

  /** Clear all filters */
  clearFilters: () => void;

  /** Get filtered snippets (derived from search + filters) */
  getFilteredSnippets: (
    allSnippets: CodeSnippetRecord[]
  ) => CodeSnippetRecord[];
}

export type SnippetFilteringSlice = SnippetFilteringState & SnippetFilteringActions;

/**
 * Search snippets by name, description, tags, language, or shortcut
 */
function searchSnippets(snippets: CodeSnippetRecord[], query: string): CodeSnippetRecord[] {
  if (!query.trim()) return snippets;

  const lowerQuery = query.toLowerCase();

  return snippets.filter(
    (snippet) =>
      snippet.name.toLowerCase().includes(lowerQuery) ||
      snippet.description?.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      snippet.language.toLowerCase().includes(lowerQuery) ||
      snippet.shortcut?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter snippets by folder and tags
 */
function filterSnippets(
  snippets: CodeSnippetRecord[],
  folder: string | null,
  tags: string[]
): CodeSnippetRecord[] {
  let filtered = snippets;

  if (folder) {
    filtered = filtered.filter((snippet) => snippet.folder === folder);
  }

  if (tags.length > 0) {
    filtered = filtered.filter((snippet) =>
      tags.every((tag) => snippet.tags.includes(tag))
    );
  }

  return filtered;
}

export const createSnippetFilteringSlice: StateCreator<
  SnippetFilteringSlice,
  [],
  [],
  SnippetFilteringSlice
> = (set, get, _api) => ({
  selectedSnippetId: null,
  searchQuery: '',
  selectedFolder: null,
  selectedTags: [],

  selectSnippet: (id) => {
    set({ selectedSnippetId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedFolder: (folder) => {
    set({ selectedFolder: folder });
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
  },

  clearFilters: () => {
    set({
      searchQuery: '',
      selectedFolder: null,
      selectedTags: [],
    });
  },

  getFilteredSnippets: (allSnippets) => {
    const state = get();
    let filtered = allSnippets;

    // Apply search
    filtered = searchSnippets(filtered, state.searchQuery);

    // Apply filters
    filtered = filterSnippets(filtered, state.selectedFolder, state.selectedTags);

    return filtered;
  },
});
