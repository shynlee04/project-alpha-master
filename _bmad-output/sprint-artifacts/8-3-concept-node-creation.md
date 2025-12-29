---
epic: 8
story: 3
title: Concept Node Creation
status: drafted
created: 2025-12-30T10:35:00+07:00
author: Ralph Loop Agent
team: Team A (UI/Frontend)
phase: story-dev-cycle
sprint: 8
priority: P1
estimated_effort: 4-6 hours
nfr_validated:
  - NFR-PERF-P2-05
tech_stack:
  - "@xyflow/react"
  - Zustand
dependencies:
  - "8-1-react-flow-canvas-setup"
blockers: []
---

# Story 8.3: Concept Node Creation

## User Story

**As a** user organizing knowledge,
**I want** to create mind-map style concept nodes,
**So that** I can visually represent relationships between ideas.

## Acceptance Criteria

### AC-1: Create Concept Node

**Given** user is on the canvas
**When** they double-click on empty space
**Then** a new concept node appears
**And** node is in edit mode with cursor ready
**And** default label is "New Concept"

### AC-2: Edit Concept Node Label

**Given** a concept node is created
**When** user clicks on the label
**Then** inline editing is enabled
**And** Enter key saves the new label
**And** Escape cancels editing

### AC-3: Concept Node Styling

**Given** concept nodes on canvas
**When** rendered
**Then** they have rounded rectangular shape
**And** use accent color from 8-bit design system
**And** display label centered in node

### AC-4: Move Concept Nodes

**Given** concept nodes exist
**When** user drags a node
**Then** node follows cursor smoothly
**And** connected edges update in real-time
**And** snap-to-grid when close to other nodes (optional)

### AC-5: Delete Concept Node

**Given** a concept node is selected
**When** user presses Delete/Backspace
**Then** node is removed
**And** all connected edges are removed
**And** removal is undoable

## Tasks

- [ ] Create ConceptNode React Flow custom node component
- [ ] Implement double-click to create new node
- [ ] Add inline label editing with keyboard shortcuts
- [ ] Style nodes per 8-bit design system
- [ ] Implement drag handler for node movement
- [ ] Add delete with undo capability
- [ ] Write unit tests for ConceptNode
- [ ] Write integration tests for node operations

## Dev Notes

### ConceptNode Component

```typescript
interface ConceptNodeData {
  label: string;
  color?: string;
  fontSize?: number;
}

function ConceptNode({ id, data, selected }: NodeProps<ConceptNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  return (
    <div className={cn('concept-node', { selected })}>
      {isEditing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditing(false);
            if (e.key === 'Escape') setIsEditing(false);
          }}
          autoFocus
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{label}</span>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Design Tokens

```css
/* From design-tokens.css */
--color-concept-bg: var(--color-accent-primary);
--color-concept-border: var(--color-accent-secondary);
--radius-concept: var(--radius-lg);
--shadow-concept: var(--shadow-md);
```

## Research Requirements

### Dependency Research: React Flow Custom Nodes

**Source: Context7 Documentation** (`/websites/reactflow_dev`)

**Key Patterns:**
1. Custom node types via `nodeTypes` prop
2. `NodeProps` generic for typed data
3. `Handle` component for connection points
4. Inline editing patterns with contentEditable

### Codebase Patterns to Follow

- 8-bit design system from design-tokens.css
- Keyboard shortcut handling from existing IDE components
- Undo/redo pattern from Zustand middleware

## References

- **PRD**: Section 8.3 (Concept Nodes)
- **UX Design**: Section 19.3 (Mind Map Nodes)
- **Architecture**: Section 5.2 (Naming conventions)

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
| 2025-12-30T10:35:00+07:00 | drafted | Story created |
