/**
 * @fileoverview Summary Cards Grid
 * @module presentation/components/hub/SummaryCardsGrid
 * @created 2026-01-03T00:50:00+07:00
 *
 * Grid container for dashboard summary cards.
 * Displays project count, storage usage, and activity metrics.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { cn } from '@/spike/lib/utils';
import { ProjectCountCard } from './ProjectCountCard';
import { StorageUsageCard } from './StorageUsageCard';
import { ActivityCard } from './ActivityCard';
import type { DashboardMetrics } from './useDashboardMetrics';

export interface SummaryCardsGridProps {
  /** Dashboard metrics to display */
  metrics: DashboardMetrics | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Optional storage quota limit in MB (default: 50MB) */
  quotaLimitMB?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Grid container for summary cards.
 *
 * Features:
 * - Responsive grid (1 column mobile, 2 tablet, 3 desktop)
 * - Loading skeleton support
 * - Null-safe (handles missing metrics)
 * - 8-bit themed styling
 *
 * @example
 * ```tsx
 * const projects = useLiveQuery(() => db.projects.toArray());
 * const metrics = useDashboardMetrics({ projects });
 *
 * <SummaryCardsGrid
 *   metrics={metrics}
 *   isLoading={!projects}
 *   quotaLimitMB={50}
 * />
 * ```
 */
export const SummaryCardsGrid: React.FC<SummaryCardsGridProps> = ({
  metrics,
  isLoading = false,
  quotaLimitMB = 50,
  className,
}) => {
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    return (
      <section
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          className
        )}
      >
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="p-4 border-2 border-border rounded-md bg-background animate-pulse"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 bg-muted rounded-sm" />
              <div className="h-4 w-24 bg-muted rounded-sm" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded-sm" />
              <div className="h-4 w-3/4 bg-muted rounded-sm" />
              <div className="h-4 w-1/2 bg-muted rounded-sm" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Null metrics state (shouldn't happen, but safe fallback)
  if (!metrics) {
    return (
      <section className={cn('p-4 border-2 border-border rounded-md bg-background', className)}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{t('hub.dashboard.loading', 'Loading metrics...')}</span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {/* Project Count Card */}
      <ProjectCountCard
        totalProjects={metrics.totalProjects}
        activeProjects={metrics.activeProjects}
        deletedProjects={metrics.deletedProjects}
      />

      {/* Storage Usage Card */}
      <StorageUsageCard
        estimatedStorageKB={metrics.estimatedStorageKB}
        estimatedStorageMB={metrics.estimatedStorageMB}
        quotaLimitMB={quotaLimitMB}
      />

      {/* Activity Card */}
      <ActivityCard
        projectsOpenedToday={metrics.projectsOpenedToday}
        projectsOpenedThisWeek={metrics.projectsOpenedThisWeek}
      />
    </section>
  );
};
