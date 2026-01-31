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
import { createLazyFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { ErrorBoundary } from '@/presentation/components/error';

type NotesSearchParams = { reason?: "mobile-not-supported" | undefined };

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createLazyFileRoute('/notes/$projectId')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

function NotesWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();
  const search = Route.useSearch() as NotesSearchParams;
  const toastShownRef = useRef(false);

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

  return (
    <ProjectProvider project={project as Project | null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
