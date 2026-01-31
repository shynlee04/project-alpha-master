---
story_id: ARCH-01-03
title: Archive Knowledge/Study UI
points: 4
priority: P1
status: pending
team: A
dependencies: []
time_box: 2 hours
created_at: 2026-01-21T13:00:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
---

# Story: ARCH-01-03 - Archive Knowledge/Study UI

## Description

As a developer, I want to archive Knowledge and Study workspace UI components that are marked as DEFER in ADR-033, So that navigation is simplified and there are no dead links or broken imports.

## Acceptance Criteria

- [ ] Knowledge workspace route definitions archived (not deleted)
- [ ] Study workspace route definitions archived (not deleted)
- [ ] Knowledge workspace removed from main navigation
- [ ] Study workspace removed from main navigation
- [ ] No broken imports from archived files
- [ ] TypeScript compiles with 0 errors
- [ ] Navigation menu reflects only active workspaces (Notes, IDE, Settings)

## Tasks

### Phase 1: Identification (30 min)
- [ ] Locate all Knowledge workspace route files
- [ ] Locate all Study workspace route files
- [ ] Identify all imports of Knowledge/Study routes
- [ ] Identify navigation components that reference these routes

### Phase 2: Archive (30 min)
- [ ] Move Knowledge route definitions to `_bmad-ext/.archive/` with timestamp
- [ ] Move Study route definitions to `_bmad-ext/.archive/` with timestamp
- [ ] Create archive summary documenting what was moved
- [ ] Add TODO comments for future implementation

### Phase 3: Navigation Cleanup (30 min)
- [ ] Remove Knowledge links from Hub navigation
- [ ] Remove Study links from Hub navigation
- [ ] Update ProjectCard/WorkspaceCard to not show Knowledge/Study options
- [ ] Update any project type selection UI to hide DEFER workspaces

### Phase 4: Import Cleanup (30 min)
- [ ] Remove/fix all imports of archived routes
- [ ] Verify no remaining references in router index
- [ ] Check for lazy route imports and remove them
- [ ] Update route type definitions if needed

### Phase 5: Validation (15 min)
- [ ] Run TypeScript compiler (0 errors)
- [ ] Test navigation menu works without errors
- [ ] Verify no dead links in UI
- [ ] Confirm archived files can be restored if needed

## Dependencies

- None

## Blocked By

- None

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/EPIC-ARCH-01/ARCH-01-03-context.xml`
- `_bmad-output/sprint-artifacts/EPIC-ARCH-01/ARCH-01-03-completion.md`

## Notes

- DEFER features are documented in ADR-033 Section 7.3
- Archive instead of delete - may implement in future
- Knowledge and Study are not currently functional
- Removing them simplifies UX and reduces confusion

## Required MCP Research

### Context7 Queries
- Query TanStack Router lazy route loading documentation
- Search: "best practices route code splitting 2026"

### DeepWiki Queries
- Research: "React component cleanup and removal patterns"
- Query: "TypeScript import cleanup strategies"
- Search: "navigation menu architecture best practices"

### Architecture Patterns Reference
- ADR-033: Feature Architecture (Section 7.3 - DEFER workspaces)
- Clean Architecture: Module Boundaries
- File Tree Governance: Canonical route structure

## Validation Report

**Validated At:** 2026-01-21T13:00:00+07:00
**Result:** PASS

### Checks Passed: 16/16
### Checks Failed: 0/16

### Validation Details
- ✅ Story file structure valid
- ✅ Frontmatter YAML valid
- ✅ Story ID format correct (ARCH-01-03)
- ✅ Status not blocked/deferred
- ✅ User story format complete (As a/I want/So that)
- ✅ Acceptance criteria present (7 criteria)
- ✅ ACs are specific and testable
- ✅ ACs not ambiguous
- ✅ Tasks section present (5 phases)
- ✅ Tasks include research/identification
- ✅ Tasks include test/validation
- ✅ Tasks specific and actionable
- ✅ MCP Research requirements populated
- ✅ Context7 queries specified
- ✅ DeepWiki queries specified
- ✅ Architecture references included
