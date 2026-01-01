# Phase 3 Implementation Plan: God Store Elimination

**Date**: 2026-01-02
**Phase**: 3 (Iterations 31-60)
**Focus**: P0 CRITICAL - God Store Splitting
**MCP Research Turns**: 5 ✅

---

## 📊 Research Summary (2025/2026 Best Practices)

### Zustand Official Recommendations
- **Source**: Zustand documentation (pmndrs/zustand)
- **Pattern**: Single global store split into logical slices
- **Method**: Each slice is a factory function: `(set, get) => ({ state, actions })`
- **Combination**: Object spreading: `...createSlice1(...a), ...createSlice2(...a)`
- **TypeScript**: Use `StateCreator` for type safety
- **Middleware**: Apply to combined store, not individual slices

### React Component Best Practices 2025/2026
- **Source**: Dev.to, Medium, StackOverflow research
- **God Component Definition**: >300 lines (our standard: 120 lines)
- **Extraction Strategy**: Custom hooks for logic, sub-components for UI
- **Single Responsibility**: Each module should have one clear purpose
- **Performance**: Small components enable better memoization

### Project-Specific Constraints
- **Max file size**: 120 lines (strict), 300 lines (hard limit)
- **No circular dependencies**: Check with `madge --circular`
- **Individual selectors only**: No destructuring Zustand hooks (v5 requirement)
- **December 2025 patterns**: Already implemented in ADR-001, ADR-002

---

## 🎯 Target God Stores

### Priority 1: rag-store.ts (1,595 lines - 13x over limit)

**Current Location**: `src/lib/state/rag-store.ts`
**Current Issues**:
- 1,595 lines (WORST god component in codebase)
- Manages ALL RAG state (sources, embeddings, chunks, search, retrieval, citations, synthesis, graph)
- Duplicated in multiple locations (30% duplication)
- No clear separation of concerns

**Target Architecture**: 8 Slices (~200 lines each)

| Slice | Purpose | Est. Lines | Dependencies |
|-------|---------|------------|--------------|
| **1. Embedding Management** | Generate/store embeddings | ~180 | None |
| **2. Chunking Strategies** | Document chunking logic | ~200 | Embedding |
| **3. Vector Search** | Semantic search | ~180 | Embedding, Chunking |
| **4. Retrieval Operations** | Fetch chunks | ~180 | Vector Search |
| **5. Citation Generation** | Create citations | ~150 | Retrieval |
| **6. Synthesis Pipeline** | Document synthesis | ~200 | All above |
| **7. Source Management** | Document sources | ~180 | None |
| **8. Knowledge Graph** | Graph CRUD/queries | ~200 | None |

**Total**: ~1,470 lines → 8 focused slices (all <300 lines)

---

### Priority 2: conversation-threads-store.ts (726 lines - 6x over limit)

**Current Location**: `src/infrastructure/persistence/stores/conversation/conversation-threads-store.ts`
**Current Issues**:
- 726 lines (6x over limit)
- Manages threads + messages + context + archive in one file
- Mixes concerns (CRUD, storage, context window, archive)
- Duplicated in `src/lib/state/conversation-store.ts` (626 lines)

**Target Architecture**: 5 Slices (~150 lines each)

| Slice | Purpose | Est. Lines | Dependencies |
|-------|---------|------------|--------------|
| **1. Thread CRUD** | Create/read/update/delete threads | ~150 | None |
| **2. Message Management** | Message CRUD, multimodal | ~180 | Thread CRUD |
| **3. Context Window** | Token counting, truncation | ~150 | Message Management |
| **4. Archive Management** | Archive/restore threads | ~120 | Thread CRUD |
| **5. Thread Metadata** | Search, filter, folders | ~120 | Thread CRUD |

**Total**: ~720 lines → 5 focused slices (all <200 lines)

---

## 📋 Implementation Checklist

### Pre-Splitting Preparation (Iteration 31)

- [ ] Run `tree` command to verify structure
- [ ] Check TypeScript errors baseline: `pnpm tsc --noEmit`
- [ ] Create backup of current stores (git commit)
- [ ] Verify tests pass: `pnpm test`
- [ ] Document all consumers of each store

**Safety Measures**:
- Never delete old stores until new ones validated
- Keep both old and new during migration
- Update imports incrementally
- Run tests after each slice creation

---

### Splitting Process (Iterations 32-40)

#### Step 1: Create Slice Structure (2 iterations)
- [ ] Create `src/lib/state/rag/slices/` directory
- [ ] Create `src/lib/state/conversation/slices/` directory
- [ ] Set up barrel exports (`index.ts`)

#### Step 2: Split rag-store.ts (4 iterations)
- [ ] Create slice 1: Embedding Management
- [ ] Create slice 2: Chunking Strategies
- [ ] Create slice 3: Vector Search
- [ ] Create slice 4: Retrieval Operations
- [ ] Create slice 5: Citation Generation
- [ ] Create slice 6: Synthesis Pipeline
- [ ] Create slice 7: Source Management
- [ ] Create slice 8: Knowledge Graph

#### Step 3: Split conversation-threads-store.ts (3 iterations)
- [ ] Create slice 1: Thread CRUD
- [ ] Create slice 2: Message Management
- [ ] Create slice 3: Context Window
- [ ] Create slice 4: Archive Management
- [ ] Create slice 5: Thread Metadata

#### Step 4: Create Combined Stores (2 iterations)
- [ ] Create `useRagStore.ts` combining 8 RAG slices
- [ ] Create `useConversationStore.ts` combining 5 conversation slices
- [ ] Apply persist middleware to combined stores
- [ ] Add TypeScript types

#### Step 5: Migration & Validation (3 iterations)
- [ ] Update all imports from old stores to new combined stores
- [ ] Run TypeScript validation: `pnpm tsc --noEmit`
- [ ] Run tests: `pnpm test`
- [ ] Verify dev server: `pnpm dev`
- [ ] Test all RAG functionality
- [ ] Test all conversation functionality

#### Step 6: Cleanup (1 iteration)
- [ ] Delete old god stores (rag-store.ts, conversation-threads-store.ts)
- [ ] Delete duplicate conversation-store.ts
- [ ] Run final validation
- [ ] Update documentation

---

## ⚠️ Risk Assessment

### HIGH RISK Areas

1. **Data Migration** (CRITICAL)
   - **Risk**: Breaking existing IndexedDB data
   - **Mitigation**: Use same persist key, maintain backward compatibility
   - **Validation**: Test data migration with devtools

2. **Import Updates** (MEDIUM)
   - **Risk**: Missing imports, breaking changes
   - **Mitigation**: Grep all consumers, update incrementally
   - **Validation**: TypeScript compilation

3. **Cross-Slice Dependencies** (MEDIUM)
   - **Risk**: Circular dependencies between slices
   - **Mitigation**: Use `get()` for cross-slice access, document dependencies
   - **Validation**: `madge --circular src/`

### LOW RISK Areas

- Test updates (existing tests should still pass)
- Type definitions (clear TypeScript types)
- Performance (slices pattern is performant)

---

## 🎯 Acceptance Criteria

### Per Store

**rag-store.ts Split**:
- [ ] 8 focused slices created (<300 lines each)
- [ ] Combined store works with persist middleware
- [ ] All RAG functionality working (embeddings, search, retrieval, citations, synthesis)
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] No circular dependencies
- [ ] Old god store deleted

**conversation-threads-store.ts Split**:
- [ ] 5 focused slices created (<200 lines each)
- [ ] Combined store works with persist middleware
- [ ] All conversation functionality working (threads, messages, context, archive)
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] No circular dependencies
- [ ] Old god stores deleted (2 files)

### Overall

- [ ] Total lines reduced: 2,321 → ~2,190 (5.6% reduction, better organization)
- [ ] God components eliminated: 2 down (15 remaining)
- [ ] No data loss in IndexedDB migration
- [ ] No breaking changes to consumer APIs
- [ ] Build succeeds: `pnpm build`
- [ ] Dev server works: `pnpm dev`

---

## 📁 File Structure (Target)

```
src/lib/state/
├── rag/
│   ├── slices/
│   │   ├── create-embedding-slice.ts
│   │   ├── create-chunking-slice.ts
│   │   ├── create-vector-search-slice.ts
│   │   ├── create-retrieval-slice.ts
│   │   ├── create-citation-slice.ts
│   │   ├── create-synthesis-slice.ts
│   │   ├── create-source-slice.ts
│   │   ├── create-graph-slice.ts
│   │   └── index.ts (barrel export)
│   └── useRagStore.ts (combined store)
├── conversation/
│   ├── slices/
│   │   ├── create-thread-crud-slice.ts
│   │   ├── create-message-slice.ts
│   │   ├── create-context-window-slice.ts
│   │   ├── create-archive-slice.ts
│   │   ├── create-metadata-slice.ts
│   │   └── index.ts (barrel export)
│   └── useConversationStore.ts (combined store)
```

---

## ⏱️ Estimated Timeline

- **Iteration 31**: Preparation and checklist
- **Iterations 32-35**: Split rag-store (4 iterations)
- **Iterations 36-38**: Split conversation store (3 iterations)
- **Iteration 39**: Create combined stores
- **Iteration 40**: Migration and validation
- **Iteration 41**: Cleanup and final validation

**Total**: 11 iterations (22-30 hours estimated)

---

## ✅ Completion Signal

When all acceptance criteria met:

```xml
<promise>God Stores Eliminated: rag-store.ts (1,595→8 slices), conversation-threads-store.ts (726→5 slices), all functionality working, zero data loss, zero TypeScript errors</promise>
```

---

**Next Steps**: Proceed with Iteration 31 - Pre-Splitting Preparation
