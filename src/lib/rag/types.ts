/**
 * @fileoverview RAG Infrastructure Types
 * @module lib/rag/types
 * @governance EPIC-7-1
 *
 * Type definitions for Orama index management, document schema,
 * and RAG infrastructure components.
 */

import type { Orama } from '@orama/orama';

/**
 * Document schema for Orama index
 * Supports full-text search with optional vector embeddings
 */
export interface DocumentSchema {
  /** Unique document ID */
  id: string;

  /** Reference to knowledge source */
  sourceId: string;

  /** Chunk text content */
  content: string;

  /** Document title */
  title?: string;

  /** Chunk position in document */
  position?: number;

  /** Vector embedding (384-dim for semantic search) */
  embedding?: number[];

  /** Additional metadata */
  metadata?: {
    /** Chunk index within document */
    chunkIndex: number;
    /** Total chunks in document */
    totalChunks: number;
  };
}

/**
 * Orama index schema definition
 */
export interface OramaSchema {
  id: string;
  sourceId: string;
  content: string;
  title?: string;
  position?: number;
  embedding?: 'vector[384]';
  metadata?: {
    chunkIndex: number;
    totalChunks: number;
  };
}

/**
 * Search result with source attribution
 */
export interface SearchResult {
  /** Result document */
  document: DocumentSchema;

  /** Relevance score (0-1) */
  score: number;

  /** Source attribution */
  source: {
    id: string;
    title?: string;
  };
}

/**
 * Index configuration options
 */
export interface IndexConfig {
  /** Unique index identifier (typically projectId) */
  projectId: string;

  /** Whether to use vector search */
  enableVectorSearch?: boolean;

  /** Vector dimensions (default: 384) */
  vectorDimensions?: number;
}

/**
 * Index metadata for persistence
 */
export interface IndexMetadata {
  /** Project ID */
  projectId: string;

  /** Number of documents in index */
  documentCount: number;

  /** Index size in bytes */
  size: number;

  /** Last updated timestamp */
  lastUpdated: string;

  /** Schema version for migration */
  schemaVersion: number;
}

/**
 * Index status for UI feedback
 */
export interface IndexStatus {
  /** Whether index is currently building */
  isBuilding: boolean;

  /** Number of documents indexed */
  documentCount: number;

  /** Total documents to index */
  totalDocuments?: number;

  /** Current operation */
  operation?: 'creating' | 'loading' | 'indexing' | 'searching' | 'idle';

  /** Error message if operation failed */
  error?: string;
}

// ============================================================================
// Chunking Types (Story 7-2)
// ============================================================================

/**
 * Chunking strategy type
 */
export type ChunkingStrategy = 'fixed-size' | 'semantic' | 'recursive';

/**
 * Options for document chunking
 */
export interface ChunkingOptions {
  /** Chunking strategy to use */
  strategy: ChunkingStrategy;

  /** Minimum chunk size in tokens */
  minChunkSize: number;

  /** Maximum chunk size in tokens */
  maxChunkSize: number;

  /** Overlap between chunks in tokens */
  overlap: number;

  /** Preserve formatting (code blocks, tables, etc.) */
  preserveFormatting: boolean;
}

/**
 * Default chunking options
 */
export const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  strategy: 'fixed-size',
  minChunkSize: 512,
  maxChunkSize: 2048,
  overlap: 100,
  preserveFormatting: true,
};

/**
 * Metadata for a single chunk
 */
export interface ChunkMetadata {
  /** Unique chunk identifier */
  chunkId: string;

  /** Source document ID */
  sourceId: string;

  /** 0-based index of this chunk in the source */
  chunkIndex: number;

  /** Total number of chunks in the source */
  totalChunks: number;

  /** Character offset where chunk starts in source */
  startPosition: number;

  /** Character offset where chunk ends in source */
  endPosition: number;

  /** Chunk content */
  content: string;

  /** Token count (approximate) */
  tokenCount: number;

  /** Additional metadata */
  metadata: {
    /** Type of chunk content */
    type?: 'text' | 'figure' | 'table' | 'code';

    /** Caption for figures/tables */
    caption?: string;

    /** Language (for code chunks) */
    language?: string;
  };
}

/**
 * Progress tracking for chunking operation
 */
export interface ChunkingProgress {
  /** Source ID being chunked */
  sourceId: string;

  /** Current chunk number (1-indexed) */
  currentChunk: number;

  /** Total chunks to create */
  totalChunks: number;

  /** Status of chunking */
  status: 'chunking' | 'completed' | 'error';

  /** Error message if status is 'error' */
  error?: string;
}

// ============================================================================
// Embedding Types (Story 7-3)
// ============================================================================

/**
 * Embedding vector (384 dimensions for MiniLM-L6-v2)
 */
export type EmbeddingVector = Float32Array;

/**
 * Embedding provider mode
 */
export type EmbeddingMode = 'local' | 'cloud' | 'keyword-only';

/**
 * Progress tracking for embedding operation
 */
export interface EmbeddingProgress {
  /** Chunk ID being embedded (or 'batch' for batch operations) */
  chunkId: string;

  /** Current chunk number (1-indexed) */
  currentChunk: number;

  /** Total chunks to embed */
  totalChunks: number;

  /** Status of embedding */
  status: 'embedding' | 'completed' | 'error';

  /** Embedding mode being used */
  mode: EmbeddingMode;

  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Options for embedding generation
 */
export interface EmbeddingOptions {
  /** Embedding mode (auto-detect if 'auto') */
  mode?: 'auto' | EmbeddingMode;

  /** Batch size for processing multiple chunks */
  batchSize?: number;

  /** Model to use (for local: 'Xenova/all-MiniLM-L6-v2', for cloud: 'gemini-embedding-001') */
  model?: string;

  /** Optional progress callback */
  onProgress?: (progress: EmbeddingProgress) => void;
}

/**
 * Metadata for cached embedding model
 */
export interface EmbeddingModelMetadata {
  /** Unique model identifier */
  modelId: string;

  /** Model name (e.g., 'all-MiniLM-L6-v2') */
  name: string;

  /** Model version */
  version: string;

  /** Quantization (e.g., 'q4', 'q8') */
  quantization: string;

  /** Model size in bytes */
  size: number;

  /** Download timestamp */
  downloadedAt: number;
}

// ============================================================================
// Retrieval Types (Story 7-4)
// ============================================================================

/**
 * Search mode for retrieval
 */
export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

/**
 * Extended search result with highlighting info
 */
export interface ExtendedSearchResult extends SearchResult {
  /** Matched text with highlighting */
  highlightedText?: string;

  /** Matched terms in this result */
  matchedTerms: string[];

  /** Result position in original search */
  rank: number;

  /** Which search produced this result */
  source: 'bm25' | 'vector' | 'rrf';
}

/**
 * Retrieval options
 */
export interface RetrievalOptions {
  /** Search mode */
  mode?: SearchMode;

  /** Maximum results to return */
  limit?: number;

  /** Similarity threshold for vector search (0-1) */
  similarity?: number;

  /** Whether to include embeddings in results */
  includeVectors?: boolean;

  /** Properties to search */
  properties?: string[];

  /** BM25 relevance parameters */
  bm25?: BM25Config;

  /** RRF fusion parameters */
  rrf?: RRFConfig;
}

/**
 * BM25 algorithm configuration
 */
export interface BM25Config {
  /** Term frequency saturation parameter (default: 1.2) */
  k?: number;

  /** Length normalization parameter (default: 0.75) */
  b?: number;

  /** Frequency normalization lower bound (default: 0.5) */
  d?: number;
}

/**
 * Default BM25 configuration
 */
export const DEFAULT_BM25_CONFIG: BM25Config = {
  k: 1.2,
  b: 0.75,
  d: 0.5,
};

/**
 * Reciprocal Rank Fusion configuration
 */
export interface RRFConfig {
  /** RRF constant k (default: 60) */
  k?: number;

  /** Maximum results from each source to fuse */
  maxResults?: number;
}

/**
 * Default RRF configuration
 */
export const DEFAULT_RRF_CONFIG: RRFConfig = {
  k: 60,
  maxResults: 10,
};

/**
 * Search query with embeddings
 */
export interface SearchQuery {
  /** Query text */
  text: string;

  /** Query embedding (for semantic search) */
  embedding?: EmbeddingVector;
}

