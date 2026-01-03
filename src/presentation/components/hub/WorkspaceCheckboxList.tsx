/**
 * @fileoverview Workspace Checkbox List
 * @module presentation/components/hub/WorkspaceCheckboxList
 * @created 2026-01-02T22:45:00+07:00
 *
 * List of workspace checkboxes for enabling workspaces.
 * Maps workspace configurations to checkbox items.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
import type { WorkspaceBindings } from '@/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceConfig } from './WorkspaceBindingDialog.types';
import { WorkspaceCheckboxItem } from './WorkspaceCheckboxItem';

export interface WorkspaceCheckboxListProps {
  /** Current workspace bindings state */
  bindings: WorkspaceBindings;
  /** Callback when workspace checkbox is toggled */
  onWorkspaceToggle: (workspaceId: WorkspaceType, checked: boolean) => void;
  /** Available workspace configurations */
  workspaces: WorkspaceConfig[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * List of checkboxes for workspace selection.
 *
 * Features:
 * - Maps workspace configs to checkbox items
 * - Localized section label
 * - Grid layout for consistent spacing
 *
 * @example
 * ```tsx
 * <WorkspaceCheckboxList
 *   bindings={bindings}
 *   onWorkspaceToggle={handleWorkspaceToggle}
 *   workspaces={WORKSPACES}
 * />
 * ```
 */
export const WorkspaceCheckboxList: React.FC<WorkspaceCheckboxListProps> = ({
  bindings,
  onWorkspaceToggle,
  workspaces,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-pixel text-foreground uppercase tracking-widest">
        {t('hub.workspaceBinding.selectWorkspaces', 'ENABLE_WORKSPACES')}
      </label>
      <div className="grid grid-cols-1 gap-2">
        {workspaces.map((workspace) => {
          const isEnabled = bindings[workspace.id] ?? false;

          return (
            <WorkspaceCheckboxItem
              key={workspace.id}
              workspace={workspace}
              checked={isEnabled}
              onCheckedChange={(checked) =>
                onWorkspaceToggle(workspace.id, checked === true)
              }
            />
          );
        })}
      </div>
    </div>
  );
};
