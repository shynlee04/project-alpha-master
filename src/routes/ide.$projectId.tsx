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
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { ErrorBoundary } from '@/presentation/components/error';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

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
  
  // P0 FIX: Route guards for platform validation ONLY (ADR-033 D12, ADR-034 D12)
  // beforeLoad should NOT fetch project data - loader is the correct place
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    console.log('[IDERoute] beforeLoad called for project:', projectId);

    // Check: Mobile users cannot access IDE (audit violation - ABSOLUTE)
    // Using PlatformContract for consistent detection (ADR-033 D1)
    const platform = getPlatformContract();
    if (!platform.canAccessIDE) {
      console.warn('[IDERoute] Mobile/tablet access denied to IDE, redirecting to Notes');
      throw redirect({
        to: '/notes/$projectId',
        params: { projectId },
        search: { reason: 'mobile-not-supported' }
      });
    }

    // P0 FIX: Project loading should ONLY happen in loader (ADR-034 D12)
    // beforeLoad is for platform guards ONLY - do NOT fetch project data here
    // This eliminates the double-fetch anti-pattern

    console.log('[IDERoute] Route guard passed (platform validated):', { projectId });
    // Note: Project data is loaded via loader, not beforeLoad
  },
  
  // Loader: Fetch project data ONCE (ADR-034 D12 - Use loader only for data fetch)
  loader: async ({ params }) => {
    console.log('[IDERoute.loader] Loading project:', params.projectId);
    const project = await getProjectWithRetry(params.projectId);
    
    if (!project) {
      console.error('[IDERoute.loader] CRITICAL: Project not found after retry:', params.projectId);
      console.error('[IDERoute.loader] Available projects:', Object.keys(useProjectStore.getState().projects));
      throw redirect({ to: '/hub' });
    }
    
    console.log('[IDERoute.loader] Project found:', { id: project.id, name: project.name });
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
  // FSA-008 FIX: FSA handle restoration is handled by ProjectProvider (fsaHandle in ProjectContext)
  // useFileLoaderSlice manages its own local directoryHandle state for IndexedDB projects
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[IDERoute] Project ID set in IDE store & workspace store:', _projectId);
      // FSA handle is provided by ProjectContext - no action needed here
      // ProjectProvider sets fsaHandle when user grants permission (FSA-006, FSA-007)
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
