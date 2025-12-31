/**
 * @fileoverview RAG Store Type Definitions
 * @module lib/state/rag-store-types
 * @governance EPIC-7-1
 *
 * Type definitions for RAG (Retrieval-Augmented Generation) state management.
 * Extracted from rag-store.ts for better code organization.
 */

import type { IndexMetadata, SearchResult } from '@/lib/rag/types';
import type { ChunkingProgress, ChunkingOptions, ChunkMetadata } from '@/lib/rag/types';
import type { ChatMessage, Citation } from '@/lib/rag/types';

// ============================================================================
// Enums
// ============================================================================

/**
 * Index status enum
 */
export enum IndexStatus {
    IDLE = 'idle',
    BUILDING = 'building',
    READY = 'ready',
    ERROR = 'error',
}

/**
 * Indexing operation type
 */
export enum IndexOperation {
    IDLE = 'idle',
    CREATING = 'creating',
    LOADING = 'loading',
    SAVING = 'saving',
    INDEXING = 'indexing',
    REMOVING = 'removing',
    REBUILDING = 'rebuilding',
    CLEANING = 'cleaning',
}

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Cached search result entry
 */
export interface CachedSearchResult {
    query: string;
    results: SearchResult[];
    timestamp: number;
}

/**
 * RAG Store State Interface
 */
export interface RAGStoreState {
    /** Current project ID */
    currentProjectId: string | null;

    /** Index status */
    indexStatus: IndexStatus;

    /** Current indexing operation */
    indexingOperation: IndexOperation;

    /** Number of documents indexed */
    documentCount: number;

    /** Total documents to index (for progress tracking) */
    totalDocuments: number;

    /** Index size in bytes */
    indexSize: number;

    /** Index metadata */
    indexMetadata: IndexMetadata | null;

    /** Cached search results */
    searchCache: Map<string, CachedSearchResult>;

    /** Chunking progress tracking (Story 7-2) */
    chunkingProgress: Map<string, ChunkingProgress>;

    /** Embedding progress tracking (Story 7-3) */
    embeddingProgress: Map<string, import('@/lib/rag/types').EmbeddingProgress>;

    /** Current embedding mode (Story 7-3) */
    embeddingMode: import('@/lib/rag/types').EmbeddingMode;

    /** Search state (Story 7-4) */
    searchQuery: string;
    searchResults: import('@/lib/rag/types').ExtendedSearchResult[];
    searchMode: import('@/lib/rag/types').SearchMode;

    /** Chat state (Story 7-5) */
    chatMessages: ChatMessage[];
    citations: Map<string, Citation>;
    activeCitation: Citation | null;

    /** Voice mode state (Story 10-1) */
    voiceState: import('@/lib/rag/live-api-types').VoiceModeState;
    voiceConnection: import('@/lib/rag/live-api-types').ConnectionState;
    voiceMicrophoneEnabled: boolean;
    voiceIsDesktop: boolean;
    voiceVolumeLevel: number;

    /** Loading state for async operations */
    loading: boolean;

    /** Error state */
    error: string | null;

    /** Whether store has hydrated from persistence */
    _hasHydrated: boolean;

    // Actions

    /** Set hydration status */
    setHasHydrated: (state: boolean) => void;

    /** Set current project ID */
    setCurrentProject: (projectId: string | null) => void;

    /** Load index metadata for project */
    loadIndexMetadata: (projectId: string) => Promise<void>;

    /** Update index status */
    setIndexStatus: (status: IndexStatus, operation?: IndexOperation) => void;

    /** Update indexing progress */
    updateIndexingProgress: (documentCount: number, totalDocuments: number) => void;

    /** Set error state */
    setError: (error: string | null) => void;

    /** Clear error state */
    clearError: () => void;

    /** Search with caching */
    search: (projectId: string, query: string, searchFn: () => Promise<SearchResult[]>) => Promise<SearchResult[]>;

    /** Clear search cache */
    clearSearchCache: () => void;

    /** Get all indexes metadata */
    getAllIndexes: () => Promise<IndexMetadata[]>;

    /** Clean up orphaned indexes */
    cleanupOrphaned: (activeProjectIds: string[]) => Promise<number>;

    // Search Actions (Story 7-4)

    /** Set search query */
    setSearchQuery: (query: string) => void;

    /** Perform search with mode and limit */
    performSearch: (query: string, mode?: import('@/lib/rag/types').SearchMode, limit?: number) => Promise<void>;

    /** Set search mode */
    setSearchMode: (mode: import('@/lib/rag/types').SearchMode) => void;

    /** Clear search results */
    clearSearchResults: () => void;

    // Chat Actions (Story 7-5)

    /** Send chat message */
    sendMessage: (message: string, projectId: string) => Promise<void>;

    /** Clear chat history */
    clearChat: () => void;

    /** Select citation */
    selectCitation: (citationId: string) => void;

    // RAG Chat actions (Story 7-5)

    /** Send RAG message with context retrieval */
    sendRAGMessage: (query: string) => Promise<ChatMessage | undefined>;

    /** Show citation */
    showCitation: (citationId: string) => void;

    /** Close citation panel */
    closeCitationPanel: () => void;

    /** Clear chat history */
    clearChatHistory: () => void;

    // Chunking Actions (Story 7-2)

    /** Chunk a source and return chunks */
    chunkSource: (sourceId: string, content: string, options?: ChunkingOptions) => Promise<ChunkMetadata[]>;

    /** Get chunks for a source */
    getChunksForSource: (sourceId: string) => ChunkMetadata[] | undefined;

    /** Clear chunking progress for a source */
    clearChunkingProgress: (sourceId: string) => void;

    // Embedding Actions (Story 7-3)

    /** Detect embedding capability */
    detectEmbeddingCapability: () => Promise<import('@/lib/rag/types').EmbeddingMode>;

    /** Generate embeddings for chunks */
    generateEmbeddings: (
      chunks: import('@/lib/rag/types').ChunkMetadata[],
      options?: import('@/lib/rag/types').EmbeddingOptions
    ) => Promise<Map<string, import('@/lib/rag/types').EmbeddingVector>>;

    /** Clear embedding progress for a chunk */
    clearEmbeddingProgress: (chunkId: string) => void;

    /** Reset store to initial state */
    reset: () => void;

    // Voice Mode Actions (Story 10-1)

    /** Start voice mode (connect WebSocket) */
    startVoiceMode: () => Promise<void>;

    /** Stop voice mode (disconnect WebSocket) */
    stopVoiceMode: () => void;

    /** Toggle microphone on/off */
    toggleVoiceMicrophone: () => void;

    /** Set voice state */
    setVoiceState: (state: import('./rag/live-api-types').VoiceModeState) => void;

    /** Set voice connection state */
    setVoiceConnectionState: (state: import('./rag/live-api-types').ConnectionState) => void;

    /** Update voice volume level */
    setVoiceVolumeLevel: (level: number) => void;

    /** Detect platform (desktop/mobile) */
    detectVoicePlatform: () => boolean;
}
