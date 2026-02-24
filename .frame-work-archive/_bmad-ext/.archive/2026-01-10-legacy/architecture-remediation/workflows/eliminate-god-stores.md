# Eliminate God Stores Workflow

**Workflow ID**: `@bmad/modules/architecture-remediation/workflows/eliminate-god-stores`
**Version**: 1.0.0
**Created**: 2026-01-03
**description**: Systematic refactoring of god stores into modular slices

## Workflow Overview

Step-by-step workflow for eliminating god stores (>300 lines) by extracting focused slices (≤120 lines each) while maintaining 100% backwards compatibility.

## Workflow Steps

### Step 1: Store Analysis (2-3 hours)

**Agent**: @bmad/modules/architecture-remediation/agents/store-refactorer

**Input**: God store file path
**Output**: Analysis report with slice recommendations

```bash
# Execute analysis
@bmad/modules/architecture-remediation/agents/store-refactorer:analyze
store_path: "src/lib/state/rag-store.ts"
output: "_bmad-output/store-analysis/rag-store-analysis-{timestamp}.md"
```

**Acceptance Criteria**:
- [ ] Store size calculated (lines, functions, dependencies)
- [ ] Circular dependencies identified
- [ ] Slice boundaries recommended (≤120 lines each)
- [ ] Consumer usage mapped (who uses what)
- [ ] Migration strategy defined (facade, gradual, immediate)

**Deliverables**:
- Analysis report (`_bmad-output/store-analysis/{store-name}-analysis-{timestamp}.md`)
- Slice recommendations with estimated sizes
- Consumer impact assessment

---

### Step 2: Slice Extraction (4-8 hours)

**Agent**: @bmad/modules/architecture-remediation/agents/store-refactorer

**Input**: Analysis report
**Output**: Slice files + unified store

```bash
# Extract slices
@bmad/modules/architecture-remediation/agents/store-refactorer:extract-slices
analysis_report: "_bmad-output/store-analysis/rag-store-analysis-{timestamp}.md"
output_directory: "src/infrastructure/persistence/stores/rag/"
```

**Acceptance Criteria**:
- [ ] All slice files created (≤120 lines each)
- [ ] Slice state interfaces defined
- [ ] Slice actions implemented (single responsibility)
- [ ] JSDoc comments added for all public methods
- [ ] Zero circular imports between slices
- [ ] Unified store composed with all slices
- [ ] Individual selectors exported (Zustand v5 pattern)

**Deliverables**:
- Slice files (e.g., `rag-metadata-slice.ts`, `rag-crud-slice.ts`)
- Unified store (`src/infrastructure/persistence/stores/rag/index.ts`)
- Barrel exports (`src/infrastructure/persistence/stores/rag/index.ts`)

**Validation Commands**:
```bash
# TypeScript check
pnpm tsc --noEmit
# Expected: Zero new errors

# Lint check
pnpm lint
# Expected: Zero new warnings
```

---

### Step 3: Migration Execution (3-6 hours)

**Agent**: @bmad/modules/architecture-remediation/agents/store-refactorer

**Input**: Unified store + consumer list
**Output**: Facade export + updated consumers

```bash
# Execute migration
@bmad/modules/architecture-remediation/agents/store-refactorer:migrate
unified_store: "src/infrastructure/persistence/stores/rag/index.ts"
old_store: "src/lib/state/rag-store.ts"
strategy: "facade"
```

**Acceptance Criteria**:
- [ ] Facade export created in old location
- [ ] Zero TypeScript errors
- [ ] Zero test failures (100% pass rate)
- [ ] All consumers still work (backwards compatible)
- [ ] Documentation updated (CLAUDE.md)

**Deliverables**:
- Facade export (`src/lib/state/rag-store.ts` - re-exports from new location)
- Updated consumers (optional migration to new imports)
- Updated documentation

**Validation Commands**:
```bash
# TypeScript check
pnpm tsc --noEmit
# Expected: Zero new errors

# Test suite
pnpm test
# Expected: 100% pass rate
```

---

### Step 4: Validation & Cleanup (1-2 hours)

**Agent**: @bmad/modules/architecture-remediation/agents/store-refactorer

**Input**: Migrated store + updated consumers
**Output**: Validation report

```bash
# Validate migration
@bmad/modules/architecture-remediation/agents/store-refactorer:validate
store_path: "src/lib/state/rag-store.ts"
output: "_bmad-output/store-validation/rag-store-validation-{timestamp}.md"
```

**Acceptance Criteria**:
- [ ] Main component size ≤300 lines
- [ ] All slices ≤120 lines
- [ ] Zero TypeScript errors
- [ ] Zero test failures
- [ ] Zero breaking changes (API stable)
- [ ] Test coverage ≥80%
- [ ] Documentation updated

**Deliverables**:
- Validation report (`_bmad-output/store-validation/{store-name}-validation-{timestamp}.md`)
- Updated epic tracking
- Updated CLAUDE.md

**Validation Commands**:
```bash
# TypeScript check
pnpm tsc --noEmit
# Expected: Zero new errors

# Test suite
pnpm test
# Expected: 100% pass rate

# Coverage check
pnpm test -- --coverage
# Expected: ≥80% coverage
```

---

## Workflow Example: RAG Store Refactoring

### Before: God Store (1,595 lines)

```typescript
// File: src/lib/state/rag-store.ts (1,595 lines)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRAGStore = create<RAGState>()(
  persist(
    (set, get) => ({
      // 50+ state properties
      documents: {},
      chunks: {},
      embeddings: {},
      queries: {},

      // 50+ action methods
      addDocument: (doc) => { /* ... */ },
      removeDocument: (id) => { /* ... */ },
      updateDocument: (id, updates) => { /* ... */ },
      // ... 47+ more methods
    }),
    { name: 'rag-storage' }
  )
);
```

### After: Modular Slices (≤120 lines each)

```typescript
// Slice 1: Document CRUD (120 lines)
// File: src/infrastructure/persistence/stores/rag/document-crud-slice.ts

import { StateCreator } from 'zustand';

export interface DocumentCrudState {
  documents: Record<string, Document>;
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  getDocument: (id: string) => Document | undefined;
}

export const createDocumentCrudSlice: StateCreator<RAGStore> = (set, get) => ({
  documents: {},

  addDocument: (doc) => {
    set((state) => ({
      documents: { ...state.documents, [doc.id]: doc },
    }));
  },

  removeDocument: (id) => {
    set((state) => {
      const { [id]: removed, ...rest } = state.documents;
      return { documents: rest };
    });
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: {
        ...state.documents,
        [id]: { ...state.documents[id], ...updates },
      },
    }));
  },

  getDocument: (id) => {
    return get().documents[id];
  },
});

// Slice 2: Chunk management (120 lines)
// Slice 3: Embedding operations (120 lines)
// ... more slices

// Unified store (150 lines)
// File: src/infrastructure/persistence/stores/rag/index.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';
import { createDocumentCrudSlice } from './document-crud-slice';
import { createChunkManagementSlice } from './chunk-management-slice';
import { createEmbeddingSlice } from './embedding-slice';

export interface RAGStore extends DocumentCrudState, ChunkManagementState, EmbeddingState {}

export const useRAGStore = create<RAGStore>()(
  persist(
    (...a) => ({
      ...createDocumentCrudSlice(...a),
      ...createChunkManagementSlice(...a),
      ...createEmbeddingSlice(...a),
    }),
    {
      name: 'rag-state',
      storage: createJSONStorage(() => createDexieStorage('ragState')),
      partialize: (state) => ({
        documents: state.documents,
        chunks: state.chunks,
      }),
    }
  )
);

// Facade for backwards compatibility
// File: src/lib/state/rag-store.ts

export { useRAGStore } from '@/infrastructure/persistence/stores/rag';
export type { RAGStore, Document, Chunk, Embedding } from '@/infrastructure/persistence/stores/rag';
```

## Workflow Quality Gates

### Gate 1: Pre-Validation (Before Starting)
- [ ] Store identified as god store (>300 lines)
- [ ] Analysis report approved
- [ ] Slice boundaries defined
- [ ] Migration strategy approved

### Gate 2: Post-Extraction (After Slice Creation)
- [ ] All slices ≤120 lines
- [ ] Zero circular imports
- [ ] TypeScript check passes
- [ ] Lint check passes

### Gate 3: Post-Migration (After Consumer Update)
- [ ] Zero TypeScript errors
- [ ] Zero test failures
- [ ] All consumers still work
- [ ] Backwards compatible

### Gate 4: Post-Validation (Before Marking Done)
- [ ] All acceptance criteria met (100%)
- [ ] Test coverage ≥80%
- [ ] Documentation updated
- [ ] Epic tracking updated

## Workflow Artifacts

### Input Artifacts
- God store file (e.g., `src/lib/state/rag-store.ts`)
- Consumer list (from dependency analysis)

### Output Artifacts
- Analysis report (`_bmad-output/store-analysis/{store-name}-analysis-{timestamp}.md`)
- Slice files (in `src/infrastructure/persistence/stores/{domain}/`)
- Unified store (in `src/infrastructure/persistence/stores/{domain}/index.ts`)
- Facade export (in old location for backwards compatibility)
- Validation report (`_bmad-output/store-validation/{store-name}-validation-{timestamp}.md`)

### Tracking Artifacts
- Epic tracking (updated after each step)
- `_bmad-output/epic-tracking.md` (progress dashboard)
- `_bmad-output/validation-gates.md` (acceptance criteria checklists)

## Workflow Success Criteria

### Quantitative Metrics

- ✅ Store size: ≤120 lines per slice
- ✅ Functions per slice: ≤10
- ✅ Dependencies per slice: ≤5
- ✅ TypeScript errors: 0 new errors
- ✅ Test pass rate: 100%
- ✅ Test coverage: ≥80%

### Qualitative Metrics

- ✅ Zero breaking changes (backwards compatible)
- ✅ Zero circular dependencies
- ✅ Clear slice boundaries (single responsibility)
- ✅ Comprehensive documentation
- ✅ Migration validated and tested

## Related Artifacts

### Agent Documentation
- `agents/store-refactorer.md` (Store refactoring specialist)

### Epic Breakdowns
- `_bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md`
- `_bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md`

### Reference Implementations
- `_bmad-output/zustand-migration-plan-2026-01-01.md`
- `_bmad-output/zustand-patterns-guide-2026-01-01.md`

---

**Workflow Owner**: @bmad-bmm-architect
**Workflow Maintainer**: @bmad-bmm-dev
**Last Updated**: 2026-01-03
**Workflow Status**: ACTIVE - READY FOR EXECUTION
