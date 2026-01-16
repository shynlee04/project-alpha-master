/**
 * @fileoverview Notes Workspace Route - Clean Architecture (Phase 1)
 * @module routes/notes
 * @updated 2026-01-22T12:00:00+07:00
 *
 * PHASE 1 CLEANUP:
 * - Removed browser-mode pseudo-project
 * - All users without projects are redirected to hub
 * - Platform-aware routing: Desktop with FSA shows picker, others go to hub
 * - Clean routing: /notes (no project) → hub, /notes/$projectId → Notes workspace
 */

import { useEffect, useState, useRef } from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { ProjectPickerDialog } from '@/presentation/components/hub/ProjectPickerDialog';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { ProjectRegistry } from '@/domain/services';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { db } from '@/infrastructure/persistence/dexie-db';
import { useBrowserModeProject } from '@/infrastructure/persistence/stores/project/use-fsa-projects';
import { useNoteStore } from '@/lib/notes/note-store';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide/useIDEStore';
import { ErrorBoundary } from '@/presentation/components/error';

/**
 * Route definition with ErrorBoundary
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
 * Phase 1: Desktop with FSA shows picker, all others redirect to hub
 */
function NotesWorkspaceDefault() {
  const navigate = useNavigate();
  const platform = getPlatformContract();
  const [project, setProject] = useState<Project | null>(null);
  const welcomeNoteCreatedRef = useRef(false);

  // ⚠️ DEPRECATED: useBrowserModeProject will be removed in Phase 4
  // Currently keeping for data migration compatibility
  const browserProject = useBrowserModeProject();

  // Desktop with FSA → show project picker for FSA projects
  if (platform.canAccessFSA) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <ProjectPickerDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              // User closed picker without selecting - go to hub
              navigate({ to: '/hub' });
            }
          }}
          targetWorkspace="notes"
          onCreateNew={() => {
            // Navigate to hub to create project
            navigate({ to: '/hub', search: { action: 'create-project' } });
          }}
        />
      </div>
    );
  }

  // Mobile/tablet without FSA → redirect to hub to create project
  // Browser-mode pseudo-project is deprecated
  useEffect(() => {
    // If browser project exists (legacy migration), use it temporarily
    // But redirect to hub for new project creation
    if (browserProject) {
      console.warn('[DEPRECATED] Browser-mode project is deprecated. Please create a real project via hub.');
      setProject(browserProject);

      // Create welcome note if needed (migration compatibility)
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
    } else {
      // No browser-mode project - redirect to hub to create a real project
      navigate({ to: '/hub', search: { action: 'create-project', workspace: 'notes' } });
    }
  }, [browserProject, navigate]);

  // Register project in ProjectRegistry to prevent cross-workspace conflicts
  useEffect(() => {
    if (!project) return;

    const result = ProjectRegistry.register(
      project.id,
      project.folderPath,
      'notes'
    );

    if (!result.success && result.conflict?.hasConflict) {
      console.warn(
        `[ProjectRegistry] Folder conflict detected: "${project.folderPath}" ` +
        `already open in ${result.conflict.existingWorkspaceType}`
      );
    }

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
