import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatDistanceToNow } from 'date-fns';
import {
  Folder,
  Plus,
  Terminal,
  Cpu,
  BookOpen,
  Settings,
  HardDrive,
  Clock,
  CheckCircle2,
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

import { BentoGrid, type BentoCardProps } from '@/presentation/components/ide/BentoGrid';
import { EmptyState } from '@/presentation/components/ui/EmptyState';
import { SkeletonLoader } from '@/presentation/components/ui/SkeletonLoader';
import { WorkspaceBindingDialog } from './WorkspaceBindingDialog';
import type { WorkspaceBindings } from '@/lib/workspace/project-store';
import { toast } from 'sonner';

// --- Components ---

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bootLines = [
    "BIOS CHECK... OK",
    "LOADING KERNEL... OK",
    "MOUNTING VIRTUAL FILESYSTEM...",
    "INITIALIZING NEURAL INTERFACE...",
    "ACCESS GRANTED."
  ];

  useEffect(() => {
    let delay = 0;
    bootLines.forEach((line, i) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (i === bootLines.length - 1) {
          setTimeout(onComplete, 500);
        }
      }, delay);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-start justify-start p-8 font-mono text-primary text-sm md:text-base">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-muted-foreground">{`> `}</span>
            <span>{line}</span>
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Workspace Binding Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectMetadata | null>(null);

  // -- Text Typing Effect --
  const fullText = t('hub.welcome', 'INITIALIZING SYSTEM...');
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (booting) return;

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
    }, 40);

    return () => clearInterval(typeInterval);
  }, [fullText, booting]);

  useEffect(() => {
    const blinkInterval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(blinkInterval);
  }, []);

  // -- Data Fetching --
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;

  const recentProjects = useMemo(() => {
    return (projects || [])
      .sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 5);
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

  const handleOpenRecentProject = async (projectId: string) => {
    try {
      // Find project from list
      const project = (projects || []).find((p) => p.id === projectId);
      if (!project) return;

      // Open workspace binding dialog
      setSelectedProject(project);
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to open recent project:', error);
    }
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

      {/* -- Hero Section -- */}
      <section className="space-y-2 mb-4 pt-4 md:pt-0">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
          <Terminal className="w-3 h-3" />
          <span>{t('hub.subtitle', 'v2.5.0-BETA // READY FOR INPUT')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-pixel text-primary tracking-tight h-auto min-h-[1.2em] flex flex-wrap items-center break-words">
          {typedText}
          <span className={cn("inline-block w-[0.6em] h-[1em] bg-primary ml-1", cursorVisible ? "opacity-100" : "opacity-0")} />
        </h1>
      </section>

      {/* -- Main Grid -- */}
      <section>
        <BentoGrid cards={bentoCards} />
      </section>

      {/* -- Recent Projects (File Directory Style) -- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-border/50 pb-2">
          <h2 className="text-xl font-pixel text-foreground flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            {t('hub.recent.title', 'RECENT_DIRECTORIES')}
          </h2>
          <button
            onClick={() => navigate({ to: '/workspace' })}
            className="text-xs font-mono text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 transition-colors"
          >
            {t('hub.actions.viewAll', 'VIEW_ALL >>')}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <SkeletonLoader variant="list" lines={3} />
          </div>
        ) : (!recentProjects || recentProjects.length === 0) ? (
          <EmptyState
            variant="no-projects"
            message={t('hub.noProjects', 'No directories found in local storage.')}
            action="create"
            onAction={handleNewProject}
          />
        ) : (
          <div className="border-2 border-border/60 bg-card/50 backdrop-blur-sm shadow-pixel">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-3 border-b-2 border-border/40 bg-muted/40 font-pixel text-xs text-muted-foreground uppercase tracking-widest">
              <div className="col-span-8 md:col-span-5 pl-2">Name</div>
              <div className="col-span-3 md:col-span-2 hidden md:block">{t('hub.recent.status', 'STATUS')}</div>
              <div className="col-span-4 md:col-span-3 text-right">{t('hub.recent.lastMod', 'LAST_MOD')}</div>
              <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">{t('hub.recent.size', 'SIZE')}</div>
            </div>

            {/* Project Rows */}
            <div className="divide-y-2 divide-border/20">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenRecentProject(project.id)}
                  className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-primary/5 cursor-pointer group transition-all duration-200"
                  role="button"
                  tabIndex={0}
                >
                  {/* Name */}
                  <div className="col-span-8 md:col-span-5 flex items-center gap-3 overflow-hidden pl-2">
                    <Folder className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-mono text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </span>
                  </div>

                  {/* Status (Desktop only) */}
                  <div className="col-span-3 md:col-span-2 hidden md:block">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase font-pixel bg-green-500/10 text-green-500 border border-green-500/30 rounded-none">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-4 md:col-span-3 text-right">
                    <span className="text-xs font-mono text-muted-foreground flex items-center justify-end gap-1 group-hover:text-foreground transition-colors">
                      <Clock className="h-3 w-3 md:hidden" />
                      {project.lastOpened ? formatDistanceToNow(project.lastOpened, { addSuffix: true }) : ''}
                    </span>
                  </div>

                  {/* Size (Desktop only placeholder) */}
                  <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                      --
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Row */}
            <div className="bg-muted/40 p-2 font-mono text-[10px] text-muted-foreground text-center border-t-2 border-border/40">
              Total Directories: {recentProjects.length}
            </div>
          </div>
        )}
      </section>

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
