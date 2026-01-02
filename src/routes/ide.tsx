/**
 * @fileoverview IDE Workspace Route
 * @module routes/ide
 *
 * Simple route to access IDE workspace with Monaco Editor,
 * terminal, file tree, preview, chat, and all IDE panels.
 *
 * This route provides direct access to IDE without requiring
 * a specific project ID parameter.
 */

import { useState, useEffect, lazy, Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ToastProvider, Toast } from '@/presentation/components/ui/Toast'
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace'

// Lazy load IDELayout to reduce initial bundle size
const IDELayout = lazy(() => import('@/presentation/components/layout/IDELayout').then(m => ({ default: m.IDELayout })))

export const Route = createFileRoute('/ide')({
    ssr: false,
    component: IDEWorkspace,
})

function IDEWorkspace() {
    const [projectId, setProjectId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If route params had projectId, we would use that.
        // But for /ide, we try to load the last active project.
        const loadLastProject = async () => {
            // Dynamic import to avoid SSR issues if any (though route is ssr: false)
            const { listProjects } = await import('@/lib/workspace/project-store');
            const projects = await listProjects();
            if (projects.length > 0) {
                // projects are sorted by lastOpened descending
                setProjectId(projects[0].id);
            }
            setIsLoading(false);
        };
        loadLastProject();
    }, []);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-muted-foreground">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (!projectId) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold">No Open Project</h2>
                    <p className="text-muted-foreground">
                        No recent projects were found. Please return to the dashboard to open or create a project.
                    </p>
                    <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <ToastProvider>
            <WorkspaceProvider initialWorkspace="ide" initialProjectId={projectId}>
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
