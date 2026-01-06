/**
 * Git Store (Refactored)
 *
 * Zustand store for Git state management.
 * Refactored into 4 slices following December 2025 Zustand best practices.
 *
 * @module stores/git
 * @story S-035 - Git Integration
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createGitClientSlice, GitClientState, GitClientActions } from './git-client-slice';
import { createGitStatusSlice, GitStatusState, GitStatusActions } from './git-status-slice';
import { createGitBranchSlice, GitBranchState, GitBranchActions } from './git-branch-slice';
import { createGitOperationsSlice, GitOperationsState, GitOperationsActions } from './git-operations-slice';

/**
 * Combined Git Store State
 */
export type GitStoreState =
  & GitClientState
  & GitStatusState
  & GitBranchState
  & GitOperationsState;

/**
 * Combined Git Store Actions
 */
export type GitStoreActions =
  & GitClientActions
  & GitStatusActions
  & GitBranchActions
  & GitOperationsActions;

/**
 * Complete Git Store Interface
 */
export interface GitStore extends GitStoreState, GitStoreActions {}

/**
 * Git Store (Combined Slices)
 *
 * Combines all 4 slices into a single store with cross-slice communication.
 */
export const useGitStore = create<GitStore>()(
  subscribeWithSelector((set, get, api) => ({
    // Slice 1: Client Management
    ...createGitClientSlice(set, get, api),

    // Slice 2: Status Operations
    ...createGitStatusSlice(set, get, api),

    // Slice 3: Branch Management
    ...createGitBranchSlice(set, get, api),

    // Slice 4: Commit/Diff Operations
    ...createGitOperationsSlice(set, get, api),
  }))
);

// ============================================================================
// SELECTORS (Individual selectors for December 2025 Zustand pattern)
// ============================================================================

/**
 * Select Git status
 */
export const selectGitStatus = (state: GitStore) => state.status;

/**
 * Select Git branches
 */
export const selectGitBranches = (state: GitStore) => state.branches;

/**
 * Select Git commits
 */
export const selectGitCommits = (state: GitStore) => state.commits;

/**
 * Select current diff
 */
export const selectCurrentDiff = (state: GitStore) => state.currentDiff;

/**
 * Select loading state
 */
export const selectIsGitLoading = (state: GitStore) => state.isLoading;

/**
 * Select committing state
 */
export const selectIsGitCommitting = (state: GitStore) => state.isCommitting;

/**
 * Select branch switching state
 */
export const selectIsBranchSwitching = (state: GitStore) => state.isBranchSwitching;

/**
 * Select Git error
 */
export const selectGitError = (state: GitStore) => state.error;

/**
 * Select show untracked files setting
 */
export const selectShowUntrackedFiles = (state: GitStore) => state.showUntrackedFiles;

/**
 * Select diff view mode
 */
export const selectDiffViewMode = (state: GitStore) => state.diffViewMode;

/**
 * Select conflict state
 */
export const selectInConflict = (state: GitStore) => state.inConflict;

/**
 * Select Git client
 */
export const selectGitClient = (state: GitStore) => state.client;

/**
 * Select repository path
 */
export const selectRepoPath = (state: GitStore) => state.repoPath;

// ============================================================================
// FACADE (Backward compatibility with old git-store.ts)
// ============================================================================

/**
 * @deprecated Use individual selectors or hooks instead.
 * This facade is provided for backward compatibility.
 */
export const useGitStoreFacade = useGitStore;

/**
 * @deprecated Use `selectGitStatus` selector instead.
 */
export const selectStatus = selectGitStatus;

/**
 * @deprecated Use `selectGitBranches` selector instead.
 */
export const selectBranches = selectGitBranches;

/**
 * @deprecated Use `selectGitCommits` selector instead.
 */
export const selectCommits = selectGitCommits;
