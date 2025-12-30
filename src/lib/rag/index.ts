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
export { OramaIndexManager, getOramaIndexManager } from './orama-index';
export { DocumentChunker, documentChunker } from './document-chunker';
export { createEmbeddingService } from './embedding-service';
export { HybridRetriever, getHybridRetriever } from './hybrid-retriever';
export { RAGChat, getRAGChat } from './rag-chat';

// ============================================================================
// RAG Components
// ============================================================================
export { RRFFusion, getRRFFusion } from './rrf-fusion';
export { SearchHighlighter, searchHighlighter } from './search-highlighter';
export { CitationFormatter, citationFormatter } from './citation-formatter';

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
