/**
 * @fileoverview Recent projects list section with header
 * @module presentation/components/hub/RecentProjectsSection
 */

import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Folder } from 'lucide-react';
import type { ProjectMetadata } from '@/lib/workspace/project-store';

import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { SkeletonLoader } from '@/presentation/components/ui/SkeletonLoader';
import { ProjectCard } from './ProjectCard';

export interface RecentProjectsSectionProps {
  /** Handler for creating a new project */
  onNewProject: () => void;
  /** Handler for opening a project */
  onOpenProject: (projectId: string) => void;
  /** Recent projects to display (sorted, top 5) */
  recentProjects: ProjectMetadata[];
  /** Loading state */
  isLoading: boolean;
}

/**
 * RecentProjectsSection Component
 *
 * Displays the recent projects list with:
 * - Section header with "View All" link
 * - File directory style table (Name, Status, Last Modified, Size)
 * - Loading skeleton state
 * - Empty state with CTA
 * - Displays pre-sorted projects (should be top 5)
 *
 * Part of the Hub's project management interface.
 *
 * @component
 * @example
 * ```tsx
 * <RecentProjectsSection
 *   recentProjects={recentProjects}
 *   isLoading={isLoading}
 *   onNewProject={handleNewProject}
 *   onOpenProject={handleOpenRecentProject}
 * />
 * ```
 */
export const RecentProjectsSection: React.FC<RecentProjectsSectionProps> = ({
  recentProjects,
  isLoading,
  onNewProject,
  onOpenProject,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b-2 border-border/50 pb-2">
        <h2 className="text-xl font-pixel text-foreground flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          {t('hub.recent.title', 'RECENT_DIRECTORIES')}
        </h2>
        <button
          onClick={() => navigate({ to: '/workspace' })}
          className="text-xs font-mono text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
        >
          {t('hub.actions.viewAll', 'VIEW_ALL >>')}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        // Loading skeleton
        <div className="space-y-2">
          <SkeletonLoader variant="list" lines={3} />
        </div>
      ) : (!recentProjects || recentProjects.length === 0) ? (
        // Empty state
        <EmptyState
          variant="no-projects"
          message={t('hub.noProjects', 'No directories found in local storage.')}
          action="create"
          onAction={onNewProject}
        />
      ) : (
        // Projects table
        <div className="border-2 border-border/60 bg-card/50 backdrop-blur-sm shadow-pixel">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-3 border-b-2 border-border/40 bg-muted/40 font-pixel text-xs text-muted-foreground uppercase tracking-widest">
            <div className="col-span-8 md:col-span-5 pl-2">
              {t('hub.recent.name', 'NAME')}
            </div>
            <div className="col-span-3 md:col-span-2 hidden md:block">
              {t('hub.recent.status', 'STATUS')}
            </div>
            <div className="col-span-4 md:col-span-3 text-right">
              {t('hub.recent.lastMod', 'LAST_MOD')}
            </div>
            <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">
              {t('hub.recent.size', 'SIZE')}
            </div>
          </div>

          {/* Project Rows */}
          <div className="divide-y-2 divide-border/20">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={onOpenProject}
              />
            ))}
          </div>

          {/* Footer Row */}
          <div className="bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground text-center border-t-2 border-border/40">
            {t('hub.recent.total', 'Total Directories: {{count}}', { count: recentProjects.length })}
          </div>
        </div>
      )}
    </section>
  );
};
