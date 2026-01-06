/**
 * Git Store - Backward Compatibility Facade
 *
 * Re-exports from new sliced architecture for backward compatibility.
 *
 * @deprecated Import from @/infrastructure/persistence/stores/git instead.
 */

export {
  useGitStore,
  useGitStoreFacade,
  // Selectors
  selectGitStatus,
  selectGitBranches,
  selectGitCommits,
  selectCurrentDiff,
  selectIsGitLoading,
  selectIsGitCommitting,
  selectIsBranchSwitching,
  selectGitError,
  selectShowUntrackedFiles,
  selectDiffViewMode,
  selectInConflict,
  selectGitClient,
  selectRepoPath,
} from './git';

// Re-export types
export type { GitStore, GitStoreState, GitStoreActions } from './git';
