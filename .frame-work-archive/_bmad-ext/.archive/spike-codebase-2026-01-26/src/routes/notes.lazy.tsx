/**
 * @fileoverview Notes Workspace Route - TASK-2 Simplified
 * @module routes/notes
 * @updated 2026-01-19T10:00:00+07:00
 *
 * TASK-2 FIX:
 * - Desktop with FSA → Redirect to hub to create/select project (no blocking picker)
 * - Mobile/tablet → Redirect to hub to create project
 * - /notes without projectId is now just a redirect route
 * - Real workspace is at /notes/$projectId
 */

import { useEffect } from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';
import { ErrorBoundary } from '@/presentation/components/error';

/**
 * Route definition with ErrorBoundary
 */
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesRedirect />
    </ErrorBoundary>
  ),
});

/**
 * NotesRedirect - Simplified redirect logic for /notes route
 * 
 * TASK-2 FIX: No blocking dialogs. Just redirect.
 * - If user has projects with notes binding → redirect to most recent one
 * - If no projects → redirect to hub to create one
 */
function NotesRedirect() {
  const navigate = useNavigate();

  // Get projects with notes binding enabled
  const notesProjects = useLiveQuery(async () => {
    const allProjects = await db.projects.toArray();
    return allProjects.filter((p) => {
      const bindings = p.workspaceBindings || (p.bindings as Record<string, boolean>);
      return bindings?.notes === true;
    });
  }, []);

  useEffect(() => {
    // Wait for query to complete
    if (notesProjects === undefined) return;

    if (notesProjects.length > 0) {
      // Sort by lastOpened descending and redirect to most recent
      const sorted = [...notesProjects].sort(
        (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
      );
      const mostRecent = sorted[0];
      
      console.log('[NotesRoute] Redirecting to most recent project:', mostRecent.id);
      navigate({
        to: '/notes/$projectId',
        params: { projectId: mostRecent.id },
        replace: true,
      });
    } else {
      // No projects with notes binding → redirect to hub to create one
      console.log('[NotesRoute] No notes projects found, redirecting to hub');
      navigate({
        to: '/hub',
        search: { action: 'create-project', workspace: 'notes' },
        replace: true,
      });
    }
  }, [notesProjects, navigate]);

  // Loading state while redirecting
  return (
    <div className="h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading Notes...</p>
      </div>
    </div>
  );
}
