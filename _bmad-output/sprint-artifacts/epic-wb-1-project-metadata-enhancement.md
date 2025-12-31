# Story WB-1: Project Metadata Enhancement

**Epic:** WB - Workspace Binding & Project Persistence
**Story:** 1 of 8
**Priority:** P0 - Critical
**Estimated Effort:** 4 hours
**Status:** Drafted

---

## User Story

**As a** knowledge worker using multiple workspaces
**I want** my project to remember which workspaces it's bound to and whether file snapshots are enabled
**So that** I can seamlessly switch between IDE, Notes, Knowledge, and Study workspaces without re-configuring each time

---

## Acceptance Criteria

### AC-WB-1-1: Workspace Bindings Field
**Given** a project metadata record
**When** I create or update a project
**Then** it should have a `workspaceBindings` field with:
- `ide: boolean` - Bound to IDE workspace
- `notes: boolean` - Bound to Notes workspace
- `knowledge: boolean` - Bound to Knowledge workspace
- `study: boolean` - Bound to Study workspace

### AC-WB-1-2: File Snapshot Configuration
**Given** a project metadata record
**When** I create or update a project
**Then** it should have a `fileSnapshotEnabled` field (boolean, default: false)

### AC-WB-1-3: Database Schema Migration
**Given** existing projects in IndexedDB
**When** the application loads
**Then** existing projects should be migrated with:
- `workspaceBindings: { ide: true, notes: false, knowledge: false, study: false }` (default: IDE only)
- `fileSnapshotEnabled: false` (default)

### AC-WB-1-4: TypeScript Compilation
**Given** the updated ProjectMetadata interface
**When** I run `pnpm exec tsc --noEmit`
**Then** there should be zero TypeScript errors related to ProjectMetadata

### AC-WB-1-5: IndexedDB Validation
**Given** a project with workspace bindings
**When** I save it to IndexedDB
**Then** it should persist correctly and be retrievable

---

## Tasks

### Research
- [ ] Review current ProjectMetadata interface in `src/lib/workspace/project-store.ts`
- [ ] Review Dexie schema in `src/lib/state/dexie-db.ts`
- [ ] Research Dexie.js database migration patterns
- [ ] Check existing migration code for reference

### Implementation (TDD Cycle)
- [ ] Write failing tests for workspace bindings field
- [ ] Implement workspaceBindings in ProjectMetadata interface
- [ ] Write failing tests for file snapshot field
- [ ] Implement fileSnapshotEnabled in ProjectMetadata interface
- [ ] Write failing tests for database migration
- [ ] Implement Dexie schema version upgrade
- [ ] Implement migration logic for existing projects
- [ ] Run tests and verify 100% pass rate

### Validation
- [ ] Run `pnpm exec tsc --noEmit` (zero errors)
- [ ] Run `pnpm test` (all tests pass)
- [ ] Test migration with existing IndexedDB data
- [ ] Verify backward compatibility

---

## Dev Notes

### Architecture References

From `_bmad-output/project-planning-artifacts/sprint-change-proposal-project-workspace-binding-2026-01-01.md`:

```typescript
// NEW SCHEMA (with workspace bindings)
interface ProjectMetadata {
    id: string;
    name: string;
    folderPath: string;
    fsaHandle: FileSystemDirectoryHandle;
    lastOpened: Date;
    autoSync?: boolean;

    // NEW: Workspace bindings
    workspaceBindings?: {
        ide?: boolean;
        notes?: boolean;
        knowledge?: boolean;
        study?: boolean;
    };

    // NEW: File snapshot configuration
    fileSnapshotEnabled?: boolean;

    // Existing fields
    layoutState?: LayoutConfig;
    exclusionPatterns?: string[];
    lastKnownPermissionState?: FsaPermissionState;
}
```

### Database Migration Strategy

Dexie.js versioning approach:
1. Increment database version in `dexie-db.ts`
2. Add migration callback to upgrade existing projects
3. Set default values for new fields
4. Test migration with existing data

Reference: Dexie.js documentation on database versioning
- https://dexie.org/docs/Version/Version.stores()

### Test Strategy

Use TDD cycle:
1. RED: Write failing tests for new fields
2. GREEN: Implement fields with minimal code
3. REFACTOR: Clean up implementation
4. Validate with `pnpm test` and TypeScript compilation

### Dependencies

- `src/lib/state/dexie-db.ts` - Database schema
- `src/lib/workspace/project-store.ts` - ProjectMetadata interface
- `src/lib/workspace/index.ts` - Module exports

---

## Research Requirements

### MCP Research Protocol

**R1: Dexie.js Database Migration Patterns**
- Query Dexie.js documentation for version.upgrade() syntax
- Search for "dexie migration existing database"
- Reference: https://dexie.org/docs/Version/Version.stores()

**R2: TypeScript Interface Extension**
- Review best practices for extending interfaces
- Ensure backward compatibility
- Optional vs required fields

**R3: IndexedDB Transaction Safety**
- Ensure migration runs in transaction
- Handle migration failures gracefully
- Test with empty and populated databases

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests passing (100%)
- [ ] TypeScript compilation passes (zero errors)
- [ ] Database migration tested with existing data
- [ ] Code review approved
- [ ] Updated sprint-status.yaml

---

## References

- Sprint Change Proposal: `_bmad-output/project-planning-artifacts/sprint-change-proposal-project-workspace-binding-2026-01-01.md`
- Epic WB Definition: `_bmad-output/epics/epic-wb-workspace-binding-project-persistence.md`
- Story Dev Cycle: `.windsurf/workflows/story-dev-cycle.md`
- TDD Cycle: `.agent/rules/commands/tdd-cycle.md`

---

## Story Status History

| Status | Date | Notes |
|--------|------|-------|
| Drafted | 2026-01-01T02:15:00+07:00 | Initial story creation |
| | | |
| | | |

---

## Dev Agent Record

*To be filled during development*

**Agent:** [Model Name]
**Session:** [Timestamp]

### Task Progress:
- [ ] Task 1: [Status] - [Notes]
- [ ] Task 2: [Status] - [Notes]

### Research Executed:
- [ ] Dexie.js migration patterns
- [ ] TypeScript interface extension

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

### Tests Created:
- [ ] test-name.test.ts: X tests

### Decisions Made:
- [ ] Decision 1: [Rationale]

---

## Code Review

*To be filled after implementation*

**Reviewer:** [Model Name]
**Date:** [Timestamp]

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found:
- [ ] Issue 1: [Description] → [Resolution]

### Sign-off:
✅ APPROVED for merge

---

**Document ID:** epic-wb-story-1
**Created:** 2026-01-01T02:15:00+07:00
**Last Updated:** 2026-01-01T02:15:00+07:00
