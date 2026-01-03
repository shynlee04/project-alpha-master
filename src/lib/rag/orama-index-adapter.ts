/**
 * @fileoverview OramaIndexAdapter - Shared RAG Index Service
 * @module lib/rag/orama-index-adapter
 *
 * Provides a singleton adapter for Orama index operations
 * that integrates with the RAG store for state management.
 *
 * Features:
 * - Singleton pattern with Map-based caching (one adapter per project)
 * - Automatic RAG store state updates during indexing/search
 * - Progress tracking for indexing operations
 * - Error handling with store notifications
 *
 * @governance P0-2: Wire RAG Store to KnowledgePage
 * @handoff p0-2-rag-store-wiring-handoff-2026-01-03.md
 */

import { indexSource, searchIndex } from './orama-index';
import { useRAGStore } from '@/infrastructure/persistence/stores/rag/rag-store';
import { IndexStatus, IndexOperation } from '@/infrastructure/persistence/stores/rag/rag-types';

/**
 * OramaIndexAdapter - Shared service for RAG index operations
 *
 * Manages Orama index operations with automatic state synchronization
 * to the RAG store. Uses singleton pattern per project ID.
 */
export class OramaIndexAdapter {
    /** Project ID for this adapter instance */
    private readonly projectId: string;

    /**
     * Create a new OramaIndexAdapter
     *
     * @param projectId - Project ID to index content for
     */
    constructor(projectId: string) {
        this.projectId = projectId;

        // Notify RAG store when adapter is created
        useRAGStore.getState().setCurrentProject(projectId);
        console.log(`[OramaIndexAdapter] Created adapter for project: ${projectId}`);
    }

    /**
     * Index a batch of document chunks
     *
     * Updates RAG store with progress and status during indexing.
     * Marks index as 'ready' when complete.
     *
     * @param chunks - Array of document chunks with embeddings
     *
     * @example
     * ```tsx
     * const chunks = [
     *   {
     *     sourceId: 'source-1',
     *     content: 'Chunk content here',
     *     title: 'My Document',
     *     embedding: [0.1, 0.2, ...]
     *   }
     * ];
     * await adapter.indexBatch(chunks);
     * ```
     */
    async indexBatch(chunks: Array<{
        sourceId?: string;
        content: string;
        title?: string;
        embedding?: number[];
    }>): Promise<void> {
        const store = useRAGStore.getState();

        // Update RAG store status
        store.setIndexStatus(IndexStatus.BUILDING, IndexOperation.EMBEDDING);
        store.updateIndexingProgress(0, chunks.length);

        console.log(`[OramaIndexAdapter] Indexing batch of ${chunks.length} chunks`);

        // Group chunks by source and index
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            try {
                await indexSource(
                    this.projectId,
                    chunk.sourceId || 'unknown',
                    chunk.content,
                    {
                        title: chunk.title,
                        embedding: chunk.embedding
                    }
                );

                // Update progress
                store.updateIndexingProgress(i + 1, chunks.length);

            } catch (error) {
                console.error('[OramaIndexAdapter] Failed to index chunk:', error);
                store.setError((error as Error).message);
                store.setIndexStatus(IndexStatus.ERROR, IndexOperation.EMBEDDING);
            }
        }

        // Mark as ready and load metadata
        store.setIndexStatus(IndexStatus.READY, IndexOperation.IDLE);
        await store.loadIndexMetadata(this.projectId);

        console.log(`[OramaIndexAdapter] Completed indexing ${chunks.length} chunks`);
    }

    /**
     * Search the index for relevant documents
     *
     * Updates RAG store with 'searching' status during query.
     * Returns empty array on error with status 'error'.
     *
     * @param query - Search query string
     * @param limit - Maximum number of results (default: 10)
     * @returns Promise resolving to search results
     *
     * @example
     * ```tsx
     * const results = await adapter.search('machine learning', 20);
     * console.log(`Found ${results.length} results`);
     * ```
     */
    async search(query: string, limit?: number): Promise<any[]> {
        const store = useRAGStore.getState();

        // Update RAG store status
        store.setIndexStatus(IndexStatus.BUILDING, IndexOperation.INDEXING);

        try {
            const results = await searchIndex(this.projectId, query, {
                limit: limit || 10
            });

            store.setIndexStatus(IndexStatus.READY, IndexOperation.IDLE);
            console.log(`[OramaIndexAdapter] Search returned ${results.length} results`);
            return results;

        } catch (error) {
            console.error('[OramaIndexAdapter] Search failed:', error);
            store.setError((error as Error).message);
            store.setIndexStatus(IndexStatus.ERROR, IndexOperation.INDEXING);
            return [];
        }
    }

    /**
     * Get the project ID for this adapter
     *
     * @returns Project ID
     */
    getProjectId(): string {
        return this.projectId;
    }
}

/**
 * Singleton cache of OramaIndexAdapter instances
 * Key: projectId, Value: OramaIndexAdapter instance
 */
const adapters = new Map<string, OramaIndexAdapter>();

/**
 * Get or create an OramaIndexAdapter for a project
 *
 * Implements singleton pattern - returns existing adapter if already
 * created for the project, otherwise creates new instance.
 *
 * @param projectId - Project ID to get adapter for
 * @returns OramaIndexAdapter instance
 *
 * @example
 * ```tsx
 * // First call creates adapter
 * const adapter1 = getOramaIndexAdapter('project-1');
 *
 * // Subsequent calls return same instance
 * const adapter2 = getOramaIndexAdapter('project-1');
 * console.log(adapter1 === adapter2); // true
 *
 * // Different project gets different adapter
 * const adapter3 = getOramaIndexAdapter('project-2');
 * console.log(adapter1 === adapter3); // false
 * ```
 */
export function getOramaIndexAdapter(projectId: string): OramaIndexAdapter {
    if (!adapters.has(projectId)) {
        const adapter = new OramaIndexAdapter(projectId);
        adapters.set(projectId, adapter);
        console.log(`[OramaIndexAdapter] Created new adapter for project: ${projectId}`);
    } else {
        console.log(`[OramaIndexAdapter] Reusing existing adapter for project: ${projectId}`);
    }
    return adapters.get(projectId)!;
}

/**
 * Clear all cached adapters
 *
 * Useful for testing or cleanup when switching projects.
 *
 * @example
 * ```tsx
 * clearAllAdapters();
 * const adapter = getOramaIndexAdapter('project-1'); // Creates new instance
 * ```
 */
export function clearAllAdapters(): void {
    adapters.clear();
    console.log('[OramaIndexAdapter] Cleared all cached adapters');
}

/**
 * Check if adapter exists for a project
 *
 * @param projectId - Project ID to check
 * @returns true if adapter exists, false otherwise
 *
 * @example
 * ```tsx
 * if (hasOramaIndexAdapter('project-1')) {
 *   const adapter = getOramaIndexAdapter('project-1');
 * }
 * ```
 */
export function hasOramaIndexAdapter(projectId: string): boolean {
    return adapters.has(projectId);
}
