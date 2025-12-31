---
date: 2025-12-31
time: 02:20:00
phase: Implementation
team: Team-A
agent_mode: bmad-bmm-architect
---

# Handoff to @bmad-bmm-dev

**Task:** Implement Enhanced Canvas Node Types for The Brain Feature (EPIC-26)

---

## Context Summary

The Brain feature (EPIC-26) requires enhanced canvas node types to support knowledge synthesis and study artifact visualization. The architecture specification at [`_bmad-output/architecture/canvas-node-types-enhancement-2025-12-31.md`](_bmad-output/architecture/canvas-node-types-enhancement-2025-12-31.md) defines 5 new node types and supporting infrastructure.

## Key Files Referenced

### Architecture Documentation
- **Primary:** [`_bmad-output/architecture/canvas-node-types-enhancement-2025-12-31.md`](_bmad-output/architecture/canvas-node-types-enhancement-2025-12-31.md) - Complete architecture specification

### Existing Implementation
- **[`src/components/canvas/nodes/nodeTypes.ts`](src/components/canvas/nodes/nodeTypes.ts)** - Current node types registry
- **[`src/components/canvas/nodes/ConceptNode.tsx`](src/components/canvas/nodes/ConceptNode.tsx)** - Reference implementation
- **[`src/components/canvas/nodes/SourceNode.tsx`](src/components/canvas/nodes/SourceNode.tsx)** - Reference implementation
- **[`src/styles/design-tokens.css`](src/styles/design-tokens.css)** - Design tokens system

### Supporting Code
- **[`src/lib/canvas/`](src/lib/canvas/)** - Canvas utilities (create if not exists)
- **[`src/lib/learning/`](src/lib/learning/)** - Learning algorithms (SM-2 for spaced repetition)

## Acceptance Criteria

### Priority P0 (Must Complete)
- [ ] **FlashcardNode** implemented with:
  - [ ] Flip animation for front/back content
  - [ ] Mastery level indicator (0-100%)
  - [ ] Review action buttons (correct/incorrect)
  - [ ] SM-2 spaced repetition integration
  - [ ] Integration with `useCanvasStore`
- [ ] **QuizNode** implemented with:
  - [ ] Multiple choice question display
  - [ ] Answer selection and validation
  - [ ] Difficulty indicator (easy/medium/hard)
  - [ ] Explanation reveal after answering
  - [ ] Integration with `useCanvasStore`
- [ ] **NodeFactory** updated with new node types
- [ ] **CanvasStore** updated with study tracking operations
- [ ] All components follow 8-bit gaming aesthetic
- [ ] All components use design tokens from `design-tokens.css`

### Priority P1 (Should Complete)
- [ ] **AIInsightNode** implemented with:
  - [ ] AI-generated insight visualization
  - [ ] Confidence meter (0-100%)
  - [ ] Source connections display
  - [ ] Regenerate/Expand actions
- [ ] **useCanvasRAG** hook for RAG integration
- [ ] Unit tests for all new components (≥80% coverage)
- [ ] Integration tests for CanvasStore operations

### Priority P2 (Nice to Have)
- [ ] **ConnectionNode** for enhanced edge visualization
- [ ] **LearningPathNode** for learning progression
- [ ] E2E tests for canvas interactions
- [ ] Drag-and-drop from sidebar to canvas

## Implementation Order

1. **SM-2 Algorithm** (`src/lib/learning/sm2-algorithm.ts`)
2. **FlashcardNode** (`src/components/canvas/nodes/FlashcardNode.tsx`)
3. **QuizNode** (`src/components/canvas/nodes/QuizNode.tsx`)
4. **AIInsightNode** (`src/components/canvas/nodes/AIInsightNode.tsx`)
5. **Update nodeTypes.ts** with new node types
6. **Update nodeFactory.ts** with creation functions
7. **Update CanvasStore** with study tracking
8. **useCanvasRAG** hook for RAG integration
9. **Tests** for all components

## Design Guidelines

### 8-bit Gaming Aesthetic
- Use pixel-perfect styling with no border-radius (or minimal)
- Dark theme with high contrast colors
- Status indicators using simple colored bars/dots
- Hover effects with subtle color shifts

### Node Color Scheme
| Node Type | Primary Color | CSS Variable |
|-----------|---------------|--------------|
| Source | Blue | `--color-blue-500` |
| Concept | Purple | `--color-purple-500` |
| Flashcard | Green | `--color-green-500` |
| Quiz | Yellow | `--color-yellow-500` |
| AIInsight | Purple (gradient) | `--color-purple-400` |

### Handle Colors
- **Target handles (top):** Same as node theme color
- **Source handles (bottom):** Same as node theme color
- **Size:** 12px (3px border + 6px center)

## Component Structure Pattern

```typescript
// Pattern for all new node components
import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { NodeDataType } from './nodeTypes';

interface NodeNameProps extends NodeProps {
  data: NodeDataType;
  onAction?: (id: string) => void;
}

const NodeNameComponent = ({ id, data, selected, onAction }: NodeNameProps) => {
  // Implementation following architecture spec
  return (
    <div className="...">
      <Handle type="target" position={Position.Top} ... />
      {/* Content */}
      <Handle type="source" position={Position.Bottom} ... />
      {selected && <NodeResizer minWidth={200} minHeight={150} />}
    </div>
  );
};

export const NodeName = memo(NodeNameComponent);
```

## Testing Requirements

### Unit Tests Location
- `src/components/canvas/nodes/__tests__/FlashcardNode.test.tsx`
- `src/components/canvas/nodes/__tests__/QuizNode.test.tsx`
- `src/components/canvas/nodes/__tests__/AIInsightNode.test.tsx`
- `src/lib/learning/__tests__/sm2-algorithm.test.ts`

### Key Test Scenarios
- Flashcard flip animation
- Quiz answer validation
- Mastery level calculation
- Node data updates
- Store integration

## Output Location

All implementation artifacts should be created in:
- **Components:** `src/components/canvas/nodes/`
- **Tests:** `src/components/canvas/nodes/__tests__/`
- **Library:** `src/lib/canvas/`, `src/lib/learning/`
- **Store:** `src/lib/state/canvas-store.ts` (or integrate with existing)

## Return via Report to @bmad-core-bmad-master

**Completion Report Format:**
```markdown
**Completion Report to BMAD Master**

**Agent:** @bmad-bmm-dev

**Task Completed:** Enhanced Canvas Node Types for The Brain (EPIC-26)

**Artifacts Created:**
- src/components/canvas/nodes/FlashcardNode.tsx
- src/components/canvas/nodes/QuizNode.tsx  
- src/components/canvas/nodes/AIInsightNode.tsx
- src/lib/learning/sm2-algorithm.ts
- src/components/canvas/nodes/__tests__/FlashcardNode.test.tsx
- ... (all other artifacts)

**Story Status:**
- Story 26-1 (FlashcardNode): DONE
- Story 26-2 (QuizNode): DONE
- Story 26-3 (AIInsightNode): DONE
- Story 26-4 (NodeFactory): DONE
- Story 26-5 (CanvasStore): DONE

**Next Action:** Ready for Story 26-6 (RAG Integration) or continue with P2 items
```

---

**Handoff Timestamp:** 2025-12-31T02:20:00Z  
**Architect:** @bmad-bmm-architect  
**Next Agent:** @bmad-bmm-dev
