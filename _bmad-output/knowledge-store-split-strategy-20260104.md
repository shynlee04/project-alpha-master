# Knowledge Store Split Strategy

**File**: `src/lib/state/knowledge-store.ts`
**Current Size**: 718 lines (6x over 120-line limit!)
**Target**: Split into 6 focused slices (≤120 lines each)
**Date**: 2026-01-04 00:50:00

---

## 📊 Current State Analysis

### Responsibilities Identified

The knowledge store has **6 distinct functional areas**:

1. **Source CRUD** (150 lines)
   - Load sources for project
   - Select source
   - Delete source (with undo)
   - Rename source
   - Update source metadata

2. **Preview Management** (50 lines)
   - Open preview panel
   - Close preview panel
   - Toggle preview state

3. **Collection Management** (120 lines)
   - Load collections
   - Create collection
   - Update collection
   - Delete collection
   - Add/remove source from collection
   - Filter by collection

4. **Metadata Extraction** (150 lines)
   - Extract metadata using AI
   - Update metadata with user corrections
   - Update processing status
   - Track extraction state

5. **Synthesis** (100 lines)
   - Synthesize source using AI
   - Load synthesis result
   - Track synthesis state

6. **Undo Queue** (80 lines)
   - Manage deleted sources
   - Undo delete functionality
   - Auto-cleanup old entries

### Dependencies

**External Dependencies**:
- `dexie-db` - IndexedDB operations
- `metadata-extractor` - AI metadata extraction
- `SynthesisService` - AI synthesis service

**Internal Dependencies**:
- All slices access `sources` array
- Some slices access `selectedSource`
- Metadata and synthesis slices track processing state

---

## 🎯 Split Strategy

### Target Architecture

```
src/lib/state/knowledge/
├── index.ts (barrel export)
├── types.ts (shared types - move from store)
├── slices/
│   ├── knowledge-source-crud-slice.ts (120 lines) ✅
│   ├── knowledge-preview-slice.ts (60 lines) ✅
│   ├── knowledge-collection-slice.ts (120 lines) ✅
│   ├── knowledge-metadata-slice.ts (110 lines) ✅
│   ├── knowledge-synthesis-slice.ts (100 lines) ✅
│   └── knowledge-undo-slice.ts (80 lines) ✅
└── knowledge-store.ts (main store - combines slices, 80 lines)
```

### Slice Breakdown

#### 1. knowledge-source-crud-slice.ts (120 lines)

**Responsibility**: Source CRUD operations

**State**:
```typescript
interface SourceCrudState {
    sources: SourceRecord[];
    selectedSource: SourceRecord | null;
    loading: boolean;
    error: string | null;
}
```

**Actions**:
```typescript
- loadSources(projectId: string): Promise<void>
- selectSource(source: SourceRecord | null): void
- deleteSource(sourceId: string): Promise<void>
- renameSource(sourceId: string, newName: string): Promise<void>
- updateSourceMetadata(sourceId: string, metadata: SourceMetadata): Promise<void>
```

**Validation**: ✅ Will fit in 120 lines

---

#### 2. knowledge-preview-slice.ts (60 lines)

**Responsibility**: Preview panel state

**State**:
```typescript
interface PreviewState {
    isPreviewOpen: boolean;
}
```

**Actions**:
```typescript
- openPreview(source: SourceRecord): void
- closePreview(): void
```

**Validation**: ✅ Will fit in 60 lines (well under limit)

---

#### 3. knowledge-collection-slice.ts (120 lines)

**Responsibility**: Collection management

**State**:
```typescript
interface CollectionState {
    collections: CollectionRecord[];
    filteredCollectionId: string | null;
}
```

**Actions**:
```typescript
- loadCollections(projectId: string): Promise<void>
- createCollection(name: string): Promise<void>
- updateCollection(collectionId: string, updates: Partial<CollectionRecord>): Promise<void>
- deleteCollection(collectionId: string): Promise<void>
- addSourceToCollection(sourceId: string, collectionId: string): Promise<void>
- removeSourceFromCollection(sourceId: string, collectionId: string): Promise<void>
- filterByCollection(collectionId: string | null): void
```

**Validation**: ✅ Will fit in 120 lines

---

#### 4. knowledge-metadata-slice.ts (110 lines)

**Responsibility**: AI metadata extraction and updates

**State**:
```typescript
interface MetadataState {
    extractingMetadata: Set<string>;
}
```

**Actions**:
```typescript
- extractMetadata(sourceId: string): Promise<void>
- updateMetadata(sourceId: string, metadata: SourceMetadataFields): Promise<void>
- updateProcessingStatus(sourceId: string, status: ProcessingStatus, error?: string): Promise<void>
```

**Validation**: ✅ Will fit in 110 lines

---

#### 5. knowledge-synthesis-slice.ts (100 lines)

**Responsibility**: AI synthesis functionality

**State**:
```typescript
interface SynthesisState {
    synthesizingSources: Set<string>;
    synthesisResults: Map<string, SynthesisResultRecord>;
}
```

**Actions**:
```typescript
- synthesizeSource(sourceId: string): Promise<void>
- loadSynthesisResult(sourceId: string): Promise<void>
```

**Validation**: ✅ Will fit in 100 lines

---

#### 6. knowledge-undo-slice.ts (80 lines)

**Responsibility**: Undo functionality for deleted sources

**State**:
```typescript
interface UndoState {
    undoQueue: DeletedSource[];
}
```

**Actions**:
```typescript
- addToUndoQueue(sourceId: string, source: SourceRecord): void
- undoDelete(sourceId: string): Promise<void>
- cleanupOldEntries(): void
```

**Validation**: ✅ Will fit in 80 lines

---

#### 7. knowledge-store.ts (Main Store - 80 lines)

**Responsibility**: Combine all slices, add persistence

**Structure**:
```typescript
export const useKnowledgeStore = create<KnowledgeStoreState>()(
    persist(
        (...args) => ({
            // Combine all slices
            ...createSourceCrudSlice(...args),
            ...createPreviewSlice(...args),
            ...createCollectionSlice(...args),
            ...createMetadataSlice(...args),
            ...createSynthesisSlice(...args),
            ...createUndoSlice(...args),

            // Common actions
            setHasHydrated: (state: boolean) => void,
            reset: () => void,
        }),
        {
            name: 'knowledge-store',
            storage: createDexieStorage('knowledgeStore'),
            partialize: (state) => ({
                sources: state.sources,
                collections: state.collections,
                selectedSource: state.selectedSource,
                isPreviewOpen: state.isPreviewOpen,
                // Don't persist loading, error, or transient state
            }),
        }
    )
);
```

**Validation**: ✅ Will fit in 80 lines

---

## 🔄 Migration Strategy

### Phase 1: Create Slice Files (2-3 hours)

1. **Create `src/lib/state/knowledge/` directory**
2. **Create `types.ts`** - Extract shared types
3. **Create 6 slice files** - Implement focused slices
4. **Write unit tests** - 10 tests per slice
5. **Validate** - All slices ≤120 lines

### Phase 2: Create Main Store (1 hour)

1. **Create `knowledge-store.ts`** - Combine all slices
2. **Add persistence** - Configure Dexie adapter
3. **Test** - All functionality preserved

### Phase 3: Migrate Consumers (2 hours)

1. **Identify consumers** - Search for `useKnowledgeStore`
2. **Create facade** - Re-export from old location
3. **Update imports** - Migrate to new location
4. **Test** - All consumers working

### Phase 4: Cleanup (30 minutes)

1. **Delete old store** - Remove 718-line file
2. **Update tests** - Fix import paths
3. **Validate** - Zero breaking changes
4. **Commit** - `refactor(knowledge-store): Split into 6 focused slices`

---

## ✅ Acceptance Criteria

### Code Quality

- [ ] All 6 slice files created
- [ ] All slices ≤120 lines (strict limit)
- [ ] Main store ≤80 lines
- [ ] Zero circular dependencies
- [ ] TypeScript strict mode (no `any`)

### Functionality

- [ ] All existing features preserved
- [ ] All tests passing (100% pass rate)
- [ ] No breaking API changes
- [ ] Facade exports created (backwards compatible)

### Test Coverage

- [ ] Unit tests for each slice (≥80% coverage)
- [ ] Integration tests (slice interactions)
- [ ] Consumer tests (migration validation)

### Documentation

- [ ] Slice responsibilities documented
- [ ] Migration guide created
- [ ] API documentation updated
- [ ] Epic tracking updated

---

## 📊 Expected Impact

### Before Split

**File**: `src/lib/state/knowledge-store.ts`
- **Lines**: 718
- **Responsibilities**: 6 (mixed)
- **Testability**: Difficult (god store)
- **Maintainability**: Poor (hard to understand)

### After Split

**Files**: 7 focused files
- **Lines per file**: 60-120 (target met ✅)
- **Responsibilities per file**: 1 (single-purpose ✅)
- **Testability**: Excellent (focused slices)
- **Maintainability**: Excellent (clear separation)

### Health Score Impact

- **Current**: 6.8/10
- **After knowledge-store split**: 7.0/10 (+0.2)
- **After all 8 god stores split**: 8.8/10 (+2.0 target) ✅

---

## 🚀 Next Actions

1. ✅ **Create split strategy document** (THIS FILE)
2. ⏳ **Create directory structure** (`src/lib/state/knowledge/`)
3. ⏳ **Extract types to `types.ts`**
4. ⏳ **Create slice 1**: `knowledge-source-crud-slice.ts`
5. ⏳ **Create slice 2**: `knowledge-preview-slice.ts`
6. ⏳ **Create slice 3**: `knowledge-collection-slice.ts`
7. ⏳ **Create slice 4**: `knowledge-metadata-slice.ts`
8. ⏳ **Create slice 5**: `knowledge-synthesis-slice.ts`
9. ⏳ **Create slice 6**: `knowledge-undo-slice.ts`
10. ⏳ **Create main store**: `knowledge-store.ts`
11. ⏳ **Write tests** (6 test files, 10 tests each)
12. ⏳ **Migrate consumers**
13. ⏳ **Delete old store**
14. ⏳ **Validate and commit**

---

**Generated by**: BMAD Master Agent
**Mode**: Ralph Loop Recursive Auto-Execution
**Iteration**: 1146 (Foundation First)
**Timestamp**: 2026-01-04 00:50:00

**Status**: 🟡 STRATEGY DOCUMENTED
**Next**: Create directory structure and start slicing
**Estimated Time**: 4-6 hours total
