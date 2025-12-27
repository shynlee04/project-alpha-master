/**
 * Agents Route - Agent Management Center
 *
 * Routes to the Agent configuration and management hub.
 * Wires the legacy AgentsPanel into the new Hub navigation.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-9 Dashboard Responsive
 * 
 * @file agents.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { AgentsPanel } from '@/components/ide/AgentsPanel';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useMediaQuery';

export const Route = createFileRoute('/agents')({
    component: AgentsPage,
});

function AgentsPage() {
    // MRT-9: Mobile responsive detection
    const { isMobile } = useDeviceType();

    return (
        <MainLayout>
            <div className={cn(
                'max-w-6xl mx-auto',
                isMobile ? 'p-4' : 'p-6'
            )}>
                <h1 className={cn(
                    'font-bold font-mono mb-6 text-foreground',
                    isMobile ? 'text-xl' : 'text-3xl'
                )}>
                    Agent Center
                </h1>
                <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    <AgentsPanel />
                </div>
            </div>
        </MainLayout>
    );
}
