/**
 * Agents Route - Agent Management Center
 *
 * Routes to the Agent configuration and management hub.
 * Wires the legacy AgentsPanel into the new Hub navigation.
 *
 * @file agents.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { AgentsPanel } from '@/components/ide/AgentsPanel';

export const Route = createFileRoute('/agents')({
    component: AgentsPage,
});

function AgentsPage() {
    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-6">
                <h1 className="text-3xl font-bold font-mono mb-6 text-foreground">
                    Agent Center
                </h1>
                <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    <AgentsPanel />
                </div>
            </div>
        </MainLayout>
    );
}
