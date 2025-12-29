import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ToolExecutionLogRecord } from '../../state/dexie-db';

// Create mock functions
const mockAdd = vi.fn();
const mockUpdate = vi.fn();
const mockToArray = vi.fn();
const mockClear = vi.fn();
const mockDelete = vi.fn();

// Mock dexie-db module
vi.mock('../../state/dexie-db', () => ({
  db: {
    toolExecutionLogs: {
      add: mockAdd,
      update: mockUpdate,
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: mockToArray
        }))
      })),
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([]))
        }))
      })),
      toArray: mockToArray,
      clear: mockClear,
      delete: mockDelete
    }
  },
  addToolExecutionLog: vi.fn((log: ToolExecutionLogRecord) => mockAdd(log)),
  updateToolExecutionLog: vi.fn((id: string, updates: Partial<ToolExecutionLogRecord>) => mockUpdate(id, updates)),
  getToolExecutionLogs: vi.fn(() => {
    // This will be overridden by mockToArray.mockResolvedValue in tests
    return mockToArray();
  }),
  clearToolExecutionLogs: vi.fn((conversationId?: string) => conversationId ? mockDelete(conversationId) : mockClear())
}));

// Import after mocking
const { ToolExecutionLogger, toolExecutionLogger } = await import('../tool-execution-logger');

describe('ToolExecutionLogger', () => {
  let logger: InstanceType<typeof ToolExecutionLogger>;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new ToolExecutionLogger();
    mockAdd.mockResolvedValue(undefined);
    mockUpdate.mockResolvedValue(undefined);
  });

  describe('logExecution', () => {
    it('should create a log entry with all required fields', async () => {
      const context = {
        conversationId: 'conv-1',
        messageId: 'msg-1'
      };
      const params = { path: '/test/file.txt' };
      const toolName = 'read_file';

      const logId = await logger.logExecution(context, toolName, params);

      expect(logId).toBeDefined();
      expect(mockAdd).toHaveBeenCalled();
      const savedLog = mockAdd.mock.calls[0][0];
      expect(savedLog.conversationId).toBe('conv-1');
      expect(savedLog.messageId).toBe('msg-1');
      expect(savedLog.toolName).toBe('read_file');
      expect(savedLog.args).toEqual(params);
      expect(savedLog.status).toBe('pending');
      expect(savedLog.timestamp).toBeDefined();
    });

    it('should generate unique log IDs', async () => {
      const context = { conversationId: 'conv-1', messageId: 'msg-1' };

      const logId1 = await logger.logExecution(context, 'tool1', {});
      const logId2 = await logger.logExecution(context, 'tool2', {});

      expect(logId1).not.toBe(logId2);
    });
  });

  describe('updateExecution', () => {
    it('should update log with execution result', async () => {
      const logId = 'log-123';
      const updates = {
        status: 'executed' as const,
        result: { success: true, output: 'file content' },
        approved: true,
        duration: 150
      };

      await logger.updateExecution(logId, updates);

      expect(mockUpdate).toHaveBeenCalledWith(logId, updates);
    });

    it('should update log with error result', async () => {
      const logId = 'log-456';
      const updates = {
        status: 'error' as const,
        result: { success: false, error: 'File not found' },
        duration: 50
      };

      await logger.updateExecution(logId, updates);

      expect(mockUpdate).toHaveBeenCalledWith(logId, updates);
    });
  });

  describe('getLogsForConversation', () => {
    it('should return all logs for a conversation', async () => {
      const mockLogs: ToolExecutionLogRecord[] = [
        { id: 'log-1', conversationId: 'conv-1', messageId: 'msg-1', toolName: 'read', args: {}, status: 'executed', timestamp: 1000 },
        { id: 'log-2', conversationId: 'conv-1', messageId: 'msg-2', toolName: 'write', args: {}, status: 'executed', timestamp: 2000 }
      ];
      mockToArray.mockResolvedValue(mockLogs);

      const logs = await logger.getLogsForConversation('conv-1');

      expect(logs).toEqual(mockLogs);
      expect(mockWhere).toHaveBeenCalledWith('conversationId');
    });

    it('should return empty array when no logs exist', async () => {
      mockToArray.mockResolvedValue([]);

      const logs = await logger.getLogsForConversation('non-existent');

      expect(logs).toEqual([]);
    });
  });

  describe('clearConversationLogs', () => {
    it('should clear logs for specific conversation', async () => {
      mockDelete.mockResolvedValue(undefined);

      await logger.clearConversationLogs('conv-1');

      expect(mockDelete).toHaveBeenCalledWith('conv-1');
    });

    it('should clear all logs when no conversation specified', async () => {
      mockClear.mockResolvedValue(undefined);

      await logger.clearConversationLogs();

      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('isTrustedTool', () => {
    it('should return true when tool was previously approved', async () => {
      const mockLogs: ToolExecutionLogRecord[] = [
        { id: 'log-1', conversationId: 'conv-1', messageId: 'msg-1', toolName: 'read_file', args: {}, status: 'executed', approved: true, timestamp: 1000 }
      ];
      mockToArray.mockResolvedValue(mockLogs);

      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');

      expect(isTrusted).toBe(true);
    });

    it('should return false when tool was never approved', async () => {
      const mockLogs: ToolExecutionLogRecord[] = [
        { id: 'log-1', conversationId: 'conv-1', messageId: 'msg-1', toolName: 'write_file', args: {}, status: 'executed', approved: false, timestamp: 1000 }
      ];
      mockToArray.mockResolvedValue(mockLogs);

      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');

      expect(isTrusted).toBe(false);
    });

    it('should return false when tool had errors', async () => {
      const mockLogs: ToolExecutionLogRecord[] = [
        { id: 'log-1', conversationId: 'conv-1', messageId: 'msg-1', toolName: 'read_file', args: {}, status: 'error', approved: true, timestamp: 1000 }
      ];
      mockToArray.mockResolvedValue(mockLogs);

      const isTrusted = await logger.isTrustedTool('conv-1', 'read_file');

      expect(isTrusted).toBe(false);
    });
  });

  describe('getTrustedTools', () => {
    it('should return list of trusted tool names', async () => {
      const mockLogs: ToolExecutionLogRecord[] = [
        { id: 'log-1', conversationId: 'conv-1', messageId: 'msg-1', toolName: 'read_file', args: {}, status: 'executed', approved: true, timestamp: 1000 },
        { id: 'log-2', conversationId: 'conv-1', messageId: 'msg-2', toolName: 'write_file', args: {}, status: 'executed', approved: true, timestamp: 2000 },
        { id: 'log-3', conversationId: 'conv-1', messageId: 'msg-3', toolName: 'read_file', args: {}, status: 'executed', approved: true, timestamp: 3000 }
      ];
      mockToArray.mockResolvedValue(mockLogs);

      const trustedTools = await logger.getTrustedTools('conv-1');

      expect(trustedTools).toEqual(['read_file', 'write_file']);
    });
  });
});
