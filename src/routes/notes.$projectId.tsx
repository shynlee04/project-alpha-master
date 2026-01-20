/**
 * @fileoverview Notes Workspace Route with Project ID - MIGRATED TO NEW ARCHITECTURE
 * @module routes/notes.$projectId
 * @governance Story ARCH-02-04: Migrate to Project-Centric Architecture
 *
 * MIGRATED: This route now uses new ProjectContextProvider from @/infrastructure/context
 * instead of old ProjectProvider from @/lib/workspace.
 *
 * Changes:
 * - Import ProjectContextProvider from @/infrastructure/context
 * - Remove ProjectProvider import from @/lib/workspace/ProjectContext
 * - Wrap NotesPage in ProjectContextProvider
 * - Integrate FileTree plugin.MainComponent
 *
 * This proves ADR-034 architecture works for notes workspace.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-04
 * @team Team A
 * @created 2026-01-21
 */

import { useEffect, useRef } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectContextProvider } from '@/infrastructure/context/project-context';
import { fileTreePlugin } from '@/plugins/filetree';
import type { Project } from '@/domain/entities/project';
import { ErrorBoundary } from '@/presentation/components/error';
import { db } from '@/infrastructure/persistence/dexie-db';
import { waitForHydration } from '@/infrastructure/persistence/stores/project/wait-for-hydration';
import { fromRecord } from '@/infrastructure/persistence/stores/project/project-crud-slice';

type NotesSearchParams = { reason?: "mobile-not-supported" | undefined };

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute('/notes/$projectId')({
  ssr: false,

  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[NotesRoute.loader] Loading project:', projectId);

    // Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[NotesRoute.loader] Hydration complete, querying Dexie...');

    // Query Dexie directly (not Zustand/getProject facade)
    const record = await db.projects.get(projectId);

    if (!record) {
      console.error('[NotesRoute.loader] Project not found in Dexie:', projectId);
      throw redirect({ to: '/hub' });
    }

    // Convert record to Project type using fromRecord for proper defaults
    const project = fromRecord(record);
    console.log('[NotesRoute.loader] Project found:', { id: project.id, name: project.name, storageType: project.storageType });
    return { project };
  },
  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

function NotesWorkspace() {
  console.log('[NotesWorkspace] Component rendering...');

  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const search = Route.useSearch() as NotesSearchParams;
  const toastShownRef = useRef(false);

  console.log('[NotesWorkspace] Data loaded:', { projectId: _projectId, project, search });

  // Show toast when redirected from IDE (mobile users)
  useEffect(() => {
    if (search?.reason === 'mobile-not-supported' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info('IDE requires desktop. Opening Notes workspace.', {
        duration: 4000,
        id: 'mobile-redirect-toast',
      });
    }
  }, [search?.reason]);

  console.log('[NotesWorkspace] About to render ProjectContextProvider with NotesPage and FileTree');

  // ============================================================================
  // Render with NEW ProjectContextProvider (ARCH-02-04 migration)
  // ============================================================================

  return (
    // MIGRATION: Use ProjectContextProvider from new architecture
    <ProjectContextProvider projectId={project.id}>
      <div className="flex h-full">
        {/* MIGRATION: Integrate FileTree plugin.MainComponent */}
        <div className="w-64 border-r border-border/30 shrink-0 overflow-hidden flex flex-col">
          <div className="text-xs font-semibold px-3 py-2 border-b border-border/30 bg-card/30">
            File Tree
          </div>
          <div className="flex-1 overflow-auto">
            <fileTreePlugin.MainComponent
              width={256}
              height={window.innerHeight - 32} // Subtract header height
            />
          </div>
        </div>

        {/* Notes Editor (existing NotesPage) */}
        <div className="flex-1 overflow-auto">
          <NotesPage />
        </div>
      </div>
    </ProjectContextProvider>
  );
}
