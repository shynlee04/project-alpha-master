/**
 * Performance Monitor - App Metrics Collection
 *
 * Monitors application performance metrics:
 * - Initial load time
 * - Page transition times
 * - Memory usage
 * - Cache hit/miss rates
 * - Resource loading times
 *
 * Privacy-first: All data stored locally. No external telemetry.
 *
 * @module lib/analytics/performance-monitor
 * @story S-034 Analytics Dashboard and Metrics
 */

import { db } from '@/infrastructure/persistence/dexie-db';
import { getMetricsCollector } from './metrics-collector';

export interface PerformanceMetrics {
  id?: number;
  timestamp: number;
  loadTime?: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
  cache?: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  resources?: ResourceMetric[];
  navigation?: NavigationMetric;
}

export interface ResourceMetric {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

export interface NavigationMetric {
  from: string;
  to: string;
  duration: number;
}

class PerformanceMonitor {
  private navigationStart: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private resourceMetrics: Map<string, ResourceMetric> = new Map();
  private isMonitoring: boolean = false;

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;

    // Track initial page load
    this.trackPageLoad();

    // Setup navigation timing tracking
    this.trackNavigation();

    // Setup memory tracking (if available)
    this.trackMemory();

    // Setup resource tracking
    this.trackResources();

    // Track performance metrics periodically
    setInterval(() => {
      this.collectAndStoreMetrics();
    }, 60000); // Every minute
  }

  /**
   * Track initial page load
   */
  private trackPageLoad(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.navigationStart;

          getMetricsCollector().trackEvent('feature_used', {
            feature: 'app_load',
            details: {
              loadTime,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint(),
            },
          });
        }
      }, 0);
    });
  }

  /**
   * Get First Paint time
   */
  private getFirstPaint(): number | undefined {
    if (typeof window === 'undefined' || !window.performance) return undefined;

    const paints = window.performance.getEntriesByType('paint');
    const fp = paints.find(p => p.name === 'first-paint');
    return fp?.startTime;
  }

  /**
   * Get First Contentful Paint time
   */
  private getFirstContentfulPaint(): number | undefined {
    if (typeof window === 'undefined' || !window.performance) return undefined;

    const paints = window.performance.getEntriesByType('paint');
    const fcp = paints.find(p => p.name === 'first-contentful-paint');
    return fcp?.startTime;
  }

  /**
   * Track navigation timing
   */
  private trackNavigation(): void {
    if (typeof window === 'undefined') return;

    // Hook into router transitions (TanStack Router)
    // This would need to be integrated with actual router
    let currentPath = window.location.pathname;

    // Simple path change detection
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      const newPath = args[2] as string;
      const duration = Date.now() - performance.now();

      getMetricsCollector().trackEvent('feature_used', {
        feature: 'navigation',
        details: {
          from: currentPath,
          to: newPath,
          duration,
          type: 'push',
        },
      });

      currentPath = newPath;
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      const newPath = args[2] as string;

      getMetricsCollector().trackEvent('feature_used', {
        feature: 'navigation',
        details: {
          from: currentPath,
          to: newPath,
          type: 'replace',
        },
      });

      currentPath = newPath;
    };
  }

  /**
   * Track memory usage
   */
  private trackMemory(): void {
    if (typeof window === 'undefined') return;

    // Check if memory API is available (Chrome-based browsers)
    const memoryInfo = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;

    if (memoryInfo) {
      setInterval(() => {
        const metrics: PerformanceMetrics = {
          timestamp: Date.now(),
          memory: {
            used: memoryInfo.usedJSHeapSize,
            total: memoryInfo.totalJSHeapSize,
            limit: memoryInfo.jsHeapSizeLimit,
          },
        };

        this.storeMetrics(metrics);
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Track resource loading
   */
  private trackResources(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // Use PerformanceObserver to track resource timing
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resource = entry as PerformanceResourceTiming;
              this.resourceMetrics.set(resource.name, {
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize,
                type: this.getResourceType(resource.name),
              });
            }
          }
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        console.warn('[PerformanceMonitor] Resource tracking not available:', e);
      }
    }
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  /**
   * Record cache hit
   */
  recordCacheHit(key: string): void {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(key: string): void {
    this.cacheMisses++;
  }

  /**
   * Get current cache statistics
   */
  getCacheStats(): { hits: number; misses: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate,
    };
  }

  /**
   * Collect and store performance metrics
   */
  private async collectAndStoreMetrics(): Promise<void> {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      cache: this.getCacheStats(),
      resources: Array.from(this.resourceMetrics.values()).slice(-50), // Last 50 resources
    };

    await this.storeMetrics(metrics);
  }

  /**
   * Store metrics in IndexedDB
   */
  private async storeMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // Store in analytics table with type 'performance'
      await db.table('analytics').add({
        timestamp: metrics.timestamp,
        type: 'performance',
        data: metrics,
      });
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to store metrics:', error);
    }
  }

  /**
   * Get performance metrics for a time range
   */
  async getMetrics(startTime: number, endTime: number): Promise<PerformanceMetrics[]> {
    try {
      const events = await db.table('analytics')
        .where('timestamp')
        .between(startTime, endTime)
        .filter(event => event.type === 'performance')
        .toArray();

      return events.map(event => event.data as PerformanceMetrics);
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to get metrics:', error);
      return [];
    }
  }

  /**
   * Get aggregated performance stats
   */
  async getAggregatedStats(startDate: Date, endDate: Date): Promise<{
    avgLoadTime: number;
    avgMemory: number;
    avgCacheHitRate: number;
    slowestResources: ResourceMetric[];
  }> {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const metrics = await this.getMetrics(startTime, endTime);

    const loadTimes = metrics
      .map(m => m.loadTime)
      .filter((t): t is number => t !== undefined);

    const memories = metrics
      .map(m => m.memory?.used)
      .filter((m): m is number => m !== undefined);

    const cacheRates = metrics
      .map(m => m.cache?.hitRate)
      .filter((r): r is number => r !== undefined);

    const allResources = metrics.flatMap(m => m.resources || []);

    const avgLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      : 0;

    const avgMemory = memories.length > 0
      ? memories.reduce((a, b) => a + b, 0) / memories.length
      : 0;

    const avgCacheHitRate = cacheRates.length > 0
      ? cacheRates.reduce((a, b) => a + b, 0) / cacheRates.length
      : 0;

    const slowestResources = allResources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      avgLoadTime,
      avgMemory,
      avgCacheHitRate,
      slowestResources,
    };
  }

  /**
   * Reset monitoring state
   */
  reset(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.resourceMetrics.clear();
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor();
  }
  return monitorInstance;
}

// Convenience functions
export function recordCacheHit(key: string): void {
  getPerformanceMonitor().recordCacheHit(key);
}

export function recordCacheMiss(key: string): void {
  getPerformanceMonitor().recordCacheMiss(key);
}
