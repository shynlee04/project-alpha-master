import { StateCreator } from 'zustand';
import type { ThreadMessage, ThreadToolCall } from './types';
import type { CombinedConversationState } from './types';

export interface MessageWithId extends ThreadMessage {
  threadId: string;
}

type MessageSliceState = Pick<CombinedConversationState, 'messages'>;

type MessageSliceMethods = {
  addMessage: (threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (messageId: string, updates: Partial<ThreadMessage>) => void;
  deleteMessage: (messageId: string) => void;
  getMessage: (messageId: string) => MessageWithId | undefined;
  getMessagesByThread: (threadId: string) => MessageWithId[];
  getLastMessage: (threadId: string) => MessageWithId | undefined;
};

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const createMessageCrudSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  MessageSliceState & MessageSliceMethods
> = (set, get) => ({
  messages: {},

  addMessage: (threadId, message) => {
    const id = generateId();
    const timestamp = Date.now();
    const newMessage: MessageWithId = { ...message, id, threadId, timestamp };
    console.log('[MessageSlice] Adding:', id, 'to thread:', threadId);
    set((state) => ({ messages: { ...state.messages, [id]: newMessage } }));
    return id;
  },

  updateMessage: (id, updates) => {
    const existing = get().messages[id];
    if (!existing) { console.warn('[MessageSlice] Not found:', id); return; }
    console.log('[MessageSlice] Updating:', id);
    set((state) => ({
      messages: { ...state.messages, [id]: { ...existing, ...updates } },
    }));
  },

  deleteMessage: (id) => {
    console.log('[MessageSlice] Deleting:', id);
    set((state) => {
      const updated = { ...state.messages };
      delete updated[id];
      return { messages: updated };
    });
  },

  getMessage: (id) => get().messages[id],

  getMessagesByThread: (threadId) =>
    Object.values(get().messages)
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.timestamp - b.timestamp),

  getLastMessage: (threadId) => {
    const messages = get().getMessagesByThread(threadId);
    return messages.length > 0 ? messages[messages.length - 1] : undefined;
  },
});
