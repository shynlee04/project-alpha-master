---
investigation_id: "NOTES-PERSISTENCE-INVESTIGATION"
created: "2026-01-20T21:00:00+07:00"
scope: 
  - "Notes space persistence layer investigation"
  - "Storage gateway implementation analysis"
  - "FSA and Dexie adapter audit"
  - "BlockNote sync strategy documentation"
  - "State persistence mechanism review"
---

# Notes Space Persistence Layer Investigation Report

## Executive Summary

This investigation provides a comprehensive analysis of the Notes space persistence layer for Project Alpha. The investigation covers storage gateway implementations, file operations, BlockNote sync strategies, and state persistence mechanisms. The findings reveal a well-architected system with some areas requiring attention, particularly around duplicate adapter implementations and missing Dexie adapter consistency.

### Key Findings at a Glance

| Category | Files Analyzed | Issues Found | Critical (P0) | High (P1) | Medium (P2) |
|----------|---------------|--------------|---------------|-----------|-------------|
| Storage Gateway | 8 | 3 | 1 | 1 | 1 |
| Handle Persistence | 3 | 1 | 0 | 1 | 0 |
| Note Gateway | 2 | 2 | 0 | 1 | 1 |
| Dexie DB | 15 | 2 | 0 | 1 | 1 |
| Note Store | 12 | 4 | 0 | 2 | 2 |
| Sync Layer | 8 | 3 | 0 | 2 | 1 |
| **TOTAL** | **48** | **15** | **1** | **8** | **6** |

---

## Part 1: Persistence Layer Architecture

### 1.1 Storage Gateway Implementation

The storage gateway layer provides a unified abstraction for file operations across different storage backends.

#### Storage Gateway Interface

**File**: `src/domain/interfaces/storage-gateway.interface.ts` (246 lines)

The interface defines the core operations for file I/O:

```typescript
export interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): WatchHandle;
  rename(oldPath: string, newPath: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
}

export interface StorageGatewayFactory {
  create(storageType: 'fsa' | 'indexeddb'): StorageGateway;
}
```

**Status**: ✅ Well-defined interface with clear separation of concerns.

#### FSAGateway Implementation

**File**: `src/infrastructure/filesystem/fsa-gateway.ts` (817 lines)

Implements StorageGateway using File System Access API for desktop users.

**Key Features**:
- File watching via FileSystemObserver (Chrome 129+) or polling fallback
- Handle persistence integration
- Content hashing for change detection
- Debounced change emission (300ms default)

**Critical Issue - DUPLICATE ADAPTER**:
```
Line 673-711: FSAGateway (817 lines)
↳ Overlapping functionality with FSAStorageAdapter (673 lines)
```

Both implement similar file I/O operations with different naming conventions:
- `FSAGateway` uses `StorageGateway` interface (canonical)
- `FSAStorageAdapter` uses `StorageAdapter` interface (deprecated)

**Recommendation**: Consolidate to single implementation using `FSAGateway` as canonical.

#### IDBGateway Implementation

**File**: `src/infrastructure/filesystem/idb-gateway.ts` (457 lines)

Implements StorageGateway using IndexedDB for mobile/tablet users.

**Key Features**:
- Files stored in `idbFiles` table with compound key `[projectId, path]`
- Polling-based file watching (no native IDB watching)
- Content hashing for change detection

**Status**: ✅ Properly implemented for mobile storage.

#### Storage Gateway Factory

**File**: `src/infrastructure/filesystem/storage-gateway-factory.ts` (235 lines)

Creates appropriate gateway based on platform contract:

```typescript
export function createStorageGateway(
  platform: { storageType: StorageType },
  options: { directoryHandle?: FileSystemDirectoryHandle; projectId?: string; }
): StorageGateway {
  return storageGatewayFactory.createFromPlatform(platform, options);
}
```

**Status**: ✅ Factory pattern correctly implemented.

---

### 1.2 Handle Persistence Service

**File**: `src/infrastructure/filesystem/handle-persistence.ts` (599 lines)

Manages FileSystemDirectoryHandle persistence without DataCloneError.

**Chrome Version-Aware Logic**:
- Chrome 129+: Uses `structuredClone()` to store actual handle in IDB
- Chrome 122-128: Uses persistent permissions with silent restore
- Pre-Chrome 122: Stores metadata only, requires user prompt

**Key Methods**:
```typescript
class HandlePersistenceService {
  async persistHandle(projectId, handle, workspaceId): Promise<void>
  async restoreHandle(projectId): Promise<HandleRestoreResult>
  async deleteHandle(projectId): Promise<void>
  async updatePermissionStatus(projectId, status): Promise<void>
  async getPermissionStatus(projectId): Promise<HandlePermissionState>
  async clearAll(): Promise<void>
  async getAllValidHandles(): Promise<FSAHandleRecord[]>
}
```

**Issue Found**:
```
Line 182-211: persistHandle
↳ Uses `structuredClone()` which may fail on some browsers
↳ No try-catch fallback to metadata-only storage
```

**Recommendation**: Add graceful fallback if structuredClone fails.

---

### 1.3 Platform Contract

**File**: `src/infrastructure/filesystem/platform-contract.ts` (342 lines)

**ARC-A01**: Single source of truth for platform capabilities.

```typescript
export interface PlatformContract {
  readonly deviceType: 'desktop' | 'mobile' | 'tablet';
  readonly storageType: 'fsa' | 'indexeddb';
  readonly canAccessFSA: boolean;
  readonly canWatchFiles: boolean;
  readonly canRunTerminal: boolean;
  readonly canDoAgenticCoding: boolean;
  readonly canAccessIDE: boolean;
}
```

**Status**: ✅ Well-implemented, cached singleton.

---

## Part 2: Note Gateway Service

### 2.1 NoteGateway Implementation

**File**: `src/domain/services/note-gateway.ts` (347 lines)

Wraps StorageGateway for note-specific CRUD operations.

**Key Features**:
- NoteRecord ↔ Markdown serialization with YAML frontmatter
- Format: `/notes/{noteId}.md`
- Frontmatter includes: id, projectId, workspaceId, title, emoji, parentId, isFavorite, order, createdAt, updatedAt

**Serialization Format**:
```markdown
---
id: "note_abc123"
projectId: "proj_xyz789"
workspaceId: "notes"
title: "My Note"
createdAt: 1701234567890
updatedAt: 1701234567890
---

{"type":"paragraph","content":[...]}
```

**Issue Found - Cross-Layer Violation**:
```
Line 23: import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
↳ Domain service importing from infrastructure layer
↳ Violates Clean Architecture principles
```

**Recommendation**: Move NoteRecord type to domain layer or create domain interface.

### 2.2 Note CRUD Operations

**File**: `src/lib/notes/slices/note-crud-slice.ts` (482 lines)

Core CRUD operations for notes with platform-aware storage selection.

**Load Notes Flow** (Lines 54-150):
```
loadNotes(projectId)
  ├─ Get platform contract
  ├─ If FSA:
  │   ├─ restoreHandle(projectId)
  │   ├─ createStorageGateway()
  │   ├─ gateway.list('/notes')
  │   └─ gateway.read() each note
  └─ If IndexedDB:
      └─ db.notes.where('projectId').equals(projectId)
```

**BUG-013 FIX - Complex Fallback Logic** (Lines 54-145):
```typescript
let useIndexedDB = platform.storageType === 'indexeddb';

if (platform.storageType === 'fsa') {
  const restoreResult = await restoreHandle(projectId);
  const mountedHandle = restoreResult.handle ?? undefined;

  if (!mountedHandle) {
    // BUG-013 FIX: No handle available - fall back to IndexedDB
    console.warn('[NoteStore-CRUD] FSA handle not available - falling back to IndexedDB');
    useIndexedDB = true;
  }
}
```

**Status**: ⚠️ Works but adds technical debt with complex fallback logic.

---

## Part 3: Dexie Database Layer

### 3.1 Database Configuration

**File**: `src/infrastructure/persistence/dexie-db.ts`

Exports `ViaGentDatabase` class with notes table:

```typescript
class ViaGentDatabase extends Dexie {
  notes: NotesTable;  // NoteRecord type
  // ... other tables
}
```

**Notes Table Type** (from `dexie-db-knowledge-types.ts`):
```typescript
type NotesTable = Table<NoteRecord, string, NoteRecord>;
```

### 3.2 NoteRecord Type

**Location**: `src/infrastructure/persistence/dexie-db-knowledge-types.ts`

```typescript
interface NoteRecord {
  id: string;
  projectId: string;
  workspaceId: 'notes' | 'ide' | 'knowledge' | 'study';
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

### 3.3 Dexie Storage Adapter

**File**: `src/infrastructure/persistence/dexie-storage.ts` (237 lines)

Implements Zustand StateStorage interface using Dexie.

**Key Features**:
- Quota management (90% threshold)
- Automatic cleanup when storage is full
- Retry mechanism after cleanup

**Status**: ✅ Well-implemented with quota handling.

---

## Part 4: Note Store Architecture

### 4.1 Store Composition

**File**: `src/lib/notes/note-store-refactored.ts` (208 lines)

Unified note store composed of 7 focused slices:

| Slice | Lines | Purpose |
|-------|-------|---------|
| `note-ui-slice.ts` | 26 | Active note, loading, error |
| `note-query-slice.ts` | 38 | Search, filter, helpers |
| `note-events-slice.ts` | 81 | Event emission |
| `note-indexing-slice.ts` | 127 | RAG background indexing |
| `note-sync-slice.ts` | 107 | Auto-save, file sync |
| `note-metadata-slice.ts` | 137 | Favorite, move, ordering |
| `note-crud-slice.ts` | 442 | CRUD operations |

**Persistence Strategy**:
```typescript
persist(
  (...args) => ({ ...slices... }),
  {
    name: 'note-state',
    storage: createJSONStorage(() => createDexieStorage('conversationState')),
    partialize: (state) => ({
      activeNoteId: state.activeNoteId,
      currentProjectId: state.currentProjectId,
    }),
  }
)
```

**Issue - Incomplete Persistence**:
```
Lines 126-129: partialize only stores activeNoteId and currentProjectId
↳ Full notes stored in Dexie 'notes' table (not via Zustand persist)
↳ This is intentional but not well-documented
```

### 4.2 Store Issues

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| Facade Pattern | `note-store.ts` (40 lines) | P2 | Backward compatibility facade |
| Location Inconsistency | `lib/notes/` | P1 | Should be in `infrastructure/persistence/stores/notes/` |
| Duplicate Export | `note-store.ts` & `note-store-refactored.ts` | P2 | Both export same functionality |
| Complex Fallback | `note-crud-slice.ts:54-145` | P1 | BUG-013 FIX adds complexity |

---

## Part 5: BlockNote Sync Strategy

### 5.1 Markdown Conversion

**File**: `src/lib/notes/markdown-converter.ts` (575 lines)

Converts between BlockNote blocks and Markdown format.

**Supported Block Types**:
- heading (H1-H6)
- paragraph
- bulletListItem
- numberedListItem
- checkListItem
- codeBlock
- quote
- image
- file
- divider
- table

**Issue - Incomplete Block Support**:
```
Lines 46-97: blockToMarkdown
↳ Missing: callout, alert, card, nested structures
↳ Some blocks use `as unknown as Block` type assertions
```

### 5.2 Note Markdown Writer

**File**: `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` (117 lines)

Simpler markdown conversion for sync operations.

**Status**: ✅ Focused implementation for sync use case.

### 5.3 File Watching

**File**: `src/infrastructure/sync/workspace-services/notes/note-file-watcher.ts` (165 lines)

Polling-based file watching for external changes.

**Implementation**:
```typescript
export function setupFileWatcher(
  dependencies: FileWatcherDependencies,
  onFilesChanged: (trackers: Map<string, FileChangeTracker>) => void,
  watchInterval: number = 3000
): () => void {
  const fileWatchTimer = setInterval(() => {
    detectFileChanges(dependencies, fileChangeTrackers)
      .then(updatedTrackers => { ... })
  }, watchInterval);
  
  return () => clearInterval(fileWatchTimer);
}
```

**Issue - Polling Overhead**:
```
Line 142: Default watchInterval is 3000ms
↳ May be too frequent for large note collections
↳ No adaptive polling based on activity level
```

### 5.4 Note Folder Bridge

**File**: `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` (302 lines)

Handles mapping between filesystem and Notes store.

**Key Methods**:
```typescript
class NoteFolderBridge {
  async importDirectory(rootPath, onProgress): Promise<ImportResult>
  async saveNoteToFile(note, targetDirectory): Promise<SaveResult>
  private generateNoteFilePath(note, targetDirectory): string
}
```

**File Path Generation** (Lines 290-299):
```
Format: {title}-{id}.md
↳ Title sanitized: lowercase, special chars → hyphens
↳ ID truncated to 8 characters
```

**Example**: `my-note-title-abc12345.md`

---

## Part 6: File Inventory

### 6.1 Storage Gateway Files

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `src/domain/interfaces/storage-gateway.interface.ts` | 246 | ✅ Canonical | Interface definition |
| `src/infrastructure/filesystem/fsa-gateway.ts` | 817 | ✅ Canonical | FSA implementation |
| `src/infrastructure/filesystem/idb-gateway.ts` | 457 | ✅ Canonical | IDB implementation |
| `src/infrastructure/filesystem/storage-gateway-factory.ts` | 235 | ✅ Canonical | Factory pattern |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | 673 | ⚠️ Duplicate | Overlaps with FSAGateway |

### 6.2 Handle Persistence Files

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `src/infrastructure/filesystem/handle-persistence.ts` | 599 | ✅ Working | Chrome version-aware |
| `src/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers.ts` | - | ✅ Supporting | DB helpers |

### 6.3 Note Gateway Files

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `src/domain/services/note-gateway.ts` | 347 | ⚠️ Issue | Cross-layer import (line 23) |
| `src/lib/notes/slices/note-crud-slice.ts` | 482 | ⚠️ Issue | Complex fallback logic |

### 6.4 State Persistence Files

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `src/infrastructure/persistence/dexie-db.ts` | 150+ | ✅ Canonical | Database class |
| `src/infrastructure/persistence/dexie-storage.ts` | 237 | ✅ Working | Quota handling |
| `src/lib/notes/note-store-refactored.ts` | 208 | ⚠️ Location | Should be in infrastructure |
| `src/lib/notes/note-store.ts` | 40 | ⚠️ Facade | Backward compat only |

### 6.5 Sync Service Files

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `src/infrastructure/sync/workspace-services/notes/note-folder-bridge.ts` | 302 | ✅ Working | Import/export |
| `src/infrastructure/sync/workspace-services/notes/note-file-watcher.ts` | 165 | ⚠️ Polling | 3000ms interval |
| `src/lib/notes/markdown-converter.ts` | 575 | ⚠️ Incomplete | Missing block types |
| `src/lib/notes/sync/note-sync-layer.ts` | 234 | ✅ Working | Orchestration |
| `src/lib/notes/sync/cache-sync.ts` | 282 | ✅ Working | Bidirectional sync |

---

## Part 7: Issues Catalog

### P0 - Critical

| # | File | Lines | Issue | Evidence |
|---|------|-------|-------|----------|
| 1 | `src/infrastructure/filesystem/fsa-storage-adapter.ts` | 673 | Duplicate adapter | Overlaps with `fsa-gateway.ts` (817 lines) - both implement similar file I/O |

### P1 - High

| # | File | Lines | Issue | Evidence |
|---|------|-------|-------|----------|
| 2 | `src/domain/services/note-gateway.ts` | 23 | Cross-layer import | Imports `NoteRecord` from `@/infrastructure/persistence/dexie-db` |
| 3 | `src/lib/notes/note-store-refactored.ts` | 208 | Wrong location | Lives in `lib/notes/` instead of `infrastructure/persistence/stores/notes/` |
| 4 | `src/infrastructure/filesystem/handle-persistence.ts` | 182-211 | No structuredClone fallback | `structuredClone()` may fail without graceful degradation |
| 5 | `src/lib/notes/slices/note-crud-slice.ts` | 54-145 | Complex fallback | BUG-013 FIX with nested if/else logic |
| 6 | `src/lib/notes/markdown-converter.ts` | 46-97 | Incomplete blocks | Missing callout, alert, card, nested structures |
| 7 | `src/infrastructure/sync/workspace-services/notes/note-file-watcher.ts` | 142 | Inflexible polling | Fixed 3000ms interval, no adaptive behavior |
| 8 | `src/infrastructure/persistence/stores/notes/` | N/A | Missing directory | Note store should be in canonical location |

### P2 - Medium

| # | File | Lines | Issue | Evidence |
|---|------|-------|-------|----------|
| 9 | `src/lib/notes/note-store.ts` | 40 | Facade pattern | Maintains backward compat, exports from refactored |
| 10 | `src/lib/notes/markdown-converter.ts` | Various | Type assertions | Uses `as unknown as Block` in multiple places |
| 11 | `src/lib/notes/sync/cache-sync.ts` | 204 | Sync logic | `syncHistory` pushes without size limit |
| 12 | `src/infrastructure/sync/workspace-services/notes/note-markdown-writer.ts` | 88-116 | Limited blocks | Simpler conversion, missing some block types |
| 13 | `src/lib/notes/types.ts` | Various | Type organization | Scattered type definitions |
| 14 | `src/lib/notes/types-slice.ts` | Various | Duplicate types | May overlap with dexie-db types |

---

## Part 8: Recommendations

### Immediate (P0 - Before Next Sprint)

1. **Consolidate FSA Adapters**
   - Merge `fsa-storage-adapter.ts` into `fsa-gateway.ts`
   - Keep `fsa-gateway.ts` as canonical implementation
   - Update imports from 54 consumer files

2. **Fix Cross-Layer Import**
   - Move `NoteRecord` type to domain layer
   - Or create `NoteGateway` interface in domain with infrastructure implementation

### Short-term (P1 - Sprint 1)

3. **Relocate Note Store**
   - Move `lib/notes/note-store-refactored.ts` → `infrastructure/persistence/stores/notes/`
   - Update all import paths
   - Update barrel exports

4. **Add structuredClone Fallback**
   ```typescript
   // In handle-persistence.ts persistHandle method
   try {
     handleData = isStructuredCloneSupported() ? structuredClone(handle) : null;
   } catch {
     console.warn('[HandlePersistence] structuredClone failed, storing metadata only');
     handleData = null;
   }
   ```

5. **Simplify Fallback Logic**
   - Extract strategy pattern for FSA vs IDB fallback
   - Create `StorageStrategy` interface with `FSAStorageStrategy` and `IDBStorageStrategy`

### Medium-term (P2 - Sprint 2)

6. **Complete BlockNote Support**
   - Add missing block types (callout, alert, card)
   - Support nested structures
   - Remove `as unknown as` type assertions

7. **Optimize File Watching**
   - Implement adaptive polling intervals
   - Reduce frequency when no changes detected
   - Add batch processing for multiple changes

8. **Add Sync History Limits**
   - Cap `syncHistory` array size
   - Implement LRU eviction for old entries

---

## Part 9: Validation Checklist

- [ ] TypeScript compilation passes
- [ ] No duplicate adapter implementations
- [ ] All imports use canonical paths
- [ ] Handle persistence works on all Chrome versions
- [ ] Note CRUD works on both FSA and IndexedDB
- [ ] File watching responds to external changes
- [ ] Markdown conversion handles all block types
- [ ] Sync bidirectional works correctly
- [ ] Quota management prevents data loss
- [ ] Store rehydration works on page reload

---

## Part 10: Investigation Evidence

### Files Analyzed

| Category | Count |
|----------|-------|
| Storage Gateway Files | 5 |
| Handle Persistence Files | 2 |
| Note Gateway Files | 2 |
| Dexie DB Files | 15 |
| Note Store Files | 12 |
| Sync Service Files | 8 |
| **Total** | **48** |

### Methods Used

- **grep**: Pattern matching for imports, exports, function definitions
- **glob**: File discovery by pattern
- **read with offset**: Deep investigation of specific code sections
- **Symbol analysis**: TypeScript type hierarchy analysis

### Investigation Duration

- **Start**: 2026-01-20T21:00:00+07:00
- **End**: 2026-01-20T21:45:00+07:00
- **Duration**: ~45 minutes

---

*Report created as part of Domain Round Investigation*
*Investigation ID: NOTES-PERSISTENCE-INVESTIGATION*
