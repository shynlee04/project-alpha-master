/**
 * @fileoverview RAG Chat Slice - Chat Messages & Citations
 * @module infrastructure/persistence/stores/rag/rag-chat-slice
 * @governance EPIC-7-1
 *
 * Manages RAG-powered chat messages with source citations.
 * Tracks active citation for UI highlighting and navigation.
 */

import { StateCreator } from 'zustand';
import type { ChatMessage, Citation } from '@/lib/rag/types';
import type { RAGChatState } from './rag-types';

/**
 * Chat slice - manages chat messages and citations
 */
export const createRAGChatSlice: StateCreator<RAGChatState> = (set, get) => ({
  // Initial state
  chatMessages: [],
  citations: new Map(),
  activeCitation: null,

  // Actions

  addChatMessage: (message: ChatMessage) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    } as Partial<RAGChatState>));
  },

  updateChatMessage: (messageId: string, updates: Partial<ChatMessage>) => {
    set((state) => ({
      chatMessages: state.chatMessages.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    } as Partial<RAGChatState>);
  },

  clearChatMessages: () => {
    set({ chatMessages: [] } as Partial<RAGChatState>);
  },

  addCitation: (messageId: string, citation: Citation) => {
    set((state) => {
      const newCitations = new Map(state.citations);
      const existing = newCitations.get(messageId) || [];
      newCitations.set(messageId, [...existing, citation]);
      return { citations: newCitations } as Partial<RAGChatState>;
    });
  },

  setActiveCitation: (citationId: string | null) => {
    console.log('[RAGChatSlice] Active citation:', citationId);
    set({ activeCitation: citationId } as Partial<RAGChatState>);
  },

  clearCitations: () => {
    set({ citations: new Map(), activeCitation: null } as Partial<RAGChatState>);
  },
});
