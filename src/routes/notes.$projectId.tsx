/**
 * @fileoverview Notes Workspace Route with Project ID
 * @module routes/notes.$projectId
 * @governance Story WB-6: Cross-Workspace Navigation
 *
 * Notes workspace route for a specific project ID.
 * Integrates ProjectProvider for cross-workspace state sharing.
 * Loads BlockNote editor with AI slash commands and RAG retrieval.
 *
 * Route Pattern: /notes/$projectId
 * - ProjectProvider wraps NotesPage with project context
 * - WorkspaceSwitcher in header allow switching to IDE/Knowledge/Study
 *
 * @epic Epic-26 Intelligent Knowledge Base
 * @story 26-1 BlockNote Editor
 * @story 26-2 Client-Side Embedding Pipeline
 * @story 26-3 "Ask My Notes" RAG Tool
 * @story 26-4 Inline AI Magic
 *
 * INF-03 FIX: Added waitForHydration() to fix race condition where
 * loader runs before Zustand store hydration completes.
 */

import { useEffect, useRef } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
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

    // ✅ INF-03 FIX: Wait for Zustand store hydration before querying
    await waitForHydration();
    console.log('[NotesRoute.loader] Hydration complete, querying Dexie...');

    // ✅ INF-03 FIX: Query Dexie directly (not Zustand/getProject facade)
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

  // ARC-A04: Show toast when redirected from IDE (mobile users)
  useEffect(() => {
    if (search?.reason === 'mobile-not-supported' && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info('IDE requires desktop. Opening Notes workspace.', {
        duration: 4000,
        id: 'mobile-redirect-toast',
      });
    }
  }, [search?.reason]);

  console.log('[NotesWorkspace] About to render ProjectProvider with NotesPage');

  return (
    <ProjectProvider project={project as Project | null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
