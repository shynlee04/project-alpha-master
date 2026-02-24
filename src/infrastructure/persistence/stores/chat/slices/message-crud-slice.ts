/**
 * @fileoverview Message CRUD Slice
 * @module infrastructure/persistence/stores/chat/slices
 * @governance EPIC-40 MM-01 | ADR-031
 *
 * Message operations within threads for unified chat store.
 * Handles message creation, updates, and retrieval.
 *
 * @story MM-01: Create Unified Chat Store
 * @created 2026-01-10
 */

import { StateCreator } from 'zustand';
import type { ChatMessage } from '@/domain/entities/chat';
import type { CombinedUnifiedChatState, MessageWithId } from '../unified-chat-types';

// Slice state (subset of CombinedUnifiedChatState)
type MessageCrudSliceState = Pick<CombinedUnifiedChatState, 'messages'>;

// Slice methods
type MessageCrudSliceMethods = {
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'threadId'>) => string;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  getMessage: (messageId: string) => MessageWithId | undefined;
  getMessagesByThread: (threadId: string) => MessageWithId[];
  getLastMessage: (threadId: string) => MessageWithId | undefined;
};

/**
 * Generate cryptographically unique message ID
 * CA-003 FIX: Uses crypto.randomUUID() with high-entropy fallback
 * Fallback combines timestamp + counter + random for SSR compatibility
 */
let idCounter = 0;
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `msg_${crypto.randomUUID()}`;
  }
  // High-entropy fallback: timestamp + counter + random
  const randomPart = Math.random().toString(36).substring(2, 11);
  const counterPart = (idCounter++).toString(36);
  return `msg_${Date.now()}_${counterPart}_${randomPart}`;
};

export const createMessageCrudSlice: StateCreator<
  CombinedUnifiedChatState,
  [],
  [],
  MessageCrudSliceState & MessageCrudSliceMethods
> = (set, get) => ({
  messages: {},

  addMessage: (threadId, message) => {
    const messageId = generateId();
    const now = Date.now();

    const newMessage: MessageWithId = {
      id: messageId,
      ...message,
      threadId,
      timestamp: now,
    };

    console.log('[MessageCrudSlice] Adding:', messageId, { threadId, role: message.role });

    set((state) => ({
      messages: { ...state.messages, [messageId]: newMessage },
    }));

    // Update thread's message count and preview
    const state = get();
    const threads = state.threads ?? {};
    const thread = threads[threadId];
    if (thread) {
      set((state) => ({
        threads: {
          ...(state.threads ?? {}),
          [threadId]: {
            ...thread,
            messageCount: (thread.messageCount || 0) + 1,
            preview: message.content.slice(0, 100),
            updatedAt: now,
          },
        },
      }));
    }

    // Update conversation's message count
    const conversationId = thread?.conversationId;
    if (conversationId) {
      const conversation = get().conversations[conversationId];
      if (conversation) {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              messageCount: (conversation.messageCount || 0) + 1,
              preview: message.content.slice(0, 100),
              updatedAt: now,
            },
          },
        }));
      }
    }

    get().persistConversation();
    return messageId;
  },

  updateMessage: (messageId, updates) => {
    const existing = get().messages[messageId];
    if (!existing) { console.warn('[MessageCrudSlice] Not found:', messageId); return; }

    console.log('[MessageCrudSlice] Updating:', messageId);
    set((state) => ({
      messages: {
        ...state.messages,
        [messageId]: { ...existing, ...updates },
      },
    }));
    get().persistConversation();
  },

  deleteMessage: (messageId) => {
    console.log('[MessageCrudSlice] Deleting:', messageId);
    set((state) => {
      const { [messageId]: deleted, ...rest } = state.messages;
      return { messages: rest };
    });
    get().persistConversation();
  },

  getMessage: (messageId) => get().messages[messageId],

  getMessagesByThread: (threadId) =>
    Object.values(get().messages)
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.timestamp - b.timestamp),

  getLastMessage: (threadId) => {
    const messages = get().getMessagesByThread(threadId);
    return messages.length > 0 ? messages[messages.length - 1] : undefined;
  },
});
