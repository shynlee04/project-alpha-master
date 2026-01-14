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
  * - WorkspaceSwitcher in header allows switching to IDE/Knowledge/Study
  *
  * @epic Epic-26 Intelligent Knowledge Base
  * @story 26-1 BlockNote Editor
  * @story 26-2 Client-Side Embedding Pipeline
  * @story 26-3 "Ask My Notes" RAG Tool
  * @story 26-4 Inline AI Magic
  *
  * ROUTE-004 FIX: Changed from createLazyFileRoute to createFileRoute
  * to support loader pattern instead of useEffect fetch.
  */

import { useEffect, useRef } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';

type NotesSearchParams = { reason?: "mobile-not-supported" | undefined };

// ============================================================================
// Retry Utility for Project Lookup (FIX-2026-01-13: Handle timing issues)
// ============================================================================

async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) {
      if (attempt > 1) {
        console.log(`[NotesRoute] Project found on attempt ${attempt}/${maxRetries}`);
      }
      return fromStore as Project;
    }

    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) {
        return fromFacade as Project;
      }
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      console.log(`[NotesRoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[NotesRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

// ============================================================================
// Route Definition (ROUTE-004 FIX: Using createFileRoute for loader pattern)
// ============================================================================

export const Route = createFileRoute('/notes/$projectId')({
  ssr: false,

  // ROUTE-004 FIX: Use loader only for data fetching (NOT beforeLoad per ADR-034 D12)
  loader: async ({ params }) => {
    const { projectId } = params;
    console.log('[notes.$projectId] Loader called for project:', projectId);

    // Fetch project data with retry logic
    const project = await getProjectWithRetry(projectId, 3, 50);
    if (!project) {
      console.error('[notes.$projectId] Project not found:', projectId);
      throw redirect({ to: '/hub' });
    }

    console.log('[notes.$projectId] Project loaded successfully:', project.id);
    return { project };
  },

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

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      console.log('[NotesRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
