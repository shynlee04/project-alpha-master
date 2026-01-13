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
import { createFileRoute, redirect } from '@tanstack/react-router';
// IDELayout lazy loaded below
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { ErrorBoundary } from '@/presentation/components/error';
import { isMobileDevice } from '@/infrastructure/filesystem/platform-detection';

// Lazy load IDELayout
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  
  // P0 FIX: Route guards for platform validation (storage type is OK for desktop)
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    
    // Check 1: Mobile users cannot access IDE (audit violation - ABSOLUTE)
    if (isMobileDevice()) {
      console.warn('[IDERoute] Mobile access denied to IDE, redirecting to Notes');
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }
    
    // Check 2: Fetch project to validate it exists
    const project = await getProject(projectId);
    if (!project) {
      console.warn('[IDERoute] Project not found:', projectId);
      throw redirect({ to: '/hub' });
    }
    
    // Check 3: Desktop users can access IDE with ANY storage type
    // (FSA gets full file system features, IndexDB gets browser storage features)
    // No redirect - let desktop users use IDE regardless of storage type
    
    console.log('[IDERoute] Route guard passed:', { projectId });
    return { project };
  },
  
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
  // FIX-2026-01-13: FSA handle restoration is now handled in useFileLoaderSlice, not here
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[IDERoute] Project ID set in IDE store & workspace store:', _projectId);
      // NOTE: FSA handle restoration is now handled by useFileLoaderSlice when it detects
      // an FSA project. This prevents race conditions and ensures the handle is properly
      // connected to the workspace context.
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
