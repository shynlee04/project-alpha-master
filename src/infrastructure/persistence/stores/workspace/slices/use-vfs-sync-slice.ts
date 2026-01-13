/**
 * @fileoverview VFS Sync Slice - Hot Reactive Sync Integration
 * @module infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-02-B - Hot Reactive Sync Integration
 *
 * Connects FSAStorageAdapter.watch() to React UI for real-time file sync.
 *
 * State:
 * - syncState: 'idle' | 'syncing' | 'error' | 'permission-revoked'
 * - lastSyncedAt: Date | null
 * - pendingChanges: FileChangeEvent[]
 * - changeCount: number
 * - errorMessage: string | null
 *
 * Actions:
 * - startWatch(projectId): Initialize watch
 * - stopWatch(): Cleanup and stop watching
 * - acknowledgeChange(path): Mark change as acknowledged
 * - dismissNotification(path): Remove from pending
 * - retryAfterError(): Retry after error
 * - clearAllChanges(): Clear all pending changes
 */

import { useEffect, useState } from 'react';
import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';
import { storageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';
import { crossWorkspaceEventBus } from '@/lib/events/cross-workspace-event-bus';
import { useStatusBarStore } from '@/infrastructure/persistence/stores/statusbar-store';

// ============================================================================
// Types
// ============================================================================

/**
 * VFS Sync state interface
 */
export interface VFSSyncState {
  // State
  syncState: 'idle' | 'syncing' | 'error' | 'permission-revoked';
  lastSyncedAt: Date | null;
  pendingChanges: FileChangeEvent[];
  changeCount: number;
  errorMessage: string | null;
}

/**
 * VFS Sync actions interface
 */
export interface VFSSyncActions {
  startWatch: (projectId: string) => void;
  stopWatch: () => void;
  acknowledgeChange: (path: string) => void;
  dismissNotification: (path: string) => void;
  retryAfterError: () => void;
  clearAllChanges: () => void;
  completeWatchCycle: () => void;  // Mark sync cycle as complete
}

/**
 * VFS Sync store interface
 */
export interface VFSSyncStore extends VFSSyncState, VFSSyncActions {
  // Computed
  hasPendingChanges: boolean;
  lastSyncTimeFormatted: string | null;
  syncStatus: 'ready' | 'warning' | 'error';
}

// ============================================================================
// Constants
// ============================================================================

const MAX_PENDING_CHANGES = 100;
const DEBOUNCE_THRESHOLD = 5;

// ============================================================================
// VFS Sync Store
// ============================================================================

/**
 * Create VFS sync store
 */
function createVFSSyncStore() {
  // State
  let syncState: VFSSyncState['syncState'] = 'idle';
  let lastSyncedAt: Date | null = null;
  let pendingChanges: FileChangeEvent[] = [];
  let changeCount = 0;
  let errorMessage: string | null = null;

  // Subscribers
  const subscribers = new Set<(state: VFSSyncStore) => void>();

  // Notify subscribers
  const notify = () => {
    const hasPendingChanges = pendingChanges.length > 0;
    const lastSyncTimeFormatted = lastSyncedAt
      ? lastSyncedAt.toLocaleTimeString()
      : null;
    const syncStatus: 'ready' | 'warning' | 'error' =
      errorMessage !== null
        ? 'error'
        : pendingChanges.length > 5
          ? 'warning'
          : 'ready';

    const state: VFSSyncStore = {
      syncState,
      lastSyncedAt,
      pendingChanges,
      changeCount,
      errorMessage,
      hasPendingChanges,
      lastSyncTimeFormatted,
      syncStatus,
      startWatch,
      stopWatch,
      acknowledgeChange,
      dismissNotification,
      retryAfterError,
      clearAllChanges,
      completeWatchCycle,
    };

    subscribers.forEach((cb) => cb(state));
  };

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  /**
   * Start watching for file changes
   */
  const startWatch = (projectId: string) => {
    if (!projectId) {
      console.warn('[VFSSync] Cannot start watch: no project ID');
      return;
    }

    console.log('[VFSSync] Starting watch for project:', projectId);

    try {
      // Get storage adapter for the project
      const adapter = storageAdapterFactory.createAdapter({
        projectId,
      });

      // Check if adapter supports watching
      if ('watch' in adapter && typeof adapter.watch === 'function') {
        // Subscribe to changes
        const unsubscribe = adapter.watch((event: FileChangeEvent) => {
          // Handle the file change event
          handleFileChangeEvent(event);
        });

        // Store unsubscribe reference
        (adapter as { _unsubscribe?: () => void })._unsubscribe = unsubscribe;

        console.log('[VFSSync] Watch started successfully');
      } else {
        console.warn('[VFSSync] Adapter does not support watching');
        syncState = 'error';
        errorMessage = 'Watch not supported on this platform';
        notify();
        return;
      }

      // Update state
      syncState = 'idle';
      lastSyncedAt = new Date();
      errorMessage = null;
      notify();
    } catch (error) {
      const err = error as Error;
      console.error('[VFSSync] Failed to start watch:', err.message);
      syncState = 'error';
      errorMessage = err.message;
      notify();
    }
  };

  /**
   * Stop watching for file changes
   */
  const stopWatch = () => {
    console.log('[VFSSync] Stopping watch');
    syncState = 'idle';
    errorMessage = null;
    notify();
  };

  /**
   * Handle file change event
   * Also emits to crossWorkspaceEventBus for cross-workspace sync
   */
  const handleFileChangeEvent = (event: FileChangeEvent) => {
    // Check for rate limiting
    const rapidChangeCount = pendingChanges.filter(
      (e) => e.timestamp > Date.now() - 1000
    ).length;

    if (rapidChangeCount >= DEBOUNCE_THRESHOLD) {
      console.warn('[VFSSync] Rapid changes detected');
    }

    // Check for overflow (FIFO)
    pendingChanges = [event, ...pendingChanges].slice(0, MAX_PENDING_CHANGES);
    changeCount = pendingChanges.length;

    // Emit to crossWorkspaceEventBus for UI components and other workspaces
    try {
      crossWorkspaceEventBus.emitFileChange({
        workspaceId: 'ide',
        projectPath: '', // Will be set by the adapter
        filePath: event.path,
        changeType: event.type,
      });
    } catch (error) {
      console.warn('[VFSSync] Failed to emit file change event:', error);
    }

    // Update state
    syncState = 'syncing';
    lastSyncedAt = new Date();
    errorMessage = null;
    notify();

    // Bridge to StatusBar store for SyncStatusSegment
    try {
      useStatusBarStore.getState().setSyncStatus('syncing');
      useStatusBarStore.getState().setLastSyncTime(lastSyncedAt);
      useStatusBarStore.getState().setSyncError(null);
    } catch (error) {
      console.warn('[VFSSync] Failed to sync with StatusBar store:', error);
    }
  };

  /**
   * Acknowledge a file change (user has seen it)
   */
  const acknowledgeChange = (path: string) => {
    pendingChanges = pendingChanges.filter((e) => e.path !== path);
    changeCount = pendingChanges.length;
    notify();
  };

  /**
   * Dismiss a notification
   */
  const dismissNotification = (path: string) => {
    pendingChanges = pendingChanges.filter((e) => e.path !== path);
    changeCount = pendingChanges.length;
    notify();
  };

  /**
   * Retry after an error
   */
  const retryAfterError = () => {
    if (syncState === 'error' || syncState === 'permission-revoked') {
      syncState = 'idle';
      errorMessage = null;
      lastSyncedAt = lastSyncedAt ?? new Date();
      notify();
    }
  };

  /**
   * Clear all pending changes
   */
  const clearAllChanges = () => {
    pendingChanges = [];
    changeCount = 0;
    notify();
  };

  /**
   * Complete a watch cycle - marks sync as complete and syncs with StatusBar
   */
  const completeWatchCycle = () => {
    syncState = pendingChanges.length > 0 ? 'syncing' : 'idle';
    lastSyncedAt = new Date();
    notify();

    // Bridge to StatusBar store
    try {
      useStatusBarStore.getState().setSyncStatus(
        pendingChanges.length > 0 ? 'synced' : 'idle'
      );
      useStatusBarStore.getState().setLastSyncTime(lastSyncedAt);
    } catch (error) {
      console.warn('[VFSSync] Failed to sync with StatusBar store:', error);
    }
  };

  // Initial state
  notify();

  // Return store interface
  return {
    getState: () => {
      const hasPendingChanges = pendingChanges.length > 0;
      const lastSyncTimeFormatted = lastSyncedAt
        ? lastSyncedAt.toLocaleTimeString()
        : null;
      const syncStatus: 'ready' | 'warning' | 'error' =
        errorMessage !== null
          ? 'error'
          : pendingChanges.length > 5
            ? 'warning'
            : 'ready';

      return {
        syncState,
        lastSyncedAt,
        pendingChanges,
        changeCount,
        errorMessage,
        hasPendingChanges,
        lastSyncTimeFormatted,
        syncStatus,
        startWatch,
        stopWatch,
        acknowledgeChange,
        dismissNotification,
        retryAfterError,
        clearAllChanges,
        completeWatchCycle,
      };
    },
    subscribe: (cb: (state: VFSSyncStore) => void) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
  };
}

// ============================================================================
// VFS Sync Store Singleton
// ============================================================================

const vfsSyncStore = createVFSSyncStore();

// ============================================================================
// React Hook
// ============================================================================

/**
 * VFS Sync hook for React components
 *
 * @returns VFS sync state and actions
 */
export function useVFSSync(): VFSSyncStore {
  const [state, setState] = useState<VFSSyncStore>(vfsSyncStore.getState());

  useEffect(() => {
    const unsubscribe = vfsSyncStore.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// ============================================================================
// Auto-watch Hook
// ============================================================================

/**
 * Auto-watch hook that starts/stops watching based on projectId
 *
 * @param projectId - Current project ID (null to stop watching)
 */
export function useVFSAutoWatch(projectId: string | null) {
  const store = useVFSSync();

  useEffect(() => {
    if (projectId) {
      store.startWatch(projectId);
    } else {
      store.stopWatch();
    }
  }, [projectId, store.startWatch, store.stopWatch]);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format file path for display
 */
export function formatFilePath(path: string): string {
  const parts = path.split('/');
  if (parts.length <= 2) return path;
  return `.../${parts.slice(-2).join('/')}`;
}

/**
 * Get change type icon
 */
export function getChangeTypeIcon(type: FileChangeEvent['type']): string {
  switch (type) {
    case 'created':
      return '+';
    case 'modified':
      return '~';
    case 'deleted':
      return '×';
    default:
      return '?';
  }
}

/**
 * Get change type color class
 */
export function getChangeTypeColorClass(type: FileChangeEvent['type']): string {
  switch (type) {
    case 'created':
      return 'sync-created';
    case 'modified':
      return 'sync-modified';
    case 'deleted':
      return 'sync-deleted';
    default:
      return 'sync-default';
  }
}
