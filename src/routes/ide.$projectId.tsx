/**
 * @fileoverview IDE Workspace Route with Project ID
 * @module routes/ide.$projectId
 * @governance Story WB-6: Cross-Workspace Navigation
 *
 * IDE workspace route for a specific project ID.
 * Integrates ProjectProvider for cross-workspace state sharing.
 * Loads IDE with file system sync, WebContainer, EventBus, and persistence.
 *
 * Route Pattern: /ide/$projectId
 * - ProjectProvider wraps IDELayout with project context
 * - WorkspaceProvider provides FSA adapter, sync manager, etc.
 * - WorkspaceSwitcher in header allows switching to Notes/Knowledge/Study
 */

import { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
// IDELayout lazy loaded below
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast';
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

// Lazy load IDELayout
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayout').then(m => ({ default: m.IDELayout })));

export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  // Loader: Fetch project metadata for ProjectProvider
  loader: async ({ params }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: IDEWorkspace,
});

function IDEWorkspace() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  return (
    <ProjectProvider project={project as Project | null} workspace="ide">
      <ToastProvider>
        <WorkspaceProvider initialWorkspace="ide" initialProjectId={projectId}>
          <Suspense fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-background">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          }>
            <IDELayout />
          </Suspense>
        </WorkspaceProvider>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
