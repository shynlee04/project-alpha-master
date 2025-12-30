/**
 * @fileoverview Note Embedding Types
 * @module lib/notes/types-embedding
 * @governance EPIC-26-2
 *
 * Type definitions for note embedding and indexing pipeline.
 * Used by note-indexer.ts and embedding-worker-bridge.ts.
 */


// ============================================================================
// Index Status Types
// ============================================================================

/**
 * Status of a note's embedding/indexing process
 */
export type NoteIndexStatus = 'pending' | 'indexing' | 'indexed' | 'error';

/**
 * Indexing state for a single note
 */
export interface NoteIndexState {
    /** Note ID */
    noteId: string;
    /** Current indexing status */
    status: NoteIndexStatus;
    /** Progress percentage (0-100) */
    progress: number;
    /** Error message if status is 'error' */
    error?: string;
    /** Number of retry attempts */
    retryCount: number;
    /** Timestamp of last indexing attempt */
    lastAttemptAt?: number;
}

// ============================================================================
// Embedding Types
// ============================================================================

/**
 * Embedding result from Web Worker
 */
export interface NoteEmbeddingResult {
    /** Note ID */
    noteId: string;
    /** Chunk index (0 for single-chunk notes) */
    chunkIndex: number;
    /** Total chunks for this note */
    totalChunks: number;
    /** 384-dimensional embedding vector */
    embedding: number[];
    /** Time taken to generate embedding (ms) */
    latencyMs: number;
}

/**
 * Document schema for Orama note index
 */
export interface NoteDocumentSchema {
    /** Unique document ID: noteId-chunk-{index} */
    id: string;
    /** Parent note ID */
    noteId: string;
    /** Plain text content of chunk */
    content: string;
    /** Note title */
    title: string;
    /** Chunk position in note */
    position: number;
    /** 384-dim embedding vector (optional for BM25-only) */
    embedding?: number[];
    /** Metadata for search result context */
    metadata: {
        /** Chunk index within note */
        chunkIndex: number;
        /** Total chunks in note */
        totalChunks: number;
        /** Note emoji (if any) */
        emoji?: string;
    };
}

// ============================================================================
// Worker Message Types
// ============================================================================

/**
 * Message sent to embedding worker
 */
export interface EmbeddingWorkerRequest {
    /** Message type */
    type: 'embed';
    /** Note ID being embedded */
    noteId: string;
    /** Text content to embed */
    content: string;
    /** Chunk index (0 for single chunk) */
    chunkIndex: number;
    /** Total chunks for this note */
    totalChunks: number;
}

/**
 * Progress message from embedding worker
 */
export interface EmbeddingWorkerProgress {
    /** Message type */
    type: 'progress';
    /** Note ID */
    noteId: string;
    /** Progress status (downloading, loading, etc.) */
    status: string;
    /** Progress percentage (if available) */
    progress?: number;
    /** File being processed (if model download) */
    file?: string;
}

/**
 * Completion message from embedding worker
 */
export interface EmbeddingWorkerComplete {
    /** Message type */
    type: 'complete';
    /** Note ID */
    noteId: string;
    /** Chunk index */
    chunkIndex: number;
    /** Total chunks */
    totalChunks: number;
    /** Generated embedding vector */
    embedding: number[];
    /** Time taken (ms) */
    latencyMs: number;
}

/**
 * Error message from embedding worker
 */
export interface EmbeddingWorkerError {
    /** Message type */
    type: 'error';
    /** Note ID */
    noteId: string;
    /** Error message */
    error: string;
}

/**
 * Union type for all worker responses
 */
export type EmbeddingWorkerResponse =
    | EmbeddingWorkerProgress
    | EmbeddingWorkerComplete
    | EmbeddingWorkerError;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract plain text from BlockNote blocks for embedding
 * 
 * @param blocks - BlockNote document blocks
 * @returns Plain text content suitable for embedding
 * 
 * @example
 * ```ts
 * const text = extractTextFromBlocks(note.blocks);
 * console.log(text); // "Heading content\nParagraph content..."
 * ```
 */
export function extractTextFromBlocks(blocks: unknown[]): string {
    const texts: string[] = [];

    function processBlock(block: unknown) {
        if (!block || typeof block !== 'object') return;

        const b = block as Record<string, unknown>;

        // Extract text from content array
        if (b.content && Array.isArray(b.content)) {
            for (const item of b.content) {
                if (item && typeof item === 'object') {
                    const i = item as Record<string, unknown>;
                    if (i.type === 'text' && typeof i.text === 'string') {
                        texts.push(i.text);
                    }
                }
            }
        }

        // Recursively process nested blocks (if any)
        if (b.children && Array.isArray(b.children)) {
            for (const child of b.children) {
                processBlock(child);
            }
        }
    }

    for (const block of blocks) {
        processBlock(block);
    }

    return texts.join('\n').trim();
}

/**
 * Chunk text content for embedding
 * 
 * @param text - Full text content
 * @param chunkSize - Target chunk size in characters (default 1000)
 * @param overlap - Overlap between chunks (default 200)
 * @returns Array of text chunks
 */
export function chunkTextForEmbedding(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    if (text.length <= chunkSize) {
        return [text];
    }

    const chunks: string[] = [];
    let index = 0;

    while (index < text.length) {
        const end = Math.min(index + chunkSize, text.length);
        const chunk = text.slice(index, end);
        chunks.push(chunk);
        index += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Generate document ID for Orama index
 * 
 * @param noteId - Note ID
 * @param chunkIndex - Chunk index
 * @returns Document ID: noteId-chunk-{index}
 */
export function generateNoteDocumentId(noteId: string, chunkIndex: number): string {
    return `${noteId}-chunk-${chunkIndex}`;
}

// ============================================================================
// Constants
// ============================================================================

/** Default chunk size for embedding (characters) */
export const DEFAULT_CHUNK_SIZE = 1000;

/** Default overlap between chunks (characters) */
export const DEFAULT_CHUNK_OVERLAP = 200;

/** Maximum retry attempts for embedding */
export const MAX_EMBEDDING_RETRIES = 3;

/** Retry delays in milliseconds (5s, 10s, 20s) */
export const RETRY_DELAYS = [5000, 10000, 20000];

/** Debounce delay before triggering embedding (ms) */
export const EMBEDDING_DEBOUNCE_MS = 500;

/** Vector dimensions for MiniLM-L6-v2 model */
export const EMBEDDING_DIMENSIONS = 384;
