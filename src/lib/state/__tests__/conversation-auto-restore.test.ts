import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ConversationThreadRecord } from '../dexie-db';

// Mock requestAnimationFrame for Node.js environment
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));

// Create mock functions
const mockSortBy = vi.fn();
const mockGet = vi.fn();
const mockCount = vi.fn();

// Create a mock chain object that properly returns itself for chaining
const mockWhereResult = {
  equals: vi.fn(() => mockWhereResult),
  sortBy: vi.fn(() => Promise.resolve([])),
  count: vi.fn(() => Promise.resolve(0))
};

// Mock dexie-db module - needs to be a factory for proper chaining
vi.mock('../dexie-db', () => ({
  db: {
    threads: {
      where: vi.fn(() => mockWhereResult),
      sortBy: mockSortBy,
      count: mockCount
    }
  },
  getConversationThread: vi.fn((id: string) => mockGet(id)),
  saveConversationThread: vi.fn(),
  deleteConversationThread: vi.fn()
}));

// Mock conversation store
const mockCreateConversation = vi.fn();
const mockLoadConversation = vi.fn();

vi.mock('../conversation-store', () => ({
  useConversationStore: {
    getState: vi.fn(() => ({
      createConversation: mockCreateConversation,
      loadConversation: mockLoadConversation
    }))
  }
}));

// Import after mocking
const { ConversationAutoRestore } = await import('../conversation-auto-restore');

describe('ConversationAutoRestore', () => {
  let restore: InstanceType<typeof ConversationAutoRestore>;

  beforeEach(() => {
    vi.clearAllMocks();
    restore = new ConversationAutoRestore();
    mockSortBy.mockResolvedValue([]);
    mockWhere.mockReturnValue(mockWhereResult);
    mockEquals.mockReturnValue(mockWhereResult);
  });

  describe('getMostRecentThread', () => {
    it('should return null when no threads exist', async () => {
      mockSortBy.mockResolvedValue([]);

      const result = await restore.getMostRecentThread('project-1');

      expect(result).toBeNull();
    });

    it('should return most recent thread by updatedAt', async () => {
      const mockThreads: ConversationThreadRecord[] = [
        {
          id: 'thread-1',
          projectId: 'project-1',
          title: 'Old Thread',
          preview: 'Old preview',
          messages: [],
          agentsUsed: [],
          messageCount: 5,
          createdAt: 1000,
          updatedAt: 1000
        },
        {
          id: 'thread-2',
          projectId: 'project-1',
          title: 'Recent Thread',
          preview: 'Recent preview',
          messages: [],
          agentsUsed: [],
          messageCount: 10,
          createdAt: 2000,
          updatedAt: 2000
        }
      ];
      mockSortBy.mockResolvedValue(mockThreads);

      const result = await restore.getMostRecentThread('project-1');

      expect(result?.id).toBe('thread-2');
      expect(result?.title).toBe('Recent Thread');
    });
  });

  describe('restoreOnProjectLoad', () => {
    it('should create new conversation when no threads exist', async () => {
      mockSortBy.mockResolvedValue([]);
      mockCreateConversation.mockReturnValue('new-conversation-id');

      await restore.restoreOnProjectLoad('project-1');

      expect(mockCreateConversation).toHaveBeenCalledWith('project-1');
      expect(mockLoadConversation).not.toHaveBeenCalled();
    });

    it('should load most recent thread when exists', async () => {
      const mockThreads: ConversationThreadRecord[] = [
        {
          id: 'thread-1',
          projectId: 'project-1',
          title: 'Test Thread',
          preview: 'Test preview',
          messages: [],
          agentsUsed: [],
          messageCount: 5,
          createdAt: 1000,
          updatedAt: 2000
        }
      ];
      mockSortBy.mockResolvedValue(mockThreads);

      await restore.restoreOnProjectLoad('project-1');

      expect(mockLoadConversation).toHaveBeenCalledWith('thread-1');
    });

    it('should handle errors gracefully', async () => {
      mockSortBy.mockRejectedValue(new Error('Database error'));
      mockCreateConversation.mockReturnValue('new-conversation-id');

      // Should not throw - should create new conversation on error
      await restore.restoreOnProjectLoad('project-1');

      expect(mockCreateConversation).toHaveBeenCalled();
    });
  });

  describe('restoreScrollPosition', () => {
    it('should create animation function', () => {
      // Create mock element
      const mockElement = {
        scrollTop: 0
      };

      const cancelAnimation = restore.createScrollAnimation(mockElement as unknown as HTMLElement, 100);

      expect(typeof cancelAnimation).toBe('function');
    });
  });

  describe('getThreadsSortedByUpdate', () => {
    it('should return threads sorted by updatedAt descending', async () => {
      const mockThreads: ConversationThreadRecord[] = [
        { id: 't1', projectId: 'p1', title: 'First', preview: '', messages: [], agentsUsed: [], messageCount: 1, createdAt: 1000, updatedAt: 1000 },
        { id: 't2', projectId: 'p1', title: 'Second', preview: '', messages: [], agentsUsed: [], messageCount: 1, createdAt: 1000, updatedAt: 3000 },
        { id: 't3', projectId: 'p1', title: 'Third', preview: '', messages: [], agentsUsed: [], messageCount: 1, createdAt: 1000, updatedAt: 2000 }
      ];
      mockSortBy.mockResolvedValue(mockThreads);

      const result = await restore.getThreadsSortedByUpdate('p1');

      expect(result[0].id).toBe('t2'); // Most recent
      expect(result[1].id).toBe('t3');
      expect(result[2].id).toBe('t1'); // Oldest
    });
  });

  describe('hasSavedState', () => {
    it('should return false when no threads exist', async () => {
      mockCount.mockResolvedValue(0);

      const result = await restore.hasSavedState('project-1');

      expect(result).toBe(false);
    });

    it('should return true when threads exist', async () => {
      mockCount.mockResolvedValue(5);

      const result = await restore.hasSavedState('project-1');

      expect(result).toBe(true);
    });
  });
});
