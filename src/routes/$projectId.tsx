/**
 * @fileoverview Unified Project Route - Project-Centric Architecture
 * @module routes/$projectId
 *
 * **ARCH-02-10**: Create Project Route (/\$projectId) - FINAL STORY
 * **ARCH-03-00**: Platform-First Plugin Defaults - P0 BLOCKING
 * **UXUI-02-05**: Wire ActivityBar + Docker Integration
 *
 * This is NEW unified route that replaces workspace-specific routes.
 * Per ADR-034 Section 5: Single Project Route.
 * Per ADR-034-001: Platform-First Plugin Selection.
 *
 * Route Behavior:
 * 1. Load ProjectContextProvider (from ARCH-02-03)
 * 2. Render PluginLayout (from ARCH-02-09) with platform-default plugins
 * 3. Initialize plugins based on platform detection (NO layout query params)
 * 4. Persist user's plugin customization per project
 * 5. Old routes redirect WITHOUT query param (platform decides defaults)
 * 6. ActivityBar + Docker wiring for plugin panel management (UXUI-02-05)
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-00, UXUI-02-05
 * @team Team A
 * @created 2026-01-22
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
// Phase 1: PluginLayout with CSS Grid (replaces PluginSidebar)
import { PluginLayout } from '@/presentation/layouts/PluginLayout';
import { WorkspaceLayout } from '@/presentation/layouts/WorkspaceLayout';
// UXUI-02-03: GlobalSidebar integration
import { MainSidebar } from '@/presentation/components/layout/MainSidebar';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { getPresetConfig } from '@/presentation/layouts/workflow-presets';
// UXUI-02-05: ActivityBar + Docker Wiring
import { usePluginActivityDockerWiring } from '@/presentation/components/layout/PluginActivityDockerWiring';
import { usePluginPlacement, getDefaultPlacements } from '@/presentation/hooks/usePluginPlacement';
import type { ActivityBarItem } from '@/presentation/components/layout/ActivityBar';
// Icons for ActivityBar
import { FolderTree, Search, MessageSquare, Code, Bot, Terminal, Eye } from 'lucide-react';

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
// Main Route Component
// ============================================================================

// ============================================================================
// ActivityBar Item Definitions
// ============================================================================

/**
 * Left side ActivityBar items
 *
 * @remarks
 * Plugins typically shown on the left:
 * - FileTree: File browser for project navigation
 * - Search: Search within project files
 */
const LEFT_ACTIVITY_ITEMS: ActivityBarItem[] = [
  { id: 'filetree', icon: <FolderTree size={24} />, label: 'Files' },
  { id: 'search', icon: <Search size={24} />, label: 'Search' },
];

/**
 * Right side ActivityBar items
 *
 * @remarks
 * Plugins typically shown on the right:
 * - Chat: AI chat assistant
 * - Monaco: Code editor
 * - Terminal: Command line
 * - Preview: Live preview
 */
const RIGHT_ACTIVITY_ITEMS: ActivityBarItem[] = [
  { id: 'chat', icon: <MessageSquare size={24} />, label: 'Chat' },
  { id: 'monaco', icon: <Code size={24} />, label: 'Editor' },
  { id: 'terminal', icon: <Terminal size={24} />, label: 'Terminal' },
  { id: 'preview', icon: <Eye size={24} />, label: 'Preview' },
  { id: 'agents', icon: <Bot size={24} />, label: 'Agents' },
];

// ============================================================================
// Main Route Component
// ============================================================================

/**
 * UnifiedProjectRoute Component
 *
 * Renders unified project route with ProjectContextProvider and PluginLayout.
 * Uses platform-first defaults for plugin initialization.
 * Integrates ActivityBar + Docker wiring for panel management (UXUI-02-05).
 */
function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const layoutStore = usePluginLayoutStore();
  const platform = getPlatformContract();

  // CRITICAL FIX: FileSystemDirectoryHandle is NOT serializable
  // It cannot be passed through router state (becomes null after navigation)
  // The handle will be restored from IndexedDB by ProjectContextProvider
  // See: EPIC-0 Section 12.2 FLAW-01
  const fsaHandle = null; // Let context restore from persistence

  // CC-AR-03: Check hydration status before rendering layout
  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);

  console.log('[UnifiedProjectRoute] Rendering:', { projectId, hasHydrated, storageType: project?.storageType });

  // ========================================================================
  // UXUI-02-05: Plugin Placement State (Single Instance Constraint)
  // ========================================================================

  const {
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
  } = usePluginPlacement(getDefaultPlacements('default'));

  // ========================================================================
  // UXUI-02-05: Left Side Wiring (ActivityBar + Docker)
  // ========================================================================

  const leftWiring = usePluginActivityDockerWiring({
    position: 'left',
    items: LEFT_ACTIVITY_ITEMS,
    minWidth: 200,
    maxWidth: 320,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
  });

  // ========================================================================
  // UXUI-02-05: Right Side Wiring (ActivityBar + Docker)
  // ========================================================================

  const rightWiring = usePluginActivityDockerWiring({
    position: 'right',
    items: RIGHT_ACTIVITY_ITEMS,
    minWidth: 250,
    maxWidth: 400,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
  });

  // Initialize layout store with platform-appropriate defaults
  // Phase 1: Use workflow presets instead of individual plugins
  useEffect(() => {
    // Only initialize if user hasn't customized AND store has no active plugins
    if (!layoutStore.hasUserCustomized && layoutStore.activePlugins.length === 0) {
      const defaultPreset = layoutStore.currentPreset || 'default';
      const presetConfig = getPresetConfig(defaultPreset);

      console.log('[UnifiedProjectRoute] Initializing with preset:', {
        preset: defaultPreset,
        panels: presetConfig.panels,
      });

      // Use preset's panels as default plugins
      layoutStore.initializeDefaults(presetConfig.panels, getDefaultLayoutMode(platform));
    }
  }, [project.id]);

  // CC-AR-03: Show loading skeleton while store is hydrating
  if (!hasHydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-sm">
          Loading layout...
        </div>
      </div>
    );
  }

  // Phase 1: CSS Grid Layout with Fixed-Ratio Presets
  // PluginLayout now includes Chat, FileTree, and other panels in CSS Grid
  // No separate PluginSidebar needed - all panels are in the grid
  // EPIC-0.6-01: Wrap with PluginCoordinationProvider for cross-plugin coordination
  // UXUI-02-03: WorkspaceLayout integration with MainSidebar as GlobalSidebar
  // UXUI-02-05: ActivityBar + Docker wiring for panel management
  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
        <WorkspaceLayout
          globalSidebar={<MainSidebar />}
          activityBarLeft={leftWiring.activityBar}
          pluginLeft={leftWiring.docker}
          mainContent={<PluginLayout />}
          pluginRight={rightWiring.docker}
          activityBarRight={rightWiring.activityBar}
        />
      </ProjectContextProvider>
    </PluginCoordinationProvider>
  );
}
