/**
 * @fileoverview Embedding Worker Bridge
 * @module lib/notes/embedding-worker-bridge
 * @governance EPIC-26-2
 *
 * Bridge for communicating with the note embedding Web Worker.
 * Handles worker lifecycle, message passing, and retry logic.
 */

import type {
    EmbeddingWorkerRequest,
    EmbeddingWorkerResponse,
    NoteEmbeddingResult,
    NoteIndexState,
} from './types-embedding';
import {
    MAX_EMBEDDING_RETRIES,
    RETRY_DELAYS,
} from './types-embedding';

// ============================================================================
// Types
// ============================================================================

type ProgressCallback = (state: NoteIndexState) => void;
type CompleteCallback = (result: NoteEmbeddingResult) => void;
type ErrorCallback = (noteId: string, error: string) => void;

interface PendingRequest {
    noteId: string;
    chunkIndex: number;
    totalChunks: number;
    content: string;
    resolve: (result: NoteEmbeddingResult) => void;
    reject: (error: Error) => void;
    retryCount: number;
}

// ============================================================================
// Worker Bridge Class
// ============================================================================

/**
 * Bridge for communicating with the embedding Web Worker
 * Manages worker lifecycle and provides Promise-based API
 */
class EmbeddingWorkerBridge {
    private worker: Worker | null = null;
    private pendingRequests: Map<string, PendingRequest> = new Map();
    private progressCallback: ProgressCallback | null = null;
    private idleTimeout: ReturnType<typeof setTimeout> | null = null;
    private readonly IDLE_TIMEOUT_MS = 60000; // Terminate worker after 1 minute idle

    /**
     * Initialize the worker (lazy)
     */
    private ensureWorker(): Worker {
        if (!this.worker) {
            console.log('[EmbeddingBridge] Creating new worker instance');

            // Create worker from module
            this.worker = new Worker(
                new URL('../../../workers/note-embedding.worker.ts', import.meta.url),
                { type: 'module' }
            );

            // Set up message handler
            this.worker.onmessage = this.handleWorkerMessage.bind(this);
            this.worker.onerror = this.handleWorkerError.bind(this);
        }

        // Reset idle timeout
        this.resetIdleTimeout();

        return this.worker;
    }

    /**
     * Reset the idle timeout timer
     */
    private resetIdleTimeout(): void {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
        }

        this.idleTimeout = setTimeout(() => {
            if (this.pendingRequests.size === 0) {
                console.log('[EmbeddingBridge] Terminating idle worker');
                this.terminate();
            }
        }, this.IDLE_TIMEOUT_MS);
    }

    /**
     * Generate request key for pending requests map
     */
    private getRequestKey(noteId: string, chunkIndex: number): string {
        return `${noteId}:${chunkIndex}`;
    }

    /**
     * Handle messages from worker
     */
    private handleWorkerMessage(event: MessageEvent<EmbeddingWorkerResponse>): void {
        const message = event.data;

        switch (message.type) {
            case 'progress':
                this.handleProgress(message);
                break;
            case 'complete':
                this.handleComplete(message);
                break;
            case 'error':
                this.handleError(message);
                break;
        }
    }

    /**
     * Handle progress messages
     */
    private handleProgress(message: EmbeddingWorkerResponse & { type: 'progress' }): void {
        const { noteId, status, progress } = message;

        if (this.progressCallback) {
            this.progressCallback({
                noteId,
                status: 'indexing',
                progress: progress ?? 0,
                retryCount: 0,
            });
        }
    }

    /**
     * Handle completion messages
     */
    private handleComplete(message: EmbeddingWorkerResponse & { type: 'complete' }): void {
        const { noteId, chunkIndex, totalChunks, embedding, latencyMs } = message;
        const key = this.getRequestKey(noteId, chunkIndex);
        const request = this.pendingRequests.get(key);

        if (request) {
            this.pendingRequests.delete(key);
            request.resolve({
                noteId,
                chunkIndex,
                totalChunks,
                embedding,
                latencyMs,
            });
        }

        this.resetIdleTimeout();
    }

    /**
     * Handle error messages
     */
    private handleError(message: EmbeddingWorkerResponse & { type: 'error' }): void {
        const { noteId, error } = message;

        // Find all pending requests for this note
        for (const [key, request] of this.pendingRequests.entries()) {
            if (request.noteId === noteId) {
                // Check if we should retry
                if (request.retryCount < MAX_EMBEDDING_RETRIES) {
                    this.scheduleRetry(request);
                } else {
                    this.pendingRequests.delete(key);
                    request.reject(new Error(`Embedding failed after ${MAX_EMBEDDING_RETRIES} retries: ${error}`));
                }
            }
        }

        this.resetIdleTimeout();
    }

    /**
     * Schedule a retry for a failed request
     */
    private scheduleRetry(request: PendingRequest): void {
        const delay = RETRY_DELAYS[request.retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        request.retryCount++;

        console.log(
            `[EmbeddingBridge] Scheduling retry ${request.retryCount}/${MAX_EMBEDDING_RETRIES} for note ${request.noteId} in ${delay}ms`
        );

        if (this.progressCallback) {
            this.progressCallback({
                noteId: request.noteId,
                status: 'pending',
                progress: 0,
                retryCount: request.retryCount,
            });
        }

        setTimeout(() => {
            this.sendEmbedRequest(request);
        }, delay);
    }

    /**
     * Send embed request to worker
     */
    private sendEmbedRequest(request: PendingRequest): void {
        const worker = this.ensureWorker();
        const key = this.getRequestKey(request.noteId, request.chunkIndex);
        this.pendingRequests.set(key, request);

        const message: EmbeddingWorkerRequest = {
            type: 'embed',
            noteId: request.noteId,
            content: request.content,
            chunkIndex: request.chunkIndex,
            totalChunks: request.totalChunks,
        };

        worker.postMessage(message);
    }

    /**
     * Handle worker error events
     */
    private handleWorkerError(event: ErrorEvent): void {
        console.error('[EmbeddingBridge] Worker error:', event.message);

        // Reject all pending requests
        for (const [key, request] of this.pendingRequests.entries()) {
            this.pendingRequests.delete(key);
            request.reject(new Error(`Worker error: ${event.message}`));
        }

        // Terminate and recreate worker on next request
        this.terminate();
    }

    // ========================================================================
    // Public API
    // ========================================================================

    /**
     * Set callback for progress updates
     */
    setProgressCallback(callback: ProgressCallback | null): void {
        this.progressCallback = callback;
    }

    /**
     * Embed text content in worker
     * 
     * @param noteId - Note ID
     * @param content - Text content to embed
     * @param chunkIndex - Chunk index (0 for single chunk)
     * @param totalChunks - Total chunks for this note
     * @returns Promise resolving to embedding result
     */
    async embed(
        noteId: string,
        content: string,
        chunkIndex: number = 0,
        totalChunks: number = 1
    ): Promise<NoteEmbeddingResult> {
        return new Promise((resolve, reject) => {
            const request: PendingRequest = {
                noteId,
                chunkIndex,
                totalChunks,
                content,
                resolve,
                reject,
                retryCount: 0,
            };

            this.sendEmbedRequest(request);
        });
    }

    /**
     * Embed multiple chunks for a note
     * 
     * @param noteId - Note ID
     * @param chunks - Array of text chunks
     * @returns Promise resolving to array of embedding results
     */
    async embedChunks(noteId: string, chunks: string[]): Promise<NoteEmbeddingResult[]> {
        const results = await Promise.all(
            chunks.map((content, index) =>
                this.embed(noteId, content, index, chunks.length)
            )
        );
        return results;
    }

    /**
     * Cancel pending requests for a note
     */
    cancelNote(noteId: string): void {
        for (const [key, request] of this.pendingRequests.entries()) {
            if (request.noteId === noteId) {
                this.pendingRequests.delete(key);
                request.reject(new Error('Request cancelled'));
            }
        }
    }

    /**
     * Terminate the worker
     */
    terminate(): void {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            console.log('[EmbeddingBridge] Worker terminated');
        }
    }

    /**
     * Check if worker is active
     */
    isActive(): boolean {
        return this.worker !== null;
    }

    /**
     * Get number of pending requests
     */
    getPendingCount(): number {
        return this.pendingRequests.size;
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of the embedding worker bridge
 */
export const embeddingWorkerBridge = new EmbeddingWorkerBridge();

/**
 * Convenience function to embed text in worker
 */
export async function embedTextInWorker(
    noteId: string,
    content: string,
    chunkIndex: number = 0,
    totalChunks: number = 1
): Promise<NoteEmbeddingResult> {
    return embeddingWorkerBridge.embed(noteId, content, chunkIndex, totalChunks);
}

/**
 * Convenience function to embed multiple chunks
 */
export async function embedChunksInWorker(
    noteId: string,
    chunks: string[]
): Promise<NoteEmbeddingResult[]> {
    return embeddingWorkerBridge.embedChunks(noteId, chunks);
}
