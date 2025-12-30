/**
 * @fileoverview Project Workspace Route
 * @module routes/workspace/$projectId
 *
 * Workspace route for a specific project ID.
 * Loads IDE with file system sync, WebContainer, EventBus, and persistence.
 */

import { createFileRoute } from '@tanstack/react-router'
import { IDELayout } from '../../components/layout/IDELayout'
import { ToastProvider, Toast } from '../../components/ui/Toast'
import { WorkspaceProvider } from '../../lib/workspace'

export const Route = createFileRoute('/workspace/$projectId')({
    ssr: false,
    component: ProjectWorkspace,
})

function ProjectWorkspace() {
    const { projectId } = Route.useParams()

    return (
        <ToastProvider>
            <WorkspaceProvider projectId={projectId}>
                <IDELayout />
            </WorkspaceProvider>
            <Toast />
        </ToastProvider>
    )
}
