/**
 * @fileoverview Unified Project Route - Project-Centric Architecture
 * @module routes/$projectId
 *
 * **ARCH-02-10**: Create Project Route (/\$projectId) - FINAL STORY
 * **ARCH-03-00**: Platform-First Plugin Defaults - P0 BLOCKING
 * **EPIC-UXUI-04**: True Plugin Layout Architecture - COMPLETE
 *
 * This is NEW unified route that replaces workspace-specific routes.
 * Per ADR-034 Section 5: Single Project Route.
 * Per ADR-034-001: Platform-First Plugin Selection.
 *
 * Route Behavior:
 * 1. Load ProjectContextProvider (from ARCH-02-03)
 * 2. Render ResponsiveLayout (from EPIC-UXUI-04) with 3-bar system
 * 3. Initialize plugins based on platform detection (NO layout query params)
 * 4. Persist user's plugin customization per project
 * 5. Old routes redirect WITHOUT query param (platform decides defaults)
 * 6. ActivityBar + PluginPanel wiring for plugin management (UXUI-04)
 *
 * @epic EPIC-ARCH-03, EPIC-UXUI-04
 * @story ARCH-03-00, UXUI-04-10
 * @team Team A
 * @created 2026-01-22
 * @updated 2026-01-30
 */

import { useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
// EPIC-0.6-01: Plugin Coordination Context for cross-plugin coordination
import { PluginCoordinationProvider } from '@/infrastructure/context/plugin-coordination-context';
// EPIC-UXUI-04: Responsive Layout with 3-bar system
import { ResponsiveLayout } from '@/presentation/components/layout/ResponsiveLayout';
// CC-UX-01: StatusBar integration
import { StatusBar } from '@/presentation/components/layout/StatusBar';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { getDefaultPlugins } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
// EPIC-UXUI-04: Layout state management for plugin initialization
import { useLayoutState } from '@/presentation/hooks/useLayoutState';
import type { ActivityBarPosition } from '@/presentation/components/layout/activity-bar-types';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/$projectId')({
  ssr: false,

  // Load project data (same pattern as existing routes)
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[ProjectRoute.loader] Loading project:', projectId);

    // Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[ProjectRoute.loader] Hydration complete, querying Dexie...');

    // Query Dexie directly (not Zustand/getProject facade)
    const record = await db.projects.get(projectId);

    if (!record) {
      console.error('[ProjectRoute.loader] Project not found in Dexie:', projectId);
      throw redirect({ to: '/' });
    }

    // Convert record to Project type using fromRecord for proper defaults
    const project = fromRecord(record);
    console.log('[ProjectRoute.loader] Project found:', { id: project.id, name: project.name });

    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <UnifiedProjectRoute />
    </ErrorBoundary>
  ),
});

// ============================================================================
// Platform Plugin Mapping
// ============================================================================

/**
 * Map platform defaults to activity bar positions
 * Desktop with FSA: Monaco as main, FileTree left, Chat right
 * Desktop with IndexedDB: Notes as main, FileTree left, Chat right
 * Tablet: Notes as main, FileTree left
 * Mobile: Notes only, single column
 */
function getDefaultPluginPlacement(platform: ReturnType<typeof getPlatformContract>): Record<ActivityBarPosition, PluginId[]> {
  // Desktop with FSA support
  if (platform.canAccessFSA) {
    return {
      left: ['filetree'],
      'main-top': ['monaco', 'notes'],
      right: ['chat', 'terminal', 'preview'],
    };
  }

  // Desktop without FSA (IndexedDB only)
  if (platform.storageType === 'indexeddb' && platform.deviceType === 'desktop') {
    return {
      left: ['filetree'],
      'main-top': ['notes', 'monaco'],
      right: ['chat', 'agents'],
    };
  }

  // Tablet/Mobile fallback
  return {
    left: ['filetree'],
    'main-top': ['notes'],
    right: ['chat'],
  };
}

// ============================================================================
// Main Route Component
// ============================================================================

/**
 * UnifiedProjectRoute Component
 *
 * Renders unified project route with ProjectContextProvider and ResponsiveLayout.
 * Uses platform-first defaults for plugin initialization.
 * Integrates ActivityBar + PluginPanel wiring for plugin management (EPIC-UXUI-04).
 *
 * ============================================================================
 * CC-AR-02: Platform-First Plugin Wiring
 * - Platform detection determines default layout, plugins, and placements
 * - Desktop with FSA: Monaco as main, FileTree left, Chat right
 * - Desktop with IndexedDB: Notes as main, FileTree left, Chat right
 * - Tablet: Notes as main, FileTree left
 * - Mobile: Notes only, single column
 * ============================================================================
 */

function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const platform = getPlatformContract();

  // CRITICAL FIX: FileSystemDirectoryHandle is NOT serializable
  const fsaHandle = null;

  // CC-AR-03: Check hydration status
  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);

  // EPIC-UXUI-04: Layout state management for plugin initialization
  const {
    isHydrated: layoutHydrated,
    setBarPlugins,
    setActivePlugin,
    leftBarPlugins,
    mainTopBarPlugins,
    rightBarPlugins,
  } = useLayoutState();

  // Get platform-specific defaults
  const defaultPlugins = getDefaultPlugins(platform, project);
  const defaultPlacement = getDefaultPluginPlacement(platform);

  // ============================================================================
  // Initialize plugins on mount
  // ============================================================================
  useEffect(() => {
    if (!layoutHydrated) return;

    // Only set defaults if no plugins are configured yet
    const hasLeftPlugins = leftBarPlugins.length > 0;
    const hasMainPlugins = mainTopBarPlugins.length > 0;
    const hasRightPlugins = rightBarPlugins.length > 0;

    if (!hasLeftPlugins && !hasMainPlugins && !hasRightPlugins) {
      console.log('[UnifiedProjectRoute] Initializing default plugin placement:', defaultPlacement);

      // Set plugins for each bar
      setBarPlugins('left', defaultPlacement.left);
      setBarPlugins('main-top', defaultPlacement['main-top']);
      setBarPlugins('right', defaultPlacement.right);

      // Set active plugins (first one in each bar)
      if (defaultPlacement.left.length > 0) {
        setActivePlugin('left', defaultPlacement.left[0]);
      }
      if (defaultPlacement['main-top'].length > 0) {
        setActivePlugin('main-top', defaultPlacement['main-top'][0]);
      }
      if (defaultPlacement.right.length > 0) {
        setActivePlugin('right', defaultPlacement.right[0]);
      }
    }
  }, [
    layoutHydrated,
    leftBarPlugins.length,
    mainTopBarPlugins.length,
    rightBarPlugins.length,
    setBarPlugins,
    setActivePlugin,
    defaultPlacement,
  ]);

  console.log('[UnifiedProjectRoute] EPIC-UXUI-04 Complete:', {
    projectId,
    hasHydrated,
    layoutHydrated,
    platform: platform.deviceType,
    defaultPlugins,
  });

  // CC-AR-03: Show loading skeleton while store is hydrating
  if (!hasHydrated || !layoutHydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-sm">
          Loading layout...
        </div>
      </div>
    );
  }

  // ============================================================================
  // EPIC-UXUI-04: FULLY WIRED LAYOUT (FIX-2026-02-01)
  // ============================================================================
  // ResponsiveLayout includes (5-column grid - NO GlobalSidebar):
  // - ActivityBarLeft (vertical, 48px)
  // - PluginPanelLeft (2 grid units)
  // - PluginPanelMain (4 grid units)
  // - PluginPanelRight (2.5 grid units)
  // - ActivityBarRight (vertical, 48px)
  // - BottomNavigation (mobile/tablet)
  //
  // GlobalSidebar removed - ProjectAwareLayout provides GlobalHeader
  // ============================================================================

  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          {/* Main Responsive Layout */}
          <div className="flex-1 overflow-hidden">
            <ResponsiveLayout
              onBreakpointChange={(breakpoint) => {
                console.log('[UnifiedProjectRoute] Breakpoint changed:', breakpoint);
              }}
              onLayoutModeChange={(mode) => {
                console.log('[UnifiedProjectRoute] Layout mode changed:', mode);
              }}
            />
          </div>

          {/* StatusBar */}
          <StatusBar />
        </div>
      </ProjectContextProvider>
    </PluginCoordinationProvider>
  );
}
