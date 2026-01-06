/**
 * @fileoverview Code Snippets Hook
 * @module hooks/useCodeSnippets
 * @governance S-031
 * @ai-observable true
 *
 * Custom hook for code snippet management.
 * Provides convenient methods for snippet insertion and management.
 *
 * Story S-031: Code Snippets Manager
 */

import { useCallback, useEffect } from 'react';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';
import { useSnippetStore, initializeSnippetStore, processSnippetForInsertion } from '@/lib/snippets/snippet-store';

/**
 * Code snippets hook return type
 */
interface UseCodeSnippetsReturn {
    /** All snippets (filtered) */
    snippets: CodeSnippetRecord[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;
    /** Load snippets from storage */
    loadSnippets: () => Promise<void>;
    /** Get snippet by shortcut */
    getSnippetByShortcut: (shortcut: string) => CodeSnippetRecord | undefined;
    /** Search snippets by query */
    searchSnippets: (query: string) => CodeSnippetRecord[];
    /** Insert snippet at cursor position */
    insertSnippet: (
        editor: any,
        snippet: CodeSnippetRecord,
        cursorPosition?: { lineNumber: number; column: number }
    ) => void;
}

/**
 * Code snippets hook
 *
 * Provides methods for managing and inserting code snippets.
 * Used by MonacoEditor and snippet management components.
 *
 * @example
 * ```tsx
 * const { snippets, insertSnippet, getSnippetByShortcut } = useCodeSnippets();
 *
 * // Insert snippet at cursor
 * insertSnippet(monacoEditor, snippet);
 *
 * // Find snippet by shortcut
 * const snippet = getSnippetByShortcut('useeffect');
 * ```
 */
export function useCodeSnippets(): UseCodeSnippetsReturn {
    const snippets = useSnippetStore((s) => s.snippets);
    const isLoading = useSnippetStore((s) => s.isLoading);
    const error = useSnippetStore((s) => s.error);
    const loadSnippets = useCallback(async () => {
        await initializeSnippetStore();
    }, []);
    const searchQuery = useSnippetStore((s) => s.searchQuery);
    const selectedFolder = useSnippetStore((s) => s.selectedFolder);
    const selectedTags = useSnippetStore((s) => s.selectedTags);

    // Load snippets on mount
    useEffect(() => {
        loadSnippets();
    }, [loadSnippets]);

    /**
     * Get snippet by shortcut
     * Returns first matching snippet (case-insensitive)
     */
    const getSnippetByShortcut = useCallback(
        (shortcut: string): CodeSnippetRecord | undefined => {
            if (!shortcut.trim()) return undefined;

            const lowerShortcut = shortcut.toLowerCase().trim();

            return snippets.find(
                (snippet) =>
                    snippet.shortcut?.toLowerCase() === lowerShortcut ||
                    snippet.name.toLowerCase().replace(/\s+/g, '') === lowerShortcut
            );
        },
        [snippets]
    );

    /**
     * Search snippets by query
     * Searches name, description, tags, language, and shortcut
     */
    const searchSnippets = useCallback(
        (query: string): CodeSnippetRecord[] => {
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
        },
        [snippets]
    );

    /**
     * Insert snippet at cursor position in Monaco editor
     *
     * @param editor - Monaco editor instance
     * @param snippet - Snippet to insert
     * @param cursorPosition - Optional cursor position (defaults to current position)
     */
    const insertSnippet = useCallback(
        (
            editor: any,
            snippet: CodeSnippetRecord,
            cursorPosition?: { lineNumber: number; column: number }
        ) => {
            if (!editor) {
                console.warn('[useCodeSnippets] No editor provided');
                return;
            }

            try {
                // Process snippet for insertion
                const { code } = processSnippetForInsertion(snippet);

                // Get current cursor position if not provided
                const position = cursorPosition || editor.getPosition();

                if (!position) {
                    console.warn('[useCodeSnippets] No cursor position');
                    return;
                }

                // Calculate indentation based on current line
                const model = editor.getModel();
                const lineContent = model.getLineContent(position.lineNumber);
                const indentation = lineContent.match(/^\s*/)?.[0] || '';

                // Add indentation to each line of the snippet
                const indentedCode = code
                    .split('\n')
                    .map((line: string, index: number) => (index === 0 ? line : indentation + line))
                    .join('\n');

                // Execute edit operation
                editor.executeEdits('snippetInsertion', [
                    {
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column,
                        },
                        text: indentedCode,
                    },
                ]);

                // TODO: Add tab stop navigation support
                // This requires tracking tab stops and setting up Tab key bindings
                // For now, just position cursor at end of snippet

                console.log('[useCodeSnippets] Snippet inserted:', snippet.name);
            } catch (error) {
                console.error('[useCodeSnippets] Failed to insert snippet:', error);
            }
        },
        []
    );

    /**
     * Filter snippets based on current search and filters
     */
    const filteredSnippets = snippets.filter((snippet) => {
        // Apply search query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesSearch =
                snippet.name.toLowerCase().includes(lowerQuery) ||
                snippet.description?.toLowerCase().includes(lowerQuery) ||
                snippet.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
                snippet.language.toLowerCase().includes(lowerQuery) ||
                snippet.shortcut?.toLowerCase().includes(lowerQuery);

            if (!matchesSearch) return false;
        }

        // Apply folder filter
        if (selectedFolder && snippet.folder !== selectedFolder) {
            return false;
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            const hasAllTags = selectedTags.every((tag) => snippet.tags.includes(tag));
            if (!hasAllTags) return false;
        }

        return true;
    });

    return {
        snippets: filteredSnippets,
        isLoading,
        error,
        loadSnippets,
        getSnippetByShortcut,
        searchSnippets,
        insertSnippet,
    };
}

/**
 * Snippet insertion result
 */
export interface SnippetInsertResult {
    success: boolean;
    snippet?: CodeSnippetRecord;
    error?: string;
}

/**
 * Use snippet auto-expansion
 * Monitors editor input and auto-expands shortcuts
 *
 * @example
 * ```tsx
 * const { checkShortcut } = useSnippetExpansion();
 *
 * <MonacoEditor
 *   onDidChangeModelContent={(e) => {
 *     const result = checkShortcut(editor);
 *     if (result.success) {
 *       // Snippet was auto-expanded
 *     }
 *   }}
 * />
 * ```
 */
export function useSnippetExpansion(): {
    checkShortcut: (editor: any) => SnippetInsertResult;
} {
    const { getSnippetByShortcut, insertSnippet } = useCodeSnippets();

    /**
     * Check if current editor content matches a snippet shortcut
     * and auto-expand if found
     */
    const checkShortcut = useCallback(
        (editor: any): SnippetInsertResult => {
            if (!editor) {
                return { success: false, error: 'No editor provided' };
            }

            try {
                const model = editor.getModel();
                const position = editor.getPosition();

                // Get current line content
                const lineContent = model.getLineContent(position.lineNumber);

                // Get word before cursor
                const wordBeforeCursor = lineContent
                    .slice(0, position.column - 1)
                    .match(/([a-zA-Z0-9_]+)$/)?.[1];

                if (!wordBeforeCursor) {
                    return { success: false };
                }

                // Check if word matches a snippet shortcut
                const snippet = getSnippetByShortcut(wordBeforeCursor);

                if (!snippet) {
                    return { success: false };
                }

                // Delete the shortcut text
                const shortcutStart = position.column - wordBeforeCursor.length;
                editor.executeEdits('snippetExpansion', [
                    {
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: shortcutStart,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column,
                        },
                        text: '',
                    },
                ]);

                // Insert snippet
                insertSnippet(editor, snippet, {
                    lineNumber: position.lineNumber,
                    column: shortcutStart,
                });

                return { success: true, snippet };
            } catch (error) {
                console.error('[useSnippetExpansion] Failed to expand shortcut:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        },
        [getSnippetByShortcut, insertSnippet]
    );

    return { checkShortcut };
}
