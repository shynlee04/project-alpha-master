# Phase 0.2: Knowledge Workspace Migration - IMPLEMENTATION PLAN

**Date**: 2026-01-03
**Iteration**: 468
**Governance**: EPIC-CP-1, EPIC-6-3, EPIC-6-4
**Status**: READY FOR IMPLEMENTATION

---

## Current State Assessment

### Legacy Store Analysis
- **File**: `src/lib/state/knowledge-store.ts`
- **Size**: 718 lines (6x the 120-line standard)
- **Pattern**: Monolithic god store
- **Concerns**: 6 distinct domains mixed together

### Identified Domains (To Split into Slices)

1. **Source Management** (150 lines)
   - CRUD operations for knowledge sources
   - Source selection and deletion
   - Undo queue for deleted sources

2. **Collection Management** (100 lines)
   - Collection CRUD operations
   - Source-to-collection mapping
   - Collection filtering

3. **Metadata Extraction** (120 lines)
   - AI-powered metadata extraction
   - Metadata editing and updates
   - Processing status tracking

4. **Synthesis Operations** (150 lines)
   - Source synthesis orchestration
   - Synthesis result management
   - Synthesis status tracking

5. **UI State Management** (80 lines)
   - Preview panel state
   - Loading/error states
   - Hydration flag

6. **Helper Functions** (118 lines)
   - Duplicated update logic
   - State transformation helpers

### Consumers (10 files identified)

```bash
src/lib/canvas/linkage-analyzer.ts
src/presentation/components/knowledge/CollectionManager.tsx
src/presentation/components/knowledge/CollectionSelector.tsx
src/presentation/components/knowledge/MetadataEditor.tsx
src/presentation/components/knowledge/SourceCard.tsx
src/presentation/components/knowledge/SourceCardGrid.tsx
src/presentation/components/knowledge/SourceMetadataDialog.tsx
src/presentation/components/knowledge/SourcePreviewPanel.tsx
src/presentation/components/knowledge/SynthesisDialog.tsx
src/routes/knowledge.$projectId.lazy.tsx
```

---

## Target Architecture (December 2025 Zustand v5 Patterns)

### Slice Structure

```
src/infrastructure/persistence/stores/knowledge/
├── knowledge-types.ts          # Type definitions
├── knowledge-sources-slice.ts  # Source CRUD (<120 lines)
├── knowledge-collections-slice.ts  # Collections (<120 lines)
├── knowledge-metadata-slice.ts  # Metadata extraction (<120 lines)
├── knowledge-synthesis-slice.ts # Synthesis operations (<120 lines)
├── knowledge-ui-slice.ts        # UI state (<120 lines)
├── useKnowledgeStore.ts         # Unified store composition
└── index.ts                     # Barrel export
```

### Type Definitions

```typescript
// knowledge-types.ts

export interface KnowledgeSource {
  id: string;
  projectId: string;
  title: string;
  type: 'pdf' | 'url' | 'text' | 'image';
  content: string;
  wordCount?: number;
  charCount?: number;
  createdAt: Date;
  updatedAt: Date;
  lastOpened?: Date;
  deleted?: boolean;

  // Story 6-4: Metadata
  summary?: string;
  keyConcepts?: string[];
  suggestedQuestions?: string[];

  // Processing status
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
}

export interface KnowledgeCollection {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color?: string;
  sourceIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SynthesisResult {
  id: string;
  sourceId: string;
  projectId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  frontmatter?: {
    summary: string;
    keyPoints: string[];
    tags: string[];
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// State interfaces for each slice
export interface KnowledgeSourcesState {
  sources: Record<string, KnowledgeSource>;
  selectedSourceId: string | null;
  undoQueue: Array<{
    sourceId: string;
    source: KnowledgeSource;
    timestamp: number;
  }>;

  // Actions
  createSource: (input: CreateSourceInput) => string;
  updateSource: (sourceId: string, updates: Partial<KnowledgeSource>) => void;
  deleteSource: (sourceId: string) => void;
  selectSource: (sourceId: string | null) => void;
  undoDelete: (sourceId: string) => void;
  getSourcesForProject: (projectId: string) => KnowledgeSource[];
  getSelectedSource: () => KnowledgeSource | null;
}

export interface KnowledgeCollectionsState {
  collections: Record<string, KnowledgeCollection>;
  filteredCollectionId: string | null;

  // Actions
  createCollection: (name: string, projectId: string) => string;
  updateCollection: (collectionId: string, updates: Partial<KnowledgeCollection>) => void;
  deleteCollection: (collectionId: string) => void;
  addSourceToCollection: (sourceId: string, collectionId: string) => void;
  removeSourceFromCollection: (sourceId: string, collectionId: string) => void;
  filterByCollection: (collectionId: string | null) => void;
  getFilteredSources: (sources: Record<string, KnowledgeSource>) => KnowledgeSource[];
}

export interface KnowledgeMetadataState {
  extractingMetadata: Set<string>;

  // Actions
  extractMetadata: (sourceId: string) => Promise<void>;
  updateMetadata: (sourceId: string, metadata: Partial<KnowledgeSource>) => void;
  updateProcessingStatus: (sourceId: string, status: KnowledgeSource['processingStatus'], error?: string) => void;
}

export interface KnowledgeSynthesisState {
  synthesizingSources: Set<string>;
  synthesisResults: Record<string, SynthesisResult>;

  // Actions
  synthesizeSource: (sourceId: string) => Promise<void>;
  getSynthesisResult: (sourceId: string) => SynthesisResult | null;
}

export interface KnowledgeUIState {
  isPreviewOpen: boolean;
  loading: boolean;
  error: string | null;
  _hasHydrated?: boolean;

  // Actions
  openPreview: () => void;
  closePreview: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

---

## Implementation Steps

### Step 1: Create Modern Knowledge Store (3-4 hours)

**1.1 Create Type Definitions** (30 minutes)
```typescript
// src/infrastructure/persistence/stores/knowledge/knowledge-types.ts
```
- Define all core types (KnowledgeSource, KnowledgeCollection, SynthesisResult)
- Define state interfaces for each slice
- Define action interfaces

**1.2 Create Source Management Slice** (45 minutes)
```typescript
// knowledge-sources-slice.ts
```
- `createSource()` - generates ID, creates source
- `updateSource()` - updates source fields
- `deleteSource()` - soft delete with undo queue
- `selectSource()` - tracks selected source
- CRUD getters

**1.3 Create Collections Slice** (30 minutes)
```typescript
// knowledge-collections-slice.ts
```
- `createCollection()` - generates ID
- `updateCollection()` - updates collection
- `deleteCollection()` - removes collection
- `addSourceToCollection()` - maps source to collection
- `removeSourceFromCollection()` - unmaps source
- `filterByCollection()` - sets filter
- `getFilteredSources()` - computes filtered list

**1.4 Create Metadata Slice** (30 minutes)
```typescript
// knowledge-metadata-slice.ts
```
- `extractMetadata()` - orchestrates AI extraction
- `updateMetadata()` - user edits metadata
- `updateProcessingStatus()` - tracks status

**1.5 Create Synthesis Slice** (30 minutes)
```typescript
// knowledge-synthesis-slice.ts
```
- `synthesizeSource()` - orchestrates AI synthesis
- `getSynthesisResult()` - retrieves result

**1.6 Create UI Slice** (20 minutes)
```typescript
// knowledge-ui-slice.ts
```
- Preview panel state
- Loading/error state
- Hydration flag

**1.7 Compose Unified Store** (30 minutes)
```typescript
// useKnowledgeStore.ts
```
- Combine all 5 slices
- Add Dexie persist middleware
- Export convenience hooks

**1.8 Create Barrel Export** (5 minutes)
```typescript
// index.ts
```
- Export store and hooks
- Export all types

### Step 2: Migrate Knowledge Components (2-3 hours)

**2.1 Type Definition Updates** (15 minutes)
- `WorkspaceBindingDialog.types.ts` → already done in Phase 0.1

**2.2 Component Migrations** (2 hours)
Batch migrate using sed (same pattern as Phase 0.1):
- `CollectionManager.tsx`
- `CollectionSelector.tsx`
- `MetadataEditor.tsx`
- `SourceCard.tsx`
- `SourceCardGrid.tsx`
- `SourceMetadataDialog.tsx`
- `SourcePreviewPanel.tsx` → partially migrated in Phase 0.1
- `SynthesisDialog.tsx` → partially migrated in Phase 0.1
- `linkage-analyzer.ts`

**2.3 Route Migration** (15 minutes)
- `src/routes/knowledge.$projectId.lazy.tsx`

### Step 3: Verification & Testing (1 hour)

- TypeScript compilation check
- Verify all consumers migrated
- Test source CRUD operations
- Test collection operations
- Test metadata extraction flow
- Test synthesis flow

---

## Success Criteria

### Code Quality
- [ ] All slices <120 lines (excluding imports/comments)
- [ ] Zero TypeScript errors introduced
- [ ] No circular dependencies
- [ ] Full type safety (no `any` types)

### Functionality
- [ ] All source operations work (create, read, update, delete)
- [ ] All collection operations work (create, read, update, delete, filter)
- [ ] Metadata extraction functional
- [ ] Synthesis operations functional
- [ ] Undo/redo for source deletion working

### Migration Completeness
- [ ] All 10 consumers migrated
- [ ] Zero imports from legacy `lib/state/knowledge-store`
- [ ] Dexie persistence working
- [ ] UI state properly managed

---

## Estimated Effort

- **Step 1**: 3-4 hours (store creation)
- **Step 2**: 2-3 hours (component migration)
- **Step 3**: 1 hour (verification)

**Total**: 6-8 hours

---

## Dependencies

### External Libraries
- zustand (already installed)
- dexie (already installed)
- @orama/orama (for vector search)

### Internal Services
- `@/lib/knowledge/metadata-extractor`
- `@/lib/knowledge/synthesis-service`
- `@/lib/state/dexie-db`

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation**: Incremental migration, keep legacy store as facade during transition

### Risk 2: Type Mismatches with Dexie
**Mitigation**: Use proper TypeScript generics, validate with `pnpm tsc --noEmit`

### Risk 3: Performance Regression
**Mitigation**: Use memoization where appropriate, monitor with React DevTools Profiler

### Risk 4: Lost Undo Queue Functionality
**Mitigation**: Ensure undo queue properly persisted to IndexedDB

---

## Post-Migration Cleanup

1. **Delete Legacy Store** (after verification)
   ```bash
   rm src/lib/state/knowledge-store.ts
   ```

2. **Update Documentation**
   - Update AGENTS.md with new store structure
   - Update CLAUDE.md with knowledge workspace architecture

3. **Create Migration Guide**
   - Document before/after patterns
   - Provide examples for common operations

---

**Next Actions**:
1. Create `knowledge-types.ts` with all type definitions
2. Implement `knowledge-sources-slice.ts`
3. Implement remaining 4 slices
4. Compose unified store
5. Migrate components systematically

**Status**: ✅ READY FOR IMPLEMENTATION
