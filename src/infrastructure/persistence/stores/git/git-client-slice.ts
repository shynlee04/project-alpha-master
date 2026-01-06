/**
 * Git Client Slice
 *
 * Manages Git client initialization, repository path, and error handling.
 * Part of the December 2025 Zustand slice pattern refactoring.
 *
 * @module stores/git/git-client-slice
 * @story S-035 - Git Integration
 */

import type { StateCreator } from 'zustand';
import type { GitClient } from '@/lib/git/git-client';

/**
 * Git Client State
 */
export interface GitClientState {
  /** Git client instance (lazy initialized) */
  client: GitClient | null;

  /** Current repository path */
  repoPath: string | null;

  /** Loading state for client operations */
  isLoading: boolean;

  /** Error state */
  error: Error | null;
}

/**
 * Git Client Actions
 */
export interface GitClientActions {
  /** Initialize Git client */
  initClient: (repoPath: string) => void;

  /** Set repository path */
  setRepoPath: (path: string) => void;

  /** Clear error */
  clearError: () => void;

  /** Reset client state */
  resetClient: () => void;
}

/**
 * Initial client state
 */
const initialClientState: GitClientState = {
  client: null,
  repoPath: null,
  isLoading: false,
  error: null,
};

/**
 * Git Client Slice Creator
 */
export const createGitClientSlice: StateCreator<
  GitClientState & GitClientActions,
  [],
  [],
  GitClientState & GitClientActions
> = (set, get) => ({
  ...initialClientState,

  initClient: (repoPath: string) => {
    import('@/lib/git/git-client').then(({ GitClient }) => {
      const { gitCredentialManager } = require('@/lib/git/git-credentials');
      const client = new GitClient({
        dir: repoPath,
        credentialManager: gitCredentialManager,
      });
      set({ client, repoPath });
    });
  },

  setRepoPath: (path: string) => {
    set({ repoPath: path });
  },

  clearError: () => {
    set({ error: null });
  },

  resetClient: () => {
    set(initialClientState);
  },
});
