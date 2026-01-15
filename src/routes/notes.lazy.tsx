/**
 * @fileoverview Notes Workspace Route - Desktop FSA picker, Mobile browser-mode
 * @module routes/notes
 * @updated 2026-01-21T11:00:00+07:00
 * CC-V2-A01: Desktop shows FSA project picker, mobile uses browser-mode
 */

import { useEffect, useState, useRef } from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { ProjectRegistry } from '@/domain/services';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { db } from '@/infrastructure/persistence/dexie-db';
import { useFSAProjects, useBrowserModeProject } from '@/infrastructure/persistence/stores/project/use-fsa-projects';
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
 * Notes workspace wrapper for /notes route
 * CC-V2-A01: Desktop shows FSA project picker, mobile uses browser-mode
 */
function NotesWorkspaceDefault() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [project, setProject] = useState<Project | null>(null);
  const welcomeNoteCreatedRef = useRef(false);

  // ✅ ALWAYS call hooks at TOP LEVEL (no conditional)
  const fsaProjects = useFSAProjects();
  const browserProject = useBrowserModeProject();

  // CC-01-01: Desktop with FSA → show project picker directly
  if (platform.canAccessFSA) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <ProjectPickerDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              // User closed picker without selecting - go to hub
              navigate({ to: '/' });
            }
          }}
          targetWorkspace="notes"
          onCreateNew={() => {
            // Navigate to hub to create project
            navigate({ to: '/' });
          }}
        />
      </div>
    );
  }

  // Mobile/tablet → use browser-mode (IndexedDB)
  useEffect(() => {
    if (!browserProject) return;

    setProject(browserProject);

    if (!welcomeNoteCreatedRef.current) {
      welcomeNoteCreatedRef.current = true;

      const checkAndCreateWelcomeNote = async () => {
        const BROWSER_MODE_PROJECT_ID = 'proj_browser-default';
        const existingNotes = await db.notes
          .where('projectId')
          .equals(BROWSER_MODE_PROJECT_ID)
          .count();

        if (existingNotes === 0) {
          const createNote = useNoteStore.getState().createNote;
          const setActiveNote = useNoteStore.getState().setActiveNote;

          const defaultNoteId = await createNote({
            title: 'Welcome to Notes',
            emoji: '👋',
            blocks: [
              {
                id: crypto.randomUUID(),
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Welcome to Notes! This is your default note.',
                    styles: {},
                  },
                ],
                props: {
                  textAlignment: 'left',
                  textColor: 'default',
                  backgroundColor: 'default',
                },
                children: [],
              },
            ] as unknown as import('@blocknote/core').Block[],
          });

          setActiveNote(defaultNoteId);
        }
      };

      checkAndCreateWelcomeNote();
    }
  }, [browserProject]);

  // FS-02: Register project in ProjectRegistry to prevent cross-workspace conflicts
  useEffect(() => {
    if (!project) return;

    // Register the project with conflict detection
    const result = ProjectRegistry.register(
      project.id,
      project.folderPath,
      'notes' // workspaceType
    );

    if (!result.success && result.conflict?.hasConflict) {
      console.warn(
        `[ProjectRegistry] Folder conflict detected: "${project.folderPath}" ` +
        `already open in ${result.conflict.existingWorkspaceType}`
      );
    }

    // Cleanup: unregister when component unmounts
    return () => {
      ProjectRegistry.unregister(project.id, 'notes');
    };
  }, [project]);

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (project?.id) {
      useIDEStore.getState().setProjectId(project.id);
    }
  }, [project?.id]);

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
