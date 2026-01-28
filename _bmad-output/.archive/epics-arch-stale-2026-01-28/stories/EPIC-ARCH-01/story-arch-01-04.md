---
story_id: ARCH-01-04
title: Simplify Project Wizard (23→10 options)
points: 5
priority: P1
status: pending
team: B
dependencies:
  - ARCH-01-02
time_box: 3 hours
created_at: 2026-01-21T13:00:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
---

# Story: ARCH-01-04 - Simplify Project Wizard (23→10 options)

## Description

As a user, I want a streamlined Project Wizard with only 10 essential configuration options instead of 23, So that project creation is faster and less overwhelming while advanced options remain accessible through settings.

## Acceptance Criteria

- [ ] Project Wizard reduced from 23 options to 10 essential options
- [ ] Essential options retained (project name, type, location, storage, etc.)
- [ ] Advanced options moved to Settings panel or accessible later
- [ ] UI remains fully functional after simplification
- [ ] No regression in project creation workflow
- [ ] TypeScript compiles with 0 errors
- [ ] User experience improved (simpler, faster)

## Tasks

### Phase 1: Audit Current Wizard (30 min)
- [ ] Locate all Project Wizard component files
- [ ] Document all 23 current configuration options
- [ ] Categorize options into:
  - [ ] Essential (must have for project creation)
  - [ ] Advanced (can be set later)
  - [ ] Redundant (duplicates other options)
  - [ ] Obsolete (no longer needed)

### Phase 2: Redesign Wizard (30 min)
- [ ] Design new simplified flow with 10 essential options
- [ ] Map advanced options to Settings panel
- [ ] Create wireframe/mockup of new UI
- [ ] Define which options trigger which behaviors

### Phase 3: Implementation (1.5 hours)
- [ ] Remove redundant/obsolete options from wizard
- [ ] Move advanced options to Settings (create if needed)
- [ ] Update wizard state management
- [ ] Update form validation for new options
- [ ] Add navigation to Settings for advanced options

### Phase 4: Cleanup & Validation (30 min)
- [ ] Remove unused wizard sub-components
- [ ] Clean up wizard-related types and interfaces
- [ ] Run TypeScript compiler (0 errors)
- [ ] Test project creation with new wizard
- [ ] Verify advanced options accessible in Settings

## Dependencies

- ARCH-01-02 (Consolidate Project Creation Paths) - must be complete first

## Blocked By

- ARCH-01-02

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-04-context.xml`
- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-04-completion.md`

## Notes

- Goal is simplification, not feature removal
- Advanced options should be discoverable in Settings
- Consider grouping options into logical sections
- Keep 8-bit design principles (no rounded corners, pixel shadows)
- Mobile-first responsive design required

## Required MCP Research

### Context7 Queries
- Query TanStack Router form handling documentation
- Search: "wizard form simplification best practices 2026"
- Research: "progressive disclosure UI patterns"

### DeepWiki Queries
- Research: "React form state management patterns"
- Query: "Zustand wizard state best practices"
- Search: "accessibility in multi-step forms"

### Architecture Patterns Reference
- ADR-034: Project Creation Simplification
- Clean Architecture: UI State Management
- File Tree Governance: Project configuration structure

## Validation Report

**Validated At:** 2026-01-21T13:00:00+07:00
**Result:** PENDING

### Checks Passed: 0/16
### Checks Failed: 0/16

### Validation Details
- ⏳ Story file structure valid
- ⏳ Frontmatter YAML valid
- ⏳ Story ID format correct (ARCH-01-04)
- ⏳ Status acknowledges dependency
- ⏳ User story format complete (As a/I want/So that)
- ⏳ Acceptance criteria present (7 criteria)
- ⏳ ACs are specific and testable
- ⏳ ACs not ambiguous
- ⏳ Tasks section present (4 phases)
- ⏳ Tasks include research/audit
- ⏳ Tasks include test/validation
- ⏳ Tasks specific and actionable
- ⏳ MCP Research requirements populated
- ⏳ Context7 queries specified
- ⏳ DeepWiki queries specified
- ⏳ Architecture references included
