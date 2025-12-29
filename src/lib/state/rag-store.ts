/**
 * @fileoverview RAG State Management (Zustand)
 * @module lib/state/rag-store
 * @governance EPIC-7-1
 *
 * Single source of truth for RAG (Retrieval-Augmented Generation) state.
 * Manages Orama index status, search results cache, and indexing progress.
 *
 * Features:
 * - Index status tracking (building, ready, error)
 * - Indexing progress tracking
 * - Search results cache
 * - Index metadata persistence
 * - Orphaned index cleanup
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from './dexie-storage';
import type { IndexMetadata, SearchResult } from '@/lib/rag/types';
import type { ChunkingProgress, ChunkingOptions, ChunkMetadata } from '@/lib/rag/types';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import {
    getIndexMetadata,
    getIndexSize,
    getAllIndexesMetadata,
    cleanupOrphanedIndexes,
} from '@/lib/rag/orama-index';
import { documentChunker } from '@/lib/rag/document-chunker';

// ============================================================================
// Types
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

/**
 * Cached search result entry
 */
interface CachedSearchResult {
    query: string;
    results: SearchResult[];
    timestamp: number;
}

/**
 * RAG Store State Interface
 */
interface RAGStoreState {
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
    embeddingProgress: Map<string, import('./rag/types').EmbeddingProgress>;

    /** Current embedding mode (Story 7-3) */
    embeddingMode: import('./rag/types').EmbeddingMode;

    /** Search state (Story 7-4) */
    searchQuery: string;
    searchResults: import('./rag/types').ExtendedSearchResult[];
    searchMode: import('./rag/types').SearchMode;

    /** Chat state (Story 7-5) */
    chatMessages: ChatMessage[];
    citations: Map<string, Citation>;
    activeCitation: Citation | null;

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

    // Chunking Actions (Story 7-2)

    /** Chunk a source and return chunks */
    chunkSource: (sourceId: string, content: string, options?: ChunkingOptions) => Promise<ChunkMetadata[]>;

    /** Get chunks for a source */
    getChunksForSource: (sourceId: string) => ChunkMetadata[] | undefined;

    /** Clear chunking progress for a source */
    clearChunkingProgress: (sourceId: string) => void;

    // Embedding Actions (Story 7-3)

    /** Detect embedding capability */
    detectEmbeddingCapability: () => Promise<import('./rag/types').EmbeddingMode>;

    /** Generate embeddings for chunks */
    generateEmbeddings: (
      chunks: import('./rag/types').ChunkMetadata[],
      options?: import('./rag/types').EmbeddingOptions
    ) => Promise<Map<string, import('./rag/types').EmbeddingVector>>;

    /** Clear embedding progress for a chunk */
    clearEmbeddingProgress: (chunkId: string) => void;

    /** Reset store to initial state */
    reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Search cache TTL in milliseconds (5 minutes) */
const SEARCH_CACHE_TTL = 5 * 60 * 1000;

/** Maximum cache size */
const MAX_CACHE_SIZE = 100;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate cache key for search query
 */
function generateCacheKey(projectId: string, query: string): string {
    return `${projectId}:${query}`;
}

/**
 * Check if cached result is still valid
 */
function isCacheValid(entry: CachedSearchResult): boolean {
    return Date.now() - entry.timestamp < SEARCH_CACHE_TTL;
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache(cache: Map<string, CachedSearchResult>): Map<string, CachedSearchResult> {
    const cleaned = new Map<string, CachedSearchResult>();
    for (const [key, entry] of cache.entries()) {
        if (isCacheValid(entry)) {
            cleaned.set(key, entry);
        }
    }
    return cleaned;
}

/**
 * Enforce cache size limit (LRU eviction)
 */
function enforceCacheLimit(cache: Map<string, CachedSearchResult>): Map<string, CachedSearchResult> {
    if (cache.size <= MAX_CACHE_SIZE) {
        return cache;
    }

    // Sort by timestamp (oldest first) and keep only the most recent MAX_CACHE_SIZE entries
    const entries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const trimmed = new Map<string, CachedSearchResult>();
    const startIdx = entries.length - MAX_CACHE_SIZE;
    for (let i = startIdx; i < entries.length; i++) {
        trimmed.set(entries[i][0], entries[i][1]);
    }
    return trimmed;
}

// ============================================================================
// Store
// ============================================================================

export const useRAGStore = create<RAGStoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentProjectId: null,
            indexStatus: IndexStatus.IDLE,
            indexingOperation: IndexOperation.IDLE,
            documentCount: 0,
            totalDocuments: 0,
            indexSize: 0,
            indexMetadata: null,
            searchCache: new Map(),
            chunkingProgress: new Map(),
            embeddingProgress: new Map(),
            embeddingMode: 'keyword-only' as import('./rag/types').EmbeddingMode,
            searchQuery: '',
            searchResults: [],
            searchMode: 'hybrid' as import('./rag/types').SearchMode,
            chatMessages: [],
            citations: new Map(),
            activeCitation: null,
            loading: false,
            error: null,
            _hasHydrated: false,

            // Actions
            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            setCurrentProject: (projectId: string | null) => {
                set({
                    currentProjectId: projectId,
                    indexStatus: projectId ? IndexStatus.IDLE : IndexStatus.IDLE,
                    documentCount: 0,
                    totalDocuments: 0,
                    indexSize: 0,
                    indexMetadata: null,
                });
            },

            loadIndexMetadata: async (projectId: string) => {
                set({ loading: true, error: null, currentProjectId: projectId });
                try {
                    const metadata = await getIndexMetadata(projectId);

                    if (metadata) {
                        set({
                            indexMetadata: metadata,
                            documentCount: metadata.documentCount,
                            indexSize: metadata.size,
                            indexStatus: IndexStatus.READY,
                            loading: false,
                        });
                    } else {
                        set({
                            indexMetadata: null,
                            documentCount: 0,
                            indexSize: 0,
                            indexStatus: IndexStatus.IDLE,
                            loading: false,
                        });
                    }
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        indexStatus: IndexStatus.ERROR,
                        loading: false,
                    });
                }
            },

            setIndexStatus: (status: IndexStatus, operation: IndexOperation = IndexOperation.IDLE) => {
                set({
                    indexStatus: status,
                    indexingOperation: operation,
                });
            },

            updateIndexingProgress: (documentCount: number, totalDocuments: number) => {
                set({ documentCount, totalDocuments });
            },

            setError: (error: string | null) => {
                set({
                    error,
                    indexStatus: error ? IndexStatus.ERROR : get().indexStatus,
                });
            },

            clearError: () => {
                set({ error: null });
            },

            search: async (projectId: string, query: string, searchFn: () => Promise<SearchResult[]>) => {
                const cacheKey = generateCacheKey(projectId, query);
                const currentCache = get().searchCache;

                // Check cache
                const cached = currentCache.get(cacheKey);
                if (cached && isCacheValid(cached)) {
                    console.log('[RAGStore] Cache hit for query:', query);
                    return cached.results;
                }

                // Perform search
                set({ loading: true, error: null });
                try {
                    const results = await searchFn();

                    // Update cache
                    set((state) => {
                        let newCache = new Map(state.searchCache);
                        newCache.set(cacheKey, {
                            query,
                            results,
                            timestamp: Date.now(),
                        });

                        // Clean expired entries and enforce size limit
                        newCache = cleanExpiredCache(newCache);
                        newCache = enforceCacheLimit(newCache);

                        return { searchCache: newCache, loading: false };
                    });

                    return results;
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        loading: false,
                    });
                    return [];
                }
            },

            clearSearchCache: () => {
                set({ searchCache: new Map() });
            },

            getAllIndexes: async () => {
                try {
                    const metadata = await getAllIndexesMetadata();
                    return metadata;
                } catch (error) {
                    set({ error: (error as Error).message });
                    return [];
                }
            },

            cleanupOrphaned: async (activeProjectIds: string[]) => {
                set({ loading: true, error: null });
                try {
                    const cleanedCount = await cleanupOrphanedIndexes(activeProjectIds);
                    set({ loading: false });
                    return cleanedCount;
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        loading: false,
                    });
                    return 0;
                }
            },

            // Chunking Actions (Story 7-2)

            chunkSource: async (sourceId: string, content: string, options?: ChunkingOptions) => {
                set({ loading: true, error: null });

                try {
                    // Create a temporary source record for chunking
                    const tempSource = {
                        id: sourceId,
                        type: 'text' as const,
                        content,
                        title: '',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    };

                    // Track chunking progress
                    const chunks: ChunkMetadata[] = [];

                    // Chunk with progress tracking
                    const result = documentChunker.chunkSource(
                        tempSource,
                        options,
                        (progress) => {
                            set((state) => {
                                const newProgress = new Map(state.chunkingProgress);
                                newProgress.set(sourceId, progress);
                                return { chunkingProgress: newProgress };
                            });
                        }
                    );

                    // Update progress to completed
                    set((state) => {
                        const newProgress = new Map(state.chunkingProgress);
                        newProgress.set(sourceId, {
                            sourceId,
                            currentChunk: result.totalChunks,
                            totalChunks: result.totalChunks,
                            status: 'completed',
                        });
                        return { chunkingProgress: newProgress, loading: false };
                    });

                    console.log(
                        `[RAGStore] Chunked source ${sourceId}: ` +
                            `${result.totalChunks} chunks, ${result.totalTokens} tokens`
                    );

                    return result.chunks;
                } catch (error) {
                    // Update progress to error
                    set((state) => {
                        const newProgress = new Map(state.chunkingProgress);
                        newProgress.set(sourceId, {
                            sourceId,
                            currentChunk: 0,
                            totalChunks: 0,
                            status: 'error',
                            error: (error as Error).message,
                        });
                        return {
                            chunkingProgress: newProgress,
                            error: (error as Error).message,
                            loading: false,
                        };
                    });
                    return [];
                }
            },

            getChunksForSource: (sourceId: string) => {
                // For now, this is a placeholder. In a full implementation,
                // chunks would be stored in IndexedDB and retrieved here.
                // The chunkingProgress map only stores progress, not the actual chunks.
                return undefined;
            },

            clearChunkingProgress: (sourceId: string) => {
                set((state) => {
                    const newProgress = new Map(state.chunkingProgress);
                    newProgress.delete(sourceId);
                    return { chunkingProgress: newProgress };
                });
            },

            // Embedding Actions (Story 7-3)

            detectEmbeddingCapability: async () => {
                const { createEmbeddingService } = await import('../rag/embedding-service');
                const vault = await import('../state').then((m) => m.useCredentialVault.getState());
                const apiKey = vault.getCredential('google')?.apiKey;

                try {
                    const service = await createEmbeddingService(apiKey);
                    const provider = service.getProvider();
                    const mode = provider === 'local'
                        ? ('local' as const)
                        : provider === 'cloud'
                        ? ('cloud' as const)
                        : ('keyword-only' as const);

                    set({ embeddingMode: mode });
                    return mode;
                } catch (error) {
                    console.error('[RAGStore] Failed to detect embedding capability:', error);
                    set({ embeddingMode: 'keyword-only' as const });
                    return 'keyword-only';
                }
            },

            generateEmbeddings: async (chunks, options) => {
                set({ loading: true, error: null });

                try {
                    const { createEmbeddingService } = await import('../rag/embedding-service');
                    const vault = await import('../state').then((m) => m.useCredentialVault.getState());
                    const apiKey = vault.getCredential('google')?.apiKey;

                    const service = await createEmbeddingService(apiKey);

                    // Map ChunkMetadata to strings for batch embedding
                    const texts = chunks.map((chunk) => chunk.content);
                    const result = await service.embedBatch(texts);

                    // Map results back to chunk IDs
                    const embeddings = new Map<string, import('./rag/types').EmbeddingVector>();
                    chunks.forEach((chunk, idx) => {
                        embeddings.set(
                            chunk.chunkId,
                            Float32Array.from(result.results[idx].embedding)
                        );
                    });

                    // Update mode based on provider used
                    const mode = result.provider === 'local'
                        ? ('local' as const)
                        : result.provider === 'cloud'
                        ? ('cloud' as const)
                        : ('keyword-only' as const);
                    set({ embeddingMode: mode, loading: false });

                    console.log(
                        `[RAGStore] Generated ${embeddings.size} embeddings via ${mode}`
                    );

                    return embeddings;
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        embeddingMode: 'keyword-only',
                        loading: false,
                    });
                    return new Map();
                }
            },

            clearEmbeddingProgress: (chunkId) => {
                set((state) => {
                    const newProgress = new Map(state.embeddingProgress);
                    newProgress.delete(chunkId);
                    return { embeddingProgress: newProgress };
                });
            },

            // Search Actions (Story 7-4)

            performSearch: async (query: string, mode?: import('./rag/types').SearchMode) => {
                const { HybridRetriever } = await import('../rag/hybrid-retriever');
                const { createEmbeddingService } = await import('../rag/embedding-service');
                const { loadOrCreateIndex } = await import('../rag/orama-index');
                const vault = await import('../state').then((m) => m.useCredentialVault.getState());
                const apiKey = vault.getCredential('google')?.apiKey;

                set({ loading: true, error: null, searchQuery: query });

                try {
                    // Load or create Orama index
                    const projectId = get().currentProjectId || 'default';
                    const index = await loadOrCreateIndex(projectId);

                    // Create embedding service
                    const embeddingService = await createEmbeddingService(apiKey);

                    // Create hybrid retriever
                    const retriever = new HybridRetriever({
                        index,
                        embeddingService,
                        defaultMode: mode || get().searchMode,
                    });

                    // Perform search
                    const results = await retriever.search(query);

                    set({
                        searchResults: results,
                        searchMode: mode || get().searchMode,
                        loading: false,
                    });

                    console.log(`[RAGStore] Search complete: ${results.length} results via ${mode || get().searchMode}`);

                    return results;
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        searchResults: [],
                        loading: false,
                    });
                    return [];
                }
            },

            setSearchMode: (mode: import('./rag/types').SearchMode) => {
                set({ searchMode: mode });
            },

            clearSearchResults: () => {
                set({
                    searchQuery: '',
                    searchResults: [],
                });
            },

            // RAG Chat actions (Story 7-5)
            sendRAGMessage: async (query: string) => {
                const { HybridRetriever } = await import('../rag/hybrid-retriever');
                const { createEmbeddingService } = await import('../rag/embedding-service');
                const { loadOrCreateIndex } = await import('../rag/orama-index');
                const { formatCitations, buildContext, createCitationsMap } = await import('../rag/citation-formatter');
                const vault = await import('../state').then((m) => m.useCredentialVault.getState());
                const apiKey = vault.getCredential('google')?.apiKey;

                set({ loading: true, error: null });

                try {
                    // Load or create Orama index
                    const projectId = get().currentProjectId || 'default';
                    const index = await loadOrCreateIndex(projectId);

                    // Create embedding service
                    const embeddingService = await createEmbeddingService(apiKey);

                    // Create hybrid retriever
                    const retriever = new HybridRetriever({
                        index,
                        embeddingService,
                        defaultMode: 'hybrid',
                    });

                    // Step 1: Retrieve context
                    const results = await retriever.search(query, { limit: 10 });

                    // Step 2: Format citations
                    const citations = formatCitations(results);
                    const citationsMap = createCitationsMap(citations);

                    // Step 3: Build context
                    const context = buildContext(results, query);

                    // Step 4: Add user message
                    const userMessage: ChatMessage = {
                        role: 'user',
                        content: query,
                        timestamp: Date.now(),
                    };

                    // Step 5: Generate assistant response (placeholder for TanStack AI integration)
                    const responseText = `Based on ${results.length} sources, here's an answer. [Integration with TanStack AI pending]`;

                    const assistantMessage: ChatMessage = {
                        role: 'assistant',
                        content: responseText,
                        citations,
                        timestamp: Date.now(),
                    };

                    // Step 6: Update state
                    set({
                        chatMessages: [...get().chatMessages, userMessage, assistantMessage],
                        citations: citationsMap,
                        loading: false,
                    });

                    console.log(`[RAGStore] RAG chat complete: ${results.length} sources, ${citations.length} citations`);

                    return assistantMessage;
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        loading: false,
                    });
                    throw error;
                }
            },

            showCitation: (citationId: string) => {
                const citation = get().citations.get(citationId);
                if (citation) {
                    set({ activeCitation: citation });
                }
            },

            closeCitationPanel: () => {
                set({ activeCitation: null });
            },

            clearChatHistory: () => {
                set({
                    chatMessages: [],
                    citations: new Map(),
                    activeCitation: null,
                });
            },

            reset: () => {
                set({
                    currentProjectId: null,
                    indexStatus: IndexStatus.IDLE,
                    indexingOperation: IndexOperation.IDLE,
                    documentCount: 0,
                    totalDocuments: 0,
                    indexSize: 0,
                    indexMetadata: null,
                    searchCache: new Map(),
                    chunkingProgress: new Map(),
                    embeddingProgress: new Map(),
                    embeddingMode: 'keyword-only' as import('./rag/types').EmbeddingMode,
                    searchQuery: '',
                    searchResults: [],
                    searchMode: 'hybrid' as import('./rag/types').SearchMode,
                    chatMessages: [],
                    citations: new Map(),
                    activeCitation: null,
                    loading: false,
                    error: null,
                });
            },
        }),
        {
            name: 'rag-state',
            // Use Dexie storage adapter for IndexedDB persistence
            storage: createJSONStorage(() => createDexieStorage('conversationState' as keyof typeof db)),

            // Persist only serializable state (Map is not serializable by default)
            partialize: (state) => ({
                currentProjectId: state.currentProjectId,
                indexStatus: state.indexStatus,
                indexingOperation: state.indexingOperation,
                documentCount: state.documentCount,
                totalDocuments: state.totalDocuments,
                indexSize: state.indexSize,
                indexMetadata: state.indexMetadata,
                // Convert Map to array for serialization
                searchCache: Array.from(state.searchCache.entries()),
                chunkingProgress: Array.from(state.chunkingProgress.entries()),
                embeddingProgress: Array.from(state.embeddingProgress.entries()),
                embeddingMode: state.embeddingMode,
                // Search state (Story 7-4)
                searchQuery: state.searchQuery,
                searchResults: state.searchResults,
                searchMode: state.searchMode,
                // Chat state (Story 7-5) - Convert Map to array
                chatMessages: state.chatMessages,
                citations: Array.from(state.citations.entries()),
                activeCitation: state.activeCitation,
                error: state.error,
            }),

            // Rehydrate and convert array back to Map
            onRehydrateStorage: () => (state) => {
                console.log('[RAGStore] Rehydrated from IndexedDB');

                if (state) {
                    // Convert array back to Map
                    state.searchCache = new Map(state.searchCache as [string, CachedSearchResult][]);
                    state.chunkingProgress = new Map(state.chunkingProgress as [string, ChunkingProgress][]);
                    state.embeddingProgress = new Map(
                        state.embeddingProgress as [string, import('./rag/types').EmbeddingProgress][]
                    );
                    // Chat state (Story 7-5) - Convert citations array back to Map
                    if (!Array.isArray(state.citations) && !(state.citations instanceof Map)) {
                        state.citations = new Map();
                    } else if (Array.isArray(state.citations)) {
                        state.citations = new Map(state.citations as [string, Citation][]);
                    }

                    // Clean expired cache entries on hydration
                    state.searchCache = cleanExpiredCache(state.searchCache);

                    console.log('[RAGStore] Cache size after hydration:', state.searchCache.size);

                    state.setHasHydrated(true);
                }
            },
        }
    )
);
