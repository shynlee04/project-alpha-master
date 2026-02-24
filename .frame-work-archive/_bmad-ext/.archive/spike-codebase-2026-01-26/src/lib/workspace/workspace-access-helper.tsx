/**
 * @fileoverview Workspace Access Helper
 * @module lib/workspace/workspace-access-helper
 * @governance WS-2026-01-07
 * @created 2026-01-07T09:00:00+07:00
 *
 * Standardized workspace access logic for all workspaces.
 * Provides consistent behavior across IDE, Knowledge, Study, and Notes.
 *
 * Story: Standardize access to all workspaces and across workspaces
 *
 * Features:
 * - Temp project auto-creation for all workspaces
 * - Consistent project filtering by workspace binding
 * - Empty state detection and handling
 * - Navigation to hub with workspace filter
 *
 * Usage:
 * ```tsx
 * import { useWorkspaceAccess, WorkspaceAccessEmptyState } from '@/lib/workspace/workspace-access-helper';
 *
 * function KnowledgeWorkspace() {
 *   const { status, projects, handleCreateTemp, handleEnable, handleNavigate } =
 *     useWorkspaceAccess('knowledge');
 *
 *   return <WorkspaceEmptyState {...status} />;
 * }
 * ```
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/workspace/workspace-types';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import type { ProjectRecord } from '@/infrastructure/persistence/dexie-db-types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Temp project ID format
 */
const TEMP_PROJECT_ID_PREFIX = 'temp-';

/**
 * Temp project names for each workspace
 */
const TEMP_PROJECT_NAMES: Record<WorkspaceType, string> = {
  ide: 'Quick IDE',
  knowledge: 'Quick Knowledge',
  study: 'Quick Study',
  notes: 'Quick Notes',
};

/**
 * Default bindings for temp projects (all enabled)
 */
const TEMP_PROJECT_BINDINGS = {
  ide: true,
  knowledge: true,
  study: true,
  notes: true,
};

// ============================================================================
// Types
// ============================================================================

/**
 * Workspace access status
 */
export type WorkspaceAccessStatus =
  | 'loading'        // Initial load in progress
  | 'has_projects'    // Projects with this workspace binding exist
  | 'no_projects'     // No projects at all
  | 'no_binding';     // Projects exist but none have this workspace enabled

/**
 * Workspace access state
 */
export interface WorkspaceAccessState {
  /** Current access status */
  status: WorkspaceAccessStatus;
  /** All projects (filtered by workspace binding) */
  projects: ProjectRecord[];
  /** All projects in system */
  allProjects: ProjectRecord[];
  /** Is temp project creation in progress */
  isCreatingTemp: boolean;
  /** Is workspace enable in progress */
  isEnabling: boolean;
  /** Most recent project (for enable binding) */
  mostRecentProject: ProjectRecord | null;
}

/**
 * Workspace access actions
 */
export interface WorkspaceAccessActions {
  /** Create temp project and navigate to it */
  handleCreateTemp: () => Promise<void>;
  /** Enable workspace for most recent project and navigate */
  handleEnable: () => Promise<void>;
  /** Navigate to hub with create-project action */
  handleNavigateToCreate: () => void;
  /** Navigate to hub with workspace filter */
  handleNavigateToHub: () => void;
}

/**
 * Props for WorkspaceAccessEmptyState component
 */
export interface WorkspaceEmptyStateProps {
  /** Workspace type */
  workspace: WorkspaceType;
  /** Access state */
  status: WorkspaceAccessState;
  /** Actions */
  actions: WorkspaceAccessActions;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get temp project ID for workspace
 */
export function getTempProjectId(workspace: WorkspaceType): string {
  return `${TEMP_PROJECT_ID_PREFIX}${workspace}`;
}

/**
 * Check if a project is a temp project
 */
export function isTempProject(project: Project): boolean {
  return project.id.startsWith(TEMP_PROJECT_ID_PREFIX);
}

/**
 * Create temp project for workspace
 *
 * ⚠️ DEPRECATED: This function will be removed in Phase 4.
 * Projects should be explicitly created by users via the hub.
 *
 * @deprecated Use explicit project creation via hub instead.
 */
export async function createTempProject(
  workspace: WorkspaceType
): Promise<{ id: string; name: string } | null> {
  try {
    const tempId = getTempProjectId(workspace);

    // Check if temp project already exists
    const existing = await db.projects.get(tempId);
    if (existing) {
      // Update lastOpened
      await db.projects.update(tempId, { lastOpened: new Date() });
      return { id: existing.id, name: existing.name };
    }

    // Create new temp project
    const now = new Date();
    const tempProject = {
      id: tempId,
      name: TEMP_PROJECT_NAMES[workspace],
      path: `/temp-${workspace}`, // Virtual path
      workspaceId: workspace,
      storageType: 'indexeddb' as const,
      lastOpened: now,
      createdAt: now,
      bindings: TEMP_PROJECT_BINDINGS,
      isTemp: true,
      autoCreated: true,
      folderPath: undefined,
      fileSnapshotEnabled: false,
    };

    await db.projects.put(tempProject);
    console.log(`[WorkspaceAccessHelper] Temp project created:`, tempProject.id);
    return { id: tempProject.id, name: tempProject.name };
  } catch (error) {
    console.error(`[WorkspaceAccessHelper] Failed to create temp project:`, error);
    return null;
  }
}

// ============================================================================
// React Hook: useWorkspaceAccess
// ============================================================================

/**
 * Workspace access hook
 *
 * Provides standardized access logic for all workspaces.
 * Handles temp project creation, binding checks, and navigation.
 *
 * @param workspace - Target workspace type
 * @returns Access state and actions (including grouped state and actions)
 *
 * @example
 * ```tsx
 * function MyWorkspace() {
 *   const { state, actions, status, handleCreateTemp, handleEnable } =
 *     useWorkspaceAccess('knowledge');
 *
 *   if (status === 'no_projects') {
 *     return <WorkspaceAccessEmptyState workspace="knowledge" state={state} actions={actions} />;
 *   }
 *
 *   return <WorkspacePage />;
 * }
 * ```
 */
export type WorkspaceAccessResult = WorkspaceAccessState &
  WorkspaceAccessActions & {
    /** Grouped state object */
    state: WorkspaceAccessState;
    /** Grouped actions object */
    actions: WorkspaceAccessActions;
  };

export function useWorkspaceAccess(
  workspace: WorkspaceType
): WorkspaceAccessResult {
  const navigate = useNavigate();
  
  // FIX-2026-01-14: Replaced broken useLiveQuery with controlled useEffect pattern
  // useLiveQuery caused infinite re-renders due to Dexie subscription conflicts
  // This pattern loads data once on mount and when workspace changes
  
  const [allProjects, setAllProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTemp, setIsCreatingTemp] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const hasLoadedRef = useRef(false);
  
  // Load projects from Dexie on mount and when workspace changes
  useEffect(() => {
    let isMounted = true;
    
    async function loadProjects() {
      try {
        const projects = await db.projects.toArray();
        if (isMounted) {
          setAllProjects(projects);
          setIsLoading(false);
          hasLoadedRef.current = true;
        }
      } catch (error) {
        console.error('[useWorkspaceAccess] Failed to load projects:', error);
        if (isMounted) {
          setAllProjects([]);
          setIsLoading(false);
        }
      }
    }
    
    loadProjects();
    
    return () => {
      isMounted = false;
    };
  }, [workspace]);
  
  // Filter projects by workspace binding (ARC-D03: workspaceBindings)
  const workspaceProjects = allProjects.filter((project) => {
    const bindings = project.workspaceBindings || project.bindings || {};
    return bindings[workspace] === true;
  });
  
  // Find most recent project for this workspace
  const mostRecentProject = workspaceProjects.length > 0
    ? workspaceProjects.reduce((latest, project) => {
        const latestTime = latest.lastOpened ? new Date(latest.lastOpened).getTime() : 0;
        const projectTime = project.lastOpened ? new Date(project.lastOpened).getTime() : 0;
        return projectTime > latestTime ? project : latest;
      }, workspaceProjects[0])
    : null;
  
  // Determine status
  let status: WorkspaceAccessStatus = 'loading';
  if (!isLoading) {
    if (allProjects.length === 0) {
      status = 'no_projects';
    } else if (workspaceProjects.length === 0) {
      status = 'no_binding';
    } else {
      status = 'has_projects';
    }
  }

  // Actions
  const handleCreateTemp = useCallback(async () => {
    setIsCreatingTemp(true);
    try {
      const result = await createTempProject(workspace);
      if (result) {
        navigate({ to: `/${workspace}/$projectId`, params: { projectId: result.id } });
      } else {
        navigate({ to: '/hub', search: { action: 'create-project' } });
      }
    } catch (error) {
      console.error('[useWorkspaceAccess] Failed to create temp project:', error);
      navigate({ to: '/hub', search: { action: 'create-project' } });
    } finally {
      setIsCreatingTemp(false);
    }
  }, [navigate, workspace]);

  const handleEnable = useCallback(async () => {
    if (!mostRecentProject) {
      navigate({ to: '/hub' });
      return;
    }
    
    setIsEnabling(true);
    try {
      // Enable workspace binding for most recent project
      // ARC-D03: Use workspaceBindings (new field), fallback to bindings (legacy) for migration
      const workspaceBindings = { ...(mostRecentProject.workspaceBindings || mostRecentProject.bindings || {}), [workspace]: true };
      await db.projects.update(mostRecentProject.id, { workspaceBindings });
      navigate({ to: `/${workspace}/$projectId`, params: { projectId: mostRecentProject.id } });
    } catch (error) {
      console.error('[useWorkspaceAccess] Failed to enable workspace:', error);
      navigate({ to: '/hub' });
    } finally {
      setIsEnabling(false);
    }
  }, [navigate, workspace, mostRecentProject]);

  const handleNavigateToCreate = useCallback(() => {
    navigate({ to: '/hub', search: { action: 'create-project' } });
  }, [navigate]);

  const handleNavigateToHub = useCallback(() => {
    navigate({ to: '/hub', search: { workspace } });
  }, [workspace, navigate]);

  const state: WorkspaceAccessState = {
    status,
    projects: workspaceProjects,
    allProjects,
    isCreatingTemp,
    isEnabling,
    mostRecentProject,
  };

  const actions: WorkspaceAccessActions = {
    handleCreateTemp,
    handleEnable,
    handleNavigateToCreate,
    handleNavigateToHub,
  };

  return {
    ...state,
    ...actions,
    state,
    actions,
  };
}

// ============================================================================
// Empty State Component
// ============================================================================

/**
 * Workspace access empty state component
 *
 * Provides consistent empty state UI across all workspaces.
 * Handles three scenarios:
 * 1. No projects at all
 * 2. Projects exist but workspace not enabled
 * 3. Loading state
 */
export function WorkspaceAccessEmptyState({
  workspace,
  status,
  actions,
  className,
}: WorkspaceEmptyStateProps) {

  // Get workspace metadata
  const workspaceLabel = workspace.charAt(0).toUpperCase() + workspace.slice(1);
  const workspaceIcons: Record<WorkspaceType, string> = {
    ide: '💻',
    knowledge: '📚',
    study: '📖',
    notes: '📝',
  };

  // Loading state
  if (status.isCreatingTemp) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-background text-foreground ${className || ''}`}>
        <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">
            Setting up {TEMP_PROJECT_NAMES[workspace]}...
          </h1>
          <p className="text-muted-foreground">
            Creating your quick {workspaceLabel.toLowerCase()} space...
          </p>
        </div>
      </div>
    );
  }

  // No projects at all
  if (status.status === 'no_projects') {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-background text-foreground ${className || ''}`}>
        <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">{workspaceIcons[workspace]}</span>
          </div>
          <h1 className="text-2xl font-bold">
            {workspaceLabel} Workspace
          </h1>
          <p className="text-muted-foreground">
            Create a project to start using {workspaceLabel}. Your {workspaceLabel.toLowerCase()} data is saved automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={actions.handleCreateTemp}
              disabled={status.isCreatingTemp}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {status.isCreatingTemp ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Quick {workspaceLabel}
                </>
              )}
            </button>
            <button
              onClick={actions.handleNavigateToCreate}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
            >
              <span>+</span>
              Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Projects exist but workspace not enabled
  if (status.status === 'no_binding') {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-background text-foreground ${className || ''}`}>
        <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">{workspaceIcons[workspace]}</span>
          </div>
          <h1 className="text-2xl font-bold">
            {workspaceLabel} Not Enabled
          </h1>
          <p className="text-muted-foreground">
            None of your projects have {workspaceLabel.toLowerCase()} enabled. Enable it for an existing project or create a new one.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={actions.handleEnable}
              disabled={status.isEnabling}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {status.isEnabling ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <span>{workspaceIcons[workspace]}</span>
                  Enable {workspaceLabel}
                </>
              )}
            </button>
            <button
              onClick={actions.handleNavigateToHub}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
            >
              <span>📂</span>
              Browse Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Should not happen (has_projects should redirect)
  return null;
}
