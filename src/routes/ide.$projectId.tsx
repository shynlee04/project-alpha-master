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

import { createFileRoute } from '@tanstack/react-router';
import { IDELayout } from '@/presentation/components/layout/IDELayout';
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast';
import { WorkspaceProvider } from '@/lib/workspace';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';

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
    <ProjectProvider project={project} workspace="ide">
      <ToastProvider>
        <WorkspaceProvider projectId={projectId}>
          <IDELayout />
        </WorkspaceProvider>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
