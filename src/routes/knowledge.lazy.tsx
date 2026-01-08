/**
 * @fileoverview Knowledge Workspace Route
 * @module routes/knowledge
 * @governance WS-2026-01-07
 * @updated 2026-01-07T10:00:00+07:00
 *
 * Standardized workspace access for Knowledge workspace.
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
import { KnowledgePage } from '@/presentation/components/knowledge/KnowledgePage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import {
  useWorkspaceAccess,
  WorkspaceAccessEmptyState,
} from '@/lib/workspace/workspace-access-helper.tsx';
import { ErrorBoundary } from '@/presentation/components/error';

/**
 * Route definition with ErrorBoundary protection
 * @stabilityFix Story 30-01 - Add ErrorBoundary to /knowledge route
 * @added 2026-01-08
 */
export const Route = createLazyFileRoute('/knowledge')({
  component: () => (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Knowledge Workspace Failed</h2>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please retry or contact support.
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('[Knowledge Workspace] Error:', error, errorInfo);
        // TODO: Send to monitoring service (Sentry)
      }}
    >
      <KnowledgeWorkspace />
    </ErrorBoundary>
  ),
});

/**
 * Knowledge workspace wrapper with standardized access handling
 *
 * Three scenarios handled:
 * 1. no_projects: Auto-create temp project and navigate to it
 * 2. no_binding: Show empty state with enable option
 * 3. has_projects: Auto-redirect to hub with knowledge filter
 */
function KnowledgeWorkspace() {
  const { state, actions, status } = useWorkspaceAccess('knowledge');

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
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // If projects exist but none have knowledge binding, show enable option
  if (status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
  }

  // has_projects: Show the workspace with project list/selector
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}

/**
 * Knowledge workspace with project context
 * This component is used by /knowledge/$projectId route
 */
export function KnowledgeProjectWorkspace() {
  return (
    <ProjectProvider project={null} workspace="knowledge">
      <KnowledgePage />
    </ProjectProvider>
  );
}
