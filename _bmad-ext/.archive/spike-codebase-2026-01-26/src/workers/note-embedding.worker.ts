/**
 * @fileoverview Note Embedding Web Worker
 * @module workers/note-embedding.worker
 * @governance EPIC-26-2
 *
 * Web Worker for generating note embeddings using Transformers.js.
 * Runs in background thread to avoid blocking UI.
 *
 * Uses MiniLM-L6-v2 model (384 dimensions, ~90MB quantized).
 * Implements singleton pattern for model reuse.
 */

import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';
import type {
    EmbeddingWorkerRequest,
    EmbeddingWorkerProgress,
    EmbeddingWorkerComplete,
    EmbeddingWorkerError,
} from '../lib/notes/types-embedding';

// ============================================================================
// Singleton Pipeline
// ============================================================================

/**
 * Singleton class for embedding pipeline management
 * Ensures model is loaded only once and reused across requests
 */
class EmbeddingPipeline {
    static task: 'feature-extraction' = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: Promise<FeatureExtractionPipeline> | null = null;

    /**
     * Get or create the embedding pipeline instance
     *
     * @param progressCallback - Callback for model loading progress
     * @returns Promise resolving to the pipeline instance
     */
    static async getInstance(
        progressCallback?: (data: { status: string; progress?: number; file?: string }) => void
    ): Promise<FeatureExtractionPipeline> {
        if (!this.instance) {
            console.log('[EmbeddingWorker] Loading embedding model...');
            this.instance = pipeline(this.task, this.model, {
                quantized: true, // Use Q4 quantized model (~90MB)
                progress_callback: progressCallback,
            }) as Promise<FeatureExtractionPipeline>;
        }
        return this.instance;
    }

    /**
     * Check if pipeline is already loaded
     */
    static isLoaded(): boolean {
        return this.instance !== null;
    }
}

// ============================================================================
// Worker Message Handler
// ============================================================================

/**
 * Post a progress message to main thread
 */
function postProgress(noteId: string, status: string, progress?: number, file?: string): void {
    const message: EmbeddingWorkerProgress = {
        type: 'progress',
        noteId,
        status,
        progress,
        file,
    };
    self.postMessage(message);
}

/**
 * Post a completion message to main thread
 */
function postComplete(
    noteId: string,
    chunkIndex: number,
    totalChunks: number,
    embedding: number[],
    latencyMs: number
): void {
    const message: EmbeddingWorkerComplete = {
        type: 'complete',
        noteId,
        chunkIndex,
        totalChunks,
        embedding,
        latencyMs,
    };
    self.postMessage(message);
}

/**
 * Post an error message to main thread
 */
function postError(noteId: string, error: string): void {
    const message: EmbeddingWorkerError = {
        type: 'error',
        noteId,
        error,
    };
    self.postMessage(message);
}

/**
 * Generate embedding for text content
 */
async function generateEmbedding(
    noteId: string,
    content: string,
    chunkIndex: number,
    totalChunks: number
): Promise<void> {
    const startTime = performance.now();

    try {
        // Get or load the pipeline (with progress tracking)
        const extractor = await EmbeddingPipeline.getInstance((data) => {
            postProgress(noteId, data.status, data.progress, data.file);
        });

        postProgress(noteId, 'embedding', 50);

        // Generate embedding
        const output = await extractor(content, {
            pooling: 'mean',
            normalize: true,
        });

        // Convert to array
        const embedding = Array.from(output.data as Float32Array);
        const latencyMs = performance.now() - startTime;

        console.log(
            `[EmbeddingWorker] Generated embedding for note ${noteId} chunk ${chunkIndex}/${totalChunks} in ${latencyMs.toFixed(0)}ms`
        );

        postComplete(noteId, chunkIndex, totalChunks, embedding, latencyMs);
    } catch (error) {
        console.error('[EmbeddingWorker] Embedding failed:', error);
        postError(noteId, error instanceof Error ? error.message : 'Unknown embedding error');
    }
}

// ============================================================================
// Main Message Listener
// ============================================================================

self.addEventListener('message', async (event: MessageEvent<EmbeddingWorkerRequest>) => {
    const { type, noteId, content, chunkIndex, totalChunks } = event.data;

    if (type === 'embed') {
        if (!content || content.trim().length === 0) {
            postError(noteId, 'Empty content provided');
            return;
        }

        postProgress(noteId, 'starting', 0);
        await generateEmbedding(noteId, content, chunkIndex, totalChunks);
    } else {
        console.warn('[EmbeddingWorker] Unknown message type:', type);
    }
});

// Log worker initialization
console.log('[EmbeddingWorker] Worker initialized');
