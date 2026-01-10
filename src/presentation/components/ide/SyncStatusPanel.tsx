/**
 * Sync Status Panel - Real-time File Synchronization Monitoring
 *
 * Story: LT-4.19 (Light Theme Migration)
 * Story: UJ-001 (Wire SyncStatusPanel to Real Events)
 * UPDATED_AT: 2026-01-06T03:00:00Z
 *
 * Displays comprehensive sync status across all workspaces with event activity indicators.
 * Uses CSS custom properties for light/dark theme support.
 * 
 * Now wired to crossWorkspaceEventBus for real-time sync events.
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
 * @story UJ-001 - Wire to real events
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle, X } from 'lucide-react';
import {
  crossWorkspaceEventBus,
  SyncStatusEvent,
  FileChangeEvent
} from '@/lib/events/cross-workspace-event-bus';

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

  // DISMISS FIX: Track dismissed state and show again when new operations arrive
  const [isDismissed, setIsDismissed] = useState(false);
  const prevOperationsCountRef = useRef(0);

  // Track operations by path for accumulation
  const operationsMapRef = useRef<Map<string, SyncOperation>>(new Map());

  /**
   * Map SyncStatusEvent.status to SyncOperation.status
   */
  const mapSyncStatus = useCallback((status: SyncStatusEvent['status']): SyncStatus => {
    switch (status) {
      case 'syncing': return 'in-progress';
      case 'synced': return 'completed';
      case 'error': return 'failed';
      default: return 'pending';
    }
  }, []);

  /**
   * Map FileChangeEvent.changeType to SyncOperation.type
   */
  const mapChangeType = useCallback((changeType: FileChangeEvent['changeType']): SyncOperation['type'] => {
    switch (changeType) {
      case 'created': return 'file-create';
      case 'modified': return 'file-update';
      case 'deleted': return 'file-delete';
      default: return 'file-update';
    }
  }, []);

  /**
   * Update sync state from operations map
   * DISMISS FIX: Re-show panel when new operations arrive after dismissal
   */
  const updateStateFromMap = useCallback(() => {
    const operations = Array.from(operationsMapRef.current.values());
    const inProgressCount = operations.filter(op => op.status === 'in-progress').length;
    const completedCount = operations.filter(op => op.status === 'completed').length;
    const failedCount = operations.filter(op => op.status === 'failed').length;
    const pendingCount = operations.filter(op => op.status === 'pending').length;

    const newCount = operations.length;
    const prevCount = prevOperationsCountRef.current;

    // DISMISS FIX: Re-show panel if new operations arrive after dismissal
    if (isDismissed && newCount > 0 && newCount !== prevCount) {
      setIsDismissed(false);
    }
    prevOperationsCountRef.current = newCount;

    setSyncState({
      operations: operations.sort((a, b) => b.timestamp - a.timestamp),
      totalCount: operations.length,
      pendingCount,
      inProgressCount,
      failedCount,
      completedCount,
      lastSyncTime: operations.length > 0
        ? Math.max(...operations.map(op => op.timestamp))
        : null,
    });
  }, [isDismissed]);

  // Subscribe to sync events from cross-workspace event bus
  useEffect(() => {
    /**
     * Handle SyncStatusEvent from crossWorkspaceEventBus
     * Updates operation status (syncing → completed/error)
     */
    const handleSyncStatus = (event: SyncStatusEvent) => {
      console.log('[SyncStatusPanel] Received SyncStatusEvent:', event);

      const operationId = `${event.projectPath}`;
      const existingOp = operationsMapRef.current.get(operationId);

      const operation: SyncOperation = {
        id: operationId,
        type: existingOp?.type || 'directory-sync',
        path: event.projectPath,
        status: mapSyncStatus(event.status),
        progress: event.status === 'synced' ? 100 : event.status === 'error' ? 0 : 50,
        error: event.error,
        timestamp: event.timestamp.getTime(),
      };

      operationsMapRef.current.set(operationId, operation);
      updateStateFromMap();

      // Clear completed operations after 30 seconds
      if (event.status === 'synced') {
        setTimeout(() => {
          operationsMapRef.current.delete(operationId);
          updateStateFromMap();
        }, 30000);
      }
    };

    /**
     * Handle FileChangeEvent for detailed file-level tracking
     */
    const handleFileChange = (event: FileChangeEvent) => {
      console.log('[SyncStatusPanel] Received FileChangeEvent:', event);

      const operationId = `${event.projectPath}:${event.filePath}`;

      const operation: SyncOperation = {
        id: operationId,
        type: mapChangeType(event.changeType),
        path: event.filePath,
        status: 'completed', // FileChangeEvent means file change completed
        progress: 100,
        timestamp: event.timestamp.getTime(),
      };

      operationsMapRef.current.set(operationId, operation);
      updateStateFromMap();

      // Clear file operations after 10 seconds
      setTimeout(() => {
        operationsMapRef.current.delete(operationId);
        updateStateFromMap();
      }, 10000);
    };

    // Subscribe to events
    crossWorkspaceEventBus.onSyncStatus(handleSyncStatus);
    crossWorkspaceEventBus.onFileChange(handleFileChange);

    console.log('[SyncStatusPanel] Subscribed to crossWorkspaceEventBus events');

    // Cleanup on unmount
    return () => {
      crossWorkspaceEventBus.offSyncStatus(handleSyncStatus);
      crossWorkspaceEventBus.offFileChange(handleFileChange);
      console.log('[SyncStatusPanel] Unsubscribed from crossWorkspaceEventBus events');
    };
  }, [mapSyncStatus, mapChangeType, updateStateFromMap]);

  /**
   * Retry failed sync operation
   */
  const handleRetry = useCallback((operationId: string) => {
    console.log('[SyncStatusPanel] Retrying operation:', operationId);

    // Find the failed operation
    const operation = operationsMapRef.current.get(operationId);
    if (!operation) {
      console.warn('[SyncStatusPanel] Operation not found for retry:', operationId);
      return;
    }

    // Update status to pending/in-progress
    operation.status = 'pending';
    operation.error = undefined;
    operation.progress = 0;
    operation.timestamp = Date.now();
    operationsMapRef.current.set(operationId, operation);
    updateStateFromMap();

    // Emit sync status event to trigger re-sync
    // SyncManager or other services should pick this up
    crossWorkspaceEventBus.emitSyncStatus({
      workspaceId: 'ide',
      projectPath: operation.path,
      status: 'syncing',
    });
  }, [updateStateFromMap]);


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
        return <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />;
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
        <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
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

  /**
   * Dismiss handler - hides panel until new operations arrive
   */
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  // DISMISS FIX: Hide panel if dismissed AND no operations to show
  // (will re-show when new operations arrive via updateStateFromMap)
  if (isDismissed && syncState.operations.length === 0) {
    return null;
  }

  return (
    <div className="sync-status-panel p-4 bg-background border rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{t('sync.title')}</h3>
        <div className="flex items-center gap-2">
          {getOverallStatusBadge()}
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-none border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss sync status"
          >
            <X size={14} />
          </button>
        </div>
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
