/**
 * @fileoverview IDE Workspace Route
 * @module routes/ide
 *
 * Route to access IDE workspace with Monaco Editor, terminal, file tree, etc.
 *
 * IMPORTANT: This route requires a project ID. If no project is specified,
 * it redirects to Hub with a project picker query param.
 *
 * User flow:
 * 1. User clicks IDE from sidebar without selecting project
 * 2. Redirects to /hub?workspace=ide
 * 3. Hub shows project picker dialog
 * 4. User selects project → navigates to /ide/$projectId
 */

import { useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';

export const Route = createFileRoute('/ide')({
    ssr: false,
    loader: async () => {
        // Get all projects
        const projects = await db.projects.toArray();
        
        if (projects.length === 0) {
            // No projects exist - redirect to Hub with prompt to create
            throw redirect({
                to: '/hub',
                search: { 
                    action: 'create-project',
                    message: 'No projects mounted. Mount a project folder to use IDE.'
                }
            });
        }
        
        // Return project count for client-side handling
        return { projectCount: projects.length };
    },
    component: IDERedirect,
})

function IDERedirect() {
    const data = Route.useLoaderData();
    const projects = useLiveQuery(() => db.projects.toArray());
    
    useEffect(() => {
        if (projects && projects.length > 0) {
            // Multiple projects exist - redirect to Hub with picker
            throw redirect({
                to: '/hub',
                search: { 
                    workspace: 'ide',
                    projectCount: projects.length.toString()
                }
            });
        }
    }, [projects]);
    
    // Loading state while checking projects
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Checking projects...</p>
            </div>
        </div>
    );
}
