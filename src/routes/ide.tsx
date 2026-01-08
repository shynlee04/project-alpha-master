/**
 * @fileoverview IDE Workspace Route
 * @module routes/ide
 * @governance WS-2026-01-07
 * @updated 2026-01-07T10:00:00+07:00
 *
 * Standardized workspace access for IDE workspace.
 * Uses shared workspace-access-helper for consistent behavior.
 *
 * Features:
 * - Temp project auto-creation for standalone access
 * - Project filtering by workspace binding
 * - Empty state detection and handling
 * - Navigation to hub with workspace filter
 * - Child route rendering for /ide/$projectId
 *
 * Story: Standardize access to all workspaces and across workspaces
 */

import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import {
  useWorkspaceAccess,
  WorkspaceAccessEmptyState,
} from '@/lib/workspace/workspace-access-helper.tsx';

export const Route = createFileRoute('/ide')({
  ssr: false,
  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

/**
 * IDE workspace with standardized access handling
 *
 * Three scenarios handled:
 * 1. no_projects: Auto-create temp project and navigate to it
 * 2. no_binding: Show empty state with enable option
 * 3. has_projects: Auto-redirect to hub with IDE filter
 *
 * Child routes (/ide/$projectId) render via Outlet
 */
function IDEWorkspace() {
  const { state, actions, status } = useWorkspaceAccess('ide');

  // Check if we're on a child route like /ide/$projectId
  const isOnChildRoute = window.location.pathname !== '/ide';

  // Render child route content if on child route
  if (isOnChildRoute) {
    return <Outlet />;
  }

  // FIX-2026-01-08: Show loading state while Dexie data loads
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If no projects, show empty state with quick-create option
  if (status === 'no_projects') {
    return <WorkspaceAccessEmptyState workspace="ide" status={state} actions={actions} />;
  }

  // If projects exist but none have ide binding, show enable option
  if (status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="ide" status={state} actions={actions} />;
  }

  // has_projects: Show project selector using Outlet (child routes handle actual IDE)
  // For now, show a project selection UI
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <h2 className="text-xl font-bold">Select a Project</h2>
        <p className="text-muted-foreground">
          Choose a project to open in the IDE, or create a quick project.
        </p>
        <div className="flex gap-3">
          <button
            onClick={actions.handleCreateTemp}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            ⚡ Quick IDE
          </button>
          <button
            onClick={actions.handleNavigateToHub}
            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80"
          >
            Browse Projects
          </button>
        </div>
      </div>
    </div>
  );
}
