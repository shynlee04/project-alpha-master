# Story: STORAGE-3-3 - Add Project Switcher to StudyPage

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 3
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user in the Study workspace,
I want to switch between my projects without leaving the workspace,
So that I can access study materials from different projects.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | Project dropdown visible in Study header | Manual visual check |
| **AC-2** | Shows only projects with 'study' binding | Manual check |
| **AC-3** | Switching project updates the flashcards/quizzes | Manual check |

## Tasks

- [ ] **T1**: Import `useWorkspaceProjects` in `StudyPage.tsx`
- [ ] **T2**: Integrate selector into header
- [ ] **T3**: Verify switching logic

## References

- Story STORAGE-3-1 (Hook)
