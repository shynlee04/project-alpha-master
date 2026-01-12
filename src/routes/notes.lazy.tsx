/**
 * @fileoverview Notes Workspace Route - Uses NotesPage with ProjectFilesPanel
 * @module routes/notes
 * @updated 2026-01-09T17:45:00+07:00
 *
 * FIXED: Now uses NotesPage which includes ProjectFilesPanel in sidebar
 * Phase 1.5 Correction R1: Show files in Notes workspace
 * FS-02: Integrated ProjectRegistry for conflict detection
 */

import { useEffect, useState } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
import { getProject } from '@/lib/workspace/project-store';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
import { ErrorBoundary } from '@/presentation/components/error';
// FS-02: Import ProjectRegistry for conflict detection
import { ProjectRegistry } from '@/domain/services';

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
 * Notes workspace wrapper for /notes route - uses browser-mode project
 * 45-04: Loads or creates browser mode project for all-notes view
 * Loads or creates default project, then renders NotesPage with ProjectFilesPanel
 * FS-02: Registers project in ProjectRegistry to prevent cross-workspace conflicts
 * FS-03: Uses namespaced project ID format: notes:browser-mode
 */
function NotesWorkspaceDefault() {
  // 45-04: Browser mode project ID (shows notes from all projects)
  const browserModeProjectId = 'notes:browser-mode';
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Try to get existing browser mode project
    getProject(browserModeProjectId).then((p) => {
      if (p) {
        setProject(p as Project | null);
      } else {
        // 45-04: Create browser mode project if it doesn't exist
        // Browser mode allows viewing notes from all projects
        setProject({
          id: browserModeProjectId,
          name: 'Browser Mode',
          folderPath: 'Notes', // Uses IndexedDB storage (no file system)
          storageType: 'indexeddb',
          createdAt: new Date(),
          lastOpened: new Date(),
          autoSync: false,
          bindings: { notes: true, knowledge: true },
          tags: [],
          isTemp: true,
          isBrowserMode: true, // 45-04: Special flag for browser mode
          autoCreated: true,
        } as Project);
      }
    });
  }, [browserModeProjectId]);

  // FS-02: Register project in ProjectRegistry to prevent cross-workspace conflicts
  useEffect(() => {
    if (!project) return;

    // Register the project with conflict detection
    const result = ProjectRegistry.register(
      browserModeProjectId,
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
      ProjectRegistry.unregister(browserModeProjectId, 'notes');
    };
  }, [project]);

  // Set projectId in IDE store when component mounts
  useEffect(() => {
    if (browserModeProjectId) {
      useIDEStore.getState().setProjectId(browserModeProjectId);
    }
  }, [browserModeProjectId]);

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
