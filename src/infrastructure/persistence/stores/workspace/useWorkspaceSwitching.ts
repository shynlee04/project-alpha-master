/**
 * @fileoverview Workspace Switching Hook
 * @module infrastructure/persistence/stores/workspace/useWorkspaceSwitching
 *
 * Handles workspace switching logic and enabled workspaces.
 *
 * Part of P0-2 refactoring: Extracted from unified-workspace-provider.tsx
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';

/**
 * Extended workspace type including 'hub' landing page
 */
export type ExtendedWorkspaceType = WorkspaceType | 'hub';

/**
 * Local storage key for persisting last workspace per project
 */
const LAST_WORKSPACE_KEY = (projectId: string) => `project_${projectId}_last_workspace`;

/**
 * Persist the last used workspace for a project
 */
function persistLastWorkspace(projectId: string, workspace: WorkspaceType): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_WORKSPACE_KEY(projectId), workspace);
  } catch (error) {
    console.warn('[WorkspaceProvider] Failed to persist last workspace:', error);
  }
}

/**
 * Get the last used workspace for a project
 */
function getLastWorkspace(projectId: string): WorkspaceType | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LAST_WORKSPACE_KEY(projectId)) as WorkspaceType | null;
  } catch {
    return null;
  }
}

/**
 * Workspace switching hook
 *
 * @param projectId - Current project ID
 * @param currentWorkspace - Current workspace type
 */
export function useWorkspaceSwitching(
  projectId: string | null,
  currentWorkspace: WorkspaceType | null
) {
  const navigate = useNavigate();

  // Enabled workspaces (all workspaces for now)
  const enabledWorkspaces = useMemo(() => {
    return ['hub', 'ide', 'notes', 'knowledge', 'study'] as ExtendedWorkspaceType[];
  }, []);

  // Switch to a different workspace
  const switchWorkspace = useCallback(
    (newWorkspace: ExtendedWorkspaceType) => {
      if (!projectId) {
        console.warn('[WorkspaceProvider] Cannot switch workspace: no project loaded');
        return;
      }

      if (!enabledWorkspaces.includes(newWorkspace)) {
        console.warn(
          `[WorkspaceProvider] Cannot switch to ${newWorkspace}: workspace not enabled`
        );
        return;
      }

      console.log(`[WorkspaceProvider] Switching workspace: ${currentWorkspace} → ${newWorkspace}`);

      // Only persist valid WorkspaceType (not 'hub')
      if (newWorkspace !== 'hub') {
        persistLastWorkspace(projectId, newWorkspace as WorkspaceType);
      }

      navigate({
        to: `/${
          newWorkspace === 'hub' ? '' : `${newWorkspace}/`
        }$projectId`,
        params: { projectId },
      }).catch((err) => {
        console.error('[WorkspaceProvider] Failed to switch workspace:', err);
      });
    },
    [projectId, currentWorkspace, enabledWorkspaces, navigate]
  );

  // Navigate to workspace (alias for switchWorkspace)
  const navigateToWorkspace = useCallback(
    (newWorkspace: ExtendedWorkspaceType) => {
      switchWorkspace(newWorkspace);
    },
    [switchWorkspace]
  );

  return {
    enabledWorkspaces: enabledWorkspaces as WorkspaceType[],
    switchWorkspace,
    navigateToWorkspace,
    getLastWorkspace: () => projectId ? getLastWorkspace(projectId) : null,
  };
}
