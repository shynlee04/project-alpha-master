/**
 * @fileoverview Message CRUD Slice Tests
 * @module infrastructure/persistence/stores/chat/__tests__
 * @governance EPIC-40 TC-001
 *
 * Tests message operations within threads for unified chat store.
 * Verifies CA-003 FIX: crypto.randomUUID() for ID generation.
 *
 * @story TC-001: Add test coverage for unified chat store
 * @created 2026-01-10
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUnifiedChatStore, MOCK_WORKSPACE_TYPE, MOCK_PROJECT_ID, MOCK_AGENT_ID, createTestConversation, createTestThread } from './test-helper';

describe('Message CRUD Slice', () => {
  let store: ReturnType<typeof createTestUnifiedChatStore>;
  let conversationId: string;
  let threadId: string;

  beforeEach(() => {
    store = createTestUnifiedChatStore();
    conversationId = createTestConversation(store);
    threadId = createTestThread(store, conversationId);
  });

  describe('addMessage', () => {
    it('should create message with auto-generated ID using crypto.randomUUID()', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Hello, AI!',
      });

      expect(messageId).toBeDefined();
      // CA-003 FIX: UUID format instead of timestamp+random
      expect(messageId).toMatch(/^msg_[0-9a-f-]{36}$/);
    });

    it('should create message with timestamp', () => {
      const before = Date.now();
      const messageId = store.getState().addMessage(threadId, {
        role: 'assistant',
        content: 'Hello, user!',
      });
      const after = Date.now();

      const message = store.getState().getMessage(messageId);
      expect(message?.timestamp).toBeGreaterThanOrEqual(before);
      expect(message?.timestamp).toBeLessThanOrEqual(after);
    });

    it('should create user message', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Test message',
      });

      const message = store.getState().getMessage(messageId);
      expect(message?.role).toBe('user');
      expect(message?.content).toBe('Test message');
    });

    it('should create assistant message with attribution', () => {
      const messageId = store.getState().addMessage(threadId, {
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
      const messageId = store.getState().addMessage(threadId, {
        role: 'system',
        content: 'System instructions',
      });

      const message = store.getState().getMessage(messageId);
      expect(message?.role).toBe('system');
      expect(message?.content).toBe('System instructions');
    });

    it('should create tool role message', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'tool',
        content: '{"result": "success"}',
        toolName: 'search',
      });

      const message = store.getState().getMessage(messageId);
      expect(message?.role).toBe('tool');
      expect(message?.toolName).toBe('search');
    });

    it('should create message with tool calls', () => {
      const messageId = store.getState().addMessage(threadId, {
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

    it('should associate message with thread', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Thread test',
      });

      const message = store.getState().getMessage(messageId);
      expect(message?.threadId).toBe(threadId);
    });
  });

  describe('updateMessage', () => {
    it('should update message content', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Original',
      });

      store.getState().updateMessage(messageId, { content: 'Updated' });

      const updated = store.getState().getMessage(messageId);
      expect(updated?.content).toBe('Updated');
    });

    it('should update multiple fields', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Original',
      });

      store.getState().updateMessage(messageId, {
        content: 'Updated',
        agentId: 'new-agent',
        agentName: 'New Agent',
      });

      const updated = store.getState().getMessage(messageId);
      expect(updated?.content).toBe('Updated');
      expect(updated?.agentId).toBe('new-agent');
      expect(updated?.agentName).toBe('New Agent');
    });

    it('should update tool call status', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'assistant',
        content: 'Processing...',
        toolCalls: [
          {
            id: 'call-1',
            name: 'search',
            status: 'pending',
            input: { query: 'test' },
          },
        ],
      });

      store.getState().updateMessage(messageId, {
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

      const updated = store.getState().getMessage(messageId);
      expect(updated?.toolCalls?.[0].status).toBe('success');
    });

    it('should handle updating non-existent message gracefully', () => {
      expect(() => {
        store.getState().updateMessage('ghost-id', { content: 'Updated' });
      }).not.toThrow();
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Delete me',
      });

      store.getState().deleteMessage(messageId);

      const deleted = store.getState().getMessage(messageId);
      expect(deleted).toBeUndefined();
    });

    it('should handle deleting non-existent message gracefully', () => {
      expect(() => {
        store.getState().deleteMessage('ghost-id');
      }).not.toThrow();
    });
  });

  describe('getMessage', () => {
    it('should return message by ID', () => {
      const messageId = store.getState().addMessage(threadId, {
        role: 'user',
        content: 'Test message',
      });

      const message = store.getState().getMessage(messageId);

      expect(message).toBeDefined();
      expect(message?.id).toBe(messageId);
    });

    it('should return undefined for non-existent message', () => {
      const message = store.getState().getMessage('ghost-id');
      expect(message).toBeUndefined();
    });
  });

  describe('getMessagesByThread', () => {
    it('should return empty array for thread with no messages', () => {
      const newThreadId = createTestThread(store, conversationId);

      const messages = store.getState().getMessagesByThread(newThreadId);

      expect(messages).toEqual([]);
    });

    it('should get messages by thread ordered by timestamp', () => {
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
      const thread2 = createTestThread(store, conversationId);

      store.getState().addMessage(threadId, { role: 'user', content: 'Thread 1' });
      store.getState().addMessage(thread2, { role: 'user', content: 'Thread 2' });
      store.getState().addMessage(threadId, { role: 'assistant', content: 'Thread 1 response' });

      const thread1Messages = store.getState().getMessagesByThread(threadId);

      expect(thread1Messages).toHaveLength(2);
      expect(thread1Messages.every(m => m.threadId === threadId)).toBe(true);
    });
  });

  describe('getLastMessage', () => {
    it('should get last message in thread', () => {
      store.getState().addMessage(threadId, { role: 'user', content: 'First' });
      store.getState().addMessage(threadId, { role: 'assistant', content: 'Second' });
      const lastId = store.getState().addMessage(threadId, { role: 'user', content: 'Third' });

      const last = store.getState().getLastMessage(threadId);

      expect(last).toBeDefined();
      expect(last?.id).toBe(lastId);
      expect(last?.content).toBe('Third');
    });

    it('should return undefined for last message in empty thread', () => {
      const emptyThread = createTestThread(store, conversationId);

      const last = store.getState().getLastMessage(emptyThread);

      expect(last).toBeUndefined();
    });

    it('should return undefined for non-existent thread', () => {
      const last = store.getState().getLastMessage('ghost-thread');
      expect(last).toBeUndefined();
    });

    it('should return single message when only one exists', () => {
      const msgId = store.getState().addMessage(threadId, { role: 'user', content: 'Only message' });

      const last = store.getState().getLastMessage(threadId);

      expect(last?.id).toBe(msgId);
    });
  });
});
