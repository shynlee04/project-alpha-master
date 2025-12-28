/**
 * Sync Status Store
 * @module lib/state/sync-status-store
 *
 * Zustand store for managing sync queue state and operations.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Sync operation types
 */
export type SyncOperationType = 'read' | 'write' | 'delete';

/**
 * Sync queue item statuses
 */
export type SyncItemStatus = 'pending' | 'active' | 'completed' | 'failed';

/**
 * Overall sync state for the status bar
 */
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * Sync queue item interface
 */
export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  path: string;
  status: SyncItemStatus;
  progress?: number;
  error?: string;
  createdAt: Date;
}

/**
 * Sync statistics
 */
export interface SyncStats {
  total: number;
  completed: number;
  failed: number;
  lastSync?: Date;
}

/**
 * Sync status state interface
 */
export interface SyncStatusState {
  // State
  state: SyncState;
  queue: SyncQueueItem[];
  stats: SyncStats;

  // Actions
  addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<SyncQueueItem>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  retryItem: (id: string) => void;
  reset: () => void;
}

/**
 * Calculate the overall sync state from queue
 */
function calculateSyncState(queue: SyncQueueItem[]): SyncState {
  if (queue.length === 0) {
    return 'idle';
  }

  const hasActive = queue.some((item) => item.status === 'active');
  const hasPending = queue.some((item) => item.status === 'pending');
  const hasCompleted = queue.some((item) => item.status === 'completed');
  const hasFailed = queue.some((item) => item.status === 'failed');

  if (hasActive || hasPending) {
    return 'syncing';
  }

  if (hasFailed) {
    return 'error';
  }

  if (hasCompleted && !hasActive && !hasPending) {
    return 'synced';
  }

  return 'idle';
}

/**
 * Calculate stats from queue
 */
function calculateStats(queue: SyncQueueItem[]): SyncStats {
  const completed = queue.filter((item) => item.status === 'completed').length;
  const failed = queue.filter((item) => item.status === 'failed').length;
  const lastSync = queue.some((item) => item.status === 'completed' || item.status === 'failed')
    ? new Date()
    : undefined;

  return {
    total: queue.length,
    completed,
    failed,
    lastSync,
  };
}

/**
 * Create the sync status store with persistence
 */
export const useSyncStatusStore = create<SyncStatusState>()(
  persist(
    (set, get) => ({
      // Initial state
      state: 'idle',
      queue: [],
      stats: {
        total: 0,
        completed: 0,
        failed: 0,
      },

      // Actions
      addToQueue: (item) => {
        const newItem: SyncQueueItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };

        set((state) => ({
          queue: [...state.queue, newItem],
          stats: {
            ...state.stats,
            total: state.stats.total + 1,
          },
        }));

        // Update state after adding
        const queue = get().queue;
        set({ state: calculateSyncState(queue) });
      },

      updateItem: (id, updates) => {
        set((state) => {
          const queue = state.queue.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          );

          return {
            queue,
            stats: calculateStats(queue),
            state: calculateSyncState(queue),
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const queue = state.queue.filter((item) => item.id !== id);
          return {
            queue,
            stats: calculateStats(queue),
            state: calculateSyncState(queue),
          };
        });
      },

      clearCompleted: () => {
        set((state) => {
          const queue = state.queue.filter((item) => item.status !== 'completed');
          return {
            queue,
            stats: calculateStats(queue),
            state: calculateSyncState(queue),
          };
        });
      },

      retryItem: (id) => {
        set((state) => {
          const item = state.queue.find((i) => i.id === id);
          if (!item || item.status !== 'failed') {
            return state;
          }

          const queue = state.queue.map((i) =>
            i.id === id ? { ...i, status: 'pending' as const, error: undefined } : i
          );

          return {
            queue,
            stats: {
              ...state.stats,
              failed: state.stats.failed - 1,
            },
            state: calculateSyncState(queue),
          };
        });
      },

      reset: () => {
        set({
          state: 'idle',
          queue: [],
          stats: {
            total: 0,
            completed: 0,
            failed: 0,
          },
        });
      },
    }),
    {
      name: 'sync-status-store',
      partialize: (state) => ({
        queue: state.queue.filter((item) => item.status !== 'completed'),
        stats: {
          total: state.stats.total,
          completed: state.stats.completed,
          failed: state.stats.failed,
          lastSync: state.stats.lastSync,
        },
      }),
    }
  )
);

/**
 * Selector for sync state
 */
export function useSyncState(): SyncState {
  return useSyncStatusStore((state) => state.state);
}

/**
 * Selector for sync queue
 */
export function useSyncQueue(): SyncQueueItem[] {
  return useSyncStatusStore((state) => state.queue);
}

/**
 * Selector for sync stats
 */
export function useSyncStats(): SyncStats {
  return useSyncStatusStore((state) => state.stats);
}

/**
 * Selector for pending items count
 */
export function usePendingCount(): number {
  return useSyncStatusStore((state) =>
    state.queue.filter((item) => item.status === 'pending' || item.status === 'active').length
  );
}

/**
 * Selector for failed items
 */
export function useFailedItems(): SyncQueueItem[] {
  return useSyncStatusStore((state) =>
    state.queue.filter((item) => item.status === 'failed')
  );
}
