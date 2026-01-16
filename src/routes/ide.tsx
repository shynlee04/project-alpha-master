/**
 * @fileoverview IDE Workspace Route - Clean Architecture (Phase 1)
 * @module routes/ide
 * @updated 2026-01-22T12:00:00+07:00
 *
 * PHASE 1 CLEANUP:
 * - Removed temp project auto-creation flow
 * - All users without projects are redirected to hub
 * - Platform guard ensures desktop-only access
 * - Clean routing: /ide (no projects) → hub, /ide/$projectId → IDE workspace
 *
 * Architecture:
 * - Desktop with FSA: Can access IDE, must create project first
 * - Mobile/Desktop without FSA: Redirected to hub or Notes
 */

import { createFileRoute, redirect, useNavigate, useMatchRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { Code2, FolderOpen, Plus } from 'lucide-react';
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
 * IDE workspace - Clean Architecture
 *
 * Two scenarios handled:
 * 1. On child route (/ide/$projectId): Render IDELayout with project
 * 2. On /ide route (no project): Show empty state with redirect to hub
 *
 * No temp projects - users must create projects explicitly via hub.
 */
function IDEWorkspace() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Platform detection
  const platform = getPlatformContract();

  // Check if we're on a child route like /ide/$projectId
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

  // Show empty state for /ide route (no project selected)
  return (
    <MainLayout>
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
          <div className="flex flex-col items-center gap-3">
            <Code2 className="h-16 w-16 text-primary" />
            <h2 className="text-2xl font-bold">ViaGent IDE</h2>
            <p className="text-muted-foreground">
              Create a project or select an existing one to start coding.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            {/* Desktop with FSA: Show folder picker option */}
            {platform.canAccessFSA && (
              <button
                onClick={() => setShowFolderPicker(true)}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-none border-2 border-primary hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Select Project Folder
              </button>
            )}
            <button
              onClick={() => handleBrowseProjects(navigate)}
              className="w-full px-6 py-3 bg-muted text-foreground rounded-none border-2 border-border hover:bg-muted/80 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create / Browse Projects
            </button>
          </div>
        </div>
      </div>

      {/* Folder Picker Dialog */}
      {platform.canAccessFSA && (
        <FolderPickerDialog
          open={showFolderPicker}
          onOpenChange={setShowFolderPicker}
          onSuccess={(projectId) => {
            console.log('[IDERoute] Folder selected, navigating to:', projectId);
            navigate({ to: '/ide/$projectId', params: { projectId } });
          }}
          onCancel={() => {
            console.log('[IDERoute] Folder picker cancelled');
          }}
        />
      )}
    </MainLayout>
  );
}

/**
 * Handle browse projects
 * Phase 1: Navigates to hub for project selection
 */
function handleBrowseProjects(navigate: ReturnType<typeof useNavigate>) {
  console.log('[IDERoute] Browse projects clicked');
  // Navigate to hub with create-project action
  navigate({ to: '/hub', search: { action: 'create-project' } });
}
