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

export const Route = createLazyFileRoute('/knowledge')({
  component: KnowledgeWorkspace,
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

  // If no projects or no binding, show empty state
  if (status === 'no_projects' || status === 'no_binding') {
    return <WorkspaceAccessEmptyState workspace="knowledge" status={state} actions={actions} />;
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
