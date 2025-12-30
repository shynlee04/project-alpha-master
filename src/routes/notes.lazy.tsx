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
 * @updated 2025-12-31T00:55:00Z - Fixed SSR with React.lazy
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// SSR-safe lazy import - only loads on client
const NotesPage = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => null });
    }
    return import('@/components/notes/NotesPage').then(mod => ({ default: mod.NotesPage }));
});

// Loading component for Suspense
function NotesPageLoading() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );
}

// Wrapper component with Suspense
function NotesPageWrapper() {
    return (
        <Suspense fallback={<NotesPageLoading />}>
            <NotesPage />
        </Suspense>
    );
}

export const Route = createLazyFileRoute('/notes')({
    component: NotesPageWrapper,
});
