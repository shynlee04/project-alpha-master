/**
 * @fileoverview Project Search Bar Component
 * @module presentation/components/hub/ProjectSearchBar
 * @created 2026-01-02T23:35:00+07:00
 *
 * Search input with command palette for project filtering.
 * Uses cmdk library for keyboard navigation and fuzzy search.
 *
 * @see Research: _bmad-output/project-search-bar-research-january-2026.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Command } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'cmdk';
import { cn } from '@/lib/utils';
import type { ProjectMetadata } from '@/lib/workspace/project-store';
import { useProjectSearch, type UseProjectSearchResult } from './useProjectSearch';

export interface ProjectSearchBarProps {
  /** All projects to search through */
  projects: ProjectMetadata[];
  /** Callback when project is selected */
  onProjectSelect: (project: ProjectMetadata) => void;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Optional additional CSS classes for trigger button */
  className?: string;
  /** Optional additional CSS classes for dialog */
  dialogClassName?: string;
}

/**
 * Project search bar with command palette.
 *
 * Features:
 * - Global keyboard shortcut (Cmd+K / Ctrl+K)
 * - 300ms debounced search
 * - Fuzzy matching on name and path
 * - Keyboard navigation (arrow keys, Enter to select)
 * - Empty state with helpful message
 * - Loading state during debounce
 * - Mobile-responsive full-screen dialog
 *
 * @example
 * ```tsx
 * <ProjectSearchBar
 *   projects={projects}
 *   onProjectSelect={(project) => handleProjectOpen(project)}
 *   placeholder="Search projects..."
 * />
 * ```
 */
export const ProjectSearchBar: React.FC<ProjectSearchBarProps> = ({
  projects,
  onProjectSelect,
  placeholder,
  className,
  dialogClassName,
}) => {
  const { t } = useTranslation();

  const {
    searchQuery,
    setSearchQuery,
    isDebouncing,
    filteredProjects,
    isOpen,
    open,
    close,
  } = useProjectSearch(projects, false);

  const handleProjectSelect = (project: ProjectMetadata) => {
    onProjectSelect(project);
    close();
  };

  const defaultPlaceholder = placeholder ||
    t('hub.projectSearch.placeholder', 'Search projects...');

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={open}
        className={cn(
          "flex items-center gap-2 px-3 py-2",
          "border-2 border-border rounded-md",
          "bg-background hover:bg-muted/50",
          "text-sm text-muted-foreground",
          "transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">
          {defaultPlaceholder}
        </span>
        <kbd
          className={cn(
            "pointer-events-none inline-flex h-5 select-none",
            "items-center gap-1 rounded border border-border",
            "bg-muted px-1.5 font-mono text-[10px]",
            "font-medium text-muted-foreground opacity-100"
          )}
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={isOpen} onOpenChange={close}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
              "data-[state=open]:animate-in",
              "data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0",
              "data-[state=open]:fade-in-0"
            )}
          />
          <Dialog.Content
            className={cn(
              "fixed left-[50%] top-[20%] z-50",
              "w-full max-w-lg translate-x-[-50%]",
              "border-2 border-border bg-background shadow-lg",
              "duration-200 data-[state=open]:animate-in",
              "data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              "sm:rounded-lg",
              dialogClassName
            )}
          >
            <Command className="max-h-[500px] overflow-y-auto">
              {/* Search Input */}
              <div className="flex items-center border-b border-border px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder={defaultPlaceholder}
                  className={cn(
                    "flex h-11 w-full rounded-md bg-transparent py-3 text-sm",
                    "outline-none placeholder:text-muted-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                />
                {isDebouncing && (
                  <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                )}
              </div>

              {/* Search Results */}
              <CommandList>
                {/* Empty State */}
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {t('hub.projectSearch.noResults', 'No projects found')}
                  </div>
                </CommandEmpty>

                {/* Project List */}
                <CommandGroup
                  heading={t('hub.projectSearch.results', 'Projects')}
                  className="p-2"
                >
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => handleProjectSelect(project)}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2",
                        "rounded-md text-sm",
                        "data-[selected=true]:bg-accent",
                        "data-[selected=true]:text-accent-foreground",
                        "cursor-pointer transition-colors"
                      )}
                    >
                      <div className="flex-1 truncate">
                        <div className="font-medium text-foreground">
                          {project.name}
                        </div>
                        {project.path && (
                          <div className="text-xs text-muted-foreground truncate">
                            {project.path}
                          </div>
                        )}
                      </div>
                      <Command className="h-4 w-4 shrink-0 opacity-50" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>

              {/* Footer Hint */}
              <div className="border-t border-border p-2">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <kbd
                      className={cn(
                        "pointer-events-none inline-flex h-5",
                        "select-none items-center rounded border",
                        "border-border bg-muted px-1.5 font-mono",
                        "text-[10px] font-medium opacity-100"
                      )}
                    >
                      ↑↓
                    </kbd>
                    <span>{t('hub.projectSearch.navigate', 'to navigate')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd
                      className={cn(
                        "pointer-events-none inline-flex h-5",
                        "select-none items-center rounded border",
                        "border-border bg-muted px-1.5 font-mono",
                        "text-[10px] font-medium opacity-100"
                      )}
                    >
                      ↵
                    </kbd>
                    <span>{t('hub.projectSearch.select', 'to select')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd
                      className={cn(
                        "pointer-events-none inline-flex h-5",
                        "select-none items-center rounded border",
                        "border-border bg-muted px-1.5 font-mono",
                        "text-[10px] font-medium opacity-100"
                      )}
                    >
                      esc
                    </kbd>
                    <span>{t('hub.projectSearch.close', 'to close')}</span>
                  </div>
                </div>
              </div>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </CommandDialog>
    </>
  );
};
