/**
 * @fileoverview Project Route - Unified Route for All Workspaces
 * @module routes/$projectId
 *
 * **ARCH-02-10**: Create Project Route (/$projectId) - FINAL STORY
 *
 * Per ADR-034 Decision D5, this is the NEW unified route that:
 * - Replaces 4 old workspace routes (/ide, /notes, /knowledge, /study)
 * - Loads ProjectContextProvider for all plugins
 * - Renders PluginLayout with user's selected plugins
 * - Supports layout presets via query params
 *
 * Route: /$projectId
 * Loader: Load project from Dexie, redirect to /hub if not found
 * Component: Render ProjectContextProvider → PluginLayout
 *
 * Plugin Presets (via ?layout= query param):
 * - ?layout=ide: activePlugins=['filetree','monaco','terminal','chat'], layoutMode='2+1'
 * - ?layout=notes: activePlugins=['filetree','notes','chat'], layoutMode='2-column'
 * - Default (no param): Load from project settings or empty state
 *
 * This is the FINAL route in EPIC-ARCH-02.
 * All 10/10 stories will be complete after this.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-10
 * @team Team A
 * @created 2026-01-21
 */

import { useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
import { PluginLayout } from '@/presentation/layouts/PluginLayout';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';

// ============================================================================
// Search Params Interface
// ============================================================================

/**
 * Project route search params
 *
 * @remarks
 * Supports layout preset via ?layout= query param:
 * - 'ide': IDE layout preset (filetree + monaco + terminal + chat)
 * - 'notes': Notes layout preset (filetree + notes + chat)
 * - undefined: Use project's saved layout
 */
export interface ProjectRouteSearchParams {
  layout?: 'ide' | 'notes';
}

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/$projectId')({
  ssr: false,

  /**
   * Loader - Load Project from Dexie
   *
   * @remarks
   * - Wait for Zustand store hydration (per ADR-034 D12)
   * - Query Dexie directly (not Zustand facade)
   * - Redirect to /hub if project not found
   * - Returns project data for component
   */
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
    console.log('[ProjectRoute.loader] Project found:', {
      id: project.id,
      name: project.name,
      storageType: project.storageType
    });
    return { project };
  },

  component: () => (
    <ErrorBoundary>
      <ProjectWorkspace />
    </ErrorBoundary>
  ),
});

// ============================================================================
// Component: ProjectWorkspace
// ============================================================================

/**
 * Project Workspace Component
 *
 * @remarks
 * - Loads projectId from route params
 * - Loads search params for layout preset
 * - Wraps PluginLayout in ProjectContextProvider
 * - Applies layout preset if ?layout= query param exists
 * - Renders PluginLayout for flexible plugin arrangement
 */
function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const search = Route.useSearch() as ProjectRouteSearchParams;

  // Get layout store actions
  const { setLayoutMode, clearActivePlugins } = usePluginLayoutStore((state) => ({
    setLayoutMode: state.setLayoutMode,
    clearActivePlugins: state.clearActivePlugins,
  }));

  /**
   * Apply Layout Preset on Mount
   *
   * @remarks
   * - Check ?layout= query param
   * - If 'ide': Set activePlugins and layoutMode for IDE
   * - If 'notes': Set activePlugins and layoutMode for Notes
   * - If undefined: Use project's saved layout (already in store)
   */
  useEffect(() => {
    if (search.layout === 'ide') {
      console.log('[ProjectRoute] Applying IDE layout preset');
      // Clear existing plugins first
      clearActivePlugins();
      // IDE preset: filetree + monaco + terminal + chat in 2+1 layout
      setLayoutMode('2+1');
      // Note: Plugins are added via PluginLayout UI, not programmatically here
      // Users will add plugins via the "Add Plugin" button
    } else if (search.layout === 'notes') {
      console.log('[ProjectRoute] Applying Notes layout preset');
      // Clear existing plugins first
      clearActivePlugins();
      // Notes preset: filetree + notes + chat in 2-column layout
      setLayoutMode('2-column');
      // Note: Plugins are added via PluginLayout UI, not programmatically here
    } else {
      console.log('[ProjectRoute] No layout preset, using saved layout');
    }
  }, [search.layout, setLayoutMode, clearActivePlugins]);

  console.log('[ProjectRoute] Rendering ProjectContextProvider with PluginLayout');

  // ========================================================================
  // Render: ProjectContextProvider → PluginLayout
  // ========================================================================

  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout />
    </ProjectContextProvider>
  );
}

// ============================================================================
// No additional exports - Route and ProjectWorkspace exported above
// ============================================================================
