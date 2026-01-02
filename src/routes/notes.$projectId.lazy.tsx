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
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import { WorkspaceProvider } from '@/infrastructure/persistence/stores/workspace';

export const Route = createLazyFileRoute('/notes/$projectId')({
  // Loader: Fetch project metadata for ProjectProvider
  loader: async ({ params }: { params: { projectId: string } }) => {
    const project = await getProject(params.projectId);
    return { project };
  },
  component: NotesWorkspace,
});

function NotesWorkspace() {
  const { project } = Route.useLoaderData();

  return (
    <ProjectProvider project={project} workspace="notes">
      <WorkspaceProvider initialWorkspace="notes" initialProjectId={project?.id}>
        <NotesPage />
      </WorkspaceProvider>
    </ProjectProvider>
  );
}
