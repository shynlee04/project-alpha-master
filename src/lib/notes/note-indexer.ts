/**
 * @fileoverview Note Indexer Service
 * @module lib/notes/note-indexer
 * @governance EPIC-26-2
 *
 * Service for indexing notes into Orama for semantic search.
 * Integrates with embedding worker bridge and existing Orama infrastructure.
 *
 * Features:
 * - Auto-embed notes on save (with debounce)
 * - Chunk long notes for better retrieval
 * - Hybrid search (vector + BM25)
 * - Retry on failure
 */

import {
    createIndex,
    loadIndex,
    saveIndex,
    indexDocument,
    removeFromIndex,
    searchIndex,
} from '@/lib/rag/orama-index';
import type { DocumentSchema, SearchResult } from '@/lib/rag/types';
import { embeddingWorkerBridge, embedChunksInWorker } from './embedding-worker-bridge';
import {
    extractTextFromBlocks,
    chunkTextForEmbedding,
    generateNoteDocumentId,
    DEFAULT_CHUNK_SIZE,
    DEFAULT_CHUNK_OVERLAP,
    EMBEDDING_DIMENSIONS,
    type NoteIndexState,
} from './types-embedding';
import type { NoteRecord } from './types';

// ============================================================================
// Types
// ============================================================================

type IndexStateCallback = (state: NoteIndexState) => void;

interface NoteIndexerConfig {
    /** Chunk size for long notes */
    chunkSize: number;
    /** Overlap between chunks */
    chunkOverlap: number;
    /** Enable vector embeddings (vs BM25 only) */
    enableVectorSearch: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: NoteIndexerConfig = {
    chunkSize: DEFAULT_CHUNK_SIZE,
    chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    enableVectorSearch: true,
};



// ============================================================================
// Note Indexer Class
// ============================================================================

/**
 * Service for indexing and searching notes
 */
class NoteIndexer {
    private config: NoteIndexerConfig;
    private indexStates: Map<string, NoteIndexState> = new Map();
    private stateCallback: IndexStateCallback | null = null;

    constructor(config: Partial<NoteIndexerConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };

        // Set up progress callback from worker bridge
        embeddingWorkerBridge.setProgressCallback((state) => {
            this.updateIndexState(state.noteId, state);
        });
    }

    /**
     * Get the index ID for a project's notes
     */
    private getIndexId(projectId: string): string {
        // Use shared project index for unified RAG integration
        return projectId;
    }

    /**
     * Update index state and notify callback
     */
    private updateIndexState(noteId: string, state: Partial<NoteIndexState>): void {
        const existing = this.indexStates.get(noteId) || {
            noteId,
            status: 'pending' as const,
            progress: 0,
            retryCount: 0,
        };

        const updated: NoteIndexState = { ...existing, ...state };
        this.indexStates.set(noteId, updated);

        if (this.stateCallback) {
            this.stateCallback(updated);
        }
    }

    /**
     * Set callback for index state changes
     */
    setStateCallback(callback: IndexStateCallback | null): void {
        this.stateCallback = callback;
    }

    /**
     * Get current index state for a note
     */
    getIndexState(noteId: string): NoteIndexState | undefined {
        return this.indexStates.get(noteId);
    }

    /**
     * Index a note
     * 
     * @param note - Note record to index
     * @param projectId - Project ID (for index isolation)
     */
    async indexNote(note: NoteRecord, projectId: string): Promise<void> {
        const indexId = this.getIndexId(projectId);

        // Extract text from blocks
        const text = extractTextFromBlocks(note.blocks as unknown[]);
        if (!text || text.length === 0) {
            console.log(`[NoteIndexer] Note ${note.id} has no text content, skipping`);
            return;
        }

        // Update state to indexing
        this.updateIndexState(note.id, {
            status: 'indexing',
            progress: 0,
            retryCount: 0,
        });

        try {
            // Chunk text for embedding
            const chunks = chunkTextForEmbedding(
                text,
                this.config.chunkSize,
                this.config.chunkOverlap
            );

            console.log(`[NoteIndexer] Indexing note ${note.id} with ${chunks.length} chunks`);

            // Ensure index exists
            let index = await loadIndex(indexId);
            if (!index) {
                index = await createIndex({
                    projectId: indexId,
                    enableVectorSearch: this.config.enableVectorSearch,
                    vectorDimensions: EMBEDDING_DIMENSIONS,
                });
            }

            // Remove existing documents for this note (in case of re-index)
            await this.removeNoteFromIndex(note.id, projectId);

            if (this.config.enableVectorSearch) {
                // Generate embeddings via worker
                const embeddings = await embedChunksInWorker(note.id, chunks);

                // Index each chunk with embedding
                for (let i = 0; i < chunks.length; i++) {
                    const doc: DocumentSchema = {
                        id: generateNoteDocumentId(note.id, i),
                        sourceId: note.id, // Use noteId as sourceId for compatibility
                        content: chunks[i],
                        title: note.title || 'Untitled',
                        position: i,
                        embedding: embeddings[i].embedding,
                        metadata: {
                            chunkIndex: i,
                            totalChunks: chunks.length,
                        },
                    };

                    await indexDocument(indexId, doc);
                }
            } else {
                // BM25 only - no embeddings
                for (let i = 0; i < chunks.length; i++) {
                    const doc: DocumentSchema = {
                        id: generateNoteDocumentId(note.id, i),
                        sourceId: note.id,
                        content: chunks[i],
                        title: note.title || 'Untitled',
                        position: i,
                        metadata: {
                            chunkIndex: i,
                            totalChunks: chunks.length,
                        },
                    };

                    await indexDocument(indexId, doc);
                }
            }

            // Save index to IndexedDB
            await saveIndex(indexId);

            // Update state to indexed
            this.updateIndexState(note.id, {
                status: 'indexed',
                progress: 100,
                lastAttemptAt: Date.now(),
            });

            console.log(`[NoteIndexer] Successfully indexed note ${note.id}`);
        } catch (error) {
            console.error(`[NoteIndexer] Failed to index note ${note.id}:`, error);

            // Update state to error
            this.updateIndexState(note.id, {
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Unknown error',
                lastAttemptAt: Date.now(),
            });

            throw error;
        }
    }

    /**
     * Remove a note from the index
     * 
     * @param noteId - Note ID to remove
     * @param projectId - Project ID
     */
    async removeNoteFromIndex(noteId: string, projectId: string): Promise<void> {
        const indexId = this.getIndexId(projectId);

        try {
            await removeFromIndex(indexId, noteId);
            this.indexStates.delete(noteId);
            console.log(`[NoteIndexer] Removed note ${noteId} from index`);
        } catch (error) {
            console.error(`[NoteIndexer] Failed to remove note ${noteId}:`, error);
            // Don't throw - removal failure shouldn't block other operations
        }
    }

    /**
     * Search notes
     * 
     * @param query - Search query
     * @param projectId - Project ID
     * @param options - Search options
     * @returns Search results with note IDs
     */
    async searchNotes(
        query: string,
        projectId: string,
        options: {
            limit?: number;
            threshold?: number;
            vector?: number[];
        } = {}
    ): Promise<SearchResult[]> {
        const indexId = this.getIndexId(projectId);
        const { limit = 10, threshold = 0.8, vector } = options;

        return searchIndex(indexId, query, {
            limit,
            threshold,
            mode: vector ? 'vector' : 'fulltext',
            vector,
        });
    }

    /**
     * Rebuild entire index for a project
     * 
     * @param notes - All notes to index
     * @param projectId - Project ID
     */
    async rebuildIndex(notes: NoteRecord[], projectId: string): Promise<number> {
        const indexId = this.getIndexId(projectId);

        console.log(`[NoteIndexer] Rebuilding index for project ${projectId} with ${notes.length} notes`);

        // Create fresh index
        await createIndex({
            projectId: indexId,
            enableVectorSearch: this.config.enableVectorSearch,
            vectorDimensions: EMBEDDING_DIMENSIONS,
        });

        // Index all notes
        let indexed = 0;
        for (const note of notes) {
            try {
                await this.indexNote(note, projectId);
                indexed++;
            } catch (error) {
                console.error(`[NoteIndexer] Failed to index note ${note.id} during rebuild:`, error);
            }
        }

        console.log(`[NoteIndexer] Rebuilt index with ${indexed}/${notes.length} notes`);
        return indexed;
    }

    /**
     * Check if a note is indexed
     */
    isNoteIndexed(noteId: string): boolean {
        const state = this.indexStates.get(noteId);
        return state?.status === 'indexed';
    }

    /**
     * Get all index states
     */
    getAllIndexStates(): Map<string, NoteIndexState> {
        return new Map(this.indexStates);
    }

    /**
     * Cancel pending indexing for a note
     */
    cancelIndexing(noteId: string): void {
        embeddingWorkerBridge.cancelNote(noteId);
        this.indexStates.delete(noteId);
    }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of the note indexer
 */
export const noteIndexer = new NoteIndexer();

/**
 * Index a note (convenience function)
 */
export async function indexNote(note: NoteRecord, projectId: string): Promise<void> {
    return noteIndexer.indexNote(note, projectId);
}

/**
 * Remove note from index (convenience function)
 */
export async function removeNoteFromIndex(noteId: string, projectId: string): Promise<void> {
    return noteIndexer.removeNoteFromIndex(noteId, projectId);
}

/**
 * Search notes (convenience function)
 */
export async function searchNotes(
    query: string,
    projectId: string,
    options?: { limit?: number; threshold?: number; vector?: number[] }
): Promise<SearchResult[]> {
    return noteIndexer.searchNotes(query, projectId, options);
}

/**
 * Rebuild note index (convenience function)
 */
export async function rebuildNoteIndex(notes: NoteRecord[], projectId: string): Promise<number> {
    return noteIndexer.rebuildIndex(notes, projectId);
}
