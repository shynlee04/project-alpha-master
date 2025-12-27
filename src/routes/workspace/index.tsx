/**
 * @fileoverview Workspace Index Route
 * @module routes/workspace
 * @governance LAYOUT-5
 * 
 * Displays the project list when user navigates to /workspace without a project ID.
 * Provides quick actions to open a folder or create a new project.
 * 
 * Story LAYOUT-5: Create Workspace Index Route
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { FolderPlus, FolderOpen, FileCode } from 'lucide-react';
import {
    listProjectsWithPermission,
    saveProject,
    generateProjectId,
    type ProjectWithPermission,
    type ProjectMetadata,
} from '@/lib/workspace/project-store';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/workspace/')({
    component: WorkspaceIndexPage,
});

function WorkspaceIndexPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Real project data from Dexie via useLiveQuery
    const projects = useLiveQuery(() => listProjectsWithPermission(), []);
    const isLoading = projects === undefined;

    /**
     * Handle opening a new folder via File System Access API
     */
    const handleOpenFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker();

            // Create and save the project
            const newProject: ProjectMetadata = {
                id: generateProjectId(),
                name: handle.name,
                folderPath: handle.name, // FSA doesn't expose full path
                fsaHandle: handle,
                lastOpened: new Date(),
                autoSync: true,
            };

            const saved = await saveProject(newProject);
            if (saved) {
                navigate({ to: `/workspace/${newProject.id}` });
            }
        } catch (err) {
            // User cancelled or error
            if ((err as Error).name !== 'AbortError') {
                console.error('Failed to open folder:', err);
            }
        }
    };

    /**
     * Handle navigating to a specific project workspace
     */
    const handleProjectClick = (projectId: string) => {
        navigate({ to: `/workspace/${projectId}` });
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-mono text-foreground flex items-center gap-3">
                            <FolderOpen className="h-8 w-8 text-primary" />
                            {t('projects.title', 'Projects')}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {t('projects.subtitle', 'Open a local folder to start coding')}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleOpenFolder}
                            className="gap-2"
                            aria-label={t('projects.openFolder', 'Open Folder')}
                        >
                            <FolderPlus className="h-4 w-4" />
                            <span>{t('projects.openFolder', 'Open Folder')}</span>
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SkeletonLoader className="h-32 rounded-none" />
                        <SkeletonLoader className="h-32 rounded-none" />
                        <SkeletonLoader className="h-32 rounded-none" />
                    </div>
                )}

                {/* Project List */}
                {!isLoading && projects && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project: ProjectWithPermission) => (
                            <div
                                key={project.id}
                                className="bg-card border-2 border-border rounded-none p-4 cursor-pointer
                  shadow-[2px_2px_0px_rgba(0,0,0,0.5)]
                  hover:shadow-[4px_4px_0px_rgba(0,0,0,0.7)]
                  hover:border-primary/50
                  transition-all duration-150"
                                onClick={() => handleProjectClick(project.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Open project ${project.name}`}
                                onKeyDown={(e) => e.key === 'Enter' && handleProjectClick(project.id)}
                            >
                                <div className="flex items-start gap-3 mb-2">
                                    <FileCode className="text-primary flex-shrink-0 h-5 w-5" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold mb-1 text-foreground truncate font-mono">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {project.folderPath}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>
                                        {t('projects.lastEdited', 'Last opened')}:{' '}
                                        {new Date(project.lastOpened).toLocaleDateString()}
                                    </span>
                                    {project.permissionState === 'prompt' && (
                                        <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-medium rounded-none">
                                            {t('projects.needsAccess', 'Needs Access')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && (!projects || projects.length === 0) && (
                    <EmptyState
                        icon={<FolderPlus size={48} className="text-muted-foreground" />}
                        title={t('projects.emptyTitle', 'No Projects Yet')}
                        message={t('projects.emptySubtitle', 'Open a folder to start your first project')}
                        variant="no-projects"
                        action="browse"
                        onAction={handleOpenFolder}
                    />
                )}
            </div>
        </MainLayout>
    );
}
