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
  *
  * INF-03 FIX: Added waitForHydration() to fix race condition where
  * loader runs before Zustand store hydration completes.
  */

import { lazy, Suspense, useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
 import { createWorkspaceStore } from '@/infrastructure/persistence/stores/workspace-store-factory';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { requireIDEAccess } from '@/infrastructure/filesystem/route-guards';

// Lazy load IDELayout
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/ide/$projectId')({
  ssr: false,
  
  // P0 FIX: Route guards for platform validation ONLY (ADR-033 D12, ADR-034 D12)
  beforeLoad: async ({ params }) => {
    const { projectId } = params;
    console.log('[IDERoute] beforeLoad called for project:', projectId);

    // Check: Mobile users cannot access IDE (audit violation - ABSOLUTE)
    await requireIDEAccess(projectId);

    console.log('[IDERoute] Route guard passed (platform validated):', { projectId });
  },
  
  // INF-03 FIX: Use loader with waitForHydration per ADR-034 D12
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[IDERoute.loader] Loading project:', projectId);

    // ✅ INF-03 FIX: Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[IDERoute.loader] Hydration complete, querying Dexie...');

    // ✅ INF-03 FIX: Query Dexie directly (not Zustand/getProject facade)
    const record = await db.projects.get(projectId);
    
    if (!record) {
      console.error('[IDERoute.loader] Project not found in Dexie:', projectId);
      throw redirect({ to: '/hub' });
    }

    // Convert record to Project type
    const project = record as unknown as Project;
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

  // Store project ID in stores on mount
  useEffect(() => {
    if (_projectId) {
      // Use workspace-scoped store instead of global singleton
      const workspaceStore = createWorkspaceStore('ide', _projectId);
      workspaceStore.getState().setCurrentProject(_projectId);
      console.log('[IDERoute] Project ID set in workspace-scoped store:', _projectId);
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
