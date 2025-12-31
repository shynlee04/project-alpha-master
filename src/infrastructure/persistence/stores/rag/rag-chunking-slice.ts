/**
 * @fileoverview RAG Chunking Slice - Document Chunking Progress
 * @module infrastructure/persistence/stores/rag/rag-chunking-slice
 * @governance EPIC-7-1
 *
 * Manages document chunking progress and embedding mode.
 * Tracks chunking status per document with progress percentages.
 */

import { StateCreator } from 'zustand';
import type { ChunkingProgress } from '@/lib/rag/types';
import type { RAGChunkingState } from './rag-types';

/**
 * Chunking slice - manages chunking progress and embedding mode
 */
export const createRAGChunkingSlice: StateCreator<RAGChunkingState> = (set, get) => ({
  // Initial state
  chunkingProgress: new Map(),
  embeddingProgress: new Map(),
  embeddingMode: 'keyword-only',

  // Actions

  setEmbeddingMode: (mode: import('@/lib/rag/types').EmbeddingMode) => {
    console.log('[RAGChunkingSlice] Setting embedding mode:', mode);
    set({ embeddingMode: mode } as Partial<RAGChunkingState>);
  },

  /**
   * Update chunking progress for a specific document
   */
  updateChunkingProgress: (documentId: string, progress: ChunkingProgress) => {
    set((state) => {
      const newProgress = new Map(state.chunkingProgress);
      newProgress.set(documentId, progress);
      console.log(`[RAGChunkingSlice] Chunking progress: ${documentId} - ${progress.percentage}%`);
      return { chunkingProgress: newProgress } as Partial<RAGChunkingState>;
    });
  },

  /**
   * Update embedding progress for a specific document
   */
  updateEmbeddingProgress: (documentId: string, progress: number) => {
    set((state) => {
      const newProgress = new Map(state.embeddingProgress);
      newProgress.set(documentId, progress);
      return { embeddingProgress: newProgress } as Partial<RAGChunkingState>;
    });
  },

  /**
   * Remove chunking progress for completed/failed documents
   */
  removeChunkingProgress: (documentId: string) => {
    set((state) => {
      const newChunking = new Map(state.chunkingProgress);
      const newEmbedding = new Map(state.embeddingProgress);
      newChunking.delete(documentId);
      newEmbedding.delete(documentId);
      return {
        chunkingProgress: newChunking,
        embeddingProgress: newEmbedding,
      } as Partial<RAGChunkingState>;
    });
  },

  /**
   * Clear all progress (e.g., on project switch)
   */
  clearProgress: () => {
    set({
      chunkingProgress: new Map(),
      embeddingProgress: new Map(),
    } as Partial<RAGChunkingState>);
  },
});
