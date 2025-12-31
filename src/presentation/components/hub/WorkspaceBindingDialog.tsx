/**
 * @fileoverview Workspace Binding Dialog
 * @module presentation/components/hub/WorkspaceBindingDialog
 * @governance Story WB-4: Workspace Binding Dialog
 *
 * Dialog for selecting which workspaces a project syncs to.
 * Users check workspaces to enable (IDE, Notes, Knowledge, Study, Canvas)
 * and select initial workspace to open via radio buttons.
 *
 * @see Research: Radix UI Dialog best practices, December 2025 patterns
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';

import type { ProjectMetadata, WorkspaceBindings } from '@/lib/workspace/project-store';
import { cn } from '@/lib/utils';

// ============================================================================
// Workspace Configuration
// ============================================================================

const WORKSPACES = [
  { id: 'ide', icon: '💻', labelKey: 'hub.workspaceBinding.workspaces.ide' },
  { id: 'notes', icon: '📝', labelKey: 'hub.workspaceBinding.workspaces.notes' },
  { id: 'knowledge', icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
  { id: 'study', icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
  { id: 'canvas', icon: '🎨', labelKey: 'hub.workspaceBinding.workspaces.canvas' },
] as const;

type WorkspaceId = typeof WORKSPACES[number]['id'];

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceBindingDialogProps {
  /** Project to configure workspace bindings for */
  project: ProjectMetadata;
  /** Dialog open state */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when user confirms workspace selection */
  onConfirm: (bindings: WorkspaceBindings, initialWorkspace: WorkspaceId) => void;
}

// ============================================================================
// Components
// ============================================================================

/**
 * WorkspaceBindingDialog - Workspace selection dialog for Hub
 *
 * Features:
 * - Checkboxes for workspace binding (enable/disable workspaces)
 * - Radio buttons for initial workspace selection
 * - Default: IDE checked, others unchecked (new projects)
 * - Previous bindings pre-checked (existing projects)
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [selectedProject, setSelectedProject] = useState<ProjectMetadata | null>(null);
 *
 * const handleConfirm = (bindings, initialWorkspace) => {
 *   await updateProjectBindings(selectedProject.id, bindings);
 *   navigate({ to: `/${initialWorkspace}/$projectId`, params: { projectId: selectedProject.id } });
 *   setOpen(false);
 * };
 *
 * <WorkspaceBindingDialog
 *   project={selectedProject}
 *   open={open}
 *   onOpenChange={setOpen}
 *   onConfirm={handleConfirm}
 * />
 * ```
 */
export const WorkspaceBindingDialog: React.FC<WorkspaceBindingDialogProps> = ({
  project,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation();

  // State: workspace bindings (checkboxes)
  const [bindings, setBindings] = useState<WorkspaceBindings>({
    ide: true,
    notes: false,
    knowledge: false,
    study: false,
    canvas: false,
  });

  // State: initial workspace selection (radio buttons)
  const [initialWorkspace, setInitialWorkspace] = useState<WorkspaceId>('ide');

  // Initialize state from project's existing bindings
  useEffect(() => {
    if (project?.workspaceBindings) {
      setBindings(project.workspaceBindings);

      // Set initial workspace to first enabled workspace, default to 'ide'
      const firstEnabled = WORKSPACES.find(
        (ws) => project.workspaceBindings?.[ws.id] === true
      );
      setInitialWorkspace((firstEnabled?.id as WorkspaceId) || 'ide');
    }
  }, [project]);

  // Handle workspace checkbox toggle
  const handleWorkspaceToggle = (workspaceId: WorkspaceId, checked: boolean) => {
    setBindings((prev) => ({
      ...prev,
      [workspaceId]: checked,
    }));

    // If disabling current initial workspace, switch to first enabled
    if (!checked && initialWorkspace === workspaceId) {
      const firstEnabled = WORKSPACES.find((ws) => {
        return ws.id !== workspaceId && bindings[ws.id] === true;
      });
      if (firstEnabled) {
        setInitialWorkspace(firstEnabled.id as WorkspaceId);
      }
    }

    // If enabling first workspace, auto-select as initial
    if (checked && !Object.values(bindings).some((b) => b === true)) {
      setInitialWorkspace(workspaceId);
    }
  };

  // Handle confirm (save bindings and navigate)
  const handleConfirm = () => {
    onConfirm(bindings, initialWorkspace);
  };

  // Check if at least one workspace is enabled
  const hasEnabledWorkspaces = Object.values(bindings).some((b) => b === true);

  // Filter enabled workspaces for radio group
  const enabledWorkspaces = WORKSPACES.filter((ws) => bindings[ws.id] === true);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
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
          <div className="space-y-1">
            <Dialog.Title className="text-lg font-pixel text-foreground">
              {t('hub.workspaceBinding.title', 'WORKSPACE_BINDING')}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground font-mono">
              {t('hub.workspaceBinding.description', 'SELECT_WORKSPACES_TO_SYNC_PROJECT')}
            </Dialog.Description>
            <div className="text-xs font-mono text-primary/70 mt-1">
              {project.name}
            </div>
          </div>

          {/* Workspace Checkboxes */}
          <div className="space-y-3">
            <label className="text-sm font-pixel text-foreground uppercase tracking-widest">
              {t('hub.workspaceBinding.selectWorkspaces', 'ENABLE_WORKSPACES')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {WORKSPACES.map((workspace) => {
                const isEnabled = bindings[workspace.id] ?? false;

                return (
                  <div key={workspace.id} className="flex items-center gap-3 group">
                    <Checkbox.Root
                      id={`workspace-${workspace.id}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleWorkspaceToggle(workspace.id, checked === true)
                      }
                      className={cn(
                        "h-5 w-5 shrink-0 rounded-sm border-2 border-primary/20",
                        "hover:border-primary/40 transition-colors",
                        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      <Checkbox.Indicator className="flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label
                      htmlFor={`workspace-${workspace.id}`}
                      className={cn(
                        "flex items-center gap-2 text-sm font-mono cursor-pointer",
                        "group-hover:text-primary transition-colors",
                        isEnabled ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span className="text-base">{workspace.icon}</span>
                      <span>{t(workspace.labelKey, workspace.id.toUpperCase())}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Initial Workspace Radio Group */}
          {enabledWorkspaces.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-pixel text-foreground uppercase tracking-widest">
                {t('hub.workspaceBinding.openIn', 'OPEN_IN_WORKSPACE')}
              </label>
              <RadioGroup.Root
                value={initialWorkspace}
                onValueChange={(value) => setInitialWorkspace(value as WorkspaceId)}
                className="grid grid-cols-1 gap-2"
              >
                {enabledWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-center gap-3 group">
                    <RadioGroup.Item
                      id={`initial-${workspace.id}`}
                      value={workspace.id}
                      className={cn(
                        "h-5 w-5 shrink-0 rounded-full border-2 border-primary/20",
                        "hover:border-primary/40 transition-colors",
                        "data-[state=checked]:border-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </RadioGroup.Indicator>
                    </RadioGroup.Item>
                    <label
                      htmlFor={`initial-${workspace.id}`}
                      className={cn(
                        "flex items-center gap-2 text-sm font-mono cursor-pointer",
                        "group-hover:text-primary transition-colors",
                        initialWorkspace === workspace.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="text-base">{workspace.icon}</span>
                      <span>
                        {t(workspace.labelKey, workspace.id.toUpperCase())}
                      </span>
                    </label>
                  </div>
                ))}
              </RadioGroup.Root>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t-2 border-border/40">
            <Dialog.Close asChild>
              <button
                type="button"
                className={cn(
                  "px-4 py-2 text-sm font-pixel text-foreground",
                  "hover:bg-muted transition-colors",
                  "border-2 border-border"
                )}
              >
                {t('common.cancel', 'CANCEL')}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!hasEnabledWorkspaces}
              className={cn(
                "px-4 py-2 text-sm font-pixel text-primary-foreground bg-primary",
                "hover:bg-primary/90 transition-colors",
                "border-2 border-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {t('hub.workspaceBinding.openProject', 'OPEN_PROJECT')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
