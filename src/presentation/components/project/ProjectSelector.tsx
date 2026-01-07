/**
 * @fileoverview Project Selector Component
 * @module presentation/components/project/ProjectSelector
 * @governance STORAGE-4-2
 * @created 2026-01-07
 * @updated 2026-01-07T06:30:00+07:00 - NS-2026-01-07: Add temp badge for auto-created projects
 *
 * Reusable project selector dropdown for all workspaces.
 * Uses only existing UI components (DropdownMenu, Button).
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Folder, Database, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

export interface ProjectSelectorProps {
  /** List of available projects */
  projects: Project[];
  /** Currently active project */
  activeProject?: Project;
  /** Callback when a project is selected */
  onSelect: (projectId: string) => void;
  /** Custom class name */
  className?: string;
  /** Variant for different contexts */
  variant?: 'default' | 'compact';
  /** Whether the selector is disabled */
  disabled?: boolean;
}

export function ProjectSelector({
  projects,
  activeProject,
  onSelect,
  className,
  variant = 'default',
  disabled = false,
}: ProjectSelectorProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Sort projects: active first, then by lastOpened
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.id === activeProject?.id) return -1;
      if (b.id === activeProject?.id) return 1;
      return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
    });
  }, [projects, activeProject]);

  // Filter projects by search query
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery) return sortedProjects;
    const query = searchQuery.toLowerCase();
    return sortedProjects.filter(p => p.name.toLowerCase().includes(query));
  }, [sortedProjects, searchQuery]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "justify-between",
            variant === 'default' ? "w-[250px]" : "w-[180px]",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {activeProject ? (
              <>
                {activeProject.storageType === 'indexeddb' ? (
                  <Database className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{activeProject.name}</span>
              </>
            ) : (
              <>
                <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{t('common.select', 'Select project...')}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(variant === 'default' ? "w-[250px]" : "w-[180px]")}
      >
        {/* Search input */}
        <div className="p-2 sticky top-0 bg-popover">
          <input
            type="text"
            placeholder={t('hub.projectSearch.placeholder', 'Search...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="py-6 px-2 text-center text-sm text-muted-foreground">
              {t('hub.projectSearch.noResults', 'No projects found.')}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onSelect={() => {
                  onSelect(project.id);
                  setSearchQuery('');
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    activeProject?.id === project.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {project.storageType === 'indexeddb' ? (
                  <Database className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />
                ) : (
                  <HardDrive className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />
                )}
                <span className="truncate flex-1">{project.name}</span>
                {project.isTemp && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-1 rounded shrink-0" title="Auto-created temporary project">
                    Temp
                  </span>
                )}
                {project.storageType === 'fsa' && !project.isTemp && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded shrink-0">
                    FSA
                  </span>
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
