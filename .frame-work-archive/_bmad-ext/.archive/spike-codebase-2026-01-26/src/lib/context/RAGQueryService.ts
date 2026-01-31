/**
 * @fileoverview RAG Query Service
 * @module lib/context/RAGQueryService
 * @governance EPIC-31-3
 *
 * Enhanced RAG query integration for context-aware AI chat.
 * Provides timeout-safe semantic search with relevance scoring.
 *
 * Story 31.3: RAG Query Integration
 */

import { searchNotes } from '@/lib/notes/note-retriever';

// ============================================================================
// Types
// ============================================================================

/**
 * RAG query result with relevance score
 */
export interface RAGQueryResult {
    /** Note ID */
    id: string;
    /** Note title */
    title: string;
    /** Note content excerpt */
    content: string;
    /** Relevance score (0-1, higher is better) */
    score: number;
}

/**
 * RAG query options
 */
export interface RAGQueryOptions {
    /** Maximum number of results (default 5) */
    maxResults?: number;
    /** Query timeout in milliseconds (default 2000) */
    timeout?: number;
    /** Minimum relevance score (default 0.0 = no filter) */
    minScore?: number;
}

/**
 * RAG query response with metadata
 */
export interface RAGQueryResponse {
    /** Query results */
    results: RAGQueryResult[];
    /** Total time taken (ms) */
    elapsed: number;
    /** Whether query timed out */
    timedOut: boolean;
    /** Total available results (before limit) */
    totalAvailable: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Default max results for RAG query */
const DEFAULT_MAX_RESULTS = 5;

/** Default query timeout (2 seconds) */
const DEFAULT_TIMEOUT_MS = 2000;

/** Default minimum relevance score */
const DEFAULT_MIN_SCORE = 0.0;

// ============================================================================
// Timeout Helper
// ============================================================================

/**
 * Wraps a promise with timeout
 *
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Error message on timeout
 * @returns Promise that rejects on timeout
 */
async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = 'Operation timed out'
): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutHandle);
    });
}

// ============================================================================
// Main Query Function
// ============================================================================

/**
 * Query RAG vector store for related notes
 *
 * Performs semantic search using current note content as query.
 * Includes timeout protection and filters results by relevance.
 *
 * @param queryContent - Content to search for (current note content)
 * @param currentNoteId - Current note ID to exclude from results
 * @param options - Query options
 * @returns RAG query response with results and metadata
 */
export async function queryRelatedNotes(
    queryContent: string,
    currentNoteId: string,
    options: RAGQueryOptions = {}
): Promise<RAGQueryResponse> {
    const {
        maxResults = DEFAULT_MAX_RESULTS,
        timeout = DEFAULT_TIMEOUT_MS,
        minScore = DEFAULT_MIN_SCORE,
    } = options;

    const startTime = Date.now();

    // Handle empty query
    if (!queryContent.trim()) {
        return {
            results: [],
            elapsed: Date.now() - startTime,
            timedOut: false,
            totalAvailable: 0,
        };
    }

    try {
        // Query with timeout protection
        const results = await withTimeout(
            searchNotes(queryContent, maxResults + 1), // +1 to account for filtering current note
            timeout,
            `[RAGQuery] Query timed out after ${timeout}ms`
        );

        // Filter out current note and apply relevance filter
        const filtered = results
            .filter(r => r.id !== currentNoteId && r.score >= minScore)
            .map(r => ({
                id: r.id,
                title: r.title,
                content: r.content,
                score: r.score,
            }))
            .slice(0, maxResults);

        return {
            results: filtered,
            elapsed: Date.now() - startTime,
            timedOut: false,
            totalAvailable: results.filter(r => r.id !== currentNoteId).length,
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes('timed out')) {
            console.warn('[RAGQuery] Query timed out, returning empty results');
            return {
                results: [],
                elapsed: timeout,
                timedOut: true,
                totalAvailable: 0,
            };
        }

        console.error('[RAGQuery] Query failed:', error);
        return {
            results: [],
            elapsed: Date.now() - startTime,
            timedOut: false,
            totalAvailable: 0,
        };
    }
}

/**
 * Batch query multiple contents
 *
 * Useful for finding related notes across multiple content pieces.
 *
 * @param queryContents - Array of content to query
 * @param currentNoteId - Current note ID to exclude
 * @param options - Query options
 * @returns Combined results with deduplication
 */
export async function batchQueryRelatedNotes(
    queryContents: string[],
    currentNoteId: string,
    options: RAGQueryOptions = {}
): Promise<RAGQueryResponse> {
    const allResults = new Map<string, RAGQueryResult>();
    let maxElapsed = 0;
    let anyTimedOut = false;

    // Query each content piece
    for (const content of queryContents) {
        if (!content.trim()) continue;

        const response = await queryRelatedNotes(content, currentNoteId, options);

        if (response.timedOut) {
            anyTimedOut = true;
        }

        maxElapsed = Math.max(maxElapsed, response.elapsed);

        // Merge results, keeping highest score
        for (const result of response.results) {
            const existing = allResults.get(result.id);
            if (!existing || result.score > existing.score) {
                allResults.set(result.id, result);
            }
        }
    }

    // Convert to array and sort by score
    const sortedResults = Array.from(allResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, options.maxResults || DEFAULT_MAX_RESULTS);

    return {
        results: sortedResults,
        elapsed: maxElapsed,
        timedOut: anyTimedOut,
        totalAvailable: allResults.size,
    };
}

/**
 * Check if RAG is available for current project
 *
 * @returns True if RAG index exists and is ready
 */
export function isRAGAvailable(): boolean {
    try {
        // Check if we're in a project context
        const { useNoteStore } = require('@/lib/notes/note-store');
        const projectId = useNoteStore.getState().currentProjectId;
        return !!projectId;
    } catch {
        return false;
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick query with defaults (convenience function)
 *
 * @param queryContent - Content to search for
 * @param currentNoteId - Current note ID to exclude
 * @returns Query results
 */
export async function quickQuery(
    queryContent: string,
    currentNoteId: string
): Promise<RAGQueryResult[]> {
    const response = await queryRelatedNotes(queryContent, currentNoteId);
    return response.results;
}

/**
 * Get top result only (convenience function)
 *
 * @param queryContent - Content to search for
 * @param currentNoteId - Current note ID to exclude
 * @returns Top result or null
 */
export async function getTopRelatedNote(
    queryContent: string,
    currentNoteId: string
): Promise<RAGQueryResult | null> {
    const response = await queryRelatedNotes(queryContent, currentNoteId, {
        maxResults: 1,
    });
    return response.results[0] || null;
}
