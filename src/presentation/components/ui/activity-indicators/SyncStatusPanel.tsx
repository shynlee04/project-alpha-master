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
 * Event Payloads (from workspace-events.ts):
 * - sync:started: { fileCount, direction, operationId }
 * - sync:progress: { current, total, currentFile, operationId }
 * - sync:completed: { success, timestamp, filesProcessed }
 * - sync:error: { error, file, operationId }
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
    const handleSyncStarted = ({ fileCount }: { fileCount: number }) => {
      console.log('[SyncStatusPanel] Sync started:', fileCount);
      setSyncStarted(fileCount);
    };

    // Handle sync progress event
    const handleSyncProgress = ({
      current,
      total,
      currentFile
    }: {
      current: number;
      total: number;
      currentFile: string;
    }) => {
      console.log('[SyncStatusPanel] Sync progress:', current, '/', total, currentFile);
      setSyncProgress(current, total, `Syncing ${currentFile} (${current}/${total})`);
    };

    // Handle sync completed event
    const handleSyncCompleted = ({ filesProcessed }: { filesProcessed: number }) => {
      console.log('[SyncStatusPanel] Sync completed, files processed:', filesProcessed);
      setSyncCompleted(`Synced ${filesProcessed} files successfully`);

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        // Reset to idle state (clear progress but not error)
        setSyncStarted(0);
      }, 3000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout);
    };

    // Handle sync error event
    const handleSyncFailed = ({ error }: { error: Error }) => {
      console.error('[SyncStatusPanel] Sync failed:', error);
      setSyncFailed(error.message);

      // Auto-hide after 5 seconds (longer for errors)
      const timeout = setTimeout(() => {
        // Clear error (will hide panel)
        setSyncFailed('');
      }, 5000);

      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout);
    };

    // Register event listeners (using string literals as per workspace-events.ts)
    eventBus.on('sync:started', handleSyncStarted as any);
    eventBus.on('sync:progress', handleSyncProgress as any);
    eventBus.on('sync:completed', handleSyncCompleted as any);
    eventBus.on('sync:error', handleSyncFailed as any);

    console.log('[SyncStatusPanel] Event listeners registered');

    // Cleanup function
    return () => {
      eventBus.off('sync:started', handleSyncStarted as any);
      eventBus.off('sync:progress', handleSyncProgress as any);
      eventBus.off('sync:completed', handleSyncCompleted as any);
      eventBus.off('sync:error', handleSyncFailed as any);
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
