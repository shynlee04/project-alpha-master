import type { ThreadMessage } from '../types';
import { MessageWithId } from '../message-crud-slice';
import { createTestConversationStore } from './test-helper';

vi.mock('@/infrastructure/persistence/dexie-storage', () => ({
  createDexieStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })
}));

const createTestStore = createTestConversationStore;

describe('Message CRUD Slice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should create message with auto-generated ID', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'user',
      content: 'Hello, AI!',
    });

    expect(messageId).toBeDefined();
    expect(messageId).toMatch(/^msg_\d+_[a-z0-9]+$/);

    const message = store.getState().getMessage(messageId);
    expect(message).toBeDefined();
    expect(message?.id).toBe(messageId);
    expect(message?.threadId).toBe('thread-1');
  });

  it('should create message with timestamp', () => {
    const before = Date.now();
    const messageId = store.getState().addMessage('thread-1', {
      role: 'assistant',
      content: 'Hello, user!',
    });
    const after = Date.now();

    const message = store.getState().getMessage(messageId);
    expect(message?.timestamp).toBeGreaterThanOrEqual(before);
    expect(message?.timestamp).toBeLessThanOrEqual(after);
  });

  it('should create user message', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'user',
      content: 'Test message',
    });

    const message = store.getState().getMessage(messageId);
    expect(message?.role).toBe('user');
    expect(message?.content).toBe('Test message');
  });

  it('should create assistant message with attribution', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'assistant',
      content: 'Response',
      agentId: 'agent-123',
      agentName: 'Claude',
      agentModel: 'claude-3-5-sonnet',
    });

    const message = store.getState().getMessage(messageId);
    expect(message?.role).toBe('assistant');
    expect(message?.agentId).toBe('agent-123');
    expect(message?.agentName).toBe('Claude');
    expect(message?.agentModel).toBe('claude-3-5-sonnet');
  });

  it('should create system message', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'system',
      content: 'System instructions',
    });

    const message = store.getState().getMessage(messageId);
    expect(message?.role).toBe('system');
    expect(message?.content).toBe('System instructions');
  });

  it('should update message content', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'user',
      content: 'Original',
    });

    store.getState().updateMessage(messageId, { content: 'Updated' });

    const updated = store.getState().getMessage(messageId);
    expect(updated?.content).toBe('Updated');
  });

  it('should delete message', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'user',
      content: 'Delete me',
    });

    store.getState().deleteMessage(messageId);

    const deleted = store.getState().getMessage(messageId);
    expect(deleted).toBeUndefined();
  });

  it('should get messages by thread ordered by timestamp', () => {
    const threadId = 'thread-1';
    const msg1 = store.getState().addMessage(threadId, { role: 'user', content: 'First' });
    const msg2 = store.getState().addMessage(threadId, { role: 'assistant', content: 'Second' });
    const msg3 = store.getState().addMessage(threadId, { role: 'user', content: 'Third' });

    const messages = store.getState().getMessagesByThread(threadId);

    expect(messages).toHaveLength(3);
    expect(messages[0].id).toBe(msg1);
    expect(messages[1].id).toBe(msg2);
    expect(messages[2].id).toBe(msg3);
  });

  it('should filter messages by thread', () => {
    store.getState().addMessage('thread-1', { role: 'user', content: 'Thread 1' });
    store.getState().addMessage('thread-2', { role: 'user', content: 'Thread 2' });
    store.getState().addMessage('thread-1', { role: 'assistant', content: 'Thread 1 response' });

    const thread1Messages = store.getState().getMessagesByThread('thread-1');

    expect(thread1Messages).toHaveLength(2);
    expect(thread1Messages.every(m => m.threadId === 'thread-1')).toBe(true);
  });

  it('should get last message in thread', () => {
    const threadId = 'thread-1';
    store.getState().addMessage(threadId, { role: 'user', content: 'First' });
    store.getState().addMessage(threadId, { role: 'assistant', content: 'Second' });
    const lastId = store.getState().addMessage(threadId, { role: 'user', content: 'Third' });

    const last = store.getState().getLastMessage(threadId);

    expect(last).toBeDefined();
    expect(last?.id).toBe(lastId);
    expect(last?.content).toBe('Third');
  });

  it('should return undefined for last message in empty thread', () => {
    const last = store.getState().getLastMessage('thread-empty');
    expect(last).toBeUndefined();
  });

  it('should create message with tool calls', () => {
    const messageId = store.getState().addMessage('thread-1', {
      role: 'assistant',
      content: 'Let me check that for you.',
      toolCalls: [
        {
          id: 'call-1',
          name: 'search',
          status: 'success',
          input: { query: 'test' },
          output: { results: [] },
        },
      ],
    });

    const message = store.getState().getMessage(messageId);
    expect(message?.toolCalls).toBeDefined();
    expect(message?.toolCalls).toHaveLength(1);
    expect(message?.toolCalls?.[0].name).toBe('search');
  });
});
