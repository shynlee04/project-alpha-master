/**
 * @fileoverview Orama Index Management
 * @module lib/rag/orama-index
 * @governance EPIC-7-1
 *
 * Manages Orama WASM vector search indexes for local RAG implementation.
 * Provides CRUD operations for indexes, document indexing, search,
 * and persistence to IndexedDB via Dexie.
 *
 * Key Features:
 * - Create/load/delete Orama indexes per project
 * - Document indexing with vector embeddings
 * - Full-text and vector hybrid search
 * - IndexedDB persistence using @orama/plugin-data-persistence
 * - Source attribution in search results
 *
 * @iteration 15 - Added RAG progress events (DATABASE_INDEXING)
 */

import { create, insert, insertMultiple, remove, search, type Orama } from '@orama/orama';
import type {
  DocumentSchema,
  IndexConfig,
  IndexMetadata,
  OramaSchema,
  SearchResult,
} from './types';
import { eventBus } from '@/infrastructure/events/event-bus';

// Lazy load persistence plugin to avoid SSR issues with dpack (Node.js streams dependency)
let persistPlugin: typeof import('@orama/plugin-data-persistence') | null = null;

async function getPersistPlugin() {
  if (typeof window === 'undefined') return null;
  if (!persistPlugin) {
    persistPlugin = await import('@orama/plugin-data-persistence');
  }
  return persistPlugin;
}

// ============================================================================
// Constants
// ============================================================================

/** Default vector dimensions (384 for most embedding models) */
const DEFAULT_VECTOR_DIMENSIONS = 384;

/** Schema version for migration tracking */
const SCHEMA_VERSION = 1;

// ============================================================================
// In-Memory Index Cache
// ============================================================================

/**
 * Active indexes in memory
 * Key: projectId
 */
const activeIndexes = new Map<string, Orama<OramaSchema>>();

// ============================================================================
// Index Management Functions
// ============================================================================

/**
 * Create a new Orama index for a project
 *
 * @param config - Index configuration options
 * @returns Promise resolving to created Orama index
 *
 * @example
 * ```tsx
 * const index = await createIndex({ projectId: 'my-project' });
 * ```
 */
export async function createIndex(config: IndexConfig): Promise<Orama<OramaSchema>> {
  const { projectId, enableVectorSearch = false, vectorDimensions = DEFAULT_VECTOR_DIMENSIONS } = config;

  // Check if index already exists
  if (activeIndexes.has(projectId)) {
    console.warn(`[OramaIndex] Index for project "${projectId}" already exists in memory`);
    return activeIndexes.get(projectId)!;
  }

  // Define schema with optional vector support
  const schemaDefinition = {
    id: 'string',
    sourceId: 'string',
    content: 'string',
    title: 'string',
    position: 'number',
    ...(enableVectorSearch ? { embedding: `vector[${vectorDimensions}]` as const } : {}),
    metadata: {
      chunkIndex: 'number',
      totalChunks: 'number',
    },
  } as const;

  // Create Orama instance
  const db = await create({
    schema: schemaDefinition,
  });

  // Cache in memory
  activeIndexes.set(projectId, db);

  console.log(`[OramaIndex] Created new index for project "${projectId}"`);
  return db;
}

/**
 * Load an existing index from IndexedDB
 *
 * @param projectId - Project ID to load index for
 * @returns Promise resolving to loaded Orama index, or null if not found
 *
 * @example
 * ```tsx
 * const index = await loadIndex('my-project');
 * if (index) {
 *   // Index loaded successfully
 * }
 * ```
 */
export async function loadIndex(projectId: string): Promise<Orama<OramaSchema> | null> {
  // Check if already in memory
  if (activeIndexes.has(projectId)) {
    console.log(`[OramaIndex] Index for project "${projectId}" already loaded in memory`);
    return activeIndexes.get(projectId)!;
  }

  // Try to load from IndexedDB via Dexie
  const { getOramaIndexData } = await import('./indexeddb-storage');
  const persistedData = await getOramaIndexData(projectId);

  if (!persistedData) {
    console.log(`[OramaIndex] No persisted index found for project "${projectId}"`);
    return null;
  }

  try {
    // Restore Orama index from persisted data
    const plugin = await getPersistPlugin();
    if (!plugin) {
      console.warn(`[OramaIndex] Cannot load index during SSR`);
      return null;
    }
    const db = await plugin.restore('json', persistedData);

    // Cache in memory
    activeIndexes.set(projectId, db);

    console.log(`[OramaIndex] Loaded index for project "${projectId}" from IndexedDB`);
    return db;
  } catch (error) {
    console.error(`[OramaIndex] Failed to load index for project "${projectId}":`, error);
    return null;
  }
}

/**
 * Save an index to IndexedDB
 *
 * @param projectId - Project ID to save index for
 * @param index - Orama index instance (optional, uses cached if not provided)
 * @returns Promise resolving when saved
 *
 * @example
 * ```tsx
 * await saveIndex('my-project', index);
 * ```
 */
export async function saveIndex(
  projectId: string,
  index?: Orama<OramaSchema>
): Promise<void> {
  // Use cached index if not provided
  const db = index || activeIndexes.get(projectId);

  if (!db) {
    throw new Error(`No index found for project "${projectId}". Call createIndex() or loadIndex() first.`);
  }

  try {
    // Persist Orama index to JSON
    const plugin = await getPersistPlugin();
    if (!plugin) {
      throw new Error('Persistence plugin not available (SSR or not loaded)');
    }
    const persistedData = await plugin.persist(db, 'json');

    // Save to IndexedDB via Dexie
    const { saveOramaIndexData } = await import('./indexeddb-storage');
    await saveOramaIndexData(projectId, persistedData);

    console.log(`[OramaIndex] Saved index for project "${projectId}" to IndexedDB`);
  } catch (error) {
    console.error(`[OramaIndex] Failed to save index for project "${projectId}":`, error);
    throw error;
  }
}

/**
 * Delete an index from memory and IndexedDB
 *
 * @param projectId - Project ID to delete index for
 * @returns Promise resolving when deleted
 *
 * @example
 * ```tsx
 * await deleteIndex('my-project');
 * ```
 */
export async function deleteIndex(projectId: string): Promise<void> {
  // Remove from memory cache
  activeIndexes.delete(projectId);

  // Remove from IndexedDB via Dexie
  const { deleteOramaIndexData } = await import('./indexeddb-storage');
  await deleteOramaIndexData(projectId);

  console.log(`[OramaIndex] Deleted index for project "${projectId}"`);
}

// ============================================================================
// Document Indexing Functions
// ============================================================================

/**
 * Index a single document
 *
 * @param projectId - Project ID
 * @param document - Document to index
 * @returns Promise resolving when indexed
 *
 * @example
 * ```tsx
 * await indexDocument('my-project', {
 *   id: 'doc-1',
 *   sourceId: 'source-1',
 *   content: 'Document content here',
 *   title: 'My Document',
 *   embedding: [0.1, 0.2, ...], // Optional
 *   metadata: { chunkIndex: 0, totalChunks: 5 }
 * });
 * ```
 */
export async function indexDocument(
  projectId: string,
  document: DocumentSchema
): Promise<void> {
  // Emit start event
  eventBus.emitRAGDatabaseIndexing({
    status: 'running',
    progress: 0,
    current: 0,
    total: 1,
    message: `Indexing document: ${document.id}`,
    documentId: document.id
  });

  try {
    // Get or create index (use full-text only if no embedding provided)
    let db = activeIndexes.get(projectId);
    if (!db) {
      // Create index with vector search only if document has embedding
      db = await createIndex({
        projectId,
        enableVectorSearch: !!document.embedding,
      });
    }

    // Insert document into index
    await insert(db, document as any); // Type assertion for Orama compatibility

    // Emit completion event
    eventBus.emitRAGDatabaseIndexing({
      status: 'completed',
      progress: 100,
      current: 1,
      total: 1,
      message: 'Document indexed successfully',
      documentId: document.id
    });

    console.log(`[OramaIndex] Indexed document "${document.id}" for project "${projectId}"`);
  } catch (error: unknown) {
    // Emit error event
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    eventBus.emitRAGDatabaseIndexing({
      status: 'error',
      progress: 0,
      current: 0,
      total: 1,
      message: 'Document indexing failed',
      error: errorMessage,
      documentId: document.id
    });

    throw error;
  }
}

/**
 * Index all chunks from a source
 *
 * @param projectId - Project ID
 * @param sourceId - Source ID
 * @param content - Full content to chunk and index
 * @param options - Chunking options
 * @returns Promise resolving to number of chunks indexed
 *
 * @example
 * ```tsx
 * await indexSource('my-project', 'source-1', 'Full document text...', {
 *   title: 'My Document',
 *   chunkSize: 1000,
 *   chunkOverlap: 200
 * });
 * ```
 */
export async function indexSource(
  projectId: string,
  sourceId: string,
  content: string,
  options: {
    title?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    embedding?: number[];
  } = {}
): Promise<number> {
  const { title, chunkSize = 1000, chunkOverlap = 200, embedding } = options;

  // Emit start event
  eventBus.emitRAGDatabaseIndexing({
    status: 'running',
    progress: 0,
    current: 0,
    total: 0,
    message: `Starting source indexing: ${sourceId}`,
    sourceId
  });

  try {
    // Chunk the content (simple implementation - Story 7-2 will add proper chunking)
    const chunks = chunkContent(content, chunkSize, chunkOverlap);

    // Emit chunking progress
    eventBus.emitRAGDatabaseIndexing({
      status: 'running',
      progress: 20,
      current: 0,
      total: chunks.length,
      message: `Content chunked into ${chunks.length} parts`,
      sourceId
    });

    // Get or create index (use full-text only if no embedding provided)
    let db = activeIndexes.get(projectId);
    if (!db) {
      db = await createIndex({
        projectId,
        enableVectorSearch: !!embedding,
      });
    }

    // Insert all chunks as documents
    const documents = chunks.map((chunk, index) => ({
      id: `${sourceId}-chunk-${index}`,
      sourceId,
      content: chunk.text,
      title,
      position: index,
      ...(embedding ? { embedding } : {}),
      metadata: {
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }));

    // Insert in batches with progress updates
    await insertMultiple(db, documents as any); // Type assertion for Orama compatibility

    // Emit completion event
    eventBus.emitRAGDatabaseIndexing({
      status: 'completed',
      progress: 100,
      current: chunks.length,
      total: chunks.length,
      message: `Indexed ${documents.length} chunks from source`,
      sourceId
    });

    console.log(`[OramaIndex] Indexed ${documents.length} chunks from source "${sourceId}" for project "${projectId}"`);
    return documents.length;
  } catch (error: unknown) {
    // Emit error event
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    eventBus.emitRAGDatabaseIndexing({
      status: 'error',
      progress: 0,
      current: 0,
      total: 0,
      message: 'Source indexing failed',
      error: errorMessage,
      sourceId
    });

    throw error;
  }
}

/**
 * Remove all documents for a source from the index
 *
 * @param projectId - Project ID
 * @param sourceId - Source ID to remove
 * @returns Promise resolving when removed
 *
 * @example
 * ```tsx
 * await removeFromIndex('my-project', 'source-1');
 * ```
 */
export async function removeFromIndex(projectId: string, sourceId: string): Promise<void> {
  const db = activeIndexes.get(projectId);
  if (!db) {
    console.warn(`[OramaIndex] No index found for project "${projectId}"`);
    return;
  }

  // Find all documents for this source
  const results = await search(db, {
    term: '',
    limit: 1000, // Maximum batch size
  });

  // Remove matching documents
  for (const hit of results.hits) {
    if (hit.document.sourceId === sourceId) {
      await remove(db, hit.id);
    }
  }

  console.log(`[OramaIndex] Removed all documents for source "${sourceId}" from project "${projectId}"`);
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Search across all indexed documents
 *
 * @param projectId - Project ID to search in
 * @param query - Search query
 * @param options - Search options
 * @returns Promise resolving to search results with source attribution
 *
 * @example
 * ```tsx
 * const results = await search('my-project', 'search query', {
 *   limit: 10,
 *   threshold: 0.8
 * });
 * ```
 */
export async function searchIndex(
  projectId: string,
  query: string,
  options: {
    limit?: number;
    threshold?: number;
    mode?: 'fulltext' | 'vector';
    vector?: number[];
  } = {}
): Promise<SearchResult[]> {
  const db = activeIndexes.get(projectId);
  if (!db) {
    console.warn(`[OramaIndex] No index found for project "${projectId}"`);
    return [];
  }

  const { limit = 10, threshold = 0.8, mode = 'fulltext', vector } = options;

  // Perform search
  const results = await search(db, {
    ...(mode === 'vector' && vector
      ? {
          mode: 'vector',
          vector: {
            value: vector,
            property: 'embedding',
          },
          similarity: threshold,
        }
      : {
          term: query,
          threshold,
        }),
    limit,
  });

  // Transform results with source attribution
  const searchResults: SearchResult[] = results.hits.map((hit) => ({
    document: hit.document as unknown as DocumentSchema,
    score: hit.score,
    source: {
      id: hit.document.sourceId,
      title: hit.document.title,
    },
  }));

  console.log(`[OramaIndex] Found ${searchResults.length} results for query "${query}" in project "${projectId}"`);
  return searchResults;
}

// ============================================================================
// Storage Management Functions
// ============================================================================

/**
 * Get index size in bytes
 *
 * @param projectId - Project ID
 * @returns Promise resolving to index size in bytes
 */
export async function getIndexSize(projectId: string): Promise<number> {
  const { getOramaIndexData } = await import('./indexeddb-storage');
  const data = await getOramaIndexData(projectId);
  return data ? new Blob([JSON.stringify(data)]).size : 0;
}

/**
 * Get index metadata
 *
 * @param projectId - Project ID
 * @returns Promise resolving to index metadata
 */
export async function getIndexMetadata(projectId: string): Promise<IndexMetadata | null> {
  const db = activeIndexes.get(projectId);
  if (!db) {
    return null;
  }

  const size = await getIndexSize(projectId);
  const results = await search(db, { term: '', limit: 1000 });

  return {
    projectId,
    documentCount: results.count,
    size,
    lastUpdated: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
  };
}

/**
 * Rebuild index from sources
 *
 * @param projectId - Project ID
 * @param sources - Array of sources to index
 * @returns Promise resolving to number of documents indexed
 */
export async function rebuildIndex(projectId: string, sources: Array<{ id: string; content: string; title?: string }>): Promise<number> {
  // Delete existing index
  await deleteIndex(projectId);

  // Create new index
  await createIndex({ projectId });

  // Re-index all sources
  let totalDocuments = 0;
  for (const source of sources) {
    const docsIndexed = await indexSource(projectId, source.id, source.content, {
      title: source.title,
    });
    totalDocuments += docsIndexed;
  }

  // Save to IndexedDB
  await saveIndex(projectId);

  console.log(`[OramaIndex] Rebuilt index for project "${projectId}" with ${totalDocuments} documents`);
  return totalDocuments;
}

/**
 * Clean up orphaned indexes (indexes without corresponding projects)
 *
 * @param activeProjectIds - Array of active project IDs
 * @returns Promise resolving to number of indexes cleaned up
 */
export async function cleanupOrphanedIndexes(activeProjectIds: string[]): Promise<number> {
  const { getAllOramaIndexIds } = await import('./indexeddb-storage');
  const allIndexIds = await getAllOramaIndexIds();

  const orphanedIds = allIndexIds.filter((id) => !activeProjectIds.includes(id));

  for (const id of orphanedIds) {
    await deleteIndex(id);
  }

  console.log(`[OramaIndex] Cleaned up ${orphanedIds.length} orphaned indexes`);
  return orphanedIds.length;
}

// Re-export from indexeddb-storage for convenience
export { getAllIndexesMetadata } from './indexeddb-storage';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Simple content chunking (Story 7-2 will add proper chunking with overlap)
 *
 * @param content - Content to chunk
 * @param chunkSize - Target chunk size in characters
 * @param overlap - Overlap between chunks
 * @returns Array of text chunks
 */
function chunkContent(content: string, chunkSize: number, overlap: number): Array<{ text: string; index: number }> {
  const chunks: Array<{ text: string; index: number }> = [];
  let index = 0;

  while (index < content.length) {
    const end = Math.min(index + chunkSize, content.length);
    const chunk = content.slice(index, end);
    chunks.push({ text: chunk, index: chunks.length });
    index += chunkSize - overlap;
  }

  return chunks;
}
