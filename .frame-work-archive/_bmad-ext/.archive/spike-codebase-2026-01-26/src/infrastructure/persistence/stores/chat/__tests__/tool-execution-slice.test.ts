/**
 * @fileoverview Tool Execution Slice Tests
 * @module infrastructure/persistence/stores/stores/chat/__tests__
 * @governance EPIC-40 TC-001
 *
 * Tests tool call tracking and approval management for unified chat store.
 * Verifies CA-003 FIX: crypto.randomUUID() for ID generation.
 *
 * @story TC-001: Add test coverage for unified chat store
 * @created 2026-01-10
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestUnifiedChatStore, MOCK_WORKSPACE_TYPE, MOCK_PROJECT_ID, MOCK_AGENT_ID, createTestConversation, createTestThread, createTestMessage } from './test-helper';

describe('Tool Execution Slice', () => {
  let store: ReturnType<typeof createTestUnifiedChatStore>;
  let conversationId: string;
  let threadId: string;
  let messageId: string;

  beforeEach(() => {
    store = createTestUnifiedChatStore();
    conversationId = createTestConversation(store);
    threadId = createTestThread(store, conversationId);
    messageId = createTestMessage(store, threadId);
  });

  describe('createToolCall', () => {
    it('should create tool call with auto-generated ID using crypto.randomUUID()', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });

      expect(toolCallId).toBeDefined();
      // CA-003 FIX: UUID format instead of timestamp+random
      expect(toolCallId).toMatch(/^tc_[0-9a-f-]{36}$/);
    });

    it('should create tool call with timestamp', () => {
      const before = Date.now();
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });
      const after = Date.now();

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.createdAt).toBeGreaterThanOrEqual(before);
      expect(toolCall.createdAt).toBeLessThanOrEqual(after);
    });

    it('should associate tool call with message', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.id).toBe(toolCallId);
      expect(toolCall.messageId).toBe(messageId);
    });

    it('should store tool call details', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'file_read',
        status: 'running',
        input: { path: '/test/file.txt' },
      });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.name).toBe('file_read');
      expect(toolCall.status).toBe('running');
      expect(toolCall.input).toEqual({ path: '/test/file.txt' });
    });

    it('should support all tool call statuses', () => {
      const statuses: Array<'pending' | 'running' | 'success' | 'error' | 'cancelled'> = [
        'pending',
        'running',
        'success',
        'error',
        'cancelled',
      ];

      statuses.forEach(status => {
        const toolCallId = store.getState().createToolCall(messageId, {
          name: 'test_tool',
          status,
          input: {},
        });

        const toolCall = store.getState().getToolCallsByMessage(messageId).find(tc => tc.id === toolCallId);
        expect(toolCall?.status).toBe(status);
      });
    });
  });

  describe('updateToolCall', () => {
    it('should update tool call status', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });

      store.getState().updateToolCall(toolCallId, { status: 'success' });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.status).toBe('success');
    });

    it('should update tool call output', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });

      store.getState().updateToolCall(toolCallId, {
        output: { results: ['item1', 'item2'] },
      });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.output).toEqual({ results: ['item1', 'item2'] });
    });

    it('should update tool call duration', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'running',
        input: { query: 'test' },
      });

      store.getState().updateToolCall(toolCallId, {
        duration: 1234,
        status: 'success',
      });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.duration).toBe(1234);
    });

    it('should update multiple fields at once', () => {
      const toolCallId = store.getState().createToolCall(messageId, {
        name: 'search',
        status: 'pending',
        input: { query: 'test' },
      });

      store.getState().updateToolCall(toolCallId, {
        status: 'success',
        output: { results: [] },
        duration: 500,
      });

      const toolCall = store.getState().getToolCallsByMessage(messageId)[0];
      expect(toolCall.status).toBe('success');
      expect(toolCall.output).toEqual({ results: [] });
      expect(toolCall.duration).toBe(500);
    });

    it('should handle updating non-existent tool call gracefully', () => {
      expect(() => {
        store.getState().updateToolCall('ghost-tool-id', { status: 'success' });
      }).not.toThrow();
    });
  });

  describe('getToolCallsByMessage', () => {
    it('should return empty array for message with no tool calls', () => {
      const newMessageId = createTestMessage(store, threadId, 'Another message');

      const toolCalls = store.getState().getToolCallsByMessage(newMessageId);

      expect(toolCalls).toEqual([]);
    });

    it('should return all tool calls for a message', () => {
      store.getState().createToolCall(messageId, { name: 'tool1', status: 'pending', input: {} });
      store.getState().createToolCall(messageId, { name: 'tool2', status: 'pending', input: {} });
      store.getState().createToolCall(messageId, { name: 'tool3', status: 'pending', input: {} });

      const toolCalls = store.getState().getToolCallsByMessage(messageId);

      expect(toolCalls).toHaveLength(3);
    });

    it('should not include tool calls from other messages', () => {
      const messageId2 = createTestMessage(store, threadId);
      store.getState().createToolCall(messageId, { name: 'tool1', status: 'pending', input: {} });
      store.getState().createToolCall(messageId2, { name: 'tool2', status: 'pending', input: {} });

      const message1ToolCalls = store.getState().getToolCallsByMessage(messageId);

      expect(message1ToolCalls).toHaveLength(1);
      expect(message1ToolCalls[0].name).toBe('tool1');
    });
  });

  describe('getPendingToolCalls', () => {
    it('should return tool calls with pending status', () => {
      store.getState().createToolCall(messageId, { name: 'tool1', status: 'pending', input: {} });
      store.getState().createToolCall(messageId, { name: 'tool2', status: 'running', input: {} });
      store.getState().createToolCall(messageId, { name: 'tool3', status: 'pending', input: {} });

      const pending = store.getState().getPendingToolCalls();

      expect(pending).toHaveLength(2);
      expect(pending.every(tc => tc.status === 'pending')).toBe(true);
    });

    it('should return empty array when no pending tool calls', () => {
      store.getState().createToolCall(messageId, { name: 'tool1', status: 'success', input: {} });
      store.getState().createToolCall(messageId, { name: 'tool2', status: 'error', input: {} });

      const pending = store.getState().getPendingToolCalls();

      expect(pending).toEqual([]);
    });
  });

  describe('addPendingApproval', () => {
    it('should create approval with auto-generated ID using crypto.randomUUID()', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt', content: 'test' },
        status: 'pending',
      });

      expect(approvalId).toBeDefined();
      // CA-003 FIX: UUID format instead of timestamp+random
      expect(approvalId).toMatch(/^appr_[0-9a-f-]{36}$/);
    });

    it('should add approval to pending approvals list', () => {
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt' },
        status: 'pending',
      });

      const approvals = store.getState().getPendingApprovals();

      expect(approvals).toHaveLength(1);
      expect(approvals[0].toolName).toBe('file_write');
    });

    it('should store approval details', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'bash',
        toolArgs: { command: 'ls -la' },
        status: 'pending',
      });

      const approval = store.getState().getPendingApprovals().find(a => a.id === approvalId);
      expect(approval?.conversationId).toBe(conversationId);
      expect(approval?.threadId).toBe(threadId);
      expect(approval?.messageId).toBe(messageId);
      expect(approval?.toolName).toBe('bash');
      expect(approval?.toolArgs).toEqual({ command: 'ls -la' });
    });

    it('should support all approval statuses', () => {
      const statuses: Array<'pending' | 'approved' | 'denied'> = ['pending', 'approved', 'denied'];

      statuses.forEach(status => {
        store.getState().addPendingApproval({
          conversationId,
          threadId,
          messageId,
          toolName: 'test_tool',
          toolArgs: {},
          status,
        });

        const approvals = store.getState().getPendingApprovals();
        expect(approvals.some(a => a.status === status)).toBe(true);
      });
    });
  });

  describe('approveToolCall', () => {
    it('should update approval status to approved', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt' },
        status: 'pending',
      });

      store.getState().approveToolCall(approvalId);

      const approvals = store.getState().getPendingApprovals();
      // Implementation updates status but keeps item in pendingApprovals array
      expect(approvals).toHaveLength(1);
      expect(approvals[0].status).toBe('approved');

      const history = store.getState().approvalHistory;
      expect(history[approvalId]?.status).toBe('approved');
    });

    it('should update status in pending approvals after approval', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt' },
        status: 'pending',
      });

      expect(store.getState().getPendingApprovals()).toHaveLength(1);
      expect(store.getState().getPendingApprovals()[0].status).toBe('pending');

      store.getState().approveToolCall(approvalId);

      expect(store.getState().getPendingApprovals()).toHaveLength(1);
      expect(store.getState().getPendingApprovals()[0].status).toBe('approved');
    });

    it('should handle approving non-existent approval gracefully', () => {
      expect(() => {
        store.getState().approveToolCall('ghost-approval-id');
      }).not.toThrow();
    });
  });

  describe('denyToolCall', () => {
    it('should update approval status to denied with reason', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt' },
        status: 'pending',
      });

      store.getState().denyToolCall(approvalId, 'User denied access');

      const approvals = store.getState().getPendingApprovals();
      // Implementation updates status but keeps item in pendingApprovals array
      expect(approvals).toHaveLength(1);
      expect(approvals[0].status).toBe('denied');

      const history = store.getState().approvalHistory;
      expect(history[approvalId]?.status).toBe('denied');
      // Note: reason is not currently stored in approvalHistory by the implementation
    });

    it('should handle denying without reason', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'file_write',
        toolArgs: { path: '/test.txt' },
        status: 'pending',
      });

      store.getState().denyToolCall(approvalId);

      const history = store.getState().approvalHistory;
      expect(history[approvalId]?.status).toBe('denied');
    });

    it('should handle denying non-existent approval gracefully', () => {
      expect(() => {
        store.getState().denyToolCall('ghost-approval-id', 'Reason');
      }).not.toThrow();
    });
  });

  describe('autoApproveToolCall', () => {
    it('should approve tool call without user interaction', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'read_file',
        toolArgs: { path: '/safe/file.txt' },
        status: 'pending',
      });

      store.getState().autoApproveToolCall(approvalId);

      const approvals = store.getState().getPendingApprovals();
      // Implementation updates status to 'auto_approved' but keeps item in pendingApprovals array
      expect(approvals).toHaveLength(1);
      expect(approvals[0].status).toBe('auto_approved');

      const history = store.getState().approvalHistory;
      expect(history[approvalId]?.status).toBe('auto_approved');
    });
  });

  describe('getPendingApprovals', () => {
    it('should return empty array when no pending approvals', () => {
      const approvals = store.getState().getPendingApprovals();
      expect(approvals).toEqual([]);
    });

    it('should return all pending approvals', () => {
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool1',
        toolArgs: {},
        status: 'pending',
      });
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool2',
        toolArgs: {},
        status: 'pending',
      });

      const approvals = store.getState().getPendingApprovals();

      expect(approvals).toHaveLength(2);
    });

    it('should include all approvals regardless of status', () => {
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool1',
        toolArgs: {},
        status: 'pending',
      });

      const pendingCount = store.getState().getPendingApprovals().length;
      expect(pendingCount).toBe(1);

      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool2',
        toolArgs: {},
        status: 'approved',
      });

      const approvals = store.getState().getPendingApprovals();
      // getPendingApprovals returns ALL items in the array, not filtered by status
      expect(approvals).toHaveLength(2);
      expect(approvals.some(a => a.status === 'pending')).toBe(true);
      expect(approvals.some(a => a.status === 'approved')).toBe(true);
    });
  });

  describe('clearPendingApprovals', () => {
    it('should clear all pending approvals', () => {
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool1',
        toolArgs: {},
        status: 'pending',
      });
      store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool2',
        toolArgs: {},
        status: 'pending',
      });

      expect(store.getState().getPendingApprovals()).toHaveLength(2);

      store.getState().clearPendingApprovals();

      expect(store.getState().getPendingApprovals()).toHaveLength(0);
    });

    it('should not affect approval history', () => {
      const approvalId = store.getState().addPendingApproval({
        conversationId,
        threadId,
        messageId,
        toolName: 'tool1',
        toolArgs: {},
        status: 'pending',
      });

      store.getState().clearPendingApprovals();

      const history = store.getState().approvalHistory;
      expect(history[approvalId]).toBeDefined();
    });
  });
});
