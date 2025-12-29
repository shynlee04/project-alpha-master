/**
 * @fileoverview Token Counter Utilities
 * @module lib/rag/token-counter
 * @governance EPIC-7-2
 *
 * Browser-compatible token counting for RAG chunking.
 * Uses approximation since tiktoken is Python-only.
 *
 * Approximation: 1 token ≈ 4 characters (English)
 * Alternative: 1 token ≈ 0.75 words (~1.3 tokens per word)
 */

import type { ChunkingOptions } from './types';

// ============================================================================
// Token Counting
// ============================================================================

/**
 * Count tokens in text using approximation
 * Based on research: 1 token ≈ 4 characters for English text
 * This is a browser-compatible approximation (tiktoken is Python-only)
 *
 * @param text - Text to count tokens in
 * @returns Approximate token count
 */
export function countTokens(text: string): number {
    if (!text || text.length === 0) {
        return 0;
    }

    // Approximation: 1 token ≈ 4 characters (English)
    // This is reasonably accurate for most English text
    return Math.ceil(text.length / 4);
}

/**
 * Count tokens more accurately using word count
 * 1 token ≈ 0.75 words (or 1.3 tokens per word)
 *
 * @param text - Text to count tokens in
 * @returns Approximate token count based on words
 */
export function countTokensByWords(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    // Count words (split by whitespace)
    const words = text.trim().split(/\s+/).length;

    // Approximation: 1.3 tokens per word (OpenAI average)
    return Math.ceil(words * 1.3);
}

/**
 * Find the best chunk boundary in text near target size
 * Searches for: paragraph break > sentence break > word break
 *
 * @param text - Full text to search in
 * @param targetSize - Target position (character offset)
 * @param minChunkSize - Minimum chunk size in tokens
 * @param maxChunkSize - Maximum chunk size in tokens
 * @returns Best boundary position (character offset)
 */
export function findChunkBoundary(
    text: string,
    targetSize: number,
    minChunkSize: number,
    maxChunkSize: number
): number {
    const targetPos = Math.min(targetSize, text.length);

    // Convert token limits to character limits
    const minPos = minChunkSize * 4;
    const maxPos = Math.min(maxChunkSize * 4, text.length);

    // Search range around target position
    const searchStart = Math.max(minPos, targetPos - 200);
    const searchEnd = Math.min(maxPos, targetPos + 200);
    const searchText = text.substring(searchStart, searchEnd);

    // Priority 1: Look for paragraph break (double newline)
    const paragraphBreak = searchText.search(/\n\s*\n/);
    if (paragraphBreak !== -1) {
        const absPos = searchStart + paragraphBreak + 2; // +2 to include the \n\n
        if (absPos >= minPos && absPos <= maxPos) {
            return absPos;
        }
    }

    // Priority 2: Look for sentence break (., !, ?, followed by space or newline)
    // Search backwards from target position
    for (let i = Math.min(targetPos, searchText.length); i > Math.max(0, targetPos - 200); i--) {
        const char = searchText[i];
        if (char === '.' || char === '!' || char === '?') {
            // Check if followed by space or newline
            const nextChar = searchText[i + 1];
            if (!nextChar || /\s/.test(nextChar)) {
                const absPos = searchStart + i + 1;
                if (absPos >= minPos && absPos <= maxPos) {
                    return absPos;
                }
            }
        }
    }

    // Priority 3: Look for word break (space)
    // Search backwards from target position
    for (let i = Math.min(targetPos, searchText.length); i > Math.max(0, targetPos - 100); i--) {
        if (searchText[i] === ' ' || searchText[i] === '\n') {
            const absPos = searchStart + i + 1;
            if (absPos >= minPos && absPos <= maxPos) {
                return absPos;
            }
        }
    }

    // Priority 4: Force split at target position if no boundary found
    return Math.min(targetPos, maxPos);
}

/**
 * Calculate overlap between chunks
 *
 * @param chunkSize - Size of current chunk in tokens
 * @param overlap - Overlap in tokens
 * @returns Overlap in characters (approximate)
 */
export function calculateOverlap(chunkSize: number, overlap: number): number {
    return overlap * 4; // Convert tokens to characters
}

/**
 * Estimate token count for a range of text
 * More accurate than full approximation for small chunks
 *
 * @param text - Text to measure
 * @param start - Start position (character offset)
 * @param end - End position (character offset)
 * @returns Approximate token count for the range
 */
export function countTokensInRange(text: string, start: number, end: number): number {
    const substring = text.substring(start, end);
    return countTokens(substring);
}
