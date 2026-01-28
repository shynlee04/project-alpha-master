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
import { usePluginPlacement, type PluginPlacementEntry } from '@/presentation/hooks/usePluginPlacement';
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
 * 
 * ============================================================================
 * DEBUG PHASE 2: 2026-01-28
 * ISOLATING CHAT AND NOTES PLUGINS
 * - All plugins ENABLED except 'notes' and 'chat'
 * - If black rectangle RETURNS → Problem is in FileTree/Terminal/Preview/Monaco
 * - If black rectangle GONE → Problem is in Notes or Chat plugins
 * ============================================================================
 */

// DEBUG PHASE 2: Plugins to DISABLE for testing
const DEBUG_DISABLED_PLUGINS: PluginId[] = ['notes', 'chat'];

// DEBUG PHASE 2: Filter activity items to exclude disabled plugins
const DEBUG_LEFT_ACTIVITY_ITEMS = LEFT_ACTIVITY_ITEMS.filter(
  (item) => !DEBUG_DISABLED_PLUGINS.includes(item.id as PluginId)
);
const DEBUG_RIGHT_ACTIVITY_ITEMS = RIGHT_ACTIVITY_ITEMS.filter(
  (item) => !DEBUG_DISABLED_PLUGINS.includes(item.id as PluginId)
);

// DEBUG PHASE 2: Default placements without disabled plugins
const DEBUG_DEFAULT_PLACEMENTS: PluginPlacementEntry[] = [
  { pluginId: 'filetree', panel: 'left' },
  { pluginId: 'terminal', panel: 'right' },
  // NOTE: 'chat' and 'notes' are DISABLED for this debug phase
];

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

  console.log('[UnifiedProjectRoute] DEBUG PHASE 2 - Rendering:', { 
    projectId, 
    hasHydrated, 
    storageType: project?.storageType,
    disabledPlugins: DEBUG_DISABLED_PLUGINS,
  });

  // ========================================================================
  // DEBUG PHASE 2: MAIN CONTENT PLUGIN STATE RE-ENABLED
  // ========================================================================
  // 
  // UXUI-03-04: Main Content Plugin State (Notes/Monaco/Preview Switching)
  // NOTE: Default to 'monaco' since 'notes' is disabled
  // 
  const [activeMainPluginId, setActiveMainPluginId] = useState<PluginId>('monaco');
  const handleMainPluginChange = useCallback((pluginId: PluginId) => {
    // DEBUG: Block disabled plugins from being activated
    if (DEBUG_DISABLED_PLUGINS.includes(pluginId)) {
      console.warn(`[DEBUG PHASE 2] Plugin ${pluginId} is DISABLED for testing`);
      return;
    }
    console.log('[UnifiedProjectRoute] Main plugin changed:', pluginId);
    setActiveMainPluginId(pluginId);
  }, []);
  const handlePluginError = useCallback((pluginId: PluginId, error: Error) => {
    console.error('[UnifiedProjectRoute] Plugin error:', { pluginId, error });
  }, []);

  // ========================================================================
  // DEBUG PHASE 2: PLUGIN PLACEMENT STATE RE-ENABLED
  // ========================================================================
  // 
  // UXUI-02-05: Plugin Placement State (Single Instance Constraint)
  // UXUI-03-07: Plugin placement persistence (keyed by projectId)
  //
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
    initialPlacements: DEBUG_DEFAULT_PLACEMENTS,
  });

  // ========================================================================
  // DEBUG PHASE 2: FLOATING DOCKER STATE RE-ENABLED
  // ========================================================================
  const [isFloatingDockerOpen, setIsFloatingDockerOpen] = useState(false);
  const toggleFloatingDocker = useCallback(() => {
    setIsFloatingDockerOpen((prev) => !prev);
  }, []);
  const handleFloatingDockerPluginClick = useCallback(
    (pluginId: PluginId, defaultPanel: 'left' | 'main' | 'right') => {
      // DEBUG: Block disabled plugins
      if (DEBUG_DISABLED_PLUGINS.includes(pluginId)) {
        console.warn(`[DEBUG PHASE 2] Plugin ${pluginId} is DISABLED for testing`);
        return;
      }
      const currentPanel = getPluginPanel(pluginId);
      if (currentPanel === null || currentPanel === undefined) {
        movePluginToPanel(pluginId, defaultPanel);
        console.log(`[UnifiedProjectRoute] Placed ${pluginId} in ${defaultPanel} panel`);
      } else {
        console.log(`[UnifiedProjectRoute] ${pluginId} already in ${currentPanel} panel`);
      }
    },
    [getPluginPanel, movePluginToPanel]
  );

  // ========================================================================
  // DEBUG PHASE 2: KEYBOARD SHORTCUT HANDLER RE-ENABLED
  // ========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleFloatingDocker();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFloatingDocker]);

  // ========================================================================
  // DEBUG PHASE 2: PLUGIN RENDERER CALLBACK RE-ENABLED
  // ========================================================================
  const renderPluginContent = useCallback(
    ({ pluginId, position }: { pluginId: PluginId; position: 'left' | 'right' }) => {
      // DEBUG: Block disabled plugins from rendering
      if (DEBUG_DISABLED_PLUGINS.includes(pluginId)) {
        return (
          <div className="h-full flex items-center justify-center bg-amber-900/20 border border-amber-500/30 p-4">
            <span className="text-amber-400 font-mono text-xs text-center">
              [DEBUG PHASE 2]<br />
              {pluginId} DISABLED
            </span>
          </div>
        );
      }
      
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
      const width = position === 'left' ? 240 : 300;
      const height = 500;
      return <Component width={width} height={height} />;
    },
    []
  );

  // ========================================================================
  // DEBUG PHASE 2: LEFT/RIGHT WIRING RE-ENABLED
  // ========================================================================
  const leftWiring = usePluginActivityDockerWiring({
    position: 'left',
    items: DEBUG_LEFT_ACTIVITY_ITEMS, // Filtered items
    minWidth: 200,
    maxWidth: 320,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
    getActivePluginForPanel,
    setActivePluginForPanel,
    renderPlugin: renderPluginContent,
  });
  const rightWiring = usePluginActivityDockerWiring({
    position: 'right',
    items: DEBUG_RIGHT_ACTIVITY_ITEMS, // Filtered items
    minWidth: 250,
    maxWidth: 400,
    getPluginPanel,
    movePluginToPanel,
    closePlugin,
    getPluginsInPanel,
    getActivePluginForPanel,
    setActivePluginForPanel,
    renderPlugin: renderPluginContent,
  });

  // ========================================================================
  // DEBUG PHASE 2: LAYOUT STORE INITIALIZATION RE-ENABLED
  // ========================================================================
  useEffect(() => {
    if (!layoutStore.hasUserCustomized && layoutStore.activePlugins.length === 0) {
      const defaultPreset = layoutStore.currentPreset || 'default';
      const presetConfig = getPresetConfig(defaultPreset);
      console.log('[UnifiedProjectRoute] Initializing with preset:', {
        preset: defaultPreset,
        panels: presetConfig.panels,
      });
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

  // ============================================================================
  // DEBUG PHASE 2: RE-ENABLED PLUGINS (except notes and chat)
  // ============================================================================
  // 
  // ISOLATING CHAT AND NOTES PLUGINS:
  // - If black rectangle RETURNS → Problem is in FileTree/Terminal/Preview/Monaco
  // - If black rectangle GONE → Problem is in Notes or Chat plugins
  //
  // Disabled: notes, chat
  // Enabled: filetree, monaco, terminal, preview
  //
  
  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
        <WorkspaceLayout
          // GlobalSidebar - Real MainSidebar component
          globalSidebar={<MainSidebar />}
          
          // Left ActivityBar - Using leftWiring (notes filtered out)
          activityBarLeft={leftWiring.activityBar}
          
          // Left Plugin Panel - Using leftWiring docker
          pluginLeft={leftWiring.docker}
          
          // Main Content Area - Using MainContentRenderer (notes filtered out)
          mainContent={
            <MainContentRenderer
              activePluginId={activeMainPluginId}
              onPluginChange={handleMainPluginChange}
              onPluginError={handlePluginError}
              fallback={
                <div className="h-full flex items-center justify-center bg-background">
                  <div className="text-center">
                    <span className="text-muted-foreground font-mono text-sm block">
                      [DEBUG PHASE 2] Main Content
                    </span>
                    <span className="text-muted-foreground/60 font-mono text-xs block mt-2">
                      Notes plugin DISABLED - Testing isolation
                    </span>
                  </div>
                </div>
              }
            />
          }
          
          // Right Plugin Panel - Using rightWiring docker (chat filtered out)
          pluginRight={rightWiring.docker}
          
          // Right ActivityBar - Using rightWiring (chat filtered out)
          activityBarRight={rightWiring.activityBar}
          
          // StatusBar - Real StatusBar component
          statusBar={<StatusBar />}
        />
        
        {/* FloatingPluginDocker - Re-enabled with disabled plugins filtered */}
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
