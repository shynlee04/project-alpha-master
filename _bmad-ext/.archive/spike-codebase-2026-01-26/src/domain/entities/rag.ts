/**
 * RAG Domain Entities - Domain Layer
 *
 * Core business entities representing Retrieval-Augmented Generation data structures.
 * Aligned with Clean Architecture principles - pure domain logic with no infrastructure dependencies.
 *
 * @layer Domain
 * @module core/entities
 */

/**
 * RAG Collection - Domain Entity
 *
 * Represents a logical grouping of documents for retrieval.
 *
 * Business rules:
 * - Collection must have unique id
 * - Name is required
 * - Metadata allows for flexible tagging and categorization
 */
export interface RagCollection {
  /** Unique identifier */
  id: string;
  /** Display name of the collection */
  name: string;
  /** Optional description */
  description?: string;
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
  /** Custom metadata */
  metadata: Record<string, unknown>;
}

/**
 * RAG Document - Domain Entity
 *
 * Represents a source document within a collection.
 *
 * Business rules:
 * - Document belongs to exactly one collection
 * - Status tracks the indexing lifecycle
 * - Content is the raw text of the document
 */
export interface RagDocument {
  /** Unique identifier */
  id: string;
  /** Foreign key to RagCollection */
  collectionId: string;
  /** Document title or filename */
  title: string;
  /** Raw text content */
  content: string;
  /** Custom metadata (e.g., source URL, author) */
  metadata: Record<string, unknown>;
  /** Indexing status */
  status: 'pending' | 'processing' | 'indexed' | 'error';
  /** Creation timestamp */
  created: Date;
  /** Last update timestamp */
  updated: Date;
}

/**
 * RAG Chunk - Domain Entity
 *
 * Represents a processed segment of a document with vector embedding.
 *
 * Business rules:
 * - Chunk belongs to exactly one document
 * - Embedding is a vector of numbers
 * - Index represents the order within the document
 */
export interface RagChunk {
  /** Unique identifier */
  id: string;
  /** Foreign key to RagDocument */
  documentId: string;
  /** Segment text content */
  content: string;
  /** Vector embedding */
  embedding: number[];
  /** Custom metadata */
  metadata: Record<string, unknown>;
  /** Order index within the document */
  index: number;
}

// --- Create Params ---

/**
 * RagCollection creation parameters
 * Excludes auto-generated fields: id, created, updated
 */
export type RagCollectionCreateParams = Omit<
  RagCollection,
  'id' | 'created' | 'updated'
>;

/**
 * RagDocument creation parameters
 * Excludes auto-generated fields: id, created, updated, status (defaults to pending)
 */
export type RagDocumentCreateParams = Omit<
  RagDocument,
  'id' | 'created' | 'updated' | 'status'
>;

/**
 * RagChunk creation parameters
 * Excludes auto-generated fields: id
 */
export type RagChunkCreateParams = Omit<RagChunk, 'id'>;

// --- Update Params ---

/**
 * RagCollection update parameters
 * All fields optional except id
 */
export type RagCollectionUpdateParams = Partial<Omit<RagCollection, 'id'>> & {
  id: string;
};

/**
 * RagDocument update parameters
 * All fields optional except id
 */
export type RagDocumentUpdateParams = Partial<Omit<RagDocument, 'id'>> & {
  id: string;
};

/**
 * RagChunk update parameters
 * All fields optional except id
 */
export type RagChunkUpdateParams = Partial<Omit<RagChunk, 'id'>> & {
  id: string;
};
