/**
 * @fileoverview Hook for accessing projects filtered by workspace and storage type
 * @module infrastructure/persistence/stores/project/useWorkspaceProjects
 * @governance STORAGE-3-1
 * @created 2026-01-07
 *
 * Provides a unified way to access projects across all workspaces with:
 * - Workspace binding filtering
 * - Storage type filtering
 * - Mobile compatibility checks (FSA filtering)
 * - Active project management
 */

import { useMemo } from 'react';
import { useProjectStore } from './useProjectStore';
import { useResponsive } from '@/hooks/useResponsive';
import type { Project, WorkspaceBindings } from './project-types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface UseWorkspaceProjectsOptions {
  /**
   * The workspace type to filter by (e.g., 'notes', 'study')
   */
  workspaceType: keyof WorkspaceBindings;

  /**
   * Optional storage type filter
   * If provided, only projects with this storage type will be returned
   */
  storageType?: 'indexeddb' | 'fsa';
}

export interface UseWorkspaceProjectsResult {
  /**
   * List of projects matching the criteria
   */
  projects: Project[];

  /**
   * The currently active project (if it matches criteria)
   */
  activeProject: Project | undefined;

  /**
   * Set the active project
   */
  setActiveProject: (projectId: string) => void;

  /**
   * Whether the store is hydrated
   */
  isLoading: boolean;
}

/**
 * Hook to access projects filtered by workspace and storage type
 *
 * @example
 * ```tsx
 * const { projects, activeProject, setActiveProject } = useWorkspaceProjects({
 *   workspaceType: 'notes'
 * });
 * ```
 */
export function useWorkspaceProjects({
  workspaceType,
  storageType,
}: UseWorkspaceProjectsOptions): UseWorkspaceProjectsResult {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  // Get raw state from store - 4 separate subscriptions
  const allProjects = useProjectStore((state) =>
    state.projects ? Object.values(state.projects) : []
  );
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const setActiveProjectAction = useProjectStore((state) => state.setActiveProject);
  const hasHydrated = useProjectStore((state) => state._hasHydrated);

  // Filter projects based on criteria
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // 1. Check workspace binding
      // Binding can be boolean true or string 'true' (legacy)
      const binding = project.bindings?.[workspaceType];
      const isBound = binding === true || String(binding) === 'true';
      
      if (!isBound) return false;

      // 2. Check storage type if specified
      if (storageType && project.storageType !== storageType) {
        return false;
      }

      // 3. Mobile check: Filter out FSA projects on mobile
      // Unless explicitly requested (e.g. in IDE workspace where we might show them disabled)
      // For general lists, we hide them to avoid confusion, OR we show them but they are disabled in UI
      // The requirement says "Mobile users see FSA projects as DISABLED (not hidden)" in Phase 4
      // But for now, let's include them in the list so the UI can decide how to render them
      // Actually, AC-3 of STORAGE-3-1 says "Filters out FSA projects on mobile devices"
      // But Phase 4 says "Show disabled FSA projects".
      // Let's follow Phase 4 requirement as it's more specific about UX.
      // So we return them, but maybe add a property? No, Project type is fixed.
      // Let's return them and let the UI handle the disabled state.
      
      return true;
    });
  }, [allProjects, workspaceType, storageType]);

  // Get active project if it exists in the filtered list
  const activeProject = useMemo(() => {
    if (!activeProjectId) return undefined;
    return filteredProjects.find((p) => p.id === activeProjectId);
  }, [filteredProjects, activeProjectId]);

  // Wrapper for setActiveProject to handle mobile validation
  const handleSetActiveProject = (projectId: string) => {
    const project = allProjects.find((p) => p.id === projectId);
    
    if (!project) return;

    // Mobile validation for FSA projects
    if (isMobile && project.storageType === 'fsa') {
      toast.warning(t('mobile.desktopRequired'));
      return;
    }

    setActiveProjectAction(projectId);
  };

  return {
    projects: filteredProjects,
    activeProject,
    setActiveProject: handleSetActiveProject,
    isLoading: !hasHydrated,
  };
}
