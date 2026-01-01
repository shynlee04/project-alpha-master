import { StateCreator } from 'zustand';
import type { CombinedConversationState } from './types';
import type { ConversationMetadataWithId } from './conversation-metadata-slice';
import type { ThreadWithId } from './thread-management-slice';
import type { MessageWithId } from './message-crud-slice';

// Event types
export type ConversationEventType =
  | 'conversation:created'
  | 'conversation:updated'
  | 'conversation:deleted'
  | 'thread:created'
  | 'thread:updated'
  | 'thread:deleted'
  | 'message:added'
  | 'message:updated'
  | 'message:deleted';

export interface ConversationEvent {
  type: ConversationEventType;
  entityId: string;
  timestamp: number;
  data?: unknown;
}

// Event listener type
export type EventListener = (event: ConversationEvent) => void;

// Slice state (subset of CombinedConversationState)
type ConversationEventsSliceState = {
  eventHistory: ConversationEvent[];
};

// Slice methods
type ConversationEventsSliceMethods = {
  // Event emission
  emitEvent: (type: ConversationEventType, entityId: string, data?: unknown) => void;
  emitConversationCreated: (id: string, conversation: ConversationMetadataWithId) => void;
  emitConversationUpdated: (id: string, updates: Partial<ConversationMetadataWithId>) => void;
  emitConversationDeleted: (id: string) => void;
  emitThreadCreated: (id: string, thread: ThreadWithId) => void;
  emitThreadUpdated: (id: string, updates: Partial<ThreadWithId>) => void;
  emitThreadDeleted: (id: string) => void;
  emitMessageAdded: (id: string, message: MessageWithId) => void;
  emitMessageUpdated: (id: string, updates: Partial<MessageWithId>) => void;
  emitMessageDeleted: (id: string) => void;

  // Event listening
  addEventListener: (eventType: ConversationEventType, listener: EventListener) => () => void;
  removeEventListener: (eventType: ConversationEventType, listener: EventListener) => void;

  // Event history
  getEventHistory: (filter?: { type?: ConversationEventType; entityId?: string; limit?: number }) => ConversationEvent[];
  clearEventHistory: () => void;
};

const MAX_EVENT_HISTORY = 1000;

export const createConversationEventsSlice: StateCreator<
  CombinedConversationState,
  [],
  [],
  ConversationEventsSliceState & ConversationEventsSliceMethods
> = (set, get) => {
  // Event listeners registry (stored outside state to avoid re-renders)
  const listeners = new Map<ConversationEventType, Set<EventListener>>();

  return {
    eventHistory: [],

    emitEvent: (type, entityId, data) => {
      const event: ConversationEvent = {
        type,
        entityId,
        timestamp: Date.now(),
        data,
      };
      console.log('[ConversationEventsSlice] Emit:', event);
      set((state) => ({
        eventHistory: [event, ...state.eventHistory].slice(0, MAX_EVENT_HISTORY),
      }));
      // Notify listeners
      const typeListeners = listeners.get(type);
      if (typeListeners) {
        typeListeners.forEach((listener) => {
          try {
            listener(event);
          } catch (error) {
            console.error('[ConversationEventsSlice] Listener error:', error);
          }
        });
      }
    },

    emitConversationCreated: (id, conversation) => {
      get().emitEvent('conversation:created', id, conversation);
    },

    emitConversationUpdated: (id, updates) => {
      get().emitEvent('conversation:updated', id, updates);
    },

    emitConversationDeleted: (id) => {
      get().emitEvent('conversation:deleted', id);
    },

    emitThreadCreated: (id, thread) => {
      get().emitEvent('thread:created', id, thread);
    },

    emitThreadUpdated: (id, updates) => {
      get().emitEvent('thread:updated', id, updates);
    },

    emitThreadDeleted: (id) => {
      get().emitEvent('thread:deleted', id);
    },

    emitMessageAdded: (id, message) => {
      get().emitEvent('message:added', id, message);
    },

    emitMessageUpdated: (id, updates) => {
      get().emitEvent('message:updated', id, updates);
    },

    emitMessageDeleted: (id) => {
      get().emitEvent('message:deleted', id);
    },

    addEventListener: (eventType, listener) => {
      if (!listeners.has(eventType)) {
        listeners.set(eventType, new Set());
      }
      listeners.get(eventType)!.add(listener);
      console.log('[ConversationEventsSlice] Added listener for:', eventType, `Total: ${listeners.get(eventType)!.size}`);

      // Return unsubscribe function
      return () => {
        get().removeEventListener(eventType, listener);
      };
    },

    removeEventListener: (eventType, listener) => {
      const typeListeners = listeners.get(eventType);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          listeners.delete(eventType);
        }
        console.log('[ConversationEventsSlice] Removed listener for:', eventType, `Total: ${typeListeners.size}`);
      }
    },

    getEventHistory: (filter) => {
      let history = get().eventHistory;
      if (filter?.type) {
        history = history.filter((e) => e.type === filter.type);
      }
      if (filter?.entityId) {
        history = history.filter((e) => e.entityId === filter.entityId);
      }
      if (filter?.limit) {
        history = history.slice(0, filter.limit);
      }
      return history;
    },

    clearEventHistory: () => {
      console.log('[ConversationEventsSlice] Clearing event history');
      set({ eventHistory: [] });
    },
  };
};
