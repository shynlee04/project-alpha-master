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
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

// Import slices
import { createChatMetadataSlice } from './slices/chat-metadata-slice';
import { createThreadManagementSlice } from './slices/thread-management-slice';
import { createMessageCrudSlice } from './slices/message-crud-slice';
import { createToolExecutionSlice } from './slices/tool-execution-slice';
import { createContextWindowSlice } from './slices/context-window-slice';
import { createChatPersistenceSlice } from './slices/chat-persistence-slice';

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

        // ========== Chat Persistence Slice (CC-11-01) ==========
        ...createChatPersistenceSlice(...a),

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
