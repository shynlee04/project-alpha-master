/**
 * Git Branch Slice
 *
 * Manages Git branch operations including listing, creating, switching, and deleting branches.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/git/git-branch-slice
 * @story S-035 - Git Integration
 */

import type { StateCreator } from 'zustand';
import type { GitBranch, GitClient } from '@/lib/git/git-client';
import type { GitClientState } from './git-client-slice';
import type { GitStatusActions } from './git-status-slice';

/**
 * Git Branch State
 */
export interface GitBranchState {
  /** List of branches */
  branches: GitBranch[];

  /** Loading state for branch switching */
  isBranchSwitching: boolean;
}

/**
 * Git Branch Actions
 */
export interface GitBranchActions {
  /** Load branches */
  loadBranches: () => Promise<void>;

  /** Create branch */
  createBranch: (name: string, checkout?: boolean) => Promise<void>;

  /** Switch branch */
  switchBranch: (name: string) => Promise<void>;

  /** Delete branch */
  deleteBranch: (name: string) => Promise<void>;

  /** Merge branch */
  mergeBranch: (name: string) => Promise<void>;
}

/**
 * Initial branch state
 */
const initialBranchState: GitBranchState = {
  branches: [],
  isBranchSwitching: false,
};

/**
 * Git Branch Slice Creator
 */
export const createGitBranchSlice: StateCreator<
  GitClientState & GitBranchState & GitBranchActions,
  [],
  [],
  GitBranchState & GitBranchActions
> = (set, get) => ({
  ...initialBranchState,

  loadBranches: async () => {
    const client = (get() as { client: GitClient | null }).client;
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

  createBranch: async (name: string, checkout?: boolean) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      await client.createBranch(name, checkout);
      await (get() as GitBranchActions).loadBranches();
      await (get() as { refreshStatus: () => Promise<void> }).refreshStatus();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create branch');
      set({ error: err });
    }
  },

  switchBranch: async (name: string) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    set({ isBranchSwitching: true });

    try {
      await client.switchBranch(name);
      await (get() as GitBranchActions).loadBranches();
      await (get() as { refreshStatus: () => Promise<void> }).refreshStatus();
      set({ isBranchSwitching: false });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to switch branch');
      set({ error: err, isBranchSwitching: false });
    }
  },

  deleteBranch: async (name: string) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      await client.deleteBranch(name);
      await (get() as GitBranchActions).loadBranches();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete branch');
      set({ error: err });
    }
  },

  mergeBranch: async (name: string) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      await client.mergeBranch(name);
      await (get() as { refreshStatus: () => Promise<void> }).refreshStatus();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to merge branch');
      set({ error: err });
    }
  },
});
