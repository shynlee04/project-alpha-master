/**
 * Message Slice
 *
 * Handles message operations within threads.
 * Part of the December 2025 Zustand slices pattern.
 *
 * @module conversation/slices/message
 */

import { StateCreator } from 'zustand';
import type { ThreadMessage, ConversationThread } from '../types';

/**
 * Message State & Actions
 */
export interface MessageSlice {
    /** Add message to thread */
    addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => void;

    /** Update message (for streaming) */
    updateMessage: (threadId: string, messageId: string, content: string) => void;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Message Slice Implementation
 */
export const createMessageSlice: StateCreator<
    MessageSlice & {
        threads: Record<string, ConversationThread>;
    },
    [],
    [],
    MessageSlice
> = (set) => ({
    addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => {
        const id = generateId('msg');
        const timestamp = Date.now();

        set((state) => {
            const thread = state.threads[threadId];
            if (!thread) return state;

            const newMessage: ThreadMessage = { ...message, id, timestamp };
            const messages = [...thread.messages, newMessage];

            // Update title from first user message
            let title = thread.title;
            if (thread.messages.length === 0 && message.role === 'user') {
                title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
            }

            // Track agents used
            let agentsUsed = thread.agentsUsed;
            if (message.agentId && !agentsUsed.includes(message.agentId)) {
                agentsUsed = [...agentsUsed, message.agentId];
            }

            // Preview from last message
            const preview = message.content.slice(0, 100);

            return {
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...thread,
                        messages,
                        title,
                        preview,
                        agentsUsed,
                        messageCount: messages.length,
                        updatedAt: timestamp,
                    },
                },
            };
        });
    },

    updateMessage: (threadId: string, messageId: string, content: string) => {
        set((state) => {
            const thread = state.threads[threadId];
            if (!thread) return state;

            const messages = thread.messages.map((msg: ThreadMessage) =>
                msg.id === messageId ? { ...msg, content } : msg
            );

            return {
                threads: {
                    ...state.threads,
                    [threadId]: {
                        ...thread,
                        messages,
                        preview: content.slice(0, 100),
                        updatedAt: Date.now(),
                    },
                },
            };
        });
    },
});
