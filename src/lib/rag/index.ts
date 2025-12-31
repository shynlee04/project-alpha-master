/**
 * @fileoverview RAG Module Barrel Export
 * @module lib/rag
 *
 * Central exports for all RAG (Retrieval-Augmented Generation) modules.
 */

// ============================================================================
// Types
// ============================================================================
export * from './types';
export * from './live-api-types';

// ============================================================================
// Core RAG Services
// ============================================================================
// Note: OramaIndexManager class deprecated - using functional API instead
export { createIndex, loadIndex, saveIndex, deleteIndex, indexDocument, indexSource, removeFromIndex, searchIndex, getIndexSize, getIndexMetadata, getAllIndexesMetadata, rebuildIndex, cleanupOrphanedIndexes } from './orama-index';
export { DocumentChunker, documentChunker } from './document-chunker';
export { createEmbeddingService } from './embedding-service';
export { hybridSearch, hybridSearchWithEmbedding, type HybridSearchConfig, type SearchFilters, type HybridSearchResult, DEFAULT_HYBRID_CONFIG } from './hybrid-retriever';
export { RAGChat, getRAGChat } from './rag-chat';

// ============================================================================
// RAG Components
// ============================================================================
export { RRFFusion, getRRFFusion } from './rrf-fusion';
export { SearchHighlighter, highlightText, extractMatchedTerms } from './search-highlighter';
export { CitationFormatter, formatCitations, buildContext, buildPrompt, extractCitationReferences, createCitationsMap } from './citation-formatter';

// ============================================================================
// Live API (Story 10-1)
// ============================================================================
export { LiveApiWebSocketManager, getWebSocketManager, resetWebSocketManager } from './live-api-websocket';
export { AudioCaptureHandler, getAudioCapture, resetAudioCapture } from './audio-capture';
export { AudioPlaybackHandler, getAudioPlayback, resetAudioPlayback } from './audio-playback';

// ============================================================================
// Cloud Services
// ============================================================================
export { CloudEmbedder } from './cloud-embedder';
export { EmbeddingCache } from './embedding-cache';
