import { StateCreator } from 'zustand';
import type { CombinedConversationState, ConversationMetadataWithId, ThreadWithId, MessageWithId } from './types';

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
  loadConversation: (conversationId: string) => Promise<void>; // Story 51-3: Load conversation from Dexie
  loadConversationByProject: (projectId: string) => Promise<void>; // Story 51-3: Load most recent conversation for project
};

export const createConversationUtilsSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ConversationUtilsSliceMethods
> = (_set, get) => ({
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

  loadConversation: async (conversationId: string) => {
    // Load conversation from Dexie and populate store (Story 51-3)
    const conversation = get().getConversation(conversationId);
    if (!conversation) {
      console.warn(`[ConversationUtils] Conversation ${conversationId} not found`);
      return;
    }

    // Set as active conversation
    get().setActiveConversation(conversationId);

    // Load threads for this conversation
    const threads = get().getThreadsByConversation(conversationId);
    if (threads.length > 0) {
      // Set root thread as active
      const rootThread = threads.find(t => t.isRoot) || threads[0];
      get().setActiveThread(rootThread.id);
    }
  },

  loadConversationByProject: async (projectId: string) => {
    // Load most recent conversation for a project (Story 51-3)
    const conversations = get().getConversationsByProject(projectId);
    if (conversations.length === 0) {
      console.warn(`[ConversationUtils] No conversations found for project ${projectId}`);
      return;
    }

    // Get most recent conversation by updatedAt
    const mostRecent = conversations.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    await get().loadConversation(mostRecent.id);
  },
});
