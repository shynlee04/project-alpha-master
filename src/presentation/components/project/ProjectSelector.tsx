/**
 * @fileoverview Project Selector Component
 * @module presentation/components/project/ProjectSelector
 * @governance STORAGE-4-2
 * @created 2026-01-07
 *
 * Reusable project selector dropdown for all workspaces.
 * Features:
 * - Dropdown menu with project list
 * - Search capability (via Select primitive)
 * - Storage type badges
 * - Mobile compatibility
 * - Active project highlighting
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Folder, Database, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/presentation/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
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
  const [open, setOpen] = React.useState(false);

  // Sort projects: active first, then by lastOpened
  const sortedProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.id === activeProject?.id) return -1;
      if (b.id === activeProject?.id) return 1;
      return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
    });
  }, [projects, activeProject]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
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
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", variant === 'default' ? "w-[250px]" : "w-[180px]")}>
        <Command>
          <CommandInput placeholder={t('hub.projectSearch.placeholder', 'Search projects...')} />
          <CommandList>
            <CommandEmpty>{t('hub.projectSearch.noResults', 'No projects found.')}</CommandEmpty>
            <CommandGroup>
              {sortedProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.name}
                  onSelect={() => {
                    onSelect(project.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      activeProject?.id === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {project.storageType === 'indexeddb' ? (
                      <Database className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <HardDrive className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">{project.name}</span>
                  </div>
                  {project.storageType === 'fsa' && (
                    <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1 rounded">
                      FSA
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
