# Story: ARCH-01.1.2 - Cross-Workspace File References Split

---
story_id: ARCH-01.1.2
epic: ARCH-01
title: Split cross-workspace-file-references.ts into focused modules
status: drafted
created_date: 2026-01-05
created_by: bmad-core-bmad-master
assigned_to: bmad-bmm-dev
estimated_hours: 6
priority: P0
parent_story: ARCH-01.1
---

## Story Overview

**User Story**: As a developer maintaining the codebase, I want the cross-workspace file references module split into focused modules under 300 lines each, so that the code is maintainable, testable, and follows the project's god file elimination standards.

**Context**: The `cross-workspace-file-references.ts` file (359 lines) was created during the sync infrastructure migration and exceeds the 300-line limit. This file manages cross-workspace file references between IDE, Notes, Study, and Knowledge workspaces.

---

## Acceptance Criteria

### AC-1: File Split into Modules
**Given** the original `cross-workspace-file-references.ts` file at 359 lines
**When** the refactoring is complete
**Then** the file is split into 2 focused modules, each ≤180 lines

### AC-2: Type Definitions Module
**Given** the original file contains type definitions
**When** the refactoring is complete
**Then** a dedicated `cross-workspace-reference-types.ts` module exports all types:
- `ReferenceType`
- `BrokenReferenceReason`
- `CrossWorkspaceFileReference`
- `ResolvedReference`
- `CreateReferenceOptions`

### AC-3: Reference Manager Module
**Given** the original file contains `CrossWorkspaceReferenceManager` class
**When** the refactoring is complete
**Then** a dedicated `cross-workspace-reference-manager.ts` module contains:
- `CrossWorkspaceReferenceManager` class
- `createCrossWorkspaceReferenceManager` factory function
- `getCrossWorkspaceReferenceManager` singleton function
- `setCrossWorkspaceReferenceManagerForTesting` test utility

### AC-4: Barrel Export Created
**Given** the modules are split into separate files
**When** the refactoring is complete
**Then** a barrel export `cross-workspace-file-references/index.ts` re-exports all public APIs

### AC-5: Backward Compatibility Maintained
**Given** existing components import from `cross-workspace-file-references.ts`
**When** the refactoring is complete
**Then** the original file becomes a facade re-exporting from the new barrel, maintaining zero breaking changes

### AC-6: TypeScript Zero Errors
**Given** the refactoring is complete
**When** `pnpm typecheck` is run
**Then** zero TypeScript errors are reported

---

## Tasks

- [ ] **T1**: Create `src/infrastructure/sync/workspace-services/cross-workspace-file-references/` directory
- [ ] **T2**: Create `cross-workspace-reference-types.ts` module (≤100 lines)
  - Export all type definitions
  - Add JSDoc comments for each type
- [ ] **T3**: Create `cross-workspace-reference-manager.ts` module (≤180 lines)
  - Move `CrossWorkspaceReferenceManager` class
  - Move factory and singleton functions
  - Ensure class methods are properly ordered
- [ ] **T4**: Create `index.ts` barrel export (≤30 lines)
  - Re-export all types
  - Re-export manager class and functions
- [ ] **T5**: Convert original `cross-workspace-file-references.ts` to facade (≤20 lines)
  - Re-export everything from barrel
  - Add deprecation notice if needed
- [ ] **T6**: Run `pnpm typecheck` to verify zero errors
- [ ] **T7**: Update any direct imports if needed
- [ ] **T8**: Run validation checks

---

## Dev Notes

### Architecture Pattern

Follow the module split pattern established in Story 1.1 (notes-file-sync-service):

```
src/infrastructure/sync/workspace-services/cross-workspace-file-references/
├── index.ts                          # Barrel export (public API)
├── cross-workspace-reference-types.ts # Type definitions
└── cross-workspace-reference-manager.ts # Manager class + factory functions
```

### Import Path Changes

**Before** (still works via facade):
```typescript
import { CrossWorkspaceReferenceManager } from '@/infrastructure/sync/workspace-services/cross-workspace-file-references';
```

**After** (new pattern):
```typescript
// Import from barrel
import { CrossWorkspaceReferenceManager } from '@/infrastructure/sync/workspace-services/cross-workspace-file-references';

// Or import specific modules
import { CrossWorkspaceReferenceManager } from '@/infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-manager';
import type { CrossWorkspaceFileReference } from '@/infrastructure/sync/workspace-services/cross-workspace-file-references/cross-workspace-reference-types';
```

### File Size Targets

| Module | Target Lines |
|--------|--------------|
| `cross-workspace-reference-types.ts` | ≤100 lines |
| `cross-workspace-reference-manager.ts` | ≤180 lines |
| `index.ts` | ≤30 lines |
| Original facade | ≤20 lines |

### Testing Considerations

- The `setCrossWorkspaceReferenceManagerForTesting` function must remain accessible
- Existing tests using `getCrossWorkspaceReferenceManager()` should continue to work
- No functional changes to `CrossWorkspaceReferenceManager` behavior

---

## Research Requirements

### Required Research Before Implementation

**R1**: Review permission manager integration
- Query: How does `WorkspacePermissionManager.checkCrossWorkspaceFilePermission()` work?
- Source: `src/lib/agent/workspace-permission-manager.ts`

**R2**: Check consumer imports
- Query: What components currently import from `cross-workspace-file-references.ts`?
- Method: `grep -r "cross-workspace-file-references" src/ --include='*.ts*'`

**R3**: Verify FileSyncService interface
- Query: What methods does `FileSyncService` provide that the manager depends on?
- Source: `src/infrastructure/sync/workspace-services/file-sync-service.ts`

---

## References

- Epic: [_bmad-output/epics/epic-arch-01-foundation-architecture.md](../epics/epic-arch-01-foundation-architecture.md)
- Story 1.1 Report: [_bmad-output/sprint-artifacts/story-1-1-notes-split-report-2026-01-04.md](story-1-1-notes-split-report-2026-01-04.md)
- Sprint Status: [_bmad-output/sprint-artifacts/sprint-status.yaml](sprint-status.yaml)
- Governance Rules: [.claude/rules/governance-rules.md](../../.claude/rules/governance-rules.md)

---

## Status History

| Status | Date | Notes |
|--------|------|-------|
| drafted | 2026-01-05 | Initial story creation |

---

## Dev Agent Record

*This section will be populated during development phase*

**Agent**: *{to be filled}*
**Session**: *{to be filled}*

### Task Progress:
*To be filled during implementation*

### Research Executed:
*To be filled during implementation*

### Files Changed:
*To be filled during implementation*

### Tests Created:
*To be filled during implementation*

### Decisions Made:
*To be filled during implementation*

---

## Code Review

*This section will be populated after implementation*

**Reviewer**: *{to be filled}*
**Date**: *{to be filled}*

### Checklist:
*To be filled during code review*

### Issues Found:
*To be filled during code review*

### Sign-off:
*Pending review*
