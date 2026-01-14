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
  * @note createLazyFileRoute only supports component, errorComponent, 
  *       pendingComponent, notFoundComponent. beforeLoad/loader not supported.
  *       Notes is accessible on ALL platforms per ADR-033, no guard needed.
  */

import { useEffect, useState, useRef } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';
import type { NotesSearchParams } from './notes.$projectId';

// ============================================================================
// Retry Utility for Project Lookup (FIX-2026-01-13: Handle timing issues)
// ============================================================================

/**
  * Retry getting a project with exponential backoff
  * Handles timing issues between project creation and route guard execution
  */
async function getProjectWithRetry(
  projectId: string,
  maxRetries: number = 3,
  baseDelayMs: number = 50
): Promise<Project | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Try getting from Zustand store first (fastest)
    const fromStore = useProjectStore.getState().getProject(projectId);
    if (fromStore) {
      if (attempt > 1) {
        console.log(`[NotesRoute] Project found on attempt ${attempt}/${maxRetries}`);
      }
      return fromStore as Project;
    }

    // Fallback to facade (handles Dexie lookup)
    try {
      const fromFacade = await getProject(projectId);
      if (fromFacade) {
        return fromFacade as Project;
      }
    } catch (error) {
      lastError = error as Error;
    }

    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`[NotesRoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[NotesRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

// ============================================================================
// Route Definition (Lazy - only component options allowed)
// ============================================================================

export const Route = createLazyFileRoute('/notes/$projectId')({
  // Notes accessible on ALL platforms per ADR-033 - no beforeLoad guard needed
  // Project lookup handled in component via useEffect with retry logic
  component: () => (
    <ErrorBoundary>
      <NotesWorkspace />
    </ErrorBoundary>
  ),
});

function NotesWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const search = Route.useSearch() as NotesSearchParams;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    getProjectWithRetry(_projectId)
      .then((p) => {
        if (p) {
          setProject(p as Project);
        } else {
          setLoadError(`Project not found: ${_projectId}`);
        }
      })
      .catch((error) => {
        setLoadError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [_projectId]);

  // Set projectId in IDE store when component mounts
  // Using getState() to avoid infinite loop (selector returns new ref each render)
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      console.log('[NotesRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  // FIX TB-14: Show loading state while project is being fetched
  // This prevents NotesPage from seeing project=null and falling back to 'default'
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  // FIX TB-14: If project not found after loading, show error
  if (!project || loadError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">
            {loadError || `Project not found: ${_projectId}`}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Available: {Object.keys(useProjectStore.getState().projects).join(', ') || 'none'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProjectProvider project={project} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
