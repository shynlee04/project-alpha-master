/**
 * @fileoverview Unified Project Route - Project-Centric Architecture
 * @module routes/$projectId
 *
 * **ARCH-02-10**: Create Project Route (/\$projectId) - FINAL STORY
 *
 * This is the NEW unified route that replaces workspace-specific routes.
 * Per ADR-034 Section 5: Single Project Route.
 *
 * Route Behavior:
 * 1. Load ProjectContextProvider (from ARCH-02-03)
 * 2. Render PluginLayout (from ARCH-02-09) with user's selected plugins
 * 3. Support layout presets via query params (?layout=ide, ?layout=notes)
 * 4. Persist user's plugin selection per project
 * 5. Old routes redirect with query param to preserve layout preference
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-10
 * @team Team A
 * @created 2026-01-21
 */

import React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
import { PluginLayout } from '@/presentation/layouts/PluginLayout';
import type { Project } from '@/domain/entities/project';
import type { PluginId } from '@/domain/types/plugin-types';

/**
 * Layout preset type from query params
 */
type LayoutPreset = 'ide' | 'notes' | 'custom';

/**
 * Search params for route
 */
interface ProjectRouteSearch {
  layout?: LayoutPreset;
}

/**
 * Plugin presets for common layouts
 */
const PLUGIN_PRESETS: Record<LayoutPreset, PluginId[]> = {
  ide: ['filetree', 'monaco', 'terminal', 'chat'],
  notes: ['filetree', 'notes', 'chat'],
  custom: [], // User's custom selection from store
};

/**
 * Layout mode presets for common layouts
 */
const LAYOUT_MODE_PRESETS: Record<LayoutPreset, '1-column' | '2-column' | '2+1'> = {
  ide: '2+1', // FileTree | Monaco | Terminal (sidebar) + Chat (bottom)
  notes: '2-column', // FileTree | Notes (side-by-side)
  custom: '2-column', // Default to 2-column for custom
};

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
 * Supports layout presets via query params.
 */
function UnifiedProjectRoute() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const search = Route.useSearch() as ProjectRouteSearch;

  console.log('[UnifiedProjectRoute] Rendering with:', { projectId, project, layout: search.layout });

  // Determine layout preset from query param OR project settings
  const layoutPreset: LayoutPreset = (search.layout as LayoutPreset) || 'custom';

  return (
    <ProjectContextProvider projectId={projectId}>
      <PluginLayout
        initialPlugins={PLUGIN_PRESETS[layoutPreset]}
        initialLayoutMode={LAYOUT_MODE_PRESETS[layoutPreset]}
      />
    </ProjectContextProvider>
  );
}
