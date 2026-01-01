# Dashboard Charts Implementation Research
**Research Date**: 2026-01-02
**Project**: Via-gent (Project Alpha v2.0)
**Component**: Historical Metrics Tracking with Recharts
**Status**: Research Complete - Ready for Implementation

---

## Executive Summary

This document provides comprehensive research findings for implementing dashboard charts with historical metrics tracking in Via-gent's 8-bit dark-themed IDE. The research covers Recharts implementation, IndexedDB schema design for time series data, metrics collection patterns, 2026 dashboard UI trends, accessibility requirements, and performance optimization strategies.

**Key Findings**:
- **Recharts 3.0+**: Full accessibility support enabled by default (keyboard navigation, screen reader support)
- **Dexie.js**: Best-in-class IndexedDB wrapper with compound indexes for efficient time series queries
- **Performance**: Data sampling, debouncing, and memoization critical for large datasets
- **UI Trends**: Dark mode with adaptive color palettes, bold typography, high-contrast data visualizations
- **Implementation**: Zero breaking changes - additive schema only, mobile-responsive patterns required

---

## Table of Contents

1. [Recharts Implementation Guide](#1-recharts-implementation-guide)
2. [IndexedDB Schema Design](#2-indexeddb-schema-design)
3. [Metrics Collection Service](#3-metrics-collection-service)
4. [Chart Component Architecture](#4-chart-component-architecture)
5. [Dashboard UI Design Trends 2026](#5-dashboard-ui-design-trends-2026)
6. [Accessibility Requirements](#6-accessibility-requirements)
7. [Performance Optimization](#7-performance-optimization)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Recharts Implementation Guide

### 1.1 Core Components & Patterns

**Basic Line Chart with Time Series Data**:
```tsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface MetricDataPoint {
  timestamp: string;
  value: number;
}

interface MetricsLineChartProps {
  data: MetricDataPoint[];
  height?: number;
  color?: string;
}

export const MetricsLineChart: React.FC<MetricsLineChartProps> = ({
  data,
  height = 400,
  color = '#8884d8'
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
        <XAxis
          dataKey="timestamp"
          stroke="#888"
          tick={{ fill: '#888' }}
        />
        <YAxis stroke="#888" tick={{ fill: '#888' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #404040',
            borderRadius: '4px',
            color: '#fff'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-in-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

**Pie Chart for Categorical Metrics**:
```tsx
import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, Legend
} from 'recharts';

interface PieDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface MetricsPieChartProps {
  data: PieDataPoint[];
  height?: number;
}

const DEFAULT_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
];

export const MetricsPieChart: React.FC<MetricsPieChartProps> = ({
  data,
  height = 400
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #404040',
            borderRadius: '4px',
            color: '#fff'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
```

### 1.2 Custom Tooltip Implementation

**Dark Theme Tooltip with Custom Formatting**:
```tsx
import React from 'react';
import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  formatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = formatter ? formatter(data.value as number) : data.value;
    const displayLabel = labelFormatter ? labelFormatter(label) : label;

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #404040',
          borderRadius: '4px',
          padding: '12px',
          color: '#fff',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          fontFamily: 'monospace' // 8-bit aesthetic
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '8px' }}>
          {displayLabel}
        </p>
        <p style={{ margin: 0, color: data.color || '#8884d8' }}>
          {data.name}: {value}
        </p>
      </div>
    );
  }

  return null;
};

// Usage:
// <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
```

### 1.3 Responsive Chart Sizing

**Mobile-First Responsive Charts**:
```tsx
import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveChartWrapperProps {
  children: React.ReactNode;
  mobileHeight?: number;
  tabletHeight?: number;
  desktopHeight?: number;
}

export const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  children,
  mobileHeight = 250,
  tabletHeight = 350,
  desktopHeight = 400
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const height = isMobile ? mobileHeight : isTablet ? tabletHeight : desktopHeight;

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      {children}
    </div>
  );
};

// Usage:
// <ResponsiveChartWrapper>
//   <ResponsiveContainer width="100%" height="100%">
//     <LineChart>...</LineChart>
//   </ResponsiveContainer>
// </ResponsiveChartWrapper>
```

### 1.4 TypeScript Type Safety

**Strongly Typed Chart Components**:
```tsx
import type {
  TooltipProps,
  LegendProps,
  CartesianGridProps
} from 'recharts';

interface ChartConfig {
  data: readonly unknown[];
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  grid?: Partial<CartesianGridProps>;
  tooltip?: Partial<TooltipProps<number, string>>;
  legend?: Partial<LegendProps>;
}

export const createLineChartConfig = (
  overrides?: Partial<ChartConfig>
): ChartConfig => ({
  data: [],
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  grid: {
    strokeDasharray: '3 3',
    stroke: '#404040'
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #404040',
      borderRadius: '4px',
      color: '#fff'
    }
  },
  legend: {
    iconType: 'circle',
    wrapperStyle: { paddingTop: '20px' }
  },
  ...overrides
});
```

---

## 2. IndexedDB Schema Design

### 2.1 Dexie Database Schema

**Time Series Metrics Table** (Additive Schema - Zero Breaking Changes):
```typescript
import Dexie, { Table } from 'dexie';

export interface MetricSnapshot {
  id?: number;
  timestamp: number; // Unix timestamp (milliseconds)
  workspaceType: string; // 'ide' | 'knowledge' | 'notes' | 'study'
  metricName: string; // 'filesEdited', 'chatMessages', 'timeSpent', etc.
  value: number;
  metadata?: {
    projectId?: string;
    agentUsed?: string;
    additionalContext?: Record<string, unknown>;
  };
}

export interface MetricAggregation {
  id?: number;
  startTime: number;
  endTime: number;
  workspaceType: string;
  metricName: string;
  aggregationType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  value: number;
  count: number; // Number of data points aggregated
  min?: number;
  max?: number;
  avg?: number;
}

export class ViaGentMetricsDB extends Dexie {
  metricSnapshots!: Table<MetricSnapshot>;
  metricAggregations!: Table<MetricAggregation>;

  constructor() {
    super('ViaGentMetricsDB');

    // Version 1: Initial schema (ADDITIVE - no breaking changes)
    this.version(1).stores({
      metricSnapshots: '++id, [workspaceType+metricName+timestamp], timestamp, workspaceType, metricName',
      metricAggregations: '++id, [workspaceType+metricName+aggregationType+startTime], startTime, endTime'
    });
  }
}

export const metricsDB = new ViaGentMetricsDB();
```

**Schema Design Rationale**:

1. **Compound Index**: `[workspaceType+metricName+timestamp]`
   - Enables efficient queries: "Get CPU usage for IDE workspace between time A and B"
   - IndexedDB can use index to narrow results without full table scan

2. **Separate Aggregations Table**: Pre-computed summaries for performance
   - Hourly, daily, weekly, monthly aggregations
   - Avoids expensive queries on raw snapshot data
   - Stores count, min, max, avg for statistical analysis

3. **Additive Versioning**: New version adds tables/indices, doesn't modify existing
   - Follows IndexedDB best practices for zero-downtime migrations
   - Old data remains accessible, new features use new schema

### 2.2 Query Patterns

**Date Range Queries with Compound Index**:
```typescript
import { metricsDB } from './dexie-db-metrics';

// Query: Get metric snapshots for specific workspace and metric within date range
async function getMetricSnapshots(
  workspaceType: string,
  metricName: string,
  startTime: number,
  endTime: number
): Promise<MetricSnapshot[]> {
  return await metricsDB.metricSnapshots
    .where('[workspaceType+metricName+timestamp]')
    .between([workspaceType, metricName, startTime], [workspaceType, metricName, endTime], true, true)
    .toArray();
}

// Query: Get latest snapshot for specific metric
async function getLatestSnapshot(
  workspaceType: string,
  metricName: string
): Promise<MetricSnapshot | undefined> {
  return await metricsDB.metricSnapshots
    .where('[workspaceType+metricName+timestamp]')
    .between([workspaceType, metricName, 0], [workspaceType, metricName, Date.now()], true, true)
    .last();
}

// Query: Get all snapshots for a workspace type
async function getAllWorkspaceMetrics(
  workspaceType: string,
  startTime: number,
  endTime: number
): Promise<MetricSnapshot[]> {
  return await metricsDB.metricSnapshots
    .where('workspaceType')
    .equals(workspaceType)
    .and(snapshot => snapshot.timestamp >= startTime && snapshot.timestamp <= endTime)
    .toArray();
}
```

### 2.3 Data Retention Policy

**Automatic Cleanup of Old Data**:
```typescript
import { metricsDB } from './dexie-db-metrics';

const RETENTION_POLICIES = {
  SNAPSHOT_DAYS: 30, // Keep raw snapshots for 30 days
  HOURLY_DAYS: 90, // Keep hourly aggregations for 90 days
  DAILY_DAYS: 365, // Keep daily aggregations for 1 year
  WEEKLY_DAYS: 1825, // Keep weekly aggregations for 5 years
  MONTHLY_DAYS: 3650 // Keep monthly aggregations for 10 years
};

export async function cleanupOldSnapshots(): Promise<void> {
  const cutoffDate = Date.now() - (RETENTION_POLICIES.SNAPSHOT_DAYS * 24 * 60 * 60 * 1000);

  const deletedCount = await metricsDB.metricSnapshots
    .where('timestamp')
    .below(cutoffDate)
    .delete();

  console.log(`Cleaned up ${deletedCount} old metric snapshots`);
}

export async function cleanupOldAggregations(): Promise<void> {
  const hourlyCutoff = Date.now() - (RETENTION_POLICIES.HOURLY_DAYS * 24 * 60 * 60 * 1000);
  const dailyCutoff = Date.now() - (RETENTION_POLICIES.DAILY_DAYS * 24 * 60 * 60 * 1000);

  const hourlyDeleted = await metricsDB.metricAggregations
    .where('aggregationType')
    .equals('hourly')
    .and(aggr => aggr.startTime < hourlyCutoff)
    .delete();

  const dailyDeleted = await metricsDB.metricAggregations
    .where('aggregationType')
    .equals('daily')
    .and(aggr => aggr.startTime < dailyCutoff)
    .delete();

  console.log(`Cleaned up ${hourlyDeleted} hourly and ${dailyDeleted} daily aggregations`);
}

// Run cleanup on application startup
export async function initializeMetricsCleanup(): Promise<void> {
  await cleanupOldSnapshots();
  await cleanupOldAggregations();

  // Schedule daily cleanup
  setInterval(async () => {
    await cleanupOldSnapshots();
    await cleanupOldAggregations();
  }, 24 * 60 * 60 * 1000);
}
```

### 2.4 Schema Migration Strategy

**Zero-Downtime Migrations**:
```typescript
import Dexie, { UpgradeTransaction } from 'dexie';

export class ViaGentMetricsDB extends Dexie {
  constructor() {
    super('ViaGentMetricsDB');

    // Version 1: Initial schema
    this.version(1).stores({
      metricSnapshots: '++id, [workspaceType+metricName+timestamp], timestamp, workspaceType, metricName',
      metricAggregations: '++id, [workspaceType+metricName+aggregationType+startTime], startTime, endTime'
    });

    // Version 2: Add new index (ADDITIVE - no breaking changes)
    this.version(2).stores({
      metricSnapshots: '++id, [workspaceType+metricName+timestamp], [timestamp+workspaceType], timestamp, workspaceType, metricName',
      metricAggregations: '++id, [workspaceType+metricName+aggregationType+startTime], [aggregationType+startTime], startTime, endTime'
    }).upgrade(async (tx: UpgradeTransaction) => {
      // No data migration needed - just adding indexes
      console.log('Upgraded to version 2: Added reverse lookup indexes');
    });

    // Version 3: Add metadata field (already in interface, just ensuring it's indexed)
    this.version(3).stores({
      metricSnapshots: '++id, [workspaceType+metricName+timestamp], [timestamp+workspaceType], timestamp, workspaceType, metricName, metadata.projectId',
      metricAggregations: '++id, [workspaceType+metricName+aggregationType+startTime], [aggregationType+startTime], startTime, endTime'
    }).upgrade(async (tx: UpgradeTransaction) => {
      console.log('Upgraded to version 3: Added metadata.projectId index');
    });
  }
}
```

---

## 3. Metrics Collection Service

### 3.1 Service Architecture

**Metrics Collection Service**:
```typescript
import { metricsDB, MetricSnapshot } from './dexie-db-metrics';

export enum MetricType {
  FILES_EDITED = 'filesEdited',
  CHAT_MESSAGES = 'chatMessages',
  TIME_SPENT = 'timeSpent',
  AGENTS_USED = 'agentsUsed',
  TOOLS_EXECUTED = 'toolsExecuted',
  ERRORS_OCCURRED = 'errorsOccurred',
  MEMORY_USAGE = 'memoryUsage',
  WEBCONTAINER_UPTIME = 'webcontainerUptime'
}

export enum WorkspaceType {
  IDE = 'ide',
  KNOWLEDGE = 'knowledge',
  NOTES = 'notes',
  STUDY = 'study'
}

interface MetricCollectorConfig {
  collectionInterval: number; // milliseconds
  debounceTime: number; // milliseconds
  batchSize: number; // number of snapshots to batch before writing
}

class MetricsCollectionService {
  private collectionTimer: NodeJS.Timeout | null = null;
  private pendingSnapshots: MetricSnapshot[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private config: MetricCollectorConfig;

  constructor(config: Partial<MetricCollectorConfig> = {}) {
    this.config = {
      collectionInterval: 60000, // 1 minute default
      debounceTime: 5000, // 5 seconds default
      batchSize: 10,
      ...config
    };
  }

  /**
   * Start metrics collection for a workspace
   */
  startCollection(workspaceType: WorkspaceType): void {
    if (this.collectionTimer) {
      console.warn('Metrics collection already started');
      return;
    }

    this.collectionTimer = setInterval(async () => {
      await this.collectMetrics(workspaceType);
    }, this.config.collectionInterval);

    console.log(`Started metrics collection for ${workspaceType} workspace`);
  }

  /**
   * Stop metrics collection
   */
  stopCollection(): void {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Flush any pending snapshots
    if (this.pendingSnapshots.length > 0) {
      this.flushSnapshots();
    }

    console.log('Stopped metrics collection');
  }

  /**
   * Collect current metrics and queue for storage
   */
  private async collectMetrics(workspaceType: WorkspaceType): Promise<void> {
    const metrics = await this.gatherMetrics(workspaceType);
    const snapshot: MetricSnapshot = {
      timestamp: Date.now(),
      workspaceType,
      ...metrics
    };

    this.pendingSnapshots.push(snapshot);

    // Flush if we've reached batch size
    if (this.pendingSnapshots.length >= this.config.batchSize) {
      await this.flushSnapshots();
    } else {
      // Debounce flush to avoid excessive writes
      this.scheduleFlush();
    }
  }

  /**
   * Gather metrics from various sources
   */
  private async gatherMetrics(
    workspaceType: WorkspaceType
  ): Promise<Partial<Omit<MetricSnapshot, 'id' | 'timestamp' | 'workspaceType'>>> {
    const metrics: Record<string, number> = {};

    // Collect time spent
    metrics[MetricType.TIME_SPENT] = this.config.collectionInterval / 1000 / 60; // minutes

    // Collect WebContainer metrics if in IDE workspace
    if (workspaceType === WorkspaceType.IDE) {
      const wcMetrics = await this.getWebContainerMetrics();
      Object.assign(metrics, wcMetrics);
    }

    // Collect chat metrics
    const chatMetrics = await this.getChatMetrics();
    Object.assign(metrics, chatMetrics);

    // Collect file system metrics
    const fsMetrics = await this.getFilesystemMetrics();
    Object.assign(metrics, fsMetrics);

    return metrics;
  }

  /**
   * Get WebContainer-specific metrics
   */
  private async getWebContainerMetrics(): Promise<Record<string, number>> {
    // Placeholder - actual implementation would query WebContainer status
    return {
      [MetricType.WEBCONTAINER_UPTIME]: 1, // boolean as number
      [MetricType.MEMORY_USAGE]: Math.floor(Math.random() * 100) // placeholder
    };
  }

  /**
   * Get chat/conversation metrics
   */
  private async getChatMetrics(): Promise<Record<string, number>> {
    // Placeholder - actual implementation would query chat store
    return {
      [MetricType.CHAT_MESSAGES]: Math.floor(Math.random() * 10)
    };
  }

  /**
   * Get filesystem metrics
   */
  private async getFilesystemMetrics(): Promise<Record<string, number>> {
    // Placeholder - actual implementation would query file system
    return {
      [MetricType.FILES_EDITED]: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Schedule debounced flush
   */
  private scheduleFlush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      await this.flushSnapshots();
    }, this.config.debounceTime);
  }

  /**
   * Flush pending snapshots to IndexedDB
   */
  private async flushSnapshots(): Promise<void> {
    if (this.pendingSnapshots.length === 0) {
      return;
    }

    const snapshotsToWrite = [...this.pendingSnapshots];
    this.pendingSnapshots = [];

    try {
      await metricsDB.metricSnapshots.bulkAdd(snapshotsToWrite);
      console.log(`Flushed ${snapshotsToWrite.length} metric snapshots`);
    } catch (error) {
      console.error('Failed to flush metric snapshots:', error);
      // Re-queue failed snapshots
      this.pendingSnapshots.unshift(...snapshotsToWrite);
    }
  }

  /**
   * Record a one-time metric event (e.g., user action)
   */
  async recordEvent(
    workspaceType: WorkspaceType,
    metricName: string,
    value: number,
    metadata?: MetricSnapshot['metadata']
  ): Promise<void> {
    const snapshot: MetricSnapshot = {
      timestamp: Date.now(),
      workspaceType,
      metricName,
      value,
      metadata
    };

    await metricsDB.metricSnapshots.add(snapshot);
  }
}

// Singleton instance
export const metricsService = new MetricsCollectionService();
```

### 3.2 Metrics Aggregation Service

**Pre-compute Aggregations for Performance**:
```typescript
import { metricsDB, MetricAggregation } from './dexie-db-metrics';

class MetricsAggregationService {
  /**
   * Aggregate metric snapshots into hourly/daily/weekly summaries
   */
  async aggregateSnapshots(
    aggregationType: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    const now = Date.now();
    let startTime: number;
    let endTime: number;

    // Calculate time range based on aggregation type
    switch (aggregationType) {
      case 'hourly':
        startTime = now - 60 * 60 * 1000; // Last hour
        endTime = now;
        break;
      case 'daily':
        startTime = now - 24 * 60 * 60 * 1000; // Last day
        endTime = now;
        break;
      case 'weekly':
        startTime = now - 7 * 24 * 60 * 60 * 1000; // Last week
        endTime = now;
        break;
      case 'monthly':
        startTime = now - 30 * 24 * 60 * 60 * 1000; // Last month (approximate)
        endTime = now;
        break;
    }

    // Get all snapshots in time range
    const snapshots = await metricsDB.metricSnapshots
      .where('timestamp')
      .between(startTime, endTime, true, true)
      .toArray();

    // Group by workspace type and metric name
    const grouped = new Map<string, MetricSnapshot[]>();
    for (const snapshot of snapshots) {
      const key = `${snapshot.workspaceType}-${snapshot.metricName}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(snapshot);
    }

    // Compute aggregations for each group
    const aggregations: MetricAggregation[] = [];

    for (const [key, groupSnapshots] of grouped.entries()) {
      const [workspaceType, metricName] = key.split('-');

      const values = groupSnapshots.map(s => s.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const avg = sum / count;
      const min = Math.min(...values);
      const max = Math.max(...values);

      aggregations.push({
        startTime,
        endTime,
        workspaceType,
        metricName,
        aggregationType,
        value: sum,
        count,
        min,
        max,
        avg
      });
    }

    // Bulk insert aggregations
    await metricsDB.metricAggregations.bulkPut(aggregations);

    console.log(`Created ${aggregations.length} ${aggregationType} aggregations`);
  }

  /**
   * Schedule automatic aggregation runs
   */
  startAggregationScheduler(): void {
    // Hourly aggregation runs every hour
    setInterval(async () => {
      await this.aggregateSnapshots('hourly');
    }, 60 * 60 * 1000);

    // Daily aggregation runs every day
    setInterval(async () => {
      await this.aggregateSnapshots('daily');
    }, 24 * 60 * 60 * 1000);

    // Weekly aggregation runs every week
    setInterval(async () => {
      await this.aggregateSnapshots('weekly');
    }, 7 * 24 * 60 * 60 * 1000);

    // Monthly aggregation runs every month
    setInterval(async () => {
      await this.aggregateSnapshots('monthly');
    }, 30 * 24 * 60 * 60 * 1000);
  }
}

export const aggregationService = new MetricsAggregationService();
```

---

## 4. Chart Component Architecture

### 4.1 Component Breakdown

```
src/presentation/components/dashboard/
├── DashboardPage.tsx              # Main dashboard entry point (120 lines max)
├── charts/                        # Chart components
│   ├── MetricsLineChart.tsx      # Time series line chart (80 lines)
│   ├── MetricsPieChart.tsx       # Categorical pie chart (70 lines)
│   ├── MetricsBarChart.tsx       # Comparison bar chart (75 lines)
│   └── CustomTooltip.tsx         # Dark theme tooltip (60 lines)
├── metrics/                       # Metric-specific displays
│   ├── WorkspaceActivityCard.tsx # Activity overview (100 lines)
│   ├── TimeSpentCard.tsx         # Time tracking (90 lines)
│   ├── AgentUsageCard.tsx        # Agent statistics (95 lines)
│   └── FileSystemCard.tsx        # File operations (85 lines)
├── filters/                       # Dashboard filters
│   ├── TimeRangeSelector.tsx     # Date range picker (80 lines)
│   ├── WorkspaceFilter.tsx       # Workspace type filter (70 lines)
│   └── MetricTypeSelector.tsx    # Metric type filter (65 lines)
└── hooks/                         # Custom hooks
    ├── useMetricsData.ts         # Data fetching hook (100 lines)
    ├── useMetricsAggregation.ts  # Aggregation hook (90 lines)
    └── useChartExport.ts         # Chart export hook (60 lines)
```

### 4.2 Core Component Props

**Dashboard Page Component**:
```typescript
import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { MetricsLineChart, MetricsPieChart } from './charts';
import { WorkspaceActivityCard, TimeSpentCard } from './metrics';
import { TimeRangeSelector, WorkspaceFilter } from './filters';
import { useMetricsData } from './hooks/useMetricsData';

interface DashboardPageProps {
  workspaceType?: string;
  initialTimeRange?: '24h' | '7d' | '30d' | '90d';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  workspaceType,
  initialTimeRange = '7d'
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [selectedTimeRange, setSelectedTimeRange] = React.useState(initialTimeRange);
  const [selectedWorkspace, setSelectedWorkspace] = React.useState(workspaceType);

  const {
    data,
    loading,
    error,
    refetch
  } = useMetricsData({
    workspaceType: selectedWorkspace,
    timeRange: selectedTimeRange
  });

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader>
        <TimeRangeSelector
          value={selectedTimeRange}
          onChange={setSelectedTimeRange}
        />
        <WorkspaceFilter
          value={selectedWorkspace}
          onChange={setSelectedWorkspace}
        />
      </DashboardHeader>

      <DashboardGrid isMobile={isMobile} isTablet={isTablet}>
        <WorkspaceActivityCard data={data.activity} />
        <TimeSpentCard data={data.timeSpent} />

        {!isMobile && (
          <MetricsLineChart
            title="Files Edited Over Time"
            data={data.filesEdited}
            color="#0088FE"
          />
        )}

        <MetricsPieChart
          title="Agent Usage Distribution"
          data={data.agentUsage}
        />
      </DashboardGrid>
    </div>
  );
};
```

### 4.3 Custom Hooks

**useMetricsData Hook** (Memoized Data Fetching):
```typescript
import { useEffect, useState, useCallback } from 'react';
import { metricsDB } from '@/infrastructure/persistence/dexie/dexie-db-metrics';

interface UseMetricsDataOptions {
  workspaceType?: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
}

interface MetricsData {
  activity: unknown[];
  timeSpent: unknown[];
  filesEdited: unknown[];
  agentUsage: unknown[];
}

export function useMetricsData(options: UseMetricsDataOptions) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateTimeRange = useCallback(() => {
    const now = Date.now();
    switch (options.timeRange) {
      case '24h':
        return now - 24 * 60 * 60 * 1000;
      case '7d':
        return now - 7 * 24 * 60 * 60 * 1000;
      case '30d':
        return now - 30 * 24 * 60 * 60 * 1000;
      case '90d':
        return now - 90 * 24 * 60 * 60 * 1000;
    }
  }, [options.timeRange]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startTime = calculateTimeRange();

      // Fetch snapshots from IndexedDB
      const snapshots = await metricsDB.metricSnapshots
        .where('timestamp')
        .between(startTime, Date.now(), true, true)
        .and(snapshot => !options.workspaceType || snapshot.workspaceType === options.workspaceType)
        .toArray();

      // Process data for charts
      const processedData = processSnapshotsForCharts(snapshots);
      setData(processedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.workspaceType, calculateTimeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

function processSnapshotsForCharts(snapshots: MetricSnapshot[]): MetricsData {
  // Process snapshots into chart-ready format
  // Implementation depends on specific metrics
  return {
    activity: [],
    timeSpent: [],
    filesEdited: [],
    agentUsage: []
  };
}
```

---

## 5. Dashboard UI Design Trends 2026

### 5.1 Dark Theme Design Patterns

**8-Bit Dark Theme Palette**:
```css
:root {
  /* Dashboard-specific design tokens */
  --dashboard-bg-primary: #0a0a0a;
  --dashboard-bg-secondary: #1a1a1a;
  --dashboard-bg-tertiary: #2a2a2a;

  --dashboard-border-color: #404040;
  --dashboard-border-hover: #606060;

  --dashboard-text-primary: #ffffff;
  --dashboard-text-secondary: #b0b0b0;
  --dashboard-text-tertiary: #808080;

  /* Chart colors (high contrast) */
  --chart-color-primary: #0088FE;
  --chart-color-secondary: #00C49F;
  --chart-color-tertiary: #FFBB28;
  --chart-color-quaternary: #FF8042;

  /* Success/warning/error colors */
  --chart-color-success: #00C49F;
  --chart-color-warning: #FFBB28;
  --chart-color-error: #FF8042;

  /* Grid and axis colors */
  --chart-grid-color: #404040;
  --chart-axis-color: #606060;
}
```

**Bold Typography for Metrics**:
```css
.dashboard-metric-value {
  font-family: 'Courier New', monospace; /* 8-bit aesthetic */
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dashboard-text-primary);
  letter-spacing: -0.02em;
}

.dashboard-metric-label {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--dashboard-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### 5.2 Card-Based Layout

**Metric Card Component**:
```tsx
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  trend,
  icon
}) => {
  const trendColor = trend?.direction === 'up' ? '#00C49F'
    : trend?.direction === 'down' ? '#FF8042'
    : '#FFBB28';

  return (
    <div
      style={{
        backgroundColor: 'var(--dashboard-bg-secondary)',
        border: '1px solid var(--dashboard-border-color)',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--dashboard-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {title}
        </span>
        {icon && (
          <div style={{ color: 'var(--dashboard-text-tertiary)' }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: 'Courier New, monospace',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--dashboard-text-primary)'
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--dashboard-text-tertiary)',
              marginLeft: '4px'
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: trendColor
          }}
        >
          {trend.direction === 'up' && '▲'}
          {trend.direction === 'down' && '▼'}
          {trend.direction === 'neutral' && '▶'}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};
```

### 5.3 Responsive Grid Layout

**Mobile-First Dashboard Grid**:
```css
.dashboard-grid {
  display: grid;
  gap: 20px;
  padding: 20px;

  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  /* Tablet: 2 columns */
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  /* Desktop: 3 columns */
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  /* Large desktop: 4 columns */
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Full-width chart container */
.dashboard-chart-full {
  grid-column: 1 / -1;
  min-height: 400px;
}
```

---

## 6. Accessibility Requirements

### 6.1 Recharts Accessibility Features

**Recharts 3.0+ Default Accessibility** (Zero Configuration Required):

```tsx
import { LineChart, Line, ... } from 'recharts';

// Recharts 3.0+ automatically enables:
// - Keyboard navigation (arrow keys)
// - Screen reader support (live region tooltips)
// - ARIA labels and roles
// - Focus indicators

<LineChart data={data}>
  {/* No accessibilityLayer prop needed - enabled by default */}
  <Line dataKey="value" />
  {/* ... other components */}
</LineChart>
```

**Keyboard Navigation**:
- **Tab**: Focus chart
- **Arrow Left/Right**: Navigate between data points
- **Screen Reader**: Automatically reads tooltip content as live region

### 6.2 Custom ARIA Labels

**Enhanced Accessibility for Custom Charts**:
```tsx
import React from 'react';

interface AccessibleChartProps {
  title: string;
  description: string;
  data: unknown[];
}

export const AccessibleLineChart: React.FC<AccessibleChartProps> = ({
  title,
  description,
  data
}) => {
  return (
    <div
      role="application"
      aria-label={title}
      aria-describedby="chart-description"
    >
      {/* Hidden description for screen readers */}
      <p
        id="chart-description"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0
        }}
      >
        {description}
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          aria-label={title}
          tabIndex={0}
        >
          {/* Chart components */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### 6.3 Color Blindness Safety

**Accessible Color Palette**:
```typescript
// Color blind-safe palette (high contrast)
export const CHART_COLORS = {
  PRIMARY: '#0088FE',   // Blue (accessible for most types)
  SECONDARY: '#00C49F', // Green (distinct from blue)
  TERTIARY: '#FFBB28',  // Yellow (visible in deuteranopia)
  QUATERNARY: '#FF8042', // Orange (distinct from green)
  QUINARY: '#8884d8',   // Purple (distinct from blue)
  SENARY: '#82ca9d',    // Teal (accessible)
  SEPTENARY: '#ffc658', // Amber (high contrast)
  OCTONARY: '#ff7300'   // Red-orange (visible in protanopia)
};

// Color combinations that work for:
// - Protanopia (red-blind)
// - Deuteranopia (green-blind)
// - Tritanopia (blue-blind)
// - Monochromacy (total color blindness)
```

---

## 7. Performance Optimization

### 7.1 Large Dataset Handling

**Data Sampling for Performance**:
```typescript
interface DataPoint {
  timestamp: number;
  value: number;
}

/**
 * Sample data to prevent rendering bottlenecks
 * @param data Full dataset
 * @param maxPoints Maximum number of points to return (default: 100)
 */
export function sampleData(data: DataPoint[], maxPoints: number = 100): DataPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }

  // Use largest triangle three buckets (LTTB) algorithm for intelligent sampling
  // Simplified version: uniform sampling for now
  const step = Math.floor(data.length / maxPoints);
  const sampled: DataPoint[] = [];

  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }

  // Always include the last point
  sampled.push(data[data.length - 1]);

  return sampled;
}

/**
 * Aggregate data by time bucket for performance
 */
export function aggregateDataByTimeBucket(
  data: DataPoint[],
  bucketSize: number // milliseconds
): DataPoint[] {
  const buckets = new Map<number, number[]>(); // timestamp -> values

  for (const point of data) {
    const bucketTimestamp = Math.floor(point.timestamp / bucketSize) * bucketSize;

    if (!buckets.has(bucketTimestamp)) {
      buckets.set(bucketTimestamp, []);
    }

    buckets.get(bucketTimestamp)!.push(point.value);
  }

  // Compute average for each bucket
  return Array.from(buckets.entries()).map(([timestamp, values]) => ({
    timestamp,
    value: values.reduce((a, b) => a + b, 0) / values.length
  }));
}
```

### 7.2 Chart Re-rendering Optimization

**Memoized Chart Components**:
```typescript
import React, { memo, useMemo } from 'react';
import { LineChart, Line, ... } from 'recharts';

interface OptimizedLineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export const OptimizedLineChart: React.FC<OptimizedLineChartProps> = memo(({
  data,
  color,
  height
}) => {
  // Memoize processed data
  const processedData = useMemo(() => {
    // Sample data if too large
    const sampled = sampleData(data, 100);

    // Format timestamps for display
    return sampled.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleDateString()
    }));
  }, [data]);

  // Memoize chart style
  const chartStyle = useMemo(() => ({
    height: `${height}px`
  }), [height]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={processedData} style={chartStyle}>
        {/* Chart components */}
      </LineChart>
    </ResponsiveContainer>
  );
});

OptimizedLineChart.displayName = 'OptimizedLineChart';
```

### 7.3 Debouncing Metrics Collection

**Throttled Metric Recording**:
```typescript
class ThrottledMetricsCollector {
  private lastWriteTime: number = 0;
  private writeQueue: MetricSnapshot[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly MIN_WRITE_INTERVAL = 5000; // 5 seconds minimum between writes

  async recordMetric(snapshot: MetricSnapshot): Promise<void> {
    this.writeQueue.push(snapshot);

    const now = Date.now();
    const timeSinceLastWrite = now - this.lastWriteTime;

    if (timeSinceLastWrite >= this.MIN_WRITE_INTERVAL) {
      await this.flush();
    } else {
      this.scheduleFlush(this.MIN_WRITE_INTERVAL - timeSinceLastWrite);
    }
  }

  private scheduleFlush(delay: number): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(async () => {
      await this.flush();
    }, delay);
  }

  private async flush(): Promise<void> {
    if (this.writeQueue.length === 0) {
      return;
    }

    const snapshots = [...this.writeQueue];
    this.writeQueue = [];
    this.lastWriteTime = Date.now();

    await metricsDB.metricSnapshots.bulkAdd(snapshots);
  }
}
```

### 7.4 Performance Checklist

**Before Production Deployment**:

- [ ] **Data Sampling**: Implement for datasets > 100 points
- [ ] **Debouncing**: Metrics collection throttled to minimum 5-second intervals
- [ ] **Memoization**: Chart components wrapped with `React.memo()`
- [ ] **useMemo**: Expensive computations (data processing) memoized
- [ ] **Batch Writes**: IndexedDB writes batched (10+ snapshots per transaction)
- [ ] **Lazy Loading**: Charts lazy-loaded with `React.lazy()` and `Suspense`
- [ ] **Virtualization**: For very large datasets, consider `react-window` for data lists
- [ ] **Compression**: IndexedDB compression for large text metadata (if needed)
- [ ] **IndexedDB Quota**: Handle quota exceeded errors gracefully
- [ ] **Performance Monitoring**: Add React Profiler dev tools integration

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2) - 16-20 hours

**Story 1.1: Set up Dexie Metrics Database** (4-6 hours)
- [ ] Create `dexie-db-metrics.ts` with schema definitions
- [ ] Implement compound indexes for time series queries
- [ ] Write database migration scripts (version 1 → 2 → 3)
- [ ] Add data retention policy with automatic cleanup
- [ ] Unit tests for database operations

**Story 1.2: Implement Metrics Collection Service** (6-8 hours)
- [ ] Create `MetricsCollectionService` class
- [ ] Implement time-based metric collection (1-minute intervals)
- [ ] Add debouncing and batch write logic
- [ ] Create `recordEvent()` for one-time metrics
- [ ] Integration tests for service

**Story 1.3: Create Metrics Aggregation Service** (6-8 hours)
- [ ] Implement `MetricsAggregationService` class
- [ ] Add hourly aggregation logic
- [ ] Add daily aggregation logic
- [ ] Add weekly/monthly aggregation logic
- [ ] Set up automatic aggregation scheduler
- [ ] Tests for aggregation accuracy

### Phase 2: Chart Components (Week 3-4) - 18-22 hours

**Story 2.1: Implement Recharts Line Chart** (5-7 hours)
- [ ] Create `MetricsLineChart` component
- [ ] Implement dark theme styling (8-bit aesthetic)
- [ ] Add custom tooltip with formatting
- [ ] Implement responsive sizing (mobile/tablet/desktop)
- [ ] Add TypeScript types and props validation

**Story 2.2: Implement Recharts Pie Chart** (4-6 hours)
- [ ] Create `MetricsPieChart` component
- [ ] Implement color-blind-safe palette
- [ ] Add percentage labels
- [ ] Implement responsive sizing
- [ ] Add empty state handling

**Story 2.3: Implement Custom Tooltip Component** (3-4 hours)
- [ ] Create `CustomTooltip` with dark theme
- [ ] Add support for multiple data formats
- [ ] Implement accessibility (live region for screen readers)
- [ ] Add unit tests for tooltip rendering

**Story 2.4: Create Chart Utility Components** (6-8 hours)
- [ ] `ResponsiveChartWrapper` for mobile-first layouts
- [ ] `ChartLegend` with custom styling
- [ ] `ChartLoadingState` skeleton
- [ ] `ChartErrorState` with retry button
- [ ] `ChartEmptyState` for no data

### Phase 3: Dashboard UI (Week 5-6) - 20-25 hours

**Story 3.1: Implement Metric Card Components** (8-10 hours)
- [ ] `WorkspaceActivityCard` component
- [ ] `TimeSpentCard` component
- [ ] `AgentUsageCard` component
- [ ] `FileSystemCard` component
- [ ] Implement trend indicators (up/down arrows)
- [ ] Add 8-bit themed styling

**Story 3.2: Create Filter Components** (6-8 hours)
- [ ] `TimeRangeSelector` (24h, 7d, 30d, 90d)
- [ ] `WorkspaceFilter` (IDE, Knowledge, Notes, Study)
- [ ] `MetricTypeSelector` (Files, Chat, Time, Agents)
- [ ] Implement filter state management
- [ ] Add URL query param synchronization

**Story 3.3: Implement Dashboard Grid Layout** (6-8 hours)
- [ ] Create responsive grid system (1-4 columns)
- [ ] Implement mobile-first breakpoints
- [ ] Add loading and error states
- [ ] Optimize for performance (lazy loading)

### Phase 4: Integration & Testing (Week 7) - 14-18 hours

**Story 4.1: Integrate Metrics Collection** (6-8 hours)
- [ ] Hook into IDE workspace events (project open/close)
- [ ] Integrate with chat store for message metrics
- [ ] Integrate with file system for edit metrics
- [ ] Add WebContainer uptime tracking
- [ ] Test data collection accuracy

**Story 4.2: Connect Charts to IndexedDB** (5-6 hours)
- [ ] Create `useMetricsData` hook
- [ ] Implement data fetching with time range filters
- [ ] Add data transformation logic
- [ ] Handle loading and error states
- [ ] Add tests for hook behavior

**Story 4.3: Implement Dashboard Page** (5-6 hours)
- [ ] Create `DashboardPage` component
- [ ] Wire up filter components
- [ ] Add navigation links from IDE
- [ ] Implement responsive layout
- [ ] Add accessibility attributes

### Phase 5: Polish & Optimization (Week 8) - 10-12 hours

**Story 5.1: Performance Optimization** (5-6 hours)
- [ ] Implement data sampling for large datasets
- [ ] Add memoization to chart components
- [ ] Optimize IndexedDB queries
- [ ] Add lazy loading for charts
- [ ] Performance testing with 10k+ data points

**Story 5.2: Accessibility Audit** (3-4 hours)
- [ ] Verify keyboard navigation works
- [ ] Test with screen reader (NVDA/VoiceOver)
- [ ] Verify ARIA labels and roles
- [ ] Test color blindness safety
- [ ] Fix accessibility issues

**Story 5.3: Documentation & Examples** (2-3 hours)
- [ ] Write component documentation (JSDoc)
- [ ] Create usage examples
- [ ] Add storybook stories for charts
- [ ] Document metrics collection patterns
- [ ] Create developer guide

### Total Estimated Time: 78-97 hours (10-12 weeks for 1 developer, 5-6 weeks for 2 developers)

---

## 9. Code Examples

### Example 1: Complete Dashboard Integration

```typescript
// src/routes/dashboard.lazy.tsx
import React, { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';

const DashboardPage = lazy(() =>
  import('@/presentation/components/dashboard/DashboardPage').then(m => ({
    default: m.DashboardPage
  }))
);

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <Suspense fallback={<DashboardLoadingState />}>
      <DashboardPage />
    </Suspense>
  )
});

function DashboardLoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0088FE]" />
        <p className="mt-4 text-[#b0b0b0] font-mono">Loading Dashboard...</p>
      </div>
    </div>
  );
}
```

### Example 2: Time Range Filter Implementation

```typescript
// src/presentation/components/dashboard/filters/TimeRangeSelector.tsx
import React from 'react';

type TimeRange = '24h' | '7d' | '30d' | '90d';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange
}) => {
  const options: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ];

  return (
    <div className="flex gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded font-mono text-sm transition-colors
            ${value === option.value
              ? 'bg-[#0088FE] text-white'
              : 'bg-[#1a1a1a] text-[#b0b0b0] hover:bg-[#2a2a2a]'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
```

### Example 3: Export Chart as Image

```typescript
// src/presentation/components/dashboard/hooks/useChartExport.ts
import { useRef } from 'react';

export function useChartExport() {
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChart = async (filename: string = 'chart.png') => {
    if (!chartRef.current) {
      throw new Error('Chart ref not available');
    }

    // Use html2canvas library
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2 // High resolution
    });

    // Convert to blob and download
    canvas.toBlob(blob => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return { chartRef, exportChart };
}

// Usage:
// const { chartRef, exportChart } = useChartExport();
// <div ref={chartRef}>
//   <LineChart>...</LineChart>
// </div>
// <button onClick={() => exportChart('files-edited-7d.png')}>Export</button>
```

---

## 10. References & Sources

### MCP Research Tool Turns (7 total):

1. **Context7 - Recharts Line Charts** (Turn 1, Page 1)
   - Multi-line chart implementation
   - ResponsiveContainer usage
   - Custom styling (stroke, dasharray, dots)
   - CartesianGrid configuration
   - Brush component for data filtering

2. **Context7 - Recharts Customization** (Turn 1, Page 2)
   - Custom axis tick components
   - Custom tooltip implementation
   - Triangle bar shapes
   - Accessibility layer (default in Recharts 3.0)

3. **Web Search - IndexedDB Time Series** (Turn 2)
   - Best practices for time series metadata tables
   - Efficient storage and retrieval patterns
   - Indexing strategies for date range queries
   - Transaction grouping for performance

4. **Web Search - React Performance** (Turn 3)
   - Advanced React performance patterns (2025)
   - Dashboard optimization techniques
   - Memoization strategies
   - Profiling and bottleneck identification

5. **Web Search - Dashboard UI Trends** (Turn 4)
   - Dark mode evolution (2026)
   - Adaptive color palettes
   - Accessibility improvements
   - Bold typography and high contrast

6. **Web Search - Recharts Performance** (Turn 5)
   - Large dataset handling (>3MB performance issues)
   - Downsampling techniques
   - Threshold props for Line component
   - Windowing strategies

7. **Deepwiki - Dexie Time Series** (Turn 6)
   - Compound indexes for efficient queries
   - Schema versioning best practices
   - Virtual indexes in Dexie
   - Query patterns for time series data

8. **Web Search - Chart Accessibility** (Turn 7)
   - Recharts accessibility support (default in 3.0)
   - Keyboard navigation (arrow keys)
   - Screen reader integration
   - ARIA labels and roles

9. **Context7 - Recharts Accessibility** (Turn 7, Info Mode)
   - Live region tooltips for screen readers
   - role="application" for Forms Mode
   - tabIndex={0} for keyboard navigation
   - VoiceOver QuickNav handling

### External Documentation:

- **Recharts Official Docs**: https://recharts.org/
- **Dexie.js Documentation**: https://dexie.org/
- **IndexedDB API (MDN)**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/Understanding/
- **React Performance 2025**: https://blog.sentry.io/react-js-performance-guide/

---

## 11. Next Steps

1. **Review and Approve**: Stakeholder review of research document
2. **Create Stories**: Break down phases into user stories with acceptance criteria
3. **Sprint Planning**: Allocate stories to sprints based on team capacity
4. **Begin Implementation**: Start with Phase 1 (Foundation) - Dexie database setup
5. **Continuous Testing**: Test metrics collection accuracy and chart performance

---

**Document Status**: Research Complete ✅
**Ready for Implementation**: Yes
**Estimated Timeline**: 10-12 weeks (1 developer) or 5-6 weeks (2 developers)
**Risk Level**: Low (additive schema, no breaking changes)
**Dependencies**: Recharts 3.0+, Dexie.js 4.0+, React 19+

---

*Generated on 2026-01-02 via comprehensive MCP research (7 tool turns)*
*BMAD Framework: Research → Design → Implement → Test → Deploy*
