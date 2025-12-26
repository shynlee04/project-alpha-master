/**
 * Settings Route - Workspace Settings
 *
 * Routes to the Settings and Preferences page.
 * Wraps AgentConfigDialog with proper state management.
 *
 * @file settings.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AgentConfigDialog } from '@/components/agent/AgentConfigDialog';
import { SettingsIcon, PlusIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import type { Agent } from '@/mocks/agents';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAgentSubmit = (
        agentData: Omit<
            Agent,
            'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'
        >
    ) => {
        console.log('[SettingsPage] Agent created/updated:', agentData);
        // The AgentConfigDialog handles persistence via credentialVault
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="text-primary" />
                    <h1 className="text-3xl font-bold font-mono text-foreground">
                        Settings
                    </h1>
                </div>

                {/* Agent Configuration Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold font-mono mb-4 text-foreground">
                        AI Agent Configuration
                    </h2>
                    <div className="border-2 border-border rounded-none p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        <p className="text-muted-foreground mb-4">
                            Configure your AI agents, API keys, and model preferences.
                        </p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="gap-2 rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                        >
                            <PlusIcon />
                            <span>Configure Agent</span>
                        </Button>
                    </div>
                </section>

                {/* Placeholder for other settings */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold font-mono mb-4 text-foreground">
                        Workspace Preferences
                    </h2>
                    <div className="border-2 border-border rounded-none p-6 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                        <p className="text-muted-foreground">
                            Additional workspace settings coming soon.
                        </p>
                    </div>
                </section>

                {/* Agent Config Dialog */}
                <AgentConfigDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSubmit={handleAgentSubmit}
                />
            </div>
        </div>
    );
}
