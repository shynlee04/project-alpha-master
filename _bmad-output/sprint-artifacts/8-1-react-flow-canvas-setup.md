---
epic: 8
story: 1
title: React Flow Canvas Setup
status: drafted
created: 2025-12-30T10:00:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 8
priority: P0
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-05
tech_stack:
  - "@xyflow/react" (React Flow v12+)
  - Zustand
  - Dexie
  - TypeScript
dependencies: []
blockers: []
validation_criteria:
  - "Story file exists at correct path"
  - "User story format complete (As a/I want/So that)"
  - "At least 3 acceptance criteria defined"
  - "Each AC has Given/When/Then format"
  - "Tasks section with checkboxes"
  - "Research Requirements section populated"
  - "Dev Notes references architecture.md"
  - "Status set to drafted"
---

# Story 8.1: React Flow Canvas Setup

## User Story

**As a** user opening the canvas,
**I want** a visual workspace with nodes and connections,
**So that** I can organize knowledge visually.

## Acceptance Criteria

### AC-1: Canvas Initialization

**Given** a user opens the Knowledge Canvas
**When** the canvas loads
**Then** React Flow renders with pan/zoom controls
**And** empty state shows: "Drop sources here to start"

### AC-2: Smooth Interactions

**Given** a user interacts with canvas
**When** they drag, pan, or zoom
**Then** interactions are smooth (60fps)
**And** canvas state is saved to IndexedDB on change

### AC-3: Mobile Read-Only Mode

**Given** user is on mobile
**When** canvas opens
**Then** canvas is read-only (view only)
**And** tooltip explains: "Edit on desktop"

### AC-4: Responsive Layout

**Given** the canvas component
**When** rendered in different panel sizes
**Then** it fills available container space
**And** maintains aspect ratio for nodes

### AC-5: Keyboard Navigation

**Given** a user is on desktop
**When** they use keyboard shortcuts
**Then** pan with arrow keys
**And** zoom with +/- keys
**And** fit view with Home key

## Tasks

- [ ] Research: React Flow official documentation patterns
- [ ] Research: Existing codebase canvas-related components
- [ ] Create: Canvas store (Zustand + Dexie persistence)
- [ ] Create: Canvas component wrapper
- [ ] Create: React Flow integration with nodes/edges
- [ ] Create: Empty state component with i18n
- [ ] Create: Mobile detection hook for read-only mode
- [ ] Create: Keyboard shortcuts handler
- [ ] Write: Unit tests for canvas store
- [ ] Write: Unit tests for canvas interactions
- [ ] Verify: TypeScript compilation passes
- [ ] Verify: All tests pass

## Dev Notes

### Architecture

The Knowledge Canvas follows the Two-Engine architecture:
- **Desktop**: Full editing capabilities (create, move, connect nodes)
- **Mobile**: Read-only view with "Edit on desktop" tooltip

### React Flow Integration

React Flow will be lazy-loaded to optimize bundle size:
```typescript
// Dynamic import pattern
const ReactFlow = lazy(() => import('reactflow'));
```

### Canvas State Structure

```typescript
interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  isReadOnly: boolean;
}
```

### Persistence Strategy

- Canvas state persisted to IndexedDB via Dexie
- Auto-save on node/edge changes (debounced 500ms)
- Last opened canvas restored on page load

### Dependencies

- `reactflow` - Node-based UI library
- `zustand` - State management
- `dexie` - IndexedDB wrapper

## Research Requirements

### Dependency Research: React Flow (@xyflow/react)

**Source: Context7 Documentation** (`/websites/reactflow_dev`)

**Key Patterns for Implementation:**
1. **Provider Setup**: `ReactFlowProvider` wrapper required for hooks access
2. **State Management**: `useNodesState`, `useEdgesState` for local state; `useStoreApi` for advanced access
3. **TypeScript Integration**: Custom node/edge types via generics:
   ```typescript
   const store = useStoreApi<CustomNodeType, CustomEdgeType>();
   ```
4. **Selection Tracking**: `useOnSelectionChange` hook for selection events
5. **Performance**: Components using `useNodes()` re-render on any node change

**Critical Implementation Notes:**
- Must use `@xyflow/react` package (React Flow v12+ rebranding)
- CSS imports: `@xyflow/react/dist/style.css`
- Lazy loading supported via `React.lazy()`

### Codebase Patterns to Follow

- Zustand + Dexie middleware pattern from Epic 2
- Mobile detection via `useResponsive` hook (Epic 1)
- 8-bit design system from CLAUDE.md
- i18n pattern with EN + VI translations

## References

- **PRD**: Section 8.1 (Visual Knowledge)
- **UX Design**: Section 19 (Canvas-Based Knowledge Organization)
- **Architecture**: Section 4.2 (Canvas State)
- **NFR**: NFR-PERF-P2-05 (Canvas interaction 60fps)

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
| 2025-12-30T10:00:00+07:00 | drafted | Story created |
