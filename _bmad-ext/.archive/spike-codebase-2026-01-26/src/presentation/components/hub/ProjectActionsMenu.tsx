/**
 * ProjectActionsMenu Component
 *
 * Dropdown menu for project CRUD operations (Edit, Delete, Open, Settings).
 * Uses Radix UI DropdownMenu with Portal rendering for accessibility.
 *
 * @file ProjectActionsMenu.tsx
 * @created 2026-01-02T12:30:00+07:00
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectActionsMenuProps {
  /** Project ID for action handlers */
  projectId: string;
  /** Project name for display in delete confirmation */
  projectName: string;
  /** Callback when edit action is selected */
  onEdit?: (projectId: string) => void;
  /** Callback when delete action is selected */
  onDelete?: (projectId: string) => void;
  /** Callback when open action is selected */
  onOpen?: (projectId: string) => void;
  /** Callback when settings action is selected */
  onSettings?: (projectId: string) => void;
  /** Additional CSS classes for trigger button */
  className?: string;
  /** Optional trigger component (defaults to MoreVertical icon) */
  trigger?: React.ReactNode;
}

/**
 * Dropdown menu for project management actions.
 *
 * Features:
 * - Portal rendering (prevents z-index conflicts)
 * - Keyboard navigation (Arrow keys, Enter/Space, Escape)
 * - ARIA labels for screen readers
 * - Destructive styling for delete action
 *
 * @example
 * ```tsx
 * <ProjectActionsMenu
 *   projectId="proj-123"
 *   projectName="My Project"
 *   onEdit={(id) => openEditDialog(id)}
 *   onDelete={(id) => openDeleteDialog(id)}
 *   onOpen={(id) => openProject(id)}
 *   onSettings={(id) => openSettings(id)}
 * />
 * ```
 */
export const ProjectActionsMenu: React.FC<ProjectActionsMenuProps> = ({
  projectId,
  projectName: _projectName,
  onEdit,
  onDelete,
  onOpen,
  onSettings,
  className,
  trigger,
}) => {
  const { t } = useTranslation();

  const handleEdit = () => {
    onEdit?.(projectId);
  };

  const handleDelete = () => {
    onDelete?.(projectId);
  };

  const handleOpen = () => {
    onOpen?.(projectId);
  };

  const handleSettings = () => {
    onSettings?.(projectId);
  };

  const defaultTrigger = (
    <button
      className={cn(
        "p-2 hover:bg-muted rounded transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label={t('hub.project.actions.menuTrigger', 'Project actions')}
    >
      <MoreVertical className="h-4 w-4 text-muted-foreground" />
    </button>
  );

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            "min-w-[160px] bg-background border border-border/60",
            "rounded-md shadow-md p-1",
            "z-50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2"
          )}
          sideOffset={5}
          align="end"
          collisionPadding={10}
        >
          {/* Open Project */}
          {onOpen && (
            <DropdownMenu.Item
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "text-sm text-foreground",
                "hover:bg-muted hover:text-foreground",
                "focus:outline-none focus:bg-muted focus:text-foreground",
                "cursor-pointer rounded",
                "transition-colors"
              )}
              onSelect={handleOpen}
              aria-label={t('hub.project.actions.open', 'Open project')}
            >
              <FolderOpen className="h-4 w-4" />
              <span>{t('hub.project.actions.open', 'Open')}</span>
            </DropdownMenu.Item>
          )}

          {/* Edit Project */}
          {onEdit && (
            <DropdownMenu.Item
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "text-sm text-foreground",
                "hover:bg-muted hover:text-foreground",
                "focus:outline-none focus:bg-muted focus:text-foreground",
                "cursor-pointer rounded",
                "transition-colors"
              )}
              onSelect={handleEdit}
              aria-label={t('hub.project.actions.edit', 'Edit project metadata')}
            >
              <Edit2 className="h-4 w-4" />
              <span>{t('hub.project.actions.edit', 'Edit')}</span>
            </DropdownMenu.Item>
          )}

          {/* Settings */}
          {onSettings && (
            <DropdownMenu.Item
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "text-sm text-foreground",
                "hover:bg-muted hover:text-foreground",
                "focus:outline-none focus:bg-muted focus:text-foreground",
                "cursor-pointer rounded",
                "transition-colors"
              )}
              onSelect={handleSettings}
              aria-label={t('hub.project.actions.settings', 'Project settings')}
            >
              <Settings className="h-4 w-4" />
              <span>{t('hub.project.actions.settings', 'Settings')}</span>
            </DropdownMenu.Item>
          )}

          {/* Separator */}
          {(onOpen || onEdit || onSettings) && onDelete && (
            <DropdownMenu.Separator className="h-px bg-border my-1" />
          )}

          {/* Delete Project (Destructive) */}
          {onDelete && (
            <DropdownMenu.Item
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "text-sm text-destructive",
                "hover:bg-destructive/10 hover:text-destructive",
                "focus:outline-none focus:bg-destructive/10 focus:text-destructive",
                "cursor-pointer rounded",
                "transition-colors"
              )}
              onSelect={handleDelete}
              aria-label={t('hub.project.actions.delete', 'Delete project')}
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('hub.project.actions.delete', 'Delete')}</span>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Arrow className="fill-border" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
