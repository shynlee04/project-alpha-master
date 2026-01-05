/**
 * @fileoverview Context Engine for Notes Workspace
 * @module lib/context/ContextEngine
 * @governance EPIC-31-1
 *
 * Provides note context for AI chat in Notes workspace.
 * Retrieves current note, fetches related notes via RAG,
 * manages context window, and handles context injection.
 *
 * Story 31.1: Context Awareness Engine
 */

import { useNoteStore } from '@/lib/notes/note-store';
import { extractTextFromBlocks } from '@/lib/notes/types-embedding';
import { queryRelatedNotes } from './RAGQueryService';

// ============================================================================
// Types
// ============================================================================

/**
 * Context cache entry with TTL
 */
interface CachedContext {
    noteId: string;
    context: NoteContext;
    timestamp: number;
}

/**
 * Note context for AI prompt injection
 */
export interface NoteContext {
    /** Current note being viewed */
    currentNote: {
        id: string;
        title: string;
        content: string;
    } | null;
    /** Related notes from RAG search */
    relatedNotes: Array<{
        id: string;
        title: string;
        content: string;
        score: number;
    }>;
    /** Total context size in characters */
    totalChars: number;
}

/**
 * Context engine configuration
 */
export interface ContextEngineConfig {
    /** Cache TTL in milliseconds (default 5 minutes) */
    cacheTtl?: number;
    /** Maximum related notes to fetch */
    maxRelatedNotes?: number;
    /** Maximum characters per related note */
    maxCharsPerNote?: number;
    /** Maximum total context size */
    maxTotalChars?: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_RELATED_NOTES = 5;
const DEFAULT_MAX_CHARS_PER_NOTE = 500;
const DEFAULT_MAX_TOTAL_CHARS = 4000;

// ============================================================================
// Context Cache
// ============================================================================

const contextCache = new Map<string, CachedContext>();

/**
 * Clear expired cache entries
 */
function clearExpiredCache(): void {
    const now = Date.now();
    for (const [noteId, cached] of contextCache.entries()) {
        if (now - cached.timestamp >= DEFAULT_CACHE_TTL_MS) {
            contextCache.delete(noteId);
        }
    }
}

/**
 * Clear all cached context
 */
export function clearContextCache(): void {
    contextCache.clear();
}

// ============================================================================
// Context Engine Implementation
// ============================================================================

/**
 * Get current note content as plain text
 *
 * Extracts text from BlockNote blocks for use in context.
 *
 * @param noteId - Note ID to extract content from
 * @returns Plain text content
 */
export function getCurrentNoteContent(noteId: string): string {
    const note = useNoteStore.getState().notes.get(noteId);
    if (!note) return '';

    return extractTextFromBlocks(note.blocks);
}

/**
 * Get related notes via RAG search
 *
 * Searches for semantically related notes using the current note content as query.
 * Excludes the current note from results. Uses 2-second timeout.
 *
 * @param currentNoteContent - Content of current note to use as query
 * @param currentNoteId - Current note ID to exclude from results
 * @param limit - Maximum number of results
 * @returns Related notes with relevance scores
 */
async function getRelatedNotes(
    currentNoteContent: string,
    currentNoteId: string,
    limit: number = DEFAULT_MAX_RELATED_NOTES
): Promise<Array<{ id: string; title: string; content: string; score: number }>> {
    if (!currentNoteContent.trim()) return [];

    try {
        // Use RAGQueryService with timeout protection (2 second default)
        const response = await queryRelatedNotes(currentNoteContent, currentNoteId, {
            maxResults: limit,
            timeout: 2000, // 2 second timeout
        });

        if (response.timedOut) {
            console.warn('[ContextEngine] RAG query timed out, returning no related notes');
            return [];
        }

        return response.results.map(r => ({
            id: r.id,
            title: r.title,
            content: r.content,
            score: r.score
        }));
    } catch (error) {
        console.error('[ContextEngine] Failed to fetch related notes:', error);
        return [];
    }
}

/**
 * Build note context for AI prompt injection
 *
 * Assembles current note content and related notes into a structured context.
 * Uses cache to avoid repeated expensive operations.
 *
 * @param noteId - Current note ID
 * @param config - Optional configuration
 * @returns Note context for AI prompt
 */
export async function buildNoteContext(
    noteId: string,
    config: ContextEngineConfig = {}
): Promise<NoteContext> {
    const {
        maxRelatedNotes = DEFAULT_MAX_RELATED_NOTES,
        maxCharsPerNote = DEFAULT_MAX_CHARS_PER_NOTE,
        maxTotalChars = DEFAULT_MAX_TOTAL_CHARS,
    } = config;

    // Clear expired cache entries first
    clearExpiredCache();

    // Check cache first
    const cached = contextCache.get(noteId);
    if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS) {
        return cached.context;
    }

    // Get current note from store
    const note = useNoteStore.getState().notes.get(noteId);
    if (!note) {
        return {
            currentNote: null,
            relatedNotes: [],
            totalChars: 0
        };
    }

    // Extract content from blocks
    const currentContent = extractTextFromBlocks(note.blocks);

    // Build current note object
    const currentNote = {
        id: note.id,
        title: note.title || 'Untitled',
        content: currentContent
    };

    // Get related notes via RAG
    const relatedNotesRaw = await getRelatedNotes(currentContent, noteId, maxRelatedNotes);

    // Truncate related note content to fit context window
    let totalChars = currentNote.content.length;
    const relatedNotes: Array<{ id: string; title: string; content: string; score: number }> = [];

    for (const note of relatedNotesRaw) {
        // Stop if we've exceeded max total chars
        if (totalChars >= maxTotalChars) break;

        // Truncate content to max per-note limit
        let content = note.content;
        if (content.length > maxCharsPerNote) {
            content = content.substring(0, maxCharsPerNote - 3) + '...';
        }

        // Also respect total remaining chars
        const remainingChars = maxTotalChars - totalChars;
        if (content.length > remainingChars) {
            content = content.substring(0, remainingChars - 3) + '...';
        }

        totalChars += content.length;
        relatedNotes.push({
            id: note.id,
            title: note.title,
            content,
            score: note.score
        });
    }

    const context: NoteContext = {
        currentNote,
        relatedNotes,
        totalChars
    };

    // Cache result
    contextCache.set(noteId, {
        noteId,
        context,
        timestamp: Date.now()
    });

    return context;
}

/**
 * Format note context as markdown for system prompt injection
 *
 * @param context - Note context from buildNoteContext
 * @returns Formatted markdown string
 */
export function formatContextAsMarkdown(context: NoteContext): string {
    if (!context.currentNote) return '';

    const parts: string[] = [];

    // Current note section
    parts.push(`# Current Note: ${context.currentNote.title}`);
    parts.push(context.currentNote.content);
    parts.push('');

    // Related notes section
    if (context.relatedNotes.length > 0) {
        parts.push('## Related Notes');
        for (let i = 0; i < context.relatedNotes.length; i++) {
            const note = context.relatedNotes[i];
            parts.push(`### ${i + 1}. ${note.title}`);
            parts.push(note.content);
            parts.push('');
        }
    }

    return parts.join('\n');
}

/**
 * Get formatted context string for a note
 *
 * Convenience function that combines buildNoteContext and formatContextAsMarkdown.
 *
 * @param noteId - Note ID
 * @param config - Optional configuration
 * @returns Formatted markdown context string
 */
export async function getFormattedNoteContext(
    noteId: string,
    config?: ContextEngineConfig
): Promise<string> {
    const context = await buildNoteContext(noteId, config);
    return formatContextAsMarkdown(context);
}
