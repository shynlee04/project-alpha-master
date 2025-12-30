/**
 * Study Route - Study Artifacts (Flashcards & Quizzes)
 *
 * Routes to the Study interface where users can access
 * AI-generated flashcards, quizzes, and study sessions from their sources.
 *
 * @epic Epic-9 Study Artifacts Generation
 * @story 9-5 Study Integration (UI Wiring)
 *
 * @file study.tsx
 * @created 2025-12-30T10:00:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { StudyPage } from '@/components/study/StudyPage';

export const Route = createFileRoute('/study')({
    component: StudyPage,
});
