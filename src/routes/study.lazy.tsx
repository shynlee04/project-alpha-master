/**
 * @fileoverview Study Workspace Route
 * @module routes/study
 * @governance WS-2026-01-07
 * @updated 2026-01-07T10:00:00+07:00
 *
 * Standardized workspace access for Study workspace.
 * Uses shared workspace-access-helper for consistent behavior.
 *
 * Features:
 * - Temp project auto-creation for standalone access
 * - Project filtering by workspace binding
 * - Empty state detection and handling
 * - Navigation to hub with workspace filter
 *
 * Story: Standardize access to all workspaces and across workspaces
 *
 * @epic Epic-9 Study Artifacts Generation
 * @story 9-1 Flashcard Generator
 * @story 9-2 Quiz Generator
 * @story 9-3 Flashcard Study Interface
 * @story 9-4 Quiz Taking Interface
 * @story 9-5 Study Integration
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { StudyPage } from '@/presentation/components/study/StudyPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import {
  useWorkspaceAccess,
  WorkspaceAccessEmptyState,
} from '@/lib/workspace/workspace-access-helper.tsx';

export const Route = createLazyFileRoute('/study')({
  component: StudyWorkspace,
});

/**
 * Study workspace wrapper with standardized access handling
 *
 * Three scenarios handled:
 * 1. no_projects: Auto-create temp project and navigate to it
 * 2. no_binding: Show empty state with enable option
 * 3. has_projects: Auto-redirect to hub with study filter
 */
function StudyWorkspace() {
  const { state, actions, status } = useWorkspaceAccess('study');

  // If no projects or no binding, show empty state
  if (status === 'no_projects' || status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="study" status={state} actions={actions} />;
  }

  // has_projects: Redirect to hub (handled by hook), return null during redirect
  if (status === 'has_projects') {
    return null;
  }

  // Loading state
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Study workspace with project context
 * This component is used by /study/$projectId route
 */
export function StudyProjectWorkspace() {
  return (
    <ProjectProvider project={null} workspace="study">
      <StudyPage />
    </ProjectProvider>
  );
}
