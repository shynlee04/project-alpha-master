---
name: Canvas Store Consolidation
description: Workspace-aware canvas state management with focused slices
version: 1.0.0
author: @bmad-bmm-dev
created: 2026-01-01T19:00:00+07:00
phase: Implementation
iteration: 4
status: PLANNED
---

# Canvas Store Consolidation Plan

**Task:** Consolidate 2 duplicate canvas stores → 5 focused slices (<120 lines each)
**Status:** 📋 PLANNED (Implementation in progress)
**Duration:** Iteration 4

---

## Current State Analysis

### Found Files:
- `src/lib/state/canvas-store.ts` (616 lines) ❌ DUPLICATE
- `src/infrastructure/persistence/stores/canvas-store.ts` (621 lines) ✅ CANONICAL
- `src/lib/state/canvas-store.ts.bak` ❌ BACKUP (delete)
- `src/lib/state/__tests__/canvas-store.test.ts` ✅ TESTS (update imports)

### Usage Analysis:
- **Zero component imports** - only used in tests
- Duplicate stores are ~98% identical (only import path differences)
- 621 lines total - needs splitting to meet 120 line target

---

## Proposed Architecture

### Slice Breakdown (5 focused slices <120 lines each):

```
src/infrastructure/persistence/stores/canvas/
├── canvas-types.ts (NEW)
│   ├── CanvasViewportState
│   ├── CanvasNodesState
│   ├── CanvasEdgesState
│   ├── CanvasPersistenceState
│   ├── CanvasMetadataState
│   └── CanvasStoreState (composed)
│
├── canvas-viewport-slice.ts (<120 lines)
│   ├── viewport: { x, y, zoom }
│   ├── setViewport()
│   ├── resetViewport()
│   └── zoom operations
│
├── canvas-nodes-slice.ts (<120 lines)
│   ├── nodes: Node<any>[]
│   ├── setNodes()
│   ├── addNode()
│   ├── removeNode()
│   ├── onNodesChange() (React Flow integration)
│   └── Node validation
│
├── canvas-edges-slice.ts (<120 lines)
│   ├── edges: Edge<any>[]
│   ├── setEdges()
│   ├── addEdge()
│   ├── removeEdge()
│   ├── addEdgeWithRelationship()
│   ├── onEdgesChange() (React Flow integration)
│   └── Relationship type management
│
├── canvas-persistence-slice.ts (<120 lines)
│   ├── saveCanvas()
│   ├── loadCanvas()
│   ├── deleteCanvas()
│   ├── loadCanvasList()
│   └── IndexedDB operations (KnowledgeCanvasDB)
│
├── canvas-metadata-slice.ts (<120 lines)
│   ├── canvasList: CanvasMetadata[]
│   ├── currentCanvasId: string | null
│   ├── currentWorkspaceType: WorkspaceType ✨ NEW
│   ├── setCurrentWorkspace() ✨ NEW
│   └── Export functionality (downloadCanvas, exportCanvas)
│
└── canvas-store.ts (<120 lines)
    ├── Composes all 5 slices
    ├── Dexie persistence
    └── Exported hooks
```

---

## Implementation Steps

### Step 1: Create Types File
```typescript
// canvas-types.ts
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'canvas';

export interface CanvasViewportState {
  viewport: { x: number; y: number; zoom: number };
}

export interface CanvasNodesState {
  nodes: Node<any>[];
}

export interface CanvasEdgesState {
  edges: Edge<any>[];
  linkageProposals: LinkageProposal[];
}

export interface CanvasPersistenceState {
  currentCanvasId: string | null;
  currentWorkspaceType: WorkspaceType; // ✨ NEW
}

export interface CanvasMetadataState {
  canvasList: CanvasMetadata[];
  isReadOnly: boolean;
}

export type CanvasStoreState =
  CanvasViewportState &
  CanvasNodesState &
  CanvasEdgesState &
  CanvasPersistenceState &
  CanvasMetadataState;
```

### Step 2: Create Slices
- Viewport slice (target: 80 lines)
- Nodes slice (target: 115 lines)
- Edges slice (target: 115 lines)
- Persistence slice (target: 115 lines)
- Metadata slice (target: 95 lines)

### Step 3: Compose Main Store
```typescript
export const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get, api) => ({
      ...createCanvasViewportSlice(set, get, api),
      ...createCanvasNodesSlice(set, get, api),
      ...createCanvasEdgesSlice(set, get, api),
      ...createCanvasPersistenceSlice(set, get, api),
      ...createCanvasMetadataSlice(set, get, api),
    }),
    {
      name: 'canvas-state',
      storage: createJSONStorage(() => createDexieStorage('canvasState')),
      partialize: (state) => ({
        viewport: state.viewport,
        currentCanvasId: state.currentCanvasId,
        currentWorkspaceType: state.currentWorkspaceType,
        // Don't persist temporary nodes/edges (use IndexedDB)
      }),
    }
  )
);
```

### Step 4: Update Imports
- Update test file: `src/lib/state/__tests__/canvas-store.test.ts`
- Change: `from '../canvas-store'` → `from '@/infrastructure/persistence/stores/canvas/canvas-store'`

### Step 5: Delete Duplicates
- Delete: `src/lib/state/canvas-store.ts`
- Delete: `src/lib/state/canvas-store.ts.bak`

---

## Quality Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Max Lines per Slice | 120 | Split into 5 focused slices |
| Max Functions per Slice | 5-7 | Group related actions |
| Workspace Awareness | Required | Add currentWorkspaceType |
| Breaking Changes | Zero | Backward compatible API |
| TypeScript Coverage | 100% | Strict types for all slices |

---

## Next Steps

1. ✅ Create types file
2. ⏳ Create 5 focused slices
3. ⏳ Compose main store
4. ⏳ Update test imports
5. ⏳ Delete duplicate files
6. ⏳ Create completion report

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-01T19:00:00+07:00
**Author**: @bmad-bmm-dev
**Status**: READY FOR IMPLEMENTATION
