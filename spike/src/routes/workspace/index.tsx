/**
 * @fileoverview Workspace Index Route
 * @module routes/workspace/index
 *
 * Workspace landing page - shows when user accesses /workspace/ without a project ID.
 */

import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/')({
    ssr: false,
    component: WorkspaceIndex,
})

function WorkspaceIndex() {
    const navigate = useNavigate()

    return (
        <div className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold">No Project Selected</h1>
                <p className="text-muted-foreground">
                    Please open a project from your local drive to access the workspace.
                </p>
                <button
                    onClick={() => navigate({ to: '/ide' })}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                    Go to IDE
                </button>
            </div>
        </div>
    )
}
