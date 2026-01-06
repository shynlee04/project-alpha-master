/**
 * @fileoverview Unified Conversation Store
 * @module infrastructure/persistence/stores/conversation/useConversationStore
 *
 * Story CC-1.7: Unified Store Integration
 * Epic CC-1: Conversation Consolidation
 *
 * January 2026 Zustand Pattern:
 * - Single store composed from 6 focused slices (CC-1.1 through CC-1.6)
 * - Each slice is ≤179 lines (single responsibility principle)
 * - DexieIndexedDB persistence with partialize
 * - Event emission for audit trail
 * - Validation helpers for data integrity
 *
 * Slices:
 * - CC-1.1: Conversation Metadata Slice (103 lines)
 * - CC-1.2: Thread Management Slice (117 lines)
 * - CC-1.3: Message CRUD Slice (68 lines)
 * - CC-1.4: Utils Slice (70 lines)
 * - CC-1.5: Validation Slice (179 lines)
 * - CC-1.6: Events Slice (169 lines)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CombinedConversationState } from './types';
import { createDebouncedPersist } from './conversation-helpers';
import type { ConversationState } from './conversation-types';

// Local type alias for internal use (also re-exported below)
type ConversationStoreState = CombinedConversationState;

import { createConversationMetadataSlice } from './conversation-metadata-slice';
import { createThreadManagementSlice } from './thread-management-slice';
import { createMessageCrudSlice } from './message-crud-slice';
import { createConversationUtilsSlice } from './conversation-utils-slice';
import { createConversationValidationSlice } from './conversation-validation-slice';
import { createConversationEventsSlice } from './conversation-events-slice';
import { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';

// Re-export types for consumers
export type { CombinedConversationState as ConversationStoreState } from './types';
export type {
    ThreadMessage,
    ConversationThread,
    ThreadHierarchyNode,
    ContextWindowConfig,
} from './types';
export type { ValidationResult } from './conversation-validation-slice';
export type { ConversationEvent, ConversationEventType } from './conversation-events-slice';

/**
 * Combined Conversation Store
 *
 * Composed from 6 focused slices using January 2026 Zustand pattern.
 * Persisted to DexieIndexedDB with partial persistence (excludes events).
 *
 * P0-4: Auto-persist functionality added to prevent message loss on workspace switch
 *
 * Persistence Configuration:
 * - Storage: DexieIndexedDB via createDexieStorage
 * - Partialize: Conversations, threads, messages, active IDs only
 * - Excluded: Event history (ephemeral), validation methods (computed)
 */
export const useConversationStore = create<ConversationStoreState>()(
    persist(
        (...a) => {
            // Create debounced persist function (500ms delay to avoid excessive IndexedDB writes)
            const debouncedPersist = createDebouncedPersist(500);

            return {
                // ========== Conversation Metadata Slice (CC-1.1) ==========
                ...createConversationMetadataSlice(...a),

                // ========== Thread Management Slice (CC-1.2) ==========
                ...createThreadManagementSlice(...a),

                // ========== Message CRUD Slice (CC-1.3) ==========
                ...createMessageCrudSlice(...a),

                // ========== Utils Slice (CC-1.4) ==========
                ...createConversationUtilsSlice(...a),

                // ========== Validation Slice (CC-1.5) ==========
                ...createConversationValidationSlice(...a),

                // ========== Events Slice (CC-1.6) ==========
                ...createConversationEventsSlice(...a),

                // ========== P0-4: Auto-Persist Methods ==========
                /**
                 * Auto-persist current conversation to IndexedDB (debounced 500ms)
                 * This ensures conversations survive workspace switches and page refreshes
                 */
                persistConversation: async () => {
                    const get = a[0] as () => ConversationStoreState;
                    const conversation = get().getCurrentConversation();
                    if (conversation) {
                        await debouncedPersist(conversation);
                    }
                },

                /**
                 * Get current conversation state for persistence
                 * Aggregates metadata, threads, and messages into a single ConversationState object
                 */
                getCurrentConversation: (): ConversationState | null => {
                    const get = a[0] as () => ConversationStoreState;
                    const { activeConversationId, conversations, threads, messages } = get();

                    if (!activeConversationId) {
                        return null;
                    }

                    const conversation = conversations[activeConversationId];
                    if (!conversation) {
                        return null;
                    }

                    const conversationThreads = Object.values(threads)
                        .filter((t) => t.conversationId === activeConversationId && t.status !== 'deleted');

                    const conversationMessages = Object.values(messages)
                        .filter((m) => conversationThreads.some((t) => t.id === m.threadId));

                    return {
                        metadata: {
                            id: conversation.id,
                            projectId: conversation.projectId,
                            workspaceId: conversation.workspaceType || 'ide', // PERSIST-S002: Workspace isolation
                            workspaceType: conversation.workspaceType,
                            title: conversation.title || 'New Conversation',
                            preview: '', // Preview not available in ConversationMetadataWithId
                            agentId: conversation.agentId,
                            messageCount: conversationMessages.length,
                            scrollPosition: 0,
                            createdAt: new Date(conversation.createdAt).getTime(),
                            updatedAt: new Date(conversation.updatedAt).getTime(),
                        },
                        messages: conversationMessages.map((m) => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            agentId: m.agentId,
                            agentName: m.agentName,
                            agentModel: m.agentModel,
                            timestamp: m.timestamp,
                            toolCalls: m.toolCalls,
                        })),
                    };
                },

                // ========== Hydration & Tool Approval State (Story 51-3) ==========
                _hasHydrated: false,
                pendingToolApprovals: [],
            };
        },
        {
            name: 'conversation-store',
            storage: createDexieStorage('conversationState') as any, // Type assertion for Dexie storage compatibility
            version: 2,

            // Partialize: Only persist core data, exclude ephemeral state
            partialize: (state: ConversationStoreState) => ({
                conversations: state.conversations,
                activeConversationId: state.activeConversationId,
                activeProjectConversationIds: state.activeProjectConversationIds,
                threads: state.threads,
                activeThreadId: state.activeThreadId,
                messages: state.messages,
            }),

            // Hydration callback
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                console.log('[ConversationStore] Hydrated from IndexedDB', {
                    conversations: Object.keys(state.conversations).length,
                    threads: Object.keys(state.threads).length,
                    messages: Object.keys(state.messages).length,
                    activeConversationId: state.activeConversationId,
                    activeThreadId: state.activeThreadId,
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
export function useActiveConversation() {
    return useConversationStore((state) => {
        if (!state.activeConversationId) return null;
        return state.conversations[state.activeConversationId] || null;
    });
}

/**
 * Hook to get active thread
 */
export function useActiveThread() {
    return useConversationStore((state) => {
        if (!state.activeThreadId) return null;
        return state.threads[state.activeThreadId] || null;
    });
}

/**
 * Hook to get all active conversations
 */
export function useActiveConversations() {
    return useConversationStore((state) =>
        Object.values(state.conversations).filter((c) => c.status === 'active')
    );
}

/**
 * Hook to get threads for a conversation
 */
export function useConversationThreads(conversationId: string) {
    return useConversationStore((state) =>
        Object.values(state.threads).filter(
            (t) => t.conversationId === conversationId && t.status === 'active'
        )
    );
}

/**
 * Hook to get messages for a thread
 */
export function useThreadMessages(threadId: string) {
    return useConversationStore((state) =>
        Object.values(state.messages)
            .filter((m) => m.threadId === threadId)
            .sort((a, b) => a.timestamp - b.timestamp)
    );
}

/**
 * Hook for hydration status
 */
export function useHasHydrated() {
    return useConversationStore((state) => state._hasHydrated);
}

/**
 * Hook to get event history
 */
export function useEventHistory(filter?: { type?: import('./conversation-events-slice').ConversationEventType; entityId?: string; limit?: number }) {
    return useConversationStore((state) => state.getEventHistory(filter));
}

/**
 * Hook to get pending tool approvals
 */
export function usePendingApprovals() {
    return useConversationStore((state) => state.pendingToolApprovals);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Reset the conversation store to empty state
 * Useful for testing or logout
 */
export function resetConversationStore() {
    useConversationStore.setState({
        conversations: {},
        activeConversationId: null,
        activeProjectConversationIds: {},
        threads: {},
        activeThreadId: null,
        messages: {},
        _hasHydrated: false,
        eventHistory: [],
    });
}

/**
 * Get current store state (outside of React)
 * Useful for debugging, testing, or non-React contexts
 */
export function getConversationStoreState() {
    return useConversationStore.getState();
}

/**
 * Subscribe to store changes (outside of React)
 * Returns unsubscribe function
 */
export function subscribeToConversationStore(
    listener: (state: ConversationStoreState, previousState: ConversationStoreState) => void
) {
    return useConversationStore.subscribe(listener);
}
