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

import { useEffect } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { ErrorBoundary } from '@/presentation/components/error';

export const Route = createLazyFileRoute('/knowledge/$projectId')({
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
  const { project } = Route.useLoaderData() as { project: Project };

  // Set projectId in workspace store when component mounts
  useEffect(() => {
    if (_projectId) {
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[KnowledgeRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="knowledge">
      <KnowledgePlaceholder />
    </ProjectProvider>
  );
}
