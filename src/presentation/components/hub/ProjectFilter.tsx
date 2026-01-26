/**
 * @fileoverview Project Filter Component
 * @module presentation/components/hub/ProjectFilter
 * @created 2026-01-03T00:05:00+07:00
 * @updated 2026-01-26 (renamed from WorkspaceFilter)
 *
 * Multi-select filter component for project bindings.
 * Uses Radix UI Dropdown Menu with checkboxes.
 *
 * @see Research: _bmad-output/workspace-filter-research-january-2026.md
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Filter, ChevronDown, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { useWorkspaceFilters, type WorkspaceFilterType, type UseWorkspaceFiltersResult } from './useWorkspaceFilters';

export interface ProjectFilterProps {
  /** Optional initial filters (default: all true) */
  defaultFilters?: Parameters<typeof useWorkspaceFilters>[0];
  /** Callback when filters change */
  onFiltersChange?: (filters: UseWorkspaceFiltersResult['filters']) => void;
  /** Whether to sync filters with URL (default: true) */
  syncWithURL?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

// Workspace configuration with icons and labels
// NOTE: Knowledge and Study workspaces are DEFERRED (ADR-034)
// TODO: Re-add when these workspaces are implemented
const WORKSPACES: { id: WorkspaceFilterType; icon: string; labelKey: string }[] = [
  { id: 'ide', icon: '💻', labelKey: 'hub.workspaceBinding.workspaces.ide' },
  { id: 'notes', icon: '📝', labelKey: 'hub.workspaceBinding.workspaces.notes' },
  // Deferred: { id: 'knowledge', icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
  // Deferred: { id: 'study', icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
];

/**
 * Project filter component with multi-select dropdown.
 *
 * Features:
 * - Multi-select dropdown with checkboxes
 * - Filter badge display showing active filters
 * - Select/deselect all functionality
 * - URL persistence via TanStack Router search params
 * - Mobile-responsive (full width on mobile)
 * - Accessibility (ARIA labels, keyboard navigation)
 *
 * @example
 * ```tsx
 * <ProjectFilter
 *   onFiltersChange={(filters) => handleFilterChange(filters)}
 *   syncWithURL={true}
 * />
 * ```
 */
export const ProjectFilter: React.FC<ProjectFilterProps> = ({
  defaultFilters,
  onFiltersChange,
  syncWithURL = true,
  className,
}) => {
  const { t } = useTranslation();

  const {
    filters,
    setFilter,
    selectAll,
    deselectAll,
    activeCount,
    allSelected,
    noneSelected,
    partiallySelected: _partiallySelected,
    activeWorkspaces,
  } = useWorkspaceFilters(defaultFilters, syncWithURL);

  // Notify parent of filter changes
  React.useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Filter Badge Display */}
      <div className="flex items-center gap-1">
        <Filter className="h-4 w-4 text-muted-foreground" />

        {/* Active Filter Badges */}
        {activeWorkspaces.length > 0 && activeWorkspaces.length < 2 && (
          <div className="flex items-center gap-1">
            {activeWorkspaces.map((workspace) => {
              const workspaceConfig = WORKSPACES.find((ws) => ws.id === workspace);
              if (!workspaceConfig) return null;

              return (
                <span
                  key={workspace}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
                    "bg-primary/10 text-primary text-xs font-medium",
                    "border border-primary/20"
                  )}
                >
                  <span>{workspaceConfig.icon}</span>
                  <span className="hidden sm:inline">
                    {t(workspaceConfig.labelKey, workspace.toUpperCase())}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilter(workspace, false)}
                    className={cn(
                      "hover:bg-primary/20 rounded-sm",
                      "focus:outline-none focus:ring-1 focus:ring-ring"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Active Count Badge */}
        {(activeWorkspaces.length === 0 || activeWorkspaces.length === 2) && (
          <span className="text-sm text-muted-foreground">
            {activeWorkspaces.length === 0
              ? t('hub.projectFilter.none', 'None')
              : t('hub.projectFilter.all', 'All')
            }
          </span>
        )}

        {/* Count Badge */}
        {activeWorkspaces.length > 0 && activeWorkspaces.length < 2 && (
          <span className="text-sm text-muted-foreground">
            {activeCount} {t('hub.projectFilter.selected', 'selected')}
          </span>
        )}
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5",
              "border-2 border-border rounded-md",
              "bg-background hover:bg-muted/50",
              "text-sm text-foreground",
              "transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          >
            <span>{t('hub.projectFilter.filter', 'Filter')}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={cn(
              "z-50 min-w-[200px] overflow-hidden rounded-md border-2 border-border bg-background p-1",
              "shadow-lg",
              "data-[state=open]:animate-in",
              "data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0",
              "data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95",
              "data-[state=open]:zoom-in-95"
            )}
          >
            {/* Select/Deselect All */}
            {!noneSelected && (
              <>
                <DropdownMenu.Item
                  onSelect={selectAll}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  {t('hub.projectFilter.selectAll', 'Select All')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
              </>
            )}

            {!allSelected && !noneSelected && (
              <DropdownMenu.Item
                onSelect={deselectAll}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "focus:bg-accent focus:text-accent-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
              >
                {t('hub.projectFilter.deselectAll', 'Deselect All')}
              </DropdownMenu.Item>
            )}

            {/* Workspace Checkboxes */}
            {WORKSPACES.map((workspace) => {
              const isChecked = filters[workspace.id];

              return (
                <DropdownMenu.Item
                  key={workspace.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    setFilter(workspace.id, !isChecked);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border-2 border-primary/20",
                        isChecked && "bg-primary border-primary"
                      )}
                    >
                      {isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span>{workspace.icon}</span>
                      <span>
                        {t(workspace.labelKey, workspace.id.toUpperCase())}
                      </span>
                    </span>
                  </div>
                </DropdownMenu.Item>
              );
            })}

            {/* Clear All */}
            {!noneSelected && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  onSelect={deselectAll}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  {t('hub.projectFilter.clearAll', 'Clear All')}
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
