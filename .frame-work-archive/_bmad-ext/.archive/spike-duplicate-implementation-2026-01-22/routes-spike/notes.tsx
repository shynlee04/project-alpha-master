/**
 * @fileoverview Notes Workspace Route - Spike Mirror Copy
 * @module routes/spike/notes
 * @updated 2026-01-22T16:40:00+07:00
 *
 * ============================================================================
 * @spike-copy-source: src/routes/notes.lazy.tsx (main app)
 * ============================================================================
 *
 * PHASE 3 MIRROR COPY:
 * - Exact copy of main app notes route implementation
 * - Platform-aware routing: Desktop with FSA shows picker, others go to hub
 * - Full component logic for state management, file sync, project registry
 *
 * Route Pattern: /spike/notes
 * - Desktop with FSA: Show project picker for FSA projects
 * - Mobile/tablet without FSA: Redirect to hub to create project
 * - Browser-mode pseudo-project deprecated
 *
 * ============================================================================
 * @spike-copy-notes
 * This code copied from main app to provide isolated testing environment
 * Contains platform guards, state management, file system operations
 *
 * Current Issues (to be documented):
 *   1. Direct Dexie access in presentation layer (P0)
 *      - Line 88-91: await db.notes.where().equals().count()
 *      - Should use: Store hooks or service layer
 *      - Remediation: Create repository layer, eliminate direct DB access
 *
 *   2. PlatformContract already used (✅)
 *      - Line 44: const platform = getPlatformContract();
 *      - This is correct per ADR-033 D1
 *
 *   3. Deprecated browser-mode project (P1)
 *      - Lines 48-50: useBrowserModeProject()
 *      - Issue: Temporary workaround for data migration
 *      - Remediation: Remove browser-mode, migrate to real projects
 *
 *   4. Cross-workspace state synchronization (P1)
 *      - Line 156-160: useIDEStore.getState().setProjectId(project.id)
 *      - Issue: Notes watches IDE store for project changes
 *      - Remediation: Use event bus for cross-workspace communication (Phase 4)
 *
 * ADR-033 Compliance Score: 7/10 (Improved)
 *   ✅ Composite keys properly implemented
 *   ✅ FSA handle persistence implemented
 *   ✅ Auto-detection of storage type implemented
 *   ✅ PlatformContract used by route
 *   ❌ Deprecated browser-mode still present
 *   ❌ Cross-workspace state coupling
 *   ❌ Presentation layer may have direct Dexie access (in NotesPage)
 *   ❌ StorageGateway not used by presentation layer (in NotesPage)
 *
 * REMEDIATION PRIORITY: P0 (address after routing works)
 *   - R1: Eliminate Direct Dexie Access in NotesPage (6 hours)
 *   - R2: Eliminate Direct FSA API Calls (10 hours)
 *   - R3: Remove Deprecated Browser-Mode (2 hours)
 *   - R5: Eliminate Reactive State Duplication (6 hours)
 *   - R7: Decouple Cross-Workspace State (4 hours)
 *
 * ============================================================================
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/spike/components/notes/NotesPage';
import { ProjectProvider } from '@/spike/lib/workspace/ProjectContext';
import { ProjectPickerDialog } from '@/spike/components/common/ProjectPickerDialog';
import type { Project } from '@/spike/infrastructure/persistence/stores/project/project-types';
import { ProjectRegistry } from '@/spike/domain/services';
import { getPlatformContract } from '@/spike/infrastructure/filesystem/platform-contract';
import { db } from '@/spike/infrastructure/persistence/dexie-db';
import { useBrowserModeProject } from '@/spike/infrastructure/persistence/stores/project/use-fsa-projects';
import { useNoteStore } from '@/spike/lib/notes/note-store';
import { useIDEStore } from '@/spike/stores/useIDEStore';
import { ErrorBoundary } from '@/spike/components/common/ErrorBoundary';

/**
 * Route definition with ErrorBoundary
 */
export const Route = createFileRoute('/spike/notes')({
  component: () => (
    <ErrorBoundary>
      <NotesWorkspaceDefault />
    </ErrorBoundary>
  ),
});

/**
 * Notes workspace wrapper for /spike/notes route
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
              navigate({ to: '/' });
            }
          }}
          targetWorkspace="notes"
          onCreateNew={() => {
            // Navigate to hub to create project
            navigate({ to: '/spike/create', search: { action: 'create-project', workspace: 'notes' } });
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
      console.warn('[SPIKE DEPRECATED] Browser-mode project is deprecated. Please create a real project via hub.');
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
      navigate({ to: '/spike/create', search: { action: 'create-project', workspace: 'notes' } });
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
        `[SPIKE ProjectRegistry] Folder conflict detected: "${project.folderPath}" ` +
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
