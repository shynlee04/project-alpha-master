/**
 * @fileoverview RAG Store Barrel Export
 * @module infrastructure/persistence/stores/rag
 * @governance EPIC-7-1
 *
 * Consolidated RAG state management with focused slices.
 * Replaces duplicate stores at:
 * - @/lib/state/rag-store (DELETE)
 * - @/infrastructure/persistence/stores/rag-store (DELETE)
 */

// Main store
export { useRAGStore } from './rag-store';
export { useRAGStoreHydration, useActiveIndex, usePendingChunking } from './rag-store';

// Types
export type {
  RAGIndexState,
  RAGSearchState,
  RAGChunkingState,
  RAGVoiceState,
  RAGChatState,
  RAGStoreState,
  CachedSearchResult,
  WorkspaceType,
} from './rag-types';

export { IndexStatus, IndexOperation } from './rag-types';

// Slice creators (for testing)
export { createRAGIndexSlice } from './rag-index-slice';
export { createRAGSearchSlice } from './rag-search-slice';
export { createRAGChunkingSlice } from './rag-chunking-slice';
export { createRAGVoiceSlice } from './rag-voice-slice';
export { createRAGChatSlice } from './rag-chat-slice';

// Helpers
export {
  generateCacheKey,
  isCacheValid,
  cleanExpiredCache,
  enforceCacheLimit,
  getStorageQuota,
  formatBytes,
  base64ToArrayBuffer,
} from './rag-helpers';
