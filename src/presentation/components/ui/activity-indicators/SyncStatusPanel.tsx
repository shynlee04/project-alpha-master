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
 *     <div className="fixed bottom-4 right-4 z-50 w-96">
 *       <SyncStatusPanel />
 *     </div>
 *   );
 * }
 * ```
 */

import { useFileSyncStatusStore } from '@/lib/workspace/file-sync-status-store';
import { SyncStatusIndicator } from './SyncStatusIndicator';

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
 *
 * The store is updated by sync operations directly, making this
 * component workspace-agnostic (no provider dependency).
 */
export function SyncStatusPanel() {
  // Get sync progress state from store (individual selectors per Zustand v5 best practices)
  const syncProgress = useFileSyncStatusStore((s) => s.syncProgress);

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
