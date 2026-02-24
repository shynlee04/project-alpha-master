/**
 * Git Status Slice
 *
 * Manages Git status operations including staging, unstaging, and status queries.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/git/git-status-slice
 * @story S-035 - Git Integration
 */

import type { StateCreator } from 'zustand';
import type { GitStatus, GitClient } from '@/lib/git/git-client';
import type { GitClientState } from './git-client-slice';

/**
 * Git Status State
 */
export interface GitStatusState {
  /** Current Git status */
  status: GitStatus | null;

  /** Merge conflict state */
  inConflict: boolean;

  /** Loading state for status operations */
  isLoadingStatus: boolean;
}

/**
 * Git Status Actions
 */
export interface GitStatusActions {
  /** Refresh Git status */
  refreshStatus: () => Promise<void>;

  /** Stage files */
  stageFiles: (filepaths: string[]) => Promise<void>;

  /** Unstage files */
  unstageFiles: (filepaths: string[]) => Promise<void>;
}

/**
 * Initial status state
 */
const initialStatusState: GitStatusState = {
  status: null,
  inConflict: false,
  isLoadingStatus: false,
};

/**
 * Git Status Slice Creator
 */
export const createGitStatusSlice: StateCreator<
  GitClientState & GitStatusState & GitStatusActions,
  [],
  [],
  GitStatusState & GitStatusActions
> = (set, get) => ({
  ...initialStatusState,

  refreshStatus: async () => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    set({ isLoadingStatus: true });

    try {
      const status = await client.getStatus();
      set({ status, inConflict: status.inConflict, isLoadingStatus: false });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get status');
      set({ error: err, isLoadingStatus: false });
    }
  },

  stageFiles: async (filepaths: string[]) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      await client.stageFiles(filepaths);
      await (get() as GitStatusActions).refreshStatus();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to stage files');
      set({ error: err });
    }
  },

  unstageFiles: async (filepaths: string[]) => {
    const client = (get() as { client: GitClient | null }).client;
    if (!client) {
      console.warn('Git client not initialized');
      return;
    }

    try {
      await client.unstageFiles(filepaths);
      await (get() as GitStatusActions).refreshStatus();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to unstage files');
      set({ error: err });
    }
  },
});
