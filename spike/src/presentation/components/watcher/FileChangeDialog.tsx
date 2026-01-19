/**
 * @fileoverview File Change Dialog Component
 * @module presentation/components/watcher/FileChangeDialog
 *
 * Dialog component for handling external file changes.
 * Provides Reload, Overwrite, and Ignore options.
 *
 * @story S-039 - File Watcher with Auto-Reload and Change Detection
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { AlertTriangle, FileText, RefreshCw, X } from 'lucide-react';
import {
  useShowChangeDialog,
  useActiveChangePath,
  usePendingChangeFor,
  useRemovePendingChange,
  useHideChangeDialog
  // useWatchedFileState
} from '@/infrastructure/persistence/stores/file-watcher-store';
import { cn } from '@/lib/utils';

export interface FileChangeDialogProps {
  /** Callback when user chooses to reload from disk */
  onReload?: (path: string) => void;
  /** Callback when user chooses to overwrite external changes */
  onOverwrite?: (path: string) => void;
  /** Callback when user chooses to ignore changes */
  onIgnore?: (path: string) => void;
}

/**
 * File Change Dialog
 *
 * Shows when external file changes are detected.
 * Provides options for handling conflicts.
 */
export function FileChangeDialog({
  onReload,
  onOverwrite,
  onIgnore
}: FileChangeDialogProps): React.JSX.Element | null {
  const { t } = useTranslation();

  // Store state
  const show = useShowChangeDialog();
  const activePath = useActiveChangePath();
  const hideDialog = useHideChangeDialog();
  const removePendingChange = useRemovePendingChange();

  // Get pending change details
  const pendingChange = usePendingChangeFor(activePath || '');
  // const _watchedFile = useWatchedFileState(activePath || ''); // TODO: For future implementation

  // Local state
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state when dialog opens/closes
  useEffect(() => {
    if (!show) {
      setIsProcessing(false);
    }
  }, [show]);

  // Don't render if no active change
  if (!show || !activePath || !pendingChange) {
    return null;
  }

  const hasConflict = pendingChange.hasUnsavedChanges;
  const changeTypeLabel = t(`fileWatcher.changes.${pendingChange.changeType}`, pendingChange.changeType);

  /**
   * Handle reload action
   */
  const handleReload = async () => {
    if (isProcessing || !activePath) return;

    setIsProcessing(true);
    try {
      onReload?.(activePath);
      removePendingChange(activePath);
      hideDialog();
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle overwrite action
   */
  const handleOverwrite = async () => {
    if (isProcessing || !activePath) return;

    setIsProcessing(true);
    try {
      onOverwrite?.(activePath);
      removePendingChange(activePath);
      hideDialog();
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle ignore action
   */
  const handleIgnore = async () => {
    if (isProcessing || !activePath) return;

    setIsProcessing(true);
    try {
      onIgnore?.(activePath);
      removePendingChange(activePath);
      hideDialog();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && hideDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasConflict ? (
              <AlertTriangle className="h-5 w-5 text-warning" />
            ) : (
              <FileText className="h-5 w-5 text-info" />
            )}
            {t('fileWatcher.dialog.title', 'File Changed Externally')}
          </DialogTitle>
          <DialogDescription>
            {hasConflict
              ? t('fileWatcher.dialog.conflictDescription', 'This file has been modified both externally and locally. How do you want to proceed?')
              : t('fileWatcher.dialog.description', 'This file has been modified externally. What would you like to do?')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* File info */}
          <div className="rounded border-2 border-border bg-background p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activePath.split('/').pop()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activePath}
                </p>
              </div>
            </div>
          </div>

          {/* Change details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t('fileWatcher.dialog.changeType', 'Change Type')}:
              </span>
              <span className="font-medium capitalize">{changeTypeLabel}</span>
            </div>

            {hasConflict && (
              <div className="flex items-center gap-2 p-2 rounded bg-warning/10 border-2 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                <span className="text-xs text-warning">
                  {t('fileWatcher.dialog.unsavedChangesWarning', 'You have unsaved changes that will be lost if you reload.')}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {/* Ignore button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIgnore}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            {t('fileWatcher.dialog.ignore', 'Ignore')}
          </Button>

          {/* Overwrite button (only if there are unsaved changes) */}
          {hasConflict && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOverwrite}
              disabled={isProcessing}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('fileWatcher.dialog.overwrite', 'Overwrite')}
            </Button>
          )}

          {/* Reload button */}
          <Button
            type="button"
            variant={hasConflict ? 'outline' : 'primary'}
            size="sm"
            onClick={handleReload}
            disabled={isProcessing}
            className={cn(
              'flex-1',
              hasConflict && 'bg-warning hover:bg-warning/80 text-warning-foreground border-warning'
            )}
          >
            <RefreshCw className={cn('h-4 w-4 mr-1', isProcessing && 'animate-spin')} />
            {t('fileWatcher.dialog.reload', 'Reload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Mobile-optimized file change toast
 */
export interface FileChangeToastProps {
  /** File path that changed */
  path: string;
  /** Type of change */
  changeType: 'created' | 'modified' | 'deleted' | 'moved';
  /** Whether there's a conflict */
  hasConflict: boolean;
  /** Callback to view changes */
  onView: () => void;
  /** Callback to dismiss */
  onDismiss: () => void;
}

export function FileChangeToast({
  path,
  changeType,
  hasConflict,
  onView,
  onDismiss
}: FileChangeToastProps): React.JSX.Element {
  const { t } = useTranslation();

  const fileName = path.split('/').pop() || path;

  return (
    <div className="w-full rounded-lg border-2 border-border bg-background p-3 shadow-lg">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'rounded p-1',
          hasConflict
            ? 'bg-warning/20'
            : 'bg-info/20'
        )}>
          {hasConflict ? (
            <AlertTriangle className="h-4 w-4 text-warning" />
          ) : (
            <FileText className="h-4 w-4 text-info" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(`fileWatcher.changes.${changeType}`, changeType)}
          </p>
          {hasConflict && (
            <p className="text-xs text-warning mt-1">
              {t('fileWatcher.conflictDetected', 'Conflict: Unsaved changes')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-7 px-2 text-xs"
          >
            {t('fileWatcher.view', 'View')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 px-2 text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
