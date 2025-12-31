/**
 * @fileoverview Document Chunking Strategies
 * @module lib/rag/chunk-strategies
 * @governance EPIC-7-2
 *
 * Pluggable chunking algorithms for RAG document processing.
 * Implements fixed-size, semantic, and recursive chunking strategies.
 *
 * Refactored into module structure:
 * - chunk-strategies/chunk-strategy.interface.ts: Base interface
 * - chunk-strategies/fixed-size-chunker.ts: Fixed-size implementation
 * - chunk-strategies/semantic-chunker.ts: Semantic implementation
 * - chunk-strategies/recursive-chunker.ts: Recursive implementation
 */

import type { ChunkingStrategy } from './types';
import {
    ChunkStrategy,
    FixedSizeChunker,
    SemanticChunker,
    RecursiveChunker,
} from './chunk-strategies';

// ============================================================================
// Re-exports for backwards compatibility
// ============================================================================

export type { ChunkStrategy };
export { FixedSizeChunker, SemanticChunker, RecursiveChunker };

// ============================================================================
// Chunker Factory
// ============================================================================

/**
 * Create a chunker instance based on strategy
 *
 * @param strategy - Chunking strategy type
 * @returns Chunker instance
 */
export function createChunker(strategy: ChunkingStrategy): ChunkStrategy {
    switch (strategy) {
        case 'fixed-size':
            return new FixedSizeChunker();
        case 'semantic':
            return new SemanticChunker();
        case 'recursive':
            return new RecursiveChunker();
        default:
            return new FixedSizeChunker();
    }
}
