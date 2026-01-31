---
story_key: "P1-02-simplify-ide-routes"
epic: "EPIC-P1"
story: 2
status: "drafted"
created_at: "2026-01-08T20:36:00+07:00"
points: 2
priority: "P0"
---

# P1-02: Simplify IDE Route to 2 Patterns

## User Story

**As a** Developer
**I want** to ensure only `/ide` and `/ide/$projectId` route patterns are active
**So that** IDE workspace loads without infinite loops from `useWorkspaceAccess`

## Context

The IDE route uses `useWorkspaceAccess` which has been identified as causing infinite loops. The Notes workspace already bypasses this hook. IDE needs the same treatment.

## Acceptance Criteria

### AC-1: Route Loads Without Errors
**Given** A user navigates to `/ide`
**When** The route renders
**Then** No infinite loop occurs

### AC-2: Child Route Works
**Given** A user navigates to `/ide/$projectId`
**When** The route renders
**Then** The specific project is displayed

### AC-3: useWorkspaceAccess Bypassed
**Given** The `useWorkspaceAccess` hook is problematic
**When** The IDE route is modified
**Then** The hook is bypassed with Phase 1 marker

### AC-4: Nested Routes Commented
**Given** Any nested routes exist
**When** They are reviewed
**Then** They are commented out with Phase 1 markers

## Tasks

- [ ] T1: Review current ide.tsx implementation
- [ ] T2: Add Phase 1 bypass marker for useWorkspaceAccess
- [ ] T3: Check ide.$projectId.tsx for nested routes
- [ ] T4: Comment out any nested routes with markers
- [ ] T5: Verify no infinite loops occur
- [ ] T6: Test IDE loads with temp project

## Dev Notes

### Current State (From Investigation)

**ide.tsx** (104 lines):
- Uses `useWorkspaceAccess('ide')` (line 48)
- Has loading state handling (lines 59-65)
- Has empty state handling (lines 68-75)
- Has project selection UI (lines 78-102)
- Child routes render via `<Outlet />` (lines 54-56)

**Issue**: `useWorkspaceAccess` can cause infinite loops

### Phase 1 Bypass Pattern

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT
// Feature: useWorkspaceAccess Hook
// Reason: Causes infinite loops during route load
// Re-attach in: Phase 2 (after temp project flow stable)
// Gate: No infinite loops, temp project creation works
// Documentation: _bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md
// ═══════════════════════════════════════════════════════════════
```

### Bypass Strategy

Following the Notes workspace pattern:
1. Add Phase 1 marker before `useWorkspaceAccess` import
2. Comment out the hook usage
3. Implement simple temp project creation
4. Keep Outlet for child routes

### Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/routes/ide.tsx` | Add bypass marker | Comment useWorkspaceAccess |
| `src/routes/ide.$projectId.tsx` | Review | Check for nested routes |

### Integration Points

| Component | Touches | Breaks | Tests Required |
|-----------|---------|--------|----------------|
| useWorkspaceAccess | Bypassed | Yes (temporarily) | Manual smoke test |
| workspace-access-helper.tsx | Not used | No | N/A |
| Child routes | Outlet only | No | Route verification |

## References

- Epic: `_bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md#story-p1-02`
- Investigation: `_bmad-output/diagnostics/phase-1-investigation-ide-2026-01-08.md`
- Related Stories:
  - P1-03: Create Temp Project Auto-Flow (depends on P1-02)
  - P1-06: Investigate IDE Full CRUD (depends on P1-02)

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: {model_name}
- Session: {timestamp}

### Task Progress
- [ ] T1: Review current ide.tsx implementation
- [ ] T2: Add Phase 1 bypass marker for useWorkspaceAccess
- [ ] T3: Check ide.$projectId.tsx for nested routes
- [ ] T4: Comment out any nested routes with markers
- [ ] T5: Verify no infinite loops occur
- [ ] T6: Test IDE loads with temp project

### Research Executed
*Documentation of findings*

### Files Modified
| File | Action | Lines |
|------|--------|-------|
| ... | ... | ... |

### Tests Created
- {test_file}: {count} tests

### Decisions Made
- Decision 1: {rationale}

## Code Review

*This section populated during review phase*

**Reviewer:** {model_name}
**Date:** {timestamp}

### Checklist
- [ ] /ide route loads without errors
- [ ] /ide/$projectId route works
- [ ] useWorkspaceAccess bypassed with Phase 1 marker
- [ ] Zero infinite loops
- [ ] Nested routes commented with markers

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-08T20:00:00+07:00 | SM | From Phase 1 Epics |
| drafted | 2026-01-08T20:36:00+07:00 | BMAD Master | Story file created |
