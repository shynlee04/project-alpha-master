# Story: STORAGE-3-1 - Create useWorkspaceProjects Hook

**Epic**: Storage Remediation
**Priority**: P0
**Points**: 5
**Status**: drafted
**Created**: 2026-01-07

## User Story

As a developer,
I want a unified hook to access projects filtered by workspace and storage type,
So that I can easily implement consistent project lists across all workspaces.

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| **AC-1** | Hook accepts `workspaceType` and optional `storageType` | Unit test |
| **AC-2** | Returns filtered list of projects based on workspace binding | Unit test |
| **AC-3** | Filters out FSA projects on mobile devices | Unit test / Manual test |
| **AC-4** | Returns `activeProject` and `setActiveProject` helpers | Unit test |
| **AC-5** | Provides `isLoading` state | Unit test |

## Tasks

- [ ] **T1**: Create `src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts`
- [ ] **T2**: Implement filtering logic (workspace binding)
- [ ] **T3**: Implement mobile detection (using `useResponsive`)
- [ ] **T4**: Implement storage type filtering
- [ ] **T5**: Add `setActiveProject` wrapper that handles navigation/context update
- [ ] **T6**: Write unit tests

## Implementation Details

### File Location
`src/infrastructure/persistence/stores/project/useWorkspaceProjects.ts`

### Interface
```typescript
interface UseWorkspaceProjectsOptions {
  workspaceType: 'knowledge' | 'notes' | 'study' | 'ide';
  storageType?: 'indexeddb' | 'fsa';
}

interface UseWorkspaceProjectsResult {
  projects: Project[];
  activeProject: Project | undefined;
  setActiveProject: (projectId: string) => Promise<void>;
  isLoading: boolean;
}
```

## Dev Notes

- Use `useProjectStore` for raw data
- Use `useResponsive` for mobile check
- Memoize results to prevent re-renders

## References

- Plan: `_bmad-output/governance/storage-remediation-plan-2026-01-07.md`
