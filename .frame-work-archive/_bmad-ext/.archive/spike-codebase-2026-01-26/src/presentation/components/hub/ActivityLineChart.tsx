/**
 * @fileoverview Activity Line Chart
 * @module presentation/components/hub/ActivityLineChart
 * @created 2026-01-03T01:45:00+07:00
 *
 * Line chart displaying project activity over time using Recharts.
 * Shows projects opened per day for the last 30 days.
 *
 * NOTE: Metrics history table not yet implemented in database schema.
 * Component displays coming-soon state until metrics collection is added.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
 * - Coming-soon state for unimplemented feature
 *
 * @example
 * ```tsx
 * <ActivityLineChart days={30} />
 * ```
 */
export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({
  // @ts-expect-error - Unused parameter kept for API compatibility when feature is implemented
  days,
  className,
}) => {
  const { t } = useTranslation();

  // NOTE: Metrics history feature is not yet implemented.
  // The database table (metricsHistory) doesn't exist yet.
  // When implemented, add:
  // 1. Table definition in dexie-db-class.ts
  // 2. Migration in dexie-db-migrations.ts
  // 3. Metrics collection logic in useMetricsCollection.ts
  //
  // TODO: Implement metrics history tracking (Future Story)

  return (
    <div className={cn('h-64 border-2 border-border rounded-md bg-background flex items-center justify-center', className)}>
      <div className="text-sm text-muted-foreground text-center px-4">
        {t('hub.dashboard.comingSoon', 'Activity tracking coming soon.')}
      </div>
    </div>
  );
};
