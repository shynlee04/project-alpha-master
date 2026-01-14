/**
  * @fileoverview Project Workspace Route (Legacy)
  * @module routes/workspace/$projectId
  * @governance Story WB-6: Cross-Workspace Navigation
  * @updated 2026-01-06 - Fixed to use loader pattern and setProjectId
  *
  * Legacy workspace route for a specific project ID.
  * Uses ProjectProvider and syncs projectId to IDE store.
  * NOTE: New projects should use /ide/$projectId instead.
  *
  * Route Pattern: /workspace/$projectId
  * - Uses loader to fetch project BEFORE render (no flash of null state)
  * - Calls setProjectId to sync IDE store
  * - WorkspaceSwitcher in header allows switching to other workspaces
  *
  * ROUTE-005 FIX: Added platform guard for IDE access.
  */

import { lazy, Suspense, useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast'
import { ProjectProvider } from '@/lib/workspace/ProjectContext'
import { getProject } from '@/infrastructure/persistence/stores/project'
import { useProjectStore } from '@/infrastructure/persistence/stores/project'
import type { Project } from '@/infrastructure/persistence/stores/project/project-types'
import { useIDEStore } from '@/infrastructure/persistence/stores/ide'
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract'

// Lazy load IDELayout to reduce initial bundle size
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayoutMain').then(m => ({ default: m.IDELayout })))

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
        console.log(`[WorkspaceRoute] Project found on attempt ${attempt}/${maxRetries}`);
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
      console.log(`[WorkspaceRoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[WorkspaceRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,

    // ROUTE-005 FIX: Add platform guard before project fetch
    beforeLoad: async ({ params, location }) => {
        // Platform validation - Mobile users cannot access IDE (redirect to Notes)
        const platform = getPlatformContract();
        if (!platform.canAccessIDE) {
            console.warn('[WorkspaceRoute] Mobile/tablet access denied to IDE, redirecting to Notes');
            throw redirect({
                to: '/notes/$projectId',
                params: { projectId: params.projectId },
                search: { reason: 'mobile-not-supported' }
            });
        }

        // Project fetch with retry
        const project = await getProjectWithRetry(params.projectId);

        if (!project) {
            console.error('[WorkspaceRoute] CRITICAL: Project not found after retry:', params.projectId);
            console.error('[WorkspaceRoute] Available projects:', Object.keys(useProjectStore.getState().projects));
            throw redirect({ to: '/hub' });
        }

        console.log('[WorkspaceRoute] Project found:', { id: project.id, name: project.name });
        return { project };
    },

    // Loader returns empty - project already fetched in beforeLoad
    loader: () => {
        return {};
    },

    component: ProjectWorkspace,
})

function ProjectWorkspace() {
    const { projectId: _projectId } = Route.useParams();
    const { project } = Route.useLoaderData();

    // FIX-2026-01-06: Set projectId in IDE store when component mounts
    // This ensures the store has the correct projectId for persistence
    // Using getState() to avoid infinite loop (selector returns new fn reference each render)
    useEffect(() => {
        if (_projectId) {
            useIDEStore.getState().setProjectId(_projectId);
            console.log('[WorkspaceRoute] Project ID set in store:', _projectId);
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
    )
}

