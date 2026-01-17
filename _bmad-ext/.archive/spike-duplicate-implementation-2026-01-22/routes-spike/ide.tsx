/**
 * @fileoverview IDE Workspace Route - Clean Architecture (Phase 1) - SPIKE VERSION
 * @module routes/spike/ide
 * @updated 2026-01-22T16:30:00+07:00
 *
 * ============================================================================
 * @spike-copy-source: src/routes/ide.tsx (main app)
 * ============================================================================
 *
 * PHASE 3 MIRROR COPY:
 * - Exact copy of main app IDE route implementation
 * - Platform-aware routing: Desktop with FSA shows picker, others redirect to hub
 * - Full component logic for state management, file sync, project registry
 *
 * Architecture:
 * - Desktop with FSA: Can access IDE, must create project first
 * - Mobile/Desktop without FSA: Redirected to spike hub or Notes
 * - Platform guard: Mobile IDE access blocked with redirect to Notes
 *
 * ROUTING UPDATES (SPIKE):
 * - /hub → /spike
 * - /ide/$projectId → /spike/ide/$projectId
 *
 * ============================================================================
 * @spike-copy-notes
 * This code copied from main app to provide isolated testing environment
 * Contains platform guards, state management, file system operations
 *
 * Current Issues (to be documented):
 *   1. Direct Dexie access in presentation layer (P0)
 *      - Components bypass Zustand stores with useLiveQuery()
 *      - Should use: Store hooks or service layer
 *      - Files affected: ProjectsPage, HubHomePage, ProjectPickerDialog
 *      - Remediation: Create repository layer, eliminate useLiveQuery
 *
 *   2. PlatformContract not used by components (P1)
 *      - Components using direct feature detection
 *      - Should use: getPlatformContract() from platform-detection.ts
 *      - Example: window.showDirectoryPicker vs platform.canAccessFSA
 *      - Remediation: Refactor to use PlatformContract abstraction
 *
 *   3. Reactive state duplication (P1)
 *      - Both Zustand and useLiveQuery used simultaneously
 *      - Issue: State can get out of sync between Dexie and Zustand
 *      - Remediation: Use single source of truth (Zustand only)
 *
 *   4. Cross-workspace state coupling (P1)
 *      - NotesPage watches IDE store for project changes
 *      - Issue: Tight coupling, IDE store as "single source of truth"
 *      - Remediation: Use event bus for cross-workspace communication
 *
 * ADR-033 Compliance Score: 6/10 (Partial)
 *   ✅ Composite keys properly implemented
 *   ✅ FSA handle persistence implemented
 *   ✅ Auto-detection of storage type implemented
 *   ❌ PlatformContract not used by presentation layer
 *   ❌ StorageGateway not used by presentation layer
 *   ❌ Presentation layer bypasses store/service layers
 *
 * REMEDIATION PRIORITY: P0 (address after routing works)
 *   - R1: Eliminate Direct Dexie Access (8 hours)
 *   - R2: Eliminate Direct FSA API Calls (12 hours)
 *   - R3: Implement PlatformContract Usage (6 hours)
 *   - R4: Eliminate localStorage/sessionStorage Bypass (4 hours)
 *   - R5: Eliminate Reactive State Duplication (6 hours)
 *   - R6: Refactor State Storage to Use Services (8 hours)
 *   - R7: Decouple Cross-Workspace State (4 hours)
 *
 * ============================================================================
 * PHASE 1 CLEANUP (MIRRORED):
 * - Removed temp project auto-creation flow
 * - All users without projects are redirected to spike hub
 * - Platform guard ensures desktop-only access
 * - Clean routing: /spike/ide (no projects) → spike hub, /spike/ide/$projectId → IDE workspace
 *
 * Architecture:
 * - Desktop with FSA: Can access IDE, must create project first
 * - Mobile/Desktop without FSA: Redirected to spike hub or Notes
 */

import { createFileRoute, redirect, useNavigate, useMatchRoute } from '@tanstack/react-router';
import { ErrorBoundary } from '@/spike/components/common/ErrorBoundary';
import { MainLayout } from '@/spike/components/common/MainLayout';
import { Code2, FolderOpen, Plus } from 'lucide-react';
import { FolderPickerDialog } from '@/spike/components/common/FolderPickerDialog';
import { useState } from 'react';
import { getPlatformContract } from '@/spike/infrastructure/filesystem/platform-contract';

// Lazy load IDELayout FROM ISOLATED SPIKE COPY
import { lazy, Suspense } from 'react';
const IDELayout = lazy(() =>
  import('@/spike/components/ide/IDELayout').then(m => ({
    default: m.IDELayout,
  }))
);

export const Route = createFileRoute('/spike/ide')({
  ssr: false,
  beforeLoad: async ({ location }) => {
    console.log('[spike/ide.tsx] beforeLoad called for route:', location.href);

    // Platform validation (ADR-033 D1: Mobile cannot access IDE)
    const platform = getPlatformContract();
    console.log('[spike/ide.tsx] Platform detection:', {
      deviceType: platform.deviceType,
      canAccessIDE: platform.canAccessIDE,
      canAccessFSA: platform.canAccessFSA,
      canRunTerminal: platform.canRunTerminal,
    });

    if (!platform.canAccessIDE) {
      console.warn('[spike/ide.tsx] Mobile/tablet/desktop-without-FSA detected, redirecting to /spike');
      throw redirect({
        to: '/spike',
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
 * 1. On child route (/spike/ide/$projectId): Render IDELayout with project
 * 2. On /spike/ide route (no project): Show empty state with redirect to spike hub
 *
 * No temp projects - users must create projects explicitly via spike hub.
 */
function IDEWorkspace() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Platform detection
  const platform = getPlatformContract();

  // Check if we're on a child route like /spike/ide/$projectId
  const isOnChildRoute = !!matchRoute({ to: '/spike/ide/$projectId', fuzzy: true });

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

  // Show empty state for /spike/ide route (no project selected)
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
            console.log('[Spike/IDERoute] Folder selected, navigating to:', projectId);
            navigate({ to: '/spike/ide/$projectId', params: { projectId } });
          }}
          onCancel={() => {
            console.log('[Spike/IDERoute] Folder picker cancelled');
          }}
        />
      )}
    </MainLayout>
  );
}

/**
 * Handle browse projects
 * Phase 1: Navigates to spike hub for project selection
 */
function handleBrowseProjects(navigate: ReturnType<typeof useNavigate>) {
  console.log('[Spike/IDERoute] Browse projects clicked');
  // Navigate to spike hub with create-project action
  navigate({ to: '/spike', search: { action: 'create-project' } });
}
