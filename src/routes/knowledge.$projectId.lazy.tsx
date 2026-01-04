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
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

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

export const Route = createLazyFileRoute('/knowledge/$projectId')({
  component: KnowledgeWorkspace,
});

function KnowledgeWorkspace() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    getProject(projectId).then((p) => setProject(p as Project | null));
  }, [projectId]);

  return (
    <ProjectProvider project={project} workspace="knowledge">
      <KnowledgePlaceholder />
    </ProjectProvider>
  );
}
