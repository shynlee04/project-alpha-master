# Story 38-06: Create domain/entities/Workspace.ts

**Status**: PENDING
**Story Points**: 2
**Assignee**: Team B
**Epic**: EPIC-38 (Domain Layer Implementation)

## Description
Implement the Workspace domain entities following the Clean Architecture pattern established in `Project.ts`. This involves creating pure TypeScript interfaces for workspace configuration and state, ensuring they are decoupled from infrastructure concerns (like React state or Zustand stores).

## Acceptance Criteria
- [ ] Create `src/core/entities/Workspace.ts`
- [ ] Define `WorkspaceType` union type ('ide' | 'knowledge' | 'study' | 'notes')
- [ ] Define `WorkspaceConfig` interface (type, isEnabled, settings)
- [ ] Define `WorkspaceState` interface (activeFile, openFiles, panels, metadata)
- [ ] Pure TypeScript with NO framework imports (no React, Zustand, Dexie)
- [ ] 100% testable without mocking (no async operations, no browser APIs)
- [ ] Follow `Project.ts` pattern
- [ ] Include `CreateParams` and `UpdateParams` types
- [ ] Document business rules in JSDoc comments
- [ ] Zero TypeScript errors in production code

## Technical Notes
- Use `src/core/entities/Project.ts` as the reference implementation.
- `WorkspaceConfig` settings should be flexible (Record<string, unknown>).
- `WorkspaceState` should capture the persistent state of a workspace.

## Tasks
1. Create `src/core/entities/Workspace.ts`
2. Create `src/core/entities/__tests__/Workspace.test.ts`
3. Implement interfaces and types
4. Write unit tests
5. Verify coverage and types
