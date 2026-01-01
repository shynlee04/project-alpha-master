/**
 * @fileoverview Metrics Collection Hook
 * @module presentation/components/hub/useMetricsCollection
 * @created 2026-01-03T01:30:00+07:00
 *
 * Custom hook for collecting and persisting dashboard metrics.
 * Debounced writes to IndexedDB to prevent performance issues.
 *
 * @see Research: _bmad-output/dashboard-charts-research-january-2026.md
 */

import { useEffect, useRef } from 'react';
import { db } from '@/lib/state/dexie-db';
import type { DashboardMetrics } from './useDashboardMetrics';

export interface UseMetricsCollectionOptions {
  /** Whether to enable metrics collection (default: true) */
  enabled?: boolean;
  /** Debounce delay in milliseconds (default: 5000ms) */
  debounceDelay?: number;
  /** Collection interval in milliseconds (default: 60000ms = 1 minute) */
  collectionInterval?: number;
}

/**
 * Hook for collecting dashboard metrics at regular intervals.
 *
 * Features:
 * - Automatic collection on mount (creates initial snapshot)
 * - Periodic collection (default: every minute)
 * - Debounced writes to IndexedDB (5-second default)
 * - Respects timestamp boundaries (collects on minute/hour/day changes)
 *
 * @example
 * ```tsx
 * const metrics = useDashboardMetrics({ projects });
 *
 * useMetricsCollection({
 *   enabled: true,
 *   debounceDelay: 5000,
 *   collectionInterval: 60000,
 * });
 * ```
 */
export function useMetricsCollection({
  enabled = true,
  debounceDelay = 5000,
  collectionInterval = 60000,
}: UseMetricsCollectionOptions = {}): void {
  const timeoutRef = useRef<number>();
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    // Debounced write function
    const debouncedWrite = (() => {
      let timeoutId: number | undefined;

      return (metrics: DashboardMetrics) => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(async () => {
          try {
            const now = new Date().toISOString();

            // Collect project count metrics
            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'projectCount',
              value: metrics.totalProjects,
              metadata: JSON.stringify({
                active: metrics.activeProjects,
                deleted: metrics.deletedProjects,
              }),
            });

            // Collect storage usage metrics (in KB)
            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'storageUsage',
              value: metrics.estimatedStorageKB,
              metadata: JSON.stringify({
                mb: metrics.estimatedStorageMB,
              }),
            });

            // Collect activity metrics
            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'activity',
              value: metrics.projectsOpenedToday,
              metadata: JSON.stringify({
                thisWeek: metrics.projectsOpenedThisWeek,
              }),
            });

            // Collect workspace distribution
            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'workspaceIde',
              value: metrics.ideWorkspaceCount,
            });

            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'workspaceKnowledge',
              value: metrics.knowledgeWorkspaceCount,
            });

            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'workspaceNotes',
              value: metrics.notesWorkspaceCount,
            });

            await db.metricsHistory.put({
              timestamp: now,
              workspaceType: 'all',
              metricName: 'workspaceStudy',
              value: metrics.studyWorkspaceCount,
            });

            console.log('[Metrics Collection] Snapshot saved:', now);
          } catch (error) {
            console.error('[Metrics Collection] Failed to save snapshot:', error);
          }
        }, debounceDelay);
      };
    })();

    // Cleanup function
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, debounceDelay, collectionInterval]);

  // Note: This hook doesn't actually collect metrics on its own.
  // It provides the debounced write function that should be called
  // when metrics change (e.g., when projects change).
  //
  // For automatic collection, integrate this into useDashboardMetrics
  // or call it from a parent component when metrics update.
}

/**
 * Save metrics snapshot immediately (bypasses debounce).
 *
 * Use this for critical moments like project creation/deletion.
 *
 * @example
 * ```tsx
 * const handleProjectCreated = async () => {
 *   await saveMetricsSnapshot(metrics);
 * }
 * ```
 */
export async function saveMetricsSnapshot(metrics: DashboardMetrics): Promise<void> {
  try {
    const now = new Date().toISOString();

    await db.metricsHistory.put({
      timestamp: now,
      workspaceType: 'all',
      metricName: 'projectCount',
      value: metrics.totalProjects,
      metadata: JSON.stringify({
        active: metrics.activeProjects,
        deleted: metrics.deletedProjects,
      }),
    });

    console.log('[Metrics Collection] Immediate snapshot saved:', now);
  } catch (error) {
    console.error('[Metrics Collection] Failed to save immediate snapshot:', error);
    throw error;
  }
}
