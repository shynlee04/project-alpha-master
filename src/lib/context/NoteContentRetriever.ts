/**
 * @fileoverview Note Content Retriever
 * @module lib/context/NoteContentRetriever
 * @governance EPIC-31-2
 *
 * Enhanced note content extraction for AI context.
 * Handles large notes, privacy filtering, and formatting preservation.
 *
 * Story 31.2: Note Content Retrieval
 */

import { blocksToPlainText } from '@/lib/notes/markdown-converter';
import type { Block } from '@blocknote/core';

// ============================================================================
// Types
// ============================================================================

/**
 * Content chunk for large notes
 */
export interface ContentChunk {
    /** Chunk index */
    index: number;
    /** Total chunks */
    total: number;
    /** Text content */
    content: string;
    /** Character count */
    charCount: number;
    /** Approximate token count (1 token ≈ 4 chars) */
    tokenCount: number;
}

/**
 * Content retrieval options
 */
export interface ContentRetrievalOptions {
    /** Maximum characters per chunk (default 4000) */
    maxCharsPerChunk?: number;
    /** Enable privacy filtering (default true) */
    filterSensitive?: boolean;
    /** Include note metadata (default false) */
    includeMetadata?: boolean;
}

/**
 * Retrieved note content
 */
export interface RetrievedContent {
    /** Full text content */
    fullText: string;
    /** Content chunks (for large notes) */
    chunks: ContentChunk[];
    /** Note metadata (if requested) */
    metadata?: {
        title: string;
        blockCount: number;
        charCount: number;
        isEmpty: boolean;
    };
}

// ============================================================================
// Constants
// ============================================================================

/** Default max characters per chunk (~8000 tokens / 4 chars per token) */
const DEFAULT_MAX_CHARS_PER_CHUNK = 32000;

/** Approximate characters per token for estimation */
const CHARS_PER_TOKEN = 4;

// ============================================================================
// Privacy Patterns
// ============================================================================

/**
 * Sensitive data patterns to filter
 * Each pattern has a replacement string for masking
 */
const SENSITIVE_PATTERNS: Array<{
    pattern: RegExp;
    description: string;
    replacement: string;
}> = [
    {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        description: 'Email addresses',
        replacement: '***@***.***',
    },
    {
        pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        description: 'Phone numbers (US format)',
        replacement: '***-***-****',
    },
    {
        pattern: /\b\d{11,}\b/g,
        description: 'Long numbers (potential phone)',
        replacement: '***********',
    },
    {
        pattern: /\b(?:sk_|pk_|api[_-]?key|secret|token|password|auth)\s*[:=]\s*[A-Za-z0-9_\-./~=+]+\b/gi,
        description: 'API keys and secrets',
        replacement: '***REDACTED***',
    },
    {
        pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
        description: 'SSH/PGP private keys',
        replacement: '-----BEGIN PRIVATE KEY-----\n***REDACTED***\n-----END PRIVATE KEY-----',
    },
    {
        pattern: /Bearer\s+[A-Za-z0-9_\-./~=+]+/gi,
        description: 'Bearer tokens',
        replacement: 'Bearer ***REDACTED***',
    },
    {
        pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        description: 'Credit card numbers',
        replacement: '****-****-****-****',
    },
];

// ============================================================================
// Privacy Filtering
// ============================================================================

/**
 * Filter sensitive data from text
 *
 * @param text - Text to filter
 * @returns Text with sensitive data redacted
 */
export function filterSensitiveData(text: string): string {
    let filtered = text;

    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
        filtered = filtered.replace(pattern, replacement);
    }

    return filtered;
}

/**
 * Check if text contains sensitive data
 *
 * @param text - Text to check
 * @returns True if sensitive patterns detected
 */
export function containsSensitiveData(text: string): boolean {
    return SENSITIVE_PATTERNS.some(({ pattern }) => pattern.test(text));
}

// ============================================================================
// Content Chunking
// ============================================================================

/**
 * Split text into chunks within size limit
 *
 * Tries to split at paragraph boundaries first, then falls back to character limit.
 *
 * @param text - Full text to chunk
 * @param maxChars - Maximum characters per chunk
 * @returns Array of content chunks
 */
export function chunkText(text: string, maxChars: number = DEFAULT_MAX_CHARS_PER_CHUNK): ContentChunk[] {
    if (text.length <= maxChars) {
        return [{
            index: 0,
            total: 1,
            content: text,
            charCount: text.length,
            tokenCount: Math.ceil(text.length / CHARS_PER_TOKEN)
        }];
    }

    const chunks: ContentChunk[] = [];
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        // If paragraph itself is too large, split it further
        if (paragraph.length > maxChars) {
            // Flush current chunk if we have content
            if (currentChunk) {
                chunks.push({
                    index: chunkIndex++,
                    total: 0, // Will update at end
                    content: currentChunk.trim(),
                    charCount: currentChunk.length,
                    tokenCount: Math.ceil(currentChunk.length / CHARS_PER_TOKEN)
                });
                currentChunk = '';
            }

            // Split large paragraph into character-based chunks
            let remaining = paragraph;
            while (remaining.length > 0) {
                const chunk = remaining.substring(0, maxChars);
                chunks.push({
                    index: chunkIndex++,
                    total: 0,
                    content: chunk.trim(),
                    charCount: chunk.length,
                    tokenCount: Math.ceil(chunk.length / CHARS_PER_TOKEN)
                });
                remaining = remaining.substring(maxChars);
            }
        } else if (currentChunk.length + paragraph.length + 2 > maxChars) {
            // Paragraph would exceed limit, start new chunk
            if (currentChunk) {
                chunks.push({
                    index: chunkIndex++,
                    total: 0,
                    content: currentChunk.trim(),
                    charCount: currentChunk.length,
                    tokenCount: Math.ceil(currentChunk.length / CHARS_PER_TOKEN)
                });
            }
            currentChunk = paragraph;
        } else {
            // Add to current chunk
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        }
    }

    // Add final chunk
    if (currentChunk) {
        chunks.push({
            index: chunkIndex,
            total: 0,
            content: currentChunk.trim(),
            charCount: currentChunk.length,
            tokenCount: Math.ceil(currentChunk.length / CHARS_PER_TOKEN)
        });
    }

    // Update total count
    const total = chunks.length;
    return chunks.map(chunk => ({ ...chunk, total }));
}

// ============================================================================
// Main Retrieval Function
// ============================================================================

/**
 * Retrieve content from BlockNote blocks
 *
 * Extracts text with formatting preservation, privacy filtering,
 * and chunking for large notes.
 *
 * @param blocks - BlockNote blocks
 * @param options - Retrieval options
 * @returns Retrieved note content
 */
export function retrieveNoteContent(
    blocks: unknown[],
    options: ContentRetrievalOptions = {}
): RetrievedContent {
    const {
        maxCharsPerChunk = DEFAULT_MAX_CHARS_PER_CHUNK,
        filterSensitive = true,
        includeMetadata = false,
    } = options;

    // Handle empty blocks
    if (!blocks || blocks.length === 0) {
        const emptyResult: RetrievedContent = {
            fullText: '',
            chunks: [{
                index: 0,
                total: 1,
                content: '',
                charCount: 0,
                tokenCount: 0
            }]
        };

        if (includeMetadata) {
            emptyResult.metadata = {
                title: '',
                blockCount: 0,
                charCount: 0,
                isEmpty: true
            };
        }

        return emptyResult;
    }

    // Convert blocks to plain text (preserves formatting)
    let text = blocksToPlainText(blocks as Block[]);

    // Apply privacy filtering
    if (filterSensitive) {
        text = filterSensitiveData(text);
    }

    // Create chunks
    const chunks = chunkText(text, maxCharsPerChunk);

    // Build result
    const result: RetrievedContent = {
        fullText: text,
        chunks,
    };

    if (includeMetadata) {
        result.metadata = {
            title: '', // Caller should add title
            blockCount: blocks.length,
            charCount: text.length,
            isEmpty: text.length === 0
        };
    }

    return result;
}

/**
 * Get text content from blocks (convenience function)
 *
 * @param blocks - BlockNote blocks
 * @param filterSensitive - Whether to filter sensitive data
 * @returns Plain text content
 */
export function getBlockContent(
    blocks: unknown[],
    filterSensitive: boolean = true
): string {
    const result = retrieveNoteContent(blocks, { filterSensitive });
    return result.fullText;
}

/**
 * Get chunks for large notes (convenience function)
 *
 * @param blocks - BlockNote blocks
 * @param maxChars - Maximum characters per chunk
 * @returns Content chunks
 */
export function getBlockChunks(
    blocks: unknown[],
    maxChars?: number
): ContentChunk[] {
    const result = retrieveNoteContent(blocks, { maxChars });
    return result.chunks;
}
