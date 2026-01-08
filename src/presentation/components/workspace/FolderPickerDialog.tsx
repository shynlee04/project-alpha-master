/**
 * @fileoverview Folder Picker Dialog (Phase 1)
 * @module presentation/components/workspace/FolderPickerDialog
 *
 * PHASE 1: Desktop folder picker dialog
 * - Shows dialog for desktop users to select a project folder
 * - Uses FSA showDirectoryPicker() API
 * - Fallback to temp project if user cancels
 * - Toast notifications for errors
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
  open,
  onOpenChange,
  onSuccess,
  onFallbackToTemp,
  onCancel,
}: FolderPickerDialogProps) {
  const [isPicking, setIsPicking] = useState(false);

  const handlePickFolder = async () => {
    setIsPicking(true);

    try {
      const result = await pickFolder();

      if (result.success && result.handle && result.folderName) {
        // Folder selected - create project
        const projectId = await createProjectFromFolder(
          result.handle,
          result.folderName
        );

        toast.success('Project connected', {
          description: `Connected to ${result.folderName}`,
        });

        onOpenChange(false);
        onSuccess?.(projectId);
      } else {
        // Handle failure reasons
        if (result.reason === 'aborted') {
          // User cancelled - offer temp project fallback
          toast.info('No folder selected', {
            description: 'Using temp project for this session',
          });
          onOpenChange(false);
          onFallbackToTemp?.();
        } else if (result.reason === 'not_supported') {
          // FSA not supported - should use temp project
          toast.error('Folder picking not available', {
            description: 'Please use a desktop browser (Chrome, Edge, Opera)',
          });
          onOpenChange(false);
          onFallbackToTemp?.();
        } else {
          // Other error
          toast.error('Failed to open folder', {
            description: result.error?.message || 'Unknown error',
          });
          onOpenChange(false);
          onCancel?.();
        }
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

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
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
