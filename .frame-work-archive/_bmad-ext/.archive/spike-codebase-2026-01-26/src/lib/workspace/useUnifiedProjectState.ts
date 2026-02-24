/**
 * @fileoverview Unified Project State Hook
 * @module lib/workspace/useUnifiedProjectState
 * @governance EPIC-45 Story 45-03
 *
 * Provides unified project state access across all workspaces.
 * Uses IDE store as single source of truth, with event-driven reactivity.
 *
 * Usage:
 *   const { projectId, projectName } = useUnifiedProjectState('notes');
 *
 * The hook subscribes to IDE store changes via event bus,
 * ensuring components re-render when project changes in ANY workspace.
 */

import { useEffect, useState, useCallback } from 'react';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';
import { useWorkspaceProjects } from '@/infrastructure/persistence/stores/project/useWorkspaceProjects';
import type { WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';

interface UnifiedProjectState {
  projectId: string | null;
  projectName: string | null;
  projects: Array<{ id: string; name: string; folderPath: string }>;
  isLoading: boolean;
}

interface WorkspaceChangedEvent {
  workspaceType: string;
  projectId: string | null;
  timestamp: Date;
}

/**
 * Hook to access unified project state from any workspace.
 *
 * @param workspaceType - The workspace type ('notes', 'knowledge', 'study', etc.)
 * @returns Unified project state with reactive updates
 *
 * @example
 * // In NotesPage component
 * const { projectId, projectName, projects } = useUnifiedProjectState('notes');
 */
export function useUnifiedProjectState(workspaceType: keyof WorkspaceBindings): UnifiedProjectState {
  // Primary source of truth: IDE store projectId
  const projectId = useIDEStore((state) => state.projectId);
  const setProjectId = useIDEStore((state) => state.setProjectId);

  // Projects available for this workspace type
  const { projects, isLoading } = useWorkspaceProjects({
    workspaceType,
  });

  // Track project name for convenience
  const projectName = projects.find((p) => p.id === projectId)?.name || null;

  // 45-03: Subscribe to cross-workspace project changes
  // This ensures the component re-renders when project changes in other workspaces
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handleProjectChange = (event: WorkspaceChangedEvent) => {
      // When project changes in any workspace, increment version to trigger re-render
      console.log(
        `[useUnifiedProjectState] Project changed in ${event.workspaceType}: ${event.projectId}`
      );
      setVersion((v) => v + 1);
    };

    // Subscribe to workspace changed events
    const unsubscribe = eventBus.on(
      DomainEventType.WORKSPACE_CHANGED,
      handleProjectChange as (event: unknown) => void
    );

    return unsubscribe;
  }, []);

  // Setter function for project changes
  const handleSetProjectId = useCallback(
    (newProjectId: string) => {
      setProjectId(newProjectId);
    },
    [setProjectId]
  );

  return {
    projectId,
    projectName,
    projects,
    isLoading,
    // Alias for setter convenience
    setProjectId: handleSetProjectId,
  } as UnifiedProjectState & { setProjectId: (id: string) => void };
}
