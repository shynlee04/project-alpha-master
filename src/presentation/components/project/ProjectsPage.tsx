/**
 * @fileoverview Projects Page Component
 * @module presentation/components/project/ProjectsPage
 * @governance P0-CRITICAL-001 Fix
 *
 * Dedicated projects management page with project listing, creation,
 * search, and workspace navigation capabilities.
 *
 * @see Research: HubHomePage project extraction pattern
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Search,
  Folder,
  SortAsc,
  SortDesc,
} from 'lucide-react';

import { db } from '@/infrastructure/persistence/dexie-db';
import { cn } from '@/lib/utils';
import type { ProjectRecord } from '@/infrastructure/persistence/dexie-db-core-types';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import { ProjectCreationWizard } from './ProjectCreationWizard';
import { ProjectCard } from '@/presentation/components/hub/ProjectCard';
import { WorkspaceBindingDialog } from '@/presentation/components/hub/WorkspaceBindingDialog';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

type SortField = 'name' | 'lastOpened' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

/**
 * Convert ProjectRecord (Dexie) to Project (store type)
 * Adds default values for properties not in the database schema
 */
function toProject(record: ProjectRecord): Project {
  return {
    id: record.id,
    name: record.name,
    folderPath: record.path,
    storageType: record.storageType || 'indexeddb',
    lastOpened: record.lastOpened,
    createdAt: record.createdAt,
    bindings: record.bindings as Project['bindings'] || {},
    autoSync: true, // Default value not stored in DB
    tags: [], // Default value not stored in DB
    fileSnapshotEnabled: record.fileSnapshotEnabled,
    isTemp: record.isTemp,
    autoCreated: record.autoCreated,
  };
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectsPage - Project management and listing
 *
 * Features:
 * - Full project list (not just recent)
 * - Search by project name
 * - Sort by name, last opened, or created date
 * - Create new project button
 * - Project cards with workspace badges
 * - 8-bit gaming style design
 */
export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Data fetching
  const projects = useLiveQuery(() => db.projects.toArray());
  const isLoading = projects === undefined;

  // UI state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortField: 'lastOpened',
    sortOrder: 'desc',
  });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [bindingDialogOpen, setBindingDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let filtered = [...projects] as ProjectRecord[];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastOpened':
          const dateA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
          const dateB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'createdAt':
          const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = createdA - createdB;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered.map(toProject);
  }, [projects, filters]);

  // Handlers
  const handleCreateProject = () => {
    setWizardOpen(true);
  };

  const handleProjectCreated = (projectId: string) => {
    toast.success(t('projects.created', 'Project created successfully'), {
      description: t('projects.createdDesc', 'Your project is ready to use'),
    });
    
    // ARC-A06: Platform-aware redirect after project creation
    // Per ADR-033: Desktop FSA → IDE, Desktop IndexedDB → Notes, Mobile → Notes
    const project = useProjectStore.getState().getProject(projectId);
    const platform = getPlatformContract();
    
    if (platform.canAccessIDE && project?.storageType === 'fsa') {
      // Desktop with FSA: Navigate to IDE (full file system access)
      navigate({ to: '/ide/$projectId', params: { projectId } });
    } else {
      // Mobile OR Desktop with IndexedDB: Navigate to Notes
      navigate({ to: '/notes/$projectId', params: { projectId } });
    }
  };

  const handleOpenProject = (projectId: string) => {
    const project = (projects || []).find(p => p.id === projectId);
    if (!project) return;

    setSelectedProject(toProject(project));
    setBindingDialogOpen(true);
  };

  const handleWorkspaceBindingConfirm = async (
    bindings: any,
    initialWorkspace: string
  ) => {
    if (!selectedProject) return;

    try {
      // Update project bindings
      const project = await db.projects.get(selectedProject.id);
      if (project) {
        const updated = {
          ...project,
          bindings: bindings as Record<string, string>,
          lastOpened: new Date(),
        };
        await db.projects.put(updated);
      }

      // Close dialog
      setBindingDialogOpen(false);

      // Navigate to selected workspace
      await navigate({
        to: `/${initialWorkspace}/$projectId`,
        params: { projectId: selectedProject.id }
      });
    } catch (error) {
      console.error('Failed to open project:', error);
      toast.error(t('projects.openFailed', 'Failed to open project'));
    }
  };

  const toggleSort = (field: SortField) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('projects.loading', 'Loading projects...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Folder className="h-8 w-8" />
            {t('projects.title', 'Projects')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('projects.subtitle', 'Manage your projects and workspaces')}
          </p>
        </div>

        <Button
          onClick={handleCreateProject}
          className="min-h-[44px] px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('projects.create', 'Create Project')}
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-4">
        <span>
          {t('projects.totalCount', '{{count}} projects', { count: filteredProjects.length })}
        </span>
        {projects && filteredProjects.length !== projects.length && (
          <span>
            {t('projects.filteredCount', '{{count}} filtered', { count: filteredProjects.length })}
          </span>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('projects.searchPlaceholder', 'Search projects...')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 min-h-[44px]"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('name')}
            className={cn(
              "min-h-[44px]",
              filters.sortField === 'name' && "bg-primary/10 border-primary"
            )}
          >
            {t('projects.sortName', 'Name')}
            {filters.sortField === 'name' && (
              filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-2" /> : <SortDesc className="w-4 h-4 ml-2" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('lastOpened')}
            className={cn(
              "min-h-[44px]",
              filters.sortField === 'lastOpened' && "bg-primary/10 border-primary"
            )}
          >
            {t('projects.sortLastOpened', 'Last Opened')}
            {filters.sortField === 'lastOpened' && (
              filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-2" /> : <SortDesc className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {projects && projects.length === 0
              ? t('projects.empty.title', 'No projects yet')
              : t('projects.empty.noMatch', 'No projects found')}
          </h3>
          <p className="text-muted-foreground mb-6">
            {projects && projects.length === 0
              ? t('projects.empty.description', 'Create your first project to get started')
              : t('projects.empty.tryDifferentSearch', 'Try adjusting your search or filters')}
          </p>
          {projects && projects.length === 0 && (
            <Button onClick={handleCreateProject} className="min-h-[44px]">
              <Plus className="w-4 h-4 mr-2" />
              {t('projects.createFirst', 'Create Your First Project')}
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-border rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-3 bg-muted border-b-2 border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-8 md:col-span-5 pl-2">
              {t('projects.header.name', 'Project')}
            </div>
            <div className="col-span-3 md:col-span-2 hidden md:block">
              {t('projects.header.status', 'Status')}
            </div>
            <div className="col-span-4 md:col-span-3 text-right">
              {t('projects.header.lastOpened', 'Last Opened')}
            </div>
            <div className="col-span-2 md:col-span-2 text-right hidden md:block pr-2">
              {t('projects.header.size', 'Size')}
            </div>
          </div>

          {/* Project Rows */}
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project as Project}
              onOpen={handleOpenProject}
              className="border-b border-border last:border-b-0"
            />
          ))}
        </div>
      )}

      {/* Project Creation Wizard */}
      <ProjectCreationWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onProjectCreated={handleProjectCreated}
      />

      {/* Workspace Binding Dialog */}
      {selectedProject && (
        <WorkspaceBindingDialog
          project={selectedProject}
          open={bindingDialogOpen}
          onOpenChange={setBindingDialogOpen}
          onConfirm={handleWorkspaceBindingConfirm}
        />
      )}
    </div>
  );
};
