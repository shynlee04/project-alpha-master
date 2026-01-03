/**
 * @fileoverview Project Workspace Route
 * @module routes/workspace/$projectId
 *
 * Workspace route for a specific project ID.
 * Loads IDE with file system sync, WebContainer, EventBus, and persistence.
 */

import { lazy, Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
// IDELayout lazy loaded below
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast'
import { WorkspaceProvider } from '../../lib/workspace'

// Lazy load IDELayout to reduce initial bundle size
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayoutMain').then(m => ({ default: m.IDELayout })))

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,
    component: ProjectWorkspace,
})

function ProjectWorkspace() {
    const { projectId } = Route.useParams()

    return (
        <ToastProvider>
            <WorkspaceProvider projectId={projectId}>
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
    )
}
