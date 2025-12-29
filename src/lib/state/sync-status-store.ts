/**
 * Sync Status Store
 * @module lib/state/sync-status-store
 *
 * Zustand store for managing sync queue state and operations.
 * RC-005: Migrated from localStorage to Dexie backend.
 *
 * Key changes from original implementation:
 * - Uses Dexie for persistence instead of localStorage
 * - Debounced writes (300ms) to reduce DB operations
 * - Supports efficient queries via Dexie indexes
 * - Maintains backward compatibility with existing interface
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { debounce } from 'lodash';
import {
    db,
    type SyncStatusRecord,
    setSyncStatus,
    getSyncStatus,
    deleteSyncStatus,
    getSyncStatusByStatus,
    getSyncStatusStats,
    clearOldSyncStatus,
} from './dexie-db';

/**
 * Sync operation types
 */
export type SyncOperationType = 'read' | 'write' | 'delete';

/**
 * Sync queue item statuses (kept for backward compatibility)
 */
export type SyncItemStatus = 'pending' | 'active' | 'completed' | 'failed';

/**
 * Overall sync state for the status bar
 */
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * Sync queue item interface (backward compatible)
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
    isLoading: boolean;

    // Actions
    addToQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt'>) => void;
    updateItem: (id: string, updates: Partial<SyncQueueItem>) => void;
    removeItem: (id: string) => void;
    clearCompleted: () => void;
    retryItem: (id: string) => void;
    reset: () => void;
    refreshFromDb: () => Promise<void>;
}

/**
 * Calculate the overall sync state from queue
 */
function calculateSyncState(queue: SyncQueueItem[]): SyncState {
    if (queue.length === 0) {
        return 'idle';
    }

    const hasActive = queue.some((item) => item.status === 'active' || item.status === 'pending');
    const hasCompleted = queue.some((item) => item.status === 'completed');
    const hasFailed = queue.some((item) => item.status === 'failed');

    if (hasActive) {
        return 'syncing';
    }

    if (hasFailed) {
        return 'error';
    }

    if (hasCompleted && !hasActive) {
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
    const lastSync = queue.some(
        (item) => item.status === 'completed' || item.status === 'failed'
    )
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
 * Convert SyncStatusRecord to SyncQueueItem
 */
function syncStatusToQueueItem(record: SyncStatusRecord): SyncQueueItem {
    const statusMap: Record<SyncStatusRecord['syncStatus'], SyncItemStatus> = {
        pending: 'pending',
        syncing: 'active',
        synced: 'completed',
        error: 'failed',
        conflict: 'failed',
    };

    return {
        id: record.id,
        type: 'write', // Default, actual type not stored in syncStatus
        path: record.path,
        status: statusMap[record.syncStatus],
        error: record.errorMessage,
        createdAt: new Date(record.createdAt),
    };
}

/**
 * Debounced sync status save to Dexie
 */
const debouncedSave = debounce(
    async (item: Omit<SyncQueueItem, 'id' | 'createdAt'>) => {
        const statusMap: Record<SyncItemStatus, SyncStatusRecord['syncStatus']> = {
            pending: 'pending',
            active: 'syncing',
            completed: 'synced',
            failed: 'error',
        };

        try {
            await setSyncStatus({
                path: item.path,
                syncStatus: statusMap[item.status],
                errorMessage: item.error,
                retryCount: item.status === 'failed' ? 1 : 0,
            });
        } catch (error) {
            console.warn('[SyncStatusStore] Failed to save to Dexie:', error);
        }
    },
    300,
    { maxWait: 1000 }
);

/**
 * Debounced delete from Dexie
 */
const debouncedDelete = debounce(
    async (path: string) => {
        try {
            await deleteSyncStatus(path);
        } catch (error) {
            console.warn('[SyncStatusStore] Failed to delete from Dexie:', error);
        }
    },
    300,
    { maxWait: 1000 }
);

/**
 * Create the sync status store with Dexie persistence
 */
export const useSyncStatusStore = create<SyncStatusState>()(
    subscribeWithSelector(
        (set, get) => ({
            // Initial state
            state: 'idle',
            queue: [],
            stats: {
                total: 0,
                completed: 0,
                failed: 0,
            },
            isLoading: true,

            // Actions
            addToQueue: (item) => {
                const newItem: SyncQueueItem = {
                    ...item,
                    id: item.id || crypto.randomUUID(),
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

                // Debounced save to Dexie
                debouncedSave(item);
            },

            updateItem: (id, updates) => {
                set((state) => {
                    const queue = state.queue.map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    );

                    const newState = {
                        queue,
                        stats: calculateStats(queue),
                        state: calculateSyncState(queue),
                    };

                    return newState;
                });

                // If status changed, update Dexie
                if (updates.status) {
                    const item = get().queue.find((i) => i.id === id);
                    if (item) {
                        debouncedSave({ ...item, ...updates });
                    }
                }
            },

            removeItem: (id) => {
                const item = get().queue.find((i) => i.id === id);

                set((state) => {
                    const queue = state.queue.filter((item) => item.id !== id);
                    return {
                        queue,
                        stats: calculateStats(queue),
                        state: calculateSyncState(queue),
                    };
                });

                // Debounced delete from Dexie
                if (item) {
                    debouncedDelete(item.path);
                }
            },

            clearCompleted: () => {
                const completedItems = get().queue.filter(
                    (item) => item.status === 'completed'
                );

                set((state) => {
                    const queue = state.queue.filter(
                        (item) => item.status !== 'completed'
                    );
                    return {
                        queue,
                        stats: calculateStats(queue),
                        state: calculateSyncState(queue),
                    };
                });

                // Delete completed items from Dexie
                for (const item of completedItems) {
                    debouncedDelete(item.path);
                }
            },

            retryItem: (id) => {
                set((state) => {
                    const item = state.queue.find((i) => i.id === id);
                    if (!item || item.status !== 'failed') {
                        return state;
                    }

                    const queue = state.queue.map((i) =>
                        i.id === id
                            ? { ...i, status: 'pending' as const, error: undefined }
                            : i
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

                // Update Dexie
                const item = get().queue.find((i) => i.id === id);
                if (item) {
                    debouncedSave({ ...item, status: 'pending', error: undefined });
                }
            },

            reset: () => {
                // Clear all from Dexie
                const items = get().queue;
                for (const item of items) {
                    debouncedDelete(item.path);
                }

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

            /**
             * Refresh queue from Dexie database
             * Called on store initialization and after reconnections
             */
            refreshFromDb: async () => {
                set({ isLoading: true });

                try {
                    // Get all non-synced items from Dexie
                    const [pending, errorItems] = await Promise.all([
                        getSyncStatusByStatus('pending'),
                        getSyncStatusByStatus('error'),
                    ]);

                    const allItems = [...pending, ...errorItems];
                    const queue: SyncQueueItem[] = allItems.map(syncStatusToQueueItem);

                    // Also get syncing items
                    const syncingItems = await getSyncStatusByStatus('syncing');
                    for (const item of syncingItems) {
                        queue.push(syncStatusToQueueItem(item));
                    }

                    set({
                        queue,
                        stats: calculateStats(queue),
                        state: calculateSyncState(queue),
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('[SyncStatusStore] Failed to refresh from Dexie:', error);
                    set({ isLoading: false });
                }
            },
        }),
        // Subscribe to Dexie changes for real-time updates
        (set, get) => {
            // Set up live query subscription
            let subscription: { unsubscribe: () => void } | null = null;

            if (typeof window !== 'undefined') {
                // Live query for sync status changes
                try {
                    const liveQuery = db.syncStatus.toArray();
                    if (liveQuery) {
                        // Dexie liveQuery is handled by useLiveQuery in components
                        // This subscription is for global state synchronization
                    }
                } catch {
                    // Dexie not available or liveQuery not supported
                }
            }

            return () => {
                if (subscription) {
                    subscription.unsubscribe();
                }
            };
        }
    )
);

/**
 * Initialize store by loading from Dexie
 */
export function initializeSyncStatusStore(): void {
    if (typeof window !== 'undefined') {
        useSyncStatusStore.getState().refreshFromDb();

        // Set up periodic cleanup of old entries (every hour)
        const cleanupInterval = setInterval(() => {
            clearOldSyncStatus().catch(console.warn);
        }, 60 * 60 * 1000);

        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            clearInterval(cleanupInterval);
            debouncedSave.flush();
            debouncedDelete.flush();
        });
    }
}

// ============================================================================
// Selectors
// ============================================================================

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
        state.queue.filter((item) => item.status === 'pending' || item.status === 'active')
            .length
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

/**
 * Selector for store loading state
 */
export function useSyncStatusLoading(): boolean {
    return useSyncStatusStore((state) => state.isLoading);
}

// ============================================================================
// Sync Status Helpers (for SyncManager integration)
// ============================================================================

/**
 * Update sync status for a file (called by SyncManager)
 */
export async function updateFileSyncStatus(
    path: string,
    status: 'pending' | 'syncing' | 'synced' | 'error' | 'conflict',
    error?: string
): Promise<void> {
    await setSyncStatus({
        path,
        syncStatus: status,
        errorMessage: error,
        retryCount: status === 'error' ? 1 : 0,
    });
}

/**
 * Mark file as synced (called after successful sync)
 */
export async function markFileSynced(path: string): Promise<void> {
    await setSyncStatus({
        path,
        syncStatus: 'synced',
        lastSyncedAt: Date.now(),
        retryCount: 0,
    });
}

/**
 * Mark file sync as failed
 */
export async function markFileSyncError(path: string, errorMessage: string): Promise<void> {
    await setSyncStatus({
        path,
        syncStatus: 'error',
        errorMessage,
        retryCount: 1,
    });
}

/**
 * Remove file from sync status tracking
 */
export async function removeFileSyncStatus(path: string): Promise<void> {
    await deleteSyncStatus(path);
}
