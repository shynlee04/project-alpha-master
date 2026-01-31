/**
 * @fileoverview Workspace Binding Dialog Header
 * @module presentation/components/hub/WorkspaceBindingHeader
 * @created 2026-01-02T22:35:00+07:00
 *
 * Header section for workspace binding dialog.
 * Displays title, description, and project name.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface WorkspaceBindingHeaderProps {
  /** Project name to display */
  projectName: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Header component for WorkspaceBindingDialog.
 *
 * Features:
 * - Localized title and description
 * - Project name display with monospace font
 * - Consistent styling with 8-bit theme
 *
 * @example
 * ```tsx
 * <WorkspaceBindingHeader projectName="My Project" />
 * ```
 */
export const WorkspaceBindingHeader: React.FC<WorkspaceBindingHeaderProps> = ({
  projectName,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-1", className)}>
      <Dialog.Title className="text-lg font-pixel text-foreground">
        {t('hub.workspaceBinding.title', 'WORKSPACE_BINDING')}
      </Dialog.Title>
      <Dialog.Description className="text-sm text-muted-foreground font-mono">
        {t('hub.workspaceBinding.description', 'SELECT_WORKSPACES_TO_SYNC_PROJECT')}
      </Dialog.Description>
      <div className="text-xs font-mono text-primary/70 mt-1">
        {projectName}
      </div>
    </div>
  );
};
