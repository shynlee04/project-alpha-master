/**
 * Offline Indicator Component
 * Displays online/offline status banner
 */

import { useTranslation } from 'react-i18next'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  /**
   * Custom className for styling
   */
  className?: string

  /**
   * Position of the indicator
   * @default 'top'
   */
  position?: 'top' | 'bottom'

  /**
   * Auto-hide after delay (ms)
   * @default 0 (no auto-hide)
   */
  autoHideDelay?: number
}

/**
 * Offline status banner with 8-bit gaming style
 */
export function OfflineIndicator({
  className,
  position = 'top',
  autoHideDelay = 0,
}: OfflineIndicatorProps) {
  const { t } = useTranslation()
  const { isOnline, status } = useOfflineStatus()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const { getOfflineDetector } = await import('@/lib/offline/offline-detector')
      const detector = getOfflineDetector()
      await detector.refreshStatus()
    } catch (error) {
      console.error('Failed to refresh status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-hide logic
  if (autoHideDelay > 0 && isVisible && isOnline) {
    setTimeout(() => setIsVisible(false), autoHideDelay)
  }

  // Don't render if online and auto-hidden
  if (isOnline && !isVisible) {
    return null
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0',
  }

  const statusColors = {
    online: 'bg-green-500 border-green-600',
    offline: 'bg-red-500 border-red-600',
    unknown: 'bg-yellow-500 border-yellow-600',
  }

  return (
    <div
      className={cn(
        // Fixed positioning
        'fixed z-[9999]',

        // Position
        positionClasses[position],

        // 8-bit gaming style: Solid colors, sharp borders, no blur
        statusColors[status],
        'border-b-4',
        'border-solid',

        // Spacing
        'px-4 py-2',

        // Transition
        'transition-all duration-300',

        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Status message */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-white" aria-hidden="true" />
          ) : (
            <WifiOff className="w-4 h-4 text-white" aria-hidden="true" />
          )}

          <span className="text-sm font-medium text-white font-mono">
            {isOnline
              ? t('offline.status.online')
              : t('offline.status.offline')}
          </span>

          {status === 'unknown' && (
            <span className="text-xs text-white/80 font-mono">
              ({t('offline.status.checking')})
            </span>
          )}
        </div>

        {/* Offline actions */}
        {!isOnline && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/90 font-mono hidden sm:inline">
              {t('offline.message.limitedFeatures')}
            </span>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                // 8-bit style button
                'px-3 py-1',
                'bg-[var(--color-overlay)] hover:bg-[var(--color-overlay)]',
                'border-2 border-white/30',
                'text-white text-xs font-mono font-semibold',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',

                // Focus styles
                'focus:outline-none focus:ring-2 focus:ring-white/50',

                // Active state
                'active:bg-[var(--muted)]'
              )}
              aria-label={t('offline.action.retry')}
            >
              <span className="flex items-center gap-1.5">
                <RefreshCw
                  className={cn(
                    'w-3 h-3',
                    isRefreshing && 'animate-spin'
                  )}
                  aria-hidden="true"
                />
                <span>{t('offline.action.retry')}</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Offline hint */}
      {!isOnline && (
        <div className="mt-2 text-xs text-white/80 font-mono">
          {t('offline.hint.cachedContent')}
        </div>
      )}
    </div>
  )
}

/**
 * Compact offline indicator (icon only)
 */
export function CompactOfflineIndicator({
  className,
}: {
  className?: string
}) {
  const { t } = useTranslation()
  const { status } = useOfflineStatus()

  if (status === 'online') {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[9999]',
        'bg-red-500 border-2 border-red-600',
        'p-2',
        'shadow-lg',
        className
      )}
      role="status"
      aria-label={t('offline.status.offline')}
    >
      <WifiOff className="w-5 h-5 text-white" aria-hidden="true" />
    </div>
  )
}

/**
 * Status dot indicator (minimal)
 */
export function OfflineStatusDot({
  className,
}: {
  className?: string
}) {
  const { status } = useOfflineStatus()

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    unknown: 'bg-yellow-500',
  }

  return (
    <div
      className={cn(
        'relative w-2 h-2',
        className
      )}
      role="status"
      aria-label={`${status} status`}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          statusColors[status],
          status === 'online' && 'animate-pulse'
        )}
      />
      {/* 8-bit style pixel border */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 8 8"
        fill="none"
      >
        <rect
          x="0"
          y="0"
          width="8"
          height="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-900 dark:text-gray-100"
        />
      </svg>
    </div>
  )
}

export default OfflineIndicator
