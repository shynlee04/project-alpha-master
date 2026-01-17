/**
 * Custom hook for workspace binding dialog state management.
 */
import { useState, useEffect } from 'react';
import type { Project, WorkspaceBindings } from '@/spike/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceId } from '@/spike/infrastructure/persistence/dexie-db-core-types';

const WORKSPACES: { id: WorkspaceId }[] = [
  { id: 'ide' },
  { id: 'notes' },
  { id: 'knowledge' },
  { id: 'study' },
];

export interface UseWorkspaceBindingStateResult {
  bindings: WorkspaceBindings;
  setBindings: React.Dispatch<React.SetStateAction<WorkspaceBindings>>;
  initialWorkspace: WorkspaceId;
  setInitialWorkspace: React.Dispatch<React.SetStateAction<WorkspaceId>>;
  handleWorkspaceToggle: (workspaceId: WorkspaceId, checked: boolean) => void;
  handleConfirm: () => WorkspaceBindings;
  hasEnabledWorkspaces: boolean;
  enabledWorkspaces: WorkspaceId[];
}

export function useWorkspaceBindingState(
  project: Project
): UseWorkspaceBindingStateResult {
  const [bindings, setBindings] = useState<WorkspaceBindings>({
    ide: true,
    notes: true,
    knowledge: true,
    study: true,
  });

  const [initialWorkspace, setInitialWorkspace] = useState<WorkspaceId>('ide');

  useEffect(() => {
    if (project?.workspaceBindings) {
      setBindings(project.workspaceBindings);
      const firstEnabled = WORKSPACES.find(
        (ws) => project.workspaceBindings?.[ws.id] === true
      );
      setInitialWorkspace((firstEnabled?.id as WorkspaceId) || 'ide');
    }
  }, [project]);

  const handleWorkspaceToggle = (workspaceId: WorkspaceId, checked: boolean) => {
    setBindings((prev: WorkspaceBindings) => ({
      ...prev,
      [workspaceId]: checked,
    }));

    if (!checked && initialWorkspace === workspaceId) {
      const firstEnabled = WORKSPACES.find((ws) => {
        return ws.id !== workspaceId && bindings[ws.id] === true;
      });
      if (firstEnabled) {
        setInitialWorkspace(firstEnabled.id);
      }
    }

    if (checked && !Object.values(bindings).some((b) => b === true)) {
      setInitialWorkspace(workspaceId);
    }
  };

  const handleConfirm = () => {
    return bindings;
  };

  const hasEnabledWorkspaces = Object.values(bindings).some((b) => b === true);
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
