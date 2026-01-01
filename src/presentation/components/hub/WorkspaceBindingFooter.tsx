/**
 * @fileoverview Workspace Binding Dialog Footer
 * @module presentation/components/hub/WorkspaceBindingFooter
 * @created 2026-01-02T22:55:00+07:00
 *
 * Footer with Cancel and Confirm buttons for workspace binding dialog.
 * Handles disabled state when no workspaces are enabled.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface WorkspaceBindingFooterProps {
  /** Whether confirm button should be disabled (no workspaces enabled) */
  disabled?: boolean;
  /** Callback when confirm is clicked */
  onConfirm: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Footer component for WorkspaceBindingDialog.
 *
 * Features:
 * - Cancel button (closes dialog via Dialog.Close)
 * - Confirm button (triggers onConfirm callback)
 * - Disabled state when no workspaces enabled
 * - Consistent button styling with 8-bit theme
 *
 * @example
 * ```tsx
 * <WorkspaceBindingFooter
 *   disabled={!hasEnabledWorkspaces}
 *   onConfirm={handleConfirm}
 * />
 * ```
 */
export const WorkspaceBindingFooter: React.FC<WorkspaceBindingFooterProps> = ({
  disabled = false,
  onConfirm,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center justify-end gap-2 pt-4 border-t-2 border-border/40", className)}>
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
        onClick={onConfirm}
        disabled={disabled}
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
  );
};
