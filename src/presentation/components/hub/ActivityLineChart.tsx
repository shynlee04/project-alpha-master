/**
 * @fileoverview Activity Line Chart
 * @module presentation/components/hub/ActivityLineChart
 * @created 2026-01-03T01:45:00+07:00
 *
 * Line chart displaying project activity over time using Recharts.
 * Shows projects opened per day for the last 30 days.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/state/dexie-db';
import { cn } from '@/lib/utils';

export interface ActivityLineChartProps {
  /** Number of days to display (default: 30) */
  days?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Activity line chart component.
 *
 * Features:
 * - Shows projects opened per day for last N days
 * - Responsive sizing (mobile-friendly)
 * - 8-bit dark theme styling
 * - Loading and empty states
 *
 * @example
 * ```tsx
 * <ActivityLineChart days={30} />
 * ```
 */
export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({
  days = 30,
  className,
}) => {
  const { t } = useTranslation();

  // Fetch metrics history from IndexedDB
  const metricsHistory = useLiveQuery(async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const snapshots = await db.metricsHistory
      .where('timestamp')
      .between(startDate.toISOString(), endDate.toISOString())
      .toArray();

    return snapshots;
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!metricsHistory || metricsHistory.length === 0) {
      return [];
    }

    // Group by date and sum activity values
    const dailyActivity: Record<string, number> = {};

    for (const snapshot of metricsHistory) {
      if (snapshot.metricName === 'activity') {
        const date = new Date(snapshot.timestamp).toISOString().split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + snapshot.value;
      }
    }

    // Convert to array and sort by date
    return Object.entries(dailyActivity)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [metricsHistory]);

  // Loading state
  if (!metricsHistory) {
    return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background flex items-center justify-center', className)}>
      <div className="text-sm text-muted-foreground">
        {t('hub.dashboard.loading', 'Loading metrics...')}
      </div>
    </div>
  );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background flex items-center justify-center', className)}>
        <div className="text-sm text-muted-foreground text-center px-4">
          {t('hub.dashboard.noActivity', 'No recent activity.')}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background p-4', className)}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.activityChart', 'ACTIVITY_OVER_TIME')}
        </h3>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '2px solid hsl(var(--border))',
              borderRadius: '4px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
