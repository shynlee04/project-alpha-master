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
import { MainLayout } from '@/presentation/components/layout/MainLayout';
import { AgentConfigDialog } from '@/presentation/components/agent/AgentConfigDialog';
import { ErrorBoundary } from '@/presentation/components/common/ErrorBoundary';
import { SettingsIcon, PlusIcon } from '@/presentation/components/ui/icons';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { ProviderSettings } from '@/presentation/components/agent/ProviderSettings';
import { ThemeToggle } from '@/presentation/components/ui/ThemeToggle';
import { SettingsExportDialog } from '@/presentation/components/settings/SettingsExportDialog';
import { SettingsImportDialog } from '@/presentation/components/settings/SettingsImportDialog';
import { useAllProjects } from '@/infrastructure/persistence/stores/project';
import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';

export const Route = createFileRoute('/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    // MRT-9: Mobile responsive detection
    const { isMobile } = useDeviceType();

    // Get data for export/import
    const projects = useAllProjects();
    const activeProjectId = useLayoutStore(s => s.activeNavItem); // Using layout state as placeholder
    const sidebarCollapsed = useLayoutStore(s => s.sidebarCollapsed);

    // Get providers from app store
    const providers = useAppStore(s => s.providers || []);

    const handleAgentSuccess = (agentId: string) => {
        // BF-01 FIX: Callback receives agentId instead of full agent
        console.log('[SettingsPage] Agent created/updated successfully, ID:', agentId);
        setIsDialogOpen(false);
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

                {/* Theme Preference Section */}
                <section className="mb-8">
                    <h2 className={cn(
                        'font-semibold font-mono mb-4 text-foreground',
                        isMobile ? 'text-lg' : 'text-xl'
                    )}>
                        Theme Preferences
                    </h2>

                    <div className={cn(
                        'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                        isMobile ? 'p-4' : 'p-6'
                    )}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={cn(
                                    'font-semibold text-foreground mb-1',
                                    isMobile && 'text-base'
                                )}>
                                    Theme
                                </h3>
                                <p className={cn(
                                    'text-muted-foreground text-sm',
                                    isMobile && 'text-xs'
                                )}>
                                    Choose between light, dark, or system theme
                                </p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </section>

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

                {/* Data Management Section */}
                <section className="mb-8">
                    <h2 className={cn(
                        'font-semibold font-mono mb-4 text-foreground',
                        isMobile ? 'text-lg' : 'text-xl'
                    )}>
                        Data Management
                    </h2>

                    <div className={cn(
                        'border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                        isMobile ? 'p-4' : 'p-6'
                    )}>
                        <p className={cn(
                            'text-muted-foreground mb-4',
                            isMobile && 'text-sm'
                        )}>
                            Export your settings for backup or transfer to another device.
                            Import settings from a file to restore your configuration.
                        </p>

                        <div className={cn(
                            'flex gap-3',
                            isMobile ? 'flex-col' : 'flex-row'
                        )}>
                            <Button
                                onClick={() => setIsExportDialogOpen(true)}
                                variant="outline"
                                className={cn(
                                    'gap-2 rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                                    isMobile && 'min-h-[44px] w-full justify-center touch-manipulation'
                                )}
                            >
                                <Download />
                                <span>Export Settings</span>
                            </Button>

                            <Button
                                onClick={() => setIsImportDialogOpen(true)}
                                variant="outline"
                                className={cn(
                                    'gap-2 rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]',
                                    isMobile && 'min-h-[44px] w-full justify-center touch-manipulation'
                                )}
                            >
                                <Upload />
                                <span>Import Settings</span>
                            </Button>
                        </div>
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

                {/* P0 FIX: Agent Config Dialog wrapped with ErrorBoundary */}
                <ErrorBoundary
                    fallback={
                        <div className="p-6 text-center">
                            <h2 className="text-lg font-bold mb-2">Agent Configuration Failed</h2>
                            <p className="text-muted-foreground mb-4">
                                The agent configuration dialog encountered an unexpected error.
                            </p>
                            <Button onClick={() => setIsDialogOpen(false)}>
                                Close Dialog
                            </Button>
                        </div>
                    }
                    onError={(error) => {
                        console.error('[SettingsPage] AgentConfigDialog error:', error);
                    }}
                >
                    <AgentConfigDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onSuccess={handleAgentSuccess}
                        agentId={null} // BF-01 FIX: Create mode (no agent selected)
                    />
                </ErrorBoundary>

                {/* Export Dialog */}
                <SettingsExportDialog
                    open={isExportDialogOpen}
                    onOpenChange={setIsExportDialogOpen}
                    projects={projects}
                    providers={providers}
                    activeProjectId={null}
                    preferences={{
                        sidebarCollapsed,
                        activeNavItem: activeProjectId,
                    }}
                />

                {/* Import Dialog */}
                <SettingsImportDialog
                    open={isImportDialogOpen}
                    onOpenChange={setIsImportDialogOpen}
                    onImport={(data) => {
                        console.log('[SettingsPage] Import data:', data);
                        // TODO: Apply import to stores
                    }}
                    currentProjects={new Map(projects.map(p => [p.id, p]))}
                    currentProviders={new Map(providers.map(p => [p.id, p]))}
                />
            </div>
        </MainLayout>
    );
}
