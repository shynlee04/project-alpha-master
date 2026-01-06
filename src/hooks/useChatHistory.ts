/**
 * @fileoverview Chat History Hook
 * @module hooks/useChatHistory
 *
 * Provides chat history functionality including:
 * - Conversation CRUD operations
 * - Message search with filters
 * - Conversation metadata management (tags, favorites, archive)
 * - Title generation
 */

import { useCallback } from 'react';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { generateTitleFromMessages } from '@/lib/chat/title-generator';
import { type MessageSearchFilters, type MessageSearchResult } from '@/lib/chat/message-search';
import type { ConversationMetadataWithId, ThreadMessage } from '@/infrastructure/persistence/stores/conversation/types';

/**
 * Chat history hook return type
 */
export interface UseChatHistoryReturn {
  /** All conversations */
  conversations: ConversationMetadataWithId[];

  /** Active conversation ID */
  activeConversationId: string | null;

  /** Create new conversation */
  createConversation: (workspaceType: string, projectId: string | null, agentId: string) => string;

  /** Delete conversation */
  deleteConversation: (conversationId: string) => void;

  /** Update conversation metadata */
  updateConversation: (conversationId: string, updates: Partial<ConversationMetadataWithId>) => void;

  /** Set active conversation */
  setActiveConversation: (conversationId: string) => void;

  /** Archive conversation */
  archiveConversation: (conversationId: string) => void;

  /** Unarchive conversation */
  unarchiveConversation: (conversationId: string) => void;

  /** Toggle favorite (pinned) status */
  toggleFavorite: (conversationId: string) => void;

  /** Add tag to conversation */
  addTag: (conversationId: string, tag: string) => void;

  /** Remove tag from conversation */
  removeTag: (conversationId: string, tag: string) => void;

  /** Search conversations */
  searchConversations: (query: string) => ConversationMetadataWithId[];

  /** Search messages */
  searchMessages: (filters: MessageSearchFilters & { conversationMessages: Record<string, ThreadMessage[]> }) => MessageSearchResult[];

  /** Get conversations by tag */
  getConversationsByTag: (tag: string) => ConversationMetadataWithId[];

  /** Get favorite conversations */
  getFavoriteConversations: () => ConversationMetadataWithId[];

  /** Get archived conversations */
  getArchivedConversations: () => ConversationMetadataWithId[];

  /** Generate title from messages */
  generateTitle: (messages: Array<{ role: string; content: string }>) => string;

  /** Get active conversation */
  getActiveConversation: () => ConversationMetadataWithId | null;
}

/**
 * Chat history hook
 *
 * Provides unified interface for chat history management.
 *
 * @example
 * ```tsx
 * const { conversations, createConversation, deleteConversation, searchConversations } = useChatHistory();
 *
 * // Create new conversation
 * const conversationId = createConversation('ide', 'project-123', 'agent-456');
 *
 * // Search conversations
 * const results = searchConversations('typescript');
 * ```
 */
export function useChatHistory(): UseChatHistoryReturn {
  // Use individual selectors to prevent infinite re-renders (Zustand v5 pattern)
  const conversations = useConversationStore((s) => s.getAllConversations());
  const activeConversationId = useConversationStore((s) => s.activeConversationId);

  const createConversation = useConversationStore((s) => s.createConversation);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const updateConversationMetadata = useConversationStore((s) => s.updateConversationMetadata);
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation);
  const searchConversationsStore = useConversationStore((s) => s.searchConversations);
  const getConversationsByTagStore = useConversationStore((s) => s.searchConversationsByTag);
  const getConversation = useConversationStore((s) => s.getConversation);

  /**
   * Archive a conversation
   */
  const archiveConversation = useCallback((conversationId: string) => {
    updateConversationMetadata(conversationId, { status: 'archived' });
  }, [updateConversationMetadata]);

  /**
   * Unarchive a conversation
   */
  const unarchiveConversation = useCallback((conversationId: string) => {
    updateConversationMetadata(conversationId, { status: 'active' });
  }, [updateConversationMetadata]);

  /**
   * Toggle favorite (pinned) status
   */
  const toggleFavorite = useCallback((conversationId: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    const currentPinned = conversation.pinned || false;
    updateConversationMetadata(conversationId, { pinned: !currentPinned });
  }, [getConversation, updateConversationMetadata]);

  /**
   * Add tag to conversation
   */
  const addTag = useCallback((conversationId: string, tag: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    const currentTags = conversation.tags || [];
    if (currentTags.includes(tag)) return; // Don't duplicate

    updateConversationMetadata(conversationId, {
      tags: [...currentTags, tag],
    });
  }, [getConversation, updateConversationMetadata]);

  /**
   * Remove tag from conversation
   */
  const removeTag = useCallback((conversationId: string, tag: string) => {
    const conversation = getConversation(conversationId);
    if (!conversation) return;

    const currentTags = conversation.tags || [];
    updateConversationMetadata(conversationId, {
      tags: currentTags.filter((t) => t !== tag),
    });
  }, [getConversation, updateConversationMetadata]);

  /**
   * Search conversations with query
   */
  const searchConversations = useCallback((query: string) => {
    return searchConversationsStore(query);
  }, [searchConversationsStore]);

  /**
   * Search messages with filters
   */
  const searchMessages = useCallback((filters: MessageSearchFilters & { conversationMessages: Record<string, ThreadMessage[]> }) => {
    const { conversationMessages, ...searchFilters } = filters;
    const results: MessageSearchResult[] = [];

    for (const [conversationId, messages] of Object.entries(conversationMessages)) {
      // Create a simple thread ID (in real implementation, this would come from thread store)
      const threadId = conversationId;
      const conversationResults = searchMessages({
        conversationMessages: { [conversationId]: messages },
        ...searchFilters
      });
      results.push(...conversationResults);
    }

    return results.sort((a, b) => b.score - a.score);
  }, []);

  /**
   * Get conversations by tag
   */
  const getConversationsByTag = useCallback((tag: string) => {
    return getConversationsByTagStore([tag]);
  }, [getConversationsByTagStore]);

  /**
   * Get favorite conversations
   */
  const getFavoriteConversations = useCallback(() => {
    return conversations.filter((c) => c.pinned === true && c.status === 'active');
  }, [conversations]);

  /**
   * Get archived conversations
   */
  const getArchivedConversations = useCallback(() => {
    return conversations.filter((c) => c.status === 'archived');
  }, [conversations]);

  /**
   * Generate title from messages
   */
  const generateTitle = useCallback((messages: Array<{ role: string; content: string }>) => {
    return generateTitleFromMessages(messages);
  }, []);

  /**
   * Get active conversation
   */
  const getActiveConversation = useCallback(() => {
    if (!activeConversationId) return null;
    return getConversation(activeConversationId) || null;
  }, [activeConversationId, getConversation]);

  return {
    conversations,
    activeConversationId,
    createConversation,
    deleteConversation,
    updateConversation: updateConversationMetadata,
    setActiveConversation,
    archiveConversation,
    unarchiveConversation,
    toggleFavorite,
    addTag,
    removeTag,
    searchConversations,
    searchMessages,
    getConversationsByTag,
    getFavoriteConversations,
    getArchivedConversations,
    generateTitle,
    getActiveConversation,
  };
}
