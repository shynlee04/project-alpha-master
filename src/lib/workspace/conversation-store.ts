/**
 * @fileoverview Conversation Store Adapter (Backward Compatibility)
 * @module lib/workspace/conversation-store
 * 
 * Adapts old conversation store API to new Infrastructure Threads Store
 * to maintain compatibility during refactoring.
 */

import { useConversationStore as useThreadsStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { getThread as getDexieThread, saveThread as saveDexieThread, getThreadsForProject } from './threads-store';
import type { ConversationThread, ThreadMessage } from '@/infrastructure/persistence/stores/conversation/useConversationStore';

// ============================================================================
// Types Mapped to New Infrastructure
// ============================================================================

export type ConversationMessageRole = 'user' | 'assistant' | 'system';

export type ConversationMessage = ThreadMessage;

export type ConversationState = ConversationThread;

export interface ToolResultRecord {
    id: string;
    toolCallId: string;
    result: any;
    isError?: boolean;
}

// ============================================================================
// Adapter Functions
// ============================================================================

/**
 * Get conversation by ID
 * Prefers reactive store state, falls back to Dexie
 */
export const getConversation = async (id: string): Promise<ConversationState | null> => {
    // Try store first
    const storeThread = useThreadsStore.getState().threads[id];
    if (storeThread) return storeThread;

    // Fallback to persistence
    return await getDexieThread(id);
};

/**
 * Save conversation state
 */
export const saveConversation = async (conversation: ConversationState): Promise<void> => {
    // Update generic store state (might need more robust sync)
    // For now, we rely on the store being the source of truth, so specific save 
    // might be redundant if using store hooks, but we ensure Dexie sync.
    await saveDexieThread(conversation);
};

/**
 * Append message to conversation
 */
export const appendConversationMessage = async (conversationId: string, message: ConversationMessage): Promise<void> => {
    useThreadsStore.getState().addMessage(conversationId, message);
};

/**
 * Append tool result
 * NOTE: This is a complex operation in the new store (finding message, updating tool call).
 * For now, we assume the agent runtime handles state updates via updateMessage.
 */
export const appendToolResult = async (conversationId: string, _toolResult: ToolResultRecord): Promise<void> => {
    // TODO: Implement proper tool result appending in ThreadsStore
    console.warn('[ConversationStore Adapter] appendToolResult is deprecated. Use useThreadsStore actions.');
};

/**
 * Clear/Delete conversation
 */
export const clearConversation = async (conversationId: string): Promise<void> => {
    useThreadsStore.getState().deleteThread(conversationId);
};

/**
 * List recent conversations
 */
export const listRecentConversations = async (projectId: string, limit: number = 20): Promise<ConversationState[]> => {
    // Try store first if project matches
    const store = useThreadsStore.getState();
    if (store.currentProjectId === projectId) {
        return store.getThreadsForProject(projectId).slice(0, limit);
    }

    // Fallback to Dexie
    const threads = await getThreadsForProject(projectId);
    return threads.slice(0, limit);
};
