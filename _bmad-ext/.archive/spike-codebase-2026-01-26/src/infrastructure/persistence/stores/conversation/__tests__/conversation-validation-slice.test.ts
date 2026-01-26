import { createTestConversationStore } from './test-helper';

vi.mock('@/infrastructure/persistence/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

const createTestStore = createTestConversationStore;

describe('Conversation Validation Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('ID Validation', () => {
    it('should validate existing conversation ID', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const result = store.getState().validateConversationId(conversationId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-existent conversation ID', () => {
      const result = store.getState().validateConversationId('conv-nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Conversation conv-nonexistent does not exist');
    });

    it('should reject deleted conversation ID', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().deleteConversation(conversationId);

      const result = store.getState().validateConversationId(conversationId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Conversation ${conversationId} is deleted`);
    });

    it('should validate existing thread ID', () => {
      const threadId = store.getState().createThread('conv-1');
      const result = store.getState().validateThreadId(threadId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-existent thread ID', () => {
      const result = store.getState().validateThreadId('thread-nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Thread thread-nonexistent does not exist');
    });

    it('should reject deleted thread ID', () => {
      const threadId = store.getState().createThread('conv-1');
      store.getState().deleteThread(threadId);

      const result = store.getState().validateThreadId(threadId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Thread ${threadId} is deleted`);
    });

    it('should validate existing message ID', () => {
      const threadId = store.getState().createThread('conv-1');
      const _messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      const result = store.getState().validateMessageId(messageId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-existent message ID', () => {
      const result = store.getState().validateMessageId('msg-nonexistent');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message msg-nonexistent does not exist');
    });
  });

  describe('Status Transition Validation', () => {
    it('should allow valid conversation status transition: active -> archived', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const result = store.getState().validateConversationStatus(conversationId, 'archived');

      expect(result.isValid).toBe(true);
    });

    it('should allow valid conversation status transition: active -> deleted', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const result = store.getState().validateConversationStatus(conversationId, 'deleted');

      expect(result.isValid).toBe(true);
    });

    it('should allow valid conversation status transition: archived -> active', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().updateConversationMetadata(conversationId, { status: 'archived' });
      const result = store.getState().validateConversationStatus(conversationId, 'active');

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid conversation status transition: deleted -> active', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      store.getState().updateConversationMetadata(conversationId, { status: 'deleted' });
      const result = store.getState().validateConversationStatus(conversationId, 'active');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Cannot transition from deleted to active');
    });

    it('should allow valid thread status transition: active -> archived', () => {
      const threadId = store.getState().createThread('conv-1');
      const result = store.getState().validateThreadStatus(threadId, 'archived');

      expect(result.isValid).toBe(true);
    });

    it('should reject invalid thread status transition: deleted -> active', () => {
      const threadId = store.getState().createThread('conv-1');
      store.getState().deleteThread(threadId);
      const result = store.getState().validateThreadStatus(threadId, 'active');

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Cannot transition from deleted to active');
    });
  });

  describe('Hierarchy Integrity Validation', () => {
    it('should validate root thread hierarchy', () => {
      const threadId = store.getState().createThread('conv-1');
      const result = store.getState().validateThreadHierarchy(threadId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate child thread hierarchy', () => {
      const parentId = store.getState().createThread('conv-1');
      const _childId = store.getState().createThread('conv-1', parentId);
      const result = store.getState().validateThreadHierarchy(childId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing parent thread', () => {
      const parentId = store.getState().createThread('conv-1');
      const _childId = store.getState().createThread('conv-1', parentId);

      // Manually corrupt the state to simulate missing parent
      const state = store.getState() as any;
      delete state.threads[parentId];

      const result = store.getState().validateThreadHierarchy(childId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Parent thread') && e.includes('does not exist'))).toBe(true);
    });

    it('should detect parent not referencing child', () => {
      const parentId = store.getState().createThread('conv-1');
      const _childId = store.getState().createThread('conv-1', parentId);

      // Manually corrupt the state to simulate parent not referencing child
      const state = store.getState() as any;
      state.threads[parentId].childThreadIds = [];

      const result = store.getState().validateThreadHierarchy(childId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('does not reference') && e.includes('as child'))).toBe(true);
    });

    it('should detect child not referencing parent', () => {
      const parentId = store.getState().createThread('conv-1');
      const _childId = store.getState().createThread('conv-1', parentId);

      // Manually corrupt the state to simulate child not referencing parent
      const state = store.getState() as any;
      state.threads[childId].parentThreadId = null;

      const result = store.getState().validateThreadHierarchy(parentId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('does not reference') && e.includes('as parent'))).toBe(true);
    });
  });

  describe('Message-Thread Association Validation', () => {
    it('should validate message-thread association', () => {
      const threadId = store.getState().createThread('conv-1');
      const _messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      const result = store.getState().validateMessageThreadAssociation(messageId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect message referencing non-existent thread', () => {
      const threadId = store.getState().createThread('conv-1');
      const _messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });

      // Manually corrupt the state to simulate message referencing deleted thread
      const state = store.getState() as any;
      delete state.threads[threadId];

      const result = store.getState().validateMessageThreadAssociation(messageId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Thread ${threadId} does not exist`);
    });

    it('should detect message referencing deleted thread', () => {
      const threadId = store.getState().createThread('conv-1');
      const _messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });
      store.getState().deleteThread(threadId);

      const result = store.getState().validateMessageThreadAssociation(messageId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Thread ${threadId} is deleted`);
    });
  });

  describe('Conversation Integrity Validation', () => {
    it('should validate conversation with threads and messages', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const thread1 = store.getState().createThread(conversationId);
      const thread2 = store.getState().createThread(conversationId, thread1);
      store.getState().addMessage(thread1, { role: 'user', content: 'Hello' });
      store.getState().addMessage(thread2, { role: 'assistant', content: 'Hi there' });

      const result = store.getState().validateConversationIntegrity(conversationId);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect corrupted thread hierarchy in conversation', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const parentId = store.getState().createThread(conversationId);
      const childId = store.getState().createThread(conversationId, parentId);

      // Manually corrupt the state
      const state = store.getState() as any;
      delete state.threads[parentId];

      const result = store.getState().validateConversationIntegrity(conversationId);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect corrupted message associations in conversation', () => {
      const conversationId = store.getState().createConversation('ide', null, 'agent-1');
      const threadId = store.getState().createThread(conversationId);
      const _messageId = store.getState().addMessage(threadId, { role: 'user', content: 'Test' });

      // Delete the thread (soft-delete)
      store.getState().deleteThread(threadId);

      const result = store.getState().validateConversationIntegrity(conversationId);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Thread') && e.includes('is deleted'))).toBe(true);
    });
  });
});
