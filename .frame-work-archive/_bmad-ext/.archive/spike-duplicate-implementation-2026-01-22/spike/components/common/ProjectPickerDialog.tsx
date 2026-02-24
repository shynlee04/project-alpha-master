/**
 * @fileoverview Project Picker Dialog
 * @module presentation/components/hub/ProjectPickerDialog
 * @governance Story UJ-000: ProjectPickerDialog & Empty States
 * @created 2026-01-06T04:00:00+07:00
 *
 * Dialog for selecting a project when navigating to a workspace.
 * Filters projects by workspace binding (IDE, Notes, Knowledge, Study).
 * Shows empty state when no projects have the workspace enabled.
 *
 * Pattern: Follows WorkspaceBindingDialog.tsx structure
 * Size target: ≤300 lines
 *
 * @see WorkspaceBindingDialog for reference pattern
 */

import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Plus } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '@/spike/lib/utils';
import { db } from '@/spike/infrastructure/persistence/dexie-db';
import { useProjectStore } from '@/spike/infrastructure/persistence/stores/project/useProjectStore';
import type { ProjectRecord } from '@/spike/infrastructure/persistence/dexie-db';

// ============================================================================
// Types
// ============================================================================

/** Workspace type for project picker */
export type PickerWorkspace = 'ide' | 'notes' | 'knowledge' | 'study' | 'agents';

/** Props for ProjectPickerDialog */
export interface ProjectPickerDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Target workspace to filter projects by */
  targetWorkspace: PickerWorkspace;
  /** Callback when user clicks "Create New Project" button */
  onCreateNew?: () => void;
}

/** Workspace display configuration */
interface WorkspaceConfig {
  id: PickerWorkspace;
  icon: string;
  labelKey: string;
  emptyStateKey: string;
}

// ============================================================================
// Workspace Configuration
// ============================================================================

const WORKSPACE_CONFIG: Record<PickerWorkspace, WorkspaceConfig> = {
  ide: {
    id: 'ide',
    icon: '💻',
    labelKey: 'hub.workspaceBinding.workspaces.ide',
    emptyStateKey: 'hub.projectPicker.empty.ide',
  },
  notes: {
    id: 'notes',
    icon: '📝',
    labelKey: 'hub.workspaceBinding.workspaces.notes',
    emptyStateKey: 'hub.projectPicker.empty.notes',
  },
  knowledge: {
    id: 'knowledge',
    icon: '📚',
    labelKey: 'hub.workspaceBinding.workspaces.knowledge',
    emptyStateKey: 'hub.projectPicker.empty.knowledge',
  },
  study: {
    id: 'study',
    icon: '🎓',
    labelKey: 'hub.workspaceBinding.workspaces.study',
    emptyStateKey: 'hub.projectPicker.empty.study',
  },
  agents: {
    id: 'agents',
    icon: '🤖',
    labelKey: 'hub.workspaceBinding.workspaces.agents',
    emptyStateKey: 'hub.projectPicker.empty.agents',
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * ProjectPickerDialog - Project selection dialog for workspace navigation
 *
 * Features:
 * - Filters projects by workspace binding
 * - Shows empty state when no valid projects
 * - Displays project name, folder path, last opened time
 * - Navigates to /$workspace/$projectId on selection
 * - "Create Project" button in empty state
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [workspace, setWorkspace] = useState<PickerWorkspace>('ide');
 *
 * <ProjectPickerDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   targetWorkspace={workspace}
 * />
 * ```
 */
export const ProjectPickerDialog: React.FC<ProjectPickerDialogProps> = ({
  open,
  onOpenChange,
  targetWorkspace,
  onCreateNew,
}) => {
  const { t } = useTranslation();

  // FIX-2026-01-06: Read from Dexie directly (same source as Hub)
  // This ensures consistency - Hub and ProjectPicker see the same data
  const allProjectsFromDexie = useLiveQuery(() => db.projects.toArray(), []);
  // const _isLoading = allProjectsFromDexie === undefined; // TODO: For future implementation

  const projects = useMemo(() => {
    if (!allProjectsFromDexie) return [];
    return allProjectsFromDexie.filter((project) => {
      // Handle both legacy bindings and typed workspaceBindings (ARC-D03)
      // Note: PickerWorkspace includes 'agents' which may not exist in WorkspaceBindings
      const bindings = project.workspaceBindings || project.bindings as any;
      const binding = bindings?.[targetWorkspace];
      return binding === true || binding === 'true';
    });
  }, [allProjectsFromDexie, targetWorkspace]);

  const workspaceConfig = WORKSPACE_CONFIG[targetWorkspace];

  // Format last opened time for display
  const formatLastOpened = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('hub.projectPicker.lastOpen.justNow');
    if (diffMins < 60) return t('hub.projectPicker.lastOpen.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('hub.projectPicker.lastOpen.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('hub.projectPicker.lastOpen.daysAgo', { count: diffDays });
    return new Date(date).toLocaleDateString();
  };

  // Handle project selection
  const handleProjectSelect = (project: ProjectRecord) => {
    // Update last opened timestamp
    useProjectStore.getState().updateLastOpened(project.id);

    // Navigate to workspace-specific route with project
    // Use window.location for direct navigation (bypasses TanStack Router type issues)
    const routeMap: Record<PickerWorkspace, string> = {
      ide: '/ide',
      notes: '/notes',
      knowledge: '/knowledge',
      study: '/study',
      agents: '/agents',
    };

    window.location.href = `${routeMap[targetWorkspace]}/${project.id}`;
    onOpenChange(false);
  };

  // Handle create project (triggers wizard via callback)
  const handleCreateProject = () => {
    // Close the picker dialog
    onOpenChange(false);
    // Trigger the creation wizard callback
    onCreateNew?.();
  };

  const hasProjects = projects.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-background/95",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border-2 border-border bg-background p-6 shadow-lg",
            "duration-200 data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg"
          )}
        >
          {/* Header */}
          <Dialog.Title className="text-lg font-bold text-foreground">
            {workspaceConfig.icon} {t('hub.projectPicker.title', { workspace: t(workspaceConfig.labelKey) })}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground">
            {t('hub.projectPicker.description')}
          </Dialog.Description>

          {/* Content: Project List or Empty State */}
          {hasProjects ? (
            <div className="max-h-[300px] overflow-y-auto">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={cn(
                    "w-full text-left p-3 mb-2 border-2 border-border rounded-sm",
                    "hover:border-primary hover:bg-primary/5",
                    "transition-colors duration-150",
                    "focus:outline-none focus-visible:border-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {project.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {project.folderPath}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('hub.projectPicker.lastOpen.label')}: {formatLastOpened(project.lastOpened)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">{workspaceConfig.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('hub.projectPicker.empty.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t(workspaceConfig.emptyStateKey)}
              </p>
              <button
                onClick={handleCreateProject}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 border-2 border-border",
                  "bg-primary text-primary-foreground font-medium",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                <Plus className="w-4 h-4" />
                {t('hub.projectPicker.empty.createProject')}
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between gap-2">
            <button
              onClick={handleCreateProject}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 border-2 border-primary",
                "bg-primary text-primary-foreground font-medium",
                "hover:bg-primary/90 transition-colors"
              )}
            >
              <Plus className="w-4 h-4" />
              {t('hub.projectPicker.empty.createProject')}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className={cn(
                "px-4 py-2 border-2 border-border bg-background text-foreground",
                "hover:bg-muted transition-colors"
              )}
            >
              {t('common.cancel')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ============================================================================
// i18n Resource Keys (to be added to translation files)
// ============================================================================

/**
 * English keys to add:
 * hub.projectPicker.title: "Select {workspace} Project"
 * hub.projectPicker.description: "Choose a project to open in this workspace"
 * hub.projectPicker.lastOpen.label: "Last opened"
 * hub.projectPicker.lastOpen.justNow: "Just now"
 * hub.projectPicker.lastOpen.minutesAgo: "{count}m ago"
 * hub.projectPicker.lastOpen.hoursAgo: "{count}h ago"
 * hub.projectPicker.lastOpen.daysAgo: "{count}d ago"
 * hub.projectPicker.empty.title: "No projects found"
 * hub.projectPicker.empty.ide: "No projects with IDE workspace enabled. Create a new project or enable IDE in existing project settings."
 * hub.projectPicker.empty.notes: "No projects with Notes workspace enabled. Create a new project or enable Notes in existing project settings."
 * hub.projectPicker.empty.knowledge: "No projects with Knowledge workspace enabled. Create a new project or enable Knowledge in existing project settings."
 * hub.projectPicker.empty.study: "No projects with Study workspace enabled. Create a new project or enable Study in existing project settings."
 * hub.projectPicker.empty.createProject: "Create Project"
 *
 * Vietnamese keys to add:
 * hub.projectPicker.title: "Chọn dự án {workspace}"
 * hub.projectPicker.description: "Chọn một dự án để mở trong không gian làm việc này"
 * hub.projectPicker.lastOpen.label: "Mở lần cuối"
 * hub.projectPicker.lastOpen.justNow: "Vừa xong"
 * hub.projectPicker.lastOpen.minutesAgo: "{count} phút trước"
 * hub.projectPicker.lastOpen.hoursAgo: "{count} giờ trước"
 * hub.projectPicker.lastOpen.daysAgo: "{count} ngày trước"
 * hub.projectPicker.empty.title: "Không tìm thấy dự án"
 * hub.projectPicker.empty.ide: "Không có dự án nào bật không gian IDE. Tạo dự án mới hoặc bật IDE trong cài đặt dự án."
 * hub.projectPicker.empty.notes: "Không có dự án nào bật không gian Notes. Tạo dự án mới hoặc bật Notes trong cài đặt dự án."
 * hub.projectPicker.empty.knowledge: "Không có dự án nào bật không gian Knowledge. Tạo dự án mới hoặc bật Knowledge trong cài đặt dự án."
 * hub.projectPicker.empty.study: "Không có dự án nào bật không gian Study. Tạo dự án mới hoặc bật Study trong cài đặt dự án."
 * hub.projectPicker.empty.createProject: "Tạo Dự Án"
 */
