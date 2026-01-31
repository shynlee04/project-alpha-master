/**
 * @fileoverview Initial Workspace Selector
 * @module spike/components/hub/InitialWorkspaceSelector
 * @created 2026-01-02T22:50:00+07:00
 *
 * Radio group for selecting initial workspace to open.
 * Only displays enabled workspaces from bindings.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { cn } from '@/spike/lib/utils';
import type { WorkspaceBindings } from '@/spike/infrastructure/persistence/stores/project/project-types';
import type { WorkspaceConfig } from './WorkspaceBindingDialog.types';

export interface InitialWorkspaceSelectorProps {
  /** Currently selected initial workspace */
  initialWorkspace: string;
  /** Callback when initial workspace is changed */
  onInitialWorkspaceChange: (workspaceId: string) => void;
  /** Current workspace bindings (to filter enabled workspaces) */
  bindings: WorkspaceBindings;
  /** Available workspace configurations */
  workspaces: WorkspaceConfig[];
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Radio group for initial workspace selection.
 *
 * Features:
 * - Only shows enabled workspaces
 * - Visual feedback for selected workspace
 * - Localized section label
 * - Consistent styling with checkboxes
 *
 * @example
 * ```tsx
 * <InitialWorkspaceSelector
 *   initialWorkspace="ide"
 *   onInitialWorkspaceChange={setInitialWorkspace}
 *   bindings={bindings}
 *   workspaces={WORKSPACES}
 * />
 * ```
 */
export const InitialWorkspaceSelector: React.FC<InitialWorkspaceSelectorProps> = ({
  initialWorkspace,
  onInitialWorkspaceChange,
  bindings,
  workspaces,
  className,
}) => {
  const { t } = useTranslation();

  // Filter to only enabled workspaces
  const enabledWorkspaces = workspaces.filter((ws) => bindings[ws.id] === true);

  // Don't render if no workspaces enabled
  if (enabledWorkspaces.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-pixel text-foreground uppercase tracking-widest">
        {t('hub.workspaceBinding.openIn', 'OPEN_IN_WORKSPACE')}
      </label>
      <RadioGroup.Root
        value={initialWorkspace}
        onValueChange={(value) => onInitialWorkspaceChange(value)}
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
  );
};