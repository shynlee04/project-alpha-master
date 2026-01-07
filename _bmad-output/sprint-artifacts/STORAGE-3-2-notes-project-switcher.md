# Story: STORAGE-3-2 - Add Project Switcher to NotesPage

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 3
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user in the Notes workspace,
I want to switch between my projects without leaving the workspace,
So that I can manage notes across different projects efficiently.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | Project dropdown visible in Notes header | Manual visual check |
| **AC-2** | Shows only projects with 'notes' binding | Manual check |
| **AC-3** | Switching project updates the active note list | Manual check |
| **AC-4** | Mobile users see appropriate projects (no FSA if not supported) | Mobile emulation check |

## Tasks

- [ ] **T1**: Import `useWorkspaceProjects` in `NotesPage.tsx`
- [ ] **T2**: Create/Import `ProjectSelector` component (or implement inline for now if 4-2 not done)
- [ ] **T3**: Integrate selector into header
- [ ] **T4**: Verify switching logic

## References

- Story STORAGE-3-1 (Hook)
- Story STORAGE-4-2 (Selector Component - dependency)
