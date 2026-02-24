/**
 * Git Operations Slice
 *
 * Manages Git commit operations, diff viewing, conflict resolution, and view settings.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/git/git-operations-slice
 * @story S-035 - Git Integration
 */

import type { StateCreator } from 'zustand';
import type { GitCommit, GitDiff, GitClient } from '@/lib/git/git-client';
import type { GitClientState } from './git-client-slice';
import type { GitStatusActions } from './git-status-slice';

/**
 * Git Operations State
 */
export interface GitOperationsState {
  /** Commit log */
  commits: GitCommit[];

  /** Current diff (for viewing) */
  currentDiff: GitDiff | null;

  /** Loading state for committing */
  isCommitting: boolean;

  /** Settings: show untracked files */
  showUntrackedFiles: boolean;

  /** Settings: diff view mode */
  diffViewMode: 'unified' | 'side-by-side';
}

/**
 * Git Operations Actions
 */
export interface GitOperationsActions {
  /** Load commit log */
  loadCommits: (options?: { maxCount?: number }) => Promise<void>;

  /** Commit staged changes */
  commit: (message: string, options?: { amend?: boolean; signoff?: boolean }) => Promise<void>;

  /** Get file diff */
  getDiff: (filepath: string) => Promise<void>;

  /** Clear current diff */
  clearDiff: () => void;

  /** Resolve merge conflict */
  resolveConflict: (filepath: string, resolution: 'ours' | 'theirs' | 'manual') => Promise<void>;

  /** Toggle untracked files visibility */
  toggleShowUntracked: () => void;

  /** Set diff view mode */
  setDiffViewMode: (mode: 'unified' | 'side-by-side') => void;
}

/**
 * Initial operations state
 */
const initialOperationsState: GitOperationsState = {
  commits: [],
  currentDiff: null,
  isCommitting: false,
  showUntrackedFiles: true,
  diffViewMode: 'unified',
};

/**
 * Git Operations Slice Creator
 */
export const createGitOperationsSlice: StateCreator<
  GitClientState & GitOperationsState & GitOperationsActions,
  [],
  [],
  GitOperationsState & GitOperationsActions
> = (set, get) => ({
  ...initialOperationsState,

  loadCommits: async (options?: { maxCount?: number }) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      const commits = await client.getLog(options);
      set({ commits });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load commits');
      set({ error: err });
    }
  },

  commit: async (message: string, options?: { amend?: boolean; signoff?: boolean }) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    set({ isCommitting: true });

    try {
      await client.commit({ message, ...options });
      await (get() as unknown as GitStatusActions).refreshStatus();
      set({ isCommitting: false });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to commit');
      set({ error: err, isCommitting: false });
    }
  },

  getDiff: async (filepath: string) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      const diff = await client.getDiff(filepath);
      set({ currentDiff: diff });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get diff');
      set({ error: err });
    }
  },

  clearDiff: () => {
    set({ currentDiff: null });
  },

  resolveConflict: async (filepath: string, resolution: 'ours' | 'theirs' | 'manual') => {
    // Conflict resolution logic
    // This would open the file and apply resolution
    console.log('Resolving conflict:', filepath, resolution);
  },

  toggleShowUntracked: () => {
    set((state) => ({ showUntrackedFiles: !state.showUntrackedFiles }));
  },

  setDiffViewMode: (mode: 'unified' | 'side-by-side') => {
    set({ diffViewMode: mode });
  },
});
