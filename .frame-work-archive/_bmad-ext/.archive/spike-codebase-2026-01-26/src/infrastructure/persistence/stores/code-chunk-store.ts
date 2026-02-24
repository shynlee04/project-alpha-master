/**
 * @fileoverview Code Chunk Store
 * @module infrastructure/persistence/stores/code-chunk-store
 * @governance EPIC-40 MM-10
 *
 * Manages code chunks extracted from messages for RAG indexing.
 * Persists chunk metadata and relationships.
 *
 * @story MM-10: Code-Aware Chunking
 * @created 2026-01-10
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CodeChunk, CodeChunkRelation } from '@/domain/entities/code-chunk';

/**
 * Code chunk store state
 */
export interface CodeChunkStoreState {
  // All chunks indexed by ID
  chunks: Record<string, CodeChunk>;
  // Chunks by message ID
  chunksByMessage: Record<string, string[]>;
  // Chunks by conversation
  chunksByConversation: Record<string, string[]>;
  // Chunk relationships
  relations: Record<string, CodeChunkRelation>;

  // Chunking methods
  addChunks: (chunks: CodeChunk[]) => void;
  removeChunks: (chunkIds: string[]) => void;
  getChunksByMessage: (messageId: string) => CodeChunk[];
  getChunksByConversation: (conversationId: string) => CodeChunk[];
  getChunksByLanguage: (language: string) => CodeChunk[];

  // Relation methods
  addRelation: (relation: Omit<CodeChunkRelation, 'id' | 'createdAt'>) => void;
  getRelatedChunks: (chunkId: string) => CodeChunk[];

  // Cleanup
  clearConversationChunks: (conversationId: string) => void;

  // Hydration
  _hasHydrated: boolean;
}

/**
 * Create code chunk store
 */
export const useCodeChunkStore = create<CodeChunkStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      chunks: {},
      chunksByMessage: {},
      chunksByConversation: {},
      relations: {},
      _hasHydrated: false,

      addChunks: (chunks: CodeChunk[]) => {
        set((state) => {
          const newChunks = { ...state.chunks };
          const newByMessage = { ...state.chunksByMessage };
          const newByConversation = { ...state.chunksByConversation };

          for (const chunk of chunks) {
            newChunks[chunk.id] = chunk;

            // Index by message
            if (!newByMessage[chunk.messageId]) {
              newByMessage[chunk.messageId] = [];
            }
            newByMessage[chunk.messageId].push(chunk.id);

            // Index by conversation
            if (!newByConversation[chunk.conversationId]) {
              newByConversation[chunk.conversationId] = [];
            }
            newByConversation[chunk.conversationId].push(chunk.id);
          }

          return {
            chunks: newChunks,
            chunksByMessage: newByMessage,
            chunksByConversation: newByConversation,
          };
        });
      },

      removeChunks: (chunkIds: string[]) => {
        set((state) => {
          const newChunks = { ...state.chunks };
          const newByMessage = { ...state.chunksByMessage };
          const newByConversation = { ...state.chunksByConversation };

          for (const chunkId of chunkIds) {
            const chunk = newChunks[chunkId];
            if (!chunk) continue;

            delete newChunks[chunkId];

            // Remove from message index
            if (newByMessage[chunk.messageId]) {
              newByMessage[chunk.messageId] = newByMessage[chunk.messageId].filter((id) => id !== chunkId);
            }

            // Remove from conversation index
            if (newByConversation[chunk.conversationId]) {
              newByConversation[chunk.conversationId] = newByConversation[chunk.conversationId].filter(
                (id) => id !== chunkId
              );
            }
          }

          return {
            chunks: newChunks,
            chunksByMessage: newByMessage,
            chunksByConversation: newByConversation,
          };
        });
      },

      getChunksByMessage: (messageId: string) => {
        const state = get();
        const chunkIds = state.chunksByMessage[messageId] || [];
        return chunkIds.map((id) => state.chunks[id]).filter((c): c is CodeChunk => !!c);
      },

      getChunksByConversation: (conversationId: string) => {
        const state = get();
        const chunkIds = state.chunksByConversation[conversationId] || [];
        return chunkIds.map((id) => state.chunks[id]).filter((c): c is CodeChunk => !!c);
      },

      getChunksByLanguage: (language: string) => {
        const state = get();
        return Object.values(state.chunks).filter((c) => c.language === language);
      },

      addRelation: (relation) => {
        const id = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => ({
          relations: {
            ...state.relations,
            [id]: {
              ...relation,
              id,
              createdAt: Date.now(),
            },
          },
        }));
      },

      getRelatedChunks: (chunkId: string) => {
        const state = get();
        const relations = Object.values(state.relations).filter(
          (r) => r.fromChunkId === chunkId || r.toChunkId === chunkId
        );

        const relatedIds = relations.flatMap((r) =>
          r.fromChunkId === chunkId ? [r.toChunkId] : [r.fromChunkId]
        );

        return relatedIds
          .map((id) => state.chunks[id])
          .filter((c): c is CodeChunk => !!c);
      },

      clearConversationChunks: (conversationId: string) => {
        const state = get();
        const chunkIds = state.chunksByConversation[conversationId] || [];
        get().removeChunks(chunkIds);

        set((state) => {
          const newByConversation = { ...state.chunksByConversation };
          delete newByConversation[conversationId];
          return { chunksByConversation: newByConversation };
        });
      },
    }),
    {
      name: 'code-chunk-store',
      version: 1,
      partialize: (state) => ({
        chunks: state.chunks,
        chunksByMessage: state.chunksByMessage,
        chunksByConversation: state.chunksByConversation,
        relations: state.relations,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state._hasHydrated = true;
      },
    }
  )
);

/**
 * Hook to check hydration status
 */
export function useCodeChunksHydrated(): boolean {
  return useCodeChunkStore((state) => state._hasHydrated);
}

/**
 * Hook to get chunks for active message
 */
export function useMessageCodeChunks(messageId: string) {
  return useCodeChunkStore((state) => state.getChunksByMessage(messageId));
}
