/**
 * @fileoverview Chunk Strategy Interface
 * @module lib/rag/chunk-strategies/chunk-strategy-interface
 * @governance EPIC-7-2
 *
 * Base interface for all chunking strategies.
 */

import type { ChunkMetadata, ChunkingOptions } from '../types';
import type { SourceRecord } from '@/lib/state/dexie-db';

/**
 * Base interface for chunking strategies
 */
export interface ChunkStrategy {
    /**
     * Chunk content into pieces
     *
     * @param source - Source record to chunk
     * @param options - Chunking options
     * @param onProgress - Optional progress callback
     * @returns Array of chunk metadata
     */
    chunk(
        source: Pick<SourceRecord, 'id' | 'content'>,
        options: ChunkingOptions,
        onProgress?: (progress: { current: number; total: number }) => void
    ): ChunkMetadata[];
}
