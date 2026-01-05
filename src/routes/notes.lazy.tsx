/**
 * Notes Route - Lazy Loaded
 *
 * IMPORTANT: Notes workspace REQUIRES a project. Notes are stored as synced files
 * in the project folder (Markdown files), NOT in local browser storage.
 *
 * This route redirects to Hub if no project is selected, showing a project picker.
 *
 * User flow:
 * 1. User clicks Notes from sidebar without selecting project
 * 2. Redirects to /hub?workspace=notes
 * 3. Hub shows project picker dialog (only showing projects with Notes enabled)
 * 4. User selects project → navigates to /notes/$projectId
 *
 * @epic Epic-26 Intelligent Knowledge Base
 * @story 26-1 BlockNote Editor
 * @story 26-2 Client-Side Embedding Pipeline
 * @story 26-3 "Ask My Notes" RAG Tool
 * @story 26-4 Inline AI Magic
 *
 * @file notes.lazy.tsx
 * @created 2025-12-28T10:00:00Z
 * @updated 2026-01-06 - FIX: Remove standalone mode, require project for synced notes only
 */

import { createLazyFileRoute, redirect } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/notes')({
  loader: async () => {
    // Check if any projects exist with Notes workspace enabled
    const projects = await db.projects.toArray();
    const projectsWithNotes = projects.filter(p => 
      (p.bindings as any)?.notes === true
    );

    if (projectsWithNotes.length === 0) {
      // No projects with Notes enabled - redirect to Hub
      throw redirect({
        to: '/hub',
        search: {
          action: 'create-project',
          workspace: 'notes',
          message: 'Mount a project and enable Notes workspace to use this feature.'
        }
      });
    }

    return { projectCount: projectsWithNotes.length };
  },
  component: NotesRedirect,
});

function NotesRedirect() {
  const data = Route.useLoaderData();
  const projects = useLiveQuery(() => db.projects.toArray());
  
  useEffect(() => {
    if (projects) {
      const projectsWithNotes = projects.filter(p => 
        (p.bindings as any)?.notes === true
      );
      
      if (projectsWithNotes.length === 0) {
        // No projects with Notes enabled
        throw redirect({
          to: '/hub',
          search: {
            workspace: 'notes',
            message: 'No projects have Notes workspace enabled.'
          }
        });
      }
      
      // Multiple projects with Notes - show picker
      throw redirect({
        to: '/hub',
        search: { workspace: 'notes' }
      });
    }
  }, [projects]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Checking projects...</p>
      </div>
    </div>
  );
}
