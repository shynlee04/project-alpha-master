/**
 * Notes Route - Lazy Loaded
 *
 * Lazy-loaded route for the Intelligent Knowledge Base ("The Brain").
 * BlockNote editor integration with AI slash commands and RAG retrieval.
 *
 * @epic Epic-26 Intelligent Knowledge Base
 * @story 26-1 BlockNote Editor
 * @story 26-2 Client-Side Embedding Pipeline
 * @story 26-3 "Ask My Notes" RAG Tool
 * @story 26-4 Inline AI Magic
 *
 * @file notes.lazy.tsx
 * @created 2025-12-28T10:00:00Z
 * @updated 2026-01-05 - FIX: Wrap in ProjectProvider to prevent useProjectContext crash
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { NotesPage } from '@/presentation/components/notes/NotesPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';

export const Route = createLazyFileRoute('/notes')({
  component: NotesWorkspace,
});

/**
 * Notes workspace wrapper with ProjectProvider
 * FIX-2026-01-05: Without this, useProjectContext throws when used in child components
 */
function NotesWorkspace() {
  return (
    <ProjectProvider project={null} workspace="notes">
      <NotesPage />
    </ProjectProvider>
  );
}
