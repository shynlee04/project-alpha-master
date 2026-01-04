/**
 * Sync Status Panel - Real-time File Synchronization Monitoring
 *
 * Story: LT-4.19 (Light Theme Migration)
 * UPDATED_AT: 2026-01-04T10:30:00Z
 *
 * Displays comprehensive sync status across all workspaces with event activity indicators.
 * Uses CSS custom properties for light/dark theme support.
 *
 * User Journey:
 * 1. User saves file in IDE → Sync shows "1 file pending"
 * 2. Sync starts → Progress bar animates "Syncing file.ts..."
 * 3. Sync completes → Status shows "✅ All files synced (2 minutes ago)"
 * 4. Sync fails → Error shows with retry button
 *
 * @module presentation/components/ide/SyncStatusPanel
 * @priority P0 - Event Activity Indicator (User Requirement)
 * @story 24-1 AC2 - Sync queue visualization
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

/**
 * Sync operation status
 */
type SyncStatus = 'idle' | 'pending' | 'in-progress' | 'completed' | 'failed';

/**
 * Sync operation item
 */
interface SyncOperation {
  id: string;
  type: 'file-create' | 'file-update' | 'file-delete' | 'directory-sync';
  path: string;
  status: SyncStatus;
  progress: number; // 0-100
  error?: string;
  timestamp: number;
}

/**
 * Sync queue state
 */
interface SyncQueueState {
  operations: SyncOperation[];
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  failedCount: number;
  completedCount: number;
  lastSyncTime: number | null;
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return i18next.t('sync.time.justNow');
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return i18next.t('sync.time.minutesAgo', { count: minutes });
  }

  const hours = Math.floor(minutes / 60);
  return i18next.t('sync.time.hoursAgo', { count: hours });
}

/**
 * Sync Status Panel Component
 */
export function SyncStatusPanel() {
  const { t } = useTranslation();
  const [syncState, setSyncState] = useState<SyncQueueState>({
    operations: [],
    totalCount: 0,
    pendingCount: 0,
    inProgressCount: 0,
    failedCount: 0,
    completedCount: 0,
    lastSyncTime: null,
  });

  // Subscribe to sync events from cross-workspace event bus
  useEffect(() => {
    // TODO: Subscribe to sync queue events
    // This is a placeholder - actual implementation will connect to sync manager
    const mockSyncState: SyncQueueState = {
      operations: [
        {
          id: '1',
          type: 'file-update',
          path: '/src/components/AgentConfig.tsx',
          status: 'completed',
          progress: 100,
          timestamp: Date.now() - 30000,
        },
        {
          id: '2',
          type: 'file-create',
          path: '/src/lib/agent/tools/new-tool.ts',
          status: 'in-progress',
          progress: 65,
          timestamp: Date.now() - 5000,
        },
      ],
      totalCount: 2,
      pendingCount: 0,
      inProgressCount: 1,
      failedCount: 0,
      completedCount: 1,
      lastSyncTime: Date.now() - 30000,
    };

    setSyncState(mockSyncState);
  }, []);

  /**
   * Retry failed sync operation
   */
  const handleRetry = (operationId: string) => {
    console.log('[SyncStatusPanel] Retrying operation:', operationId);
    // TODO: Emit retry event to sync manager
  };

  /**
   * Get status icon for operation
   */
  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  /**
   * Get overall sync status badge
   */
  const getOverallStatusBadge = () => {
    if (syncState.failedCount > 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {t('sync.status.failed', { count: syncState.failedCount })}
        </Badge>
      );
    }

    if (syncState.inProgressCount > 0) {
      return (
        <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {t('sync.status.syncing', { count: syncState.inProgressCount })}
        </Badge>
      );
    }

    if (syncState.pendingCount > 0) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-500">
          <Clock className="h-3 w-3" />
          {t('sync.status.pending', { count: syncState.pendingCount })}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
        <CheckCircle2 className="h-3 w-3" />
        {t('sync.status.synced')}
      </Badge>
    );
  };

  return (
    <div className="sync-status-panel p-4 bg-background border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{t('sync.title')}</h3>
        {getOverallStatusBadge()}
      </div>

      {/* Last sync time */}
      {syncState.lastSyncTime && (
        <p className="text-xs text-muted-foreground mb-3">
          {t('sync.lastSync', { time: formatTimestamp(syncState.lastSyncTime) })}
        </p>
      )}

      {/* Sync operations list */}
      <div className="space-y-2">
        {syncState.operations.map((operation) => (
          <div
            key={operation.id}
            className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
          >
            {/* Status icon */}
            <div className="mt-0.5">{getStatusIcon(operation.status)}</div>

            {/* Operation details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{operation.path}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {operation.progress > 0 && operation.progress < 100 && (
                    `${operation.progress}%`
                  )}
                </span>
              </div>

              {/* Progress bar */}
              {operation.status === 'in-progress' && (
                <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--info)] transition-all duration-300"
                    style={{ width: `${operation.progress}%` }}
                  />
                </div>
              )}

              {/* Error message */}
              {operation.status === 'failed' && operation.error && (
                <p className="text-xs text-[var(--destructive)] mt-1">{operation.error}</p>
              )}
            </div>

            {/* Retry button */}
            {operation.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRetry(operation.id)}
                className="h-7 px-2 text-xs"
              >
                {t('sync.retry')}
              </Button>
            )}
          </div>
        ))}

        {/* Empty state */}
        {syncState.operations.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-[var(--success)]" />
            <p>{t('sync.empty')}</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {(syncState.pendingCount > 0 || syncState.inProgressCount > 0 || syncState.failedCount > 0) && (
        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          {t('sync.summary', {
            total: syncState.totalCount,
            pending: syncState.pendingCount,
            inProgress: syncState.inProgressCount,
            failed: syncState.failedCount,
            completed: syncState.completedCount,
          })}
        </div>
      )}
    </div>
  );
}

/**
 * i18n Translation Keys (add to en.json and vi.json)
 *
 * {
 *   "sync": {
 *     "title": "File Synchronization",
 *     "status": {
 *       "synced": "All files synced",
 *       "syncing": "Syncing {{count}} files",
 *       "pending": "{{count}} files pending",
 *       "failed": "{{count}} failed"
 *     },
 *     "lastSync": "Last sync: {{time}}",
 *     "time": {
 *       "justNow": "just now",
 *       "minutesAgo": "{{count}}m ago",
 *       "hoursAgo": "{{count}}h ago"
 *     },
 *     "retry": "Retry",
 *     "empty": "No sync operations",
 *     "summary": "{{total}} operations: {{pending}} pending, {{inProgress}} syncing, {{failed}} failed, {{completed}} completed"
 *   }
 * }
 */
