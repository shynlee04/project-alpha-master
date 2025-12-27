/**
 * SyncStatusIndicator Component
 *
 * Story 3-6: Implement Sync Status UI
 *
 * Displays the current sync status with three states:
 * - idle: checkmark with relative last sync time
 * - syncing: animated spinner with progress
 * - error: warning icon, clickable to retry
 */

import React, { useState, useEffect } from 'react'
import { Check, Loader2, AlertTriangle } from 'lucide-react'
import type { SyncProgress } from '../../lib/filesystem'
import { useTranslation } from 'react-i18next'

// ============================================================================
// Types
// ============================================================================

export type SyncStatusType = 'idle' | 'syncing' | 'error'

export interface SyncStatusIndicatorProps {
  /** Current sync status */
  status: SyncStatusType
  /** Progress during sync operation */
  progress?: SyncProgress | null
  /** Timestamp of last successful sync */
  lastSyncTime?: Date | null
  /** Error message when status is 'error' */
  errorMessage?: string | null
  /** Callback to retry sync (called on error indicator click) */
  onRetry?: () => void
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format a date as relative time string (e.g., "2m ago", "Just now")
 */
function formatRelativeTime(date: Date, t: any): string {
  const now = Date.now()
  const seconds = Math.floor((now - date.getTime()) / 1000)

  if (seconds < 0) return t('time.justNow') // Handle edge case of future dates
  if (seconds < 10) return t('time.justNow')
  if (seconds < 60) return t('time.agoSeconds', { count: seconds })

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('time.agoMinutes', { count: minutes })

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.agoHours', { count: hours })

  // For older times, show date
  return date.toLocaleDateString()
}

// ============================================================================
// Component
// ============================================================================

export function SyncStatusIndicator({
  status,
  progress,
  lastSyncTime,
  errorMessage,
  onRetry,
}: SyncStatusIndicatorProps): React.JSX.Element {
  const { t } = useTranslation()
  // Force re-render every 60 seconds to update relative time
  const [, setTick] = useState(0)

  useEffect(() => {
    // Only need timer when idle with a lastSyncTime
    if (status !== 'idle' || !lastSyncTime) return

    const intervalId = setInterval(() => {
      setTick((t) => t + 1)
    }, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [status, lastSyncTime])

  // Render based on status
  switch (status) {
    case 'syncing':
      return (
        <span
          className="flex items-center gap-1 text-xs text-primary"
          title={
            progress?.currentFile
              ? t('status.syncingFile', { file: progress.currentFile })
              : t('status.syncing')
          }
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>
            {t('status.syncing')}
            {progress && progress.totalFiles > 0
              ? ` ${progress.syncedFiles}/${progress.totalFiles}`
              : '...'}
          </span>
        </span>
      )

    case 'error':
      return (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          title={errorMessage || t('errors.syncRetry')}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>{t('status.error')}</span>
        </button>
      )

    case 'idle':
    default:
      // If never synced, don't show indicator
      if (!lastSyncTime) {
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="w-3 h-3" />
            <span>{t('status.notSynced')}</span>
          </span>
        )
      }

      return (
        <span
          className="flex items-center gap-1 text-xs text-emerald-400"
          title={`${t('status.lastSynced')}: ${lastSyncTime.toLocaleString()}`}
        >
          <Check className="w-3 h-3" />
          <span>{formatRelativeTime(lastSyncTime, t)}</span>
        </span>
      )
  }
}

// ============================================================================
// Export utility for use elsewhere if needed
// ============================================================================

export { formatRelativeTime }
