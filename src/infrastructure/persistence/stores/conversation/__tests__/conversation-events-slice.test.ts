import type { ConversationEvent } from '../conversation-events-slice';
import { createTestConversationStore } from './test-helper';

vi.mock('@/lib/state/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

const createTestStore = createTestConversationStore;

describe('Conversation Events Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Event Emission', () => {
    it('should emit conversation:created event', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const history = store.getState().getEventHistory();

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('conversation:created');
      expect(history[0].entityId).toBe(conversationId);
    });

    it('should emit conversation:updated event', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().updateConversationMetadata(conversationId, { title: 'Updated' });
      const history = store.getState().getEventHistory({ type: 'conversation:updated' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('conversation:updated');
      expect(history[0].entityId).toBe(conversationId);
    });

    it('should emit conversation:deleted event', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().deleteConversation(conversationId);
      const history = store.getState().getEventHistory({ type: 'conversation:deleted' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('conversation:deleted');
      expect(history[0].entityId).toBe(conversationId);
    });

    it('should emit thread:created event', () => {
      const threadId = store.getState().createThread('conv-1');
      const history = store.getState().getEventHistory({ type: 'thread:created' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('thread:created');
      expect(history[0].entityId).toBe(threadId);
    });

    it('should emit thread:deleted event', () => {
      const threadId = store.getState().createThread('conv-1');
      store.getState().deleteThread(threadId);
      const history = store.getState().getEventHistory({ type: 'thread:deleted' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('thread:deleted');
      expect(history[0].entityId).toBe(threadId);
    });

    it('should emit message:added event', () => {
      const threadId = store.getState().createThread('conv-1');
      const messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      const history = store.getState().getEventHistory({ type: 'message:added' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('message:added');
      expect(history[0].entityId).toBe(messageId);
    });

    it('should emit message:updated event', () => {
      const threadId = store.getState().createThread('conv-1');
      const messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      store.getState().updateMessage(messageId, { content: 'Updated' });
      const history = store.getState().getEventHistory({ type: 'message:updated' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('message:updated');
      expect(history[0].entityId).toBe(messageId);
    });

    it('should emit message:deleted event', () => {
      const threadId = store.getState().createThread('conv-1');
      const messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      store.getState().deleteMessage(messageId);
      const history = store.getState().getEventHistory({ type: 'message:deleted' });

      expect(history).toHaveLength(1);
      expect(history[0].type).toBe('message:deleted');
      expect(history[0].entityId).toBe(messageId);
    });
  });

  describe('Event History', () => {
    it('should maintain event history in reverse chronological order', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const threadId = store.getState().createThread(conversationId);
      const messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });

      const history = store.getState().getEventHistory();

      expect(history).toHaveLength(3);
      expect(history[0].type).toBe('message:added'); // Most recent
      expect(history[1].type).toBe('thread:created');
      expect(history[2].type).toBe('conversation:created'); // Oldest
    });

    it('should filter event history by type', () => {
      store.getState().createConversation('ide', null, 'agent-1');
      const _threadId = store.getState().createThread('conv-1');
      store.getState().addMessage(_threadId, { role: 'user', content: 'Test' });

      const threadEvents = store.getState().getEventHistory({ type: 'thread:created' });
      const messageEvents = store.getState().getEventHistory({ type: 'message:added' });

      expect(threadEvents).toHaveLength(1);
      expect(messageEvents).toHaveLength(1);
    });

    it('should filter event history by entity ID', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const threadId = store.getState().createThread(conversationId);

      const conversationEvents = store.getState().getEventHistory({ entityId: conversationId });
      const threadEvents = store.getState().getEventHistory({ entityId: threadId });

      expect(conversationEvents).toHaveLength(1);
      expect(threadEvents).toHaveLength(1);
    });

    it('should limit event history', () => {
      store.getState().createConversation('ide', null, 'agent-1');
      const _thread1 = store.getState().createThread('conv-1');
      const _thread2 = store.getState().createThread('conv-1');

      const history = store.getState().getEventHistory({ limit: 2 });

      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('thread:created'); // Most recent
      expect(history[1].type).toBe('thread:created');
    });

    it('should clear event history', () => {
      store.getState().createConversation('ide', null, 'agent-1');
      store.getState().createThread('conv-1');

      expect(store.getState().getEventHistory()).toHaveLength(2);

      store.getState().clearEventHistory();

      expect(store.getState().getEventHistory()).toHaveLength(0);
    });

    it('should limit event history to MAX_EVENT_HISTORY', () => {
      // Create more events than MAX_EVENT_HISTORY (1000)
      for (let i = 0; i < 1005; i++) {
        store.getState().createThread('conv-1');
      }

      const history = store.getState().getEventHistory();

      expect(history).toHaveLength(1000);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener and receive events', () => {
      const listener = vi.fn();
      store.getState().addEventListener('conversation:created', listener);

      store.getState().createConversation('ide', null, 'agent-1');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'conversation:created',
          entityId: expect.any(String),
        })
      );
    });

    it('should receive events with correct data', () => {
      const listener = vi.fn();
      store.getState().addEventListener('conversation:updated', listener);

      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().updateConversationMetadata(conversationId, { title: 'Updated' });

      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as ConversationEvent;
      expect(event.type).toBe('conversation:updated');
      expect(event.data).toEqual({ title: 'Updated' });
    });

    it('should support multiple listeners for same event type', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.getState().addEventListener('conversation:created', listener1);
      store.getState().addEventListener('conversation:created', listener2);

      store.getState().createConversation('ide', null, 'agent-1');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should support listeners for different event types', () => {
      const conversationListener = vi.fn();
      const threadListener = vi.fn();

      store.getState().addEventListener('conversation:created', conversationListener);
      store.getState().addEventListener('thread:created', threadListener);

      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().createThread(conversationId);

      expect(conversationListener).toHaveBeenCalledTimes(1);
      expect(threadListener).toHaveBeenCalledTimes(1);
    });

    it('should remove event listener', () => {
      const listener = vi.fn();
      const unsubscribe = store.getState().addEventListener('conversation:created', listener);

      unsubscribe();
      store.getState().createConversation('ide', null, 'agent-1');

      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove specific listener when multiple exist', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.getState().addEventListener('conversation:created', listener1);
      const unsubscribe = store.getState().addEventListener('conversation:created', listener2);

      unsubscribe();
      store.getState().createConversation('ide', null, 'agent-1');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const successListener = vi.fn();

      store.getState().addEventListener('conversation:created', errorListener);
      store.getState().addEventListener('conversation:created', successListener);

      // Should not throw
      expect(() => {
        store.getState().createConversation('ide', null, 'agent-1');
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event Metadata', () => {
    it('should include timestamp in events', () => {
      const before = Date.now();
      store.getState().createConversation('ide', null, 'agent-1');
      const after = Date.now();

      const history = store.getState().getEventHistory();
      expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(history[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should include entity data in events', () => {
      const _conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const history = store.getState().getEventHistory({ type: 'conversation:created' });

      expect(history[0].data).toBeDefined();
      expect((history[0].data as any).workspaceType).toBe('ide');
    });
  });
});
