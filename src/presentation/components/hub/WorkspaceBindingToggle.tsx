/**
 * @fileoverview Workspace Binding Toggle
 * @module presentation/components/hub/WorkspaceBindingToggle
 * @governance EPIC-CP-1.4
 * @created 2026-01-06
 *
 * Compact toggle switch for enabling/disabling individual workspaces.
 * Designed for inline use in project cards and settings panels.
 *
 * Features:
 * - Single workspace toggle (vs. full dialog)
 * - Instant state update via store
 * - Visual feedback (enabled/disabled states)
 * - Accessible button with proper ARIA labels
 */

import { useState, useMemo } from 'react';
import { Switch } from '@/presentation/components/ui/switch';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
// CC-V2-A02: Import from canonical location
import type { WorkspaceId } from '@/infrastructure/persistence/dexie-db-core-types';

// Re-export for consumers
export type { WorkspaceId };

export interface WorkspaceBindingToggleProps {
  /** Project ID to update */
  projectId: string;
  /** Workspace to toggle */
  workspace: WorkspaceId;
  /** Optional: Custom label (defaults to workspace name) */
  label?: string;
  /** Optional: Disabled state */
  disabled?: boolean;
  /** Optional: Callback after toggle completes */
  onToggleChange?: (workspace: WorkspaceId, enabled: boolean) => void;
}

// ============================================================================
// Workspace Metadata
// ============================================================================
// TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
// Workspace metadata retained for backward compatibility with existing projects
// Restore these labels/icons when implementing Knowledge/Study workspaces

const WORKSPACE_LABELS: Record<WorkspaceId, string> = {
  ide: 'IDE',
  notes: 'Notes',
  knowledge: 'Knowledge',
  study: 'Study',
};

const WORKSPACE_ICONS: Record<WorkspaceId, string> = {
  ide: '💻',
  notes: '📝',
  knowledge: '📚',
  study: '🎓',
};

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceBindingToggle - Inline toggle for workspace binding
 *
 * @example
 * ```tsx
 * <WorkspaceBindingToggle
 *   projectId="proj_123"
 *   workspace="notes"
 *   onToggleChange={(workspace, enabled) => {
 *     console.log(`${workspace} is now ${enabled ? 'enabled' : 'disabled'}`);
 *   }}
 * />
 * ```
 */
export function WorkspaceBindingToggle({
  projectId,
  workspace,
  label,
  disabled = false,
  onToggleChange,
}: WorkspaceBindingToggleProps) {
  // Select raw state (stable reference - prevents Zustand v5 infinite loop)
  const projects = useProjectStore((state) => state.projects);
  const updateProjectBindings = useProjectStore((state) => state.updateProjectBindings);

  // Compute derived value with useMemo (only recalculates when dependencies change)
  const isEnabled = useMemo(() => {
    return projects[projectId]?.workspaceBindings?.[workspace] === true; // ARC-D03
  }, [projects, projectId, workspace]);

  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsPending(true);
    try {
      // Update bindings via store
      await updateProjectBindings(projectId, {
        [workspace]: checked,
      } as any);

      // Notify parent component
      onToggleChange?.(workspace, checked);
    } catch (error) {
      console.error(`[WorkspaceBindingToggle] Failed to update ${workspace}:`, error);
    } finally {
      setIsPending(false);
    }
  };

  const displayLabel = label || WORKSPACE_LABELS[workspace];
  const icon = WORKSPACE_ICONS[workspace];

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      {/* Workspace Label with Icon */}
      <div className="flex items-center gap-2">
        <span className="text-base" role="img" aria-hidden="true">
          {icon}
        </span>
        <span className="text-sm font-medium">{displayLabel}</span>
      </div>

      {/* Toggle Switch */}
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={disabled || isPending}
        aria-label={`Toggle ${displayLabel} workspace ${isEnabled ? 'off' : 'on'}`}
      />
    </div>
  );
}

// ============================================================================
// Multi-Workspace Variant
// ============================================================================

/**
 * Props for WorkspaceBindingList component
 */
export interface WorkspaceBindingListProps {
  /** Project ID to update */
  projectId: string;
  /** Optional: Workspaces to show (defaults to all) */
  workspaces?: WorkspaceId[];
  /** Optional: Disabled state */
  disabled?: boolean;
  /** Optional: Callback after any toggle completes */
  onToggleChange?: (workspace: WorkspaceId, enabled: boolean) => void;
}

/**
 * WorkspaceBindingList - List of all workspace toggles for a project
 *
 * @example
 * ```tsx
 * <WorkspaceBindingList
 *   projectId="proj_123"
 *   onToggleChange={(workspace, enabled) => {
 *     console.log(`${workspace} is now ${enabled ? 'enabled' : 'disabled'}`);
 *   }}
 * />
 * ```
 */
export function WorkspaceBindingList({
  projectId,
  // TODO: ARCH-01-03 - Knowledge and Study workspaces DEFERRED per ADR-033
  // Default workspaces updated to remove knowledge/study from UI
  // Backend types retained for backward compatibility with existing projects
  workspaces = ['ide', 'notes'],
  disabled = false,
  onToggleChange,
}: WorkspaceBindingListProps) {
  return (
    <div className="space-y-1">
      {workspaces.map((workspace) => (
        <WorkspaceBindingToggle
          key={workspace}
          projectId={projectId}
          workspace={workspace}
          disabled={disabled}
          onToggleChange={onToggleChange}
        />
      ))}
    </div>
  );
}
