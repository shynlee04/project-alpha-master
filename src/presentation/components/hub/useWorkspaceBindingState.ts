/**
 * Custom hook for workspace binding dialog state management.
 *
 * Handles:
 * - Workspace bindings state (checkboxes)
 * - Initial workspace selection (radio buttons)
 * - State initialization from project
 * - Event handlers for workspace toggle
 * - Computed values (enabled workspaces, validation)
 *
 * @file useWorkspaceBindingState.ts
 * @created 2026-01-02T22:00:00+07:00
 */

import { useState, useEffect } from 'react';
import type { ProjectMetadata, WorkspaceBindings } from '@/lib/workspace/project-store';

type WorkspaceId = 'ide' | 'notes' | 'knowledge' | 'study';

const WORKSPACES: { id: WorkspaceId }[] = [
  { id: 'ide' },
  { id: 'notes' },
  { id: 'knowledge' },
  { id: 'study' },
];

export interface UseWorkspaceBindingStateResult {
  /** Current workspace bindings */
  bindings: WorkspaceBindings;
  /** Update workspace bindings */
  setBindings: React.Dispatch<React.SetStateAction<WorkspaceBindings>>;
  /** Initial workspace selection */
  initialWorkspace: WorkspaceId;
  /** Update initial workspace */
  setInitialWorkspace: React.Dispatch<React.SetStateAction<WorkspaceId>>;
  /** Handle workspace checkbox toggle */
  handleWorkspaceToggle: (workspaceId: WorkspaceId, checked: boolean) => void;
  /** Handle confirm action */
  handleConfirm: () => WorkspaceBindings;
  /** Whether at least one workspace is enabled */
  hasEnabledWorkspaces: boolean;
  /** List of enabled workspace IDs */
  enabledWorkspaces: WorkspaceId[];
}

/**
 * Custom hook for managing workspace binding dialog state.
 *
 * @param project - Project metadata to initialize bindings from
 * @returns State and handlers for workspace binding dialog
 */
export function useWorkspaceBindingState(
  project: ProjectMetadata
): UseWorkspaceBindingStateResult {
  // State: workspace bindings (checkboxes)
  const [bindings, setBindings] = useState<WorkspaceBindings>({
    ide: true,
    notes: false,
    knowledge: false,
    study: false,
  });

  // State: initial workspace selection (radio buttons)
  const [initialWorkspace, setInitialWorkspace] = useState<WorkspaceId>('ide');

  // Initialize state from project's existing bindings
  useEffect(() => {
    if (project?.workspaceBindings) {
      setBindings(project.workspaceBindings);

      // Set initial workspace to first enabled workspace, default to 'ide'
      const firstEnabled = WORKSPACES.find(
        (ws) => project.workspaceBindings?.[ws.id] === true
      );
      setInitialWorkspace((firstEnabled?.id as WorkspaceId) || 'ide');
    }
  }, [project]);

  /**
   * Handle workspace checkbox toggle with auto-selection logic.
   */
  const handleWorkspaceToggle = (workspaceId: WorkspaceId, checked: boolean) => {
    setBindings((prev) => ({
      ...prev,
      [workspaceId]: checked,
    }));

    // If disabling current initial workspace, switch to first enabled
    if (!checked && initialWorkspace === workspaceId) {
      const firstEnabled = WORKSPACES.find((ws) => {
        return ws.id !== workspaceId && bindings[ws.id] === true;
      });
      if (firstEnabled) {
        setInitialWorkspace(firstEnabled.id);
      }
    }

    // If enabling first workspace, auto-select as initial
    if (checked && !Object.values(bindings).some((b) => b === true)) {
      setInitialWorkspace(workspaceId);
    }
  };

  /**
   * Handle confirm action (return bindings for callback).
   */
  const handleConfirm = () => {
    return bindings;
  };

  // Computed: check if at least one workspace is enabled
  const hasEnabledWorkspaces = Object.values(bindings).some((b) => b === true);

  // Computed: filter enabled workspaces for radio group
  const enabledWorkspaces = WORKSPACES
    .filter((ws) => bindings[ws.id] === true)
    .map((ws) => ws.id);

  return {
    bindings,
    setBindings,
    initialWorkspace,
    setInitialWorkspace,
    handleWorkspaceToggle,
    handleConfirm,
    hasEnabledWorkspaces,
    enabledWorkspaces,
  };
}
