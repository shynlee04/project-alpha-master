/**
 * @fileoverview IDE Workspace Route
 * @module routes/ide
 *
 * Simple route to access the IDE workspace with Monaco Editor,
 * terminal, file tree, preview, chat, and all IDE panels.
 *
 * This route provides direct access to the IDE without requiring
 * a specific project ID parameter.
 */

import { createFileRoute } from '@tanstack/react-router'
import { IDELayout } from '../components/layout/IDELayout'
import { ToastProvider, Toast } from '../components/ui/Toast'
import { WorkspaceProvider } from '../lib/workspace'

export const Route = createFileRoute('/ide')({
    ssr: false, // CRITICAL: Disable SSR for WebContainers compatibility
    component: IDEWorkspace,
})

function IDEWorkspace() {
    return (
        <ToastProvider>
            <WorkspaceProvider>
                <IDELayout />
            </WorkspaceProvider>
            <Toast />
        </ToastProvider>
    )
}
