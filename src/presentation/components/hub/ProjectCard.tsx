/**
 * @fileoverview Project Card Component
 * @module presentation/components/hub/ProjectCard
 * @governance Story WB-5: Hub Project Card Enhancement
 *
 * Displays project information with workspace binding badges.
 * Shows which workspaces a project is bound to and allows quick navigation.
 * Supports badge click (direct navigation) and hover quick-open buttons.
 *
 * @see Research: HubHomePage project row extraction, 8-bit design system
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import {
  Folder,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

import type { Project, WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceId } from '@/lib/workspace';
import { WorkspaceBadge } from './WorkspaceBadge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ProjectCardProps {
  /** Project metadata */
  project: Project;
  /** Click handler for opening project (shows dialog) */
  onOpen: (projectId: string) => void;
  /** Additional className */
  className?: string;
}

// ============================================================================
// Helper: Get Enabled Workspaces
// ============================================================================

function getEnabledWorkspaces(
  bindings: WorkspaceBindings | undefined
): WorkspaceId[] {
  if (!bindings) return [];

  return (Object.entries(bindings) as Array<[WorkspaceId, boolean]>)
    .filter(([_, enabled]) => enabled)
    .map(([workspace]) => workspace);
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectCard - Display project with workspace badges
 *
 * Features:
 * - Project name, path, last opened display
 * - Workspace badges for enabled workspaces (IDE, Notes, Knowledge, Study)
 * - Badge click → Direct navigation to workspace (skips dialog)
 * - Quick-open buttons on hover (desktop only)
 * - 8-bit styling with hover effects
 *
 * @example
 * ```tsx
 * <ProjectCard
 *   project={project}
 *   onOpen={(projectId) => handleOpenRecentProject(projectId)}
 * />
 * ```
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpen,
  className,
}) => {
  const navigate = useNavigate();

  // Hover state for quick-open buttons
  const [isHovered, setIsHovered] = useState(false);

  // Get enabled workspaces from bindings
  const boundWorkspaces = useMemo(
    () => getEnabledWorkspaces(project.bindings),
    [project.bindings]
  );

  // Listen to workspace project update events
  useEffect(() => {
    // eventBus is a singleton, always available

    console.log('[ProjectCard] Setting up event bus listeners for project:', project.id);

    /**
     * Handle workspace project updated event
     * Triggers re-render when project settings change
     */
    const handleProjectUpdated = (event: any) => {
      const { projectId } = event.payload;
      console.log('[ProjectCard] WORKSPACE_PROJECT_UPDATED event received:', { projectId, currentProjectId: project.id });

      // If this is the current project, force re-render
      if (projectId === project.id) {
        console.log('[ProjectCard] Project updated, forcing re-render');
        // Force re-render by toggling hover state briefly
        setIsHovered(false);
        setTimeout(() => setIsHovered(false), 0);
      }
    };

    // Register listeners
    const unsubscribeProjectUpdated = eventBus.on(DomainEventType.FILE_SAVED, handleProjectUpdated as any);

    console.log('[ProjectCard] Event bus listeners registered');

    // Cleanup: remove listeners on unmount
    return () => {
      console.log('[ProjectCard] Cleaning up event bus listeners');
      unsubscribeProjectUpdated();
    };
  }, [eventBus, project.id]);

  // Handle workspace badge click (direct navigation, skip dialog)
  const handleWorkspaceClick = (workspace: WorkspaceId) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click (dialog)
      navigate({
        to: `/${workspace}/$projectId`,
        params: { projectId: project.id },
      });
    };
  };

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-4 p-3 items-center hover:bg-primary/5 cursor-pointer group transition-all duration-200 relative',
        className
      )}
      onClick={() => onOpen(project.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      {/* Name */}
      <div className="col-span-8 md:col-span-5 flex flex-col gap-2 overflow-hidden pl-2">
        <div className="flex items-center gap-3">
          <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <span className="font-mono text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </span>
        </div>

        {/* Workspace Badges (Always Visible) */}
        {boundWorkspaces.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {boundWorkspaces.map((workspace) => (
              <WorkspaceBadge
                key={workspace}
                workspace={workspace}
                variant="badge"
                onClick={handleWorkspaceClick(workspace)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status (Desktop only) */}
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-pixel bg-green-500/10 text-green-500 border border-green-500/30 rounded-none">
          <CheckCircle2 className="w-3 h-3" />
          ACTIVE
        </span>
      </div>

      {/* Date */}
      <div className="col-span-4 md:col-span-3 text-right">
        <span className="text-xs font-mono text-muted-foreground flex items-center justify-end gap-1 group-hover:text-foreground transition-colors">
          <Clock className="h-3 w-3 md:hidden" />
          {project.lastOpened
            ? formatDistanceToNow(new Date(project.lastOpened), { addSuffix: true })
            : ''
          }
        </span>
      </div>

      {/* Size (Desktop only placeholder) */}
      <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">
        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          --
        </span>
      </div>

      {/* Quick-Open Buttons (Hover only, desktop) */}
      {isHovered && boundWorkspaces.length > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-background border-2 border-border p-1 shadow-pixel z-10">
          {boundWorkspaces.map((workspace) => (
            <WorkspaceBadge
              key={`quick-${workspace}`}
              workspace={workspace}
              variant="quick-open"
              onClick={handleWorkspaceClick(workspace)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
