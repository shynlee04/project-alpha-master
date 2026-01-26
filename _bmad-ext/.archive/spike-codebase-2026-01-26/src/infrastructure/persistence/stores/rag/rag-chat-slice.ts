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
    set((state) => {
      return {
        chatMessages: state.chatMessages.map(msg =>
          msg.timestamp && msg.timestamp.toString() === messageId ? { ...msg, ...updates } : msg
        ),
      } as Partial<RAGChatState>;
    });
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

  /**
   * Alias for clearChatMessages - matches component API
   */
  clearChat: () => {
    set({ chatMessages: [] } as Partial<RAGChatState>);
  },

  /**
   * Composed message operation - wrapper for business logic
   * Handles adding user message and triggering AI response
   */
  sendMessage: async (_content: string, _projectId: string) => {
    const message: ChatMessage = {
      role: 'user',
      content: _content,
      timestamp: Date.now(),
    };

    get().addChatMessage(message);

    // TODO: Trigger AI response with RAG context
    // This will be implemented by the chat service layer
  },

  /**
   * Select citation for display - wrapper for setActiveCitation
   */
  selectCitation: (citationId: string) => {
    get().setActiveCitation(citationId);
  },

  clearCitations: () => {
    set({ citations: new Map(), activeCitation: null } as Partial<RAGChatState>);
  },
});
