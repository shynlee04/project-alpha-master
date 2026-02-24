/**
 * @fileoverview Project Count Summary Card
 * @module presentation/components/hub/ProjectCountCard
 * @created 2026-01-03T00:35:00+07:00
 *
 * Summary card displaying project count metrics.
 * Shows total projects, active projects, and deleted projects.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Trash2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectCountCardProps {
  /** Total number of projects */
  totalProjects: number;
  /** Number of active (non-deleted) projects */
  activeProjects: number;
  /** Number of deleted projects */
  deletedProjects: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Summary card for project count metrics.
 *
 * Features:
 * - Total projects display with FolderOpen icon
 * - Active projects with Activity icon
 * - Deleted projects with Trash2 icon (only shown if > 0)
 * - Responsive layout (stacks on mobile)
 * - 8-bit themed styling
 *
 * @example
 * ```tsx
 * <ProjectCountCard
 *   totalProjects={15}
 *   activeProjects={12}
 *   deletedProjects={3}
 * />
 * ```
 */
export const ProjectCountCard: React.FC<ProjectCountCardProps> = ({
  totalProjects,
  activeProjects,
  deletedProjects,
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
        <FolderOpen className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.projectCount', 'PROJECTS')}
        </h3>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-2">
        {/* Total Projects */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('hub.dashboard.total', 'Total')}
          </span>
          <span className="text-lg font-mono font-bold text-foreground">
            {totalProjects}
          </span>
        </div>

        {/* Active Projects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-success" />
            <span className="text-sm text-muted-foreground">
              {t('hub.dashboard.active', 'Active')}
            </span>
          </div>
          <span className="text-base font-mono font-semibold text-success">
            {activeProjects}
          </span>
        </div>

        {/* Deleted Projects (only if > 0) */}
        {deletedProjects > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Trash2 className="h-3 w-3 text-destructive" />
              <span className="text-sm text-muted-foreground">
                {t('hub.dashboard.deleted', 'Deleted')}
              </span>
            </div>
            <span className="text-base font-mono font-semibold text-destructive">
              {deletedProjects}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
