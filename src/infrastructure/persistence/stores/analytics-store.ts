/**
 * Analytics Store - State Management for Analytics Dashboard
 *
 * Manages analytics settings and data access.
 * Follows Zustand v5 patterns with individual selectors.
 *
 * @module stores/analytics-store
 * @story S-034 Analytics Dashboard and Metrics
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMetricsCollector, DailyMetrics } from '@/lib/analytics/metrics-collector';
import { getPerformanceMonitor } from '@/lib/analytics/performance-monitor';

export interface AnalyticsState {
  // Settings
  enabled: boolean;
  timeRange: TimeRange;
  customStartDate?: Date;
  customEndDate?: Date;

  // Data cache
  dailyMetrics: DailyMetrics[];
  performanceStats: PerformanceStats | null;
  lastUpdated: number | null;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (start: Date, end: Date) => Promise<void>;
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export type TimeRange = '24h' | '7d' | '30d' | '12m' | 'custom';

export interface PerformanceStats {
  avgLoadTime: number;
  avgMemory: number;
  avgCacheHitRate: number;
  slowestResources: ResourceMetric[];
}

export interface ResourceMetric {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      // Initial state
      enabled: false, // Opt-in: disabled by default
      timeRange: '7d',
      dailyMetrics: [],
      performanceStats: null,
      lastUpdated: null,

      // Actions
      setEnabled: (enabled: boolean) => {
        set({ enabled });
      },

      setTimeRange: async (range: TimeRange) => {
        set({ timeRange: range });
        await get().refreshData();
      },

      setCustomDateRange: async (start: Date, _end: Date) => {
        set({
          timeRange: 'custom',
          customStartDate: start,
        });
        await get().refreshData();
      },

      refreshData: async () => {
        const { timeRange, customStartDate, customEndDate } = get();

        // Calculate date range
        const endDate = new Date();
        const startDate = getStartDate(timeRange, customStartDate, endDate);

        try {
          // Fetch daily metrics
          const dailyMetrics = await getMetricsCollector().getDailyMetrics(startDate, endDate);

          // Fetch performance stats
          const perfStats = await getPerformanceMonitor().getAggregatedStats(startDate, endDate);

          set({
            dailyMetrics,
            performanceStats: perfStats,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error('[AnalyticsStore] Failed to refresh data:', error);
        }
      },

      clearAllData: async () => {
        await getMetricsCollector().clearAllData();
        set({
          dailyMetrics: [],
          performanceStats: null,
          lastUpdated: Date.now(),
        });
      },
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        timeRange: state.timeRange,
        customStartDate: state.customStartDate?.toISOString(),
        customEndDate: state.customEndDate?.toISOString(),
      }),
    }
  )
);

/**
 * Get start date based on time range
 */
function getStartDate(
  range: TimeRange,
  customStart: Date | undefined,
  endDate: Date
): Date {
  const startDate = new Date(endDate);

  switch (range) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '12m':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'custom':
      return customStart || startDate;
  }

  return startDate;
}

// Individual selectors for Zustand v5
export const useAnalyticsEnabled = () => useAnalyticsStore(s => s.enabled);
export const useAnalyticsTimeRange = () => useAnalyticsStore(s => s.timeRange);
export const useDailyMetrics = () => useAnalyticsStore(s => s.dailyMetrics);
export const usePerformanceStats = () => useAnalyticsStore(s => s.performanceStats);
export const useAnalyticsLastUpdated = () => useAnalyticsStore(s => s.lastUpdated);
