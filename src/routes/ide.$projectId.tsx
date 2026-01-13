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
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { ErrorBoundary } from '@/presentation/components/error';
import { isMobileDevice } from '@/infrastructure/filesystem/platform-detection';

// ============================================================================
// Retry Utility for Project Lookup (FIX-2026-01-13: Handle timing issues)
// ============================================================================

/**
  * Retry getting a project with exponential backoff
  * Handles timing issues between project creation and route guard execution
  */
async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Try getting from Zustand store first (fastest)
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) {
      if (attempt > 1) {
        console.log(`[IDERoute] Project found on attempt ${attempt}/${maxRetries}`);
      }
      return fromStore as Project;
    }

    // Fallback to facade (handles Dexie lookup)
    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) {
        return fromFacade as Project;
      }
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`[IDERoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[IDERoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

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
    console.log('[IDERoute] beforeLoad called for project:', projectId);

    // Check 1: Mobile users cannot access IDE (audit violation - ABSOLUTE)
    if (isMobileDevice()) {
      console.warn('[IDERoute] Mobile access denied to IDE, redirecting to Notes');
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }

    // Check 2: Fetch project with retry logic (FIX-2026-01-13: Handle timing issues)
    console.log('[IDERoute] Looking up project:', projectId);
    const project = await getProjectWithRetry(projectId);

    if (!project) {
      console.error('[IDERoute] CRITICAL: Project not found after retry:', projectId);
      console.error('[IDERoute] Available projects:', Object.keys(useProjectStore.getState().projects));
      throw redirect({ to: '/hub' });
    }

    console.log('[IDERoute] Project found:', { id: project.id, name: project.name });

    // Check 3: Desktop users can access IDE with ANY storage type
    // (FSA gets full file system features, IndexDB gets browser storage features)
    // No redirect - let desktop users use IDE regardless of storage type

    console.log('[IDERoute] Route guard passed:', { projectId });
    return { project };
  },
  
  // Loader: Fetch project metadata for ProjectProvider (FIX-2026-01-13: Use retry logic)
  loader: async ({ params }) => {
    console.log('[IDERoute.loader] Loading project:', params.projectId);
    const project = await getProjectWithRetry(params.projectId);
    console.log('[IDERoute.loader] Project result:', project ? {
      id: project.id,
      name: project.name,
      bindings: (project as any).workspaceBindings || (project as any).bindings,
    } : 'NULL');
    return { project: project || undefined };
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
