/**
 * @fileoverview Git Branch Manager
 * @module components/git/GitBranchManager
 *
 * Component for managing Git branches (list, create, switch, delete).
 *
 * @story S-035 - Git Integration
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitBranch,
  GitFork,
  Plus,
  Trash2,
  Check,
  GitMerge,
  ArrowRight,
} from 'lucide-react';
import { useGitBranches } from '@/hooks/useGit';
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
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';

/**
 * Branch card props
 */
interface BranchCardProps {
  branch: {
    name: string;
    isCurrent: boolean;
    isLocal: boolean;
    remote?: string;
  };
  onSwitch: () => void;
  onDelete: () => void;
  onMerge?: () => void;
}

function BranchCard({ branch, onSwitch, onDelete, onMerge }: BranchCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded border transition-colors ${
        branch.isCurrent
          ? 'bg-[var(--primary)]/10 border-[var(--primary)]'
          : 'bg-[var(--card)] border-[var(--border)] hover:bg-[var(--accent)]'
      }`}
    >
      <GitBranch
        className={`w-4 h-4 ${
          branch.isCurrent ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium truncate">
            {branch.name}
          </span>
          {branch.isCurrent && (
            <span className="text-xs bg-[var(--primary)] text-[var(--primary-foreground)] px-2 py-0.5 rounded">
              {t('git.branch.current')}
            </span>
          )}
        </div>
        {branch.remote && (
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <ArrowRight className="w-3 h-3" />
            <span className="font-mono">{branch.remote}</span>
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" iconOnly>
            <Plus className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!branch.isCurrent && branch.isLocal && (
            <DropdownMenuItem onClick={onSwitch}>
              <Check className="w-4 h-4 mr-2" />
              {t('git.branch.switch')}
            </DropdownMenuItem>
          )}
          {onMerge && !branch.isCurrent && (
            <DropdownMenuItem onClick={onMerge}>
              <GitMerge className="w-4 h-4 mr-2" />
              {t('git.branch.merge')}
            </DropdownMenuItem>
          )}
          {!branch.isCurrent && branch.isLocal && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-[var(--destructive)]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('git.branch.delete')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Git Branch Manager Props
 */
export interface GitBranchManagerProps {
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
 * Git Branch Manager
 *
 * Features:
 * - List all branches (local and remote)
 * - Create new branch
 * - Switch branch (with uncommitted changes warning)
 * - Delete branch
 * - Merge branch
 * - Mobile full-screen view
 * - i18n support
 * - 8-bit gaming style
 *
 * @example
 * ```tsx
 * <GitBranchManager repoPath="/path/to/repo" />
 * ```
 */
export function GitBranchManager({
  repoPath,
  trigger,
  open,
  onOpenChange,
}: GitBranchManagerProps) {
  const { t } = useTranslation();
  const {
    branches,
    currentBranch,
    loadBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    mergeBranch,
    isBranchSwitching,
    error,
    clearError,
  } = useGitBranches(repoPath);

  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [branchToMerge, setBranchToMerge] = useState<string | null>(null);

  // Load branches on mount
  useEffect(() => {
    if (open) {
      loadBranches();
    }
  }, [open, loadBranches]);

  /**
   * Create new branch
   */
  const handleCreateBranch = useCallback(async () => {
    if (!newBranchName.trim()) return;

    setIsCreating(true);
    try {
      await createBranch(newBranchName, true);
      setNewBranchName('');
      setShowCreateForm(false);
      await loadBranches();
    } catch (err) {
      // Error already handled by hook
    } finally {
      setIsCreating(false);
    }
  }, [newBranchName, createBranch, loadBranches]);

  /**
   * Switch branch
   */
  const handleSwitchBranch = useCallback(
    async (branchName: string) => {
      try {
        await switchBranch(branchName);
        await loadBranches();
      } catch (err) {
        // Error already handled by hook
      }
    },
    [switchBranch, loadBranches]
  );

  /**
   * Delete branch
   */
  const handleDeleteBranch = useCallback(
    async (branchName: string) => {
      if (
        !confirm(
          t('git.branch.deleteConfirm', { name: branchName })
        )
      ) {
        return;
      }

      try {
        await deleteBranch(branchName);
        setBranchToDelete(null);
        await loadBranches();
      } catch (err) {
        // Error already handled by hook
      }
    },
    [deleteBranch, loadBranches, t]
  );

  /**
   * Merge branch
   */
  const handleMergeBranch = useCallback(
    async (branchName: string) => {
      if (
        !confirm(
          t('git.branch.mergeConfirm', { name: branchName })
        )
      ) {
        return;
      }

      try {
        await mergeBranch(branchName);
        setBranchToMerge(null);
        await loadBranches();
      } catch (err) {
        // Error already handled by hook
      }
    },
    [mergeBranch, loadBranches, t]
  );

  const branchesList = useMemo(() => {
    return branches.map((branch) => (
      <BranchCard
        key={branch.name}
        branch={branch}
        onSwitch={() => handleSwitchBranch(branch.name)}
        onDelete={() => handleDeleteBranch(branch.name)}
        onMerge={() => handleMergeBranch(branch.name)}
      />
    ));
  }, [branches, handleSwitchBranch, handleDeleteBranch, handleMergeBranch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        size="lg"
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork className="w-5 h-5" />
            {t('git.branch.title')}
          </DialogTitle>
          <DialogDescription>
            {t('git.branch.description')}
            {currentBranch && (
              <span className="ml-2 font-mono text-sm">
                ({t('git.branch.current')}: {currentBranch.name})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create branch form */}
          {showCreateForm ? (
            <div className="p-4 rounded border border-[var(--border)] bg-[var(--card)] space-y-3">
              <Label htmlFor="new-branch-name">{t('git.branch.newName')}</Label>
              <div className="flex gap-2">
                <Input
                  id="new-branch-name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder={t('git.branch.namePlaceholder')}
                  className="flex-1 font-mono"
                  disabled={isCreating}
                  autoFocus
                />
                <Button
                  variant="primary"
                  onClick={handleCreateBranch}
                  disabled={!newBranchName.trim() || isCreating}
                  loading={isCreating}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  {t('git.branch.create')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewBranchName('');
                  }}
                  disabled={isCreating}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              {t('git.branch.newBranch')}
            </Button>
          )}

          {/* Branches list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {branchesList.length > 0 ? (
              branchesList
            ) : (
              <div className="text-sm text-[var(--muted-foreground)] text-center py-8">
                {t('git.branch.noBranches')}
              </div>
            )}
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
            disabled={isBranchSwitching}
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
