/**
 * @fileoverview File Change Notification Component
 * @module presentation/components/workspace/sync/FileChangeNotification
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-02-B - Hot Reactive Sync Integration
 *
 * Toast notification for file changes with refresh/dismiss actions.
 * 8-bit design system compliant.
 */

import { useEffect, useState } from 'react';
import type { FileChangeEvent } from '@/domain/interfaces/storage-adapter.interface';
import { useVFSSync } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
import { formatFilePath } from '@/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice';
import './sync-status.css';

/**
 * File Change Notification Component
 *
 * Displays a toast notification when file changes are detected.
 * Auto-dismisses after 5 seconds if no action is taken.
 */
export function FileChangeNotification() {
  const { pendingChanges, acknowledgeChange, dismissNotification } = useVFSSync();
  const [visible, setVisible] = useState<FileChangeEvent[]>([]);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());

  // Update visible changes when pending changes change
  useEffect(() => {
    // Show the most recent 3 changes
    setVisible(pendingChanges.slice(0, 3));
  }, [pendingChanges]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (visible.length === 0) return;

    const timer = setTimeout(() => {
      // Dismiss the oldest visible change
      const oldest = visible[0];
      if (oldest && !dismissing.has(oldest.path)) {
        dismissNotification(oldest.path);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [visible, dismissing, dismissNotification]);

  const handleRefresh = (change: FileChangeEvent) => {
    acknowledgeChange(change.path);
    // Trigger a refresh of the file content
    // This would typically dispatch an event or call a refresh function
    console.log('[FileChangeNotification] Refreshing:', change.path);
  };

  const handleDismiss = (change: FileChangeEvent) => {
    setDismissing((prev) => new Set(prev).add(change.path));
    setTimeout(() => {
      dismissNotification(change.path);
      setDismissing((prev) => {
        const next = new Set(prev);
        next.delete(change.path);
        return next;
      });
    }, 200);
  };

  if (visible.length === 0) return null;

  return (
    <div className="sync-notification-container" role="region" aria-label="File change notifications">
      {visible.map((change) => (
        <NotificationItem
          key={change.path}
          change={change}
          isDismissing={dismissing.has(change.path)}
          onRefresh={() => handleRefresh(change)}
          onDismiss={() => handleDismiss(change)}
        />
      ))}
    </div>
  );
}

/**
 * Individual notification item
 */
function NotificationItem({
  change,
  isDismissing,
  onRefresh,
  onDismiss,
}: {
  change: FileChangeEvent;
  isDismissing: boolean;
  onRefresh: () => void;
  onDismiss: () => void;
}) {
  const changeTypeLabels: Record<string, string> = {
    created: 'File created',
    modified: 'File modified',
    deleted: 'File deleted',
  };

  const changeTypeIcons: Record<string, string> = {
    created: '+',
    modified: '~',
    deleted: '×',
  };

  const changeTypeColors: Record<string, string> = {
    created: 'hsl(var(--success))',
    modified: 'hsl(var(--warning))',
    deleted: 'hsl(var(--destructive))',
  };

  return (
    <div
      className={`sync-notification ${isDismissing ? 'dismissing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className="sync-notification-icon"
        style={{ color: changeTypeColors[change.type] }}
      >
        {changeTypeIcons[change.type]}
      </div>

      <div className="sync-notification-content">
        <div className="sync-notification-title">
          {changeTypeLabels[change.type]}
        </div>
        <div className="sync-notification-path">
          {formatFilePath(change.path)}
        </div>

        <div className="sync-notification-actions">
          {change.type !== 'deleted' && (
            <button
              className="sync-notification-button primary"
              onClick={onRefresh}
              aria-label={`Refresh ${formatFilePath(change.path)}`}
            >
              Refresh
            </button>
          )}
          <button
            className="sync-notification-button"
            onClick={onDismiss}
            aria-label={`Dismiss notification for ${formatFilePath(change.path)}`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Export default for convenience
 */
export default FileChangeNotification;
