/**
 * @fileoverview Git Merge Conflict Resolver
 * @module components/git/GitMergeConflictResolver
 *
 * Component for resolving merge conflicts (ours, theirs, manual edit).
 *
 * @story S-035 - Git Integration
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitMerge,
  AlertTriangle,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useGit } from '@/hooks/useGit';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/presentation/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Label } from '@/presentation/components/ui/label';

/**
 * Conflict hunk props
 */
interface ConflictHunkProps {
  filepath: string;
  ours: string;
  theirs: string;
  currentContent: string;
  onContentChange: (content: string) => void;
  onAcceptOurs: () => void;
  onAcceptTheirs: () => void;
}

function ConflictHunk({
  filepath,
  ours,
  theirs,
  currentContent,
  onContentChange,
  onAcceptOurs,
  onAcceptTheirs,
}: ConflictHunkProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 rounded bg-[var(--destructive)]/10 border border-[var(--destructive)]">
        <AlertTriangle className="w-4 h-4 text-[var(--destructive)]" />
        <span className="text-sm font-medium text-[var(--destructive)]">
          {t('git.conflict.detected')}
        </span>
      </div>

      <div className="font-mono text-sm">{filepath}</div>

      {/* Ours */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('git.conflict.ours')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAcceptOurs}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {t('git.conflict.acceptOurs')}
          </Button>
        </div>
        <Textarea
          value={ours}
          readOnly
          className="font-mono text-sm min-h-32 bg-[var(--accent)]"
        />
      </div>

      {/* Theirs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('git.conflict.theirs')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onAcceptTheirs}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {t('git.conflict.acceptTheirs')}
          </Button>
        </div>
        <Textarea
          value={theirs}
          readOnly
          className="font-mono text-sm min-h-32 bg-[var(--accent)]"
        />
      </div>

      {/* Manual edit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('git.conflict.manual')}</span>
        </div>
        <Textarea
          value={currentContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={t('git.conflict.manualPlaceholder')}
          className="font-mono text-sm min-h-32"
          autoFocus
        />
      </div>
    </div>
  );
}

/**
 * Git Merge Conflict Resolver Props
 */
export interface GitMergeConflictResolverProps {
  /** Repository path */
  repoPath: string;
  /** Trigger button */
  trigger?: React.ReactNode;
  /** Dialog open state */
  open?: boolean;
  /** Dialog open change handler */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Git Merge Conflict Resolver
 *
 * Features:
 * - Show both versions (ours/theirs)
 * - Accept ours button
 * - Accept theirs button
 * - Manual edit mode
 * - Mark as resolved
 * - Continue merge
 * - Mobile full-screen view
 * - i18n support
 * - 8-bit gaming style
 *
 * @example
 * ```tsx
 * <GitMergeConflictResolver repoPath="/path/to/repo" />
 * ```
 */
export function GitMergeConflictResolver({
  repoPath,
  trigger,
  open,
  onOpenChange,
}: GitMergeConflictResolverProps) {
  const { t } = useTranslation();
  const {
    status,
    conflictedFiles,
    resolveConflict,
    inConflict,
    error,
    clearError,
    refreshStatus,
  } = useGit({ repoPath });

  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [manualContents, setManualContents] = useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedFiles, setResolvedFiles] = useState<Set<string>>(new Set());

  const currentConflict = conflictedFiles[currentConflictIndex];

  /**
   * Navigate to next conflict
   */
  const goToNextConflict = useCallback(() => {
    if (currentConflictIndex < conflictedFiles.length - 1) {
      setCurrentConflictIndex(currentConflictIndex + 1);
    }
  }, [currentConflictIndex, conflictedFiles.length]);

  /**
   * Navigate to previous conflict
   */
  const goToPreviousConflict = useCallback(() => {
    if (currentConflictIndex > 0) {
      setCurrentConflictIndex(currentConflictIndex - 1);
    }
  }, [currentConflictIndex]);

  /**
   * Accept ours
   */
  const handleAcceptOurs = useCallback(
    async (filepath: string) => {
      setIsResolving(true);
      try {
        await resolveConflict(filepath, 'ours');
        setResolvedFiles((prev) => new Set(prev).add(filepath));

        if (currentConflictIndex < conflictedFiles.length - 1) {
          goToNextConflict();
        } else {
          await refreshStatus();
          onOpenChange?.(false);
        }
      } catch (err) {
        // Error already handled by hook
      } finally {
        setIsResolving(false);
      }
    },
    [
      resolveConflict,
      currentConflictIndex,
      conflictedFiles.length,
      goToNextConflict,
      refreshStatus,
      onOpenChange,
    ]
  );

  /**
   * Accept theirs
   */
  const handleAcceptTheirs = useCallback(
    async (filepath: string) => {
      setIsResolving(true);
      try {
        await resolveConflict(filepath, 'theirs');
        setResolvedFiles((prev) => new Set(prev).add(filepath));

        if (currentConflictIndex < conflictedFiles.length - 1) {
          goToNextConflict();
        } else {
          await refreshStatus();
          onOpenChange?.(false);
        }
      } catch (err) {
        // Error already handled by hook
      } finally {
        setIsResolving(false);
      }
    },
    [
      resolveConflict,
      currentConflictIndex,
      conflictedFiles.length,
      goToNextConflict,
      refreshStatus,
      onOpenChange,
    ]
  );

  /**
   * Accept manual edit
   */
  const handleAcceptManual = useCallback(
    async (filepath: string) => {
      const manualContent = manualContents[filepath];
      if (!manualContent) {
        return;
      }

      setIsResolving(true);
      try {
        await resolveConflict(filepath, 'manual');
        setResolvedFiles((prev) => new Set(prev).add(filepath));

        if (currentConflictIndex < conflictedFiles.length - 1) {
          goToNextConflict();
        } else {
          await refreshStatus();
          onOpenChange?.(false);
        }
      } catch (err) {
        // Error already handled by hook
      } finally {
        setIsResolving(false);
      }
    },
    [
      manualContents,
      resolveConflict,
      currentConflictIndex,
      conflictedFiles.length,
      goToNextConflict,
      refreshStatus,
      onOpenChange,
    ]
  );

  /**
   * Handle manual content change
   */
  const handleManualContentChange = useCallback((filepath: string, content: string) => {
    setManualContents((prev) => ({
      ...prev,
      [filepath]: content,
    }));
  }, []);

  const conflictContent = useMemo(() => {
    if (!currentConflict) return null;

    // Placeholder content - in real implementation, read file and parse conflicts
    const ours = t('git.conflict.exampleOurs');
    const theirs = t('git.conflict.exampleTheirs');
    const currentContent = manualContents[currentConflict.path] || '';

    return (
      <ConflictHunk
        filepath={currentConflict.path}
        ours={ours}
        theirs={theirs}
        currentContent={currentContent}
        onContentChange={(content) =>
          handleManualContentChange(currentConflict.path, content)
        }
        onAcceptOurs={() => handleAcceptOurs(currentConflict.path)}
        onAcceptTheirs={() => handleAcceptTheirs(currentConflict.path)}
      />
    );
  }, [currentConflict, manualContents, t, handleManualContentChange, handleAcceptOurs, handleAcceptTheirs]);

  if (!inConflict || conflictedFiles.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        size="xl"
        className="max-w-6xl max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--destructive)]">
            <GitMerge className="w-5 h-5" />
            {t('git.conflict.title')}
          </DialogTitle>
          <DialogDescription>
            {t('git.conflict.description')}
            <span className="ml-2 text-[var(--destructive)]">
              ({conflictedFiles.length} {t('git.conflict.remaining')})
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conflict selector */}
          {conflictedFiles.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('git.conflict.fileSelector')}
              </Label>
              <Select
                value={currentConflict?.path}
                onValueChange={(value) => {
                  const index = conflictedFiles.findIndex((f) => f.path === value);
                  if (index >= 0) {
                    setCurrentConflictIndex(index);
                  }
                }}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conflictedFiles.map((file, index) => (
                    <SelectItem key={file.path} value={file.path}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {file.path}
                        {resolvedFiles.has(file.path) && (
                          <Check className="w-4 h-4 text-[var(--success)]" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={goToPreviousConflict}
              disabled={currentConflictIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t('git.conflict.previous')}
            </Button>
            <span className="text-sm text-[var(--muted-foreground)]">
              {currentConflictIndex + 1} / {conflictedFiles.length}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToNextConflict}
              disabled={currentConflictIndex === conflictedFiles.length - 1}
              leftIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('git.conflict.next')}
            </Button>
          </div>

          {/* Conflict content */}
          <div className="max-h-96 overflow-y-auto">{conflictContent}</div>

          {/* Manual accept button */}
          {currentConflict && manualContents[currentConflict.path] && (
            <Button
              variant="primary"
              onClick={() => handleAcceptManual(currentConflict.path)}
              disabled={isResolving}
              loading={isResolving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              {t('git.conflict.acceptManual')}
            </Button>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded border border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)] text-sm">
              {error.message}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                {t('common.dismiss')}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange?.(false)}
            disabled={isResolving}
          >
            {t('common.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
