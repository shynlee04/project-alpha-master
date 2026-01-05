/**
 * Study Route - Lazy Loaded
 *
 * Lazy-loaded route for Study Artifacts Generation.
 * AI-generated flashcards, quizzes, and study sessions from knowledge sources.
 *
 * @epic Epic-9 Study Artifacts Generation
 * @story 9-1 Flashcard Generator
 * @story 9-2 Quiz Generator
 * @story 9-3 Flashcard Study Interface
 * @story 9-4 Quiz Taking Interface
 * @story 9-5 Study Integration
 *
 * @file study.lazy.tsx
 * @created 2025-12-30T10:00:00Z
 * @updated 2026-01-05 - FIX: Wrap in ProjectProvider to prevent useProjectContext crash
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { StudyPage } from '@/presentation/components/study/StudyPage';
import { ProjectProvider } from '@/lib/workspace/ProjectContext';

export const Route = createLazyFileRoute('/study')({
  component: StudyWorkspace,
});

/**
 * Study workspace wrapper with ProjectProvider
 * FIX-2026-01-05: Without this, useProjectContext throws when used in child components
 */
function StudyWorkspace() {
  return (
    <ProjectProvider project={null} workspace="study">
      <StudyPage />
    </ProjectProvider>
  );
}
