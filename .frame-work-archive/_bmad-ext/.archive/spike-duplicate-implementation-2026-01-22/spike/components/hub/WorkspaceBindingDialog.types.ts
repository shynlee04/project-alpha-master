/**
 * @fileoverview Workspace Binding Dialog Types
 */
import type { Project, WorkspaceBindings } from '@/spike/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceId } from '@/spike/infrastructure/persistence/dexie-db-core-types';

export type { WorkspaceId };

export interface WorkspaceConfig {
  id: WorkspaceId;
  icon: string;
  labelKey: string;
}

export interface WorkspaceBindingDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bindings: WorkspaceBindings, initialWorkspace: WorkspaceId) => void;
}

export interface WorkspaceCheckboxItemProps {
  workspace: WorkspaceConfig;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export interface InitialWorkspaceItemProps {
  workspace: WorkspaceConfig;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}
