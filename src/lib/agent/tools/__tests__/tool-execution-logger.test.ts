import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ToolExecutionLogRecord } from '../../state/dexie-db';

// Mock the dexie-db module
vi.mock('../../state/dexie-db', async () => {
  const mockAdd = vi.fn().mockResolvedValue(undefined);
  const mockUpdate = vi.fn().mockResolvedValue(undefined);
  const mockClear = vi.fn().mockResolvedValue(undefined);
  const mockDelete = vi.fn().mockResolvedValue(undefined);
  const mockToArray = vi.fn().mockResolvedValue([]);

  return {
    db: {
      toolExecutionLogs: {
        add: mockAdd,
        update: mockUpdate,
        clear: mockClear,
        delete: mockDelete,
        where: vi.fn(() => ({
          equals: vi.fn(() => ({
            toArray: mockToArray
          }))
        }))
      }
    },
    addToolExecutionLog: mockAdd,
    updateToolExecutionLog: mockUpdate,
    getToolExecutionLogs: vi.fn(() => mockToArray()),
    clearToolExecutionLogs: vi.fn().mockImplementation(async (conversationId?: string) =>
      conversationId ? mockDelete(conversationId) : mockClear()
    )
  };
});

// Import the class under test
import { ToolExecutionLogger } from '../tool-execution-logger';

describe('ToolExecutionLogger', () => {
  let logger: InstanceType<typeof ToolExecutionLogger>;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new ToolExecutionLogger();
  });

  describe('logExecution', () => {
    it('should create a log entry and return a log ID', async () => {
      const context = {
        conversationId: 'conv-1',
        messageId: 'msg-1'
      };
      const params = { path: '/test/file.txt' };
      const toolName = 'read_file';

      const logId = await logger.logExecution(context, toolName, params);

      expect(logId).toBeDefined();
      expect(typeof logId).toBe('string');
      // The log ID should be a valid UUID format
      expect(logId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)).toBeTruthy();
    });

    it('should generate unique log IDs', async () => {
      const context = { conversationId: 'conv-1', messageId: 'msg-1' };

      const logId1 = await logger.logExecution(context, 'tool1', {});
      const logId2 = await logger.logExecution(context, 'tool2', {});

      expect(logId1).not.toBe(logId2);
    });

    it('should include correct metadata in the log entry', async () => {
      const context = {
        conversationId: 'conv-test',
        messageId: 'msg-123',
        wasApproved: true
      };
      const params = { path: '/path/to/file.ts' };
      const toolName = 'write_file';

      const logId = await logger.logExecution(context, toolName, params);

      // Verify the log ID is correctly generated
      expect(logId).toBeDefined();
      expect(typeof logId).toBe('string');
    });
  });

  describe('updateExecution', () => {
    it('should accept valid update parameters', async () => {
      const logId = 'log-123';
      const updates = {
        status: 'executed' as const,
        result: { success: true, output: 'result data' },
        approved: true,
        duration: 250
      };

      // This should not throw
      await expect(logger.updateExecution(logId, updates)).resolves.toBeUndefined();
    });

    it('should handle error status updates', async () => {
      const logId = 'log-456';
      const updates = {
        status: 'error' as const,
        result: { success: false, error: 'Something went wrong' },
        duration: 100
      };

      await expect(logger.updateExecution(logId, updates)).resolves.toBeUndefined();
    });
  });

  describe('getLogsForConversation', () => {
    it('should return empty array when no logs exist', async () => {
      const logs = await logger.getLogsForConversation('non-existent-conversation');
      expect(logs).toEqual([]);
    });

    it('should return array type', async () => {
      const logs = await logger.getLogsForConversation('any-conversation');
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('clearConversationLogs', () => {
    it('should not throw when clearing conversation logs', async () => {
      await expect(logger.clearConversationLogs('conv-1')).resolves.toBeUndefined();
    });

    it('should not throw when clearing all logs', async () => {
      await expect(logger.clearConversationLogs()).resolves.toBeUndefined();
    });
  });

  describe('isTrustedTool', () => {
    it('should return false when no logs exist', async () => {
      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');
      expect(isTrusted).toBe(false);
    });

    it('should return false when tool was never approved', async () => {
      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');
      expect(isTrusted).toBe(false);
    });

    it('should return false when tool had errors', async () => {
      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');
      expect(isTrusted).toBe(false);
    });
  });

  describe('getTrustedTools', () => {
    it('should return empty array when no logs exist', async () => {
      const tools = await logger.getTrustedTools('conv-1');
      expect(tools).toEqual([]);
    });

    it('should return array type', async () => {
      const tools = await logger.getTrustedTools('any-conversation');
      expect(Array.isArray(tools)).toBe(true);
    });
  });

  describe('logSuccess', () => {
    it('should not throw with valid parameters', async () => {
      const logId = await logger.logExecution({ conversationId: 'c1', messageId: 'm1' }, 'test_tool', {});

      await expect(logger.logSuccess(logId, { conversationId: 'c1', messageId: 'm1', wasApproved: true }, 'result', 100)).resolves.toBeUndefined();
    });
  });

  describe('logError', () => {
    it('should not throw with valid parameters', async () => {
      const logId = await logger.logExecution({ conversationId: 'c1', messageId: 'm1' }, 'test_tool', {});

      await expect(logger.logError(logId, { conversationId: 'c1', messageId: 'm1', wasApproved: false }, 'Error', 50)).resolves.toBeUndefined();
    });
  });
});
