/**
 * @fileoverview Notes Workspace Route - TASK-2 Simplified
 * @module routes/notes
 * @updated 2026-01-19T16:00:00+07:00
 *
 * TASK-2 FIX:
 * - Desktop with FSA → Redirect to hub to create/select project (no blocking picker)
 * - Mobile/tablet → Redirect to hub to create project
 * - /notes without projectId is now just a redirect route
 * - Real workspace is at /notes/$projectId
 *
 * BUG-FIX-006: Include FSA projects in Notes workspace selection on desktop.
 * FSA projects should have Notes access on desktop regardless of historical binding state.
 *
 * BUG-FIX-010: Allow browser-mode fallback for desktop to prevent infinite redirect loop.
 * Desktop users with ONLY browser-mode projects were stuck in loop: /notes → hub → /notes
 * Solution: Prefer FSA projects, but allow browser-mode as fallback if no FSA projects exist.
 * 
 * BUG-015 FIX: Added <Outlet /> for child routes to render.
 * Parent route must render Outlet for nested routes like /notes/$projectId to display.
 */

import { useEffect, useMemo } from 'react';
import { createLazyFileRoute, useNavigate, Outlet, useLocation } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';
import { ErrorBoundary } from '@/presentation/components/error';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

/**
 * Route definition with ErrorBoundary
 * BUG-015 FIX: Render Outlet for child routes
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
 * BUG-FIX-006: Include FSA projects on desktop (they can have Notes).
 * BUG-FIX-009: FSA ONLY on desktop - block browser-mode project (SUPERSEDED by BUG-FIX-010)
 * BUG-FIX-010: Allow browser-mode FALLBACK on desktop to prevent infinite redirect loop
 * - Desktop: Prefer FSA projects, fallback to browser-mode if none exist
 * - Mobile: Only projects with explicit notes binding
 * - If no projects → redirect to hub to create one
 * 
 * BUG-015 FIX: Render <Outlet /> when we have a child route (/$projectId)
 * This allows the child route component to render instead of just showing spinner
 */
function NotesRedirect() {
  const navigate = useNavigate();
  
  // BUG-021 FIX: Use useLocation for stable child route detection
  // useMatch caused flickering/infinite redirect loops
  const location = useLocation();
  const isChildRoute = location.pathname !== '/notes' && location.pathname !== '/notes/';
  
  // BUG-019 FIX: Move all hooks BEFORE any early return
  // Violating Rules of Hooks caused "Rendered fewer hooks than expected" error

  // Get platform contract once for desktop detection
  const platform = useMemo(() => getPlatformContract(), []);

  // Get projects that can be used in Notes workspace
  // BUG-FIX-010: Allow browser-mode fallback for desktop to prevent infinite loop
  // BUG-012 FIX: Handle undefined storageType - default to allowing project if it has notes binding
  const notesProjects = useLiveQuery(async () => {
    // Optimization: If we have a child route match, we don't need to query projects
    if (isChildRoute) return [];

    const allProjects = await db.projects.toArray();
    const isDesktopWithFSA = platform.deviceType === 'desktop' && platform.canAccessFSA;

    console.log('[NotesRoute] Filtering projects:', {
      total: allProjects.length,
      isDesktopWithFSA,
      projects: allProjects.map(p => ({ id: p.id, name: p.name, storageType: p.storageType, bindings: p.workspaceBindings }))
    });

    if (isDesktopWithFSA) {
      // Desktop: Prefer FSA projects, but allow any project with notes binding as fallback
      const fsaProjects = allProjects.filter((p) => {
        const isFSAProject = p.storageType === 'fsa';
        const isBrowserMode = p.isBrowserMode || p.id === 'proj_browser-default';
        return isFSAProject && !isBrowserMode;
      });

      if (fsaProjects.length > 0) {
        console.log('[NotesRoute] Found FSA projects:', fsaProjects.length);
        return fsaProjects;
      }

      // BUG-012 FIX: If no FSA projects, fallback to ANY project with notes binding
      // This handles the case where storageType is undefined or missing
      const notesBindingProjects = allProjects.filter((p) => {
        const bindings = p.workspaceBindings || (p.bindings as Record<string, boolean>);
        return bindings?.notes === true;
      });

      if (notesBindingProjects.length > 0) {
        console.log('[NotesRoute] Falling back to projects with notes binding:', notesBindingProjects.length);
        return notesBindingProjects;
      }

      // Final fallback: browser-mode projects
      const browserModeProjects = allProjects.filter((p) =>
        p.isBrowserMode || p.id === 'proj_browser-default'
      );
      console.log('[NotesRoute] Falling back to browser-mode projects:', browserModeProjects.length);
      return browserModeProjects;
    }

    // Mobile: Projects with notes binding
    return allProjects.filter((p) => {
      const bindings = p.workspaceBindings || (p.bindings as Record<string, boolean>);
      return bindings?.notes === true;
    });
  }, [platform, isChildRoute]);

  useEffect(() => {
    // Skip redirect logic if we're already on a child route
    if (isChildRoute) return;

    // Wait for query to complete
    if (notesProjects === undefined) return;

    if (notesProjects.length > 0) {
      // Sort by lastOpened descending and redirect to most recent
      const sorted = [...notesProjects].sort(
        (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
      );
      const mostRecent = sorted[0];
      
      console.log('[NotesRoute] Redirecting to most recent project:', mostRecent.id, `(${mostRecent.name})`);
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
  }, [notesProjects, navigate, isChildRoute]);

  // If we're at /notes/$projectId, just render the Outlet for child content
  if (isChildRoute) {
    // console.log('[NotesRoute] Child route matched, rendering Outlet');
    return <Outlet />;
  }

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
