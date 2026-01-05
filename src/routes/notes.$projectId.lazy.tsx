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

import { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';

export const Route = createLazyFileRoute('/notes/$projectId')({
  component: NotesWorkspace,
});

function NotesWorkspace() {
  const { projectId: _projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const setProjectId = useIDEStore((s) => s.setProjectId);

  useEffect(() => {
    getProject(_projectId).then((p) => setProject(p as Project | null));
  }, [_projectId]);

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (_projectId) {
      setProjectId(_projectId);
      console.log('[NotesRoute] Project ID set in store:', _projectId);
    }
  }, [_projectId, setProjectId]);

  return (
    <ProjectProvider project={project} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
