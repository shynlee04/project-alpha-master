/**
 * useOfflineStatus Hook
 * React hook for tracking online/offline status
 */

import { useEffect, useState } from 'react'
import { getOfflineDetector, type OnlineStatus } from '@/lib/offline/offline-detector'

export interface OfflineStatus {
  isOnline: boolean
  status: OnlineStatus
  lastChecked: Date
}

export interface UseOfflineStatusOptions {
  /**
   * Enable periodic status checks
   * @default true
   */
  enablePeriodicCheck?: boolean

  /**
   * Check interval in milliseconds
   * @default 30000 (30 seconds)
   */
  checkInterval?: number
}

/**
 * Hook to track online/offline status
 *
 * @example
 * ```tsx
 * const { isOnline, status } = useOfflineStatus()
 *
 * if (!isOnline) {
 *   return <OfflineBanner />
 * }
 * ```
 */
export function useOfflineStatus(options: UseOfflineStatusOptions = {}): OfflineStatus {
  const { enablePeriodicCheck = true, checkInterval = 30000 } = options

  const [offlineState, setOfflineState] = useState<OfflineStatus>(() => {
    const detector = getOfflineDetector()
    return {
      isOnline: detector.isCurrentlyOnline(),
      status: detector.getStatus(),
      lastChecked: new Date(),
    }
  })

  useEffect(() => {
    const detector = getOfflineDetector({
      checkInterval: enablePeriodicCheck ? checkInterval : undefined,
    })

    // Subscribe to status changes
    const unsubscribe = detector.on((status) => {
      setOfflineState({
        isOnline: status === 'online',
        status,
        lastChecked: new Date(),
      })
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [enablePeriodicCheck, checkInterval])

  return offlineState
}

/**
 * Hook that provides additional offline-related utilities
 */
export function useOfflineManager() {
  const { isOnline, status } = useOfflineStatus()

  const refreshStatus = async () => {
    const { getOfflineDetector } = await import('@/lib/offline/offline-detector')
    const detector = getOfflineDetector()
    return await detector.refreshStatus()
  }

  return {
    isOnline,
    status,
    refreshStatus,
  }
}

export default useOfflineStatus
