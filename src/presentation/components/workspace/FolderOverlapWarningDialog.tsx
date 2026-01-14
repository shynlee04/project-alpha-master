/**
 * @fileoverview Folder Overlap Warning Dialog
 * @module presentation/components/workspace/FolderOverlapWarningDialog
 *
 * **ARC-B07**: Folder overlap detection and warning UI
 *
 * Per ADR-033 Decision D2:
 * - Detect nested/overlapping folder selections
 * - Block same path, warn on parent/child overlap
 * - User can confirm or cancel
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B07
 * @author Team B
 * @created 2026-01-17
 */

import { AlertTriangle, AlertCircle, FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  OverlapResult,
  OverlappingProject,
} from '@/infrastructure/filesystem/folder-overlap-service';

// ============================================================================
// Types
// ============================================================================

export interface FolderOverlapWarningDialogProps {
  /** Overlap detection result */
  overlapResult: OverlapResult;
  /** Selected folder path */
  folderPath: string;
  /** Whether dialog is open */
  open: boolean;
  /** Called when dialog closes */
  onOpenChange: (open: boolean) => void;
  /** Called when user confirms despite overlap */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Folder Overlap Warning Dialog
 *
 * Shows blocking error for same-path overlap.
 * Shows warning for parent/child overlap with confirm/cancel options.
 */
export function FolderOverlapWarningDialog({
  overlapResult,
  folderPath,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: FolderOverlapWarningDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const isBlocking = overlapResult.shouldBlock;
  const Icon = isBlocking ? AlertCircle : AlertTriangle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] p-4"
      onClick={() => {
        onOpenChange(false);
        onCancel();
      }}
    >
      <div
        className={`bg-background border-2 rounded-lg shadow-lg max-w-md w-full p-6 ${
          isBlocking
            ? 'border-[var(--destructive)]'
            : 'border-[var(--warning)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`p-2 rounded-lg ${
              isBlocking
                ? 'bg-[var(--destructive)]/10'
                : 'bg-[var(--warning)]/10'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                isBlocking
                  ? 'text-[var(--destructive)]'
                  : 'text-[var(--warning)]'
              }`}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">
              {isBlocking
                ? t('folderOverlap.block.title')
                : t('folderOverlap.warning.title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isBlocking
                ? t('folderOverlap.block.description')
                : t('folderOverlap.warning.description')}
            </p>
          </div>
        </div>

        {/* Folder Info */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-4">
          <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{folderPath}</span>
        </div>

        {/* Overlapping Projects List */}
        {overlapResult.overlappingProjects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('folderOverlap.overlappingProjects')}
            </p>
            <div className="space-y-2">
              {overlapResult.overlappingProjects.map((project) => (
                <OverlapProjectItem
                  key={project.projectId}
                  project={project}
                />
              ))}
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md mb-4">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {isBlocking
              ? t('folderOverlap.block.message')
              : t('folderOverlap.warning.message')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {isBlocking ? (
            <button
              onClick={() => {
                onOpenChange(false);
                onCancel();
              }}
              className="w-full px-4 py-2 bg-[var(--destructive)] text-white rounded-lg hover:bg-[var(--destructive)]/90 font-medium"
            >
              {t('folderOverlap.block.close')}
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onConfirm();
                }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
              >
                {t('folderOverlap.warning.confirm')}
              </button>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onCancel();
                }}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium"
              >
                {t('actions.cancel')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface OverlapProjectItemProps {
  project: OverlappingProject;
}

function OverlapProjectItem({ project }: OverlapProjectItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 p-2 bg-background border border-border rounded-md">
      <FolderOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.projectName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {project.overlapReason}
        </p>
      </div>
      <span className="text-xs px-2 py-1 bg-muted rounded-full">
        {t('folderOverlap.existing')}
      </span>
    </div>
  );
}
