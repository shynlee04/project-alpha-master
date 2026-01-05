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
 */

import { lazy, Suspense, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast'
import { ProjectProvider } from '@/lib/workspace/ProjectContext'
import { getProject } from '@/lib/workspace/project-store'
import type { Project } from '@/infrastructure/persistence/stores/project/project-types'
import { useIDEStore } from '@/infrastructure/persistence/stores/ide'

// Lazy load IDELayout to reduce initial bundle size
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayoutMain').then(m => ({ default: m.IDELayout })))

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,
    // FIX-2026-01-06: Use loader to fetch project BEFORE component renders
    // This prevents the flash where project=null on first render
    loader: async ({ params }) => {
        const project = await getProject(params.projectId);
        return { project };
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

