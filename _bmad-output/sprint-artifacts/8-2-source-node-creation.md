---
epic: 8
story: 2
title: Source Node Creation
status: drafted
created: 2025-12-30T10:30:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 8
priority: P0
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-05
tech_stack:
  - "@xyflow/react"
  - Zustand
  - Dexie
dependencies:
  - "8-1-react-flow-canvas-setup"
blockers: []
validation_criteria:
  - "Story file exists at correct path"
  - "User story format complete (As a/I want/So that)"
  - "At least 3 acceptance criteria defined"
  - "Each AC has Given/When/Then format"
  - "Tasks section with checkboxes"
  - "Research Requirements section populated"
  - "Status set to drafted"
---

# Story 8.2: Source Node Creation

## User Story

**As a** user building a knowledge map,
**I want** to drag sources from the sidebar onto the canvas,
**So that** my sources become visual nodes.

## Acceptance Criteria

### AC-1: Drag Source to Canvas

**Given** a user has imported sources (PDF, MD files)
**When** they drag a source from the sidebar
**And** drop it onto the canvas
**Then** a source node appears at the drop position
**And** node displays: source title, type icon (PDF/MD), and thumbnail

### AC-2: Source Node Selection

**Given** a source node exists on canvas
**When** user clicks the node
**Then** node is selected (highlighted)
**And** source details panel opens showing:
  - Full title
  - Source type and metadata
  - Key concepts (from Epic 6)
  - Link to open source

### AC-3: Source Node Deletion

**Given** a source node is selected
**When** user presses Delete/Backspace key
**Then** node is removed from canvas
**And** all connected edges are also removed
**And** removal is undoable

### AC-4: Multiple Source Nodes

**Given** user has multiple sources
**When** they drag each to canvas
**Then** each source becomes a distinct node
**And** nodes are automatically spaced
**And** nodes can be repositioned freely

### AC-5: Mock Data Integration

**Given** Epic 6 (Source Ingestion) not complete
**When** testing canvas functionality
**Then** use mock JSON data for sources
**And** mock data structure matches real Source interface:
  ```typescript
  interface MockSource {
    id: string;
    title: string;
    type: 'pdf' | 'markdown' | 'url';
    metadata: {
      keyConcepts: string[];
      summary: string;
    };
  }
  ```

## Tasks

- [ ] Define SourceNode type matching mock/real data
- [ ] Create SourceNode React Flow custom node component
- [ ] Implement drag-and-drop from sidebar to canvas
- [ ] Add node selection handler with details panel
- [ ] Implement delete with undo capability
- [ ] Create mock sources data for testing
- [ ] Write unit tests for SourceNode component
- [ ] Write integration tests for drag-drop

## Dev Notes

### Architecture

```
src/
├── components/
│   └── canvas/
│       ├── nodes/
│       │   ├── SourceNode.tsx     # Custom node for sources
│       │   └── SourceNodeHandle.tsx
│       └── panels/
│           └── SourceDetailsPanel.tsx
├── lib/
│   └── canvas/
│       └── source-node-types.ts   # TypeScript interfaces
└── data/
    └── mock-sources.json          # Mock data for testing
```

### SourceNode Component Structure

```typescript
interface SourceNodeProps {
  id: string;
  data: {
    sourceId: string;
    title: string;
    type: 'pdf' | 'markdown' | 'url';
    thumbnail?: string;
    keyConcepts: string[];
  };
  selected: boolean;
}

function SourceNode({ id, data, selected }: SourceNodeProps) {
  return (
    <div className={cn('source-node', { selected })}>
      <NodeHandle type="target" position={Position.Top} />
      <div className="source-icon">{getIconForType(data.type)}</div>
      <div className="source-info">
        <span className="source-title">{data.title}</span>
        <span className="source-concepts">{data.keyConcepts.join(', ')}</span>
      </div>
      <NodeHandle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Drag-Drop Implementation

- HTML5 Drag and Drop API for sidebar items
- React Flow `onDrop` handler for canvas
- Coordinate transformation from screen to canvas space

## Research Requirements

1. **Context7**: React Flow custom node types documentation
2. **Context7**: React Flow drag and drop patterns
3. **Codebase**: Existing drag-drop patterns in IDE components

## References

- **PRD**: Section 8.2 (Source-to-Canvas Mapping)
- **UX Design**: Section 19.2 (Source Nodes)
- **Epic 6**: Source Ingestion (provides real data later)

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
| 2025-12-30T10:30:00+07:00 | drafted | Story created |
