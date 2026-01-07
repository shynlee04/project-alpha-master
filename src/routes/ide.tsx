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

  // If no projects or no binding, show empty state
  if (status === 'no_projects' || status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="ide" status={state} actions={actions} />;
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
