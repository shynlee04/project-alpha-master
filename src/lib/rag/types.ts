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
