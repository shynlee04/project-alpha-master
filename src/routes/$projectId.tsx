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
// UXUI-04-02: GlobalSidebar with auto-collapse
import { GlobalSidebar } from '@/presentation/components/layout/GlobalSidebar';
// CC-UX-01: StatusBar integration
import { StatusBar } from '@/presentation/components/layout/StatusBar';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { getDefaultPlugins } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
// EPIC-UXUI-04: Archived components - will be replaced with new 3-bar system
// TODO-UXUI-04-02: Replace with GlobalSidebar + ActivityBarLeft/Right + PluginDocker
// import { usePluginActivityDockerWiring } from '@/presentation/components/layout/PluginActivityDockerWiring';
// import { usePluginPlacement } from '@/presentation/hooks/usePluginPlacement';
// import type { ActivityBarItem } from '@/presentation/components/layout/ActivityBar';
// Icons for placeholder
import { FolderTree, StickyNote, MessageSquare } from 'lucide-react';
// EPIC-UXUI-04: Archived components - will be replaced with new 3-bar system
// TODO-UXUI-04-03: Replace with ActivityBarMainTop + PluginPanelMain
// import { MainContentRenderer } from '@/presentation/components/layout/MainContentRenderer';
// TODO-UXUI-04-04: Replace with new PluginDocker (source panel, not floating)
// import { FloatingPluginDocker } from '@/presentation/components/layout/FloatingPluginDocker';

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
 * EPIC-UXUI-04: ActivityBar items - will be replaced with new 3-bar system
 * TODO-UXUI-04-03: Define items for ActivityBarLeft, ActivityBarMainTop, ActivityBarRight
 */
// const LEFT_ACTIVITY_ITEMS: ActivityBarItem[] = [
//   { id: 'filetree', icon: <FolderTree size={24} />, label: 'Files' },
//   { id: 'notes', icon: <StickyNote size={24} />, label: 'Notes' },
// ];

// const RIGHT_ACTIVITY_ITEMS: ActivityBarItem[] = [
//   { id: 'chat', icon: <MessageSquare size={24} />, label: 'Chat' },
//   { id: 'terminal', icon: <Terminal size={24} />, label: 'Terminal' },
//   { id: 'preview', icon: <Eye size={24} />, label: 'Preview' },
// ];

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

  // Get platform-specific defaults
  const defaultPlugins = getDefaultPlugins(platform, project);

  console.log('[UnifiedProjectRoute] EPIC-UXUI-04 Archive Phase:', { 
    projectId, 
    hasHydrated, 
    message: 'Old components archived. New 3-bar system coming in Story 2+',
  });

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
  // EPIC-UXUI-04: PLACEHOLDER LAYOUT
  // ============================================================================
  // Old components archived. New 3-bar + docker system will be implemented in:
  // - Story 2: GlobalSidebar
  // - Story 3: Three Activity Bar System
  // - Story 4: Plugin Docker Component
  // - Story 5: Plugin Panel System
  // ============================================================================
  
  return (
    <PluginCoordinationProvider>
      <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
        <WorkspaceLayout
          // GlobalSidebar - EPIC-UXUI-04 Story 2: Auto-collapse sidebar
          globalSidebar={<GlobalSidebar />}
          
          // Left ActivityBar - PLACEHOLDER (Story 3)
          activityBarLeft={
            <div className="h-full w-12 bg-muted border-r border-border flex flex-col items-center py-2">
              <FolderTree size={20} className="text-muted-foreground" />
            </div>
          }
          
          // Left Plugin Panel - PLACEHOLDER (Story 5)
          pluginLeft={
            <div className="h-full bg-background border-r border-border p-4">
              <div className="font-mono text-sm text-muted-foreground">
                EPIC-UXUI-04: Story 5 - PluginPanelLeft
              </div>
            </div>
          }
          
          // Main Content Area - PLACEHOLDER (Story 3)
          mainContent={
            <div className="h-full flex flex-col bg-background">
              {/* ActivityBarMainTop - PLACEHOLDER */}
              <div className="h-12 border-b border-border flex items-center px-4 gap-2">
                <StickyNote size={16} />
                <span className="font-mono text-sm">Notes</span>
              </div>
              {/* Main Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <div className="font-mono text-sm text-muted-foreground">
                    EPIC-UXUI-04: True Plugin Layout Architecture
                  </div>
                  <div className="font-mono text-xs text-muted-foreground mt-2">
                    Story 1 Complete - Archive Phase Done
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    Stories 2-10 In Progress
                  </div>
                </div>
              </div>
            </div>
          }
          
          // Right Plugin Panel - PLACEHOLDER (Story 5)
          pluginRight={
            <div className="h-full bg-background border-l border-border p-4">
              <div className="font-mono text-sm text-muted-foreground">
                EPIC-UXUI-04: Story 5 - PluginPanelRight
              </div>
            </div>
          }
          
          // Right ActivityBar - PLACEHOLDER (Story 3)
          activityBarRight={
            <div className="h-full w-12 bg-muted border-l border-border flex flex-col items-center py-2">
              <MessageSquare size={20} className="text-muted-foreground" />
            </div>
          }
          
          // StatusBar
          statusBar={<StatusBar />}
        />
        
        {/* PluginDocker - PLACEHOLDER (Story 4) */}
        {/* TODO-UXUI-04-04: Add new PluginDocker component */}
      </ProjectContextProvider>
    </PluginCoordinationProvider>
  );
}
