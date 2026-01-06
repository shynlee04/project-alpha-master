# Handoff: bmad-master → bmad-dev-story

**Session**: ASGL-VELOCITY-20260106-060000
**Story**: S-035
**Title: Git Integration - Commit, Branch, Merge, Diff View**
**Date**: 2026-01-06T11:00:00+07:00
**Priority**: P1 - HIGH

## From
- **Agent**: bmad-core-bmad-master (coordinator)
- **Module**: asgl

## To
- **Agent**: bmad-bmm-dev
- **Module**: bmm
- **Path**: _bmad/modules/bmm/agents/dev.md

## Task
Add full Git integration with commit, branch, merge, and diff visualization capabilities.

## Context
No Git integration exists. Users need version control operations without leaving the IDE.

## Root Cause
```typescript
// No Git operations integrated
// No commit/branch management UI
// Missing diff visualization
// No merge conflict resolution
```

## Files to Create/Modify
- **Create**: `src/lib/git/git-client.ts` - Git operations wrapper (isomorphic-git)
- **Create**: `src/presentation/components/git/GitCommitDialog.tsx` - Commit UI
- **Create**: `src/presentation/components/git/GitBranchManager.tsx` - Branch switching
- **Create**: `src/presentation/components/git/GitDiffViewer.tsx` - Enhanced diff view
- **Create**: `src/presentation/components/git/GitMergeConflictResolver.tsx` - Conflict resolution
- **Create**: `src/hooks/useGit.ts` - Git operations hook
- **Create**: `src/infrastructure/persistence/stores/git-store.ts` - Git state management
- **Modify**: `src/routes/settings.tsx` - Add Git configuration section

## Git Features

### Commit Operations
- **Stage Files**: Select files to stage/unstage
- **Commit Message**: Multi-line commit message editor
- **Amend**: Amend last commit (if not pushed)
- **Sign-off**: Add Signed-off-by line
- **Commit Hooks**: Pre-commit hooks (lint, format)

### Branch Management
- **List Branches**: Show all local/remote branches
- **Create Branch**: Create new branch from current HEAD
- **Switch Branch**: Checkout branch (with uncommitted changes warning)
- **Delete Branch**: Delete local/remote branch
- **Rename Branch**: Rename current branch
- **Merge Branch**: Merge branch into current
- **Rebase**: Rebase current branch onto another

### Diff Visualization
- **File Diff**: Side-by-side or unified diff view
- **Line Numbers**: Click line to add to staging
- **Hunk Staging**: Stage individual hunks
- **Blame View**: Show last commit for each line
- **Image Diff**: Before/after for image files

### Merge Conflicts
- **Conflict Detection**: Auto-detect merge conflicts
- **Conflict UI**: Show both versions (ours/theirs)
- **Resolve Options**: Accept ours, accept theirs, or manual edit
- **Mark Resolved**: Mark file as conflict-resolved
- **Continue Merge**: Complete merge after resolving all conflicts

### Git Status
- **Untracked Files**: Show untracked files
- **Modified Files**: Show modified files with change counts
- **Staged Files**: Show staged files
- **Unstaged Changes**: Show unstaged changes
- **Branch Display**: Current branch + ahead/behind info

## Constraints
- Use isomorphic-git for pure JS Git implementation
- Git credentials stored securely (keychain)
- SSH key support for private repos
- Large file handling (Git LFS future)
- Mobile: Full-screen branch/diff views
- i18n strings via t() function
- 8-bit gaming style (no blur)

## Acceptance Criteria
- [ ] Git client wrapper (isomorphic-git integration)
- [ ] Stage/unstage files
- [ ] Commit dialog with message editor
- [ ] Branch manager (list, create, switch, delete)
- [ ] Diff viewer (side-by-side, unified, line numbers)
- [ ] Merge conflict resolver (ours/theirs/manual)
- [ ] Git status display (modified, staged, untracked)
- [ ] Blame view (show commit per line)
- [ ] Ahead/behind branch info
- [ ] SSH key support
- [ ] Pre-commit hooks (lint, format)
- [ ] Credential storage (keychain)
- [ ] Mobile: Full-screen Git views
- [ ] i18n strings via t() function
- [ ] 8-bit gaming style maintained

## Skills to Invoke
- `frontend-components` - Build Git UI
- `brainstorming` - Design Git integration
- `global-coding-style` - Git operation patterns
- `global-validation` - Commit message validation

## Validation Commands
```bash
# TypeScript check
pnpm typecheck

# Verify Git components
ls -la src/presentation/components/git/

# Verify Git client
ls -la src/lib/git/git-client.ts
```

## Related Issues
- Version control
- Git workflow
- Ralph Loop Cycle 5D: Developer tools

## Next Action
Create Git integration with commit, branch management, diff viewer, and merge conflict resolution.

---
**Handoff ID**: S-035-VELOCITY-20260106
**Status**: PENDING
**Agent Assignment**: development-essentials:code
