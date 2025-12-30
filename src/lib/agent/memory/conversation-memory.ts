/**
 * @fileoverview Conversation Memory & Long-Term Context
 * @module lib/agent/memory/conversation-memory
 * @governance EPIC-31-1
 *
 * Stores conversation summaries and insights in IndexedDB for semantic search.
 * Enables AI to remember and reference past conversations across sessions.
 *
 * Story 31.1: Conversation Memory & Long-Term Context
 */

import Dexie, { Table } from 'dexie';

export interface ConversationMemory {
  id?: number;
  threadId: string;
  summary: string;        // AI-generated summary
  insights: string[];     // Key learnings extracted
  embedding?: number[];   // Orama embedding for semantic search
  createdAt: number;
  accessedAt: number;
  isExcluded: boolean;    // User opted out
  messageCount: number;   // Number of messages in conversation
  tags: string[];         // Auto-generated tags
}

export interface ConversationSearchResult {
  id: number;
  threadId: string;
  summary: string;
  insights: string[];
  score: number;          // Semantic similarity score
  createdAt: number;
  tags: string[];
}

/**
 * Conversation database class
 */
class ConversationDatabase extends Dexie {
  conversationMemory!: Table<ConversationMemory, number>;

  constructor() {
    super('ViaGentConversationDB');

    // Define schema
    this.version(1).stores({
      conversationMemory: '++id, threadId, createdAt, accessedAt, isExcluded, tags',
    });
  }
}

// Singleton instance
let dbInstance: ConversationDatabase | null = null;

/**
 * Get conversation database instance
 */
function getDb(): ConversationDatabase {
  if (!dbInstance) {
    dbInstance = new ConversationDatabase();
  }
  return dbInstance;
}

/**
 * Store conversation summary in memory
 *
 * @param threadId - Thread ID
 * @param summary - AI-generated summary
 * @param insights - Key insights extracted
 * @param embedding - Optional embedding vector
 * @param messageCount - Number of messages
 * @param tags - Auto-generated tags
 * @returns Stored conversation ID
 */
export async function storeConversation(
  threadId: string,
  summary: string,
  insights: string[],
  embedding?: number[],
  messageCount = 0,
  tags: string[] = []
): Promise<number> {
  const db = getDb();

  const memory: ConversationMemory = {
    threadId,
    summary,
    insights,
    embedding,
    createdAt: Date.now(),
    accessedAt: Date.now(),
    isExcluded: false,
    messageCount,
    tags,
  };

  const id = await db.conversationMemory.add(memory);
  return id;
}

/**
 * Retrieve conversation by thread ID
 *
 * @param threadId - Thread ID
 * @returns Conversation memory or null
 */
export async function getConversation(threadId: string): Promise<ConversationMemory | null> {
  const db = getDb();

  const memory = await db.conversationMemory
    .where('threadId')
    .equals(threadId)
    .first();

  return memory || null;
}

/**
 * Search conversations by keyword
 *
 * @param query - Search query
 * @param options - Search options
 * @returns Array of search results
 */
export async function searchConversations(
  query: string,
  options: {
    limit?: number;
    includeExcluded?: boolean;
  } = {}
): Promise<ConversationSearchResult[]> {
  const db = getDb();

  const { limit = 10, includeExcluded = false } = options;

  // Build query
  let collection = db.conversationMemory.orderBy('createdAt').reverse();

  if (!includeExcluded) {
    collection = collection.filter((memory) => !memory.isExcluded);
  }

  const results = await collection.limit(limit).toArray();

  // Filter by keyword search
  const queryLower = query.toLowerCase();
  const filtered = results.filter((memory) => {
    return (
      memory.summary.toLowerCase().includes(queryLower) ||
      memory.insights.some((insight) => insight.toLowerCase().includes(queryLower)) ||
      memory.tags.some((tag) => tag.toLowerCase().includes(queryLower))
    );
  });

  // Calculate scores (simple keyword frequency for now)
  return filtered.map((memory) => ({
    id: memory.id!,
    threadId: memory.threadId,
    summary: memory.summary,
    insights: memory.insights,
    score: calculateKeywordScore(memory, queryLower),
    createdAt: memory.createdAt,
    tags: memory.tags,
  }));
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(memory: ConversationMemory, query: string): number {
  const summary = memory.summary.toLowerCase();
  const queryLower = query.toLowerCase();

  // Count occurrences
  let score = 0;
  const words = queryLower.split(/\s+/);

  for (const word of words) {
    const regex = new RegExp(word, 'g');
    const matches = summary.match(regex);
    if (matches) {
      score += matches.length * 10;
    }
  }

  // Boost for insights matches
  for (const insight of memory.insights) {
    const insightLower = insight.toLowerCase();
    for (const word of words) {
      if (insightLower.includes(word)) {
        score += 5;
      }
    }
  }

  return score;
}

/**
 * Update access timestamp (for LRU pruning)
 *
 * @param threadId - Thread ID
 */
export async function updateAccessTime(threadId: string): Promise<void> {
  const db = getDb();

  await db.conversationMemory
    .where('threadId')
    .equals(threadId)
    .modify((memory) => {
      memory.accessedAt = Date.now();
    });
}

/**
 * Exclude conversation from memory search
 *
 * @param threadId - Thread ID
 * @param excluded - Whether to exclude
 */
export async function setExcluded(threadId: string, excluded: boolean): Promise<void> {
  const db = getDb();

  await db.conversationMemory
    .where('threadId')
    .equals(threadId)
    .modify((memory) => {
      memory.isExcluded = excluded;
    });
}

/**
 * Delete conversation from memory
 *
 * @param threadId - Thread ID
 */
export async function deleteConversation(threadId: string): Promise<void> {
  const db = getDb();

  await db.conversationMemory.where('threadId').equals(threadId).delete();
}

/**
 * Prune old conversations (30-day retention)
 *
 * @param options - Pruning options
 * @returns Number of conversations pruned
 */
export async function pruneOldConversations(options: {
  retainDays?: number;
  maxCount?: number;
  keepExcluded?: boolean;
} = {}): Promise<number> {
  const db = getDb();

  const {
    retainDays = 30,
    maxCount,
    keepExcluded = true,
  } = options;

  const cutoffDate = Date.now() - retainDays * 24 * 60 * 60 * 1000;

  // Get all conversations older than cutoff
  let collection = db.conversationMemory
    .where('createdAt')
    .below(cutoffDate);

  // Don't prune excluded conversations
  if (keepExcluded) {
    collection = collection.filter((memory) => !memory.isExcluded);
  }

  // Sort by access time (LRU)
  const toPrune = await collection
    .sortBy('accessedAt')
    .limit(maxCount || Number.MAX_SAFE_INTEGER)
    .toArray();

  // Delete pruned conversations
  const ids = toPrune.map((m) => m.id!).filter((id) => id !== undefined);

  if (ids.length > 0) {
    await db.conversationMemory.where('id').anyOf(ids).delete();
  }

  return ids.length;
}

/**
 * Get conversation statistics
 *
 * @returns Storage statistics
 */
export async function getConversationStats(): Promise<{
  totalConversations: number;
  totalInsights: number;
  oldestConversation: number;
  newestConversation: number;
  excludedCount: number;
}> {
  const db = getDb();

  const all = await db.conversationMemory.toArray();

  const totalInsights = all.reduce((sum, m) => sum + m.insights.length, 0);

  const timestamps = all.map((m) => m.createdAt);
  const oldestConversation = Math.min(...timestamps, Date.now());
  const newestConversation = Math.max(...timestamps, 0);

  const excludedCount = all.filter((m) => m.isExcluded).length;

  return {
    totalConversations: all.length,
    totalInsights,
    oldestConversation,
    newestConversation,
    excludedCount,
  };
}

/**
 * Get recent conversations
 *
 * @param options - Query options
 * @returns Array of conversations
 */
export async function getRecentConversations(options: {
  limit?: number;
  includeExcluded?: boolean;
} = {}): Promise<ConversationMemory[]> {
  const db = getDb();

  const { limit = 10, includeExcluded = false } = options;

  let collection = db.conversationMemory
    .orderBy('accessedAt')
    .reverse()
    .limit(limit);

  if (!includeExcluded) {
    collection = collection.filter((memory) => !memory.isExcluded);
  }

  return await collection.toArray();
}
