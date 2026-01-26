/**
 * @fileoverview Agent Memory Module Barrel Export
 * @module lib/agent/memory
 * @governance EPIC-31-1
 *
 * Conversation memory with IndexedDB storage and semantic search.
 */

export {
  storeConversation,
  searchConversations,
  getRecentConversations,
  pruneOldConversations,
  updateAccessTime,
  setExcluded,
  getConversationStats,
  type ConversationMemory,
  type ConversationSearchOptions,
  type ConversationSearchResult,
} from './conversation-memory';

export {
  extractInsights,
  autoExtractAndStore,
  type InsightExtractionOptions,
  type ExtractedInsights,
} from './insight-extractor';

export {
  initializeMemoryIndex,
  indexConversation,
  indexConversations,
  searchByKeyword,
  searchBySemanticSimilarity,
  deleteFromIndex,
  clearMemoryIndex,
  getIndexStats,
  rebuildIndex,
  type MemoryIndexOptions,
  type SearchResult as MemorySearchResult,
  type SearchOptions,
} from './memory-index';
