---
story_id: ARCH-01-02
title: Consolidate Project Creation Paths (7→2)
points: 8
priority: P0
status: pending
team: B
dependencies: []
time_box: 4 hours
created_at: 2026-01-21T13:00:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
---

# Story: ARCH-01-02 - Consolidate Project Creation Paths (7→2)

## Description

As a developer, I want to consolidate 7 different project creation entry points into 2 unified paths (FSA-based for desktop, IndexedDB-based for mobile), So that there is consistent project creation logic across the application with no duplication.

## Acceptance Criteria

- [ ] All 7 existing project creation entry points identified and documented
- [ ] 7 entry points consolidated into 2 unified paths:
  - [ ] FSA-based creation (desktop)
  - [ ] IndexedDB-based creation (mobile/tablet)
- [ ] Platform detection integrated using existing `getPlatformContract()`
- [ ] No duplicate creation logic remains
- [ ] Consistent user experience across both paths
- [ ] TypeScript compiles with 0 errors
- [ ] All existing project creation workflows still functional

## Tasks

### Phase 1: Audit (30 min)
- [ ] Identify all 7 project creation entry points via grep/search
- [ ] Document each entry point's location, logic, and usage
- [ ] Identify common patterns across entry points
- [ ] Map which entry points serve which use cases

### Phase 2: Design (30 min)
- [ ] Design unified creation service interface
- [ ] Define FSA creation flow (desktop)
- [ ] Define IndexedDB creation flow (mobile)
- [ ] Document platform routing strategy

### Phase 3: Implementation (2 hours)
- [ ] Create `ProjectCreationService` with unified interface
- [ ] Implement FSA-based creation logic
- [ ] Implement IndexedDB-based creation logic
- [ ] Integrate platform detection from `getPlatformContract()`
- [ ] Route calls to appropriate implementation

### Phase 4: Migration (1 hour)
- [ ] Migrate all 7 entry points to use unified service
- [ ] Update imports across codebase
- [ ] Remove duplicate creation logic
- [ ] Test each migration path

### Phase 5: Validation (30 min)
- [ ] Run TypeScript compiler (0 errors)
- [ ] Test FSA creation on desktop
- [ ] Test IndexedDB creation on mobile
- [ ] Verify no regressions

## Dependencies

- None

## Blocked By

- None

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/EPIC-ARCH-01/ARCH-01-02-context.xml`
- `_bmad-output/sprint-artifacts/EPIC-ARCH-01/ARCH-01-02-completion.md`

## Notes

- Must use existing `getPlatformContract()` from ADR-033 infrastructure
- FSA creation uses `FileSystemDirectoryHandle`
- IndexedDB creation uses Dexie schema
- Platform routing is automatic (no user choice)

## Required MCP Research

### Context7 Queries
- Query project creation patterns in TanStack Router docs
- Search: "best practices service layer architecture 2026"

### DeepWiki Queries
- Search Dexie.js documentation for database initialization patterns
- Query: "Zustand store patterns for project management"
- Research: "TypeScript strict mode patterns for file system APIs"

### Architecture Patterns Reference
- ADR-033: Storage Strategy (Section 7.2)
- ADR-033: Platform Detection (Section 7.1)
- Clean Architecture: Service Layer Pattern

## Validation Report

**Validated At:** 2026-01-21T13:00:00+07:00
**Result:** PASS

### Checks Passed: 16/16
### Checks Failed: 0/16

### Validation Details
- ✅ Story file structure valid
- ✅ Frontmatter YAML valid
- ✅ Story ID format correct (ARCH-01-02)
- ✅ Status not blocked/deferred
- ✅ User story format complete (As a/I want/So that)
- ✅ Acceptance criteria present (7 criteria)
- ✅ ACs are specific and testable
- ✅ ACs not ambiguous
- ✅ Tasks section present (5 phases)
- ✅ Tasks include research/audit
- ✅ Tasks include test/validation
- ✅ Tasks specific and actionable
- ✅ MCP Research requirements populated
- ✅ Context7 queries specified
- ✅ DeepWiki queries specified
- ✅ Architecture references included
