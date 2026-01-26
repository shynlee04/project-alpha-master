import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import type { HistoryState } from '@tanstack/history';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Terminal,
  Cpu,
  // TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
  // Imports retained for backward compatibility, remove when implementing these workspaces
  // BookOpen,
  Settings,
  // HardDrive,
  Notebook,
  Info,
  Search,
  FolderOpen,
  NotebookPen,
  Bot
} from 'lucide-react';

import { db } from '@/infrastructure/persistence/dexie-db';
import { cn } from '@/lib/utils';
import type { Project, WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { getPlatformContract, getPlatformInfoForLogging } from '@/infrastructure/filesystem/platform-contract';
import { BentoGrid, type BentoCardProps } from '@/presentation/components/ide/BentoGrid';
import { toast } from 'sonner';
import { Button } from '@/presentation/components/ui/button';
import { createProjectFromFolder } from '@/lib/workspace/fsa-persistence';
// V3-FIX-002: Removed unused imports - createProjectFromFolder handles persistence
// import { serializeHandle, handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';

// Hub subcomponents
import { BootSequence } from './BootSequence';
import { HubHero } from './HubHero';
import { QuickActionCard } from './QuickActionCard';
import { RecentProjectsSection } from './RecentProjectsSection';
import { WorkspaceBindingDialog } from './WorkspaceBindingDialog';
import { ProjectPickerDialog } from './ProjectPickerDialog';
import { SummaryCardsGrid } from './SummaryCardsGrid';
import { ChartsGrid } from './ChartsGrid';
import { useDashboardMetrics } from './useDashboardMetrics';
import { ProjectCreationWizard } from '@/presentation/components/project/ProjectCreationWizard';
import { AdvancedSearchDialog } from '@/presentation/components/search';

export const HubHomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Access route search params for project picker triggering
  // Use useRouterState() which works in nested components (useSearch requires route context)
  const routerState = useRouterState();
  // TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
  // Workspace types retained for backward compatibility with existing projects
  const searchParams = routerState.location.search as {
    workspace?: 'ide' | 'notes' | 'knowledge' | 'study';
    action?: string;
    message?: string;
  };

  const { workspace, action, message } = searchParams;

  // State management
  const [booting, setBooting] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectCreationWizardOpen, setProjectCreationWizardOpen] = useState(false);
  const [projectPickerWorkspace, setProjectPickerWorkspace] = useState<'ide' | 'notes'>('ide');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

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

  // Handle route query params - show project picker or toast
  useEffect(() => {
    if (workspace) {
      // DEFERRED (ADR-034): Redirect knowledge/study workspace requests to 'notes'
      if (workspace === 'knowledge' || workspace === 'study') {
        navigate({
          to: '/hub',
          search: { workspace: 'notes', action: 'create-project' },
          replace: true,
        });
        return;
      }

      // User clicked workspace from sidebar without project - show picker
      setProjectPickerWorkspace(workspace);
      setProjectPickerOpen(true);
    } else if (action === 'create-project') {
      // User clicked "Create Project" button - open wizard directly
      setProjectCreationWizardOpen(true);
      if (message) {
        toast.info(message, {
          duration: 6000,
        });
      }
    }
  }, [workspace, action, message]);

  // -- Project Picker Handler --
  // DEFERRED (ADR-034): Knowledge and Study workspaces removed from UI
  const openProjectPicker = (targetWorkspace: 'ide' | 'notes') => {
    setProjectPickerWorkspace(targetWorkspace);
    setProjectPickerOpen(true);
  };

  // -- Workspace Navigation with Project Picker --
  // DEFERRED (ADR-034): Knowledge and Study workspaces removed from UI
  const navigateToWorkspace = async (workspace: 'ide' | 'notes') => {
    if (!projects || projects.length === 0) {
      toast.info(`No projects yet`, {
        description: `Create or mount a project first to access to ${workspace} workspace.`,
        duration: 5000,
      });
      return;
    }

    // Filter projects by workspace - show ALL projects for the requested workspace
    const workspaceProjects = (projects || []).filter(p => {
      // Check workspace bindings to determine which projects belong to each workspace
      const isIdeWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'ide');
      const isNotesWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'notes');
      // TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
      // Workspace checks retained for backward compatibility, restore when implementing
      // const isKnowledgeWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'knowledge');
      // const isStudyWorkspace = isWorkspaceEnabled(p.workspaceBindings, 'study');

      // Return true if project belongs to requested workspace
      switch (workspace) {
        case 'ide': return isIdeWorkspace;
        case 'notes': return isNotesWorkspace;
        // TODO: Restore when Knowledge/Study workspaces implemented
        // case 'knowledge': return isKnowledgeWorkspace;
        // case 'study': return isStudyWorkspace;
        default: return true;
      }
    });

    if (workspaceProjects.length === 1) {
      // Only one project - navigate directly to project-centric route
      // Per new-fundamental-truths.md: Platform determines plugins, not workspace routes
      await navigate({
        to: '/$projectId',
        params: { projectId: workspaceProjects[0].id }
      });
    } else {
      // Multiple projects - show picker
      openProjectPicker(workspace);
    }
  };

  // Helper function to check if workspace is enabled in bindings
  // DEFERRED (ADR-034): Knowledge and Study workspaces removed from UI
  function isWorkspaceEnabled(bindings: WorkspaceBindings | undefined, workspaceType: 'ide' | 'notes'): boolean {
    if (!bindings) return false;
    return bindings[workspaceType] === true;
  };

  // -- Handlers --

  const handleOpenProjectCreationWizard = () => {
    setProjectCreationWizardOpen(true);
  };

  const handleProjectCreated = (projectId: string, fsaHandle?: FileSystemDirectoryHandle | null) => {
    toast.success(t('hub.projectCreated', 'Project created successfully'), {
      description: t('hub.projectCreatedDesc', 'Your project is ready to use'),
      duration: 3000,
    });

    // BUG-017 FIX: Navigate to the INTENDED workspace, not always IDE
    // When user clicks Notes → creates project, they want Notes, not IDE!

    const project = useProjectStore.getState().getProject(projectId);
    if (!project) return;


    console.log('[HubHomePage] handleProjectCreated:', {
      projectId,
      projectPickerWorkspace, // The workspace user originally intended to access
      platform: getPlatformInfoForLogging(),
      projectStorageType: project.storageType,
    });

    // CC-03.5 FIX: Use state updater function pattern for proper TanStack Router typing
    // TanStack Router expects `state: (prev) => newState` for custom state objects
    const stateUpdater = (prev: HistoryState): HistoryState => ({ ...prev, fsaHandle });

    // BUG-017 FIX: If user was navigating to a specific workspace (via ProjectPicker),
    // respect that choice instead of defaulting to IDE
    // Project-centric navigation: Always navigate to /$projectId
    // Platform detection will determine appropriate plugins
    // Per new-fundamental-truths.md Section 1.2

    // Project-centric navigation: Always navigate to /$projectId
    // Platform detection will determine appropriate plugins
    console.log('[HubHomePage] Navigating to project-centric route:', projectId);
    navigate({ to: '/$projectId', params: { projectId }, state: stateUpdater });
  };

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

      // 2. Create Project via consolidated function (prevents duplicate creation)
      // V3-FIX-002: Use createProjectFromFolder instead of inline creation
      // This prevents race conditions and duplicate project creation
      const newProjectId = await createProjectFromFolder(handle, handle.name);
      console.log('[HubHomePage] Created project via createProjectFromFolder:', newProjectId);

      // 3. Navigate to Workspace
      // BUG-017 FIX: Respect intended workspace if specified
      // ARCH-01-06: Handle is persisted by createProjectFromFolder(), no need to pass via state
      // Project-centric navigation: Always navigate to /$projectId
      // Platform detection will determine appropriate plugins
      console.log('[HubHomePage] Navigating to project-centric route:', newProjectId);
      await navigate({
        to: '/$projectId',
        params: { projectId: newProjectId },
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

    // Navigate directly to the first available workspace
    // Priority: ide > knowledge > notes > study (ARC-D03: workspaceBindings)
    const bindings = project.workspaceBindings || project.bindings as WorkspaceBindings | Record<string, string> | undefined;

    // Handle both new format (boolean) and legacy format (string)
    const isEnabled = (value: boolean | string | undefined): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value === 'true';
      return false;
    };

    // Project-centric navigation: Always navigate to /$projectId
    // Platform detection will determine appropriate plugins
    // Per new-fundamental-truths.md Section 1.2
    if (isEnabled(bindings?.ide) || isEnabled(bindings?.notes) || isEnabled(bindings?.knowledge) || isEnabled(bindings?.study)) {
      navigate({ to: '/$projectId', params: { projectId } });
    } else {
      // No workspaces enabled - fall back to opening dialog for configuration
      setSelectedProject(project as unknown as Project);
      setDialogOpen(true);
    }
  };

  const handleWorkspaceBindingConfirm = async (
    bindings: WorkspaceBindings,
    _initialWorkspace: string // Unused - project-centric navigation
  ) => {
    if (!selectedProject) return;

    try {
      // 1. Fetch project, update bindings, and save back
      const project = await db.projects.get(selectedProject.id);
      if (project) {
        const updated = {
          ...project,
          bindings: bindings as Record<string, string>,
          lastOpened: new Date(),
        };
        await db.projects.put(updated);
      }

      // 2. Close dialog
      setDialogOpen(false);

      // 3. Navigate to project-centric route
      // Platform detection determines plugins, not workspace selection
      await navigate({
        to: '/$projectId',
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
      title: t('hub.menu.createProject', 'CREATE_PROJECT'),
      description: t('hub.newProjectDesc', 'Initialize a new workspace entry'),
      icon: <Plus className="h-8 w-8" />,
      topic: 'Workspace',
      onClick: handleOpenProjectCreationWizard,
      className: 'bg-primary/5 border-primary/20 hover:border-primary/50',
    },
    {
      id: 'notes',
      size: 'medium',
      title: t('hub.menu.notes', 'FIELD_NOTES'),
      description: t('hub.notesDesc', 'Quick access to scratchpad'),
      icon: <Notebook className="h-8 w-8" />,
      topic: 'Notes',
      onClick: () => navigateToWorkspace('notes'),
      className: 'bg-green-500/5 border-green-500/20 hover:border-green-500/50',
    },
    {
      id: 'ai-agents',
      size: 'small',
      title: t('hub.menu.agents', 'NEURAL_AGENTS'),
      icon: <Cpu className="h-6 w-6" />,
      topic: 'Agents',
      onClick: () => {
        toast.info("Agents Workspace Coming Soon", {
          description: "The AI Agents workspace will be available in a future update.",
        });
      },
    },
    // TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
    // Menu items removed from UI but backend types retained for backward compatibility
    // {
    //   id: 'knowledge',
    //   size: 'small',
    //   title: t('hub.menu.knowledge', 'DATA_BANK'),
    //   icon: <HardDrive className="h-6 w-6" />,
    //   topic: 'Knowledge',
    //   onClick: () => navigateToWorkspace('knowledge'),
    // },
    // {
    //   id: 'docs',
    //   size: 'small',
    //   title: t('hub.menu.study', 'STUDY_CORE'),
    //   icon: <BookOpen className="h-6 w-6" />,
    //   topic: 'Study',
    //   onClick: () => navigateToWorkspace('study'),
    // },
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
  ], [t, navigate, handleNewProject, navigateToWorkspace]);

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

      {/* Quick Actions Section - UX-07 */}
      <section className="space-y-3">
        <h2 className="text-sm font-pixel text-muted-foreground uppercase tracking-wider">
          {t('hub.quickActions.title', 'Quick Actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={<Plus size={24} />}
            label={t('hub.quickActions.newProject', 'New Project')}
            description={t('hub.newProjectDesc', 'Initialize a new workspace entry')}
            onClick={handleOpenProjectCreationWizard}
          />
          <QuickActionCard
            icon={<FolderOpen size={24} />}
            label={t('hub.quickActions.openProject', 'Open Project')}
            description={t('hub.openProjectDesc', 'Mount an existing folder')}
            onClick={handleNewProject}
          />
          <QuickActionCard
            icon={<NotebookPen size={24} />}
            label={t('hub.quickActions.quickNote', 'Quick Note')}
            onClick={() => navigateToWorkspace('notes')}
          />
          <QuickActionCard
            icon={<Bot size={24} />}
            label={t('hub.quickActions.newAgent', 'New Agent')}
            onClick={() => navigate({ to: '/agents' })}
          />
        </div>
      </section>

      {/* Quick Search Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAdvancedSearchOpen(true)}
          leftIcon={<Search className="w-4 h-4" />}
        >
          {t('search.advancedSearch', 'Advanced Search')}
          <kbd className="ml-2 px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-none font-mono">
            Cmd+Shift+F
          </kbd>
        </Button>
      </div>

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

      {/* Project Picker Dialog for workspace navigation */}
      <ProjectPickerDialog
        open={projectPickerOpen}
        onOpenChange={setProjectPickerOpen}
        targetWorkspace={projectPickerWorkspace}
        onCreateNew={handleOpenProjectCreationWizard}
      />

      {/* Project Creation Wizard */}
      <ProjectCreationWizard
        open={projectCreationWizardOpen}
        onOpenChange={setProjectCreationWizardOpen}
        onProjectCreated={handleProjectCreated}
      />

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onOpenChange={setAdvancedSearchOpen}
        availableTags={[]} // TODO: Populate from actual tags
        availableAuthors={[]} // TODO: Populate from actual authors
        onSelectResult={(result) => {
          // TODO: Handle result selection (open file, navigate to project, etc.)
          toast.info('Search result selected', {
            description: result.document.filename,
          });
        }}
      />
    </div>
  );
};
