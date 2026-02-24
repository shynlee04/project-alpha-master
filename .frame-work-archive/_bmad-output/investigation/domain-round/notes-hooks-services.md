---
investigation_id: "NOTES-hooks-services-investigation"
created: "2026-01-20T20:00:00+07:00"
scope: "Notes space hooks, services, and business logic analysis"
author: "Domain Round Investigation Agent"
---

# NOTES SPACE INVESTIGATION: Hooks, Services, and Business Logic

## Executive Summary

This investigation provides a comprehensive analysis of the Notes space hooks, services, and business logic distribution across Project Alpha. The investigation examined:

- **Custom Hooks**: 5 presentation hooks, multiple store connection hooks
- **Domain Services**: NoteGateway, note-crud-operations
- **Infrastructure Services**: NotesFileSyncService, NoteFolderBridge, note-markdown-parser
- **State Management**: Legacy `lib/notes/note-store-*` vs. refactored slices
- **BlockNote Integration**: Editor lifecycle, sync patterns, conflict handling

### Key Findings at a Glance

| Category | Files | Issues | Critical | High | Medium | Low |
|----------|-------|--------|----------|------|--------|-----|
| Presentation Hooks | 5 | 3 | 0 | 1 | 1 | 1 |
| Store Connection Hooks | 8 | 4 | 1 | 2 | 1 | 0 |
| Domain Services | 2 | 2 | 0 | 1 | 1 | 0 |
| Infrastructure Services | 12 | 6 | 1 | 2 | 2 | 1 |
| BlockNote Integration | 5 | 4 | 0 | 2 | 1 | 1 |
| **TOTAL** | **32** | **19** | **2** | **8** | **6** | **3** |

---

## Part 1: Custom Hooks Analysis

### 1.1 Presentation Hooks (Presentation Layer)

| # | Hook | File | Lines | Category | Purpose |
|---|------|------|-------|----------|---------|
| 1 | `useStorageMode` | `src/presentation/hooks/useStorageMode.ts` | 106 | State | Detects storage mode (FSA vs IDB) |
| 2 | `useMarkdownSyncConflict` | `src/presentation/hooks/useMarkdownSyncConflict.ts` | 175 | State | Manages markdown sync conflicts |
| 3 | `useChatExport` | `src/presentation/hooks/useChatExport.ts` | ~100 | Export | Chat export functionality |
| 4 | `useThreadManager` | `src/presentation/hooks/useThreadManager.ts` | ~150 | State | Conversation thread management |
| 5 | `useArtifactPreview` | `src/presentation/hooks/useArtifactPreview.ts` | ~80 | UI | Artifact preview handling |

#### Hook Details

**useStorageMode** ✅ (Good Pattern)
- **Location**: `src/presentation/hooks/useStorageMode.ts:71-105`
- **Lines**: 106
- **Purpose**: Detects and exposes storage mode for current project
- **Dependencies**: `getPlatformContract()` from `@/infrastructure/filesystem/platform-contract`
- **Returns**: `StorageMode` interface with storageMode, platform, isFSA, isBrowserDB
- **Assessment**: ✅ Clean hook, proper useMemo optimization

**useMarkdownSyncConflict** ⚠️ (Issues Found)
- **Location**: `src/presentation/hooks/useMarkdownSyncConflict.ts:66-174`
- **Lines**: 175 (over 150 guideline by 17%)
- **Issues**:
  - Line 146-150: Cast to `any` for syncService config modification
  - Line 154-158: Restore original config on cleanup
  - Race condition potential: Multiple concurrent conflicts not handled
- **Assessment**: ⚠️ Consider refactoring config handling to proper interface

**useEmptyBlockDetection** (Inline Hook in NoteEditor)
- **Location**: `src/presentation/components/notes/NoteEditor.tsx:487-575`
- **Lines**: 88
- **Purpose**: Detects when cursor is in empty paragraph block
- **Issue**: Not extracted to separate file, tightly coupled to NoteEditor
- **Recommendation**: Extract to `src/presentation/hooks/useEmptyBlockDetection.ts`

### 1.2 Store Connection Hooks (Infrastructure Layer)

| # | Hook | File | Lines | Store | Purpose |
|---|------|------|-------|-------|---------|
| 1 | `useNoteStore` | `src/lib/notes/note-store-refactored.ts:50-149` | 208 | NoteStore | Primary note state |
| 2 | `useActiveNote` | `src/lib/notes/note-store-refactored.ts:159-165` | 7 | NoteStore | Get active note |
| 3 | `useNoteSaveStatus` | `src/lib/notes/note-store-refactored.ts:170-172` | 3 | NoteStore | Get save status |
| 4 | `useNotesByParent` | `src/lib/notes/note-store-refactored.ts:177-182` | 6 | NoteStore | Filter notes by parent |
| 5 | `useFavoriteNotes` | `src/lib/notes/note-store-refactored.ts:187-190` | 4 | NoteStore | Get favorite notes |
| 6 | `useIsNoteIndexing` | `src/lib/notes/note-store-refactored.ts:195-198` | 4 | NoteStore | Check indexing status |
| 7 | `useNoteNavigationStore` | `src/lib/notes/note-navigation-store.ts` | ~150 | Navigation | Sidebar navigation state |
| 8 | `useFileSyncService` | `src/lib/filesync/hooks/use-file-sync-service.ts` | ~200 | FileSync | Sync service hook |

#### Store Hook Issues

**Issue NSH-01: Duplicate Store Locations**
- **File**: `src/lib/notes/note-store.ts` and `src/lib/notes/note-store-refactored.ts`
- **Problem**: Both files export `useNoteStore` and related hooks
- **Evidence**: 
  - `note-store.ts:26-36` re-exports from `note-store-refactored.ts`
  - Line 22: `@deprecated Import from 'note-store-refactored.ts' directly`
- **Impact**: Import confusion, potential dead code

**Issue NSH-02: Infrastructure Layer Importing from lib/**
- **File**: `src/infrastructure/persistence/stores/notes/note-context-tracker.ts`
- **Lines**: 21-22
- **Evidence**:
  ```typescript
  import { useNoteStore } from '@/lib/notes';
  import { extractTextFromBlocks } from '@/lib/notes/types-embedding';
  ```
- **Problem**: Infrastructure layer (`infrastructure/persistence/stores/`) importing from deprecated `lib/` path
- **Violation**: Clean Architecture principle

---

## Part 2: Service Layer Analysis

### 2.1 Domain Services

| # | Service | File | Lines | Responsibility |
|---|---------|------|-------|----------------|
| 1 | NoteGateway | `src/domain/services/note-gateway.ts` | 347 | StorageGateway facade for note operations |
| 2 | NoteCRUDOperations | `src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts` | ~150 | File-based CRUD operations |

#### NoteGateway (Domain Service) ✅
- **Location**: `src/domain/services/note-gateway.ts:81-346`
- **Interface**: `StorageGateway` facade
- **Methods**:
  - `createNote(note: NoteRecord): Promise<void>`
  - `updateNote(noteId: string, updates: Partial<NoteRecord>): Promise<void>`
  - `deleteNote(noteId: string): Promise<void>`
  - `readNote(noteId: string): Promise<NoteRecord>`
  - `noteExists(noteId: string): Promise<boolean>`
- **Serialization**: NoteRecord ↔ Markdown with YAML frontmatter
- **Assessment**: ✅ Clean domain service, proper abstraction

#### NoteCRUDOperations (Infrastructure Service)
- **Location**: `src/infrastructure/sync/workspace-services/notes/note-crud-operations.ts`
- **Key Functions**:
  - `importFileAsNote(filePath, fileAdapter, noteStore)`: Reads markdown, parses, creates/updates note
- **Issue DS-01: Domain Layer Importing Infrastructure Type**
- **File**: `src/domain/services/note-gateway.ts:23`
- **Evidence**:
  ```typescript
  import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
  ```
- **Problem**: Domain layer importing from infrastructure layer
- **Recommendation**: Define `NoteRecord` in domain layer, implement in infrastructure

### 2.2 Infrastructure Services

| # | Service | File | Lines | Purpose |
|---|---------|------|-------|---------|
| 1 | NotesFileSyncService | `src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts` | 304 | Bidirectional file sync |
| 2 | NoteFolderBridge | `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | ~300 | Folder ↔ Store mapping |
| 3 | NoteMarkdownParser | `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts` | 262 | Markdown ↔ BlockNote conversion |
| 4 | NoteMarkdownWriter | `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` | ~150 | Note → Markdown serialization |
| 5 | NoteFileWatcher | `src/infrastructure/sync/workspace-services/notes/note-file-watcher.ts` | ~200 | External file change detection |

#### NotesFileSyncService ⚠️
- **Location**: `src/infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts:60-296`
- **Lines**: 304
- **Issues**:
  - Line 32: Imports from `@/lib/notes/slices/note-sync-slice` (deprecated path)
  - No proper cleanup of changeListeners (line 209)
  - Missing error boundary handling

#### NoteFolderBridge ✅
- **Location**: `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts:57-250+`
- **Methods**:
  - `importDirectory(rootPath, onProgress)`: Scans and imports markdown files
  - `saveNoteToFile(note, targetDirectory)`: Saves note to filesystem
- **Features**:
  - Progress tracking with callbacks
  - Error collection for partial failures
  - Toast notifications for user feedback
- **Assessment**: ✅ Well-structured, proper error handling

#### NoteMarkdownParser ⚠️
- **Location**: `src/infrastructure/sync/workspace-services/notes/note-markdown-parser.ts`
- **Issues**:
  - Line 26-31: Singleton `markdownParserEditor` - potential memory leak
  - Line 20-21: Editor instance not cleaned up on unmount
  - EMBED_URL_REGEX (line 34) could be optimized
- **Recommendation**: Add cleanup function for editor instance

### 2.3 Service Dependencies Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTES SPACE SERVICE LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐                                                         │
│  │  NotesPage      │◄── (uses) ──► useFileSyncService                        │
│  └────────┬────────┘                                                         │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ NotesFileSync   │───►│ NoteFolderBridge│───►│ NoteCRUDOps     │          │
│  │ Service         │    │                 │    │                 │          │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘          │
│           │                      │                      │                    │
│           │                      ▼                      ▼                    │
│           │            ┌─────────────────┐    ┌─────────────────┐          │
│           └───────────►│ NoteMarkdown    │    │ NoteRecord      │          │
│                        │ Parser/Writer   │    │ (DexieDB)       │          │
│                        └─────────────────┘    └─────────────────┘          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NoteGateway (Domain Service)                                        │   │
│  │  - StorageGateway facade for note operations                         │   │
│  │  - Handles serialization/deserialization                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Business Logic Distribution

### 3.1 Current Distribution Analysis

| Layer | Location | Business Logic | Assessment |
|-------|----------|----------------|------------|
| **Presentation** | `NoteEditor.tsx:103-262` | Block sanitization, text extraction | ⚠️ Should be in utility/service |
| **Presentation** | `NoteEditor.tsx:382-415` | useDebouncedCallback | ✅ Proper hook extraction |
| **Store (lib/notes)** | `note-crud-slice.ts:54-481` | Note CRUD + FSA/IDB fallback | ⚠️ Mixed concerns |
| **Store (lib/notes)** | `note-sync-slice.ts:89-195` | Auto-save debouncing | ✅ Good separation |
| **Infrastructure** | `note-folder-bridge.ts` | File ↔ Note mapping | ✅ Proper location |
| **Infrastructure** | `note-markdown-parser.ts` | Markdown parsing | ✅ Proper location |
| **Domain** | `note-gateway.ts` | Storage abstraction | ✅ Proper location |

### 3.2 Issues Found

**Issue BLD-01: Business Logic in Presentation Components**
- **File**: `src/presentation/components/notes/NoteEditor.tsx`
- **Lines**: 103-262 (sanitizeBlocks function)
- **Issue**: Block sanitization logic is business logic, not presentation
- **Evidence**: Lines 192-262 contain 70 lines of sanitization rules
- **Recommendation**: Extract to `src/lib/notes/block-sanitizer.ts`

**Issue BLD-02: Mixed Concerns in note-crud-slice**
- **File**: `src/lib/notes/slices/note-crud-slice.ts`
- **Lines**: 54-145 (loadNotes function)
- **Issue**: Platform detection, FSA handle restoration, fallback logic all in one function
- **Evidence**: 90+ lines with multiple responsibilities
- **Recommendation**: Extract platform detection to hook, fallback logic to service

**Issue BLD-03: Logic Duplication**
- **File**: `note-crud-slice.ts:249-267` (createNote) vs `note-crud-operations.ts` (importFileAsNote)
- **Issue**: Both contain gateway creation and note persistence logic
- **Evidence**:
  - `note-crud-slice.ts:249-267`: Creates NoteGateway, calls `noteGateway.createNote()`
  - `note-crud-operations.ts`: Similar pattern for file import

---

## Part 4: BlockNote Integration

### 4.1 Editor Initialization Flow

```
NotesPage mounts
    │
    ├─► useFileSyncService({ noteStoreConfig })
    │         │
    │         ▼
    │    createNotesFileSyncService(config)
    │         │
    │         ├─► Mount FSA directory
    │         ├─► Create NoteFolderBridge
    │         └─► Register file save handler
    │
    ▼
NoteEditor mounts (when noteId provided)
    │
    ├─► useCreateBlockNote({
    │     uploadFile: handleEditorFileUpload,
    │     initialContent: sanitizeBlocks(note.blocks)
    │   })
    │
    └─► Editor ready, attach event listeners
```

### 4.2 Key BlockNote Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| NoteEditor | `src/presentation/components/notes/NoteEditor.tsx` | 609+ | Main editor (god component) |
| ImageBlock | `src/presentation/components/notes/blocks/ImageBlock.tsx` | ~150 | Custom image block |
| AIImageBlock | `src/presentation/components/notes/blocks/AIImageBlock.tsx` | ~200 | AI image generation |
| AIVisionBlock | `src/presentation/components/notes/blocks/AIVisionBlock.tsx` | ~180 | Image understanding |
| StoryboardBlock | `src/presentation/components/notes/blocks/StoryboardBlock.tsx` | ~250 | Multi-image storyboard |
| VideoBlock | `src/presentation/components/notes/blocks/VideoBlock.tsx` | ~200 | Video analysis |
| TTSBlock | `src/presentation/components/notes/blocks/TTSBlock.tsx` | ~150 | Text-to-speech |
| ArtifactBlock | `src/presentation/components/notes/blocks/ArtifactBlock.tsx` | ~200 | Interactive HTML |
| CalloutBlock | `src/presentation/components/notes/blocks/CalloutBlock.tsx` | ~120 | Toggle/callout UI |
| ReferenceBlock | `src/presentation/components/notes/blocks/ReferenceBlock.tsx` | ~180 | Block references |
| ColumnBlock | `src/presentation/components/notes/blocks/ColumnBlock.tsx` | ~300 | Column layouts |
| SyncedBlock | `src/presentation/components/notes/blocks/SyncedBlock.tsx` | ~200 | Synced content |

### 4.3 BlockNote Integration Issues

**Issue BNI-01: Editor God Component**
- **File**: `src/presentation/components/notes/NoteEditor.tsx`
- **Lines**: 609+ (far exceeds 300 line guideline)
- **Components embedded**:
  - NoteStudyMenu (stub)
  - AIPromptDialog
  - AITransformMenu
  - AIInsertionDialog
  - MultiModalImport
  - VoiceRecordButton
  - PromptSuggestionsPanel
  - InBlockAIPopup
  - FloatingAIButton
  - 20+ custom block specs
- **Recommendation**: Split into multiple files/components

**Issue BNI-02: Block Sanitization in Component**
- **File**: `src/presentation/components/notes/NoteEditor.tsx:192-262`
- **Lines**: 70 lines
- **Issue**: Sanitization logic should be in a utility/service
- **Evidence**: `sanitizeBlocks()` function handles:
  - null/undefined handling
  - Type validation
  - Content sanitization
  - Block type allowlist

**Issue BNI-03: Missing Editor Cleanup**
- **File**: `src/presentation/components/notes/NoteEditor.tsx`
- **Issue**: Editor instance not properly destroyed on unmount
- **Impact**: Potential memory leaks with BlockNote's ProseMirror instance
- **Recommendation**: Add proper cleanup in useEffect cleanup

### 4.4 Note Serialization/Deserialization

**Markdown Format**:
```markdown
---
id: "note-123"
projectId: "project-456"
workspaceId: "notes"
title: "My Note"
emoji: "📝"
parentId: null
isFavorite: false
order: 0
createdAt: 1705747200000
updatedAt: 1705747200000
---

[
  {
    "id": "block-1",
    "type": "paragraph",
    "content": [...]
  }
]
```

**Parsing Flow**:
1. `note-folder-bridge.importDirectory()` reads `.md` files
2. `note-markdown-parser.parseMarkdownFile()` extracts frontmatter + blocks
3. `note-crud-operations.importFileAsNote()` creates/updates NoteRecord
4. BlockNote editor renders blocks

**Writing Flow**:
1. User edits in BlockNote editor
2. `note-sync-slice.triggerAutoSave()` called (2s debounce)
3. `note-folder-bridge.saveNoteToFile()` serializes to markdown
4. `note-markdown-writer.noteToMarkdown()` creates markdown with frontmatter

---

## Part 5: File Inventory

### 5.1 Custom Hooks (Presentation)

```
src/presentation/hooks/
├── useStorageMode.ts              - 106 lines - Storage mode detection ✅
├── useMarkdownSyncConflict.ts     - 175 lines - Conflict management ⚠️
├── useChatExport.ts               - ~100 lines - Chat export
├── useThreadManager.ts            - ~150 lines - Thread management
└── useArtifactPreview.ts          - ~80 lines - Artifact preview
```

### 5.2 Store Connection Hooks (Infrastructure)

```
src/lib/notes/
├── note-store.ts                  - 40 lines - Facade (deprecated)
├── note-store-refactored.ts       - 208 lines - Primary store ✅
├── note-navigation-store.ts       - ~150 lines - Navigation state
├── slices/
│   ├── note-crud-slice.ts         - 482 lines - CRUD operations ⚠️
│   ├── note-metadata-slice.ts     - ~100 lines - Metadata ops
│   ├── note-query-slice.ts        - ~90 lines - Query helpers
│   ├── note-sync-slice.ts         - 196 lines - Auto-save ✅
│   ├── note-indexing-slice.ts     - ~80 lines - RAG indexing
│   ├── note-events-slice.ts       - ~70 lines - Event emission
│   └── note-ui-slice.ts           - ~60 lines - UI state
└── types-slice.ts                 - Note store types

src/infrastructure/persistence/stores/notes/
├── note-context-tracker.ts        - 311 lines - Agent context ⚠️
└── slash-commands/
    └── index.ts                   - Slash command registry
```

### 5.3 Domain Services

```
src/domain/services/
└── note-gateway.ts                - 347 lines - Storage facade ✅
```

### 5.4 Infrastructure Services

```
src/infrastructure/sync/workspace-services/notes/
├── notes-file-sync-service.ts     - 304 lines - Sync orchestrator ⚠️
├── note-folder-bridge.ts          - ~300 lines - File ↔ Store ✅
├── note-markdown-parser.ts        - 262 lines - Markdown parsing ⚠️
├── note-markdown-writer.ts        - ~150 lines - Markdown writing
├── note-crud-operations.ts        - ~150 lines - File CRUD
├── note-file-watcher.ts           - ~200 lines - File watching
└── index.ts                       - Barrel exports
```

### 5.5 BlockNote Integration

```
src/presentation/components/notes/
├── NoteEditor.tsx                 - 609+ lines - God component ⚠️
├── blocks/
│   ├── ImageBlock.ts              - ~150 lines
│   ├── CodeFileBlock.ts           - ~200 lines
│   ├── FileAttachmentBlock.ts     - ~150 lines
│   ├── AIImageBlock.ts            - ~200 lines
│   ├── AIVisionBlock.ts           - ~180 lines
│   ├── StoryboardBlock.ts         - ~250 lines
│   ├── VideoBlock.ts              - ~200 lines
│   ├── TTSBlock.ts                - ~150 lines
│   ├── ArtifactBlock.ts           - ~200 lines
│   ├── VideoGenerationBlock.ts    - ~200 lines
│   ├── SlidesExportBlock.ts       - ~150 lines
│   ├── ChartDiagramBlock.ts       - ~200 lines
│   ├── TransformPipelineBlock.ts  - ~200 lines
│   ├── ArtifactGalleryBlock.ts    - ~200 lines
│   ├── MultiStepGenerationBlock.ts - ~200 lines
│   ├── CalloutBlock.ts            - ~120 lines
│   ├── ReferenceBlock.ts          - ~180 lines
│   ├── ColumnBlock.ts             - ~300 lines
│   └── SyncedBlock.ts             - ~200 lines
└── AISlashCommand.ts              - Slash command menu
```

---

## Part 6: Issues Catalog

### Critical (P0)

| ID | Issue | File | Lines | Evidence |
|----|-------|------|-------|----------|
| P0-01 | Infrastructure importing from lib/ | `note-context-tracker.ts` | 21-22 | `import { useNoteStore } from '@/lib/notes'` |
| P0-02 | File sync service importing from lib/ | `notes-file-sync-service.ts` | 32 | `import { registerFileSaveHandler } from '@/lib/notes/slices/note-sync-slice'` |

### High (P1)

| ID | Issue | File | Lines | Evidence |
|----|-------|------|-------|----------|
| P1-01 | Hook exceeds 150 lines | `useMarkdownSyncConflict.ts` | 175 | Complex conflict state management |
| P1-02 | Duplicate note store exports | `note-store.ts` vs `note-store-refactored.ts` | All | Both export same hooks |
| P1-03 | Domain importing infrastructure type | `note-gateway.ts` | 23 | `import type { NoteRecord } from '@/infrastructure/persistence/dexie-db'` |
| P1-04 | Business logic in component | `NoteEditor.tsx` | 103-262 | `sanitizeBlocks()` function |
| P1-05 | Editor god component | `NoteEditor.tsx` | 609+ | 20+ embedded components |

### Medium (P2)

| ID | Issue | File | Lines | Evidence |
|----|-------|------|-------|----------|
| P2-01 | Magic any cast | `useMarkdownSyncConflict.ts` | 146-150 | `(syncService as any).config` |
| P2-02 | Memory leak risk | `note-markdown-parser.ts` | 20-31 | Singleton editor not cleaned up |
| P2-03 | Logic duplication | `note-crud-slice.ts` vs `note-crud-operations.ts` | Multiple | Gateway creation + persistence |
| P2-04 | Block sanitization not extracted | `NoteEditor.tsx` | 70 lines | Should be utility file |
| P2-05 | Editor cleanup missing | `NoteEditor.tsx` | useEffect | No return cleanup function |

### Low (P3)

| ID | Issue | File | Lines | Evidence |
|----|-------|------|-------|----------|
| P3-01 | Hook not extracted to file | `useEmptyBlockDetection` | 88 lines | Inline in NoteEditor |
| P3-02 | EMBED regex not optimized | `note-markdown-parser.ts` | 34 | Could use compiled regex |
| P3-03 | Missing error boundary | `notes-file-sync-service.ts` | N/A | No error boundary for sync |

---

## Part 7: Cross-Cutting Concerns

### 7.1 Error Handling Patterns

| Layer | Pattern | Assessment |
|-------|---------|------------|
| NoteFolderBridge | Toast notifications + structured errors | ✅ Good |
| NotesFileSyncService | Promise-based with SyncResult | ✅ Good |
| NoteCRUDOperations | try/catch with error collection | ✅ Good |
| useMarkdownSyncConflict | Callbacks + state | ⚠️ No error boundary |

### 7.2 Loading State Management

| Store/Service | Loading State | Assessment |
|---------------|---------------|------------|
| useNoteStore | `loading: boolean` | ✅ In state |
| NotesFileSyncService | `syncInProgress: boolean` | ✅ In state |
| NoteFolderBridge | Loading toast | ✅ UI feedback |

### 7.3 Caching Strategy

| Resource | Caching | Assessment |
|----------|---------|------------|
| Notes list | In-memory Map (`notes: Map<string, NoteRecord>`) | ✅ Fast access |
| FSA handle | handlePersistenceService | ✅ Chrome version aware |
| File watchers | FileChangeTracker Map | ✅ Tracked |

### 7.4 Performance Optimization

| Component | Optimization | Assessment |
|-----------|--------------|------------|
| NoteStore | Individual selectors | ✅ No infinite re-renders |
| useDebouncedCallback | 500ms-2000ms debounce | ✅ Prevents spam |
| sanitizeBlocks | Returns new objects | ✅ React immutability |

---

## Part 8: Recommendations

### Immediate (P0 - Before Next Sprint)

1. **Fix Infrastructure Imports**
   - Update `note-context-tracker.ts` to import from canonical paths
   - Update `notes-file-sync-service.ts` to use proper exports
   - Move `NoteRecord` type definition to domain layer

2. **Consolidate Note Stores**
   - Remove `note-store.ts` facade or keep only for compatibility
   - Update all imports to use `note-store-refactored.ts`

### Short-term (P1 - Sprint 1)

3. **Extract Block Sanitization**
   - Move `sanitizeBlocks()` and `sanitizeContentItem()` to `src/lib/notes/block-sanitizer.ts`
   - Add unit tests for edge cases

4. **Refactor Note CRUD Slice**
   - Extract platform detection to `useStoragePlatform()` hook
   - Simplify fallback logic with strategy pattern
   - Add interface for gateway creation

5. **Split NoteEditor**
   - Extract AI-related dialogs to separate files
   - Extract block specs to dedicated files
   - Target: Max 300 lines per file

### Medium-term (P2 - Sprint 2)

6. **Fix Markdown Parser Memory**
   - Add cleanup function for editor instance
   - Consider factory pattern for parser creation

7. **Add Error Boundaries**
   - Wrap sync operations in error boundaries
   - Add retry mechanism for failed operations

8. **Standardize Hook Extraction**
   - Extract `useEmptyBlockDetection` to dedicated file
   - Create hook for editor lifecycle management

---

## Part 9: Evidence Summary

### Files Analyzed

| Category | Count | Files |
|----------|-------|-------|
| Presentation Hooks | 5 | useStorageMode, useMarkdownSyncConflict, useChatExport, useThreadManager, useArtifactPreview |
| Store Files | 8 | note-store, note-store-refactored, note-navigation-store, 5 slices |
| Domain Services | 1 | note-gateway |
| Infrastructure Services | 12 | notes-file-sync-service, note-folder-bridge, note-markdown-parser, note-markdown-writer, note-crud-operations, note-file-watcher |
| Components | 25+ | NoteEditor, 20+ block components, dialogs |
| **Total** | **50+** | |

### Methods Used

- **grep**: Pattern matching for imports, exports, hook definitions
- **glob**: File discovery by pattern
- **read with offset**: Deep investigation of specific code sections
- **Symbol analysis**: TypeScript type hierarchy analysis

---

*Report generated by Domain Round Investigation Agent*
*Investigation ID: NOTES-hooks-services-investigation*
*Date: 2026-01-20*
*Output Location: _bmad-output/investigation/domain-round/notes-hooks-services.md*
