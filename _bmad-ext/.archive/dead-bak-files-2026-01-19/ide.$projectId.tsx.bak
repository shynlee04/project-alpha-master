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

import { lazy, Suspense, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
// IDELayout lazy loaded below
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { ErrorBoundary } from '@/presentation/components/error';

// Lazy load IDELayout
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  // Loader: Fetch project metadata for ProjectProvider
  loader: async ({ params }) => {
    console.log('[IDERoute.loader] Loading project:', params.projectId);
    const project = await getProject(params.projectId);
    console.log('[IDERoute.loader] Project result:', project ? {
      id: project.id,
      name: project.name,
      bindings: (project as any).workspaceBindings || (project as any).bindings,
    } : 'NULL');
    return { project };
  },
  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

function IDEWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // Set projectId in IDE store AND workspace store when component mounts
  // Using getState() to avoid infinite loop (selector returns new fn reference each render)
  // FIX-2026-01-09: Also set workspaceStore.currentProjectId to trigger useWorkspaceFileSystem load
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[IDERoute] Project ID set in IDE store & workspace store:', _projectId);

      // FIX-2026-01-09: Restore FSA handle for projects with 'fsa' storage type
      // The handle is not persisted in Dexie (cannot be serialized), so we need to restore it
      // from the separate fsaHandles table via fsaHandleManager
      (async () => {
        const projectStore = useProjectStore.getState();
        const restoredProject = await getProject(_projectId);
        if (restoredProject?.storageType === 'fsa' && !restoredProject.fsaHandle) {
          console.log('[IDERoute] Restoring FSA handle for project:', _projectId);
          await projectStore.restoreProjectHandle(_projectId);
        }
      })();
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="ide">
      <ToastProvider>
        <Suspense fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-background">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }>
          <IDELayout />
        </Suspense>
        <Toast />
      </ToastProvider>
    </ProjectProvider>
  );
}
