/**
 * @fileoverview Workspace Binding Dialog
 * @module presentation/components/hub/WorkspaceBindingDialog
 * @governance Story WB-4: Workspace Binding Dialog
 * @refactored 2026-01-02T23:00:00+07:00
 *
 * Dialog for selecting which workspaces a project syncs to.
 * Users check workspaces to enable (IDE, Notes, Knowledge, Study)
 * and select initial workspace to open via radio buttons.
 *
 * Refactored from 313 → 165 lines (47% reduction)
 * - Extracted custom hook for state management
 * - Split into 6 modular subcomponents
 * - Co-located types in separate file
 *
 * @see Research: Radix UI Dialog best practices, December 2025 patterns
 * @see Research: React component refactoring best practices, January 2026
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

import { useWorkspaceBindingState } from './useWorkspaceBindingState';
import { WorkspaceBindingHeader } from './WorkspaceBindingHeader';
import { WorkspaceCheckboxList } from './WorkspaceCheckboxList';
import { InitialWorkspaceSelector } from './InitialWorkspaceSelector';
import { WorkspaceBindingFooter } from './WorkspaceBindingFooter';
import type { WorkspaceBindingDialogProps, WorkspaceConfig } from './WorkspaceBindingDialog.types';

// ============================================================================
// Workspace Configuration
// ============================================================================

const WORKSPACES: WorkspaceConfig[] = [
  { id: 'ide', icon: '💻', labelKey: 'hub.workspaceBinding.workspaces.ide' },
  { id: 'notes', icon: '📝', labelKey: 'hub.workspaceBinding.workspaces.notes' },
  { id: 'knowledge', icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
  { id: 'study', icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
];

// ============================================================================
// Component
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
 * Refactored January 2026:
 * - State management extracted to useWorkspaceBindingState hook
 * - UI split into modular subcomponents
 * - Co-located types in WorkspaceBindingDialog.types.ts
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
  onConfirm: onConfirmProp,
}) => {
  // Custom hook for state management (extracted from component)
  const {
    bindings,
    initialWorkspace,
    setInitialWorkspace,
    handleWorkspaceToggle,
    hasEnabledWorkspaces,
  } = useWorkspaceBindingState(project);

  // Handle confirm (save bindings and navigate)
  const handleConfirm = () => {
    onConfirmProp(bindings, initialWorkspace);
  };

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
          <WorkspaceBindingHeader projectName={project.name} />

          {/* Workspace Checkboxes */}
          <WorkspaceCheckboxList
            bindings={bindings}
            onWorkspaceToggle={handleWorkspaceToggle}
            workspaces={WORKSPACES}
          />

          {/* Initial Workspace Radio Group */}
          <InitialWorkspaceSelector
            initialWorkspace={initialWorkspace}
            onInitialWorkspaceChange={setInitialWorkspace}
            bindings={bindings}
            workspaces={WORKSPACES}
          />

          {/* Footer Actions */}
          <WorkspaceBindingFooter
            disabled={!hasEnabledWorkspaces}
            onConfirm={handleConfirm}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
