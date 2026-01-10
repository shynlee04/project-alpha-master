/**
 * @fileoverview Unified Chat Store
 * @module infrastructure/persistence/stores/chat
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Unified chat store combining hierarchical thread management from System A
 * with tool execution capabilities from System B.
 *
 * Composed from 5 focused slices:
 * - chat-metadata-slice: Conversation CRUD operations
 * - thread-management-slice: Thread hierarchy and lifecycle
 * - message-crud-slice: Message operations within threads
 * - tool-execution-slice: Tool call tracking and approvals
 * - context-window-slice: Context window management (MM-09)
 *
 * @story MM-01: Create Unified Chat Store
 * @updated MM-09: Added context window slice
 * @created 2026-01-10
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CombinedUnifiedChatState } from './unified-chat-types';
import type { ConversationState } from '@/domain/entities/chat';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
import { getDb } from '@/infrastructure/persistence/dexie-db';

// Import slices
import { createChatMetadataSlice } from './slices/chat-metadata-slice';
import { createThreadManagementSlice } from './slices/thread-management-slice';
import { createMessageCrudSlice } from './slices/message-crud-slice';
import { createToolExecutionSlice } from './slices/tool-execution-slice';
import { createContextWindowSlice } from './slices/context-window-slice';

// Re-export types for consumers
export type { CombinedUnifiedChatState } from './unified-chat-types';
export type {
  ChatConversation,
  ChatMessage,
  ChatThread,
  ToolCall,
  ToolApproval,
  ThreadHierarchyNode,
  ContextWindowConfig,
  ConversationState,
  WorkspaceType,
  MessageRole,
  ToolCallStatus,
  ToolApprovalStatus,
} from '@/domain/entities/chat';

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
          console.warn('[UnifiedChatStore] Database not available during SSR');
          return;
        }

        const table = database.conversationState;
        if (!table) return;

        await table.put({
          id: conversationState.metadata.id,
          state: conversationState,
          updatedAt: new Date(),
        });

        console.log('[UnifiedChatStore] Persisted conversation:', conversationState.metadata.id);
      } catch (error) {
        console.error('[UnifiedChatStore] Failed to persist:', error);
      }
    }, delay);
  };
}

/**
 * Unified Chat Store
 *
 * Combines all slices into a single Zustand store with Dexie persistence.
 *
 * Persistence Configuration:
 * - Storage: DexieIndexedDB via createDexieStorage
 * - Partialize: Conversations, threads, messages, tool calls, approvals
 * - Excluded: Ephemeral UI state
 */
export const useUnifiedChatStore = create<CombinedUnifiedChatState>()(
  persist(
    (...a) => {
      // Create debounced persist function (500ms delay)
      const debouncedPersist = createDebouncedPersist(500);

      return {
        // ========== Chat Metadata Slice ==========
        ...createChatMetadataSlice(...a),

        // ========== Thread Management Slice ==========
        ...createThreadManagementSlice(...a),

        // ========== Message CRUD Slice ==========
        ...createMessageCrudSlice(...a),

        // ========== Tool Execution Slice ==========
        ...createToolExecutionSlice(...a),

        // ========== Context Window Slice (MM-09) ==========
        ...createContextWindowSlice(...a),

        // ========== Persistence Methods ==========
        /**
         * Auto-persist current conversation to IndexedDB (debounced 500ms)
         * Ensures conversations survive workspace switches and page refreshes
         */
        persistConversation: async () => {
          const get = a[0] as () => CombinedUnifiedChatState;
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
          const get = a[0] as () => CombinedUnifiedChatState;
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
              workspaceId: conversation.workspaceType,
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
         * Restores conversation, threads, and messages into the store
         */
        loadConversation: async (conversationId: string): Promise<void> => {
          try {
            const database = getDb();
            if (!database) {
              console.warn('[UnifiedChatStore] Database not available during SSR');
              return;
            }

            const table = database.conversationState;
            if (!table) return;

            const record = await table.get(conversationId);
            if (!record) {
              console.warn('[UnifiedChatStore] Conversation not found:', conversationId);
              return;
            }

            const state = record.state as ConversationState;
            const set = a[1] as (partial: Partial<CombinedUnifiedChatState> | ((s: CombinedUnifiedChatState) => CombinedUnifiedChatState)) => void;

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
            const get = a[0] as () => CombinedUnifiedChatState;

            // Restore messages
            for (const msg of state.messages) {
              // Find or create thread for message
              // For now, use a default thread - this will be improved in MM-02
              const threadId = `${conversationId}_main`;
              const existingThread = Object.values(get().threads).find(
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
                      workspaceId: state.metadata.workspaceType,
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

            console.log('[UnifiedChatStore] Loaded conversation:', conversationId);
          } catch (error) {
            console.error('[UnifiedChatStore] Failed to load conversation:', error);
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
              console.warn('[UnifiedChatStore] Database not available during SSR');
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
              const get = a[0] as () => CombinedUnifiedChatState;
              await get().loadConversation(records[0].id);
            }
          } catch (error) {
            console.error('[UnifiedChatStore] Failed to load by project:', error);
          }
        },

        // ========== Hydration State ==========
        _hasHydrated: false,
      };
    },
    {
      name: 'unified-chat-store',
      storage: createJSONStorage(() => createDexieStorage('conversationState')),
      version: 1,

      // Partialize: Only persist core data, exclude ephemeral state
      partialize: (state: CombinedUnifiedChatState) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activeProjectConversationIds: state.activeProjectConversationIds,
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        messages: state.messages,
        toolCalls: state.toolCalls,
        approvalHistory: state.approvalHistory,
      }),

      // Hydration callback
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        console.log('[UnifiedChatStore] Hydrated from IndexedDB', {
          conversations: Object.keys(state.conversations).length,
          threads: Object.keys(state.threads).length,
          messages: Object.keys(state.messages).length,
          activeConversationId: state.activeConversationId,
        });

        state._hasHydrated = true;
      },
    }
  )
);

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get active conversation
 */
export function useActiveChatConversation() {
  return useUnifiedChatStore((state) => {
    if (!state.activeConversationId) return null;
    return state.conversations[state.activeConversationId] || null;
  });
}

/**
 * Hook to get active thread
 */
export function useActiveChatThread() {
  return useUnifiedChatStore((state) => {
    if (!state.activeThreadId) return null;
    return state.threads[state.activeThreadId] || null;
  });
}

/**
 * Hook to get messages for active thread
 */
export function useActiveThreadMessages() {
  return useUnifiedChatStore((state) => {
    if (!state.activeThreadId) return [];
    return Object.values(state.messages)
      .filter((m) => m.threadId === state.activeThreadId)
      .sort((a, b) => a.timestamp - b.timestamp);
  });
}

/**
 * Hook to get pending tool approvals
 */
export function usePendingToolApprovals() {
  return useUnifiedChatStore((state) => state.pendingApprovals);
}

/**
 * Hook for hydration status
 */
export function useUnifiedChatHasHydrated() {
  return useUnifiedChatStore((state) => state._hasHydrated);
}

/**
 * Hook to get context usage for active thread (MM-09)
 */
export function useContextUsage() {
  const activeThreadId = useUnifiedChatStore((state) => state.activeThreadId);
  const getContextUsage = useUnifiedChatStore((state) => state.getContextUsage);
  return activeThreadId ? getContextUsage(activeThreadId) : null;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get current store state (outside of React)
 */
export function getUnifiedChatStoreState() {
  return useUnifiedChatStore.getState();
}

/**
 * Subscribe to store changes (outside of React)
 */
export function subscribeToUnifiedChatStore(
  listener: (state: CombinedUnifiedChatState) => void
) {
  return useUnifiedChatStore.subscribe(listener);
}
