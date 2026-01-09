/**
 * @fileoverview Notes Workspace Route - Uses NotesPage with ProjectFilesPanel
 * @module routes/notes
 * @updated 2026-01-09T17:45:00+07:00
 *
 * FIXED: Now uses NotesPage which includes ProjectFilesPanel in sidebar
 * Phase 1.5 Correction R1: Show files in Notes workspace
 */

import { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';

/**
 * Route definition with ErrorBoundary - Uses NotesPage with default project
 */
export const Route = createLazyFileRoute('/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspaceDefault />
    </ErrorBoundary>
  ),
});

/**
 * Notes workspace wrapper for /notes route - uses default-notes project
 * Loads or creates default project, then renders NotesPage with ProjectFilesPanel
 */
function NotesWorkspaceDefault() {
  const defaultProjectId = 'default-notes';
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Try to get existing default project
    getProject(defaultProjectId).then((p) => {
      if (p) {
        setProject(p as Project | null);
      } else {
        // Create default project if it doesn't exist
        // R1 FIX: Use proper Project type with all required fields
        setProject({
          id: defaultProjectId,
          name: 'Notes',
          folderPath: 'Notes',
          storageType: 'indexeddb',
          createdAt: new Date(),
          lastOpened: new Date(),
          autoSync: false,
          bindings: { notes: true },
          tags: [],
          isTemp: true,
          autoCreated: true,
        } as Project);
      }
    });
  }, [defaultProjectId]);

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (defaultProjectId) {
      useIDEStore.getState().setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Notes workspace...</p>
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
