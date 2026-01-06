/**
 * @fileoverview Code Snippet Store
 * @module lib/snippets/snippet-store
 * @governance S-031
 * @ai-observable true
 *
 * Zustand store for code snippet management with Dexie persistence.
 * Handles CRUD operations, search, and snippet insertion logic.
 *
 * Story S-031: Code Snippets Manager
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { crypto } from 'crypto';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { CodeSnippetRecord, InsertedSnippet, SnippetPlaceholder } from '@/infrastructure/persistence/dexie-db-snippet-types';
import { BUILT_IN_SNIPPETS } from './snippet-templates';

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

// ============================================================================
// Store State
// ============================================================================

interface SnippetStoreState {
    /** All snippets including built-in and user-created */
    snippets: CodeSnippetRecord[];

    /** Currently selected snippet for editing */
    selectedSnippetId: string | null;

    /** Search query for filtering snippets */
    searchQuery: string;

    /** Selected folder for filtering */
    selectedFolder: string | null;

    /** Selected tags for filtering */
    selectedTags: string[];

    /** Loading state */
    isLoading: boolean;

    /** Error state */
    error: string | null;
}

// ============================================================================
// Store Actions
// ============================================================================

interface SnippetStoreActions {
    // CRUD Operations
    loadSnippets: () => Promise<void>;
    createSnippet: (snippet: Omit<CodeSnippetRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
    updateSnippet: (id: string, updates: Partial<Omit<CodeSnippetRecord, 'id' | 'createdAt' | 'isBuiltIn'>>) => Promise<void>;
    deleteSnippet: (id: string) => Promise<void>;

    // Selection
    selectSnippet: (id: string | null) => void;

    // Filtering
    setSearchQuery: (query: string) => void;
    setSelectedFolder: (folder: string | null) => void;
    setSelectedTags: (tags: string[]) => void;
    clearFilters: () => void;

    // Export/Import
    exportSnippets: () => Promise<string>;
    importSnippets: (json: string) => Promise<void>;

    // Internal
    setError: (error: string | null) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse snippet placeholders from code
 * Matches ${1:variableName} or ${variableName} syntax
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
 * Process snippet code for insertion
 * Replaces placeholders with empty strings for editor insertion
 */
export function processSnippetForInsertion(snippet: CodeSnippetRecord): InsertedSnippet {
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

/**
 * Get unique folders from snippets
 */
export function getSnippetFolders(snippets: CodeSnippetRecord[]): string[] {
    const folders = new Set(snippets.map((snippet) => snippet.folder));
    return Array.from(folders).sort();
}

/**
 * Get unique tags from snippets
 */
export function getSnippetTags(snippets: CodeSnippetRecord[]): string[] {
    const tags = new Set<string>();
    snippets.forEach((snippet) => {
        snippet.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
}

// ============================================================================
// Store Definition
// ============================================================================

type SnippetStore = SnippetStoreState & SnippetStoreActions;

export const useSnippetStore = create<SnippetStore>()(
    persist(
        (set, get) => ({
            // Initial State
            snippets: [],
            selectedSnippetId: null,
            searchQuery: '',
            selectedFolder: null,
            selectedTags: [],
            isLoading: false,
            error: null,

            // Load snippets from Dexie and built-in templates
            loadSnippets: async () => {
                set({ isLoading: true, error: null });

                try {
                    // Load user snippets from Dexie
                    const userSnippets = await db.codeSnippets.toArray();

                    // Combine with built-in snippets
                    const allSnippets = [...BUILT_IN_SNIPPETS, ...userSnippets];

                    set({ snippets: allSnippets, isLoading: false });
                } catch (error) {
                    console.error('[SnippetStore] Failed to load snippets:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load snippets',
                        isLoading: false,
                    });
                }
            },

            // Create a new snippet
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
                    console.error('[SnippetStore] Failed to create snippet:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to create snippet',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            // Update an existing snippet
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
                    console.error('[SnippetStore] Failed to update snippet:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update snippet',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            // Delete a snippet
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
                        selectedSnippetId: state.selectedSnippetId === id ? null : state.selectedSnippetId,
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error('[SnippetStore] Failed to delete snippet:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete snippet',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            // Select a snippet
            selectSnippet: (id) => {
                set({ selectedSnippetId: id });
            },

            // Set search query
            setSearchQuery: (query) => {
                set({ searchQuery: query });
            },

            // Set selected folder
            setSelectedFolder: (folder) => {
                set({ selectedFolder: folder });
            },

            // Set selected tags
            setSelectedTags: (tags) => {
                set({ selectedTags: tags });
            },

            // Clear all filters
            clearFilters: () => {
                set({
                    searchQuery: '',
                    selectedFolder: null,
                    selectedTags: [],
                });
            },

            // Export snippets as JSON
            exportSnippets: async () => {
                try {
                    const userSnippets = (await db.codeSnippets.toArray()).filter(
                        (s: CodeSnippetRecord) => !s.isBuiltIn
                    );

                    return JSON.stringify(userSnippets, null, 2);
                } catch (error) {
                    console.error('[SnippetStore] Failed to export snippets:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to export snippets',
                    });
                    throw error;
                }
            },

            // Import snippets from JSON
            importSnippets: async (json) => {
                set({ isLoading: true, error: null });

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

                    set((state) => ({
                        snippets: [...state.snippets, ...validSnippets],
                        isLoading: false,
                    }));
                } catch (error) {
                    console.error('[SnippetStore] Failed to import snippets:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to import snippets',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            // Set error
            setError: (error) => {
                set({ error });
            },
        }),
        {
            name: 'snippet-store',
            partialize: (state) => ({
                searchQuery: state.searchQuery,
                selectedFolder: state.selectedFolder,
                selectedTags: state.selectedTags,
            }),
        }
    )
);

// ============================================================================
// Selector Hooks (Zustand v5 pattern)
// ============================================================================

/**
 * Get all snippets (filtered)
 */
export function useFilteredSnippets(): CodeSnippetRecord[] {
    const snippets = useSnippetStore((s) => s.snippets);
    const searchQuery = useSnippetStore((s) => s.searchQuery);
    const selectedFolder = useSnippetStore((s) => s.selectedFolder);
    const selectedTags = useSnippetStore((s) => s.selectedTags);

    let filtered = snippets;

    // Apply search
    filtered = searchSnippets(filtered, searchQuery);

    // Apply filters
    filtered = filterSnippets(filtered, selectedFolder, selectedTags);

    return filtered;
}

/**
 * Get snippet by ID
 */
export function useSnippet(id: string | null): CodeSnippetRecord | undefined {
    const snippets = useSnippetStore((s) => s.snippets);
    return snippets.find((s) => s.id === id);
}

/**
 * Get all folders
 */
export function useSnippetFolders(): string[] {
    const snippets = useSnippetStore((s) => s.snippets);
    return getSnippetFolders(snippets);
}

/**
 * Get all tags
 */
export function useSnippetTags(): string[] {
    const snippets = useSnippetStore((s) => s.snippets);
    return getSnippetTags(snippets);
}
