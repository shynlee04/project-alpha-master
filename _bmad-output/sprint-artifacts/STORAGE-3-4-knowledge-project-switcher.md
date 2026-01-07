# Story: STORAGE-3-4 - Add Project Switcher to KnowledgePage

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 5
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a user in the Knowledge workspace,
I want to switch between my projects and have proper storage support,
So that I can manage my knowledge base effectively.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | Project dropdown visible in Knowledge header | Manual visual check |
| **AC-2** | Shows only projects with 'knowledge' binding | Manual check |
| **AC-3** | Storage type is correctly identified and handled | Code review |
| **AC-4** | File sync service is initialized if storage type allows | Code review |

## Tasks

- [ ] **T1**: Import `useWorkspaceProjects` in `KnowledgePage.tsx`
- [ ] **T2**: Integrate selector into header
- [ ] **T3**: Implement `useFileSyncService` integration (fixing SYNC-001)
- [ ] **T4**: Verify switching logic

## References

- Story STORAGE-3-1 (Hook)
- Issue SYNC-001
