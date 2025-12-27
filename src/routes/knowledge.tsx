/**
 * Knowledge Route - Knowledge Synthesis Hub
 *
 * Routes to the Knowledge Synthesis Station (Concept Phase).
 * Placeholder for Phase 2 implementation.
 *
 * @epic Epic-MRT Mobile Responsive Transformation  
 * @story MRT-9 Dashboard Responsive
 * 
 * @file knowledge.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useMediaQuery';

export const Route = createFileRoute('/knowledge')({
    component: KnowledgePage,
});

function KnowledgePage() {
    // MRT-9: Mobile responsive detection
    const { isMobile } = useDeviceType();

    return (
        <MainLayout>
            <div className={cn(
                'max-w-4xl mx-auto',
                isMobile ? 'p-4' : 'p-6'
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-primary" size={isMobile ? 24 : 32} />
                    <h1 className={cn(
                        'font-bold font-mono text-foreground',
                        isMobile ? 'text-xl' : 'text-3xl'
                    )}>
                        Knowledge Synthesis Hub
                    </h1>
                </div>

                {/* Coming Soon Placeholder */}
                <div className={cn(
                    'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] text-center',
                    isMobile ? 'p-6' : 'p-8'
                )}>
                    <Sparkles className="mx-auto text-primary mb-4" size={isMobile ? 48 : 64} />
                    <h2 className={cn(
                        'font-bold font-mono text-foreground mb-2',
                        isMobile ? 'text-lg' : 'text-2xl'
                    )}>
                        Coming Soon
                    </h2>
                    <p className={cn(
                        'text-muted-foreground max-w-xl mx-auto',
                        isMobile ? 'text-sm' : 'text-base'
                    )}>
                        The Knowledge Synthesis Station is currently in concept phase.
                        This will be your central hub for organizing, synthesizing, and
                        leveraging knowledge across your projects and AI agents.
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
