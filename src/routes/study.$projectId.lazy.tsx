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

import { createLazyFileRoute } from '@tanstack/react-router';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';

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

export const Route = createLazyFileRoute('/study/$projectId')({
  ssr: false,
  // Loader: Fetch project metadata for ProjectProvider
  loader: async ({ params }: { params: { projectId: string } }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: StudyWorkspace,
});

function StudyWorkspace() {
  const { project } = Route.useLoaderData();

  return (
    <ProjectProvider project={project} workspace="study">
      <StudyPlaceholder />
    </ProjectProvider>
  );
}
