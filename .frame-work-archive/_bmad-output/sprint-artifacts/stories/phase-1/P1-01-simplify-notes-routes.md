---
story_key: "P1-01-simplify-notes-routes"
epic: "EPIC-P1"
story: 1
status: "drafted"
created_at: "2026-01-08T20:35:00+07:00"
points: 2
priority: "P0"
---

# P1-01: Simplify Notes Route to 2 Patterns

## User Story

**As a** Developer
**I want** to ensure only `/notes` and `/notes/$projectId` route patterns are active
**So that** Notes workspace loads without "Maximum update depth exceeded" errors

## Context

The Notes route currently bypasses `useWorkspaceAccess` (which was causing infinite loops). However, we need to:
1. Ensure only 2 route patterns are active
2. Comment out/detach any nested routes with Phase 1 markers
3. Verify projectId handling (`'default-notes'` hardcoded - needs documentation or fix)

## Acceptance Criteria

### AC-1: Route Loads Without Errors
**Given** A user navigates to `/notes`
**When** The route renders
**Then** No "Maximum update depth exceeded" error occurs

### AC-2: Child Route Works
**Given** A user navigates to `/notes/$projectId`
**When** The route renders
**Then** The specific project's notes are displayed

### AC-3: Nested Routes Detached
**Given** Nested routes exist (e.g., `/notes/$projectId/$noteId`)
**When** They are checked
**Then** They are commented out with Phase 1 detachment markers

### AC-4: Detachment Markers Follow Standard
**Given** Detached code exists
**When** The markers are reviewed
**Then** They follow the Phase 1 detachment pattern from the epic

## Tasks

- [ ] T1: Review current notes.lazy.tsx implementation
- [ ] T2: Check for nested routes in notes.$projectId.lazy.tsx
- [ ] T3: Add Phase 1 detachment markers to any nested routes
- [ ] T4: Verify no infinite loops occur
- [ ] T5: Document projectId handling (default-notes pattern)

## Dev Notes

### Current State (From Investigation)

**notes.lazy.tsx** (272 lines):
- Already bypasses `useWorkspaceAccess` ✅
- Uses direct `useNoteStore` access ✅
- Has hardcoded `projectId = 'default-notes'` (line 77)
- No nested routes detected

**notes.$projectId.lazy.tsx**:
- Need to verify this file exists and check its implementation

### Phase 1 Detachment Marker Pattern

```typescript
// ═══════════════════════════════════════════════════════════════
// ⚠️ PHASE 1 DETACHMENT
// Feature: Nested Note Routes
// Reason: Simplifying to 2 patterns only for Phase 1
// Re-attach in: Phase 3 (after basic CRUD works)
// Gate: Notes CRUD fully functional
// Documentation: _bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md
// ═══════════════════════════════════════════════════════════════
```

### Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/routes/notes.lazy.tsx` | Review | Already bypasses useWorkspaceAccess |
| `src/routes/notes.$projectId.lazy.tsx` | Review/Modify | Check for nested routes |
| Any nested route files | Detach | Comment out with markers |

### Integration Points

| Component | Touches | Breaks | Tests Required |
|-----------|---------|--------|----------------|
| useWorkspaceAccess | Bypassed | No | Manual smoke test |
| Notes store | Direct access | No | Manual smoke test |
| Route tree | Nested routes | Yes | Route verification |

## References

- Epic: `_bmad-output/project-planning-artifacts/phase-1-epics-2026-01-08.md#story-p1-01`
- Investigation: `_bmad-output/diagnostics/phase-1-investigation-ide-2026-01-08.md`
- Related Stories:
  - P1-07: Investigate Notes Full CRUD (depends on P1-01)

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: {model_name}
- Session: {timestamp}

### Task Progress
- [ ] T1: Review current notes.lazy.tsx implementation
- [ ] T2: Check for nested routes in notes.$projectId.lazy.tsx
- [ ] T3: Add Phase 1 detachment markers to any nested routes
- [ ] T4: Verify no infinite loops occur
- [ ] T5: Document projectId handling (default-notes pattern)

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
- [ ] /notes route loads without errors
- [ ] /notes/$projectId route works
- [ ] Nested routes detached with markers
- [ ] Zero infinite loops
- [ ] All detachment markers follow standard

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-08T20:00:00+07:00 | SM | From Phase 1 Epics |
| drafted | 2026-01-08T20:35:00+07:00 | BMAD Master | Story file created |
