/**
 * @fileoverview Project Context - Cross-Workspace Project State Sharing
 * @module lib/workspace/ProjectContext
 * @governance Story WB-6: Cross-Workspace Navigation
 *
 * React Context provider for sharing project state across workspaces.
 * Wraps all workspace routes (IDE, Notes, Knowledge, Study) to provide:
 * - Project (name, bindings, lastOpened)
 * - Current workspace identifier
 * - Workspace switcher function (navigate without re-loading project)
 * - Last workspace persistence (localStorage)
 *
 * @see Research: TanStack Router context integration, React Context patterns
 */

import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-types';

// ============================================================================
// FSA Handle Type
// ============================================================================

/**
 * FSA Handle type alias for clarity
 * Represents a FileSystemDirectoryHandle for FSA storage operations
 */
export type FsaHandle = FileSystemDirectoryHandle | null;

// ============================================================================
// Constants
// ============================================================================

/** LocalStorage key for last workspace */
const LAST_WORKSPACE_KEY = (projectId: string) => `project_${projectId}_last_workspace`;

/** Default workspace if no preference stored */
const DEFAULT_WORKSPACE: WorkspaceId = 'ide';

// ============================================================================
// Context Interface
// ============================================================================

/**
 * Value provided by ProjectContext
 * 
 * FIX-2026-01-19: Added fsaHandle for FSA-007 (no handle in ProjectContext)
 * The FSA handle is stored in context so StorageAdapterFactory can access it
 * without requiring handle at factory creation time (FSA-006 fix).
 */
export interface ProjectContextValue {
  /** Current project metadata */
  project: Project | null;
  /** Current workspace identifier */
  currentWorkspace: WorkspaceId;
  /** All enabled workspaces for this project */
  enabledWorkspaces: WorkspaceId[];
  /** FSA handle for File System Access storage (FSA-007: Add handle to ProjectContext) */
  fsaHandle: FsaHandle;
  /** Set FSA handle when user grants permission (FSA-006: Get handle from context) */
  setFsaHandle: (handle: FileSystemDirectoryHandle | null) => void;
  /** Switch to different workspace (preserves project state) */
  switchWorkspace: (workspace: WorkspaceId) => void;
  /** Navigate to a different workspace with options */
  navigateToWorkspace: (workspace: WorkspaceId, options?: { replace?: boolean }) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const ProjectContext = React.createContext<ProjectContextValue | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

export interface ProjectProviderProps {
  /** Project metadata (from route loader or parent) */
  project: Project | null;
  /** Current workspace identifier (from route params) */
  workspace: WorkspaceId;
  /** Child components */
  children: React.ReactNode;
}

// ============================================================================
// Helper: Get Enabled Workspaces
// ============================================================================

/**
 * Extract enabled workspace IDs from project bindings
 * @param bindings - Workspace bindings from project metadata
 * @returns Array of enabled workspace IDs
 */
function getEnabledWorkspaces(
  bindings: Project['workspaceBindings'] // ARC-D03: Renamed from bindings
): WorkspaceId[] {
  if (!bindings) return [];

  return (Object.entries(bindings) as Array<[WorkspaceId, boolean]>)
    .filter(([_, enabled]) => enabled)
    .map(([workspace]) => workspace);
}

// ============================================================================
// Helper: Get/Persist Last Workspace
// ============================================================================

/**
 * Load last workspace preference from localStorage
 * @param projectId - Project identifier
 * @returns Last workspace ID or default
 */
function loadLastWorkspace(projectId: string): WorkspaceId {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE;

  try {
    const key = LAST_WORKSPACE_KEY(projectId);
    const stored = localStorage.getItem(key);
    if (stored) {
      return stored as WorkspaceId;
    }
  } catch (error) {
    console.warn('[ProjectContext] Failed to load last workspace from localStorage:', error);
  }

  return DEFAULT_WORKSPACE;
}

/**
 * Persist last workspace preference to localStorage
 * @param projectId - Project identifier
 * @param workspace - Workspace ID to persist
 */
function persistLastWorkspace(projectId: string, workspace: WorkspaceId): void {
  if (typeof window === 'undefined') return;

  try {
    const key = LAST_WORKSPACE_KEY(projectId);
    localStorage.setItem(key, workspace);
  } catch (error) {
    console.warn('[ProjectContext] Failed to persist last workspace to localStorage:', error);
  }
}

// ============================================================================
// Hook: Use Project Context
// ============================================================================

/**
 * Access project context (must be used within ProjectProvider)
 * @returns Project context value
 * @throws Error if used outside ProjectProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { project, currentWorkspace, switchWorkspace } = useProjectContext();
 *
 *   return (
 *     <div>
 *       <h1>{project?.name}</h1>
 *       <p>Current workspace: {currentWorkspace}</p>
 *       <button onClick={() => switchWorkspace('notes')}>
 *         Switch to Notes
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProjectContext(): ProjectContextValue {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}

/**
 * Safe version of useProjectContext that returns null instead of throwing
 * when used outside of ProjectProvider.
 * 
 * Use this in components that may be rendered both inside and outside
 * of ProjectProvider (e.g., WorkspaceSwitcher in header).
 * 
 * @returns Project context value or null if outside ProjectProvider
 * 
 * FIX-2026-01-05: Added for components that can be rendered in non-project routes
 */
export function useProjectContextSafe(): ProjectContextValue | null {
  const context = React.useContext(ProjectContext);
  return context ?? null;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * ProjectProvider - Cross-workspace project state sharing
 *
 * Features:
 * - Provides Project to all workspace routes
 * - Tracks current workspace
 * - Exposes switchWorkspace() function (navigate without re-loading project)
 * - Persists last workspace to localStorage
 * - Auto-selects last workspace on return to project
 *
 * @example
 * ```tsx
 * import { ProjectProvider, useProjectContext } from '@/lib/workspace/ProjectContext';
 *
 * // Wrap workspace routes
 * <ProjectProvider project={project} workspace="ide">
 *   <IDEWorkspace />
 * </ProjectProvider>
 *
 * // Use in component
 * function WorkspaceSwitcher() {
 *   const { currentWorkspace, enabledWorkspaces, switchWorkspace } = useProjectContext();
 *
 *   return (
 *     <select value={currentWorkspace} onChange={(e) => switchWorkspace(e.target.value)}>
 *       {enabledWorkspaces.map((ws) => (
 *         <option key={ws} value={ws}>{ws}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function ProjectProvider({ project, workspace, children }: ProjectProviderProps) {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------
  // FSA Handle State (FSA-006: Store handle for StorageAdapterFactory access)
  // ---------------------------------------------------------------------

  /** FSA handle for File System Access storage operations */
  const [fsaHandle, setFsaHandle] = React.useState<FileSystemDirectoryHandle | null>(null);

  /**
   * Clear FSA handle on project switch or unmount
   * This ensures stale handles are not reused when switching projects
   */
  React.useEffect(() => {
    // Clear handle when project changes
    if (project?.id) {
      console.log(`[ProjectProvider] Project changed to: ${project.id}, clearing FSA handle`);
      setFsaHandle(null);
    }
  }, [project?.id]);

  /**
   * Cleanup: Clear handle when provider unmounts
   * Prevents memory leaks and ensures handle is released properly
   */
  React.useEffect(() => {
    return () => {
      console.log('[ProjectProvider] Provider unmounting, clearing FSA handle');
      setFsaHandle(null);
    };
  }, []);

  // ---------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------

  /** All enabled workspaces for this project */
  // FIX-2026-01-06: Handle both 'bindings' and 'workspaceBindings' property names
  // ProjectMetadata uses 'workspaceBindings', Project uses 'bindings'
  const enabledWorkspaces = React.useMemo(() => {
    // Try both property names for backwards compatibility
    const bindings = (project as any)?.bindings || (project as any)?.workspaceBindings || {};
    console.log('[ProjectProvider] Calculating enabled workspaces from:', { bindings, projectId: project?.id });
    return getEnabledWorkspaces(bindings);
  }, [project]);

  // ---------------------------------------------------------------------
  // Effects: Persist/Restore Last Workspace
  // ---------------------------------------------------------------------

  /**
   * Auto-select last workspace if:
   * - Project has bindings
   * - Current workspace is not enabled
   * - Last workspace preference exists
   *
   * This handles UX flow: User switches from IDE to Notes, then returns to Hub,
   * clicks project → should open in Notes (last workspace), not IDE (default).
   */
  React.useEffect(() => {
    if (!project?.id) return;
    if (enabledWorkspaces.length === 0) return;
    if (enabledWorkspaces.includes(workspace)) return;

    // Current workspace not enabled, switch to last workspace
    const lastWorkspace = loadLastWorkspace(project.id);

    // Only auto-switch if last workspace is enabled
    if (enabledWorkspaces.includes(lastWorkspace)) {
      console.log(
        `[ProjectProvider] Auto-switching to last workspace: ${lastWorkspace} ` +
        `(current: ${workspace} not enabled)`
      );

      navigate({
        to: `/${lastWorkspace}/$projectId`,
        params: { projectId: project.id },
        replace: true, // Replace history entry (no back button confusion)
      }).catch((err) => {
        console.error('[ProjectProvider] Failed to auto-switch workspace:', err);
      });
    }
  }, [project?.id, workspace, enabledWorkspaces, navigate]);

  /**
   * Persist current workspace to localStorage
   * Runs whenever workspace changes
   */
  React.useEffect(() => {
    if (!project?.id) return;

    persistLastWorkspace(project.id, workspace);
  }, [project?.id, workspace]);

  // ---------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------

  /**
   * Switch to different workspace (preserves project state)
   * @param newWorkspace - Target workspace ID
   *
   * This is the primary workspace switching function:
   * - Navigates to new workspace route
   * - Preserves project context (no re-load)
   * - Persists preference to localStorage
   */
  const switchWorkspace = React.useCallback(
    (newWorkspace: WorkspaceId) => {
      if (!project?.id) {
        console.warn('[ProjectProvider] Cannot switch workspace: no project loaded');
        return;
      }

      if (!enabledWorkspaces.includes(newWorkspace)) {
        console.warn(
          `[ProjectProvider] Cannot switch to ${newWorkspace}: workspace not enabled ` +
          `(enabled: ${enabledWorkspaces.join(', ')})`
        );
        return;
      }

      console.log(`[ProjectProvider] Switching workspace: ${workspace} → ${newWorkspace}`);

      navigate({
        to: `/${newWorkspace}/$projectId`,
        params: { projectId: project.id },
      }).catch((err) => {
        console.error('[ProjectProvider] Failed to switch workspace:', err);
      });
    },
    [project?.id, workspace, enabledWorkspaces, navigate]
  );

  /**
   * Navigate to workspace with additional options
   * @param newWorkspace - Target workspace ID
   * @param options - Navigation options (replace: boolean)
   *
   * Extended version of switchWorkspace with support for history.replace()
   */
  const navigateToWorkspace = React.useCallback(
    async (newWorkspace: WorkspaceId, options?: { replace?: boolean }) => {
      if (!project?.id) {
        console.warn('[ProjectProvider] Cannot navigate: no project loaded');
        return;
      }

      if (!enabledWorkspaces.includes(newWorkspace)) {
        console.warn(
          `[ProjectProvider] Cannot navigate to ${newWorkspace}: workspace not enabled`
        );
        return;
      }

      console.log(
        `[ProjectProvider] Navigating to workspace: ${workspace} → ${newWorkspace} ` +
        `(replace: ${options?.replace ?? false})`
      );

      await navigate({
        to: `/${newWorkspace}/$projectId`,
        params: { projectId: project.id },
        replace: options?.replace,
      });
    },
    [project?.id, workspace, enabledWorkspaces, navigate]
  );

  // ---------------------------------------------------------------------
  // Context Value (FSA-006: Include fsaHandle and setFsaHandle)
  // ---------------------------------------------------------------------

  const value: ProjectContextValue = React.useMemo(
    () => ({
      project,
      currentWorkspace: workspace,
      enabledWorkspaces,
      fsaHandle,
      setFsaHandle,
      switchWorkspace,
      navigateToWorkspace,
    }),
    [project, workspace, enabledWorkspaces, fsaHandle, switchWorkspace, navigateToWorkspace]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
