/**
 * @fileoverview IDE Workspace Route - PHASE 1 SIMPLIFIED VERSION
 * @module routes/ide
 * @updated 2026-01-08T21:00:00+07:00
 *
 * PHASE 1 DETACHMENT:
 * - Bypassed useWorkspaceAccess to prevent infinite loops
 * - Uses 'default-ide' as stable projectId (similar to notes pattern)
 * - Simplified to 2 patterns: /ide and /ide/$projectId
 * - Re-attach in: Phase 2 (after temp/folder picker flows complete)
 * - Gate: GATE-R3 must pass (/ide renders without errors)
 *
 * Original functionality preserved with PHASE_1_DETACHMENT marker.
 */

import { createFileRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Code2, FolderOpen, Plus } from 'lucide-react';

// Lazy load IDELayout
import { lazy, Suspense } from 'react';
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/ide')({
  ssr: false,
  component: () => (
    <ErrorBoundary>
      <IDEWorkspace />
    </ErrorBoundary>
  ),
});

/**
 * Loading spinner for lazy components
 */
function IDESkeleton() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading IDE...</p>
      </div>
    </div>
  );
}

/**
 * IDE workspace with simplified access (Phase 1)
 *
 * Three scenarios handled:
 * 1. On child route (/ide/$projectId): Render Outlet with IDELayout
 * 2. On /ide route: Show project selector (temp or existing)
 * 3. Loading state: Show skeleton
 *
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT
 * Feature: Workspace Access via useWorkspaceAccess
 * Reason: Causes infinite loops / returns 'no_projects'
 * Re-attach in: Phase 2 (after P1-03, P1-04 complete)
 * Gate: GATE-R3 must pass
 * Documentation: _bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md
 * ═══════════════════════════════════════════════════════════════
 */
function IDEWorkspace() {
  // Use stable projectId for Phase 1 (reserved for future use)
  // const projectId = 'default-ide';

  // Check if we're on a child route like /ide/$projectId
  const isOnChildRoute = window.location.pathname !== '/ide';

  // Render child route content if on child route
  if (isOnChildRoute) {
    return (
      <MainLayout>
        <Suspense fallback={<IDESkeleton />}>
          <IDELayout />
        </Suspense>
      </MainLayout>
    );
  }

  // Show project selector for /ide route
  return (
    <MainLayout>
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
          <div className="flex flex-col items-center gap-3">
            <Code2 className="h-16 w-16 text-primary" />
            <h2 className="text-2xl font-bold">Via-gent IDE</h2>
            <p className="text-muted-foreground">
              Create a quick temp project or select an existing project to start coding.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => handleCreateTemp()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              ⚡ Quick IDE (Temp Project)
            </button>
            <button
              onClick={() => handleBrowseProjects()}
              className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Browse Projects
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Phase 1: Temp project auto-creates on mobile, folder picker on desktop
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

/**
 * Handle temp project creation
 * TODO: Wire up to P1-03 temp project flow
 */
function handleCreateTemp() {
  console.log('[IDERoute] Create temp project clicked');
  // Phase 1: Navigate to hub with create intent
  // Phase 1-P1-03: Auto-create temp project
  window.location.href = '/hub?intent=create-temp';
}

/**
 * Handle browse projects
 * TODO: Wire up to hub navigation
 */
function handleBrowseProjects() {
  console.log('[IDERoute] Browse projects clicked');
  // Navigate to hub
  window.location.href = '/hub';
}

/**
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ PHASE 1 DETACHMENT: Original useWorkspaceAccess implementation
 * Reason: Causes infinite loops, returns 'no_projects' unexpectedly
 * Re-attach in: Phase 2
 * ═══════════════════════════════════════════════════════════════

function IDEWorkspace_Original() {
  const { state, actions, status } = useWorkspaceAccess('ide');

  // Check if we're on a child route like /ide/$projectId
  const isOnChildRoute = window.location.pathname !== '/ide';

  // Render child route content if on child route
  if (isOnChildRoute) {
    return <Outlet />;
  }

  // ... rest of original implementation
}
*/
