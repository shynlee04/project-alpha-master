/**
 * @fileoverview Git Operations Hook
 * @module hooks/useGit
 *
 * Custom hook for Git operations with auto-refresh and error handling.
 *
 * @story S-035 - Git Integration
 */

import { useEffect, useCallback } from 'react';
import { useGitStore } from '@/infrastructure/persistence/stores/git-store';
import type {
  GitStatus,
  GitBranch,
  GitCommit,
  GitFileStatus,
  GitDiff,
} from '@/lib/git/git-client';

/**
 * Hook options
 */
export interface UseGitOptions {
  /** Auto-refresh status interval in ms (default: 5000) */
  refreshInterval?: number;
  /** Enable auto-refresh (default: false) */
  autoRefresh?: boolean;
  /** Repository path */
  repoPath?: string;
}

/**
 * Hook return value
 */
interface UseGitReturn {
  // State
  status: GitStatus | null;
  branches: GitBranch[];
  commits: GitCommit[];
  currentDiff: GitDiff | null;
  isLoading: boolean;
  isCommitting: boolean;
  isBranchSwitching: boolean;
  error: Error | null;
  showUntrackedFiles: boolean;
  diffViewMode: 'unified' | 'side-by-side';

  // Actions
  initClient: (repoPath: string) => void;
  refreshStatus: () => Promise<void>;
  stageFiles: (filepaths: string[]) => Promise<void>;
  unstageFiles: (filepaths: string[]) => Promise<void>;
  commit: (message: string, options?: { amend?: boolean; signoff?: boolean }) => Promise<void>;
  loadBranches: () => Promise<void>;
  createBranch: (name: string, checkout?: boolean) => Promise<void>;
  switchBranch: (name: string) => Promise<void>;
  deleteBranch: (name: string) => Promise<void>;
  mergeBranch: (name: string) => Promise<void>;
  loadCommits: (options?: { maxCount?: number }) => Promise<void>;
  getDiff: (filepath: string) => Promise<void>;
  clearDiff: () => void;
  resolveConflict: (filepath: string, resolution: 'ours' | 'theirs' | 'manual') => Promise<void>;
  toggleShowUntracked: () => void;
  setDiffViewMode: (mode: 'unified' | 'side-by-side') => void;
  clearError: () => void;
  reset: () => void;

  // Computed values
  stagedFiles: GitFileStatus[];
  modifiedFiles: GitFileStatus[];
  untrackedFiles: GitFileStatus[];
  conflictedFiles: GitFileStatus[];
  currentBranch: GitBranch | null;
  hasChanges: boolean;
  canCommit: boolean;
}

/**
 * Custom hook for Git operations
 *
 * Features:
 * - Git state management via Zustand store
 * - Auto-refresh with configurable interval
 * - Computed values for common operations
 * - Error handling
 *
 * @param options - Hook options
 * @returns Git state and operations
 *
 * @example
 * ```tsx
 * const { status, stageFiles, commit, hasChanges } = useGit({
 *   repoPath: '/path/to/repo',
 *   autoRefresh: true,
 *   refreshInterval: 5000,
 * });
 *
 * // Stage file
 * await stageFiles(['src/file.ts']);
 *
 * // Commit changes
 * if (hasChanges) {
 *   await commit('Add new feature');
 * }
 * ```
 */
export function useGit(options: UseGitOptions = {}): UseGitReturn {
  const {
    refreshInterval = 5000,
    autoRefresh = false,
    repoPath,
  } = options;

  // Selectors for individual values (prevents infinite loops in Zustand v5)
  const status = useGitStore((state) => state.status);
  const branches = useGitStore((state) => state.branches);
  const commits = useGitStore((state) => state.commits);
  const currentDiff = useGitStore((state) => state.currentDiff);
  const isLoading = useGitStore((state) => state.isLoading);
  const isCommitting = useGitStore((state) => state.isCommitting);
  const isBranchSwitching = useGitStore((state) => state.isBranchSwitching);
  const error = useGitStore((state) => state.error);
  const showUntrackedFiles = useGitStore((state) => state.showUntrackedFiles);
  const diffViewMode = useGitStore((state) => state.diffViewMode);

  // Actions
  const initClient = useGitStore((state) => state.initClient);
  const refreshStatus = useGitStore((state) => state.refreshStatus);
  const stageFiles = useGitStore((state) => state.stageFiles);
  const unstageFiles = useGitStore((state) => state.unstageFiles);
  const commit = useGitStore((state) => state.commit);
  const loadBranches = useGitStore((state) => state.loadBranches);
  const createBranch = useGitStore((state) => state.createBranch);
  const switchBranch = useGitStore((state) => state.switchBranch);
  const deleteBranch = useGitStore((state) => state.deleteBranch);
  const mergeBranch = useGitStore((state) => state.mergeBranch);
  const loadCommits = useGitStore((state) => state.loadCommits);
  const getDiff = useGitStore((state) => state.getDiff);
  const clearDiff = useGitStore((state) => state.clearDiff);
  const resolveConflict = useGitStore((state) => state.resolveConflict);
  const toggleShowUntracked = useGitStore((state) => state.toggleShowUntracked);
  const setDiffViewMode = useGitStore((state) => state.setDiffViewMode);
  const clearError = useGitStore((state) => state.clearError);
  const reset = useGitStore((state) => state.reset);

  // Initialize client if repoPath provided
  useEffect(() => {
    if (repoPath) {
      initClient(repoPath);
    }
  }, [repoPath, initClient]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !repoPath) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshStatus, repoPath]);

  // Computed values
  const stagedFiles = useCallback(() => {
    if (!status) return [];
    return status.files.filter((f) => f.status === 'staged');
  }, [status]);

  const modifiedFiles = useCallback(() => {
    if (!status) return [];
    return status.files.filter((f) => f.status === 'modified');
  }, [status]);

  const untrackedFiles = useCallback(() => {
    if (!status) return [];
    return status.files.filter((f) => f.status === 'untracked');
  }, [status]);

  const conflictedFiles = useCallback(() => {
    if (!status) return [];
    return status.files.filter((f) => f.status === 'conflicted');
  }, [status]);

  const currentBranch = useCallback(() => {
    return branches.find((b) => b.isCurrent) || null;
  }, [branches]);

  const hasChanges = useCallback(() => {
    if (!status) return false;
    return status.files.length > 0;
  }, [status]);

  const canCommit = useCallback(() => {
    if (!status) return false;
    return status.files.some((f) => f.status === 'staged');
  }, [status]);

  return {
    // State
    status,
    branches,
    commits,
    currentDiff,
    isLoading,
    isCommitting,
    isBranchSwitching,
    error,
    showUntrackedFiles,
    diffViewMode,

    // Actions
    initClient,
    refreshStatus,
    stageFiles,
    unstageFiles,
    commit,
    loadBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    mergeBranch,
    loadCommits,
    getDiff,
    clearDiff,
    resolveConflict,
    toggleShowUntracked,
    setDiffViewMode,
    clearError,
    reset,

    // Computed values
    stagedFiles: stagedFiles(),
    modifiedFiles: modifiedFiles(),
    untrackedFiles: untrackedFiles(),
    conflictedFiles: conflictedFiles(),
    currentBranch: currentBranch(),
    hasChanges: hasChanges(),
    canCommit: canCommit(),
  };
}

/**
 * Hook for Git file operations
 *
 * Simplified hook focused on file staging and diff viewing.
 */
export function useGitFiles(repoPath?: string) {
  const {
    status,
    stageFiles,
    unstageFiles,
    getDiff,
    currentDiff,
    clearDiff,
    showUntrackedFiles,
    toggleShowUntracked,
  } = useGit({ repoPath });

  return {
    status,
    stageFiles,
    unstageFiles,
    getDiff,
    currentDiff,
    clearDiff,
    showUntrackedFiles,
    toggleShowUntracked,
  };
}

/**
 * Hook for Git branch operations
 *
 * Simplified hook focused on branch management.
 */
export function useGitBranches(repoPath?: string) {
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
  } = useGit({ repoPath });

  return {
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
  };
}

/**
 * Hook for Git commit operations
 *
 * Simplified hook focused on committing changes.
 */
export function useGitCommit(repoPath?: string) {
  const {
    stagedFiles,
    commit,
    isCommitting,
    error,
    clearError,
    canCommit,
    refreshStatus,
  } = useGit({ repoPath });

  return {
    stagedFiles,
    commit,
    isCommitting,
    error,
    clearError,
    canCommit,
    refreshStatus,
  };
}
