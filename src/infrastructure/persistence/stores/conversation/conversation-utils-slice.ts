import { StateCreator } from 'zustand';
import type { ConversationMetadataWithId } from './conversation-metadata-slice';
import type { ThreadWithId } from './thread-management-slice';
import type { MessageWithId } from './message-crud-slice';
import type { CombinedConversationState } from './types';

export interface ConversationStats {
  messageCount: number;
  threadCount: number;
  totalTokens: number;
  durationMs: number;
}

type ConversationUtilsSliceMethods = {
  filterConversations: (predicate: (conv: ConversationMetadataWithId) => boolean) => ConversationMetadataWithId[];
  sortConversations: (comparator: (a: ConversationMetadataWithId, b: ConversationMetadataWithId) => number) => ConversationMetadataWithId[];
  searchConversations: (query: string) => ConversationMetadataWithId[];
  searchConversationsByTag: (tags: string[]) => ConversationMetadataWithId[];
  getConversationStats: (conversationId: string) => ConversationStats;
  getRecentConversations: (limit?: number) => ConversationMetadataWithId[];
};

export const createConversationUtilsSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ConversationUtilsSliceMethods
> = (set, get) => ({
  filterConversations: (predicate) =>
    get().getAllConversations().filter(predicate),

  sortConversations: (comparator) =>
    [...get().getAllConversations()].sort(comparator),

  searchConversations: (query) => {
    const q = query.toLowerCase();
    return get().getAllConversations().filter((c) =>
      c.title?.toLowerCase().includes(q) || c.tags?.some((t) => t.toLowerCase().includes(q))
    );
  },

  searchConversationsByTag: (tags) =>
    get().getAllConversations().filter((c) =>
      tags.some((tag) => c.tags?.includes(tag))
    ),

  getConversationStats: (conversationId) => {
    const conversations = get().conversations;
    const conv = conversations[conversationId] as ConversationMetadataWithId;
    if (!conv) return { messageCount: 0, threadCount: 0, totalTokens: 0, durationMs: 0 };

    const threads = Object.values(get().threads).filter((t) => t.status !== 'deleted') as ThreadWithId[];
    const convThreads = threads.filter((t) => t.conversationId === conversationId);
    const messages = Object.values(get().messages) as MessageWithId[];
    const convMessages = messages.filter((m) => convThreads.some((t) => t.id === m.threadId));

    const messageCount = convMessages.length;
    const totalTokens = convMessages.reduce((sum, m) => sum + m.content.length, 0); // Approximate
    const firstMsg = convMessages[0];
    const lastMsg = convMessages[convMessages.length - 1];
    const durationMs = firstMsg && lastMsg ? lastMsg.timestamp - firstMsg.timestamp : 0;

    return { messageCount, threadCount: convThreads.length, totalTokens, durationMs };
  },

  getRecentConversations: (limit = 10) =>
    [...get().getAllConversations()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit),
});
