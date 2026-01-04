/**
 * @fileoverview Project Workspace Route (Legacy)
 * @module routes/workspace/$projectId
 * @governance Story WB-6: Cross-Workspace Navigation
 *
 * Legacy workspace route for a specific project ID.
 * Migrated to use ProjectProvider for cross-workspace consistency.
 * NOTE: New projects should use /ide/$projectId instead.
 *
 * Route Pattern: /workspace/$projectId
 * - ProjectProvider wraps IDELayout with project context
 * - WorkspaceSwitcher in header allows switching to other workspaces
 */

import { lazy, Suspense, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast'
import { ProjectProvider } from '@/lib/workspace/ProjectContext'
import { getProject } from '@/lib/workspace/project-store'
import type { Project } from '@/infrastructure/persistence/stores/project/project-types'

// Lazy load IDELayout to reduce initial bundle size
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayoutMain').then(m => ({ default: m.IDELayout })))

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,
    component: ProjectWorkspace,
})

function ProjectWorkspace() {
    const { projectId } = Route.useParams()
    const [project, setProject] = useState<Project | null>(null)

    useEffect(() => {
        getProject(projectId).then((p) => setProject(p as Project | null))
    }, [projectId])

    return (
        <ProjectProvider project={project} workspace="ide">
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
