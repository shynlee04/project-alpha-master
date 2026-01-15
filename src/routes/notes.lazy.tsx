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
import { useNoteStore } from '@/lib/notes';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';
import { ProjectRegistry } from '@/domain/services';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { ProjectPickerDialog } from '@/presentation/components/hub/ProjectPickerDialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';

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
  const [showPicker, setShowPicker] = useState(false);
  const welcomeNoteCreatedRef = useRef(false);

  // Check for existing FSA projects with notes binding
  const fsaProjects = useLiveQuery(async () => {
    if (!platform.canAccessFSA) return [];
    const allProjects = await db.projects.toArray();
    return allProjects.filter(
      (p) => p.storageType === 'fsa' && p.workspaceBindings?.notes === true
    );
  }, [platform.canAccessFSA]);

  useEffect(() => {
    // CC-V2-A01: Desktop with FSA → show picker or recent projects
    if (platform.canAccessFSA) {
      // If we have FSA projects, show picker
      if (fsaProjects && fsaProjects.length > 0) {
        setShowPicker(true);
      } else {
        // No FSA projects - show picker to create one
        setShowPicker(true);
      }
      return;
    }

    // Mobile/tablet → use browser-mode (IndexedDB)
    import('@/lib/workspace/browser-mode').then(
      async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
        const browserProject = await getOrCreateBrowserModeProject();

        if (browserProject) {
          setProject(browserProject);

          if (!welcomeNoteCreatedRef.current) {
            welcomeNoteCreatedRef.current = true;

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
          }
        }
      }
    );
  }, [platform.canAccessFSA, fsaProjects]);

  // Desktop: Show project picker dialog
  if (platform.canAccessFSA && showPicker) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <ProjectPickerDialog
          open={true}
          onOpenChange={(open) => {
            if (!open && !project) {
              // User closed picker without selecting - go to hub
              navigate({ to: '/' });
            }
            setShowPicker(open);
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
