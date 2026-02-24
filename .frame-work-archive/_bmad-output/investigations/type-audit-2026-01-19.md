# Comprehensive Type Audit Report

**Date**: 2026-01-19
**Auditor**: Claude Code (analyst-ext)
**Scope**: All TypeScript type definitions in `src/` directory

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Type Definitions** | 470 |
| **Unique Type Names** | ~445 |
| **Duplicated Type Names** | ~25 |
| **Files Containing Types** | 85+ |

---

## Domain-by-Domain Analysis

### 1. Project Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `Project` | 1 | `src/domain/entities/project.ts:49` | No - Domain entity |
| `ProjectRecord` | 1 | `src/infrastructure/persistence/dexie-db-core-types.ts:42` | No - Persistence record |
| `ProjectCreateParams` | 1 | `src/domain/entities/project.ts:113` | No |
| `ProjectUpdateParams` | 1 | `src/domain/entities/project.ts:124` | No |
| `ProjectProps` | 0 | N/A | N/A |
| `ProjectConfig` | 0 | N/A | N/A |

**Analysis**: Domain entity (`Project`) and persistence record (`ProjectRecord`) are intentionally separate with different property sets. This is correct separation of concerns.

**Properties Comparison**:
```typescript
// Domain Project (src/domain/entities/project.ts:49)
interface Project {
  id: string;
  name: string;
  folderPath: string;
  storageType: 'indexeddb' | 'fsa';
  lastOpened: Date;
  createdAt: Date;
  autoSync: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  workspaceBindings: WorkspaceBindings;
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags: string[];
  deleted?: boolean;
  deletedAt?: Date;
  isTemp?: boolean;
  autoCreated?: boolean;
  isBrowserMode?: boolean;
}

// Persistence ProjectRecord (src/infrastructure/persistence/dexie-db-core-types.ts:42)
interface ProjectRecord {
  id: string;
  name: string;
  path: string;           // Different: "path" vs "folderPath"
  folderPath?: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // Extra field
  storageType?: 'indexeddb' | 'fsa';
  workspaceBindings?: WorkspaceBindings;
  bindings?: WorkspaceBindings | Record<string, string>; // Legacy
  lastOpened: Date;
  createdAt: Date;
  autoSync?: boolean;
  exclusionPatterns?: string[];
  layoutState?: { panelSizes?: number[]; openFiles?: string[]; activeFile?: string | null; };
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags?: string[];
  deleted?: boolean;
  deletedAt?: Date;
  isTemp?: boolean;
  autoCreated?: boolean;
  isBrowserMode?: boolean;
}
```

**Duplication Issues**: ✅ MINOR - Field naming inconsistency (`path` vs `folderPath`), legacy `bindings` field

---

### 2. Workspace Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `WorkspaceType` | 1 (but re-exported 4x) | `src/domain/value-objects/workspace-type.ts:31` | No - Single source |
| `WorkspaceBindings` | 1 (re-exported) | `src/domain/entities/project.ts:15` | No |
| `WorkspaceConfig` | 1 | `src/presentation/components/hub/ProjectPickerDialog.tsx:48` | ⚠️ PROPS ONLY |
| `WorkspaceState` | 1 | `src/domain/entities/workspace.ts:49` | No - Domain state |
| `WorkspaceConfig` | 1 | `src/domain/entities/workspace.ts:25` | **POTENTIAL CONFLICT** |
| `WorkspaceId` | 1 | `src/infrastructure/persistence/dexie-db-core-types.ts:24` | **SAME AS WorkspaceType** |

**CRITICAL DUPLICATION FOUND**:

```typescript
// Definition 1: Domain value object (src/domain/value-objects/workspace-type.ts:31)
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

// Definition 2: Persistence type (src/infrastructure/persistence/dexie-db-core-types.ts:24)
export type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';
```

**Properties Comparison**:
- `WorkspaceType` and `WorkspaceId` are **IDENTICAL** - should consolidate to single type

**WorkspaceConfig Conflict**:
```typescript
// Domain Config (src/domain/entities/workspace.ts:25)
interface WorkspaceConfig {
  type: WorkspaceType;
  isEnabled: boolean;
  label?: string;
  settings: Record<string, unknown>;
  created: Date;
  updated: Date;
}

// Presentation Config (src/presentation/components/hub/ProjectPickerDialog.tsx:48)
interface WorkspaceConfig {
  // Different purpose - UI props only
}
```
**Analysis**: Different purposes - domain vs UI props. Acceptable separation.

---

### 3. File Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `FileEntry` | 1 | `src/lib/notes/__tests__/mocks/mock-fsa-adapter.ts:21` | No - Mock only |
| `FileMetadata` | 1 | `src/infrastructure/persistence/dexie-db-session-types.ts` | No |
| `FileContent` | 1 | `src/infrastructure/filesystem/fs-types.ts` | No |
| `FileReadResult` | 1 | `src/infrastructure/filesystem/fs-types.ts:51` | No |
| `FileChangeEvent` | 2 | `src/presentation/components/ide/FileTree/__tests__/FileTree-fsa-integration.test.ts:336`, `src/lib/notes/__tests__/mocks/mock-fsa-adapter.ts:39` | ⚠️ BOTH IN TESTS |
| `FileHashEntry` | 2 | `src/infrastructure/filesystem/fsa-storage-adapter.ts:37`, `src/infrastructure/filesystem/idb-gateway.ts:46` | **DUPLICATE** |
| `FileSnapshotRecord` | 1 | `src/infrastructure/persistence/dexie-db-core-types.ts:125` | No |
| `FileContentCacheRecord` | 1 | `src/infrastructure/persistence/dexie-db-core-types.ts:143` | No |

**CRITICAL DUPLICATION FOUND**:

```typescript
// FileHashEntry in FSA adapter (src/infrastructure/filesystem/fsa-storage-adapter.ts:37)
interface FileHashEntry {
  path: string;
  hash: string;
  lastModified: number;
}

// FileHashEntry in IDB gateway (src/infrastructure/filesystem/idb-gateway.ts:46)
interface FileHashEntry {
  path: string;
  hash: string;
  lastModified: number;
}
```

**Properties Comparison**: Identical interfaces in `fsa-storage-adapter.ts` and `idb-gateway.ts`

---

### 4. Note Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `NoteRecord` | 2 | `src/infrastructure/persistence/dexie-db-knowledge-types.ts:176`, `src/lib/notes/types.ts:15` (re-export) | No - Same source |
| `NoteTreeNode` | 1 | `src/lib/notes/types.ts:25` | No |
| `NoteEditorState` | 1 | `src/lib/notes/types.ts:39` | No |
| `NoteMetadata` | 1 | `src/domain/services/note-gateway.ts:32` | No |
| `NoteContextMenuProps` | 1 | `src/presentation/components/notes/NoteContextMenu.tsx:33` | No - UI only |
| `NoteListItem` | 1 | `src/presentation/components/chat/NoteReferencePicker.tsx:35` | No - UI only |
| `NoteIndexerConfig` | 1 | `src/lib/notes/note-indexer.ts:43` | No |

**NoteRecord Comparison**:
```typescript
// Persistence record (src/infrastructure/persistence/dexie-db-knowledge-types.ts:176)
interface NoteRecord {
  id: string;
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  title: string;
  emoji?: string;
  blocks: unknown[];
  parentId?: string;
  isFavorite: boolean;
  order: number;
  isIndexed?: boolean;
  indexedAt?: number;
  createdAt: number;
  updatedAt: number;
}
```

**Analysis**: Well organized. Re-export pattern in `src/lib/notes/types.ts` is correct.

---

### 5. Study Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `Flashcard` | 1 | `src/domain/entities/study.ts:20` | No - Domain entity |
| `FlashcardRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:21` | No - Persistence |
| `FlashcardSetRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:37` | No |
| `Quiz` | 1 | `src/domain/entities/study.ts:66` | No - Domain entity |
| `QuizRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:87` | No - Persistence |
| `QuizQuestion` | 1 | `src/domain/entities/study.ts:50` | No - Domain value object |
| `QuizQuestionRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:103` | No - Persistence |
| `StudySession` | 1 | `src/domain/entities/study.ts:89` | No - Domain entity |
| `StudySessionRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:56` | No - Persistence |
| `StudyCardRecord` | 1 | `src/infrastructure/persistence/dexie-db-study-types.ts:71` | No |

**Flashcard Properties Comparison**:
```typescript
// Domain Flashcard (src/domain/entities/study.ts:20)
interface Flashcard {
  id: string;
  deckId: string;           // Different field name
  front: string;
  back: string;
  metadata: Record<string, unknown>;
  status: 'new' | 'learning' | 'review' | 'relearning';
  nextReview?: Date;
  interval: number;
  easeFactor: number;
  created: Date;
  updated: Date;
}

// Persistence FlashcardRecord (src/infrastructure/persistence/dexie-db-study-types.ts:21)
interface FlashcardRecord {
  id: string;
  workspaceId: string;      // Extra field
  projectId: string;
  question: string;          // Different: "question" vs "front"
  answer: string;            // Different: "answer" vs "back"
  difficulty: 'easy' | 'medium' | 'hard'; // Different SRS approach
  topic: string;
  sourceIds: string[];
  createdAt: number;
  updatedAt?: number;
}
```

**Analysis**: Significant schema differences - acceptable for different use cases (domain business logic vs persistence)

---

### 6. Knowledge/RAG Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `KnowledgeSource` | 1 | `src/domain/entities/knowledge.ts:21` | No - Domain entity |
| `SourceRecord` | 1 | `src/infrastructure/persistence/dexie-db-knowledge-types.ts:27` | No - Persistence |
| `KnowledgeNode` | 1 | `src/domain/entities/knowledge.ts:51` | No |
| `KnowledgeEdge` | 1 | `src/domain/entities/knowledge.ts:75` | No |
| `RagCollection` | 1 | `src/domain/entities/rag.ts:21` | No |
| `RagDocument` | 1 | `src/domain/entities/rag.ts:46` | No |
| `RagChunk` | 1 | `src/domain/entities/rag.ts:75` | No |
| `CollectionRecord` | 1 | `src/infrastructure/persistence/dexie-db-knowledge-types.ts:71` | **SAME AS RagCollection** |
| `OramaIndexRecord` | 1 | `src/infrastructure/persistence/dexie-db-knowledge-types.ts:115` | No |

**CRITICAL DUPLICATION FOUND**:

```typescript
// Domain RagCollection (src/domain/entities/rag.ts:21)
interface RagCollection {
  id: string;
  name: string;
  description?: string;
  created: Date;
  updated: Date;
  metadata: Record<string, unknown>;
}

// Persistence CollectionRecord (src/infrastructure/persistence/dexie-db-knowledge-types.ts:71)
interface CollectionRecord {
  id: string;
  projectId: string;          // Extra field
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes'; // Extra field
  name: string;
  sourceIds: string[];        // Extra field
  createdAt: number;          // Different naming
  updatedAt: number;          // Different naming
}
```

**Analysis**: Similar purpose but different schemas. Acceptable separation.

---

### 7. Agent Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `Agent` | 1 (class) | `src/domain/entities/agent.ts:112` | No - Domain entity |
| `AgentProps` | 1 | `src/domain/entities/agent.ts:33` | No |
| `AgentStatus` | 1 | `src/domain/entities/agent.ts:17` | No |
| `AgentConfigDialogProps` | 1 | `src/presentation/components/agent/AgentConfigDialog.tsx:64` | No - UI only |
| `AgentToolBinding` | 1 | `src/domain/value-objects/tool-permission.ts` | No |
| `WorkspaceBinding` | 1 | `src/domain/value-objects/workspace-binding.ts` | No |

**Analysis**: Well organized with proper domain/infrastructure separation.

---

### 8. Sync Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `SyncStatus` | 2 | `src/presentation/components/ide/SyncStatusPanel.tsx:40`, `src/lib/workspace/sync/types.ts` | **DUPLICATE** |
| `SyncResult` | 1 | `src/lib/notes/sync/cache-sync.ts:23` | No |
| `SyncStatusRecord` | 1 | `src/infrastructure/persistence/dexie-db-session-types.ts` | No |
| `FileChangeEvent` | 2 | Test files only | Test only |
| `SyncDirection` | 1 | `src/infrastructure/filesystem/markdown-sync-service.ts:70` | No |
| `ConflictResolution` | 2 | `src/lib/notes/sync/cache-sync.ts:60`, `src/lib/notes/sync/note-sync-layer.ts:23` | **DUPLICATE** |

**CRITICAL DUPLICATION FOUND**:

```typescript
// SyncStatus in UI (src/presentation/components/ide/SyncStatusPanel.tsx:40)
type SyncStatus = 'idle' | 'pending' | 'in-progress' | 'completed' | 'failed';

// SyncStatus in workspace (src/lib/workspace/sync/types.ts)
type SyncStatus = 'idle' | 'pending' | 'in-progress' | 'completed' | 'failed';
```

**SyncStatus Comparison**: Identical definitions in two locations

**ConflictResolution Comparison**:
```typescript
// Cache sync (src/lib/notes/sync/cache-sync.ts:60)
type ConflictResolution = 'keep-local' | 'keep-remote' | 'merge' | 'abort';

// Note sync layer (src/lib/notes/sync/note-sync-layer.ts:23)
type ConflictResolution = 'keep-local' | 'keep-remote' | 'merge';
```
**Analysis**: Minor difference (`abort` vs 3 options). Should consolidate.

---

### 9. Error Types

| Type Name | Definitions | Files | Should Consolidate |
|-----------|-------------|-------|-------------------|
| `FileSystemError` | 0 | N/A | N/A |
| `PermissionDeniedError` | 0 | N/A | N/A |
| `FileSystemError` | 1 | `src/infrastructure/filesystem/fs-errors.ts` | No |

**Analysis**: Few error types defined. Acceptable for now.

---

## Consolidated Findings Summary

### Priority P0 (Must Fix - Active Conflicts)

| Type | Locations | Issue |
|------|-----------|-------|
| `WorkspaceType` vs `WorkspaceId` | 2 | Identical type, should use single source |
| `SyncStatus` | 2 | Identical definition in 2 files |
| `ConflictResolution` | 2 | Slightly different definitions |

### Priority P1 (Should Consolidate - Cleanup)

| Type | Locations | Issue |
|------|-----------|-------|
| `FileHashEntry` | 2 | Identical interface in 2 adapter files |
| `CollectionRecord` vs `RagCollection` | 2 | Same concept, different schemas |
| `Project.path` vs `Project.folderPath` | 2 | Inconsistent field naming |

### Priority P2 (Can Defer - Acceptable)

| Type | Locations | Issue |
|------|-----------|-------|
| `WorkspaceConfig` | 2 | Different purposes (domain vs UI) |
| `Flashcard` vs `FlashcardRecord` | 2 | Different SRS approaches |
| `NoteRecord` re-exports | Multiple | Acceptable pattern |

---

## Type Count by Layer

| Layer | Type Count | Percentage |
|-------|-----------|------------|
| **Domain Entities** | ~50 | 10.6% |
| **Domain Value Objects** | ~20 | 4.3% |
| **Infrastructure Persistence** | ~120 | 25.5% |
| **Infrastructure Filesystem** | ~45 | 9.6% |
| **Lib/Notes** | ~80 | 17.0% |
| **Lib/Other** | ~55 | 11.7% |
| **Presentation/Components** | ~60 | 12.8% |
| **Presentation/Hooks** | ~40 | 8.5% |

---

## Recommendations

1. **Create canonical `WorkspaceType` in domain layer**, remove `WorkspaceId` duplicate
2. **Create canonical `SyncStatus` type** in sync infrastructure, remove duplicate
3. **Consolidate `FileHashEntry`** into shared filesystem types
4. **Standardize `ConflictResolution`** across sync implementations
5. **Document naming conventions** for field differences (path vs folderPath)
6. **Consider creating type barrel exports** for each domain

---

## Files Scanned

- `src/domain/entities/*.ts`
- `src/domain/value-objects/*.ts`
- `src/domain/types/*.ts`
- `src/infrastructure/persistence/**/*.ts`
- `src/infrastructure/filesystem/*.ts`
- `src/lib/notes/**/*.ts`
- `src/lib/**/*.ts`
- `src/presentation/components/**/*.tsx`
- `src/presentation/hooks/**/*.ts`
- `src/hooks/**/*.ts`

**Total files scanned**: ~150
**Total type definitions found**: 470

---

## Addendum: Missing/Broken Types Discovered

During the audit, the following import errors were detected indicating missing or improperly exported types:

### Files with Missing Type Imports

| File | Missing Module | Expected Type |
|------|---------------|---------------|
| `src/hooks/useQuizSession.ts` | `@/lib/study/quiz-types` | `QuizSettings`, `QuizSession` |
| `src/routes/api/quizzes/generate.ts` | `@/lib/study/quiz-generator` | Quiz generation types |
| `src/infrastructure/sync/workspace-services/study-sync/study-sync-service-core.ts` | `./study-sync-types` | Study sync types |
| `src/infrastructure/sync/workspace-services/study-sync/study-import-utils.ts` | `./study-sync-types` | Study sync types |
| `src/infrastructure/persistence/stores/study/quiz/quiz-db.ts` | `@/lib/study/quiz-types` | `QuizSettings` |

### Impact Assessment

These missing types indicate:
1. **Study/Quiz domain is incomplete** - Types defined but not exported or moved
2. **Sync infrastructure references non-existent types** - Study sync types need creation
3. **Quiz database layer broken** - Cannot import `QuizSettings` from expected location

### Recommended Actions

1. **Audit `@/lib/study/` directory** - Find or create `quiz-types.ts`
2. **Create `study-sync-types.ts`** in sync service directory
3. **Verify all study-related type exports** from barrel files
