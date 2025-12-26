/**
 * Hub Home Page Component
 * 
 * Home page with topic-based onboarding.
 * Centers on project management with quick actions and portal cards.
 * 
 * @file HubHomePage.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHubStore } from '@/lib/state/hub-store';
import { TopicCard } from './TopicCard';
import { TopicPortalCard } from './TopicPortalCard';
import { NavigationBreadcrumbs } from './NavigationBreadcrumbs';
import { FolderPlus, Clock, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens from 8-bit design system
const RADIUS_LG = 'var(--radius-lg)';
const RADIUS_MD = 'var(--radius-md)';
const SHADOW_SM = 'var(--shadow-sm)';

interface RecentProject {
  id: string;
  name: string;
  path: string;
  lastEdited: string;
}

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveSection } = useHubStore();

  // Mock recent projects data
  const recentProjects: RecentProject[] = [
    {
      id: '1',
      name: 'my-app',
      path: '/Users/apple/projects/my-app',
      lastEdited: '2 hours ago',
    },
    {
      id: '2',
      name: 'via-gent-website',
      path: '/Users/apple/projects/via-gent-website',
      lastEdited: '1 day ago',
    },
    {
      id: '3',
      name: 'api-service',
      path: '/Users/apple/projects/api-service',
      lastEdited: '3 days ago',
    },
  ];

  const handleNewProject = () => {
    // TODO: Implement new project creation
    console.log('Create new project');
  };

  const handleOpenFolder = () => {
    // TODO: Implement folder picker
    console.log('Open folder');
  };

  const handleTopicAction = (topic: string) => {
    console.log('Topic action:', topic);
    // Navigate to appropriate section based on topic
  };

  const handlePortalClick = (section: string) => {
    setActiveSection(section as any);
  };

  return (
    <div className="flex-1 min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* Main content area - sidebar is rendered by HubLayout */}
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

        {/* Welcome section */}
        <div className="px-6 py-6">
          <h1 className="text-4xl font-bold mb-2 text-[var(--color-foreground)]">
            {t('welcome')}
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-3xl">
            {t('onboarding.slides.intro.desc')}
          </p>
        </div>

        {/* Topic-based onboarding cards */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-semibold mb-6 text-[var(--color-foreground)]">
            Explore Via-gent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI-Powered Development */}
            <TopicCard
              gradient="orange"
              titleKey="aiPoweredDev.title"
              descriptionKey="aiPoweredDev.description"
              actionKey="aiPoweredDev.action"
              icon={<Sparkles size={32} />}
              onAction={() => handleTopicAction('ide')}
            />

            {/* Privacy-First Workspace */}
            <TopicCard
              gradient="coral"
              titleKey="privacyFirst.title"
              descriptionKey="privacyFirst.description"
              actionKey="privacyFirst.action"
              icon={<Clock size={32} />}
              onAction={() => handleTopicAction('settings')}
            />

            {/* Classroom-Ready IDE */}
            <TopicCard
              gradient="teal"
              titleKey="classroomReady.title"
              descriptionKey="classroomReady.description"
              actionKey="classroomReady.action"
              icon={<Sparkles size={32} />}
              onAction={() => handleTopicAction('ide')}
            />

            {/* Knowledge Synthesis Hub */}
            <TopicCard
              gradient="purple"
              titleKey="knowledgeSynthesis.title"
              descriptionKey="knowledgeSynthesis.description"
              actionKey="knowledgeSynthesis.action"
              icon={<Sparkles size={32} />}
              onAction={() => handleTopicAction('knowledge')}
            />

            {/* Agent Orchestration Center */}
            <TopicCard
              gradient="blue"
              titleKey="agentOrchestration.title"
              descriptionKey="agentOrchestration.description"
              actionKey="agentOrchestration.action"
              icon={<Sparkles size={32} />}
              onAction={() => handleTopicAction('agents')}
            />
          </div>
        </div>

        {/* Recent Projects section */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
              {t('projects.recent')}
            </h2>
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[var(--radius-md)] font-semibold hover:opacity-90 transition-opacity duration-200"
              aria-label={t('projects.new')}
            >
              <FolderPlus size={20} />
              <span>{t('projects.new')}</span>
            </button>
          </div>

          {/* Recent projects list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer"
                onClick={() => console.log('Open project:', project.id)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <FolderPlus className="text-[var(--color-primary)] flex-shrink-0" size={24} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1 text-[var(--color-foreground)] truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {project.path}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
                  <span>{t('projects.lastEdited')}: {project.lastEdited}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement project actions
                    }}
                    className="p-2 hover:bg-[var(--color-accent)] rounded-md transition-colors duration-200"
                    aria-label="Project actions"
                  >
                    ...
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state when no projects */}
          {recentProjects.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
              <FolderPlus className="mx-auto text-[var(--color-muted-foreground)] mb-4" size={48} />
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                {t('dashboard.emptyTitle')}
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {t('dashboard.emptySubtitle')}
              </p>
              <button
                onClick={handleOpenFolder}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-[var(--radius-md)] font-semibold hover:opacity-90 transition-opacity duration-200"
              >
                <FolderPlus size={20} />
                <span>{t('projects.openFolder')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Portal cards section */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-semibold mb-6 text-[var(--color-foreground)]">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* IDE Workspace */}
            <TopicPortalCard
              titleKey="ideWorkspace"
              descriptionKey="ideWorkspaceDesc"
              icon={<Sparkles size={32} />}
              onClick={() => handlePortalClick('ide')}
            />

            {/* Agent Center */}
            <TopicPortalCard
              titleKey="agentCenter"
              descriptionKey="agentCenterDesc"
              icon={<Sparkles size={32} />}
              onClick={() => handlePortalClick('agents')}
            />

            {/* Knowledge Hub */}
            <TopicPortalCard
              titleKey="knowledgeHub"
              descriptionKey="knowledgeHubDesc"
              icon={<Sparkles size={32} />}
              onClick={() => handlePortalClick('knowledge')}
            />

            {/* Settings */}
            <TopicPortalCard
              titleKey="settings"
              descriptionKey="settingsDesc"
              icon={<Sparkles size={32} />}
              onClick={() => handlePortalClick('settings')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
