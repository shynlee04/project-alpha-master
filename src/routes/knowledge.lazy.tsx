/**
 * Knowledge Route - Lazy Loaded
 *
 * Lazy-loaded route for the Knowledge Synthesis Station.
 * Integrated Source Library, Knowledge Canvas, and RAG Panel.
 *
 * @epic Epic-6 Source Ingestion & Management
 * @epic Epic-8 Knowledge Canvas
 * @story 6-2 Source Card UI
 * @story 8-1 React Flow Canvas Setup
 *
 * @file knowledge.lazy.tsx
 * @created 2025-12-30T23:59:00Z
 * @updated 2025-12-31T00:56:00Z - Fixed SSR with React.lazy
 */

import { createLazyFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// SSR-safe lazy import - only loads on client
const KnowledgePage = lazy(() => {
    if (import.meta.env.SSR) {
        return Promise.resolve({ default: () => null });
    }
    return import('@/components/knowledge/KnowledgePage').then(mod => ({ default: mod.KnowledgePage }));
});

// Loading component for Suspense
function KnowledgePageLoading() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );
}

// Wrapper component with Suspense
function KnowledgePageWrapper() {
    return (
        <Suspense fallback={<KnowledgePageLoading />}>
            <KnowledgePage />
        </Suspense>
    );
}

export const Route = createLazyFileRoute('/knowledge')({
    component: KnowledgePageWrapper,
});
