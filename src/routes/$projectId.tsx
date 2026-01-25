/**
 * @fileoverview Unified Project Route - Project-Centric Architecture
 * @module routes/$projectId
 *
 * **ARCH-02-10**: Create Project Route (/\$projectId) - FINAL STORY
 * **ARCH-03-00**: Platform-First Plugin Defaults - P0 BLOCKING
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
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-00
 * @team Team A
 * @created 2026-01-22
 */

import { useEffect } from 'react';
import { createFileRoute, redirect, useLocation } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
import { PluginLayout } from '@/presentation/layouts/PluginLayout';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

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
      throw redirect({ to: '/hub' });
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

/**
 * UnifiedProjectRoute Component
 *
 * Renders unified project route with ProjectContextProvider and PluginLayout.
 * Uses platform-first defaults for plugin initialization.
 * Sử dụng mặc định ưu tiên nền tảng để khởi tạo plugin.
 */
function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const layoutStore = usePluginLayoutStore();
  const platform = getPlatformContract();
  const location = useLocation();
  const fsaHandle = (location.state as { fsaHandle?: FileSystemDirectoryHandle | null } | undefined)?.fsaHandle ?? null;

  // CC-AR-03: Check hydration status before rendering layout
  const hasHydrated = usePluginLayoutStore((s) => s._hasHydrated);

  console.log('[UnifiedProjectRoute] Rendering with:', { projectId, project, platform, hasHydrated });

  // Initialize layout store with platform-appropriate defaults
  // Chỉ khởi tạo mặc định nếu người dùng chưa tùy chỉnh
  useEffect(() => {
    if (layoutStore.activePlugins.length === 0) {
      const defaultPlugins = getDefaultPlugins(platform, project);
      const defaultMode = getDefaultLayoutMode(platform);
      console.log('[UnifiedProjectRoute] Initializing defaults:', { defaultPlugins, defaultMode });
      layoutStore.initializeDefaults(defaultPlugins, defaultMode);
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

  return (
    <ProjectContextProvider projectId={projectId} initialHandle={fsaHandle}>
      <PluginLayout />  {/* No props - reads from store */}
    </ProjectContextProvider>
  );
}
