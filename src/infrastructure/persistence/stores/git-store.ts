/**
 * @fileoverview Git Store
 * @module stores/git-store
 *
 * Zustand store for Git state management.
 * Follows December 2025 Zustand best practices with slice pattern.
 *
 * @story S-035 - Git Integration
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  GitClient,
  GitStatus,
  GitBranch,
  GitCommit,
  GitFileStatus,
  GitDiff,
} from '@/lib/git/git-client';

/**
 * Git store state
 */
interface GitState {
  // Git client instance (lazy initialized)
  client: GitClient | null;

  // Current repository path
  repoPath: string | null;

  // Current Git status
  status: GitStatus | null;

  // List of branches
  branches: GitBranch[];

  // Commit log
  commits: GitCommit[];

  // Current diff (for viewing)
  currentDiff: GitDiff | null;

  // Merge conflict state
  inConflict: boolean;

  // Loading states
  isLoading: boolean;
  isCommitting: boolean;
  isBranchSwitching: boolean;

  // Error state
  error: Error | null;

  // Settings
  showUntrackedFiles: boolean;
  diffViewMode: 'unified' | 'side-by-side';
}

/**
 * Git store actions
 */
interface GitActions {
  // Initialize Git client
  initClient: (repoPath: string) => void;

  // Set repository path
  setRepoPath: (path: string) => void;

  // Refresh Git status
  refreshStatus: () => Promise<void>;

  // Stage files
  stageFiles: (filepaths: string[]) => Promise<void>;

  // Unstage files
  unstageFiles: (filepaths: string[]) => Promise<void>;

  // Commit staged changes
  commit: (message: string, options?: { amend?: boolean; signoff?: boolean }) => Promise<void>;

  // Load branches
  loadBranches: () => Promise<void>;

  // Create branch
  createBranch: (name: string, checkout?: boolean) => Promise<void>;

  // Switch branch
  switchBranch: (name: string) => Promise<void>;

  // Delete branch
  deleteBranch: (name: string) => Promise<void>;

  // Merge branch
  mergeBranch: (name: string) => Promise<void>;

  // Load commit log
  loadCommits: (options?: { maxCount?: number }) => Promise<void>;

  // Get file diff
  getDiff: (filepath: string) => Promise<void>;

  // Clear current diff
  clearDiff: () => void;

  // Resolve merge conflict
  resolveConflict: (filepath: string, resolution: 'ours' | 'theirs' | 'manual') => Promise<void>;

  // Toggle untracked files visibility
  toggleShowUntracked: () => void;

  // Set diff view mode
  setDiffViewMode: (mode: 'unified' | 'side-by-side') => void;

  // Clear error
  clearError: () => void;

  // Reset state
  reset: () => void;
}

/**
 * Initial state
 */
const initialState: GitState = {
  client: null,
  repoPath: null,
  status: null,
  branches: [],
  commits: [],
  currentDiff: null,
  inConflict: false,
  isLoading: false,
  isCommitting: false,
  isBranchSwitching: false,
  error: null,
  showUntrackedFiles: true,
  diffViewMode: 'unified',
};

/**
 * Git store slice
 *
 * Provides Git state and actions for version control operations.
 */
export const useGitStore = create<GitState & GitActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    initClient: (repoPath) => {
      import('@/lib/git/git-client').then(({ GitClient }) => {
        const { gitCredentialManager } = require('@/lib/git/git-credentials');
        const client = new GitClient({
          dir: repoPath,
          credentialManager: gitCredentialManager,
        });
        set({ client, repoPath });
      });
    },

    setRepoPath: (path) => {
      set({ repoPath: path });
    },

    refreshStatus: async () => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const status = await client.getStatus();
        set({ status, inConflict: status.inConflict, isLoading: false });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to get status');
        set({ error: err, isLoading: false });
      }
    },

    stageFiles: async (filepaths) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        await client.stageFiles(filepaths);
        await get().refreshStatus();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to stage files');
        set({ error: err });
      }
    },

    unstageFiles: async (filepaths) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        await client.unstageFiles(filepaths);
        await get().refreshStatus();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to unstage files');
        set({ error: err });
      }
    },

    commit: async (message, options) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      set({ isCommitting: true, error: null });

      try {
        await client.commit({ message, ...options });
        await get().refreshStatus();
        set({ isCommitting: false });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to commit');
        set({ error: err, isCommitting: false });
      }
    },

    loadBranches: async () => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        const branches = await client.getBranches();
        set({ branches });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load branches');
        set({ error: err });
      }
    },

    createBranch: async (name, checkout) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        await client.createBranch(name, checkout);
        await get().loadBranches();
        await get().refreshStatus();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to create branch');
        set({ error: err });
      }
    },

    switchBranch: async (name) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      set({ isBranchSwitching: true, error: null });

      try {
        await client.switchBranch(name);
        await get().loadBranches();
        await get().refreshStatus();
        set({ isBranchSwitching: false });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to switch branch');
        set({ error: err, isBranchSwitching: false });
      }
    },

    deleteBranch: async (name) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        await client.deleteBranch(name);
        await get().loadBranches();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to delete branch');
        set({ error: err });
      }
    },

    mergeBranch: async (name) => {
      const { client } = get();
      if (!client) {
        console.warn('Git client not initialized');
        return;
      }

      try {
        await client.mergeBranch(name);
        await get().refreshStatus();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to merge branch');
        set({ error: err });
      }
    },

    loadCommits: async (options) => {
      const { client } = get();
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

    getDiff: async (filepath) => {
      const { client } = get();
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

    resolveConflict: async (filepath, resolution) => {
      // Conflict resolution logic
      // This would open the file and apply resolution
      console.log('Resolving conflict:', filepath, resolution);
    },

    toggleShowUntracked: () => {
      set((state) => ({ showUntrackedFiles: !state.showUntrackedFiles }));
    },

    setDiffViewMode: (mode) => {
      set({ diffViewMode: mode });
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

/**
 * Selectors for optimized re-renders
 */
export const selectGitStatus = (state: GitState & GitActions) => state.status;
export const selectGitBranches = (state: GitState & GitActions) => state.branches;
export const selectGitCommits = (state: GitState & GitActions) => state.commits;
export const selectCurrentDiff = (state: GitState & GitActions) => state.currentDiff;
export const selectIsGitLoading = (state: GitState & GitActions) => state.isLoading;
export const selectIsGitCommitting = (state: GitState & GitActions) => state.isCommitting;
export const selectGitError = (state: GitState & GitActions) => state.error;
export const selectShowUntrackedFiles = (state: GitState & GitActions) => state.showUntrackedFiles;
export const selectDiffViewMode = (state: GitState & GitActions) => state.diffViewMode;
