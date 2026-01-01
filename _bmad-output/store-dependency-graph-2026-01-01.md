---
date: 2026-01-01
time: 20:00:00
phase: Implementation
workflow: zustand-migration
scope: DEPENDENCY_MAPPING
version: 1.0.0
---

# Zustand Store Dependency Graph - January 2026

## Executive Summary

**Dependency Analysis**: Complete mapping of store-to-store dependencies
**Total Dependencies Mapped**: 5 cross-location dependencies
**Circular Dependencies**: 0 runtime cycles (1 type-level cycle, safe)
**Breaking Changes**: 3 critical paths identified for consolidation
**Migration Priority**: workspace-store → workspace types → conversation/quiz stores

**Critical Insight**: The codebase uses a **bridge pattern** via `infrastructure/persistence/stores/index.ts` to allow gradual migration without breaking changes. This creates temporary cross-imports that will be resolved once all stores are migrated to infrastructure.

---

## 1. Dependency Graph

### 1.1 Cross-Location Dependencies (infrastructure → lib/state)

| Source Store (infrastructure) | Target Store (lib/state) | Type | Usage | Lines |
|------------------------------|--------------------------|------|-------|-------|
| **provider-models-slice.ts** | workspace-store.ts | Runtime | `getState().currentWorkspace` | 1 |
| **agent-events-slice.ts** | workspace-store.ts | Runtime | `getState().currentWorkspace` | 3 |
| **use-app-store.ts** | dexie-storage.ts | Utility | `createDexieStorage()` | 1 |
| **agent-selection-store.ts** | dexie-storage.ts | Utility | `createDexieStorage()` | 1 |
| **session-snapshot-manager.ts** | ide-store.ts | Type | `IDEState` type only | 1 |

**Summary**: 5 imports (3 runtime, 1 utility, 1 type)

### 1.2 Reverse Dependencies (lib/state → infrastructure)

| Source Store (lib/state) | Target Store (infrastructure) | Type | Usage | Lines |
|--------------------------|-------------------------------|------|-------|-------|
| **conversation-store.ts** | conversation-threads-store.ts | Type | `ConversationThread` type only | 1 |
| **index.ts** | (entire infrastructure) | Re-export | Barrel export bridge | 1 |

**Summary**: 2 imports (2 type-level, safe)

### 1.3 Internal Dependencies (within infrastructure)

| Source Store | Target Store | Type | Usage |
|--------------|-------------|------|-------|
| **conversation-auto-restore.ts** | conversation-store.ts | Runtime | Auto-restore conversations |
| **provider-models-slice.ts** | cross-workspace-event-bus.ts | Runtime | Emit events |
| **agent-events-slice.ts** | cross-workspace-event-bus.ts | Runtime | Emit events |

**Summary**: 3 internal dependencies (all runtime, acceptable)

---

## 2. Circular Dependency Analysis

### 2.1 Type-Level Cycle (Safe)

```
lib/state/conversation-store.ts
    └── imports type { ConversationThread } from
        infrastructure/persistence/stores/conversation/conversation-threads-store.ts
```

**Status**: ✅ SAFE (type-only import, no runtime cycle)

**Explanation**: TypeScript type imports don't create runtime dependencies. This is a forward reference that resolves at compile time.

### 2.2 Runtime Dependencies (No Cycles)

```
infrastructure/stores/providers/provider-models-slice.ts
    └── useWorkspaceStore from '@/lib/state/workspace-store.ts'
        [NO RETURN IMPORT] ✅

infrastructure/stores/agents/slices/agent-events-slice.ts
    └── useWorkspaceStore from '@/lib/state/workspace-store.ts'
        [NO RETURN IMPORT] ✅
```

**Status**: ✅ SAFE (unidirectional dependency)

**Pattern**: Both files use `getState()` to read workspace state, but workspace-store doesn't import from agent or provider stores. This breaks any potential cycle.

### 2.3 Bridge Pattern (Temporary)

```
infrastructure/persistence/stores/index.ts
    ├── re-exports from '@/lib/state/ide-store'
    ├── re-exports from '@/lib/state/quiz-store'
    └── re-exports from './use-app-store', './agents/*', './conversation/*', etc.
```

**Status**: ⚠️ TEMPORARY (will be removed after migration)

**Purpose**: Provides single import location for components, allows gradual migration without breaking changes.

---

## 3. Dependency Visualization

### 3.1 Store Cluster Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│                    (src/presentation/)                          │
│                                                                 │
│  Components import from:                                        │
│  - @/infrastructure/persistence/stores (43 imports) ✅          │
│  - @/lib/state (59 imports) ⚠️ MIGRATE                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              BRIDGE LAYER (Barrel Exports)                      │
│                                                                 │
│  infrastructure/persistence/stores/index.ts                     │
│  ├── Re-exports from infrastructure stores (modern)            │
│  └── Re-exports from lib/state stores (legacy)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  MODERN LOCATION             │  │  LEGACY LOCATION             │
│  (infrastructure/stores/)     │  │  (lib/state/)                │
│                              │  │                              │
│  AGENTS DOMAIN               │  │  ┌────────────────────────┐ │
│  ├── agent-selection-store   │  │  │ workspace-store.ts ⭐  │ │
│  ├── agent-crud-slice        │  │  │ ide-store.ts           │ │
│  ├── agent-events-slice ─────┼──┼──┤ quiz-store.ts          │ │
│  ├── agent-validation-slice  │  │  │ conversation-store.ts  │ │
│  └── agent-utils-slice       │  │  │ knowledge-store.ts     │ │
│                              │  │  │ tool-permission-store  │ │
│  PROVIDERS DOMAIN             │  │  └────────────────────────┘ │
│  ├── provider-crud-slice     │  │                              │
│  ├── provider-models-slice ───┼──┘  ⬑ Import from workspace-store │
│  └── provider-utils-slice    │  │                              │
│                              │  │                              │
│  CONVERSATION DOMAIN          │  │                              │
│  ├── conversation-store      │  │                              │
│  ├── conversation-threads    │  │ ⬑ Type import from here ────┘
│  └── conversation-auto-restore│  │                              │
│                              │  │                              │
│  RAG DOMAIN                   │  │                              │
│  ├── rag-store               │  │                              │
│  └── [5 slices]               │  │                              │
│                              │  │                              │
│  UI STORES                    │  │                              │
│  ├── canvas-store            │  │                              │
│  ├── flashcard-store         │  │                              │
│  ├── study-store             │  │                              │
│  └── [other UI stores]        │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘

⭐ = CRITICAL DEPENDENCY (must migrate first)
```

### 3.2 Dependency Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CROSS-LOCATION DEPENDENCIES               │
└─────────────────────────────────────────────────────────────┘

1. WORKSPACE STATE DEPENDENCY (CRITICAL)
   ┌──────────────────────────────────────┐
   │ provider-models-slice.ts            │
   │ (infrastructure/stores/providers/)   │
   └──────────────┬───────────────────────┘
                  │
                  │ useWorkspaceStore.getState().currentWorkspace
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │ workspace-store.ts ⭐               │
   │ (lib/state/)                         │
   └──────────────────────────────────────┘

   ┌──────────────────────────────────────┐
   │ agent-events-slice.ts               │
   │ (infrastructure/stores/agents/)      │
   └──────────────┬───────────────────────┘
                  │
                  │ useWorkspaceStore.getState().currentWorkspace
                  │
                  ▼
   [Same workspace-store.ts]

2. TYPE-LEVEL DEPENDENCY (SAFE)
   ┌──────────────────────────────────────┐
   │ conversation-store.ts                │
   │ (lib/state/)                         │
   └──────────────┬───────────────────────┘
                  │
                  │ import type { ConversationThread }
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │ conversation-threads-store.ts        │
   │ (infrastructure/stores/conversation/) │
   └──────────────────────────────────────┘

3. BRIDGE EXPORT (TEMPORARY)
   ┌──────────────────────────────────────┐
   │ infrastructure/stores/index.ts       │
   └──────────────┬───────────────────────┘
                  │
                  │ export { ... } from '@/lib/state/ide-store'
                  │ export { ... } from '@/lib/state/quiz-store'
                  │
                  ▼
   ┌──────────────────────────────────────┐
   │ ide-store.ts, quiz-store.ts          │
   │ (lib/state/)                         │
   └──────────────────────────────────────┘
```

---

## 4. Migration Priority & Breaking Changes

### 4.1 Critical Path (Must Migrate First)

**Priority 1: workspace-store.ts** ⭐

**Why**: 2 infrastructure stores depend on it at runtime
- provider-models-slice.ts (1 usage)
- agent-events-slice.ts (3 usages)

**Migration Steps**:
1. Move `src/lib/state/workspace-store.ts` → `src/infrastructure/persistence/stores/workspace/`
2. Update imports in:
   - `infrastructure/stores/providers/provider-models-slice.ts`
   - `infrastructure/stores/agents/slices/agent-events-slice.ts`
3. Update bridge export in `infrastructure/stores/index.ts`
4. Test workspace switching
5. Test agent configuration
6. Test provider model fetching

**Breaking Changes**: 0 (internal change only)

**Estimated Time**: 1-2 hours

---

**Priority 2: ide-store.ts**

**Why**: Re-exported via bridge, used by 30+ components

**Migration Steps**:
1. Move `src/lib/state/ide-store.ts` → `src/infrastructure/persistence/stores/ide/`
2. Update imports in:
   - All presentation components (30+ files)
   - infrastructure/stores/index.ts
3. Test IDE layout
4. Test file explorer
5. Test terminal integration

**Breaking Changes**: 0 (bridge pattern handles compatibility)

**Estimated Time**: 2-3 hours

---

**Priority 3: quiz-store.ts**

**Why**: Re-exported via bridge, may duplicate study-store.ts

**Migration Steps**:
1. Compare with `infrastructure/stores/study-store.ts`
2. Determine if duplicate or complementary
3. If duplicate: migrate functionality → study-store.ts, delete quiz-store.ts
4. If complementary: move to infrastructure/stores/quiz/
5. Update all imports
6. Test quiz functionality

**Breaking Changes**: Potential data loss if duplicate not handled carefully

**Estimated Time**: 2-3 hours (requires careful analysis)

---

### 4.2 Secondary Path (After Critical Path)

**Priority 4: conversation-store.ts** (lib/state)

**Why**: Duplicate of conversation-threads-store.ts? Type-level dependency

**Migration Steps**:
1. Compare with infrastructure/conversation-store.ts
2. Determine canonical version
3. Migrate unique functionality
4. Update imports (25+ files)
5. Test chat flows

**Breaking Changes**: Medium (25 component imports)

**Estimated Time**: 3-4 hours

---

**Priority 5: knowledge-store.ts** (lib/state)

**Why**: Duplicate of rag-store.ts?

**Migration Steps**:
1. Compare with rag-store.ts
2. Determine overlap
3. Consolidate functionality
4. Update imports (15+ files)
5. Test RAG/knowledge features

**Breaking Changes**: Medium (15 component imports)

**Estimated Time**: 3-4 hours

---

**Priority 6: tool-permission-store.ts**

**Why**: Cycle 12 fix, working well in lib/state

**Migration Steps**: OPTIONAL - keep in lib/state or migrate to infrastructure

**Breaking Changes**: Low (8 component imports, well-tested)

**Estimated Time**: 1-2 hours

---

## 5. Consolidation Strategy

### 5.1 Three-Phase Approach

**Phase 1: Break Critical Dependencies** (3-5 hours)
1. Migrate workspace-store.ts → infrastructure/stores/workspace/
2. Update provider-models-slice.ts imports (local)
3. Update agent-events-slice.ts imports (local)
4. Remove cross-location dependency

**Phase 2: Migrate High-Impact Stores** (6-8 hours)
1. Migrate ide-store.ts → infrastructure/stores/ide/
2. Resolve quiz-store.ts vs study-store.ts duplication
3. Test IDE and quiz functionality

**Phase 3: Resolve Domain Duplicates** (6-8 hours)
1. Resolve conversation-store duplication
2. Resolve knowledge-store duplication
3. Migrate tool-permission-store (optional)
4. Clean up lib/state directory

**Total Estimated Time**: 15-21 hours

### 5.2 Safe Migration Pattern

**Pattern**: Bridge Export + Gradual Migration

```typescript
// Step 1: Move store to new location
// src/lib/state/workspace-store.ts → src/infrastructure/persistence/stores/workspace/workspace-store.ts

// Step 2: Update internal imports (within infrastructure)
// infrastructure/stores/providers/provider-models-slice.ts
- import { useWorkspaceStore } from '@/lib/state/workspace-store';
+ import { useWorkspaceStore } from '@/infrastructure/persistence/stores/workspace/workspace-store';

// Step 3: Update bridge export
// infrastructure/stores/index.ts
export {
  useWorkspaceStore,
  type WorkspaceState
} from '@/infrastructure/persistence/stores/workspace/workspace-store'; // Moved
// } from '@/lib/state/workspace-store'; // Old location

// Step 4: Update component imports (gradually)
// Components can still import from bridge:
import { useWorkspaceStore } from '@/infrastructure/persistence/stores'; // Works!

// Step 5: Delete old file after all imports updated
// rm src/lib/state/workspace-store.ts
```

**Benefits**:
- ✅ Zero breaking changes for components
- ✅ Gradual migration at comfortable pace
- ✅ Bridge export provides compatibility layer
- ✅ Can test incrementally

---

## 6. Validation Checklist

### Phase 2.2: Map Dependencies ✅ COMPLETE

- [x] Identify cross-location dependencies (infrastructure → lib/state)
- [x] Identify reverse dependencies (lib/state → infrastructure)
- [x] Map internal dependencies (within infrastructure)
- [x] Create dependency graph visualization
- [x] Analyze circular dependency risks
- [x] Identify breaking changes
- [x] Create consolidation strategy
- [x] Document migration priority

### Phase 2.3: Consolidate ⏳ READY

**Pre-Consolidation Checks**:
- [ ] Backup current state (git commit)
- [ ] Create feature branch: `feature/zustand-migration-phase-2`
- [ ] Verify test suite passes: `pnpm test`
- [ ] Verify TypeScript passes: `pnpm tsc --noEmit`

**Consolidation Steps**:
- [ ] **Step 1**: Migrate workspace-store.ts (Priority 1)
- [ ] **Step 2**: Migrate ide-store.ts (Priority 2)
- [ ] **Step 3**: Resolve quiz-store duplication (Priority 3)
- [ ] **Step 4**: Resolve conversation-store duplication (Priority 4)
- [ ] **Step 5**: Resolve knowledge-store duplication (Priority 5)
- [ ] **Step 6**: Clean up lib/state directory
- [ ] **Step 7**: Update all imports
- [ ] **Step 8**: Update documentation

**Post-Consolidation Validation**:
- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm tsc --noEmit`
- [ ] No import errors: `grep -r "from '@/lib/state'" src/presentation`
- [ ] Test all workflows (agent config, provider config, chat, quiz, RAG)
- [ ] Verify IndexedDB persistence works
- [ ] Verify cross-workspace events work
- [ ] Performance validation (no infinite loops)

---

## 7. Risk Assessment

### High Risk Dependencies

1. **workspace-store.ts** (P0)
   - **Risk**: 2 infrastructure stores depend on it at runtime
   - **Impact**: If migration breaks, agent/provider features fail
   - **Mitigation**: Migrate first, test thoroughly before proceeding

2. **quiz-store.ts vs study-store.ts** (P0)
   - **Risk**: Duplicate stores, unclear relationship
   - **Impact**: Data loss if consolidation not done carefully
   - **Mitigation**: Thorough analysis before migration, backup database

### Medium Risk Dependencies

3. **conversation-store.ts** (P1)
   - **Risk**: Duplicate of conversation-threads-store.ts
   - **Impact**: Chat history loss if merge incorrect
   - **Mitigation**: Side-by-side comparison, test chat flows

4. **knowledge-store.ts** (P1)
   - **Risk**: Duplicate of rag-store.ts
   - **Impact**: RAG index loss if merge incorrect
   - **Mitigation**: Verify data persistence, test RAG queries

### Low Risk Dependencies

5. **ide-store.ts** (P2)
   - **Risk**: Large import count (30+ components)
   - **Impact**: IDE layout breaks if migration fails
   - **Mitigation**: Bridge export maintains compatibility

6. **tool-permission-store.ts** (P3)
   - **Risk**: Low (Cycle 12 fix, working well)
   - **Impact**: Minimal
   - **Mitigation**: Optional migration, can keep in lib/state

---

## 8. Dependency Metrics

### Cross-Location Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total dependencies** | 7 | 100% |
| **Runtime dependencies** | 3 | 43% |
| **Utility imports** | 2 | 29% |
| **Type imports** | 2 | 29% |
| **Circular cycles** | 0 | 0% ✅ |

### Import Pattern Statistics

| Import Source | Count | From Infrastructure | From Legacy |
|---------------|-------|--------------------|-------------|
| **infrastructure → lib/state** | 5 | N/A | 5 |
| **lib/state → infrastructure** | 2 | 2 | N/A |
| **Total cross-imports** | 7 | 2 | 5 |

### Breaking Change Impact

| Store | Components Affected | Test Cases | Risk Level |
|-------|--------------------|------------|------------|
| workspace-store.ts | 20+ | ~5 | HIGH |
| ide-store.ts | 30+ | ~8 | MEDIUM |
| quiz-store.ts | 10+ | ~3 | HIGH* |
| conversation-store.ts | 25+ | ~6 | MEDIUM |
| knowledge-store.ts | 15+ | ~4 | MEDIUM |
| tool-permission-store.ts | 8+ | ~2 | LOW |

*High risk due to duplicate resolution complexity

---

## 9. Conclusion

### Current State

✅ **Phase 2.2 COMPLETE** - Dependency graph fully mapped

**Key Findings**:
- 7 cross-location dependencies (3 runtime, 2 utility, 2 type-level)
- 0 circular dependency cycles (excellent!)
- Bridge pattern enables safe, gradual migration
- 1 critical dependency: workspace-store.ts (blocks 2 infrastructure stores)

### Next Steps

1. **Phase 2.3**: Consolidate stores by domain
   - Priority 1: Migrate workspace-store.ts (1-2 hours)
   - Priority 2: Migrate ide-store.ts (2-3 hours)
   - Priority 3: Resolve quiz-store duplication (2-3 hours)
   - Priority 4-5: Resolve conversation/knowledge duplicates (6-8 hours)

2. **Phase 3**: Eliminate god stores (20-25 hours)
3. **Phase 4**: Final architecture alignment (8-12 hours)

### Estimated Timeline

- Phase 2.3: 15-21 hours (consolidation)
- Phase 3: 20-25 hours (god class elimination)
- Phase 4: 8-12 hours (architecture alignment)

**Total Remaining**: ~43-58 hours

---

**Generated**: 2026-01-01 20:00:00
**Author**: @bmad-bmm-dev (BMAD Framework)
**Status**: Phase 2.2 Complete, Phase 2.3 Ready to Begin
**Next**: Execute Phase 2.3 - Consolidate Stores (workspace-store first)
