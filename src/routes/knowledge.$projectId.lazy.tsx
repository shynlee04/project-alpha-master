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
  *
  * ROUTE-012 FIX: Changed from createLazyFileRoute to createFileRoute
  * to support loader pattern instead of useEffect fetch.
  */

import { useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/infrastructure/persistence/stores/project';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';

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
        console.log(`[KnowledgeRoute] Project found on attempt ${attempt}/${maxRetries}`);
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
      console.log(`[KnowledgeRoute] Project not found, attempt ${attempt}/${maxRetries}, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.error(`[KnowledgeRoute] Project not found after ${maxRetries} attempts:`, projectId, lastError);
  return null;
}

// ============================================================================
// Route Definition (ROUTE-012 FIX: Using createFileRoute for loader pattern)
// ============================================================================

export const Route = createFileRoute('/knowledge/$projectId')({
  ssr: false,

  // ROUTE-012 FIX: Use beforeLoad to fetch project BEFORE component renders
  beforeLoad: async ({ params }) => {
    const project = await getProjectWithRetry(params.projectId);
    if (!project) {
      console.error('[KnowledgeRoute] Project not found:', params.projectId);
      throw redirect({ to: '/hub' });
    }
    return { project };
  },

  // Loader returns empty - project already fetched in beforeLoad
  loader: () => {
    return {};
  },

  component: () => (
    <ErrorBoundary>
      <KnowledgeWorkspace />
    </ErrorBoundary>
  ),
});

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

function KnowledgeWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (_projectId) {
      useIDEStore.getState().setProjectId(_projectId);
      console.log('[KnowledgeRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="knowledge">
      <KnowledgePlaceholder />
    </ProjectProvider>
  );
}
