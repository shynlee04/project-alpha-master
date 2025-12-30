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
 * @updated 2025-12-30T23:59:00Z - Standardized to barrel exports
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { StudyPage } from '@/components/study';

export const Route = createLazyFileRoute('/study')({
    component: StudyPage,
});
