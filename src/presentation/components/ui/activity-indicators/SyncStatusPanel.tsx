/**
 * @fileoverview Sync Status Panel Container
 * @module presentation/components/ui/activity-indicators/SyncStatusPanel
 *
 * Container component that displays file sync progress.
 * Reads state from file-sync-status-store which is updated by
 * the sync manager during file operations.
 *
 * NOTE: This component is workspace-agnostic and can be used in any workspace.
 * The sync events are pushed to the store by the sync manager, not consumed here.
 *
 * @example
 * ```tsx
 * import { SyncStatusPanel } from '@/presentation/components/ui/activity-indicators';
 *
 * function Layout() {
 *   return (
 *     <div className="fixed bottom-4 right-4 z-40 w-96">
 *       <SyncStatusPanel />
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';
import { SyncStatusIndicator } from './SyncStatusIndicator';

// Auto-dismiss delay in milliseconds after sync completion
const AUTO_DISMISS_DELAY_MS = 3000;

// ============================================================================
// Component
// ============================================================================

/**
 * SyncStatusPanel - Displays real-time file sync progress
 *
 * Container component that:
 * - Reads sync state from file-sync-status-store
 * - Renders SyncStatusIndicator with store state
 * - Auto-hides when no sync activity
 * - Auto-dismisses 3 seconds after completion
 *
 * The store is updated by sync operations directly, making this
 * component workspace-agnostic (no provider dependency).
 */
export function SyncStatusPanel() {
  // Get sync progress state from store (individual selectors per Zustand v5 best practices)
  const syncProgress = useFileSyncStatusStore((s) => s.syncProgress);

  // Track auto-dismiss state for completed syncs
  const [isDismissed, setIsDismissed] = useState(false);

  // Compute current status for auto-dismiss logic
  const status = syncProgress.error
    ? 'error'
    : syncProgress.isRunning
      ? 'running'
      : 'completed';

  // Auto-dismiss timer for completed state
  useEffect(() => {
    // Reset dismissed state when sync starts running again
    if (status === 'running') {
      setIsDismissed(false);
      return;
    }

    // Auto-dismiss after delay when completed (not on error - keep errors visible)
    if (status === 'completed' && syncProgress.progress > 0) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, AUTO_DISMISS_DELAY_MS);

      return () => clearTimeout(timer);
    }
  }, [status, syncProgress.progress]);

  // Don't render if:
  // - No sync activity (progress is 0 and not running and no error)
  // - Auto-dismissed after completion
  if (isDismissed || (!syncProgress.isRunning && !syncProgress.error && syncProgress.progress === 0)) {
    return null;
  }

  // Map store state to component props
  const state = {
    status: status as 'running' | 'completed' | 'error',
    current: syncProgress.current,
    total: syncProgress.total,
    progress: syncProgress.progress,
    message: syncProgress.message,
    error: syncProgress.error,
  };

  // UX-02-23: Manual dismiss handler
  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return <SyncStatusIndicator state={state} onDismiss={handleDismiss} />;
}
