/**
 * @fileoverview Markdown Sync Conflict Dialog
 * @module presentation/components/notes/MarkdownSyncConflictDialog
 *
 * **ARC-B12**: External change conflict resolution UI for Notes ↔ Markdown sync
 *
 * Per ADR-033 Decision D4:
 * - Desktop notes save as .md files in /project/notes/
 * - Bidirectional sync: BlockNote editor ↔ .md files
 * - Conflict detection when both local and external changes occur
 *
 * This dialog provides conflict resolution when:
 * 1. User has unsaved changes in editor (local dirty)
 * 2. External .md file changes detected via FileSystemWatcher
 * 3. Both need to be reconciled
 *
 * **Resolution Options:**
 * - Keep Local: Overwrite external file with local changes
 * - Keep External: Reload from external file (lose local changes)
 * - Merge: Attempt to merge both versions (future enhancement)
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B12
 * @author Team B
 * @created 2026-01-18
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { AlertTriangle, FileText, RefreshCw, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SyncDirection, SyncConflictEvent } from '@/infrastructure/filesystem/markdown-sync-service';

/**
 * Props for MarkdownSyncConflictDialog
 */
export interface MarkdownSyncConflictDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Conflict event details */
  conflict: SyncConflictEvent | null;
  /** Optional callback to ignore this conflict */
  onIgnore?: () => void;
  /** Optional callback to defer decision (ask again later) */
  onDefer?: () => void;
}

/**
 * Timestamp formatter for display
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

/**
 * Markdown Sync Conflict Dialog
 *
 * Shows when markdown sync conflict is detected:
 * - User has unsaved local changes
 * - External .md file was modified
 *
 * Provides resolution options:
 * - Keep Local: Save local changes to file
 * - Keep External: Reload from file, discard local
 * - Merge: Intelligent merge (when available)
 *
 * **Auto-reload behavior:**
 * If local is clean (no unsaved changes), automatically reload
 * from external file without showing dialog.
 */
export function MarkdownSyncConflictDialog({
  open,
  onOpenChange,
  conflict,
  onIgnore,
  onDefer,
}: MarkdownSyncConflictDialogProps): React.JSX.Element | null {
  const { t } = useTranslation();

  // Local state
  const [isResolving, setIsResolving] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<SyncDirection | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setIsResolving(false);
      setSelectedChoice(null);
    }
  }, [open]);

  // Don't render if no conflict
  if (!conflict) {
    return null;
  }

  const { filePath, noteId, localModified, fileModified } = conflict;

  // Extract filename from path
  const fileName = filePath.split('/').pop() || filePath;

  /**
   * Handle resolution choice
   */
  const handleResolve = useCallback(async (direction: SyncDirection) => {
    if (isResolving) return;

    setIsResolving(true);
    setSelectedChoice(direction);

    try {
      await conflict.resolve(direction);
      onOpenChange(false);
    } catch (error) {
      console.error('[MarkdownSyncConflictDialog] Resolution failed:', error);
      setIsResolving(false);
      setSelectedChoice(null);
    }
  }, [conflict, isResolving, onOpenChange]);

  /**
   * Handle ignore (defer resolution)
   */
  const handleIgnore = useCallback(() => {
    onIgnore?.();
    onOpenChange(false);
  }, [onIgnore, onOpenChange]);

  /**
   * Handle defer (ask again later)
   */
  const handleDefer = useCallback(() => {
    onDefer?.();
    onOpenChange(false);
  }, [onDefer, onOpenChange]);

  const localTime = formatTimestamp(localModified);
  const externalTime = formatTimestamp(fileModified);
  const hasConflict = localModified > fileModified;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasConflict ? (
              <AlertTriangle className="h-5 w-5 text-warning" />
            ) : (
              <FileText className="h-5 w-5 text-info" />
            )}
            {t('markdownSync.conflict.title', 'Markdown Sync Conflict')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'markdownSync.conflict.description',
              'This note has been modified both locally and externally. How do you want to resolve this?'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* File info */}
          <div className="rounded border-2 border-border bg-background p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Note ID: {noteId.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp comparison */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Local changes */}
            <div className={cn(
              "p-3 rounded border-2",
              selectedChoice === 'local-to-file'
                ? "border-info bg-info/10"
                : "border-border bg-muted"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Save className="h-4 w-4 text-info" />
                <span className="text-xs font-medium">
                  {t('markdownSync.conflict.localChanges', 'Local Changes')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {localTime}
              </p>
            </div>

            {/* External changes */}
            <div className={cn(
              "p-3 rounded border-2",
              selectedChoice === 'file-to-local'
                ? "border-info bg-info/10"
                : "border-border bg-muted"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-4 w-4 text-success" />
                <span className="text-xs font-medium">
                  {t('markdownSync.conflict.externalChanges', 'External File')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {externalTime}
              </p>
            </div>
          </div>

          {/* Conflict warning */}
          {hasConflict && (
            <div className="flex items-center gap-2 p-2 rounded bg-warning/10 border-2 border-warning/30">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-xs text-warning">
                {t(
                  'markdownSync.conflict.warning',
                  'Your local changes are newer. Overwriting will lose these changes.'
                )}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col">
          {/* Primary action buttons */}
          <div className="flex gap-2 w-full">
            {/* Keep Local button */}
            <Button
              type="button"
              variant={selectedChoice === 'local-to-file' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleResolve('local-to-file')}
              disabled={isResolving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1" />
              {t('markdownSync.conflict.keepLocal', 'Keep Local')}
            </Button>

            {/* Keep External button */}
            <Button
              type="button"
              variant={selectedChoice === 'file-to-local' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleResolve('file-to-local')}
              disabled={isResolving}
              className="flex-1"
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', isResolving && 'animate-spin')} />
              {t('markdownSync.conflict.keepExternal', 'Keep External')}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-2 w-full">
            {/* Merge button (future) */}
            {/* <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleResolve('merge')}
              disabled={isResolving || true}
              className="flex-1"
            >
              <Merge className="h-4 w-4 mr-1" />
              {t('markdownSync.conflict.merge', 'Merge')}
            </Button> */}

            {/* Defer button */}
            {onDefer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDefer}
                disabled={isResolving}
                className="flex-1"
              >
                {t('markdownSync.conflict.defer', 'Ask Later')}
              </Button>
            )}

            {/* Ignore button */}
            {onIgnore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleIgnore}
                disabled={isResolving}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                {t('markdownSync.conflict.ignore', 'Ignore')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing markdown sync conflict dialog state
 *
 * Provides a simple state management solution for components
 * that need to show the conflict dialog.
 *
 * @example
 * ```ts
 * const conflictDialog = useMarkdownSyncConflictDialog();
 *
 * // In your component:
 * <MarkdownSyncConflictDialog
 *   open={conflictDialog.open}
 *   onOpenChange={conflictDialog.setOpen}
 *   conflict={conflictDialog.conflict}
 *   onIgnore={conflictDialog.handleIgnore}
 * />
 * ```
 */
export interface MarkdownSyncConflictDialogState {
  /** Whether dialog is open */
  open: boolean;
  /** Current conflict event */
  conflict: SyncConflictEvent | null;
  /** Set dialog open state */
  setOpen: (open: boolean) => void;
  /** Show conflict dialog */
  showConflict: (conflict: SyncConflictEvent) => void;
  /** Handle ignore action */
  handleIgnore: () => void;
}

export function useMarkdownSyncConflictDialog(): MarkdownSyncConflictDialogState {
  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState<SyncConflictEvent | null>(null);
  const [deferredConflicts, setDeferredConflicts] = useState<Set<string>>(new Set());

  const showConflict = useCallback((conflictEvent: SyncConflictEvent) => {
    // Check if this conflict was deferred
    if (deferredConflicts.has(conflictEvent.noteId)) {
      return; // Skip if deferred
    }
    setConflict(conflictEvent);
    setOpen(true);
  }, [deferredConflicts]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Clear conflict after closing
      setTimeout(() => setConflict(null), 200);
    }
  }, []);

  const handleIgnore = useCallback(() => {
    if (conflict) {
      // Mark as deferred so we don't ask again for this note
      setDeferredConflicts(prev => new Set(prev).add(conflict.noteId));
    }
  }, [conflict]);

  return {
    open,
    conflict,
    setOpen: handleOpenChange,
    showConflict,
    handleIgnore,
  };
}
