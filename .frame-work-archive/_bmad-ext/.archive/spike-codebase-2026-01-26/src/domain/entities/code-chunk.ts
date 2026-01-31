/**
 * @fileoverview Code Chunk Domain Entity
 * @module domain/entities/code-chunk
 * @governance EPIC-40 MM-10
 *
 * Represents a semantic chunk of code for RAG indexing.
 * Preserves syntax boundaries and contextual relationships.
 *
 * @story MM-10: Code-Aware Chunking
 * @created 2026-01-10
 */

/**
 * Programming language enumeration
 */
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'sql'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'html'
  | 'css'
  | 'bash'
  | 'unknown';

/**
 * Code chunk type
 */
export type CodeChunkType =
  | 'function'      // Function or method definition
  | 'class'         // Class definition
  | 'statement'     // Statement or block
  | 'import'        // Import or export statement
  | 'comment'       // Comment block
  | 'config'        // Configuration data (JSON, YAML)
  | 'inline';       // Inline code snippet

/**
 * Code chunk entity
 *
 * Represents a semantic chunk of code extracted from a message.
 * Used for RAG indexing and retrieval.
 */
export interface CodeChunk {
  /** Unique identifier for this chunk */
  id: string;
  /** Source message ID */
  messageId: string;
  /** Thread this chunk belongs to */
  threadId: string;
  /** Conversation this chunk belongs to */
  conversationId: string;

  // Content
  /** Code content */
  content: string;
  /** Programming language */
  language: CodeLanguage;
  /** Chunk type */
  type: CodeChunkType;

  // Metadata
  /** File path if extracted from file reference */
  filePath?: string;
  /** Starting line number (if from file) */
  startLine?: number;
  /** Ending line number (if from file) */
  endLine?: number;
  /** Parent chunk ID (for hierarchical chunks) */
  parentChunkId?: string;
  /** Child chunk IDs */
  childChunkIds?: string[];

  // Embedding metadata (for RAG)
  /** Embedding vector ID */
  embeddingId?: string;
  /** Estimated token count */
  tokenCount: number;
  /** Chunk hash for deduplication */
  hash: string;

  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Code chunk relationship
 *
 * Links related chunks for context-aware retrieval.
 */
export interface CodeChunkRelation {
  id: string;
  /** Source chunk ID */
  fromChunkId: string;
  /** Target chunk ID */
  toChunkId: string;
  /** Relationship type */
  type: 'calls' | 'imports' | 'extends' | 'implements' | 'contains' | 'related';
  /** Relationship confidence (0-1) */
  confidence: number;
  createdAt: number;
}

/**
 * Code chunk extraction result
 *
 * Result of chunking a code block.
 */
export interface ChunkingResult {
  /** Extracted chunks */
  chunks: CodeChunk[];
  /** Total token count */
  totalTokens: number;
  /** Chunk count */
  chunkCount: number;
  /** Languages detected */
  languages: CodeLanguage[];
}
