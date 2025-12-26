/**
 * Hub Home Page Component (Refactored)
 *
 * Home page with topic-based onboarding, real project data from Dexie,
 * and proper routing.
 *
 * @file HubHomePage.tsx
 * @created 2025-12-27T00:50:00Z
 * @refactored Integrated with projectStore, BentoGrid, Router
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  listProjectsWithPermission,
  saveProject,
  generateProjectId,
  type ProjectWithPermission,
  type ProjectMetadata,
} from '@/lib/workspace/project-store';
import { BentoGrid, type BentoCardProps } from '@/components/ide/BentoGrid';
import { NavigationBreadcrumbs } from './NavigationBreadcrumbs';
import {
  PlusIcon,
  FileIcon,
  SettingsIcon,
  AIIcon,
  TerminalIcon,
} from '@/components/ui/icons';
import { Sparkles, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Real project data from Dexie via useLiveQuery
  // Note: useLiveQuery requires a function that returns a Promise
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

  /**
   * Handle portal card navigation
   */
  const handlePortalNavigation = (route: string) => {
    navigate({ to: route });
  };

  // Define portal cards using BentoCard structure
  const portalCards: BentoCardProps[] = [
    {
      id: 'portal-ide',
      size: 'medium',
      title: t('hub.portals.ideWorkspace', 'IDE Workspace'),
      description: t('hub.portals.ideWorkspaceDesc', 'Open your projects in the full IDE'),
      icon: <TerminalIcon className="text-primary" />,
      topic: 'Workspace',
      onClick: () => navigate({ to: '/ide' }),
    },
    {
      id: 'portal-agents',
      size: 'medium',
      title: t('hub.portals.agentCenter', 'Agent Center'),
      description: t('hub.portals.agentCenterDesc', 'Configure and manage AI agents'),
      icon: <AIIcon className="text-primary" />,
      topic: 'Agents',
      onClick: () => handlePortalNavigation('/agents'),
    },
    {
      id: 'portal-knowledge',
      size: 'medium',
      title: t('hub.portals.knowledgeHub', 'Knowledge Hub'),
      description: t('hub.portals.knowledgeHubDesc', 'Your knowledge synthesis station'),
      icon: <Sparkles className="text-primary" />,
      topic: 'Knowledge',
      onClick: () => handlePortalNavigation('/knowledge'),
    },
    {
      id: 'portal-settings',
      size: 'medium',
      title: t('hub.portals.settings', 'Settings'),
      description: t('hub.portals.settingsDesc', 'Configure your workspace preferences'),
      icon: <SettingsIcon className="text-primary" />,
      topic: 'Settings',
      onClick: () => handlePortalNavigation('/settings'),
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-background text-foreground">
      <main className="flex-1 overflow-y-auto">
        {/* Breadcrumbs */}
        <div className="px-6 py-4">
          <NavigationBreadcrumbs
            items={[
              { label: t('breadcrumbs.home'), interactive: false },
              { label: t('breadcrumbs.projects'), interactive: false },
              { label: t('breadcrumbs.workspace'), interactive: false },
            ]}
          />
        </div>

        {/* Welcome section with 8-bit styling */}
        <div className="px-6 py-6">
          <h1 className="text-4xl font-bold mb-2 text-foreground font-mono tracking-tight">
            {t('welcome')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {t('onboarding.slides.intro.desc')}
          </p>
        </div>

        {/* Portal Cards using BentoGrid (8-bit styled) */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground font-mono">
            {t('hub.exploreViaGent', 'Explore Via-gent')}
          </h2>
          <BentoGrid
            cards={portalCards}
            topics={['Workspace', 'Agents', 'Knowledge', 'Settings']}
            className="max-w-6xl"
          />
        </div>

        {/* Recent Projects section (Real Data from Dexie) */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground font-mono">
              {t('projects.recent')}
            </h2>
            <Button
              onClick={handleOpenFolder}
              className="gap-2 rounded-none border-2 border-primary shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              aria-label={t('projects.openFolder')}
            >
              <PlusIcon />
              <span>{t('projects.openFolder')}</span>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonLoader className="h-32 rounded-none" />
              <SkeletonLoader className="h-32 rounded-none" />
              <SkeletonLoader className="h-32 rounded-none" />
            </div>
          )}

          {/* Project List (Real Data) */}
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
                >
                  <div className="flex items-start gap-3 mb-2">
                    <FileIcon className="text-primary flex-shrink-0" />
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
                      {t('projects.lastEdited')}:{' '}
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

          {/* Empty State (No Projects) */}
          {!isLoading && (!projects || projects.length === 0) && (
            <EmptyState
              icon={<FolderPlus size={48} className="text-muted-foreground" />}
              title={t('dashboard.emptyTitle')}
              message={t('dashboard.emptySubtitle')}
              variant="no-projects"
              action="browse"
              onAction={handleOpenFolder}
            />
          )}
        </div>
      </main>
    </div>
  );
};
