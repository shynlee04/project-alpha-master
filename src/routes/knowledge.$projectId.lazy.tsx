/**
  * @fileoverview Knowledge Workspace Route with Project ID
  * @module routes/knowledge.$projectId
  * @governance Story WB-6: Cross-Workspace Navigation
  *
  * Knowledge workspace route for a specific project ID.
  * Integrates ProjectProvider for cross-workspace state sharing.
  * Loads knowledge canvas with RAG retrieval and study artifacts.
  *
  * Route Pattern: /knowledge/$projectId
  * - ProjectProvider wraps KnowledgePage with project context
  * - WorkspaceSwitcher in header allows switching to IDE/Notes/Study
  *
  * @epic Future: Knowledge Synthesis Station
  */

import { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { ErrorBoundary } from '@/presentation/components/error';

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
        console.log(`[KnowledgeRoute] Project found on attempt ${attempt}/${maxRetries}`);
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
      console.log(`[KnowledgeRoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[KnowledgeRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

// Placeholder component (Knowledge workspace not implemented yet)
function KnowledgePlaceholder() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border-2 border-border rounded-lg">
        <h1 className="text-2xl font-pixel text-primary">📚 Knowledge Workspace</h1>
        <p className="text-muted-foreground">
          Knowledge synthesis workspace coming soon.
        </p>
        <p className="text-sm text-muted-foreground">
          This workspace will provide RAG retrieval, knowledge canvas, and study artifact generation.
        </p>
      </div>
    </div>
  );
}

/**
  * Route definition with ErrorBoundary protection
  * @courseCorrection Story A-2 - Add ErrorBoundary to workspace routes
  * @added 2026-01-07
  */
export const Route = createLazyFileRoute('/knowledge/$projectId')({
  component: () => (
    <ErrorBoundary>
      <KnowledgeWorkspace />
    </ErrorBoundary>
  ),
});

function KnowledgeWorkspace() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getProjectWithRetry(projectId)
      .then((p) => {
        setProject(p as Project | null);
        if (!p) {
          setLoadError(`Project not found: ${projectId}`);
        }
      })
      .catch((error) => {
        setLoadError(error.message);
      });
  }, [projectId]);

  if (loadError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center text-destructive">
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectProvider project={project} workspace="knowledge">
      <KnowledgePlaceholder />
    </ProjectProvider>
  );
}
