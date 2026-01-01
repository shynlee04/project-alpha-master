/**
 * @fileoverview Dashboard Metrics Types
 * @module lib/state/dexie-db-dashboard-types
 * @created 2026-01-03T01:15:00+07:00
 *
 * Type definitions for dashboard metrics history tracking.
 * Supports time series data for charts and analytics.
 *
 * @see Research: _bmad-output/dashboard-charts-research-january-2026.md
 */

import type { Table } from 'dexie';

// ============================================================================
// Metrics History Table
// ============================================================================

/**
 * Metrics snapshot data structure.
 *
 * Captures point-in-time metrics for dashboard charts and analytics.
 * Stored at regular intervals (e.g., daily snapshots, hourly collections).
 */
export interface MetricsSnapshot {
  /** Primary key (auto-generated) */
  id?: number;

  /** Timestamp of snapshot (ISO string) */
  timestamp: string;

  /** Workspace type (optional, for workspace-specific metrics) */
  workspaceType?: 'ide' | 'knowledge' | 'notes' | 'study' | 'all';

  /** Metric name (e.g., 'projectCount', 'storageUsage', 'activity') */
  metricName: string;

  /** Metric value (number for charts) */
  value: number;

  /** Metric metadata (JSON string for flexibility) */
  metadata?: string;
}

/**
 * Metrics History Table.
 *
 * Stores time series metrics data for dashboard charts.
 * Indexed by timestamp for efficient date range queries.
 *
 * **Indexes**:
 * - Primary: `id` (auto-increment)
 * - `timestamp` (for date range queries)
 * - `[workspaceType+metricName+timestamp]` (compound index for filtered queries)
 *
 * **Example Query**:
 * ```typescript
 * // Get last 30 days of project counts
 * const snapshots = await db.metricsHistory
 *   .where('[workspaceType+metricName+timestamp]')
 *   .between(['all', 'projectCount', startDate], ['all', 'projectCount', endDate])
 *   .toArray();
 * ```
 */
export type MetricsHistoryTable = Table<MetricsSnapshot, number>;
