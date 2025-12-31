/**
 * Hub Home Page Component (Refactored)
 *
 * Home page with topic-based onboarding, real project data from Dexie,
 * and proper routing.
 *
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-9 Dashboard Responsive
 * 
 * @file HubHomePage.tsx
 * @created 2025-12-27T00:50:00Z
 * @refactored Integrated with projectStore, BentoGrid, Router
 */

import React, { useMemo } from 'react';
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
import { BentoGrid, type BentoCardProps } from '@/presentation/components/ide/BentoGrid';
import {
  PlusIcon,
  FileIcon,
  SettingsIcon,
  AIIcon,
  TerminalIcon,
} from '@/presentation/components/ui/icons';
import { User } from 'lucide-react';
import { Sparkles, FolderPlus } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { SkeletonLoader } from '@/presentation/components/ui/SkeletonLoader';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { MobileProjectSelector } from './MobileProjectSelector';
import { useLayoutStore } from '@/infrastructure/persistence/stores/layout-store';

/**
 * Check if File System Access API is supported.
 * Not available on mobile browsers (iOS Safari, Android Chrome).
 */
function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // MRT-9: Mobile responsive detection
  const { isMobile } = useDeviceType();
  const { setMobileMenuOpen } = useLayoutStore();

  // Check File System Access API support (not available on mobile browsers)
  const isFileSystemSupported = useMemo(() => isFileSystemAccessSupported(), []);

  // State for showing mobile warning
  const [showMobileWarning, setShowMobileWarning] = React.useState(false);

  // -- Retro Typing Effect State --
  const fullText = t('hub.welcome', 'INITIALIZING SYSTEM...');
  const [typedText, setTypedText] = React.useState('');
  const [cursorVisible, setCursorVisible] = React.useState(true);

  // Typing animation effect
  React.useEffect(() => {
    let index = 0;
    const typeInterval = setInterval(() => {
      setTypedText((prev) => {
        if (index < fullText.length) {
          index++;
          return fullText.slice(0, index);
        }
        clearInterval(typeInterval);
        return prev;
      });
    }, 50); // Speed of typing

    return () => clearInterval(typeInterval);
  }, [fullText]);

  // Cursor Blinking effect
  React.useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // -- Data Fetching --
  const projects = useLiveQuery(() => listProjectsWithPermission(), []);
  const isLoading = projects === undefined;

  // Sort projects by recency
  const recentProjects = (projects || []).sort((a, b) => {
    return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
  }).slice(0, 5);

  /**
   * Handle opening a new folder via File System Access API
   * With mobile fallback UX
   */
  const handleOpenFolder = async () => {
    // Check if FS API is supported (not on mobile browsers)
    if (!isFileSystemSupported) {
      setShowMobileWarning(true);
      return;
    }

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

  // -- Bento Grid Data --
  const bentoCards: BentoCardProps[] = [
    {
      id: 'new-project',
      size: 'medium',
      title: t('hub.newProject', 'NEW_PROJECT.EXE'),
      description: t('hub.newProjectDesc', 'Initialize a new workspace environment'),
      icon: <PlusIcon className="h-8 w-8" />,
      topic: 'Workspace',
      onClick: () => navigate({ to: '/workspace' }),
      className: 'bg-primary/5 border-primary/20',
    },
    {
      id: 'ai-agents',
      size: 'small',
      title: t('hub.agents', 'AI_AGENTS'),
      icon: <AIIcon className="h-6 w-6" />,
      topic: 'Agents',
      onClick: () => navigate({ to: '/agents' }),
    },
    {
      id: 'knowledge',
      size: 'small',
      title: t('hub.knowledge', 'DATA_BANK'),
      icon: <FolderPlus className="h-6 w-6" />,
      topic: 'Knowledge',
      onClick: () => navigate({ to: '/knowledge' }),
    },
    {
      id: 'docs',
      size: 'wide',
      title: t('hub.documentation', 'MANUAL.TXT'),
      description: t('hub.docsDesc', 'Access system documentation and guides'),
      icon: <Sparkles className="h-6 w-6" />,
      topic: 'About',
      onClick: () => navigate({ to: '/study' }),
    },
    {
      id: 'terminal',
      size: 'small',
      title: t('hub.terminal', 'TERMINAL'),
      icon: <TerminalIcon className="h-6 w-6" />,
      topic: 'Terminal',
      onClick: () => { },
    },
    {
      id: 'settings',
      size: 'small',
      title: t('hub.config', 'CONFIG'),
      icon: <SettingsIcon className="h-6 w-6" />,
      topic: 'Settings',
      onClick: () => navigate({ to: '/settings' }),
    },
  ];

  return (
    <div className="flex flex-col min-h-full p-4 md:p-8 space-y-8 bg-background text-foreground font-sans">

      {/* -- Hero Section -- */}
      <section className="space-y-2 mb-4">
        <h1 className="text-3xl md:text-5xl font-pixel text-primary tracking-tight h-[1.2em]">
          {typedText}
          <span className={cn("inline-block w-[0.5em] h-[1em] bg-primary ml-1 align-middle", cursorVisible ? "opacity-100" : "opacity-0")} />
        </h1>
        <p className="text-muted-foreground font-mono text-sm md:text-base max-w-2xl">
          {t('hub.subtitle', 'v2.4.0-ALPHA // READY FOR INPUT')}
        </p>
      </section>

      {/* -- Main Grid -- */}
      <section>
        <BentoGrid cards={bentoCards} />
      </section>

      {/* -- Recent Projects (File Directory Style) -- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border pb-2">
          <h2 className="text-xl font-pixel text-foreground flex items-center gap-2">
            <FileIcon className="h-5 w-5 text-primary" />
            {t('hub.recentProjects', 'RECENT_DIRECTORIES')}
          </h2>
          <button
            onClick={() => navigate({ to: '/workspace' })}
            className="text-xs font-mono text-muted-foreground hover:text-primary hover:underline"
          >
            {t('hub.browse', 'BROWSE')}
          </button>
        </div>

        {/* Project List or Empty State */}
        {isLoading ? (
          <SkeletonLoader count={3} />
        ) : recentProjects.length > 0 ? (
          <div className="grid gap-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate({ to: `/workspace/${project.id}` })}
                className="flex items-center justify-between p-4 border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {new Date(project.lastOpened).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileIcon className="h-8 w-8 text-muted-foreground" />}
            title={t('hub.noProjects', 'NO_DIRECTORIES')}
            description={t('hub.noProjectsDesc', 'No workspace directories initialized yet')}
            actionLabel={t('hub.createFirst', 'CREATE_FIRST')}
            onAction={handleOpenFolder}
          />
        )}
      </section>
    </div>
  );
};
