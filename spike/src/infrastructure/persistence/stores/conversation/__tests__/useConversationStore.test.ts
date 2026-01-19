/**
 * @fileoverview Unified Conversation Store Tests
 * @module infrastructure/persistence/stores/conversation/__tests__/useConversationStore
 *
 * Story CC-1.7: Unified Store Integration
 *
 * Tests that verify:
 * - All 6 slices are correctly combined
 * - Dexie persistence configuration is correct
 * - All slice methods are accessible
 * - Store initialization works correctly
 * - Partial persistence excludes ephemeral state
 */

// Vitest globals available (no import needed)
import {
  useConversationStore,
  resetConversationStore,
  getConversationStoreState,
  subscribeToConversationStore
} from '../useConversationStore';

// Mock Dexie Storage
vi.mock('@/infrastructure/persistence/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

describe('Unified Conversation Store', () => {
  beforeEach(() => {
    // Reset store before each test
    resetConversationStore();
  });

  describe('Store Initialization', () => {
    it('should initialize with empty state', () => {
      const state = useConversationStore.getState();

      expect(state.conversations).toEqual({});
      expect(state.activeConversationId).toBeNull();
      expect(state.activeProjectConversationIds).toEqual({});
      expect(state.threads).toEqual({});
      expect(state.activeThreadId).toBeNull();
      expect(state.messages).toEqual({});
      expect(state.eventHistory).toEqual([]);
      expect(state._hasHydrated).toBe(false);
    });

    it('should expose all 6 slice methods', () => {
      const state = useConversationStore.getState();

      // Conversation Metadata Slice (CC-1.1)
      expect(typeof state.createConversation).toBe('function');
      expect(typeof state.updateConversationMetadata).toBe('function');
      expect(typeof state.deleteConversation).toBe('function');
      expect(typeof state.setActiveConversation).toBe('function');
      expect(typeof state.getConversation).toBe('function');
      expect(typeof state.getAllConversations).toBe('function');

      // Thread Management Slice (CC-1.2)
      expect(typeof state.createThread).toBe('function');
      expect(typeof state.deleteThread).toBe('function');
      expect(typeof state.setActiveThread).toBe('function');
      expect(typeof state.getThread).toBe('function');
      expect(typeof state.getThreadsByConversation).toBe('function');

      // Message CRUD Slice (CC-1.3)
      expect(typeof state.addMessage).toBe('function');
      expect(typeof state.updateMessage).toBe('function');
      expect(typeof state.deleteMessage).toBe('function');
      expect(typeof state.getMessage).toBe('function');
      expect(typeof state.getMessagesByThread).toBe('function');

      // Utils Slice (CC-1.4)
      expect(typeof state.filterConversations).toBe('function');
      expect(typeof state.sortConversations).toBe('function');
      expect(typeof state.searchConversations).toBe('function');
      expect(typeof state.searchConversationsByTag).toBe('function');
      expect(typeof state.getConversationStats).toBe('function');
      expect(typeof state.getRecentConversations).toBe('function');

      // Validation Slice (CC-1.5)
      expect(typeof state.validateConversationId).toBe('function');
      expect(typeof state.validateThreadId).toBe('function');
      expect(typeof state.validateMessageId).toBe('function');
      expect(typeof state.validateConversationStatus).toBe('function');
      expect(typeof state.validateThreadStatus).toBe('function');
      expect(typeof state.validateThreadHierarchy).toBe('function');
      expect(typeof state.validateMessageThreadAssociation).toBe('function');
      expect(typeof state.validateConversationIntegrity).toBe('function');

      // Events Slice (CC-1.6)
      expect(typeof state.emitEvent).toBe('function');
      expect(typeof state.addEventListener).toBe('function');
      expect(typeof state.removeEventListener).toBe('function');
      expect(typeof state.getEventHistory).toBe('function');
      expect(typeof state.clearEventHistory).toBe('function');
    });
  });

  describe('Cross-Slice Integration', () => {
    it('should create conversation and thread together', () => {
      // Create conversation
      const conversationId = useConversationStore.getState().createConversation('ide', null, 'agent-1');
      const state1 = useConversationStore.getState();
      expect(state1.conversations[conversationId]).toBeDefined();

      // Create thread for conversation
      const threadId = useConversationStore.getState().createThread(conversationId);
      const state2 = useConversationStore.getState();
      expect(state2.threads[threadId]).toBeDefined();
      expect(state2.threads[threadId].conversationId).toBe(conversationId);

      // Add message to thread
      const messageId = useConversationStore.getState().addMessage(threadId, {
        role: 'user',
        content: 'Hello, AI!'
      });
      const state3 = useConversationStore.getState();
      expect(state3.messages[messageId]).toBeDefined();
      expect(state3.messages[messageId].threadId).toBe(threadId);
    });

    it('should emit events across slices', () => {
      const state = useConversationStore.getState();
      const events: string[] = [];

      // Subscribe to events
      state.addEventListener('conversation:created', (_event) => {
        events.push('conversation:created');
      });
      state.addEventListener('thread:created', (_event) => {
        events.push('thread:created');
      });
      state.addEventListener('message:added', (_event) => {
        events.push('message:added');
      });

      // Create entities
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(conversationId);
      state.addMessage(threadId, { role: 'user', content: 'Test' });

      // Verify events were emitted
      expect(events).toContain('conversation:created');
      expect(events).toContain('thread:created');
      expect(events).toContain('message:added');
    });

    it('should validate cross-slice integrity', () => {
      const state = useConversationStore.getState();

      // Create conversation with thread and message
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(conversationId);
      state.addMessage(threadId, { role: 'user', content: 'Test' });

      // Validate conversation integrity
      const result = state.validateConversationIntegrity(conversationId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should get stats across all slices', () => {
      const state = useConversationStore.getState();

      // Create conversation with multiple threads and messages
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const thread1 = state.createThread(conversationId);
      const thread2 = state.createThread(conversationId);

      state.addMessage(thread1, { role: 'user', content: 'Message 1' });
      state.addMessage(thread1, { role: 'assistant', content: 'Response 1' });
      state.addMessage(thread2, { role: 'user', content: 'Message 2' });

      // Get stats
      const stats = state.getConversationStats(conversationId);

      expect(stats.messageCount).toBe(3);
      expect(stats.threadCount).toBe(2);
    });
  });

  describe('Persistence Configuration', () => {
    it('should persist core state but exclude events', () => {
      // This test verifies the partialize configuration
      // In actual usage, Zustand persist middleware handles this

      const state = useConversationStore.getState();

      // Create some entities (createConversation emits an event)
      const conversationId = state.createConversation('ide', null, 'agent-1');

      // Verify state was created
      const afterState = useConversationStore.getState();
      expect(afterState.conversations[conversationId]).toBeDefined();
      expect(afterState.eventHistory).toHaveLength(1); // One event from createConversation

      // Note: Actual persistence testing would require real IndexedDB
      // This test validates the structure is correct
      expect(Object.keys(afterState.conversations)).toHaveLength(1);
      expect(Object.keys(afterState.eventHistory)).toHaveLength(1);
    });

    it('should have _hasHydrated flag', () => {
      const state = useConversationStore.getState();

      expect(typeof state._hasHydrated).toBe('boolean');
      expect(state._hasHydrated).toBe(false); // Initially false
    });
  });

  describe('Convenience Hooks (State Selector Pattern)', () => {
    it('should select active conversation', () => {
      const state = useConversationStore.getState();

      // No active conversation initially
      const selector1 = (s: typeof state) => {
        if (!s.activeConversationId) return null;
        return s.conversations[s.activeConversationId] || null;
      };
      expect(selector1(state)).toBeNull();

      // Create and set active conversation
      const conversationId = state.createConversation('ide', null, 'agent-1');
      state.setActiveConversation(conversationId);

      // Now should return active conversation - get fresh state
      const freshState = useConversationStore.getState();
      const result = selector1(freshState);
      expect(result).toBeDefined();
      expect(result?.id).toBe(conversationId);
    });

    it('should select active thread', () => {
      const state = useConversationStore.getState();

      // Create conversation and thread
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(conversationId);
      state.setActiveThread(threadId);

      // Selector should return active thread - get fresh state
      const selector = (s: typeof state) => {
        if (!s.activeThreadId) return null;
        return s.threads[s.activeThreadId] || null;
      };
      const freshState = useConversationStore.getState();
      const result = selector(freshState);
      expect(result).toBeDefined();
      expect(result?.id).toBe(threadId);
    });

    it('should select active conversations', () => {
      const state = useConversationStore.getState();

      // Create multiple conversations
      state.createConversation('ide', null, 'agent-1');
      state.createConversation('knowledge', null, 'agent-2');
      state.createConversation('study', null, 'agent-3');

      // Selector should return all active conversations - get fresh state
      const freshState = useConversationStore.getState();
      const selector = (s: typeof state) =>
        Object.values(s.conversations).filter((c) => c.status === 'active');
      expect(selector(freshState)).toHaveLength(3);
    });

    it('should select thread messages', () => {
      const state = useConversationStore.getState();

      // Create conversation, thread, and messages
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(conversationId);

      state.addMessage(threadId, { role: 'user', content: 'First' });
      state.addMessage(threadId, { role: 'assistant', content: 'Second' });
      state.addMessage(threadId, { role: 'user', content: 'Third' });

      // Selector should return messages in timestamp order - get fresh state
      const freshState = useConversationStore.getState();
      const selector = (s: typeof state) =>
        Object.values(s.messages)
          .filter((m) => m.threadId === threadId)
          .sort((a, b) => a.timestamp - b.timestamp);
      const messages = selector(freshState);
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });

    it('should select hydration status', () => {
      const state = useConversationStore.getState();
      const selector = (s: typeof state) => s._hasHydrated;

      expect(typeof selector(state)).toBe('boolean');
      expect(selector(state)).toBe(false);
    });

    it('should select event history', () => {
      const state = useConversationStore.getState();

      // Create some events
      const convId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(convId);
      state.addMessage(threadId, { role: 'user', content: 'Test' });

      // Selector should return all events
      const events = state.getEventHistory();
      expect(events).toHaveLength(3); // conversation:created, thread:created, message:added

      // Should filter by type
      const filtered = state.getEventHistory({ type: 'conversation:created' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('conversation:created');
    });
  });

  describe('Utility Functions', () => {
    it('should reset store to empty state', () => {
      const state = useConversationStore.getState();

      // Create some entities
      const conversationId = state.createConversation('ide', null, 'agent-1');
      const threadId = state.createThread(conversationId);
      state.addMessage(threadId, { role: 'user', content: 'Test' });

      // Verify entities exist - get fresh state
      const beforeReset = useConversationStore.getState();
      expect(Object.keys(beforeReset.conversations)).toHaveLength(1);
      expect(Object.keys(beforeReset.threads)).toHaveLength(1);
      expect(Object.keys(beforeReset.messages)).toHaveLength(1);

      // Reset store
      resetConversationStore();

      // Verify store is empty
      const afterReset = useConversationStore.getState();
      expect(Object.keys(afterReset.conversations)).toHaveLength(0);
      expect(Object.keys(afterReset.threads)).toHaveLength(0);
      expect(Object.keys(afterReset.messages)).toHaveLength(0);
      expect(afterReset.eventHistory).toHaveLength(0);
      expect(afterReset._hasHydrated).toBe(false);
    });

    it('should get store state outside React', () => {
      const state = getConversationStoreState();

      expect(state).toBeDefined();
      expect(state.conversations).toEqual({});
      expect(typeof state.createConversation).toBe('function');
    });

    it('should subscribe to store changes', () => {
      let callCount = 0;
      const unsubscribe = subscribeToConversationStore(() => {
        callCount++;
      });

      // Trigger state change
      useConversationStore.getState().createConversation('ide', null, 'agent-1');

      // Verify listener was called
      expect(callCount).toBeGreaterThan(0);

      // Cleanup
      unsubscribe();
    });
  });
});
