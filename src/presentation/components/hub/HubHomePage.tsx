import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Terminal,
  Cpu,
  BookOpen,
  Settings,
  HardDrive,
  Notebook,
  Info
} from 'lucide-react';

import { db } from '@/infrastructure/persistence/dexie-db';
import { cn } from '@/lib/utils';
import type { Project, WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';
import type { ProjectRecord } from '@/lib/state/dexie-db-types';

import { BentoGrid, type BentoCardProps } from '@/presentation/components/ide/BentoGrid';
import { toast } from 'sonner';

// Hub subcomponents
import { BootSequence } from './BootSequence';
import { HubHero } from './HubHero';
import { RecentProjectsSection } from './RecentProjectsSection';
import { WorkspaceBindingDialog } from './WorkspaceBindingDialog';
import { SummaryCardsGrid } from './SummaryCardsGrid';
import { ChartsGrid } from './ChartsGrid';
import { useDashboardMetrics } from './useDashboardMetrics';

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State management
  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Data fetching
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;

  // Dashboard metrics
  const metrics = useDashboardMetrics({ projects: (projects || []) as unknown as Project[] });

  const recentProjects = useMemo(() => {
    return (projects || [])
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5) as unknown as Project[];
  }, [projects]);

  // -- Handlers --

  const handleNewProject = async () => {
    try {
      // Check if File System Access API is supported (not available on mobile)
      const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

      if (!isFSASupported) {
        // Graceful degradation for mobile and unsupported browsers
        toast.info(t('hub.fsaNotSupported.title', 'Folder Mounting Not Available'), {
          description: t(
            'hub.fsaNotSupported.description',
            'Folder mounting requires a desktop browser (Chrome, Edge, or Opera). Notes and Study workspaces work without mounting - your data is saved locally.'
          ),
          duration: 8000,
        });
        // Offer to navigate to Notes which doesn't require FSA
        return;
      }

      // 1. Open Directory Picker
      // @ts-ignore - showDirectoryPicker is valid in supported browsers
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      // 2. Create Project Metadata
      const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const project: Project = {
        id: newProjectId,
        name: handle.name,
        folderPath: handle.name,
        fsaHandle: handle,
        lastOpened: new Date(),
        createdAt: new Date(),
        autoSync: true,
        bindings: {
          ide: true,
          knowledge: false,
          notes: false,
          study: false,
        },
        tags: [],
      };

      // 3. Save to Dexie
      await db.projects.add(project as unknown as ProjectRecord);

      // 4. Navigate to Workspace
      await navigate({
        to: '/workspace/$projectId',
        params: { projectId: newProjectId }
      });

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to create project:', error);
        toast.error(t('hub.projectCreateFailed', 'Failed to create project'), {
          description: (error as Error).message,
        });
      }
    }
  };

  const handleOpenRecentProject = (projectId: string) => {
    const project = (projects || []).find(p => p.id === projectId);
    if (!project) return;

    setSelectedProject(project as unknown as Project);
    setDialogOpen(true);
  };

  const handleWorkspaceBindingConfirm = async (
    bindings: WorkspaceBindings,
    initialWorkspace: string
  ) => {
    if (!selectedProject) return;

    try {
      // 1. Fetch project, update bindings, and save back
      const project = await db.projects.get(selectedProject.id);
      if (project) {
        const updated = {
          ...project,
          bindings,
          lastOpened: new Date(),
        };
        await db.projects.put(updated);
      }

      // 2. Close dialog
      setDialogOpen(false);

      // 3. Navigate to selected workspace
      await navigate({
        to: `/${initialWorkspace}/$projectId`,
        params: { projectId: selectedProject.id }
      });
    } catch (error) {
      console.error('Failed to open project:', error);
      toast.error('Failed to open project');
    }
  };

  // -- Bento Cards Configuration --
  const bentoCards: BentoCardProps[] = useMemo(() => [
    {
      id: 'new-project',
      size: 'medium',
      title: t('hub.menu.workspace', 'WORKSPACE_MOUNT'),
      description: t('hub.newProjectDesc', 'Initialize a new workspace entry'),
      icon: <Plus className="h-8 w-8" />,
      topic: 'Workspace',
      onClick: handleNewProject,
      className: 'bg-primary/5 border-primary/20 hover:border-primary/50',
    },
    {
      id: 'notes',
      size: 'medium',
      title: t('hub.menu.notes', 'FIELD_NOTES'),
      description: t('hub.notesDesc', 'Quick access to scratchpad'),
      icon: <Notebook className="h-8 w-8" />,
      topic: 'Notes',
      onClick: () => navigate({ to: '/notes' }),
      className: 'bg-green-500/5 border-green-500/20 hover:border-green-500/50',
    },
    {
      id: 'ai-agents',
      size: 'small',
      title: t('hub.menu.agents', 'NEURAL_AGENTS'),
      icon: <Cpu className="h-6 w-6" />,
      topic: 'Agents',
      onClick: () => navigate({ to: '/agents' }),
    },
    {
      id: 'knowledge',
      size: 'small',
      title: t('hub.menu.knowledge', 'DATA_BANK'),
      icon: <HardDrive className="h-6 w-6" />,
      topic: 'Knowledge',
      onClick: () => navigate({ to: '/knowledge' }),
    },
    {
      id: 'docs',
      size: 'small',
      title: t('hub.menu.study', 'STUDY_CORE'),
      icon: <BookOpen className="h-6 w-6" />,
      topic: 'Study',
      onClick: () => navigate({ to: '/study' }),
    },
    {
      id: 'terminal',
      size: 'small',
      title: t('hub.terminal', 'TERMINAL'),
      icon: <Terminal className="h-6 w-6" />,
      topic: 'Terminal',
      onClick: () => {
        toast.info("Global Terminal Access Restricted", {
          description: "Please access terminal via an active Workspace."
        });
      },
    },
    {
      id: 'settings',
      size: 'small',
      title: t('hub.menu.settings', 'CONFIG_SYS'),
      icon: <Settings className="h-6 w-6" />,
      topic: 'Settings',
      onClick: () => navigate({ to: '/settings' }),
    },
    {
      id: 'about',
      size: 'small',
      title: t('hub.menu.about', 'SYS_INFO'),
      icon: <Info className="h-6 w-6" />,
      topic: 'About',
      onClick: () => navigate({ to: '/about' }), // Assuming /about exists or will be caught
    }
  ], [t, navigate, handleNewProject]);

  const handleBootComplete = () => {
    setBooting(false);
    setTimeout(() => setShowContent(true), 100);
  };

  if (booting) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className={cn(
      "flex flex-col min-h-full p-4 md:p-8 space-y-8 bg-background text-foreground font-sans transition-opacity duration-700",
      showContent ? "opacity-100" : "opacity-0"
    )}>

      {/* Hero Section */}
      <HubHero />

      {/* Summary Cards Grid */}
      <SummaryCardsGrid
        metrics={metrics}
        isLoading={isLoading}
        quotaLimitMB={50}
      />

      {/* Charts Grid */}
      <ChartsGrid metrics={metrics} />

      {/* Main Grid - Bento Cards */}
      <section>
        <BentoGrid cards={bentoCards} />
      </section>

      {/* Recent Projects Section */}
      <RecentProjectsSection
        recentProjects={recentProjects}
        isLoading={isLoading}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenRecentProject}
      />

      {/* Workspace Binding Dialog */}
      {selectedProject && (
        <WorkspaceBindingDialog
          project={selectedProject}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={handleWorkspaceBindingConfirm}
        />
      )}
    </div>
  );
};
