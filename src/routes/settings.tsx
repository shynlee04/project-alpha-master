/**
 * Settings Route - Workspace Settings
 *
 * Routes to the Settings and Preferences page.
 * Wraps AgentConfigDialog with proper state management.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-9 Dashboard Responsive
 * 
 * @file settings.tsx
 * @created 2025-12-27T01:10:00Z
 */

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/MainLayout';
import { AgentConfigDialog } from '@/components/agent/AgentConfigDialog';
import { SettingsIcon, PlusIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useMediaQuery';
import type { Agent } from '@/mocks/agents';
import { ProviderSettings } from '@/components/agent/ProviderSettings';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // MRT-9: Mobile responsive detection
    const { isMobile } = useDeviceType();

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
        <MainLayout>
            <div className={cn(
                'max-w-4xl mx-auto',
                isMobile ? 'p-4' : 'p-6'
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="text-primary" />
                    <h1 className={cn(
                        'font-bold font-mono text-foreground',
                        isMobile ? 'text-xl' : 'text-3xl'
                    )}>
                        Settings
                    </h1>
                </div>

                {/* Agent Configuration Section */}
                <section className="mb-8">
                    <h2 className={cn(
                        'font-semibold font-mono mb-4 text-foreground',
                        isMobile ? 'text-lg' : 'text-xl'
                    )}>
                        AI Agent Configuration
                    </h2>

                    <div className="mb-8">
                        <ProviderSettings />
                    </div>

                    <div className={cn(
                        'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                        isMobile ? 'p-4' : 'p-6'
                    )}>
                        <p className={cn(
                            'text-muted-foreground mb-4',
                            isMobile && 'text-sm'
                        )}>
                            Configure your AI agents, API keys, and model preferences.
                        </p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className={cn(
                                'gap-2 rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                                // MRT-9: 44px touch target on mobile
                                isMobile && 'min-h-[44px] w-full justify-center touch-manipulation'
                            )}
                        >
                            <PlusIcon />
                            <span>Configure Agent</span>
                        </Button>
                    </div>
                </section>

                {/* Placeholder for other settings */}
                <section className="mb-8">
                    <h2 className={cn(
                        'font-semibold font-mono mb-4 text-foreground',
                        isMobile ? 'text-lg' : 'text-xl'
                    )}>
                        Workspace Preferences
                    </h2>
                    <div className={cn(
                        'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                        isMobile ? 'p-4' : 'p-6'
                    )}>
                        <p className={cn(
                            'text-muted-foreground',
                            isMobile && 'text-sm'
                        )}>
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
        </MainLayout>
    );
}
