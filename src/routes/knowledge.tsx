/**
 * Knowledge Route - Knowledge Synthesis Hub
 *
 * Routes to the Knowledge Synthesis Station (Concept Phase).
 * Placeholder for Phase 2 implementation.
 *
 * @file knowledge.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles } from 'lucide-react';

export const Route = createFileRoute('/knowledge')({
    component: KnowledgePage,
});

function KnowledgePage() {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-primary" size={32} />
                    <h1 className="text-3xl font-bold font-mono text-foreground">
                        Knowledge Synthesis Hub
                    </h1>
                </div>

                {/* Coming Soon Placeholder */}
                <div className="border-2 border-border rounded-none p-8 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] text-center">
                    <Sparkles className="mx-auto text-primary mb-4" size={64} />
                    <h2 className="text-2xl font-bold font-mono text-foreground mb-2">
                        Coming Soon
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        The Knowledge Synthesis Station is currently in concept phase.
                        This will be your central hub for organizing, synthesizing, and
                        leveraging knowledge across your projects and AI agents.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
