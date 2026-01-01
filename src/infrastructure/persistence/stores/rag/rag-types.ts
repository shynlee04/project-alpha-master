/**
 * @fileoverview RAG Store Type Definitions
 * @module infrastructure/persistence/stores/rag/rag-types
 * @governance EPIC-7-1
 *
 * Type definitions for RAG (Retrieval-Augmented Generation) state management.
 * Supports multi-workspace architecture with workspace-aware indexing.
 */

import type { IndexMetadata, SearchResult } from '@/lib/rag/types';
import type { ChunkingProgress } from '@/lib/rag/types';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import type { VoiceModeState, ConnectionState } from '@/lib/rag/live-api-types';

// ============================================================================
// Enums
// ============================================================================

/**
 * Index lifecycle status
 */
export enum IndexStatus {
  IDLE = 'idle',
  BUILDING = 'building',
  READY = 'ready',
  ERROR = 'error',
}

/**
 * Current indexing operation type
 */
export enum IndexOperation {
  IDLE = 'idle',
  CREATING = 'creating',
  INDEXING = 'indexing',
  CHUNKING = 'chunking',
  EMBEDDING = 'embedding',
  OPTIMIZING = 'optimizing',
  DELETING = 'deleting',
}

// ============================================================================
// Slice Types
// ============================================================================

/**
 * Index slice state - manages index lifecycle and metadata
 */
export interface RAGIndexState {
  // Workspace & Project tracking
  currentWorkspaceType: WorkspaceType; // NEW: Workspace awareness
  currentProjectId: string | null;

  // Index status
  indexStatus: IndexStatus;
  indexingOperation: IndexOperation;
  documentCount: number;
  totalDocuments: number;
  indexSize: number;
  indexMetadata: IndexMetadata | null;

  // Hydration
  _hasHydrated: boolean;
}

/**
 * Search slice state - manages search queries and results cache
 */
export interface RAGSearchState {
  searchQuery: string;
  searchResults: SearchResult[];
  searchMode: import('@/lib/rag/types').SearchMode;
  searchCache: Map<string, CachedSearchResult>;

  loading: boolean;
  error: string | null;
}

/**
 * Chunking slice state - manages document chunking progress
 */
export interface RAGChunkingState {
  chunkingProgress: Map<string, ChunkingProgress>;
  embeddingProgress: Map<string, number>;
  embeddingMode: import('@/lib/rag/types').EmbeddingMode;
}

/**
 * Voice slice state - manages voice mode (Story 10-1)
 */
export interface RAGVoiceState {
  voiceState: VoiceModeState;
  voiceConnection: ConnectionState;
  voiceMicrophoneEnabled: boolean;
  voiceIsDesktop: boolean;
  voiceVolumeLevel: number;
}

/**
 * Chat slice state - manages RAG chat messages and citations
 */
export interface RAGChatState {
  chatMessages: ChatMessage[];
  citations: Map<string, Citation>;
  activeCitation: string | null;
}

// ============================================================================
// Combined Store State
// ============================================================================

/**
 * Complete RAG store state (composed from all slices)
 */
export type RAGStoreState = RAGIndexState & RAGSearchState & RAGChunkingState & RAGVoiceState & RAGChatState;

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Cached search result with TTL
 */
export interface CachedSearchResult {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

/**
 * Workspace type for multi-workspace architecture
 */
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'canvas';
