/**
 * @fileoverview Folder Picker Dialog (Phase 1)
 * @module presentation/components/workspace/FolderPickerDialog
 *
 * PHASE 1: Desktop folder picker dialog
 * - Shows dialog for desktop users to select a project folder
 * - Uses FSA showDirectoryPicker() API
 * - Fallback to temp project if user cancels
 * - Toast notifications for errors
 *
 * **ARC-B07**: Folder overlap detection integrated
 * - Detects nested/overlapping folder selections
 * - Blocks same path, warns on parent/child overlap
 * - User can confirm or cancel
 */

import { useState } from 'react';
import { FolderOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  pickFolder,
  createProjectFromFolder,
  isFSASupported,
  isDesktopPlatform,
} from '@/lib/workspace/fsa-persistence';
import { checkFolderOverlap } from '@/infrastructure/filesystem/folder-overlap-service';
import { FolderOverlapWarningDialog } from './FolderOverlapWarningDialog';

// ============================================================================
// Types
// ============================================================================

export interface FolderPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (projectId: string) => void;
  onFallbackToTemp?: () => void;
  onCancel?: () => void;
}

export interface FolderPickerResult {
  projectId: string | null;
  reason: 'selected' | 'cancelled' | 'not_supported' | 'error';
}

// ============================================================================
// Component
// ============================================================================

/**
 * Folder Picker Dialog for Desktop Users
 *
 * Usage:
 * ```tsx
 * <FolderPickerDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onSuccess={(projectId) => navigate({ to: '/ide/$projectId', params: { projectId } })}
 *   onFallbackToTemp={() => getOrCreateTempProject().then(() => navigate(...))}
 * />
 * ```
 */
export function FolderPickerDialog({
  onOpenChange,
  onSuccess,
  onFallbackToTemp,
  onCancel,
}: FolderPickerDialogProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [overlapCheck, setOverlapCheck] = useState<{
    result: ReturnType<typeof checkFolderOverlap> extends Promise<infer T> ? T : never;
    folderPath: string;
    handle: FileSystemDirectoryHandle;
  } | null>(null);

  const handlePickFolder = async () => {
    setIsPicking(true);

    try {
      // pickFolder returns FileSystemDirectoryHandle | null
      const handle = await pickFolder();

      if (handle) {
        const folderName = handle.name;
        
        // Check for folder overlap before creating project
        const overlapResult = await checkFolderOverlap(folderName);

        if (overlapResult.shouldBlock) {
          // Same path - block with error dialog
          setOverlapCheck({
            result: overlapResult as any,
            folderPath: folderName,
            handle: handle,
          });
          setIsPicking(false);
          return;
        }

        if (overlapResult.hasOverlap) {
          // Parent/child overlap - show warning
          setOverlapCheck({
            result: overlapResult as any,
            folderPath: folderName,
            handle: handle,
          });
          setIsPicking(false);
          return;
        }

        // No overlap - create project directly
        await finishProjectCreation(handle, folderName);
      } else {
        // User cancelled - offer temp project fallback
        toast.info('No folder selected', {
          description: 'Using temp project for this session',
        });
        onOpenChange(false);
        onFallbackToTemp?.();
      }
    } catch (error) {
      console.error('[FolderPickerDialog] Error:', error);
      toast.error('Failed to open folder', {
        description: (error as Error).message,
      });
      onOpenChange(false);
      onCancel?.();
    } finally {
      setIsPicking(false);
    }
  };

  const finishProjectCreation = async (
    handle: FileSystemDirectoryHandle,
    folderName: string
  ) => {
    try {
      const projectId = await createProjectFromFolder(handle, folderName);

      toast.success('Project connected', {
        description: `Connected to ${folderName}`,
      });

      onOpenChange(false);
      onSuccess?.(projectId);
    } catch (error) {
      console.error('[FolderPickerDialog] Create project error:', error);
      toast.error('Failed to create project', {
        description: (error as Error).message,
      });
    }
  };

  const handleOverlapConfirm = async () => {
    if (!overlapCheck) return;

    const { handle } = overlapCheck;
    const folderName = overlapCheck.folderPath;
    setOverlapCheck(null);

    // Record confirmation for future reference
    // TODO: Store user's preference to skip future warnings

    await finishProjectCreation(handle, folderName);
  };

  const handleOverlapCancel = () => {
    setOverlapCheck(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <>
      {!overlapCheck && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-background border border-border rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Select Project Folder</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a folder to use as your project workspace
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2 p-3 bg-muted rounded-md mb-4">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your project files will be stored in this folder. You can grant
                permission to access the folder for this session only.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePickFolder}
                disabled={isPicking}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderOpen className="h-4 w-4" />
                {isPicking ? 'Opening Folder Picker...' : 'Select Folder'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isPicking}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onOpenChange(false);
                    onFallbackToTemp?.();
                  }}
                  disabled={isPicking}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use Temp Project
                </button>
              </div>
            </div>

            {/* Platform Hint */}
            {isDesktopPlatform() && !isFSASupported() && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Folder picking requires a desktop browser (Chrome, Edge, or Opera)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Overlap Warning Dialog */}
      {overlapCheck && (
        <FolderOverlapWarningDialog
          open={!!overlapCheck}
          overlapResult={overlapCheck.result}
          folderPath={overlapCheck.folderPath}
          onOpenChange={(open) => {
            if (!open) setOverlapCheck(null);
          }}
          onConfirm={handleOverlapConfirm}
          onCancel={handleOverlapCancel}
        />
      )}
    </>
  );
}

// ============================================================================
// Compact Variant (for mobile/small screens)
// ============================================================================

export interface FolderPickerCompactProps {
  onPickFolder: () => Promise<FolderPickerResult>;
  onUseTemp: () => void;
}

/**
 * Compact folder picker for smaller screens
 */
export function FolderPickerCompact({
  onPickFolder,
  onUseTemp,
}: FolderPickerCompactProps) {
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = async () => {
    setIsPicking(true);
    try {
      await onPickFolder();
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <button
        onClick={handlePick}
        disabled={isPicking}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FolderOpen className="h-4 w-4" />
        {isPicking ? 'Opening...' : 'Select Project Folder'}
      </button>
      <button
        onClick={onUseTemp}
        disabled={isPicking}
        className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Use Temp Project Instead
      </button>
    </div>
  );
}
