/**
 * Context Window Slice
 *
 * Handles context window management for long conversations.
 * Implements token counting and pruning strategies.
 *
 * @module conversation/slices/context-window
 */

import { StateCreator } from 'zustand';
import type { ConversationThread } from '../conversation-threads-store';

/**
 * Context Window State & Actions
 */
export interface ContextWindowSlice {
    /** Prune context window for long conversations */
    pruneContextWindow: (threadId: string, targetTokens: number) => Promise<void>;
}

/**
 * Context Window Slice Implementation
 */
export const createContextWindowSlice: StateCreator<
    ContextWindowSlice & {
        threads: Record<string, ConversationThread>;
    },
    [],
    [],
    ContextWindowSlice
> = (set, get) => ({
    pruneContextWindow: async (threadId: string, targetTokens: number) => {
        console.log('[ContextWindowSlice] Pruning context window for thread:', threadId, 'target:', targetTokens);
        const thread = get().threads[threadId];
        if (!thread) {
            console.error('[ContextWindowSlice] Thread not found:', threadId);
            return;
        }

        // Import context window manager dynamically
        const { pruneContextWindow, countMessageTokens } = await import('@/lib/chat/context-window-manager');

        // Get current token count
        const currentTokens = countMessageTokens(thread.messages);
        console.log('[ContextWindowSlice] Current tokens:', currentTokens, 'target:', targetTokens);

        if (currentTokens <= targetTokens) {
            console.log('[ContextWindowSlice] No pruning needed');
            return;
        }

        // Get compression strategy from thread config (default to drop_oldest)
        const strategy = thread.contextWindow?.compressionStrategy || 'drop_oldest';

        // Prune messages
        const prunedMessages = await pruneContextWindow(thread.messages, {
            maxTokens: targetTokens,
            currentTokens,
            compressionStrategy: strategy,
        });

        console.log('[ContextWindowSlice] Pruned messages:', thread.messages.length, '→', prunedMessages.length);

        // Update thread with pruned messages
        set((state) => ({
            threads: {
                ...state.threads,
                [threadId]: {
                    ...thread,
                    messages: prunedMessages,
                    messageCount: prunedMessages.length,
                    updatedAt: Date.now(),
                },
            },
        }));
    },
});
