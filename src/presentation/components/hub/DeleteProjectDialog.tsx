/**
 * DeleteProjectDialog Component
 *
 * Confirmation dialog for project deletion with soft delete option.
 * Uses Radix UI AlertDialog with destructive action styling.
 *
 * @file DeleteProjectDialog.tsx
 * @created 2026-01-02T15:30:00+07:00
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeleteProjectDialogProps {
  /** Project ID */
  projectId: string;
  /** Project name for display */
  projectName: string;
  /** Callback when delete is confirmed */
  onConfirm?: (projectId: string, softDelete: boolean) => void;
  /** Dialog open state */
  open?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Confirmation dialog for project deletion.
 *
 * Features:
 * - Soft delete option (mark as deleted, recoverable for 30 days)
 * - Hard delete warning (permanent removal)
 * - Warning badge with destructive styling
 * - ARIA labels for accessibility
 * - Focus management (Cancel button focused first)
 *
 * @example
 * ```tsx
 * <DeleteProjectDialog
 *   projectId="proj-123"
 *   projectName="My Project"
 *   onConfirm={(id, softDelete) => deleteProject(id, softDelete)}
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  projectId,
  projectName,
  onConfirm,
  open,
  onOpenChange,
  className,
}) => {
  const { t } = useTranslation();

  // Soft delete state (true = mark as deleted, false = permanent removal)
  const [softDelete, setSoftDelete] = React.useState(true);

  // Reset soft delete when dialog opens
  React.useEffect(() => {
    if (open) {
      setSoftDelete(true);
    }
  }, [open]);

  /**
   * Handle delete confirmation
   */
  const handleConfirm = () => {
    onConfirm?.(projectId, softDelete);
    onOpenChange?.(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/50",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "z-50"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "bg-background border border-border rounded-lg shadow-lg p-6",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Header with Warning Icon */}
          <div className="flex flex-col space-y-2 text-center sm:text-left mb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                  {t('hub.project.delete.title', 'Delete Project')}
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Description className="text-sm text-muted-foreground pl-15">
              {t('hub.project.delete.description', 'This action cannot be undone. Please confirm your decision.')}
            </Dialog.Description>
          </div>

          {/* Warning Badge */}
          <div className="mb-4 pl-15">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {softDelete
                  ? t('hub.project.delete.softDeleteBadge', 'Soft Delete: Recoverable for 30 days')
                  : t('hub.project.delete.hardDeleteBadge', 'Hard Delete: Permanent Removal')
                }
              </span>
            </div>
          </div>

          {/* Project Name Display */}
          <div className="mb-4 pl-15">
            <div className="text-sm text-muted-foreground">
              {t('hub.project.delete.projectLabel', 'Project')}:
            </div>
            <div className="text-base font-semibold text-foreground">
              {projectName}
            </div>
          </div>

          {/* Delete Options */}
          <div className="mb-6 pl-15 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="soft-delete"
                checked={softDelete}
                onChange={(e) => setSoftDelete(e.target.checked)}
                className="mt-1"
                aria-label={t('hub.project.delete.softDeleteLabel', 'Soft delete option')}
              />
              <div className="flex-1">
                <label
                  htmlFor="soft-delete"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  {t('hub.project.delete.softDeleteLabel', 'Soft Delete (Recommended)')}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('hub.project.delete.softDeleteDescription', 'Mark project as deleted. It will be hidden but recoverable for 30 days before permanent removal.')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="radio"
                id="hard-delete"
                checked={!softDelete}
                onChange={(e) => setSoftDelete(!e.target.checked)}
                className="mt-1"
                aria-label={t('hub.project.delete.hardDeleteLabel', 'Hard delete option')}
              />
              <div className="flex-1">
                <label
                  htmlFor="hard-delete"
                  className="text-sm font-medium text-destructive cursor-pointer"
                >
                  {t('hub.project.delete.hardDeleteLabel', 'Hard Delete (Permanent)')}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('hub.project.delete.hardDeleteDescription', 'Immediately and permanently remove the project and all associated data. This action cannot be undone.')}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className={cn(
            "mb-6 p-4 rounded-md border",
            softDelete ? "bg-muted/30 border-muted" : "bg-destructive/10 border-destructive/20"
          )}>
            <p className={cn(
              "text-sm",
              softDelete ? "text-muted-foreground" : "text-destructive font-medium"
            )}>
              {softDelete
                ? t('hub.project.delete.softDeleteWarning', 'You can recover this project within 30 days by contacting support or using the recovery feature.')
                : t('hub.project.delete.hardDeleteWarning', 'Warning: This will permanently delete all project data including files, settings, and history. There is no way to recover it.')
              }
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pl-15">
            <Dialog.Close asChild>
              <button
                type="button"
                ref={(el) => {
                  // Focus Cancel button when dialog opens (safer)
                  if (open && el) {
                    setTimeout(() => el?.focus(), 0);
                  }
                }}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium",
                  "px-4 py-2 bg-background border border-input hover:bg-muted transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                )}
              >
                {t('hub.project.delete.cancel', 'Cancel')}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium",
                "px-4 py-2",
                softDelete
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                softDelete ? "focus:ring-primary" : "focus:ring-destructive"
              )}
            >
              {softDelete
                ? t('hub.project.delete.softDeleteButton', 'Soft Delete')
                : t('hub.project.delete.hardDeleteButton', 'Delete Permanently')
              }
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
