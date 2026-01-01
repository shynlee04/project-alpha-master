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

import { db } from '@/lib/state/dexie-db';
import { cn } from '@/lib/utils';
import {
  saveProject,
  generateProjectId,
  updateProjectLastOpened,
  updateProjectBindings,
  type ProjectMetadata
} from '@/lib/workspace/project-store';
import type { WorkspaceBindings } from '@/lib/workspace/project-store';

import { BentoGrid, type BentoCardProps } from '@/presentation/components/ide/BentoGrid';
import { toast } from 'sonner';

// Hub subcomponents
import { BootSequence } from './BootSequence';
import { HubHero } from './HubHero';
import { RecentProjectsSection } from './RecentProjectsSection';
import { WorkspaceBindingDialog } from './WorkspaceBindingDialog';

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State management
  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMetadata | null>(null);

  // Data fetching
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;

  const recentProjects = useMemo(() => {
    return (projects || [])
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5) as unknown as ProjectMetadata[];
  }, [projects]);

  // -- Handlers --

  const handleNewProject = async () => {
    try {
      // 1. Open Directory Picker
      // @ts-ignore - showDirectoryPicker is valid in supported browsers
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      // 2. Create Project Metadata
      const newProjectId = generateProjectId();
      const project: ProjectMetadata = {
        id: newProjectId,
        name: handle.name,
        folderPath: handle.name,
        fsaHandle: handle,
        lastOpened: new Date(),
        autoSync: true,
      };

      // 3. Save to Dexie
      await saveProject(project);

      // 4. Navigate to Workspace
      await navigate({
        to: '/workspace/$projectId',
        params: { projectId: newProjectId }
      });

    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to create project:', error);
      }
    }
  };

  const handleOpenRecentProject = (projectId: string) => {
    const project = (projects || []).find(p => p.id === projectId);
    if (!project) return;

    setSelectedProject(project as unknown as ProjectMetadata);
    setDialogOpen(true);
  };

  const handleWorkspaceBindingConfirm = async (
    bindings: WorkspaceBindings,
    initialWorkspace: string
  ) => {
    if (!selectedProject) return;

    try {
      // 1. Save workspace bindings
      await updateProjectBindings(selectedProject.id, bindings);

      // 2. Update timestamp
      await updateProjectLastOpened(selectedProject.id);

      // 3. Close dialog
      setDialogOpen(false);

      // 4. Navigate to selected workspace
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
