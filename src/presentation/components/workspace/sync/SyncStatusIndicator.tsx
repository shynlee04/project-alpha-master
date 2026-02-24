/**
 * @fileoverview Sync Status Indicator Component
 * @module presentation/components/workspace/sync/SyncStatusIndicator
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-02-B - Hot Reactive Sync Integration
 *
 * Displays current sync status in the IDE status bar.
 * 8-bit design system compliant.
 */

import { useVFSSync } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
import { formatFilePath } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
import './sync-status.css';

/**
 * Sync Status Indicator Component
 *
 * Shows current sync state with 8-bit styling:
 * - idle (green): All files synced
 * - syncing (yellow): Changes detected, syncing
 * - error (red): Sync error occurred
 * - revoked (gray): Permission revoked
 */
export function SyncStatusIndicator() {
  const {
    syncState,
    changeCount,
    pendingChanges,
    lastSyncTimeFormatted,
  } = useVFSSync();

  // Get status configuration
  const statusConfig = getStatusConfig(syncState);

  return (
    <div
      className={`sync-status-indicator ${statusConfig.className}`}
      role="status"
      aria-live="polite"
      aria-label={`Sync status: ${statusConfig.label}`}
    >
      {/* Status dot */}
      <div className="sync-status-dot" style={{ backgroundColor: statusConfig.color }} />

      {/* Status label */}
      <span className="sync-status-label">{statusConfig.label}</span>

      {/* Change count badge */}
      {changeCount > 0 && (
        <span className="sync-status-badge" aria-label={`${changeCount} pending changes`}>
          {changeCount}
        </span>
      )}

      {/* Last sync time (tooltip) */}
      {lastSyncTimeFormatted && (
        <span className="sync-status-time" title={`Last synced: ${lastSyncTimeFormatted}`}>
          {lastSyncTimeFormatted}
        </span>
      )}

      {/* Pending changes tooltip */}
      {pendingChanges.length > 0 && (
        <div className="sync-status-tooltip">
          <div className="sync-tooltip-header">Pending Changes</div>
          {pendingChanges.slice(0, 5).map((change) => (
            <div key={change.path} className={`sync-tooltip-item sync-${change.type}`}>
              <span className="sync-tooltip-icon">{getChangeIcon(change.type)}</span>
              <span className="sync-tooltip-path">{formatFilePath(change.path)}</span>
            </div>
          ))}
          {pendingChanges.length > 5 && (
            <div className="sync-tooltip-more">
              ...and {pendingChanges.length - 5} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Get status configuration based on sync state
 */
function getStatusConfig(state: string): { color: string; label: string; className: string } {
  switch (state) {
    case 'idle':
      return { color: '#22c55e', label: 'Synced', className: 'sync-idle' };
    case 'syncing':
      return { color: '#eab308', label: 'Syncing...', className: 'sync-syncing' };
    case 'error':
      return { color: '#ef4444', label: 'Error', className: 'sync-error' };
    case 'permission-revoked':
      return { color: '#6b7280', label: 'Revoked', className: 'sync-revoked' };
    default:
      return { color: '#6b7280', label: 'Unknown', className: 'sync-unknown' };
  }
}

/**
 * Get icon for change type
 */
function getChangeIcon(type: string): string {
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
 * Export default for convenience
 */
export default SyncStatusIndicator;
