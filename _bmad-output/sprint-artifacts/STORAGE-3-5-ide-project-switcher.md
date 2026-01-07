# Story: STORAGE-3-5 - Add Project Switcher to IDELayout

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 3
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user in the IDE workspace,
I want to switch between my coding projects,
So that I can multitask between different codebases.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | Project dropdown visible in IDE header | Manual visual check |
| **AC-2** | Shows only projects with 'ide' binding | Manual check |
| **AC-3** | Shows only FSA projects (IndexedDB filtered out) | Manual check |
| **AC-4** | Switching project reloads the WebContainer/IDE context | Manual check |

## Tasks

- [ ] **T1**: Import `useWorkspaceProjects` in `IDELayout.tsx`
- [ ] **T2**: Configure hook with `storageType: 'fsa'`
- [ ] **T3**: Integrate selector into header
- [ ] **T4**: Verify switching logic

## References

- Story STORAGE-3-1 (Hook)
