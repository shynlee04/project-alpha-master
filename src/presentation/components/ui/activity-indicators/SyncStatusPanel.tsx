/**
 * @fileoverview Sync Status Panel Container
 * @module presentation/components/ui/activity-indicators/SyncStatusPanel
 *
 * Container component that wires SyncStatusIndicator to the event bus.
 * Listens for sync events and updates the file-sync-status-store.
 *
 * @story P1-2: Wire SyncStatusPanel to Event Bus
 * @listens sync:started, sync:progress, sync:completed, sync:failed
 *
 * @example
 * ```tsx
 * import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';
 *
 * function IDELayout() {
 *   return (
 *     <div className="fixed bottom-4 right-4 z-50 w-96">
 *       <SyncStatusPanel />
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect } from 'react';
import { useWorkspace } from '@/lib/workspace/WorkspaceContext';
import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { WorkspaceEventType } from '@/infrastructure/events/event-bus';

// ============================================================================
// Component
// ============================================================================

/**
 * SyncStatusPanel - Displays real-time file sync progress
 *
 * Container component that:
 * - Listens to sync events from the event bus
 * - Updates the file-sync-status-store with progress
 * - Renders SyncStatusIndicator with store state
 * - Auto-hides after sync completes (3s for success, 5s for error)
 *
 * Event Payloads:
 * - SYNC_STARTED: { total: number }
 * - SYNC_PROGRESS: { current: number, total: number, message?: string }
 * - SYNC_COMPLETED: { message?: string }
 * - SYNC_FAILED: { error: string }
 */
export function SyncStatusPanel() {
  const { eventBus } = useWorkspace();

  // Get sync progress state from store (individual selectors per Zustand v5 best practices)
  const syncProgress = useFileSyncStatusStore((s) => s.syncProgress);
  const setSyncStarted = useFileSyncStatusStore((s) => s.setSyncStarted);
  const setSyncProgress = useFileSyncStatusStore((s) => s.setSyncProgress);
  const setSyncCompleted = useFileSyncStatusStore((s) => s.setSyncCompleted);
  const setSyncFailed = useFileSyncStatusStore((s) => s.setSyncFailed);

  // Subscribe to sync events
  useEffect(() => {
    if (!eventBus) return;

    console.log('[SyncStatusPanel] Event bus available, registering listeners');

    // Handle sync started event
    const handleSyncStarted = ({ total }: { total: number }) => {
      console.log('[SyncStatusPanel] Sync started:', total);
      setSyncStarted(total);
    };

    // Handle sync progress event
    const handleSyncProgress = ({
      current,
      total,
      message
    }: {
      current: number;
      total: number;
      message?: string;
    }) => {
      console.log('[SyncStatusPanel] Sync progress:', current, '/', total);
      setSyncProgress(current, total, message);
    };

    // Handle sync completed event
    const handleSyncCompleted = ({ message }: { message?: string }) => {
      console.log('[SyncStatusPanel] Sync completed');
      setSyncCompleted(message);

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        // Reset to idle state (clear progress but not error)
        setSyncStarted(0);
      }, 3000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout);
    };

    // Handle sync failed event
    const handleSyncFailed = ({ error }: { error: string }) => {
      console.error('[SyncStatusPanel] Sync failed:', error);
      setSyncFailed(error);

      // Auto-hide after 5 seconds (longer for errors)
      const timeout = setTimeout(() => {
        // Clear error (will hide panel)
        setSyncFailed('');
      }, 5000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout);
    };

    // Register event listeners
    eventBus.on(WorkspaceEventType.SYNC_STARTED, handleSyncStarted as any);
    eventBus.on(WorkspaceEventType.SYNC_PROGRESS, handleSyncProgress as any);
    eventBus.on(WorkspaceEventType.SYNC_COMPLETED, handleSyncCompleted as any);
    eventBus.on(WorkspaceEventType.SYNC_FAILED, handleSyncFailed as any);

    console.log('[SyncStatusPanel] Event listeners registered');

    // Cleanup function
    return () => {
      eventBus.off(WorkspaceEventType.SYNC_STARTED, handleSyncStarted as any);
      eventBus.off(WorkspaceEventType.SYNC_PROGRESS, handleSyncProgress as any);
      eventBus.off(WorkspaceEventType.SYNC_COMPLETED, handleSyncCompleted as any);
      eventBus.off(WorkspaceEventType.SYNC_FAILED, handleSyncFailed as any);
      console.log('[SyncStatusPanel] Event listeners cleaned up');
    };
  }, [eventBus, setSyncStarted, setSyncProgress, setSyncCompleted, setSyncFailed]);

  // Don't render if no sync activity
  if (!syncProgress.isRunning && !syncProgress.error && syncProgress.progress === 0) {
    return null;
  }

  // Map store state to component props
  const state = {
    status: syncProgress.error
      ? ('error' as const)
      : syncProgress.isRunning
      ? ('running' as const)
      : ('completed' as const),
    current: syncProgress.current,
    total: syncProgress.total,
    progress: syncProgress.progress,
    message: syncProgress.message,
    error: syncProgress.error,
  };

  return <SyncStatusIndicator state={state} />;
}
