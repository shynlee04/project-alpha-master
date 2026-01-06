/**
 * useAnalytics Hook - Analytics Data Access
 *
 * Provides convenient access to analytics data and functions.
 * Follows custom hook conventions with TypeScript types.
 *
 * @module hooks/useAnalytics
 * @story S-034 Analytics Dashboard and Metrics
 */

import { useEffect, useCallback } from 'react';
import { useAnalyticsStore, TimeRange } from '@/infrastructure/persistence/stores/analytics-store';
import { getMetricsCollector } from '@/lib/analytics/metrics-collector';

export interface UseAnalyticsReturn {
  // Settings
  enabled: boolean;
  timeRange: TimeRange;
  setEnabled: (enabled: boolean) => void;
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (start: Date, end: Date) => Promise<void>;

  // Data
  dailyMetrics: ReturnType<typeof useAnalyticsStore>['dailyMetrics'];
  performanceStats: ReturnType<typeof useAnalyticsStore>['performanceStats'];
  lastUpdated: number | null;

  // Actions
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  exportDataAsJson: () => Promise<string>;
  exportDataAsCsv: () => Promise<string>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const enabled = useAnalyticsStore(s => s.enabled);
  const timeRange = useAnalyticsStore(s => s.timeRange);
  const dailyMetrics = useAnalyticsStore(s => s.dailyMetrics);
  const performanceStats = useAnalyticsStore(s => s.performanceStats);
  const lastUpdated = useAnalyticsStore(s => s.lastUpdated);

  const setEnabled = useAnalyticsStore(s => s.setEnabled);
  const setTimeRange = useAnalyticsStore(s => s.setTimeRange);
  const setCustomDateRange = useAnalyticsStore(s => s.setCustomDateRange);
  const refreshData = useAnalyticsStore(s => s.refreshData);
  const clearAllData = useAnalyticsStore(s => s.clearAllData);

  // Initialize analytics collector on mount if enabled
  useEffect(() => {
    if (enabled) {
      getMetricsCollector().initialize();
    }
  }, [enabled]);

  // Export data as JSON
  const exportDataAsJson = useCallback(async (): Promise<string> => {
    const collector = getMetricsCollector();
    return await collector.exportDataAsJson();
  }, []);

  // Export data as CSV
  const exportDataAsCsv = useCallback(async (): Promise<string> => {
    const collector = getMetricsCollector();
    return await collector.exportDataAsCsv();
  }, []);

  return {
    enabled,
    timeRange,
    setEnabled,
    setTimeRange,
    setCustomDateRange,
    dailyMetrics,
    performanceStats,
    lastUpdated,
    refreshData,
    clearAllData,
    exportDataAsJson,
    exportDataAsCsv,
  };
}

/**
 * Hook to track analytics events
 */
export function useAnalyticsEvents() {
  const enabled = useAnalyticsStore(s => s.enabled);

  const trackFileOpened = useCallback((filePath: string, projectId: string) => {
    if (!enabled) return;
    const { trackFileOpened } = require('@/lib/analytics/metrics-collector');
    trackFileOpened(filePath, projectId);
  }, [enabled]);

  const trackFileEdited = useCallback((filePath: string, projectId: string) => {
    if (!enabled) return;
    const { trackFileEdited } = require('@/lib/analytics/metrics-collector');
    trackFileEdited(filePath, projectId);
  }, [enabled]);

  const trackCommandRun = useCallback((command: string, args?: Record<string, unknown>) => {
    if (!enabled) return;
    const { trackCommandRun } = require('@/lib/analytics/metrics-collector');
    trackCommandRun(command, args);
  }, [enabled]);

  const trackProjectAccessed = useCallback((projectId: string, projectName: string) => {
    if (!enabled) return;
    const { trackProjectAccessed } = require('@/lib/analytics/metrics-collector');
    trackProjectAccessed(projectId, projectName);
  }, [enabled]);

  const trackAgentInteraction = useCallback((agentId: string, action: string) => {
    if (!enabled) return;
    const { trackAgentInteraction } = require('@/lib/analytics/metrics-collector');
    trackAgentInteraction(agentId, action);
  }, [enabled]);

  const trackFeatureUsed = useCallback((feature: string, details?: Record<string, unknown>) => {
    if (!enabled) return;
    const { trackFeatureUsed } = require('@/lib/analytics/metrics-collector');
    trackFeatureUsed(feature, details);
  }, [enabled]);

  return {
    trackFileOpened,
    trackFileEdited,
    trackCommandRun,
    trackProjectAccessed,
    trackAgentInteraction,
    trackFeatureUsed,
  };
}
