/**
 * @fileoverview IDE Workspace Route - PHASE 1 SIMPLIFIED VERSION
 * @module routes/ide
 * @updated 2026-01-08T22:00:00+07:00
 *
 * PHASE 1 UPDATE (P1-03):
 * - Integrated temp project auto-creation flow
 * - Mobile users auto-create temp project
 * - Desktop users can create temp or pick folder
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

import { createFileRoute, redirect, useNavigate, useMatchRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Code2, FolderOpen, Plus } from 'lucide-react';
import { getOrCreateTempProject } from '@/lib/workspace/temp-project';
import { FolderPickerDialog } from '@/presentation/components/workspace';
import { useState } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

// Lazy load IDELayout
import { lazy, Suspense } from 'react';
const IDELayout = lazy(() =>
  import('@/presentation/components/layout/IDELayoutMain').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/ide')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    console.log('[ide.tsx] beforeLoad called for route:', location.href);
    
    // Platform validation (ADR-033 D1: Mobile cannot access IDE)
    const platform = getPlatformContract();
    console.log('[ide.tsx] Platform detection:', {
      deviceType: platform.deviceType,
      canAccessIDE: platform.canAccessIDE,
      canAccessFSA: platform.canAccessFSA,
      canRunTerminal: platform.canRunTerminal,
    });
    
    if (!platform.canAccessIDE) {
      console.warn('[ide.tsx] Mobile/tablet/desktop-without-FSA detected, redirecting to /hub');
      throw redirect({
        to: '/hub',
        search: { reason: 'mobile-not-supported' }
      });
    }
    
    // Allow navigation to continue
    return;
  },
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
 * IDE workspace with simplified access (Phase 1 + P1-03 + P1-04)
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
 *
 * P1-03: Temp Project Auto-Flow
 * Feature: Automatic temp project creation for mobile users
 * Status: INTEGRATED - Mobile users auto-create temp project on click
 *
 * P1-04: Folder Picker Flow
 * Feature: Desktop users can select a project folder via FSA API
 * Status: INTEGRATED - Desktop users see folder picker dialog
 */
function IDEWorkspace() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  
  // Platform detection (PLAT-001: Only show temp project on mobile/fallback)
  const platform = getPlatformContract();
  
  // Check if we're on a child route like /ide/$projectId (ROUTE-002 fix)
  const isOnChildRoute = !!matchRoute({ to: '/ide/$projectId', fuzzy: true });
  
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
              Create a quick temp project or select a project folder to start coding.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {/* PLAT-001: Only show temp project on mobile/fallback (when FSA not available) */}
            {!platform.canAccessFSA && (
              <button
                onClick={() => handleCreateTemp(navigate)}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                ⚡ Quick IDE (Temp Project)
              </button>
            )}
            <button
              onClick={() => setShowFolderPicker(true)}
              className="w-full px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Select Project Folder
            </button>
            <button
              onClick={() => handleBrowseProjects(navigate)}
              className="w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted font-medium flex items-center justify-center gap-2"
            >
              Browse Projects
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Phase 1: Temp project auto-creates on mobile, folder picker on desktop
          </p>
        </div>
      </div>

      {/* Folder Picker Dialog (P1-04) */}
      <FolderPickerDialog
        open={showFolderPicker}
        onOpenChange={setShowFolderPicker}
        onSuccess={(projectId) => {
          console.log('[IDERoute] Folder selected, navigating to:', projectId);
          navigate({ to: '/ide/$projectId', params: { projectId } });
        }}
        onFallbackToTemp={async () => {
          console.log('[IDERoute] Fallback to temp project');
          const tempProject = await getOrCreateTempProject();
          navigate({ to: '/ide/$projectId', params: { projectId: tempProject.id } });
        }}
        onCancel={() => {
          console.log('[IDERoute] Folder picker cancelled');
        }}
      />
    </MainLayout>
  );
}

/**
 * Handle temp project creation (P1-03)
 *
 * Phase 1: Auto-creates temp project and navigates to it
 * - Gets or creates temp project via getOrCreateTempProject()
 * - Navigates to /ide/$projectId route
 * - Temp project persists in IndexedDB via project store
 */
async function handleCreateTemp(navigate: ReturnType<typeof useNavigate>) {
  console.log('[IDERoute] Create temp project clicked');
  try {
    const tempProject = await getOrCreateTempProject();
    console.log('[IDERoute] Temp project created/retrieved:', tempProject.id);
    // Navigate to the temp project route
    navigate({ to: '/ide/$projectId', params: { projectId: tempProject.id } });
  } catch (error) {
    console.error('[IDERoute] Failed to create temp project:', error);
  }
}

/**
 * Handle browse projects
 * Phase 1: Navigates to hub for project selection
 */
function handleBrowseProjects(navigate: ReturnType<typeof useNavigate>) {
  console.log('[IDERoute] Browse projects clicked');
  // Navigate to hub
  navigate({ to: '/hub' });
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
