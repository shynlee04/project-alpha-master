/**
 * @fileoverview Backward Compatibility Facade for useConversationStore
 * @module infrastructure/persistence/stores/conversation
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Facade pattern to maintain backward compatibility while using unified chat store.
 * Delegates all calls to useUnifiedChatStore to ensure single source of truth.
 *
 * @story MM-01 Task T8: Add backward compatibility facade
 * @created 2026-01-10
 *
 * @migration-status TEMPORARY - Remove after MM-02 (Merge thread management)
 * @deprecation_planned 2026-02-01
 */

import { create } from 'zustand';
import { useUnifiedChatStore } from '@/infrastructure/persistence/stores/chat';
import type {
  ConversationWithId,
  ThreadWithId,
  MessageWithId,
} from '@/infrastructure/persistence/stores/chat/unified-chat-types';
import type {
  ConversationMetadataExtended,
  ThreadExtended,
  CombinedConversationState,
} from './types';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { ThreadMessage, ThreadToolCall } from './types';

// ============================================================================
// Type Mappers
// ============================================================================

/**
 * Map unified store conversation to legacy format
 */
function mapToLegacyConversation(conv: ConversationWithId): ConversationMetadataExtended {
  return {
    id: conv.id,
    workspaceType: conv.workspaceType,
    workspaceId: conv.workspaceType,
    projectId: conv.projectId,
    agentId: conv.agentId,
    status: conv.status,
    title: conv.title,
    preview: conv.preview,
    messageCount: conv.messageCount,
    scrollPosition: conv.scrollPosition,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    pinned: conv.pinned,
    tags: conv.tags,
  };
}

/**
 * Map unified store thread to legacy format
 * NOTE: Messages are computed lazily from the unified store's messages index
 * agentsUsed is derived from unique agentIds in the thread's messages
 */
function mapToLegacyThread(
  thread: ThreadWithId,
  messagesByThread: (threadId: string) => MessageWithId[]
): ThreadExtended {
  const threadMessages = messagesByThread(thread.id);
  const agentsUsed = Array.from(
    new Set(threadMessages.map((m) => m.agentId).filter((id): id is string => id != null))
  );

  // Filter out 'tool' role messages for legacy compatibility
  const legacyMessages: ThreadMessage[] = threadMessages
    .filter((m) => m.role !== 'tool')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      agentId: m.agentId,
      agentName: m.agentName,
      agentModel: m.agentModel,
      timestamp: m.timestamp,
      toolCalls: m.toolCalls?.map((tc): ThreadToolCall => ({
        id: tc.id,
        name: tc.name,
        status: tc.status as 'pending' | 'running' | 'success' | 'error',
        input: tc.input,
        output: tc.output,
        duration: tc.duration,
      })),
    }));

  return {
    id: thread.id,
    conversationId: thread.conversationId,
    projectId: thread.projectId,
    workspaceId: thread.workspaceId,
    title: thread.title,
    preview: thread.preview,
    messageCount: thread.messageCount,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    status: thread.status,
    parentThreadId: thread.parentThreadId,
    childThreadIds: thread.childThreadIds,
    isRoot: thread.isRoot,
    // ThreadExtended extends ConversationThread which requires these:
    messages: legacyMessages,
    agentsUsed,
  };
}

/**
 * Map unified store message to legacy format
 * Filters out 'tool' role messages which don't exist in legacy format
 */
function mapToLegacyMessage(msg: MessageWithId): ThreadMessage | null {
  // Legacy ThreadMessage.role doesn't support 'tool' role
  if (msg.role === 'tool') return null;

  return {
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    agentId: msg.agentId,
    agentName: msg.agentName,
    agentModel: msg.agentModel,
    timestamp: msg.timestamp,
    toolCalls: msg.toolCalls?.map((tc): ThreadToolCall => ({
      id: tc.id,
      name: tc.name,
      status: tc.status as 'pending' | 'running' | 'success' | 'error',
      input: tc.input,
      output: tc.output,
      duration: tc.duration,
    })),
  };
}

// ============================================================================
// Facade Implementation
// ============================================================================

/**
 * Backward compatible useConversationStore facade
 *
 * Delegates to useUnifiedChatStore while maintaining the old API surface.
 * This allows gradual migration without breaking existing components.
 *
 * @deprecated Use useUnifiedChatStore directly instead
 */
export const useConversationStore = create<CombinedConversationState>(() => {
    const unifiedStore = useUnifiedChatStore();

    // Helper to get messages by thread ID for thread mapping
    const messagesByThread = (threadId: string): MessageWithId[] => {
      return Object.values(unifiedStore.messages).filter((m) => m.threadId === threadId);
    };

    return {
      // ========== Mapped State ==========
      conversations: Object.fromEntries(
        Object.entries(unifiedStore.conversations).map(([id, conv]) => [
          id,
          mapToLegacyConversation(conv),
        ])
      ),
      activeConversationId: unifiedStore.activeConversationId,
      activeProjectConversationIds: unifiedStore.activeProjectConversationIds,
      threads: Object.fromEntries(
        Object.entries(unifiedStore.threads).map(([id, thread]) => [
          id,
          mapToLegacyThread(thread, messagesByThread),
        ])
      ),
      activeThreadId: unifiedStore.activeThreadId,
      messages: Object.fromEntries(
        Object.entries(unifiedStore.messages)
          .map(([id, msg]) => {
            const legacy = mapToLegacyMessage(msg);
            if (!legacy) return null;
            // MessageExtended extends ThreadMessage with threadId
            return [id, { ...legacy, threadId: msg.threadId }] as [string, ThreadMessage & { threadId: string }];
          })
          .filter((entry): entry is [string, ThreadMessage & { threadId: string }] => entry !== null)
      ),
      eventHistory: [],
      _hasHydrated: unifiedStore._hasHydrated,
      pendingToolApprovals: unifiedStore.pendingApprovals.map((pa) => ({
        id: pa.id,
        conversationId: pa.conversationId,
        threadId: pa.threadId,
        messageId: pa.messageId,
        toolName: pa.toolName,
        toolArgs: pa.toolArgs,
        createdAt: pa.createdAt,
        status: pa.status as 'pending' | 'approved' | 'denied',
      })),

      // ========== Delegated Methods ==========
      createConversation: (workspaceType: WorkspaceType, projectId: string | null, agentId: string) =>
        unifiedStore.createConversation(workspaceType, projectId, agentId),

      updateConversationMetadata: (id: string, updates: Partial<ConversationMetadataExtended>) =>
        unifiedStore.updateConversation(id, updates),

      deleteConversation: (id: string) => unifiedStore.deleteConversation(id),

      setActiveConversation: (id: string) => unifiedStore.setActiveConversation(id),

      setScrollPosition: (id: string, scrollPosition: number) =>
        unifiedStore.setScrollPosition(id, scrollPosition),

      getConversation: (id: string) => {
        const conv = unifiedStore.getConversation(id);
        return conv ? mapToLegacyConversation(conv) : undefined;
      },

      getAllConversations: () =>
        unifiedStore.getAllConversations().map(mapToLegacyConversation),

      getConversationsByWorkspace: (workspaceType: WorkspaceType) =>
        unifiedStore.getConversationsByWorkspace(workspaceType).map(mapToLegacyConversation),

      getConversationsByProject: (projectId: string) =>
        unifiedStore.getConversationsByProject(projectId).map(mapToLegacyConversation),

      createThread: (conversationId: string, parentThreadId?: string) =>
        unifiedStore.createThread(conversationId, parentThreadId),

      deleteThread: (threadId: string) => unifiedStore.deleteThread(threadId),

      setActiveThread: (threadId: string | null) => unifiedStore.setActiveThread(threadId),

      getThread: (threadId: string) => {
        const thread = unifiedStore.getThread(threadId);
        return thread ? mapToLegacyThread(thread, messagesByThread) : undefined;
      },

      getThreadsByConversation: (conversationId: string) =>
        unifiedStore.getThreadsByConversation(conversationId).map((t) => mapToLegacyThread(t, messagesByThread)),

      getRootThread: (conversationId: string) => {
        const thread = unifiedStore.getRootThread(conversationId);
        return thread ? mapToLegacyThread(thread, messagesByThread) : undefined;
      },

      getChildThreads: (parentThreadId: string) =>
        unifiedStore.getChildThreads(parentThreadId).map((t) => mapToLegacyThread(t, messagesByThread)),

      getThreadHierarchy: (threadId: string) =>
        unifiedStore.getThreadHierarchy(threadId).map((t) => mapToLegacyThread(t, messagesByThread)),

      addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => {
        const { toolCalls, ...rest } = message;
        return unifiedStore.addMessage(threadId, {
          ...rest,
          toolCalls: toolCalls as any,
        });
      },

      updateMessage: (messageId: string, updates: Partial<ThreadMessage>) =>
        unifiedStore.updateMessage(messageId, updates as any),

      deleteMessage: (messageId: string) => unifiedStore.deleteMessage(messageId),

      getMessage: (messageId: string) => {
        const msg = unifiedStore.getMessage(messageId);
        if (!msg) return undefined;
        const legacy = mapToLegacyMessage(msg);
        if (!legacy) return undefined;
        return { ...legacy, threadId: msg.threadId };
      },

      getMessagesByThread: (threadId: string) => {
        const msgs = unifiedStore.getMessagesByThread(threadId);
        return msgs.map((msg) => {
          const legacy = mapToLegacyMessage(msg);
          if (!legacy) return null;
          return { ...legacy, threadId: msg.threadId };
        }).filter((m): m is ThreadMessage & { threadId: string } => m !== null);
      },

      getLastMessage: (threadId: string) => {
        const msg = unifiedStore.getLastMessage(threadId);
        if (!msg) return undefined;
        const legacy = mapToLegacyMessage(msg);
        if (!legacy) return undefined;
        return { ...legacy, threadId: msg.threadId };
      },

      // ========== Stub Methods for Events/Validation (to be implemented) ==========
      filterConversations: () => [],
      sortConversations: () => [],
      searchConversations: () => [],
      searchConversationsByTag: () => [],
      getConversationStats: () => ({ messageCount: 0, threadCount: 0, totalTokens: 0, durationMs: 0 }),
      getRecentConversations: () => [],
      loadConversation: async (conversationId: string) => {
        await unifiedStore.loadConversation(conversationId);
      },
      loadConversationByProject: async (projectId: string) => {
        await unifiedStore.loadConversationByProject(projectId);
      },

      validateConversationId: () => ({ isValid: true, errors: [] }),
      validateThreadId: () => ({ isValid: true, errors: [] }),
      validateMessageId: () => ({ isValid: true, errors: [] }),
      validateConversationStatus: () => ({ isValid: true, errors: [] }),
      validateThreadStatus: () => ({ isValid: true, errors: [] }),
      validateThreadHierarchy: () => ({ isValid: true, errors: [] }),
      validateMessageThreadAssociation: () => ({ isValid: true, errors: [] }),
      validateConversationIntegrity: () => ({ isValid: true, errors: [] }),

      emitEvent: () => {},
      emitConversationCreated: () => {},
      emitConversationUpdated: () => {},
      emitConversationDeleted: () => {},
      emitThreadCreated: () => {},
      emitThreadUpdated: () => {},
      emitThreadDeleted: () => {},
      emitMessageAdded: () => {},
      emitMessageUpdated: () => {},
      emitMessageDeleted: () => {},
      addEventListener: () => () => {},
      removeEventListener: () => {},
      getEventHistory: () => [],
      clearEventHistory: () => {},

      persistConversation: async () => {
        await unifiedStore.persistConversation();
      },

      getCurrentConversation: () => {
        const state = unifiedStore.getCurrentConversation();
        if (!state) return null;
        return {
          metadata: {
            id: state.metadata.id,
            projectId: state.metadata.projectId,
            workspaceId: state.metadata.workspaceId,
            workspaceType: state.metadata.workspaceType,
            title: state.metadata.title,
            preview: state.metadata.preview,
            agentId: state.metadata.agentId,
            messageCount: state.metadata.messageCount,
            scrollPosition: state.metadata.scrollPosition,
            createdAt: state.metadata.createdAt,
            updatedAt: state.metadata.updatedAt,
          },
          messages: state.messages
            .filter((m) => m.role !== 'tool')
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant' | 'system',
              content: m.content,
              agentId: m.agentId,
              agentName: m.agentName,
              agentModel: m.agentModel,
              timestamp: m.timestamp,
              toolCalls: m.toolCalls?.map((tc) => ({
                id: tc.id,
                name: tc.name,
                status: (tc.status === 'cancelled' ? 'error' : tc.status) as 'pending' | 'running' | 'success' | 'error',
                input: tc.input,
                output: tc.output,
                duration: tc.duration,
              })),
            })),
        };
      },
    };
  }
);

// Re-export types for legacy consumers
export type { CombinedConversationState } from './types';
// Alias for backward compatibility with conversation-store.ts
export type ConversationStoreState = CombinedConversationState;
export type {
  ThreadMessage,
  ConversationThread,
  ThreadHierarchyNode,
  ContextWindowConfig,
} from './types';
export type { ValidationResult } from './conversation-validation-slice';
export type { ConversationEvent, ConversationEventType } from './event-types';

// ============================================================================
// Convenience Hooks (for backward compatibility)
// ============================================================================

/**
 * Hook to check if conversation store has hydrated
 */
export function useHasHydrated(): boolean {
  return useConversationStore((state) => state._hasHydrated);
}

/**
 * Hook to get the active conversation and its selector functions
 */
export function useActiveConversation() {
  const activeConversationId = useConversationStore((state) => state.activeConversationId);
  const getConversation = useConversationStore((state) => state.getConversation);

  const activeConversation = activeConversationId
    ? getConversation(activeConversationId)
    : undefined;

  return {
    activeConversationId,
    activeConversation,
    setActiveConversation: useConversationStore((state) => state.setActiveConversation),
  };
}

/**
 * Hook to get pending tool approvals
 * NOTE: Tool approval methods (approve/deny) are available on the unified store directly
 */
export function usePendingApprovals() {
  const pendingToolApprovals = useConversationStore((state) => state.pendingToolApprovals);

  return {
    pendingToolApprovals,
    hasPendingApprovals: pendingToolApprovals.length > 0,
  };
}

/**
 * Hook to get the active thread
 * Returns the thread directly for backward compatibility with consumers expecting ThreadExtended | undefined
 */
export function useActiveThread(): ThreadExtended | undefined {
  const activeThreadId = useConversationStore((state) => state.activeThreadId);
  const getThread = useConversationStore((state) => state.getThread);
  return activeThreadId ? getThread(activeThreadId) : undefined;
}

/**
 * Hook to get the active thread with controls
 * Returns an object with activeThreadId, activeThread, and setActiveThread
 */
export function useActiveThreadWithControls() {
  const activeThreadId = useConversationStore((state) => state.activeThreadId);
  const getThread = useConversationStore((state) => state.getThread);
  const setActiveThread = useConversationStore((state) => state.setActiveThread);

  const activeThread = activeThreadId ? getThread(activeThreadId) : undefined;

  return {
    activeThreadId,
    activeThread,
    setActiveThread,
  };
}

/**
 * Get the entire conversation store state
 * NOTE: This is a snapshot of state at call time, not reactive
 */
export function getConversationStoreState(): CombinedConversationState {
  return useConversationStore.getState();
}
