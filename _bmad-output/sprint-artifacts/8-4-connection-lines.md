---
epic: 8
story: 4
title: Connection Lines
status: drafted
created: 2025-12-30T10:40:00+07:00
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
dependencies:
  - "8-2-source-node-creation"
  - "8-3-concept-node-creation"
blockers: []
---

# Story 8.4: Connection Lines

## User Story

**As a** user building a knowledge map,
**I want** to draw connections between nodes with labels,
**So that** I can show how concepts and sources relate to each other.

## Acceptance Criteria

### AC-1: Create Connection

**Given** two nodes exist on canvas
**When** user drags from a source handle to a target handle
**Then** a connection (edge) is created
**And** edge displays with animated flow style
**And** edge is visible above nodes

### AC-2: Connection Label

**Given** a connection is created
**When** user selects the edge
**Then** they can add a label via context menu
**And** label appears centered on edge
**And** label is editable

### AC-3: Connection Deletion

**Given** an edge is selected
**When** user presses Delete/Backspace
**Then** edge is removed
**And** source/target nodes remain

### AC-4: Animated Edges

**Given** connections exist on canvas
**When** canvas is rendered
**Then** edges have animated line drawing effect
**And** animation loops continuously
**And** animation uses 8-bit color palette

### AC-5: Edge Types

**Given** different relationship types
**When** user creates connections
**Then** default edge is "related to" (solid line)
**And** optional: "depends on" (dashed), "contradicts" (red)

## Tasks

- [ ] Configure React Flow default edge options
- [ ] Create custom edge label component
- [ ] Implement edge selection and deletion
- [ ] Add animated edge styles per 8-bit design
- [ ] Create context menu for edge operations
- [ ] Write unit tests for edge operations
- [ ] Write integration tests for connections

## Dev Notes

### Edge Configuration

```typescript
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: 'var(--color-primary)',
    strokeWidth: 2,
  },
  labelStyle: {
    fill: 'var(--color-text-primary)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
  },
};
```

### Edge Types

```typescript
type EdgeType = 'related' | 'depends-on' | 'contradicts' | 'supports';

interface RelationshipEdgeData {
  type: EdgeType;
  label?: string;
  description?: string;
}
```

## Research Requirements

### Dependency Research: React Flow Edges

**Source: Context7 Documentation** (`/websites/reactflow_dev`)

**Key Patterns:**
1. `addEdge` utility for creating connections
2. Default edge options (animated, style)
3. Custom edge types via `edgeTypes` prop
4. Selection and deletion handlers

### Codebase Patterns to Follow

- 8-bit design system colors and animations
- Edge animation patterns from animations.css
- Keyboard shortcut handling

## References

- **PRD**: Section 8.4 (Connections)
- **UX Design**: Section 19.4 (Connection Labels)

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
| 2025-12-30T10:40:00+07:00 | drafted | Story created |
