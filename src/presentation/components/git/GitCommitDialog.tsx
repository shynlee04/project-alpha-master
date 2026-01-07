/**
 * @fileoverview Git Commit Dialog
 * @module components/git/GitCommitDialog
 *
 * Dialog for creating Git commits with staging and message editing.
 *
 * @story S-035 - Git Integration
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitCommitHorizontal,
  Plus,
  Trash2,
  FileText,
  Check,
} from 'lucide-react';
import { useGitCommit } from '@/hooks/useGit';
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
import { Textarea } from '@/presentation/components/ui/textarea';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';

/**
 * Git file status card
 */
interface FileStatusCardProps {
  filepath: string;
  status: 'staged' | 'modified' | 'untracked' | 'conflicted' | 'deleted';
  onStage: () => void;
  onUnstage: () => void;
}

function FileStatusCard({ filepath, status, onStage, onUnstage }: FileStatusCardProps) {
  const { t } = useTranslation();

  const getStatusColor = () => {
    switch (status) {
      case 'staged':
        return 'text-[var(--success)]';
      case 'modified':
        return 'text-[var(--warning)]';
      case 'untracked':
        return 'text-[var(--neutral-500)]';
      case 'conflicted':
        return 'text-[var(--destructive)]';
      case 'deleted':
        return 'text-[var(--destructive)]';
      default:
        return 'text-[var(--foreground)]';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'staged':
        return t('git.status.staged');
      case 'modified':
        return t('git.status.modified');
      case 'untracked':
        return t('git.status.untracked');
      case 'conflicted':
        return t('git.status.conflicted', 'Conflicted');
      case 'deleted':
        return t('git.status.deleted', 'Deleted');
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] transition-colors">
      <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
      <span className="flex-1 text-sm truncate font-mono">{filepath}</span>
      <span className={`text-xs font-medium ${getStatusColor()}`}>{getStatusLabel()}</span>
      {status === 'staged' ? (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onUnstage}
          aria-label={t('git.action.unstage')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={onStage}
          aria-label={t('git.action.stage')}
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Git Commit Dialog Props
 */
export interface GitCommitDialogProps {
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
 * Git Commit Dialog
 *
 * Features:
 * - Stage/unstage files
 * - Multi-line commit message editor
 * - Amend last commit option
 * - Sign-off option
 * - File list with status indicators
 * - Mobile full-screen view
 * - i18n support
 * - 8-bit gaming style
 *
 * @example
 * ```tsx
 * <GitCommitDialog repoPath="/path/to/repo" />
 * ```
 */
export function GitCommitDialog({
  repoPath,
  trigger,
  open,
  onOpenChange,
}: GitCommitDialogProps) {
  const { t } = useTranslation();
  const {
    stagedFiles,
    commit,
    isCommitting,
    error,
    clearError,
    canCommit,
    refreshStatus,
    stageFiles,
    unstageFiles,
  } = useGitCommit(repoPath);

  const [message, setMessage] = useState('');
  const [amend, setAmend] = useState(false);
  const [signoff, setSignoff] = useState(false);

  // Refresh status on mount
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /**
   * Stage file
   */
  const handleStage = useCallback(
    async (filepath: string) => {
      await stageFiles([filepath]);
      await refreshStatus();
    },
    [stageFiles, refreshStatus]
  );

  /**
   * Unstage file
   */
  const handleUnstage = useCallback(
    async (filepath: string) => {
      await unstageFiles([filepath]);
      await refreshStatus();
    },
    [unstageFiles, refreshStatus]
  );

  /**
   * Commit changes
   */
  const handleCommit = useCallback(async () => {
    if (!message.trim() || !canCommit) return;

    try {
      await commit(message, { amend, signoff });
      setMessage('');
      setAmend(false);
      setSignoff(false);
    } catch (err) {
      // Error already handled by hook
    }
  }, [message, amend, signoff, canCommit, commit]);

  /**
   * Handle dialog open change
   */
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        // Refresh status when opening
        refreshStatus();
      }
      onOpenChange?.(newOpen);
    },
    [refreshStatus, onOpenChange]
  );

  const filesList = useMemo(() => {
    return stagedFiles.map((file) => (
      <FileStatusCard
        key={file.path}
        filepath={file.path}
        status={file.status}
        onStage={() => handleStage(file.path)}
        onUnstage={() => handleUnstage(file.path)}
      />
    ));
  }, [stagedFiles, handleStage, handleUnstage]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        size="lg"
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommitHorizontal className="w-5 h-5" />
            {t('git.commit.title')}
          </DialogTitle>
          <DialogDescription>
            {t('git.commit.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File list */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t('git.commit.stagedFiles')}
              <span className="ml-2 text-[var(--muted-foreground)]">
                ({stagedFiles.length})
              </span>
            </Label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filesList.length > 0 ? (
                filesList
              ) : (
                <div className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  {t('git.commit.noStagedFiles')}
                </div>
              )}
            </div>
          </div>

          {/* Commit message */}
          <div className="space-y-2">
            <Label htmlFor="commit-message">{t('git.commit.message')}</Label>
            <Textarea
              id="commit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('git.commit.messagePlaceholder')}
              className="min-h-32 font-mono text-sm"
              disabled={isCommitting}
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="amend"
                checked={amend}
                onCheckedChange={setAmend}
                disabled={isCommitting}
              />
              <Label htmlFor="amend" className="text-sm cursor-pointer">
                {t('git.commit.amend')}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="signoff"
                checked={signoff}
                onCheckedChange={setSignoff}
                disabled={isCommitting}
              />
              <Label htmlFor="signoff" className="text-sm cursor-pointer">
                {t('git.commit.signoff')}
              </Label>
            </div>
          </div>

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
            disabled={isCommitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleCommit}
            disabled={!message.trim() || !canCommit || isCommitting}
            loading={isCommitting}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {t('git.commit.action')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
