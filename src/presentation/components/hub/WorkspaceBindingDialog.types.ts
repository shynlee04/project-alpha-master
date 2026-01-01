/**
 * @fileoverview Workspace Binding Dialog Types
 * @module presentation/components/hub/WorkspaceBindingDialog.types
 * @created 2026-01-02T22:30:00+07:00
 *
 * Co-located type definitions for WorkspaceBindingDialog.
 * January 2026 pattern: Feature-specific types in separate file.
 */

import type { ProjectMetadata, WorkspaceBindings } from '@/lib/workspace/project-store';

/** Workspace ID type for binding selections */
export type WorkspaceId = 'ide' | 'notes' | 'knowledge' | 'study';

/** Workspace configuration with icon and translation key */
export interface WorkspaceConfig {
  /** Unique workspace identifier */
  id: WorkspaceId;
  /** Emoji icon for workspace */
  icon: string;
  /** i18n translation key for workspace label */
  labelKey: string;
}

/** Props for WorkspaceBindingDialog component */
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

/** Props for workspace checkbox item */
export interface WorkspaceCheckboxItemProps {
  /** Workspace configuration */
  workspace: WorkspaceConfig;
  /** Whether workspace is enabled (checked) */
  checked: boolean;
  /** Callback when checkbox is toggled */
  onCheckedChange: (checked: boolean) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/** Props for initial workspace radio item */
export interface InitialWorkspaceItemProps {
  /** Workspace configuration */
  workspace: WorkspaceConfig;
  /** Whether this workspace is selected as initial */
  checked: boolean;
  /** Callback when radio is selected */
  onCheckedChange: (checked: boolean) => void;
  /** Optional additional CSS classes */
  className?: string;
}
