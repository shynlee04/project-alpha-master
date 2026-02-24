/**
 * @fileoverview Clean Project Route - Phase R-0
 * @module routes/$projectId/route
 *
 * This route uses the new PlatformProvider and has NO hydration dependencies.
 * Platform Operators (FileTree, Chat) are rendered directly, not from store.
 *
 * PHASE R-0: Foundation route for Strategic Rebuild
 * NO workspaceId - use projectId only
 * NO @/lib imports
 *
 * @created 2026-02-02
 */

import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PlatformProvider } from '@/platform/core/platform-context';
import { PlatformLayout } from '@/platform/core/platform-layout';

/**
 * Route definition for /$projectId
 *
 * This is a NEW route structure that will eventually replace
 * the legacy $projectId.tsx file (in R-4 Migration phase)
 */
export const Route = createFileRoute('/$projectId')({
  component: ProjectRoute,
});

/**
 * ProjectRoute Component
 *
 * Entry point for project routes. Wraps content in:
 * - PlatformProvider: Project and platform state context
 * - PlatformLayout: 3-column operator layout
 * - Outlet: Child route content (modules)
 */
function ProjectRoute(): React.JSX.Element {
  const { projectId } = Route.useParams();

  return (
    <PlatformProvider projectId={projectId}>
      <PlatformLayout>
        <Outlet />
      </PlatformLayout>
    </PlatformProvider>
  );
}
