# Store Analysis: canvas-store.ts

**Date:** 2026-01-05  
**Analysis Type:** God Store Splitting (S-012 Execution)  
**Store Path:** `src/infrastructure/persistence/stores/canvas-store.ts`  
**Current Lines:** 623 (Target: ≤120 lines)  
**Violation Ratio:** 5.2x over limit

---

## Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| File Size | 623 lines | ≤120 lines | 🔴 **CRITICAL** |
| Functions | 20+ | ≤10 | 🔴 **HIGH** |
| Stores Merged | 2 | 0 | 🔴 **DUAL STORE** |
| Dependencies | 8+ | ≤5 | 🟡 **ELEVATED** |

---

## Violation Summary

**God Store Anti-Pattern Violation:**
- File exceeds 120-line limit by 503 lines (623 total)
- Mixes two distinct stores: `useCanvasStore` + `useMultiCanvasStore`  
- Considering Dual+ responsibilities (single primary store + multi-canvas superset)
- Contains database persistence logic embedded with UI state
- No slice separation - all logic in monolithic file

**Missing Governance:**
- No file header comment with architecture documentation
- No reference to Epic or Story tracking
- No migration status governance tag

---

## Slice Recommendations

### Slice 1: Canvas CRUD Operations (ID: `canvas-crud-slice`)
**Responsibility:** Create/Delete/Rename/Reload canvas metadata  
**Estimated Lines:** 80-100 lines

**State:**
```typescript
interface CanvasCrudSlice {
  canvasId: string | null;
  canvasName: string;
  createCanvas(name?: string): Promise<string>;
  deleteCanvas(canvasId: string): Promise<void>;
  renameCanvas(canvasId: string, name: string): Promise<void>;
  loadCanvasList(): Promise<void>;
}
```

**Actions:**
- `createCanvas` - Create new canvas with ID generation
- `deleteCanvas` - Delete canvas and its state from IndexedDB
- `renameCanvas` - Update canvas metadata name
- `loadCanvasList` - Load all canvases from IndexedDB

**Dependencies:**
- `getCanvasDb()` (from quiz-db equivalent)
- `generateCanvasId()` utility

---

### Slice 2: Canvas State Management (ID: `canvas-state-slice`)
**Responsibility:** Manage nodes, edges, viewport for active canvas  
**Estimated Lines:** 100-120 lines

**State:**
```typescript
interface CanvasStateSlice {
  nodes: Node<any>[];
  edges: Edge<any>[];
  linkageProposals: LinkageProposal[];
  viewport: Viewport;
  isReadOnly: boolean;

  // Node operations
  setNodes(nodes: Node<any>[]): void;
  onNodesChange(changes: NodeChange[]): void;
  addNodes(nodes: Node<any>[]): void;

  // Edge operations
  setEdges(edges: Edge<any>[]): void;
  onEdgesChange(changes: EdgeChange[]): void;
  addEdge(params: Connection): void;

  // Viewport operations
  setViewport(viewport: Viewport): void;
  resetViewport(): void;
}
```

**Actions:**
- React Flow integration handlers
- Node/edge mutations through React Flow APIs
- Viewport state management

**Dependencies:**
- React Flow APIs (`@xyflow/react`)
- State persistence triggers

---

### Slice 3: Canvas Linkage Analysis (ID: `canvas-linkage-slice`)
**Responsibility:** Generate linkage proposals between nodes  
**Estimated Lines:** 80-100 lines

**State:**
```typescript
interface CanvasLinkageSlice {
  generateLinkageProposals(): Promise<LinkageProposal[]>;
  applyLinkageProposal(proposal: LinkageProposal): Promise<void>;
  clearLinkageProposals(): void;
}
```

**Actions:**
- Trigger linkage analysis using `createLinkageAnalyzer`
- Update state with proposals
- Apply selected proposal

**Dependencies:**
- `createLinkageAnalyzer` from `@/lib/canvas/linkage-analyzer`
- `LinkageProposal` types

---

### Slice 4: Canvas Persistence (ID: `canvas-persistence-slice`)
**Responsibility:** IndexedDB read/write for canvas state  
**Estimated Lines:** 100-120 lines

**State:**
```typescript
interface CanvasPersistenceSlice {
  saveCanvasState(): Promise<void>;
  loadCanvasState(canvasId: string): Promise<void>;
  autoSaveEnabled: boolean;
  setAutoSave(enabled: boolean): void;
}
```

**Actions:**
- Save current nodes/edges/viewport to IndexedDB
- Load canvas state from IndexedDB on canvas switch
- Auto-save on change (debounced)

**Dependencies:**
- `getCanvasDb()` (from quiz-db equivalent)
- Debounce utility

---

### Slice 5: Multi-Canvas Management (ID: `canvas-multi-slice`)
**Responsibility:** Manage active canvas across multiple canvases  
**Estimated Lines:** 60-80 lines

**State:**
```typescript
interface MultiCanvasManagerSlice {
  activeCanvasId: string | null;
  canvasList: CanvasMetadata[];
  setActiveCanvas(canvasId: string): Promise<void>;
}
```

**Actions:**
- Switch active canvas
- Unload current canvas before switching
- Update canvas list metadata

**Dependencies:**
- `canvas-crud-slice` for loading
- `canvas-persistence-slice` for state restoration

---

### Slice 6: Canvas Import/Export (ID: `canvas-io-slice`)
**Responsibility:** Export and import canvas data  
**Estimated Lines:** 60-80 lines

**State:**
```typescript
interface CanvasIOSlice {
  exportCanvas(): Promise<CanvasExport>;
  importCanvas(exportData: CanvasExport): Promise<string>;
}
```

**Actions:**
- Serialize canvas state to export format
- Parse import data and create new canvas
- Handle validation of import data

**Dependencies:**
- `createCanvas` from crud-slice
- `CanvasExport` types

---

## Consumer Impact

### Total Consumers: Unknown (need scan)

**Likely Consumer Locations:**
```
src/presentation/
  - components/canvas/
    - KnowledgeCanvas.tsx
    - CanvasEditor.tsx
    - CanvasToolbar.tsx
  - components/knowledge/
    - KnowledgeGraph.tsx
    - QuizPreviewPanel.tsx
  - routes/
    - knowledge.$projectId.lazy.tsx
```

**Breaking Changes:** 0 (facade export strategy)

**Migration Strategy:**
1. Create slices in `src/infrastructure/persistence/stores/canvas/slices/`
2. Create unified store in `src/infrastructure/persistence/stores/canvas/index.ts`
3. Maintain `canvas-store.ts` as facade export at current location
4. Update consumers via gradual migration (batch by priority)

---

## Migration Plan

### Phase 1: Scaffold Infrastructure (30 min)
- [ ] Create `canvas/slices/` directory structure
- [ ] Create `canvas/canvas-db.ts` (extract database initialization)
- [ ] Create `canvas/types.ts` (export existing types)
- [ ] Create `canvas/utils.ts` (extract utilities like `generateCanvasId`)

### Phase 2: Extract Slices (4-6 hours)
- [ ] Create `canvas/canvas-crud-slice.ts` (80-100 lines)
- [ ] Create `canvas/canvas-state-slice.ts` (100-120 lines)
- [ ] Create `canvas/canvas-linkage-slice.ts` (80-100 lines)
- [ ] Create `canvas/canvas-persistence-slice.ts` (100-120 lines)
- [ ] Create `canvas/canvas-multi-slice.ts` (60-80 lines)
- [ ] Create `canvas/canvas-io-slice.ts` (60-80 lines)

### Phase 3: Create Unified Store (1-2 hours)
- [ ] Compose slices into `useCanvasStore`
- [ ] Compose slices into `useMultiCanvasStore`
- [ ] Apply persist middleware (partialize: activeCanvasId)
- [ ] Create individual selector hooks (Zustand v5 pattern)

### Phase 4: Facade Export (30 min)
- [ ] Update `canvas-store.ts` to re-export from new location
- [ ] Add deprecation warning for direct imports
- [ ] Update barrel export in `stores/index.ts`

### Phase 5: Validation (1 hour)
- [ ] Incremental TypeScript check (no errors)
- [ ] Verify all slices ≤120 lines
- [ ] Verify zero circular dependencies
- [ ] Test consumer functionality

### Phase 6: Documentation (30 min)
- [ ] Add file header comments
- [ ] Update governance tracking
- [ ] Document slice responsibilities

**Total Estimated Effort:** 8-10 hours

---

## Slice Boundary Justification

### Why 6 Slices?

1. **CRUD vs State Persistence:** Domain operations (create canvas) separate from I/O (save/load)
2. **React Flow Integration:** Node/edge management distinct from canvas metadata
3. **Linkage Analysis:** Computationally expensive, separate concern
4. **Multi-Canvas Management:** Cross-cutting concern that affects all slices
5. **Import/Export:** I/O boundary, separate from state operations
6. **Single Responsibility:** Each slice <120 lines, focused on one domain

### Alternative: Fewer Slices?

**5-slice option:** Combine linkages + persistence → "canvas-operations-slice"
- Risk: Mixed responsibilities (computation + I/O)
- Benefit: Fewer files to maintain

**Decision:** Proceed with 6 slices for clearer separation, easier testing

---

## Architecture Diagram

```
canvas-store.ts (Facade - 64 lines)
    ↓ re-exports
canvas/index.ts (Unified Store - 150 lines)
    ↓ composed from
canvas/slices/
    ├── canvas-crud-slice.ts (80-100 lines)
    ├── canvas-state-slice.ts (100-120 lines)
    ├── canvas-linkage-slice.ts (80-100 lines)
    ├── canvas-persistence-slice.ts (100-120 lines)
    ├── canvas-multi-slice.ts (60-80 lines)
    └── canvas-io-slice.ts (60-80 lines)

Supporting infrastructure:
    ├── canvas/canvas-db.ts (70 lines)
    ├── canvas/types.ts (40 lines)
    └── canvas/utils.ts (30 lines)
```

---

## Quality Gates

### Pre-Splitting (Before Executing)
- [ ] Verify no circular imports in current code
- [ ] Identify all consumers via grep scan
- [ ] Create backup of current file
- [ ] Confirm governance documentation will be added

### Post-Splitting (Each Slice)
- [ ] Slice ≤120 lines (excluding comments/imports)
- [ ] TypeScript check passes (zero errors)
- [ ] JSDoc comments on all exports
- [ ] Test coverage ≥80% (TDD approach)

### Post-Migration
- [ ] All consumers still work (zero breaking changes)
- [ ] File header comment added with governance tags
- [ ] AGENTS.md updated with new architecture
- [ ] Epic tracking updated

---

## Success Criteria

### Quantitative Metrics
- ✅ All slices ≤120 lines (target: average 90 lines)
- ✅ Main store file ≤150 lines (from 623 lines)
- ✅ Zero TypeScript errors (incremental check)
- ✅ Zero circular dependencies
- ✅ Test coverage ≥80% on new code

### Qualitative Metrics
- ✅ Each slice single responsibility (focused domain)
- ✅ Clear slice boundary documentation
- ✅ Zero breaking changes (facade pattern)
- ✅ Governed file with proper headers
- ✅ Individual selector hooks (Zustand v5)

---

## Risk Assessment

### High Risk Items
- **Risk:** React Flow regression (node/edge mutations)
- **Mitigation:** Extensive component testing post-split
- **Rollback Plan:** Keep facade export with old implementation as fallback

### Medium Risk Items  
- **Risk:** IndexedDB transaction conflicts during split
- **Mitigation:** Same database layer, no schema changes
- **Rollback Plan:** Preserve existing `KnowledgeCanvasDB` class

### Low Risk Items
- **Risk:** Consumer imports breaking
- **Mitigation:** Facade pattern zero changing exports
- **Rollback Plan:** Consumers auto-compatible

---

## Next Steps

1. **Confirm:** Proceed with 6-slice architecture
2. **Execute:** Begin Phase 1 (scaffold infrastructure)
3. **Governance:** Add file header comments during Phase 6
4. **Tracking:** Update Epic and Story status in sprint artifacts

---

**Analysis Status:** ✅ COMPLETE  
**Ready for Execution:** YES  
**Estimated Completion Time:** 8-10 hours  
**Approver:** ASGL Loop Orchestrator

---

**Generated By:** Store Refactoring Agent (Architecture Remediation Module)
**Session:** ASGL-20260105-155500
**Timestamp:** 2026-01-05T19:30:00+07:00