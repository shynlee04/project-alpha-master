---
epic: 8
story: 5
title: Canvas Persistence
status: drafted
created: 2025-12-30T10:45:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 8
priority: P1
estimated_effort: 3-5 hours
nfr_validated:
  - NFR-PERF-P2-05
tech_stack:
  - "@xyflow/react"
  - Zustand
  - Dexie
dependencies:
  - "8-1-react-flow-canvas-setup"
blockers: []
---

# Story 8.5: Canvas Persistence

## User Story

**As a** user who has organized my knowledge map,
**I want** my canvas state to persist between sessions,
**So that** I can return to my work without losing progress.

## Acceptance Criteria

### AC-1: Auto-Save on Change

**Given** user makes changes to canvas
**When** nodes, edges, or viewport change
**Then** state is saved to IndexedDB
**And** save happens within 500ms of change
**And** no duplicate saves occur (debounced)

### AC-2: Restore on Load

**Given** canvas state was previously saved
**When** user opens Knowledge Canvas
**Then** previous nodes, edges, and viewport are restored
**And** restoration happens before render
**And** no flicker or jump during restoration

### AC-3: Multiple Canvases

**Given** user has multiple knowledge maps
**When** they manage canvases
**Then** each canvas has unique ID and name
**And** user can switch between canvases
**And** each canvas has independent state

### AC-4: Export/Import

**Given** user wants to share or backup
**When** they export canvas
**Then** canvas state is downloaded as JSON
**And** import accepts JSON and restores state
**And** validation prevents corrupted data

### AC-5: Conflict Resolution

**Given** multiple browser tabs open
**When** tabs make concurrent changes
**Then** last write wins
**And** no data corruption occurs

## Tasks

- [ ] Extend Dexie schema for canvas storage
- [ ] Implement auto-save middleware for Zustand
- [ ] Create canvas load/restore logic
- [ ] Implement multi-canvas management
- [ ] Add export/import functionality
- [ ] Handle concurrent access edge cases
- [ ] Write unit tests for persistence
- [ ] Write integration tests for save/restore

## Dev Notes

### Dexie Schema

```typescript
// In project-store.ts or new canvas-store.ts
const db = new Dexie('ProjectAlphaDB');
db.version(9).stores({
  canvases: '++id, name, updatedAt, createdAt',
  canvasStates: '[canvasId+userId], nodes, edges, viewport',
});
```

### Persistence Middleware

```typescript
function createPersistedCanvasStore() {
  return createStore<CanvasState>()(
    persist(
      (set, get) => ({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        // ... actions
      }),
      {
        name: 'canvas-storage',
        storage: createDexieStorage(),
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
          viewport: state.viewport,
        }),
      }
    )
  );
}
```

### Export Format

```typescript
interface CanvasExport {
  version: 1;
  exportedAt: string;
  canvas: {
    name: string;
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
}
```

## Research Requirements

### Dependency Research: Zustand Persistence

**Source: Context7 Documentation**

**Key Patterns:**
1. `persist` middleware for state persistence
2. Custom storage adapters (IndexedDB via Dexie)
3. `partialize` for selective persistence
4. Migration strategies for schema changes

### Codebase Patterns to Follow

- Zustand + Dexie middleware from Epic 2 (`conversation-store.ts`)
- IndexedDB schema management from `project-store.ts`
- Debounce utilities from existing codebase

## References

- **PRD**: Section 8.5 (State Persistence)
- **Architecture**: Section 4.2 (State Persistence)
- **Epic 2**: Zustand + Dexie patterns

## Dev Agent Record

### Task Progress:
- TBD

### Research Executed:
- TBD

### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| | | |

### Tests Created:
- TBD

### Decisions Made:
- TBD

## Code Review

**Reviewer:** TBD
**Date:** TBD

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] i18n keys added (EN + VI)

### Issues Found:
- TBD

### Sign-off:
⌛ PENDING

## History

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-30T10:45:00+07:00 | drafted | Story created |
