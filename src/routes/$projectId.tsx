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

import { useEffect, useCallback, useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
// EPIC-0.6-01: Plugin Coordination Context for cross-plugin coordination
import { PluginCoordinationProvider } from '@/infrastructure/context/plugin-coordination-context';
// REMOVED: PluginLayout - ActivityBar + Docker now handles plugin rendering
// import { PluginLayout } from '@/presentation/layouts/PluginLayout';
import { WorkspaceLayout } from '@/presentation/layouts/WorkspaceLayout';
// UXUI-03-01: GlobalSidebar integration - MainSidebar as global sidebar per UX spec
import { MainSidebar } from '@/presentation/components/layout/MainSidebar';
// CC-UX-01: StatusBar integration
import { StatusBar } from '@/presentation/components/layout/StatusBar';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { getPresetConfig } from '@/presentation/layouts/workflow-presets';
// UXUI-02-05: ActivityBar + Docker Wiring
import { usePluginActivityDockerWiring } from '@/presentation/components/layout/PluginActivityDockerWiring';
import { usePluginPlacement, getDefaultPlacements } from '@/presentation/hooks/usePluginPlacement';
import type { ActivityBarItem } from '@/presentation/components/layout/ActivityBar';
// CC-UX-02: Plugin Registry for rendering
import { getPlugin } from '@/infrastructure/plugins/plugin-registry';
import type { PluginId } from '@/domain/types/plugin-types';
// Icons for ActivityBar
import { FolderTree, StickyNote, MessageSquare, Terminal, Eye } from 'lucide-react';
// UXUI-03-04: MainContentRenderer for plugin switching in main content area
import { MainContentRenderer } from '@/presentation/components/layout/MainContentRenderer';
// UXUI-03-05: FloatingPluginDocker for centralized plugin management
import { FloatingPluginDocker } from '@/presentation/components/layout/FloatingPluginDocker';

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
  { id: 'notes', icon: <StickyNote size={24} />, label: 'Notes' },
];

/**
 * Right side ActivityBar items
 *
 * @remarks
 * Plugins typically shown on the right:
 * - Chat: AI chat assistant
 * - Terminal: Command line
 * - Preview: Live preview
 * 
 * NOTE: Monaco is now the MAIN content area (not a sidebar plugin)
 */
const RIGHT_ACTIVITY_ITEMS: ActivityBarItem[] = [
  { id: 'chat', icon: <MessageSquare size={24} />, label: 'Chat' },
  { id: 'terminal', icon: <Terminal size={24} />, label: 'Terminal' },
  { id: 'preview', icon: <Eye size={24} />, label: 'Preview' },
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
  // UXUI-03-04: Main Content Plugin State (Notes/Monaco/Preview Switching)
  // ========================================================================

  /**
   * Active plugin ID for the main content area.
   * Default: 'monaco' (code editor as primary workspace tool)
   */
  const [activeMainPluginId, setActiveMainPluginId] = useState<PluginId>('monaco');

  /**
   * Handler for main content plugin switching
   * Called when user clicks a tab in the ActivityBarTop
   */
  const handleMainPluginChange = useCallback((pluginId: PluginId) => {
    console.log('[UnifiedProjectRoute] Main plugin changed:', pluginId);
    setActiveMainPluginId(pluginId);
  }, []);

  /**
   * Handler for plugin errors in main content area
   * Logs errors and could trigger error reporting
   */
  const handlePluginError = useCallback((pluginId: PluginId, error: Error) => {
    console.error('[UnifiedProjectRoute] Plugin error:', { pluginId, error });
    // Could add error reporting/analytics here
  }, []);

  // ========================================================================
  // UXUI-02-05: Plugin Placement State (Single Instance Constraint)
  // UXUI-03-07: Plugin placement persistence (keyed by projectId)
  // ========================================================================

  const {
    placements,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
    getActivePluginForPanel,
    setActivePluginForPanel,
  } = usePluginPlacement({
    projectId,
    initialPlacements: getDefaultPlacements('default'),
  });

  // ========================================================================
  // UXUI-03-05: Floating Plugin Docker State
  // ========================================================================

  /**
   * Whether the floating plugin docker is visible
   * Toggled via Cmd+Shift+P keyboard shortcut
   */
  const [isFloatingDockerOpen, setIsFloatingDockerOpen] = useState(false);

  /**
   * Toggle floating docker visibility
   */
  const toggleFloatingDocker = useCallback(() => {
    setIsFloatingDockerOpen((prev) => !prev);
  }, []);

  /**
   * Handle plugin click from floating docker
   * Opens the plugin in its default or current panel
   */
  const handleFloatingDockerPluginClick = useCallback(
    (pluginId: PluginId, defaultPanel: 'left' | 'main' | 'right') => {
      const currentPanel = getPluginPanel(pluginId);
      
      if (currentPanel === null || currentPanel === undefined) {
        // Plugin not placed - place it in default panel
        movePluginToPanel(pluginId, defaultPanel);
        console.log(`[UnifiedProjectRoute] Placed ${pluginId} in ${defaultPanel} panel`);
      } else {
        // Plugin already placed - just log (could toggle visibility)
        console.log(`[UnifiedProjectRoute] ${pluginId} already in ${currentPanel} panel`);
      }
    },
    [getPluginPanel, movePluginToPanel]
  );

  // ========================================================================
  // UXUI-03-05: Keyboard Shortcut Handler (Cmd+Shift+P)
  // ========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux) to toggle floating docker
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleFloatingDocker();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFloatingDocker]);

  // ========================================================================
  // CC-UX-02: Plugin Renderer Callback
  // ========================================================================

  /**
   * Render plugin content for ActivityBar/Docker
   * Uses plugin registry to get the MainComponent
   */
  const renderPluginContent = useCallback(
    ({ pluginId, position }: { pluginId: PluginId; position: 'left' | 'right' }) => {
      const plugin = getPlugin(pluginId);
      
      if (!plugin) {
        console.warn(`[UnifiedProjectRoute] Plugin not found: ${pluginId}`);
        return (
          <div className="p-4 font-mono text-sm text-muted-foreground">
            Plugin not found: {pluginId}
          </div>
        );
      }

      const Component = plugin.MainComponent;
      // Default dimensions - Docker handles resize
      const width = position === 'left' ? 240 : 300;
      const height = 500; // Will fill available space via CSS

      return <Component width={width} height={height} />;
    },
    []
  );

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
    getActivePluginForPanel,
    setActivePluginForPanel,
    renderPlugin: renderPluginContent,  // CC-UX-02: Wire plugin renderer
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
    getActivePluginForPanel,
    setActivePluginForPanel,
    renderPlugin: renderPluginContent,  // CC-UX-02: Wire plugin renderer
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
  // UXUI-03-04: MainContentRenderer replaces hardcoded MonacoMain for plugin switching
  // UXUI-03-05: FloatingPluginDocker for centralized plugin management (Cmd+Shift+P)
  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
        <WorkspaceLayout
          globalSidebar={<MainSidebar />}
          activityBarLeft={leftWiring.activityBar}
          pluginLeft={leftWiring.docker}
          mainContent={
            <MainContentRenderer
              activePluginId={activeMainPluginId}
              onPluginChange={handleMainPluginChange}
              onPluginError={handlePluginError}
            />
          }
          pluginRight={rightWiring.docker}
          activityBarRight={rightWiring.activityBar}
          statusBar={<StatusBar />}
        />
        
        {/* UXUI-03-05: Floating Plugin Docker - Toggle via Cmd+Shift+P */}
        <FloatingPluginDocker
          placements={placements}
          onPluginClick={handleFloatingDockerPluginClick}
          isOpen={isFloatingDockerOpen}
          onClose={toggleFloatingDocker}
        />
      </ProjectContextProvider>
    </PluginCoordinationProvider>
  );
}
