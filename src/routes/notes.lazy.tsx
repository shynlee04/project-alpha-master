/**
 * @fileoverview Notes Workspace Route
 * @module routes/notes
 * @governance WS-2026-01-07
 * @updated 2026-01-07T10:00:00+07:00
 *
 * Standardized workspace access for Notes workspace.
 * Uses shared workspace-access-helper for consistent behavior.
 *
 * Features:
 * - Temp project auto-creation for standalone access
 * - Project filtering by workspace binding
 * - Empty state detection and handling
 * - Navigation to hub with workspace filter
 *
 * Story: Standardize access to all workspaces and across workspaces
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import {
  useWorkspaceAccess,
  WorkspaceAccessEmptyState,
} from '@/lib/workspace/workspace-access-helper.tsx';
import { ErrorBoundary } from '@/presentation/components/error';

/**
 * Route definition with ErrorBoundary protection
 * @stabilityFix Story N-1 - Add ErrorBoundary to /notes route
 * @added 2026-01-07
 */
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

/**
 * Notes workspace wrapper with standardized access handling
 *
 * Three scenarios handled:
 * 1. no_projects: Auto-create temp project and navigate to it
 * 2. no_binding: Show empty state with enable option
 * 3. has_projects: Auto-redirect to hub with notes filter
 */
function NotesWorkspace() {
  const { state, actions, status } = useWorkspaceAccess('notes');

  // If no projects, show empty state with quick-create option
  if (status === 'no_projects') {
    return <WorkspaceAccessEmptyState workspace="notes" status={state} actions={actions} />;
  }

  // If projects exist but none have notes binding, show enable option
  if (status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="notes" status={state} actions={actions} />;
  }

  // has_projects: Show the workspace with project list/selector
  // The NotesPage component handles showing project selector when no specific project is selected
  return (
    <ProjectProvider project={null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}

/**
 * Notes workspace with project context
 * This component is used by /notes/$projectId route
 */
export function NotesProjectWorkspace() {
  return (
    <ProjectProvider project={null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
