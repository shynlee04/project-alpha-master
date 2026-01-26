/**
 * @fileoverview Activity Summary Card
 * @module presentation/components/hub/ActivityCard
 * @created 2026-01-03T00:45:00+07:00
 *
 * Summary card displaying activity metrics.
 * Shows projects opened today and this week.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityCardProps {
  /** Number of projects opened today */
  projectsOpenedToday: number;
  /** Number of projects opened this week */
  projectsOpenedThisWeek: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Summary card for activity metrics.
 *
 * Features:
 * - Projects opened today with Clock icon
 * - Projects opened this week with Calendar icon
 * - Highlighted "today" metric for immediate attention
 * - 8-bit themed styling
 *
 * @example
 * ```tsx
 * <ActivityCard
 *   projectsOpenedToday={3}
 *   projectsOpenedThisWeek={8}
 * />
 * ```
 */
export const ActivityCard: React.FC<ActivityCardProps> = ({
  projectsOpenedToday,
  projectsOpenedThisWeek,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'p-4 border-2 border-border rounded-md bg-background',
        'hover:border-primary/50 transition-colors',
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.activity', 'ACTIVITY')}
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-2">
        {/* Projects Opened Today */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('hub.dashboard.today', 'Today')}
          </span>
          <span
            className={cn(
              'text-lg font-mono font-bold',
              projectsOpenedToday > 0 ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {projectsOpenedToday}
          </span>
        </div>

        {/* Projects Opened This Week */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-primary" />
            <span className="text-sm text-muted-foreground">
              {t('hub.dashboard.thisWeek', 'This Week')}
            </span>
          </div>
          <span className="text-base font-mono font-semibold text-foreground">
            {projectsOpenedThisWeek}
          </span>
        </div>

        {/* Activity Status Message */}
        <div className="pt-2 text-xs text-muted-foreground text-center">
          {projectsOpenedToday === 0 && projectsOpenedThisWeek === 0 && (
            <span>{t('hub.dashboard.noActivity', 'No recent activity.')}</span>
          )}
          {projectsOpenedToday > 0 && (
            <span>
              {t('hub.dashboard.activeToday', `Great progress! ${projectsOpenedToday} project${projectsOpenedToday > 1 ? 's' : ''} opened today.`)}
            </span>
          )}
          {projectsOpenedToday === 0 && projectsOpenedThisWeek > 0 && (
            <span>
              {t('hub.dashboard.activeWeek', `${projectsOpenedThisWeek} project${projectsOpenedThisWeek > 1 ? 's' : ''} opened this week.`)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
