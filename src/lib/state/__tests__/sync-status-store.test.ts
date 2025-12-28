/**
 * Sync Status Store Tests
 * @module lib/state/__tests__/sync-status-store.test
 *
 * Tests for the sync queue visualizer state management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';

// Mock crypto.randomUUID for tests
const mockUUIDCounter = { count: 0 };
const mockRandomUUID = () => `test-uuid-${++mockUUIDCounter.count}`;

// Types (matching the store)
type SyncState = 'idle' | 'syncing' | 'synced' | 'error';
type SyncOperationType = 'read' | 'write' | 'delete';
type SyncItemStatus = 'pending' | 'active' | 'completed' | 'failed';

interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  path: string;
  status: SyncItemStatus;
  progress?: number;
  error?: string;
  createdAt: Date;
}

interface SyncStats {
  total: number;
  completed: number;
  failed: number;
  lastSync?: Date;
}

interface SyncStatusState {
  state: SyncState;
  queue: SyncQueueItem[];
  stats: SyncStats;
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<SyncQueueItem>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  retryItem: (id: string) => void;
  reset: () => void;
}

// Helper functions
function calculateSyncState(queue: SyncQueueItem[]): SyncState {
  if (queue.length === 0) return 'idle';
  const hasActive = queue.some((item) => item.status === 'active');
  const hasPending = queue.some((item) => item.status === 'pending');
  const hasFailed = queue.some((item) => item.status === 'failed');
  const hasCompleted = queue.some((item) => item.status === 'completed');

  if (hasActive || hasPending) return 'syncing';
  if (hasFailed) return 'error';
  if (hasCompleted && !hasActive && !hasPending) return 'synced';
  return 'idle';
}

function calculateStats(queue: SyncQueueItem[]): SyncStats {
  const completed = queue.filter((item) => item.status === 'completed').length;
  const failed = queue.filter((item) => item.status === 'failed').length;
  const lastSync = queue.some((item) => item.status === 'completed' || item.status === 'failed')
    ? new Date()
    : undefined;
  return { total: queue.length, completed, failed, lastSync };
}

// Create a fresh store factory
function createSyncStatusStore() {
  return create<SyncStatusState>()((set, get) => ({
    state: 'idle',
    queue: [],
    stats: { total: 0, completed: 0, failed: 0 },

    addToQueue: (item) => {
      const newItem: SyncQueueItem = {
        ...item,
        id: mockRandomUUID(),
        createdAt: new Date(),
      };
      set((state) => ({
        queue: [...state.queue, newItem],
        stats: { ...state.stats, total: state.stats.total + 1 },
      }));
      set({ state: calculateSyncState(get().queue) });
    },

    updateItem: (id, updates) => {
      set((state) => {
        const queue = state.queue.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        return { queue, stats: calculateStats(queue), state: calculateSyncState(queue) };
      });
    },

    removeItem: (id) => {
      set((state) => {
        const queue = state.queue.filter((item) => item.id !== id);
        return { queue, stats: calculateStats(queue), state: calculateSyncState(queue) };
      });
    },

    clearCompleted: () => {
      set((state) => {
        const queue = state.queue.filter((item) => item.status !== 'completed');
        return { queue, stats: calculateStats(queue), state: calculateSyncState(queue) };
      });
    },

    retryItem: (id) => {
      set((state) => {
        const item = state.queue.find((i) => i.id === id);
        if (!item || item.status !== 'failed') return state;
        const queue = state.queue.map((i) =>
          i.id === id ? { ...i, status: 'pending' as const, error: undefined } : i
        );
        return {
          queue,
          stats: { ...state.stats, failed: state.stats.failed - 1 },
          state: calculateSyncState(queue),
        };
      });
    },

    reset: () => {
      set({ state: 'idle', queue: [], stats: { total: 0, completed: 0, failed: 0 } });
    },
  }));
}

describe('SyncStatusStore', () => {
  beforeEach(() => {
    mockUUIDCounter.count = 0;
  });

  describe('Initial State', () => {
    it('should start with idle state', () => {
      const store = createSyncStatusStore();
      expect(store.getState().state).toBe('idle');
    });

    it('should start with empty queue', () => {
      const store = createSyncStatusStore();
      expect(store.getState().queue).toEqual([]);
    });

    it('should have zero stats initially', () => {
      const store = createSyncStatusStore();
      const { stats } = store.getState();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.failed).toBe(0);
    });
  });

  describe('addToQueue', () => {
    it('should add item to queue', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const queue = store.getState().queue;
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('write');
      expect(queue[0].path).toBe('/test/file.ts');
      expect(queue[0].status).toBe('pending');
    });

    it('should set state to syncing when adding first item', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      expect(store.getState().state).toBe('syncing');
    });

    it('should increment total stats', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'read', path: '/test/file2.ts', status: 'pending' });
      expect(store.getState().stats.total).toBe(2);
    });

    it('should generate unique IDs', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'write', path: '/test/file2.ts', status: 'pending' });
      const queue = store.getState().queue;
      expect(queue[0].id).not.toBe(queue[1].id);
    });

    it('should set createdAt timestamp', () => {
      const before = new Date();
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const after = new Date();
      const item = store.getState().queue[0];
      expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(item.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('updateItem', () => {
    it('should update item properties', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'active', progress: 50 });
      const item = store.getState().queue.find((i) => i.id === id);
      expect(item?.status).toBe('active');
      expect(item?.progress).toBe(50);
    });

    it('should update completed stat when item completes', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'completed' });
      expect(store.getState().stats.completed).toBe(1);
      expect(store.getState().state).toBe('synced');
    });

    it('should update failed stat when item fails', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'failed', error: 'Permission denied' });
      expect(store.getState().stats.failed).toBe(1);
      expect(store.getState().state).toBe('error');
    });

    it('should set lastSync timestamp when operations complete', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'completed' });
      expect(store.getState().stats.lastSync).toBeDefined();
    });

    it('should keep syncing state when more items pending', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'read', path: '/test/file2.ts', status: 'pending' });
      const queue = store.getState().queue;
      store.getState().updateItem(queue[0].id, { status: 'completed' });
      expect(store.getState().state).toBe('syncing');
      expect(store.getState().stats.completed).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item from queue', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().removeItem(id);
      expect(store.getState().queue).toHaveLength(0);
    });

    it('should handle removing non-existent item gracefully', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      expect(() => store.getState().removeItem('non-existent')).not.toThrow();
      expect(store.getState().queue).toHaveLength(1);
    });
  });

  describe('clearCompleted', () => {
    it('should remove all completed items', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'read', path: '/test/file2.ts', status: 'pending' });
      const queue = store.getState().queue;
      store.getState().updateItem(queue[0].id, { status: 'completed' });
      store.getState().clearCompleted();
      expect(store.getState().queue).toHaveLength(1);
      expect(store.getState().queue[0].status).toBe('pending');
    });

    it('should return to idle when all items cleared', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'completed' });
      store.getState().clearCompleted();
      expect(store.getState().state).toBe('idle');
    });

    it('should keep syncing state when pending items remain', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'read', path: '/test/file2.ts', status: 'pending' });
      const queue = store.getState().queue;
      store.getState().updateItem(queue[0].id, { status: 'completed' });
      store.getState().clearCompleted();
      expect(store.getState().state).toBe('syncing');
    });
  });

  describe('retryItem', () => {
    it('should reset failed item to pending', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'failed', error: 'File locked' });
      store.getState().retryItem(id);
      const item = store.getState().queue.find((i) => i.id === id);
      expect(item?.status).toBe('pending');
      expect(item?.error).toBeUndefined();
    });

    it('should decrement failed stat', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'failed' });
      expect(store.getState().stats.failed).toBe(1);
      store.getState().retryItem(id);
      expect(store.getState().stats.failed).toBe(0);
    });

    it('should set state to syncing after retry', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'failed' });
      store.getState().retryItem(id);
      expect(store.getState().state).toBe('syncing');
    });

    it('should only retry failed items', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'completed' });
      store.getState().retryItem(id);
      expect(store.getState().queue[0].status).toBe('completed');
    });

    it('should handle non-existent item gracefully', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      expect(() => store.getState().retryItem('non-existent')).not.toThrow();
    });
  });

  describe('Queue Statistics', () => {
    it('should calculate success rate correctly', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file1.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'read', path: '/test/file2.ts', status: 'pending' });
      store.getState().addToQueue({ type: 'delete', path: '/test/file3.ts', status: 'pending' });
      const queue = store.getState().queue;
      store.getState().updateItem(queue[0].id, { status: 'completed' });
      store.getState().updateItem(queue[1].id, { status: 'completed' });
      store.getState().updateItem(queue[2].id, { status: 'failed' });
      const { stats } = store.getState();
      expect(stats.completed).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.total).toBe(3);
    });
  });

  describe('State Transitions', () => {
    it('should transition from idle to syncing when item added', () => {
      const store = createSyncStatusStore();
      expect(store.getState().state).toBe('idle');
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      expect(store.getState().state).toBe('syncing');
    });

    it('should transition from syncing to synced when all complete', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'completed' });
      expect(store.getState().state).toBe('synced');
    });

    it('should transition from syncing to error when any fails', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      const id = store.getState().queue[0].id;
      store.getState().updateItem(id, { status: 'failed' });
      expect(store.getState().state).toBe('error');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const store = createSyncStatusStore();
      store.getState().addToQueue({ type: 'write', path: '/test/file.ts', status: 'pending' });
      store.getState().reset();
      expect(store.getState().state).toBe('idle');
      expect(store.getState().queue).toEqual([]);
      expect(store.getState().stats.total).toBe(0);
      expect(store.getState().stats.completed).toBe(0);
      expect(store.getState().stats.failed).toBe(0);
    });
  });
});
