/**
 * Offline Detector
 * Detects online/offline status and broadcasts changes
 */

export type OnlineStatus = 'online' | 'offline' | 'unknown'

export interface OfflineDetectorOptions {
  onOnline?: () => void
  onOffline?: () => void
  checkInterval?: number // milliseconds
}

/**
 * Offline detection manager
 */
export class OfflineDetector {
  private isOnline: OnlineStatus = 'unknown'
  private listeners: Set<(status: OnlineStatus) => void> = new Set()
  private checkInterval: number
  private intervalId: ReturnType<typeof setTimeout> | null = null

  constructor(options: OfflineDetectorOptions = {}) {
    this.checkInterval = options.checkInterval || 30000 // 30 seconds default

    // Initial check
    this.isOnline = this.getBrowserOnlineStatus() ? 'online' : 'offline'

    // Bind event listeners
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)

    // Register browser event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)

      // Start periodic checks
      this.startPeriodicChecks()

      // Register callbacks if provided
      if (options.onOnline) {
        this.on(options.onOnline)
      }
      if (options.onOffline) {
        this.on(options.onOffline)
      }
    }
  }

  /**
   * Get browser's online status
   */
  private getBrowserOnlineStatus(): boolean {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    if (this.isOnline !== 'online') {
      this.isOnline = 'online'
      this.notifyListeners()
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    if (this.isOnline !== 'offline') {
      this.isOnline = 'offline'
      this.notifyListeners()
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnline)
      } catch (error) {
        console.error('[OfflineDetector] Listener error:', error)
      }
    })
  }

  /**
   * Start periodic online checks
   */
  private startPeriodicChecks(): void {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      const actualStatus = await this.checkOnlineStatus()
      if (actualStatus !== this.isOnline) {
        this.isOnline = actualStatus
        this.notifyListeners()
      }
    }, this.checkInterval)
  }

  /**
   * Stop periodic checks
   */
  private stopPeriodicChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Perform actual online check (network request)
   */
  private async checkOnlineStatus(): Promise<OnlineStatus> {
    try {
      // Try to fetch a small resource with cache bypass
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(window.location.href, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return response.ok ? 'online' : 'offline'
    } catch (error) {
      // Network error means offline
      return 'offline'
    }
  }

  /**
   * Subscribe to status changes
   */
  on(callback: (status: OnlineStatus) => void): () => void {
    this.listeners.add(callback)

    // Immediately call with current status
    try {
      callback(this.isOnline)
    } catch (error) {
      console.error('[OfflineDetector] Initial callback error:', error)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Get current status
   */
  getStatus(): OnlineStatus {
    return this.isOnline
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline === 'online'
  }

  /**
   * Manually trigger status check
   */
  async refreshStatus(): Promise<OnlineStatus> {
    const newStatus = await this.checkOnlineStatus()
    if (newStatus !== this.isOnline) {
      this.isOnline = newStatus
      this.notifyListeners()
    }
    return this.isOnline
  }

  /**
   * Cleanup and destroy detector
   */
  destroy(): void {
    this.stopPeriodicChecks()
    this.listeners.clear()

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }
}

// Singleton instance
let offlineDetectorInstance: OfflineDetector | null = null

/**
 * Get or create offline detector singleton
 */
export function getOfflineDetector(options?: OfflineDetectorOptions): OfflineDetector {
  if (!offlineDetectorInstance) {
    offlineDetectorInstance = new OfflineDetector(options)
  }
  return offlineDetectorInstance
}

/**
 * Convenience function to check if online
 */
export function isOnline(): boolean {
  return getOfflineDetector().isCurrentlyOnline()
}

/**
 * Convenience function to get current status
 */
export function getOnlineStatus(): OnlineStatus {
  return getOfflineDetector().getStatus()
}
