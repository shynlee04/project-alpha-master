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
 * @updated 2025-12-31T00:56:00Z - Fixed SSR with React.lazy
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// SSR-safe lazy import - only loads on client
const StudyPage = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => null });
    }
    return import('@/components/study/StudyPage').then(mod => ({ default: mod.StudyPage }));
});

// Loading component for Suspense
function StudyPageLoading() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );
}

// Wrapper component with Suspense
function StudyPageWrapper() {
    return (
        <Suspense fallback={<StudyPageLoading />}>
            <StudyPage />
        </Suspense>
    );
}

export const Route = createLazyFileRoute('/study')({
    component: StudyPageWrapper,
});
