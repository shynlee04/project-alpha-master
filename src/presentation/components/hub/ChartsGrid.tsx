/**
 * @fileoverview Charts Grid Container
 * @module presentation/components/hub/ChartsGrid
 * @created 2026-01-03T01:55:00+07:00
 *
 * Grid container for dashboard chart components.
 * Displays activity line chart and workspace pie chart.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { WorkspacePieChart } from './WorkspacePieChart';
import type { DashboardMetrics } from './useDashboardMetrics';

export interface ChartsGridProps {
  /** Dashboard metrics to display */
  metrics: DashboardMetrics | null;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Grid container for dashboard charts.
 *
 * Features:
 * - Responsive grid (1 column mobile, 2 columns desktop)
 * - Activity line chart (projects opened over time)
 * - Workspace pie chart (distribution across workspaces)
 * - Loading and empty states handled by child components
 * - 8-bit themed styling
 *
 * @example
 * ```tsx
 * const metrics = useDashboardMetrics({ projects });
 *
 * <ChartsGrid metrics={metrics} />
 * ```
 */
export const ChartsGrid: React.FC<ChartsGridProps> = ({
  metrics,
  className,
}) => {
  const { t } = useTranslation();

  // Null metrics state
  if (!metrics) {
    return (
      <section
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-4',
          className
        )}
      >
        {[1, 2].map((index) => (
          <div
            key={index}
            className="h-64 border-2 border-border rounded-md bg-background flex items-center justify-center"
          >
            <span className="text-sm text-muted-foreground">
              {t('hub.dashboard.loading', 'Loading metrics...')}
            </span>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-4',
        className
      )}
    >
      {/* Workspace Pie Chart */}
      <WorkspacePieChart
        ideCount={metrics.ideWorkspaceCount}
        notesCount={metrics.notesWorkspaceCount}
      />
    </section>
  );
};
