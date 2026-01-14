/**
 * @fileoverview Notes Workspace Route - Uses NotesPage with ProjectFilesPanel
 * @module routes/notes
 * @updated 2026-01-09T17:45:00+07:00
 *
 * FIXED: Now uses NotesPage which includes ProjectFilesPanel in sidebar
 * Phase 1.5 Correction R1: Show files in Notes workspace
 * FS-02: Integrated ProjectRegistry for conflict detection
 */

import { useEffect, useState, useRef } from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';
// getProject import removed - now using getOrCreateBrowserModeProject from browser-mode.ts
import { useNoteStore } from '@/lib/notes';
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
 * TEAM-A-2026-01-12: Auto-creates default_note for browser-mode projects
 * BUG-FIX-2026-01-19: Fixed welcome note duplication on reload
 */
function NotesWorkspaceDefault() {
    // 45-04: Browser mode project ID (shows notes from all projects)
    const browserModeProjectId = 'notes:browser-mode';
    const [project, setProject] = useState<Project | null>(null);
    // BUG-FIX: Track if welcome note creation was attempted this session
    const welcomeNoteCreatedRef = useRef(false);

    useEffect(() => {
        // BUG-FIX-2026-01-19: Use getOrCreateBrowserModeProject which handles persistence correctly
        // Import the utility that properly persists to Dexie
        import('@/lib/workspace/browser-mode').then(async ({ getOrCreateBrowserModeProject, BROWSER_MODE_PROJECT_ID }) => {
            const browserProject = await getOrCreateBrowserModeProject();
            
            if (browserProject) {
                setProject(browserProject);
                
                // BUG-FIX-2026-01-19: Check if notes already exist BEFORE creating welcome note
                // This prevents duplicate welcome notes on reload
                if (!welcomeNoteCreatedRef.current) {
                    welcomeNoteCreatedRef.current = true;
                    
                    // Dynamically import db to check for existing notes
                    const { db } = await import('@/infrastructure/persistence/dexie-db');
                    const existingNotes = await db.notes
                        .where('projectId')
                        .equals(BROWSER_MODE_PROJECT_ID)
                        .count();
                    
                    if (existingNotes === 0) {
                        // No notes exist - create the welcome note
                        // BUG-FIX: Get store methods INSIDE the effect (not outside)
                        const createNote = useNoteStore.getState().createNote;
                        const setActiveNote = useNoteStore.getState().setActiveNote;
                        
                        console.log('[NotesWorkspaceDefault] No notes found, creating welcome note...');
                        try {
                            const defaultNoteId = await createNote({
                                title: 'Welcome to Notes',
                                emoji: '👋',
                                blocks: [
                                    {
                                        id: crypto.randomUUID(),
                                        type: 'paragraph',
                                        content: [
                                            { type: 'text', text: 'Welcome to Notes! This is your default note to get started.', styles: {} }
                                        ],
                                        props: { textAlignment: 'left', textColor: 'default', backgroundColor: 'default' },
                                        children: []
                                    },
                                    {
                                        id: crypto.randomUUID(),
                                        type: 'paragraph',
                                        content: [
                                            { type: 'text', text: 'Start writing, create new notes, or import markdown files from your device.', styles: {} }
                                        ],
                                        props: { textAlignment: 'left', textColor: 'default', backgroundColor: 'default' },
                                        children: []
                                    },
                                    {
                                        id: crypto.randomUUID(),
                                        type: 'paragraph',
                                        content: [
                                            { type: 'text', text: '💡 Tip: Use the sidebar to navigate between notes and access AI-powered features.', styles: {} }
                                        ],
                                        props: { textAlignment: 'left', textColor: 'default', backgroundColor: 'default' },
                                        children: []
                                    }
                                ] as unknown as import('@blocknote/core').Block[],
                            });
                            
                            // Select the default_note as active
                            setActiveNote(defaultNoteId);
                            console.log('[NotesWorkspaceDefault] Created and selected welcome note:', defaultNoteId);
                        } catch (error) {
                            console.error('[NotesWorkspaceDefault] Failed to create welcome note:', error);
                        }
                    } else {
                        console.log(`[NotesWorkspaceDefault] Found ${existingNotes} existing note(s), skipping welcome note creation`);
                    }
                }
            } else {
                console.error('[NotesWorkspaceDefault] Failed to get/create browser mode project');
            }
        });
    }, [browserModeProjectId]); // BUG-FIX: Removed createNote/setActiveNote from deps - they're fetched inside

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
