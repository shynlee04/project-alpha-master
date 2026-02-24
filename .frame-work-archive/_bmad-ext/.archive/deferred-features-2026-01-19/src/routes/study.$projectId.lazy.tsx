/**
  * @fileoverview Study Workspace Route with Project ID
  * @module routes/study.$projectId
  * @governance Story WB-6: Cross-Workspace Navigation
  *
  * Study workspace route for a specific project ID.
  * Integrates ProjectProvider for cross-workspace state sharing.
  * Loads study interface with flashcards, quizzes, and learning analytics.
  *
  * Route Pattern: /study/$projectId
  * - ProjectProvider wraps StudyPage with project context
  * - WorkspaceSwitcher in header allows switching to IDE/Notes/Knowledge
  *
  * @epic Future: Knowledge Synthesis Station
  */

import { useEffect } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';
import { ErrorBoundary } from '@/presentation/components/error';

export const Route = createLazyFileRoute('/study/$projectId')({
  component: () => (
    <ErrorBoundary>
      <StudyWorkspace />
    </ErrorBoundary>
  ),
});

// Placeholder component (Study workspace not implemented yet)
function StudyPlaceholder() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6 border-2 border-border rounded-lg">
        <h1 className="text-2xl font-pixel text-primary">🎓 Study Workspace</h1>
        <p className="text-muted-foreground">
          Study workspace coming soon.
        </p>
        <p className="text-sm text-muted-foreground">
          This workspace will provide flashcards, quizzes, and learning analytics.
        </p>
      </div>
    </div>
  );
}

function StudyWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const { project } = Route.useLoaderData() as { project: Project };

  // Set projectId in workspace store when component mounts
  useEffect(() => {
    if (_projectId) {
      useWorkspaceStore.getState().setCurrentProject(_projectId);
      console.log('[StudyRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId]);

  return (
    <ProjectProvider project={project as Project | null} workspace="study">
      <StudyPlaceholder />
    </ProjectProvider>
  );
}
