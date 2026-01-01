/**
 * @fileoverview RAG State Management (Zustand)
 * @module lib/state/rag-store
 * @governance EPIC-7-1
 *
 * Single source of truth for RAG (Retrieval-Augmented Generation) state.
 * Manages Orama index status, search results cache, and indexing progress.
 *
 * Refactored from monolithic file (1071 lines) to modular structure:
 * - rag-store-types.ts: Type definitions
 * - rag-store-helpers.ts: Helper functions and constants
 * - rag-store.ts: Main store with actions (this file)
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
import type { SearchResult } from '@/lib/rag/types';
import type { ChunkingProgress, ChunkingOptions } from '@/lib/rag/types';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import {
    getIndexMetadata,
    // getIndexSize,
    getAllIndexesMetadata,
    cleanupOrphanedIndexes,
} from '@/lib/rag/orama-index';
import { documentChunker } from '@/lib/rag/document-chunker';
import { fetchServerSentEvents } from '@tanstack/ai-react';

// Import types and helpers
import { IndexStatus, IndexOperation } from './rag-store-types';
import type { RAGStoreState, CachedSearchResult } from './rag-store-types';
import {
    generateCacheKey,
    isCacheValid,
    cleanExpiredCache,
    base64ToArrayBuffer,
    enforceCacheLimit,
    // SEARCH_CACHE_TTL,
    // MAX_CACHE_SIZE,
} from './rag-store-helpers';
import { db } from './dexie-db';

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
            embeddingMode: 'keyword-only' as import('@/lib/rag/types').EmbeddingMode,
            searchQuery: '',
            searchResults: [],
            searchMode: 'hybrid' as import('@/lib/rag/types').SearchMode,
            chatMessages: [],
            citations: new Map(),
            activeCitation: null,
            // Voice mode state (Story 10-1)
            voiceState: 'idle' as import('@/lib/rag/live-api-types').VoiceModeState,
            voiceConnection: {
                state: 'disconnected',
                retryCount: 0,
            } as import('@/lib/rag/live-api-types').ConnectionState,
            voiceMicrophoneEnabled: false,
            voiceIsDesktop: true, // Default to desktop, will detect on mount
            voiceVolumeLevel: 0,
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
                    // const chunks: ChunkMetadata[] = [];

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

            getChunksForSource: (_sourceId: string) => {
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

            generateEmbeddings: async (chunks, _options) => {
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
                    const embeddings = new Map<string, import('@/lib/rag/types').EmbeddingVector>();
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

            performSearch: async (query: string, mode?: import('@/lib/rag/types').SearchMode, _limit?: number) => {
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

                    // Perform search (limit parameter ignored for now, could be used in future)
                    const results = await retriever.search(query);

                    set({
                        searchResults: results,
                        searchMode: mode || get().searchMode,
                        loading: false,
                    });

                    console.log(`[RAGStore] Search complete: ${results.length} results via ${mode || get().searchMode}`);
                } catch (error) {
                    set({
                        error: (error as Error).message,
                        searchResults: [],
                        loading: false,
                    });
                }
            },

            setSearchMode: (mode: import('@/lib/rag/types').SearchMode) => {
                set({ searchMode: mode });
            },

            setSearchQuery: (query: string) => {
                set({ searchQuery: query });
            },

            clearSearchResults: () => {
                set({
                    searchQuery: '',
                    searchResults: [],
                });
            },

            sendMessage: async (message: string, _projectId: string) => {
                // Delegate to existing sendRAGMessage implementation
                await get().sendRAGMessage(message);
            },

            clearChat: () => {
                // Delegate to existing clearChatHistory implementation
                get().clearChatHistory();
            },

            selectCitation: (citationId: string) => {
                const { citations } = get();
                const citation = citations.get(citationId);
                if (citation) {
                    set({ activeCitation: citation });
                }
            },

            // RAG Chat actions (Story 7-5)
            sendRAGMessage: async (query: string) => {
                const { HybridRetriever } = await import('../rag/hybrid-retriever');
                const { createEmbeddingService } = await import('../rag/embedding-service');
                const { loadOrCreateIndex } = await import('../rag/orama-index');
                const { formatCitations, buildContext, buildPrompt, createCitationsMap } = await import('../rag/citation-formatter');
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

                    // Step 3: Build context and prompt
                    const context = buildContext(results, query);
                    const ragSystemPrompt = buildPrompt(context, query);

                    // Step 4: Add user message immediately
                    const userMessage: ChatMessage = {
                        role: 'user',
                        content: query,
                        timestamp: Date.now(),
                    };

                    set({
                        chatMessages: [...get().chatMessages, userMessage],
                    });

                    // Step 5: Generate assistant response using TanStack AI
                    // Get provider config from credential vault
                    const providerId = 'openrouter'; // Default provider
                    const modelId = 'mistralai/devstral-2512:free'; // Free model
                    const providerApiKey = vault.getCredential('openrouter')?.apiKey || apiKey;

                    if (!providerApiKey) {
                        throw new Error('No API key found. Please configure your API key in settings.');
                    }

                    // Create connection using TanStack AI's fetchServerSentEvents
                    const connection = fetchServerSentEvents('/api/chat', () => ({
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            providerId,
                            modelId,
                            apiKey: providerApiKey,
                            // Pass RAG-augmented system prompt
                            systemPrompts: [
                                {
                                    role: 'system',
                                    content: ragSystemPrompt,
                                }
                            ],
                        },
                    }));

                    // Stream the response
                    let accumulatedResponse = '';

                    for await (const chunk of connection) {
                        const message = chunk as { type?: string; parts?: unknown[] };

                        // Handle text content parts
                        if (message.parts && Array.isArray(message.parts)) {
                            for (const part of message.parts) {
                                const p = part as { type?: string; content?: string };
                                if (p.type === 'text' && p.content) {
                                    accumulatedResponse += p.content;

                                    // Update assistant message incrementally
                                    const assistantMessage: ChatMessage = {
                                        role: 'assistant',
                                        content: accumulatedResponse,
                                        citations,
                                        timestamp: Date.now(),
                                    };

                                    set({
                                        chatMessages: [...get().chatMessages.slice(0, -1), assistantMessage],
                                    });
                                }
                            }
                        }

                        // Check if done
                        if (message.type === 'done') {
                            break;
                        }
                    }

                    // Final assistant message
                    const finalAssistantMessage: ChatMessage = {
                        role: 'assistant',
                        content: accumulatedResponse,
                        citations,
                        timestamp: Date.now(),
                    };

                    // Step 6: Update final state
                    set({
                        chatMessages: [...get().chatMessages.slice(0, -1), finalAssistantMessage],
                        citations: citationsMap,
                        loading: false,
                    });

                    console.log(`[RAGStore] RAG chat complete: ${results.length} sources, ${citations.length} citations, ${accumulatedResponse.length} chars`);

                    return finalAssistantMessage;
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
                    embeddingMode: 'keyword-only' as import('@/lib/rag/types').EmbeddingMode,
                    searchQuery: '',
                    searchResults: [],
                    searchMode: 'hybrid' as import('@/lib/rag/types').SearchMode,
                    chatMessages: [],
                    citations: new Map(),
                    activeCitation: null,
                    voiceState: 'idle' as import('@/lib/rag/live-api-types').VoiceModeState,
                    voiceConnection: {
                        state: 'disconnected',
                        retryCount: 0,
                    } as import('@/lib/rag/live-api-types').ConnectionState,
                    voiceMicrophoneEnabled: false,
                    voiceIsDesktop: true,
                    voiceVolumeLevel: 0,
                    loading: false,
                    error: null,
                });
            },

            // Voice Mode Actions (Story 10-1)

            startVoiceMode: async () => {
                const { getLiveApiWebSocketManager /*, getAudioCapture */, getAudioPlayback } = await import('@/lib/rag');
                const apiKey = 'YOUR_GEMINI_API_KEY'; // TODO: Get from credential vault

                // Check platform first
                const isDesktop = get().detectVoicePlatform();
                if (!isDesktop) {
                    set({
                        error: 'Voice chat available on desktop only',
                        voiceState: 'error',
                    });
                    return;
                }

                set({
                    voiceState: 'connecting',
                    loading: true,
                    error: null,
                });

                try {
                    // Initialize WebSocket manager
                    const wsManager = getLiveApiWebSocketManager({
                        apiKey,
                        onMessage: (message: any) => {
                            // Handle server audio chunks
                            if (message.serverContent?.parts) {
                                for (const part of message.serverContent.parts) {
                                    if (part.inline_data?.mime_type?.startsWith('audio/')) {
                                        const audioData = base64ToArrayBuffer(part.inline_data.data);
                                        const chunk = {
                                            data: new Float32Array(audioData),
                                            timestamp: Date.now(),
                                            index: 0,
                                        };
                                        getAudioPlayback().addChunk(chunk);
                                    }
                                }
                            }
                        },
                        onStateChange: (state: any) => {
                            get().setVoiceConnectionState(state);
                        },
                        onError: (error: any) => {
                            set({
                                error: error.message,
                                voiceState: 'error',
                            });
                        },
                    });

                    await wsManager.connect();

                    // Initialize audio capture and playback
                    /*
                    const audioCapture = getAudioCapture({
                        onChunk: (chunk) => {
                            if (get().voiceMicrophoneEnabled) {
                                wsManager.sendAudioChunk(chunk);
                            }
                        },
                        onVolumeChange: (level) => {
                            get().setVoiceVolumeLevel(level);
                        },
                    });
                    */

                    const audioPlayback = getAudioPlayback();

                    await audioPlayback.initialize();

                    set({
                        voiceState: 'listening',
                        loading: false,
                    });

                } catch (error) {
                    set({
                        error: (error as Error).message,
                        voiceState: 'error',
                        loading: false,
                    });
                }
            },

            stopVoiceMode: () => {
                const { resetWebSocketManager, resetAudioCapture, resetAudioPlayback } = require('@/lib/rag');

                resetWebSocketManager();
                resetAudioCapture();
                resetAudioPlayback();

                set({
                    voiceState: 'idle',
                    voiceMicrophoneEnabled: false,
                    voiceVolumeLevel: 0,
                    voiceConnection: {
                        state: 'disconnected',
                        retryCount: 0,
                    },
                });
            },

            toggleVoiceMicrophone: () => {
                const { voiceMicrophoneEnabled, voiceState } = get();

                if (!voiceMicrophoneEnabled && voiceState === 'listening') {
                    // Enable microphone
                    set({ voiceMicrophoneEnabled: true, voiceState: 'listening' });
                } else if (voiceMicrophoneEnabled) {
                    // Disable microphone
                    set({ voiceMicrophoneEnabled: false, voiceState: 'idle' });
                }
            },

            setVoiceState: (state: import('@/lib/rag/live-api-types').VoiceModeState) => {
                set({ voiceState: state });
            },

            setVoiceConnectionState: (state: import('@/lib/rag/live-api-types').ConnectionState) => {
                set({ voiceConnection: state });

                // Update voice state based on connection state
                if (state.state === 'connected') {
                    set({ voiceState: 'listening' });
                } else if (state.state === 'error') {
                    set({ voiceState: 'error' });
                }
            },

            setVoiceVolumeLevel: (level: number) => {
                set({ voiceVolumeLevel: Math.max(0, Math.min(1, level)) });
            },

            detectVoicePlatform: () => {
                // User-Agent detection
                const userAgent = navigator.userAgent;
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

                // Screen width detection (mobile < 768px)
                const screenWidth = window.innerWidth;
                const isMobileByWidth = screenWidth < 768;

                const isDesktop = !isMobile && !isMobileByWidth;

                set({ voiceIsDesktop: isDesktop });

                return isDesktop;
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
                // Voice mode state (Story 10-1)
                voiceState: state.voiceState,
                voiceConnection: state.voiceConnection,
                voiceMicrophoneEnabled: state.voiceMicrophoneEnabled,
                voiceIsDesktop: state.voiceIsDesktop,
                voiceVolumeLevel: state.voiceVolumeLevel,
                error: state.error,
            }),

            // Rehydrate and convert array back to Map
            onRehydrateStorage: () => (state) => {
                console.log('[RAGStore] Rehydrated from IndexedDB');

                if (state) {
                    // Convert array back to Map
                    state.searchCache = new Map(state.searchCache as unknown as [string, CachedSearchResult][]);
                    state.chunkingProgress = new Map(state.chunkingProgress as unknown as [string, ChunkingProgress][]);
                    state.embeddingProgress = new Map(
                        state.embeddingProgress as unknown as [string, import('@/lib/rag/types').EmbeddingProgress][]
                    );
                    // Chat state (Story 7-5) - Convert citations array back to Map
                    if (!Array.isArray(state.citations) && !(state.citations instanceof Map)) {
                        state.citations = new Map();
                    } else if (Array.isArray(state.citations)) {
                        state.citations = new Map(state.citations as unknown as [string, Citation][]);
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
