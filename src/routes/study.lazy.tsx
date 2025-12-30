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
 * @updated 2025-12-31T12:05:00Z - Fixed duplicate route issue
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { StudyPage } from '@/components/study/StudyPage';

export const Route = createLazyFileRoute('/study')({
  component: StudyPage,
});
