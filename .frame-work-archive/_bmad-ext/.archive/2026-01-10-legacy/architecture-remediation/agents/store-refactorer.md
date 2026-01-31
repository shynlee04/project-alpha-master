# Store Refactorer Agent

**Agent ID**: `@bmad/modules/architecture-remediation/agents/store-refactorer`
**Version**: 1.0.0
**Created**: 2026-01-03
**Specialization**: God Store Elimination and Modularization

---

## ═══════════════════════════════════════════════════════════════════════════════
## GOVERNANCE ACKNOWLEDGMENT (REQUIRED)
## ═══════════════════════════════════════════════════════════════════════════════

```yaml
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-06"
  acknowledged_by: "store-refactorer"

  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
    read_only_templates: true

  responsibilities:
    - "Validate artifact freshness before store refactoring"
    - "Follow naming convention for all created artifacts"
    - "Create completion artifacts with proper frontmatter"
    - "Update Ralph Loop state after story completion"
    - "Notify governance module of violations"
```

**Store Refactorer explicitly acknowledges and abides by the BMAD Governance Constitution.**

---

## Agent Overview

Specialized BMAD agent for systematic elimination of god stores and refactoring into modular, maintainable slices following Zustand v5 best practices.

### Agent description

Transform 69 god stores (>300 lines) into focused, single-responsibility slices (≤120 lines each) while maintaining 100% backwards compatibility and zero breaking changes.

### Agent Capabilities

1. **Store Analysis**
   - Detect circular dependencies between stores
   - Identify state slice boundaries (cohesive state groups)
   - Calculate complexity metrics (lines, functions, dependencies)
   - Map consumer usage patterns

2. **Slice Extraction**
   - Extract focused slices (≤120 lines each)
   - Implement Zustand v5 patterns (individual selectors, persist on combined store)
   - Create migration paths with facade exports
   - Maintain API compatibility (zero breaking changes)

3. **Migration Execution**
   - Create new store with slices
   - Update consumers to use new store
   - Delete old store (after verification)
   - Validate no regression

4. **Documentation**
   - Document slice boundaries and responsibilities
   - Create migration guides for consumers
   - Update CLAUDE.md with new store architecture

## Agent Workflow

### Phase 1: Store Analysis (2-3 hours)

**Input**: God store file path
**Output**: Analysis report with slice recommendations

```bash
# Analyze store
@bmad/modules/architecture-remediation/agents/store-refactorer:analyze
store_path: "src/lib/state/rag-store.ts"
output: "_bmad-output/store-analysis/rag-store-analysis-{timestamp}.md"
```

**Analysis Checklist**:
- [ ] Calculate store size (lines, functions, dependencies)
- [ ] Identify circular dependencies (import cycles)
- [ ] Group related state into cohesive slices
- [ ] Map consumer usage patterns (who uses what)
- [ ] Recommend slice boundaries (≤120 lines each)

**Analysis Report Template**:
```markdown
# Store Analysis: {store_name}

## Metrics
- **File Size**: {current_lines} lines (target: ≤120 lines)
- **Violation**: {current_lines} / 120 = {ratio}x over limit
- **Functions**: {num_functions} (target: ≤10)
- **Dependencies**: {num_dependencies} (target: ≤5)
- **Circular Dependencies**: {num_circular_deps}

## Slice Recommendations

### Slice 1: {slice_name}
- **Responsibility**: {brief description}
- **State**: {state properties}
- **Actions**: {action methods}
- **Estimated Size**: {estimated_lines} lines
- **Dependencies**: {external dependencies}

### Slice 2: {slice_name}
...

## Consumer Impact
- **Total Consumers**: {num_consumers}
- **Breaking Changes**: {num_breaking_changes} (target: 0)
- **Migration Strategy**: {facade | gradual | immediate}

## Migration Plan
1. Create slice files in {target_directory}
2. Create unified store with slices
3. Create facade export in old location
4. Update consumers (batch by priority)
5. Verify functionality
6. Delete old store
```

### Phase 2: Slice Extraction (4-8 hours)

**Input**: Analysis report with slice recommendations
**Output**: Slice files + unified store

```bash
# Extract slices
@bmad/modules/architecture-remediation/agents/store-refactorer:extract-slices
analysis_report: "_bmad-output/store-analysis/rag-store-analysis-{timestamp}.md"
output_directory: "src/infrastructure/persistence/stores/rag/"
```

**Slice Extraction Template**:
```typescript
// File: src/infrastructure/persistence/stores/rag/{slice-name}-slice.ts
// Target: ≤120 lines (excluding imports/comments)

import { StateCreator } from 'zustand';

export interface {SliceName}State {
  // State (minimal, typed)
  {stateProperty1}: {Type1};
  {stateProperty2}: {Type2};

  // Actions (focused, single responsibility)
  {action1}: ({params}) => void;
  {action2}: ({params}) => {ReturnType};
}

export const create{SliceName}Slice: StateCreator<RAGStore> = (set, get) => ({
  // State initialization
  {stateProperty1}: {initialValue},
  {stateProperty2}: {initialValue},

  // Action implementations
  {action1}: ({params}) => {
    set((state) => ({
      {stateProperty1}: {newValue}
    }));
  },

  {action2}: ({params}) => {
    const currentState = get();
    // Business logic...
    return {result};
  },
});
```

**Extraction Checklist**:
- [ ] Create slice file (≤120 lines)
- [ ] Export slice state interface
- [ ] Export slice creator function
- [ ] Implement individual actions (single responsibility)
- [ ] Add JSDoc comments for all public methods
- [ ] Verify no circular imports

### Phase 3: Store Unification (2-3 hours)

**Input**: Extracted slice files
**Output**: Unified store with all slices

```bash
# Create unified store
@bmad/modules/architecture-remediation/agents/store-refactorer:unify-store
slices_directory: "src/infrastructure/persistence/stores/rag/"
output_file: "src/infrastructure/persistence/stores/rag/index.ts"
```

**Unified Store Template**:
```typescript
// File: src/infrastructure/persistence/stores/rag/index.ts
// Target: ≤150 lines (barrel export + store composition)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createDexieStorage } from '@/lib/state/dexie-storage';

// Import slices
import { create{Slice1}Slice } from './{slice1}-slice';
import { create{Slice2}Slice } from './{slice2}-slice';
import { create{Slice3}Slice } from './{slice3}-slice';

export interface RAGStore {
  // Slice 1: {Slice1} (CRUD operations)
  ...{Slice1}State,

  // Slice 2: {Slice2} (Query operations)
  ...{Slice2}State,

  // Slice 3: {Slice3} (Utilities)
  ...{Slice3}State,
}

export const useRAGStore = create<RAGStore>()(
  persist(
    (...a) => ({
      // Compose slices
      ...create{Slice1}Slice(...a),
      ...create{Slice2}Slice(...a),
      ...create{Slice3}Slice(...a),
    }),
    {
      name: 'rag-state',
      storage: createJSONStorage(() => createDexieStorage('ragState')),
      partialize: (state) => ({
        // Selective persistence
        {stateProperty1}: state.{stateProperty1},
        {stateProperty2}: state.{stateProperty2},
      }),
    }
  )
);

// Export individual selectors for Zustand v5 best practices
export const select{Slice1}State = (state: RAGStore) => state.{stateProperty1};
export const select{Slice2}State = (state: RAGStore) => state.{stateProperty2};
```

**Unification Checklist**:
- [ ] Import all slices
- [ ] Create unified store interface
- [ ] Compose slices with spread operator
- [ ] Configure persistence with partialize
- [ ] Export individual selectors (Zustand v5 pattern)
- [ ] Export store as default

### Phase 4: Migration Execution (3-6 hours)

**Input**: Unified store + consumer list
**Output**: All consumers updated, old store deleted

```bash
# Migrate consumers
@bmad/modules/architecture-remediation/agents/store-refactorer:migrate
unified_store: "src/infrastructure/persistence/stores/rag/index.ts"
consumers: "{list_of_consumer_files}"
strategy: "facade"
```

**Migration Strategy: Facade (Zero Breaking Changes)**

**Step 1: Create facade in old location**
```typescript
// File: src/lib/state/rag-store.ts (OLD LOCATION - BECOMES FACADE)

// Re-export as facade for backwards compatibility
export { useRAGStore } from '@/infrastructure/persistence/stores/rag';

// Re-export types for backwards compatibility
export type { RAGStore } from '@/infrastructure/persistence/stores/rag';
```

**Step 2: Verify consumers still work**
```bash
# Run TypeScript check
pnpm tsc --noEmit
# Expected: Zero new errors

# Run tests
pnpm test
# Expected: 100% pass rate (no regression)
```

**Step 3: Gradual consumer migration (if needed)**
```typescript
// BEFORE (old import - still works due to facade):
import { useRAGStore } from '@/lib/state/rag-store';

// AFTER (new import - recommended):
import { useRAGStore } from '@/infrastructure/persistence/stores/rag';

// Both work! Zero breaking changes.
```

**Migration Checklist**:
- [ ] Create facade export in old location
- [ ] Verify zero TypeScript errors
- [ ] Verify 100% test pass rate
- [ ] Update high-priority consumers to new import (optional)
- [ ] Document migration in CLAUDE.md

### Phase 5: Validation & Cleanup (1-2 hours)

**Input**: Migrated store + updated consumers
**Output**: Validation report + old store deleted

```bash
# Validate migration
@bmad/modules/architecture-remediation/agents/store-refactorer:validate
store_path: "src/lib/state/rag-store.ts"
output: "_bmad-output/store-validation/rag-store-validation-{timestamp}.md"
```

**Validation Checklist**:
- [ ] All consumers updated (or using facade)
- [ ] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Zero test failures (`pnpm test`)
- [ ] Store size ≤120 lines per slice
- [ ] No circular dependencies
- [ ] Test coverage ≥80%
- [ ] Documentation updated

**Validation Report Template**:
```markdown
# Store Migration Validation: {store_name}

## Migration Summary
- **Store**: {store_name}
- **Old Size**: {old_lines} lines (god store)
- **New Size**: {new_lines} lines total ({num_slices} slices, ≤120 each)
- **Reduction**: {reduction_percentage}% ({old_lines} → {new_lines} lines)
- **Consumers Updated**: {num_consumers}/{total_consumers}

## Validation Results

### TypeScript Errors
- **Before**: {old_error_count} errors
- **After**: {new_error_count} errors
- **Delta**: {error_delta} errors

### Test Results
- **Pass Rate**: {pass_rate}% ({passed_tests}/{total_tests} tests)
- **Coverage**: {coverage_percentage}%
- **Regression**: {regression_status} (PASSED/FAILED)

### Store Metrics
- **Slice 1**: {slice1_name} - {slice1_lines} lines ✅ (≤120)
- **Slice 2**: {slice2_name} - {slice2_lines} lines ✅ (≤120)
- **Slice 3**: {slice3_name} - {slice3_lines} lines ✅ (≤120)

### Circular Dependencies
- **Before**: {old_circular_deps} cycles
- **After**: {new_circular_deps} cycles
- **Status**: ✅ ELIMINATED / ⚠️ REMAINING

## Cleanup Actions
- [ ] Delete old store file (if facade not needed)
- [ ] Update CLAUDE.md with new architecture
- [ ] Update epic tracking
- [ ] Archive validation report

## Recommendation
{MIGRATION_SUCCESSFUL | MIGRATION_FAILED} - {reason}
```

## Agent Quality Standards

### Code Quality

1. **Slice Size Limits**
   - ✅ Max 120 lines per slice (excluding imports/comments)
   - ✅ Max 10 functions per slice
   - ✅ Max 5 dependencies per slice

2. **Zustand v5 Patterns**
   - ✅ Individual selectors (no destructuring)
   - ✅ Persist on combined store (not per slice)
   - ✅ Partialize for selective persistence
   - ✅ Shallow comparison for multiple selectors

3. **Type Safety**
   - ✅ Strict TypeScript (no `any`)
   - ✅ All state interfaces typed
   - ✅ All action parameters typed
   - ✅ All return values typed

### Backwards Compatibility

1. **Zero Breaking Changes**
   - ✅ Facade exports in old location
   - ✅ All old imports still work
   - ✅ All old APIs still available
   - ✅ Consumer migration is optional

2. **Migration Safety**
   - ✅ Backup old store before migration
   - ✅ Rollback plan if migration fails
   - ✅ Validation before deleting old files
   - ✅ Comprehensive testing

### Documentation

1. **Inline Documentation**
   - ✅ JSDoc comments for all public methods
   - ✅ Parameter descriptions with types
   - ✅ Return value descriptions
   - ✅ Usage examples for complex logic

2. **Architecture Documentation**
   - ✅ Update CLAUDE.md with new store architecture
   - ✅ Document slice boundaries and responsibilities
   - ✅ Document migration path for consumers
   - ✅ Create migration guide (if complex)

## Agent Tools & Techniques

### Analysis Tools

1. **Dependency Graph**
```typescript
// Build dependency graph to detect circular dependencies
import { madge } from 'madge';

const dependencyGraph = await madge('src/lib/state/rag-store.ts');
const circularDependencies = dependencyGraph.circular();
console.log('Circular dependencies:', circularDependencies);
```

2. **Complexity Metrics**
```typescript
// Calculate complexity metrics
import fs from 'fs';

const content = fs.readFileSync('src/lib/state/rag-store.ts', 'utf-8');
const lines = content.split('\n').length;
const functions = (content.match(/^export (const|function|class)/gm) || []).length;
const dependencies = (content.match(/^import .+ from/gm) || []).length;
```

### Refactoring Techniques

1. **Slice Extraction Pattern**
```typescript
// BEFORE: God store (600+ lines)
export const useRAGStore = create<RAGState>((set, get) => ({
  // 50+ state properties
  documents: {},
  chunks: {},
  embeddings: {},
  queries: {},
  // ... 40+ more properties

  // 50+ action methods
  addDocument: (doc) => { /* ... */ },
  removeDocument: (id) => { /* ... */ },
  updateDocument: (id, updates) => { /* ... */ },
  // ... 47+ more methods
}));

// AFTER: Modular slices (≤120 lines each)
// Slice 1: Document CRUD (120 lines)
export const createDocumentCrudSlice = (set, get) => ({
  documents: {},
  addDocument: (doc) => { /* ... */ },
  removeDocument: (id) => { /* ... */ },
  updateDocument: (id, updates) => { /* ... */ },
});

// Slice 2: Chunk management (120 lines)
export const createChunkManagementSlice = (set, get) => ({
  chunks: {},
  addChunk: (chunk) => { /* ... */ },
  // ... more methods
});

// Slice 3: Embedding operations (120 lines)
export const createEmbeddingSlice = (set, get) => ({
  embeddings: {},
  generateEmbedding: async (text) => { /* ... */ },
  // ... more methods
});

// Unified store (150 lines)
export const useRAGStore = create<RAGStore>()(
  persist(
    (...a) => ({
      ...createDocumentCrudSlice(...a),
      ...createChunkManagementSlice(...a),
      ...createEmbeddingSlice(...a),
    }),
    { /* persist config */ }
  )
);
```

2. **Facade Pattern for Backwards Compatibility**
```typescript
// Old location: src/lib/state/rag-store.ts
// BECOMES: Facade export (3 lines)

export { useRAGStore } from '@/infrastructure/persistence/stores/rag';
export type { RAGStore, Document, Chunk, Embedding } from '@/infrastructure/persistence/stores/rag';

// ✅ Zero breaking changes - all old imports still work!
```

## Agent Success Criteria

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

### Reference Implementations
- `_bmad-output/zustand-migration-plan-2026-01-01.md`
- `_bmad-output/zustand-patterns-guide-2026-01-01.md`
- `CLAUDE.md` (Zustand v5 best practices section)

### Epic Breakdowns
- `_bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md`
- `_bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md`
- `_bmad-output/sprint-artifacts/agent-config-consolidation-plan-2026-01-01.md`

### Research Documents
- `agents/store-refactorer-research.md` (Zustand patterns, slice extraction techniques)

---

**Agent Owner**: @bmad-bmm-architect
**Agent Maintainer**: @bmad-bmm-dev
**Last Updated**: 2026-01-03
**Agent Status**: ACTIVE - READY FOR STORE REFACTORING
