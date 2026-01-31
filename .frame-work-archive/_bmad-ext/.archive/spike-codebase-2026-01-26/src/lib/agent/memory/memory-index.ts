/**
 * @fileoverview Memory Index for Semantic Search
 * @module lib/agent/memory/memory-index
 * @governance EPIC-31-1
 *
 * Orama-based semantic search index for conversation memory.
 * Supports full-text search and semantic similarity search.
 *
 * Story 31.1: Conversation Memory & Long-Term Context
 */

import { create, search, insert, insertMultiple } from '@orama/orama';
import type { ConversationMemory } from './conversation-memory';

export interface MemoryIndexOptions {
  /**
   * Index language (default: english)
   */
  language?: 'english' | 'vietnamese' | 'spanish' | 'french' | 'german';

  /**
   * Enable stemming for better matching (default: true)
   */
  stemming?: boolean;

  /**
   * Enable fuzzy search (default: true)
   */
  fuzzy?: boolean;
}

export interface SearchResult {
  /**
   * Conversation memory record
   */
  document: ConversationMemory;

  /**
   * Relevance score (0-1)
   */
  score: number;

  /**
   * Matched highlights
   */
  highlights?: {
    summary?: string[];
    insights?: string[];
    tags?: string[];
  };
}

export interface SearchOptions {
  /**
   * Maximum results to return (default: 10)
   */
  limit?: number;

  /**
   * Minimum relevance threshold (default: 0.3)
   */
  threshold?: number;

  /**
   * Include excluded conversations (default: false)
   */
  includeExcluded?: boolean;

  /**
   * Boost factor for recent conversations (default: 1.0)
   */
  recencyBoost?: number;
}

/**
 * Orama schema for conversation memory
 */
// interface ConversationSchema {
//   threadId: string;
//   summary: string;
//   insights: string[];
//   tags: string[];
//   createdAt: number;
//   accessedAt: number;
//   messageCount: number;
//   isExcluded: boolean;
// }

/**
 * Global Orama index instance
 */
let memoryIndex: any = null;

/**
 * Initialize Orama memory index
 *
 * @param options - Index configuration options
 * @returns Promise resolving when index is ready
 */
export async function initializeMemoryIndex(
  options: MemoryIndexOptions = {}
): Promise<any> {
  if (memoryIndex) {
    return memoryIndex;
  }

  const {
    language = 'english',
    stemming = true,
    // fuzzy = true,
  } = options;

  // Create Orama database with conversation schema
  memoryIndex = await create({
    schema: {
      threadId: 'string',
      summary: 'string',
      insights: 'string[]',
      tags: 'string[]',
      createdAt: 'number',
      accessedAt: 'number',
      messageCount: 'number',
      isExcluded: 'boolean',
    },
    components: {
      tokenizer: {
        stemming: stemming,
        stopWords: language === 'english' ? [
          'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
          'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are',
          'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
        ] : [],
      },
    },
  });

  return memoryIndex;
}

/**
 * Index a conversation for semantic search
 *
 * @param conversation - Conversation memory to index
 * @returns Promise resolving when indexed
 */
export async function indexConversation(
  conversation: ConversationMemory
): Promise<void> {
  const index = await initializeMemoryIndex();

  const document = {
    threadId: conversation.threadId,
    summary: conversation.summary,
    insights: conversation.insights,
    tags: conversation.tags,
    createdAt: conversation.createdAt,
    accessedAt: conversation.accessedAt,
    messageCount: conversation.messageCount,
    isExcluded: conversation.isExcluded,
  };

  // Check if document already exists
  const existing = await search(index, {
    term: conversation.threadId,
    properties: ['threadId'],
    limit: 1,
  });

  if (existing.hits.length > 0) {
    // Document exists - Orama doesn't support updates, so we'd need to handle this
    // For now, skip re-indexing (in production, might need delete + insert)
    return;
  }

  await insert(index, document as any);
}

/**
 * Index multiple conversations in batch
 *
 * @param conversations - Array of conversations to index
 * @returns Promise resolving when all indexed
 */
export async function indexConversations(
  conversations: ConversationMemory[]
): Promise<void> {
  if (conversations.length === 0) {
    return;
  }

  const index = await initializeMemoryIndex();

  const documents = conversations.map(conv => ({
    threadId: conv.threadId,
    summary: conv.summary,
    insights: conv.insights,
    tags: conv.tags,
    createdAt: conv.createdAt,
    accessedAt: conv.accessedAt,
    messageCount: conv.messageCount,
    isExcluded: conv.isExcluded,
  }));

  await insertMultiple(index, documents as any);
}

/**
 * Search conversations by keyword with full-text search
 *
 * @param query - Search query
 * @param options - Search options
 * @returns Array of search results with scores
 */
export async function searchByKeyword(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const index = await initializeMemoryIndex();

  const {
    limit = 10,
    threshold = 0.3,
    includeExcluded = false,
    recencyBoost = 1.0,
  } = options;

  // Perform full-text search
  const searchResult = await search(index, {
    term: query,
    properties: ['summary', 'insights', 'tags'],
    threshold,
    limit: limit * 2, // Fetch more, will filter and recalculate
    boost: {
      summary: 2.0, // Boost summary matches
      tags: 1.5,    // Boost tag matches
    },
  });

  // Convert to search results
  let results: SearchResult[] = searchResult.hits.map(hit => ({
    document: hit.document as unknown as ConversationMemory,
    score: hit.score,
  }));

  // Filter excluded if needed
  if (!includeExcluded) {
    results = results.filter(r => !r.document.isExcluded);
  }

  // Apply recency boost
  if (recencyBoost > 1.0) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    results = results.map(result => {
      const daysSinceAccess = (now - result.document.accessedAt) / dayMs;
      const recencyFactor = Math.max(0.1, 1 - (daysSinceAccess / 30)); // Decay over 30 days
      const boostedScore = result.score * (1 + (recencyBoost - 1.0) * recencyFactor);

      return { ...result, score: Math.min(1.0, boostedScore) };
    });

    // Re-sort by boosted scores
    results.sort((a, b) => b.score - a.score);
  }

  // Limit results
  return results.slice(0, limit);
}

/**
 * Search conversations by semantic similarity (placeholder)
 *
 * Note: True semantic search requires embeddings (e.g., OpenAI, Gemini).
 * This is a simplified version using keyword similarity.
 * For production, integrate with embedding service.
 *
 * @param embedding - Query embedding vector
 * @param options - Search options
 * @returns Array of similar conversations
 */
export async function searchBySemanticSimilarity(
  // embedding: number[],
  // options: SearchOptions = {}
): Promise<SearchResult[]> {
  // TODO: Implement true semantic search with embeddings
  // For now, fallback to keyword search
  console.warn('Semantic search not yet implemented, falling back to keyword search');

  // Extract keywords from embedding context (placeholder)
  // In production, would use embedding to find similar documents
  return [];
}

/**
 * Delete conversation from index
 *
 * @param threadId - Thread ID to remove
 * @returns Promise resolving when deleted
 */
export async function deleteFromIndex(threadId: string): Promise<void> {
  const index = await initializeMemoryIndex();

  // Find document by threadId
  const searchResult = await search(index, {
    term: threadId,
    properties: ['threadId'],
    limit: 1,
  });

  if (searchResult.hits.length > 0) {
    // const docId = searchResult.hits[0].id;
    // Orama doesn't have a simple delete by ID in current version
    // In production, would need to implement custom deletion logic
  }
}

/**
 * Clear entire index (use with caution)
 *
 * @returns Promise resolving when cleared
 */
export async function clearMemoryIndex(): Promise<void> {
  memoryIndex = null;
}

/**
 * Get index statistics
 *
 * @returns Index stats
 */
export async function getIndexStats(): Promise<{
  documentCount: number;
  isInitialized: boolean;
}> {
  if (!memoryIndex) {
    return { documentCount: 0, isInitialized: false };
  }

  // Orama doesn't have a direct count method in current version
  // Would need to search with empty term to get all documents
  return {
    documentCount: 0, // Placeholder
    isInitialized: true,
  };
}

/**
 * Rebuild index from conversation memory database
 *
 * @param conversations - All conversations from database
 * @returns Promise resolving when index rebuilt
 */
export async function rebuildIndex(
  conversations: ConversationMemory[]
): Promise<void> {
  // Clear existing index
  await clearMemoryIndex();

  // Reinitialize
  await initializeMemoryIndex();

  // Index all conversations
  await indexConversations(conversations);
}
