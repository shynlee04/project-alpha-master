/**
 * @fileoverview Chat Persistence Slice
 * @module infrastructure/persistence/stores/chat/slices
 * @governance EPIC-CC-11 CC-11-01 | ADR-033 ADR-035
 *
 * Extracted from unified-chat-store.ts (448 lines → 120 lines slice)
 * Handles conversation state persistence via Dexie/IndexedDB.
 *
 * Responsibilities:
 * - persistConversation: Auto-save to IndexedDB (debounced 500ms)
 * - getCurrentConversation: Aggregate state for persistence
 * - loadConversation: Restore from IndexedDB by ID
 * - loadConversationByProject: Load most recent conversation for project
 *
 * @story CC-11-01: Extract Chat Persistence Slice
 * @created 2026-01-22
 */

import type { StateCreator } from 'zustand';
import type { CombinedUnifiedChatState } from '../unified-chat-types';
import type { ConversationState } from '@/domain/entities/chat';
import { getDb } from '@/infrastructure/persistence/dexie-db';

/**
 * Chat persistence slice actions
 */
export interface ChatPersistenceSliceActions {
  /** Auto-persist current conversation to IndexedDB (debounced 500ms) */
  persistConversation: () => Promise<void>;

  /** Get current conversation state for persistence */
  getCurrentConversation: () => ConversationState | null;

  /** Load conversation from IndexedDB by ID */
  loadConversation: (conversationId: string) => Promise<void>;

  /** Load most recent conversation for a project */
  loadConversationByProject: (projectId: string) => Promise<void>;
}

/**
 * Debounced persist function for conversation state
 * Prevents excessive IndexedDB writes during rapid updates
 *
 * CA-002 FIX: Uses getDb() instead of unsafe type assertion
 */
function createDebouncedPersist(delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return async (conversationState: ConversationState): Promise<void> => {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {
      try {
        const database = getDb();
        if (!database) {
          console.warn('[ChatPersistenceSlice] Database not available during SSR');
          return;
        }

        const table = database.conversationState;
        if (!table) return;

        await table.put({
          id: conversationState.metadata.id,
          state: conversationState,
          updatedAt: new Date(),
        });

        console.log('[ChatPersistenceSlice] Persisted conversation:', conversationState.metadata.id);
      } catch (error) {
        console.error('[ChatPersistenceSlice] Failed to persist:', error);
      }
    }, delay);
  };
}

/**
 * Create chat persistence slice
 */
export const createChatPersistenceSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  ChatPersistenceSliceActions
> = (set, get) => {
  // Create debounced persist function (500ms delay)
  const debouncedPersist = createDebouncedPersist(500);

  return {
    // ========== Persistence Methods ==========

    /**
     * Auto-persist current conversation to IndexedDB (debounced 500ms)
     * Ensures conversations survive workspace switches and page refreshes
     */
    persistConversation: async () => {
      const conversation = get().getCurrentConversation();
      if (conversation) {
        await debouncedPersist(conversation);
      }
    },

    /**
     * Get current conversation state for persistence
     * Aggregates metadata, threads, and messages into a single ConversationState
     */
    getCurrentConversation: (): ConversationState | null => {
      const { activeConversationId, conversations, threads, messages } = get();

      if (!activeConversationId) return null;

      const conversation = conversations[activeConversationId];
      if (!conversation) return null;

      // Get all threads for this conversation (with null check for SSR safety)
      const conversationThreads = Object.values(threads ?? {}).filter(
        (t) => t.conversationId === activeConversationId && t.status !== 'deleted'
      );

      // Get all messages for these threads (with null check for SSR safety)
      const conversationMessages = Object.values(messages ?? {}).filter((m) =>
        conversationThreads.some((t) => t.id === m.threadId)
      );

      return {
        metadata: {
          id: conversation.id,
          projectId: conversation.projectId || '',
          workspaceType: conversation.workspaceType,
          title: conversation.title || 'New Chat',
          preview: conversation.preview || '',
          agentId: conversation.agentId,
          messageCount: conversationMessages.length,
          scrollPosition: conversation.scrollPosition || 0,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        messages: conversationMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agentId: m.agentId,
          agentName: m.agentName,
          agentModel: m.agentModel,
          timestamp: m.timestamp,
          threadId: m.threadId,
          toolCalls: m.toolCalls?.map((tc) => ({
            id: tc.id,
            name: tc.name,
            status: tc.status,
            input: tc.input,
            output: tc.output,
            duration: tc.duration,
            createdAt: tc.createdAt,
          })),
        })),
      };
    },

    /**
     * Load conversation from IndexedDB by ID
     * Restores conversation, threads, and messages into store
     */
    loadConversation: async (conversationId: string): Promise<void> => {
      try {
        const database = getDb();
        if (!database) {
          console.warn('[ChatPersistenceSlice] Database not available during SSR');
          return;
        }

        const table = database.conversationState;
        if (!table) return;

        const record = await table.get(conversationId);
        if (!record) {
          console.warn('[ChatPersistenceSlice] Conversation not found:', conversationId);
          return;
        }

        const state = record.state as ConversationState;

        // Restore conversation metadata
        set((s: CombinedUnifiedChatState) => ({
          ...s,
          activeConversationId: state.metadata.id,
          conversations: {
            ...s.conversations,
            [state.metadata.id]: {
              id: state.metadata.id,
              workspaceType: state.metadata.workspaceType,
              projectId: state.metadata.projectId,
              agentId: state.metadata.agentId,
              title: state.metadata.title,
              preview: state.metadata.preview,
              messageCount: state.metadata.messageCount,
              scrollPosition: state.metadata.scrollPosition,
              status: 'active',
              createdAt: state.metadata.createdAt,
              updatedAt: state.metadata.updatedAt,
            },
          },
        }));

        // Get current state for thread creation
        const currentState = get();

        // Restore messages
        for (const msg of state.messages) {
          // Find or create thread for message
          // For now, use a default thread - this will be improved in MM-02
          const threadId = `${conversationId}_main`;
          const existingThread = Object.values(currentState.threads).find(
            (t) => t.id === threadId
          );

          if (!existingThread) {
            set((s: CombinedUnifiedChatState) => ({
              ...s,
              threads: {
                ...s.threads,
                [threadId]: {
                  id: threadId,
                  conversationId,
                  projectId: state.metadata.projectId || '',
                  workspaceType: state.metadata.workspaceType, // CHAT-024: Standardized naming
                  title: 'Main Thread',
                  preview: state.metadata.preview,
                  status: 'active',
                  isRoot: true,
                  createdAt: state.metadata.createdAt,
                  updatedAt: state.metadata.updatedAt,
                  messageCount: 0,
                },
              },
              activeThreadId: threadId,
            }));
          }

          set((s: CombinedUnifiedChatState) => ({
            ...s,
            messages: {
              ...s.messages,
              [msg.id]: {
                id: msg.id,
                role: msg.role,
                content: msg.content,
                agentId: msg.agentId,
                agentName: msg.agentName,
                agentModel: msg.agentModel,
                timestamp: msg.timestamp,
                threadId,
                toolCalls: msg.toolCalls,
              },
            },
          }));
        }

        console.log('[ChatPersistenceSlice] Loaded conversation:', conversationId);
      } catch (error) {
        console.error('[ChatPersistenceSlice] Failed to load conversation:', error);
      }
    },

    /**
     * Load most recent conversation for a project
     * Useful for project-based workspace switching
     */
    loadConversationByProject: async (projectId: string): Promise<void> => {
      try {
        const database = getDb();
        if (!database) {
          console.warn('[ChatPersistenceSlice] Database not available during SSR');
          return;
        }

        const table = database.conversationState;
        if (!table) return;

        // Find most recent conversation for this project
        const records = await table
          .toArray()
          .then((all) =>
            all
              .filter((r) => (r.state as ConversationState | undefined)?.metadata?.projectId === projectId)
              .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
              .slice(0, 1)
          );

        if (records.length > 0) {
          await get().loadConversation(records[0].id);
        }
      } catch (error) {
        console.error('[ChatPersistenceSlice] Failed to load by project:', error);
      }
    },
  };
};
