/**
 * Cache Manager
 * Manages offline cache operations and size tracking
 */

export interface CacheInfo {
  name: string
  size: number
  sizeFormatted: string
  entryCount: number
}

export interface CacheStats {
  totalSize: number
  totalSizeFormatted: string
  caches: CacheInfo[]
}

export class CacheManager {
  private swRegistration: ServiceWorkerRegistration | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.init()
    }
  }

  private async init(): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.getRegistration()
    } catch (error) {
      console.error('[CacheManager] Failed to get SW registration:', error)
    }
  }

  /**
   * Get all cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    if (!this.swRegistration) {
      await this.init()
    }

    if (!this.swRegistration) {
      throw new Error('Service worker not registered')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve({
            totalSize: event.data.size,
            totalSizeFormatted: event.data.sizeFormatted,
            caches: [],
          })
        } else {
          reject(new Error('Unexpected message type'))
        }
      }

      this.swRegistration!.active?.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Cache stats request timeout')), 5000)
    })
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    if (!this.swRegistration) {
      await this.init()
    }

    if (!this.swRegistration) {
      throw new Error('Service worker not registered')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = () => {
        resolve()
      }

      this.swRegistration!.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )

      setTimeout(() => reject(new Error('Clear cache request timeout')), 5000)
    })
  }

  /**
   * Get cache size for a specific cache
   */
  async getCacheSize(cacheName: string): Promise<number> {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      let totalSize = 0
      for (const request of keys) {
        const response = await cache.match(request)
        if (response) {
          const blob = await response.blob()
          totalSize += blob.size
        }
      }

      return totalSize
    } catch (error) {
      console.error(`[CacheManager] Failed to get cache size for ${cacheName}:`, error)
      return 0
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Check if a resource is cached
   */
  async isCached(url: string): Promise<boolean> {
    try {
      const cache = await caches.open('via-gent-dynamic-v1.0.0')
      return await cache.match(url) !== undefined
    } catch (error) {
      console.error('[CacheManager] Failed to check cache:', error)
      return false
    }
  }

  /**
   * Prefetch resources for offline use
   */
  async prefetchResources(urls: string[]): Promise<void> {
    const cache = await caches.open('via-gent-dynamic-v1.0.0')

    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response)
          }
        } catch (error) {
          console.error(`[CacheManager] Failed to prefetch ${url}:`, error)
        }
      })
    )
  }

  /**
   * Estimate cache usage percentage
   */
  async getCacheUsagePercentage(): Promise<number> {
    const stats = await this.getCacheStats()
    const maxCacheSize = 100 * 1024 * 1024 // 100MB
    return Math.min((stats.totalSize / maxCacheSize) * 100, 100)
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null

export function getCacheManager(): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager()
  }
  return cacheManagerInstance
}
