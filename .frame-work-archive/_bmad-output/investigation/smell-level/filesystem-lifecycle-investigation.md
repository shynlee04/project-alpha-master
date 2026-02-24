# File System & Lifecycle Investigation Report

**Investigation ID:** FILESYSTEM-LIFECYCLE-01  
**Date:** 2026-01-20  
**Investigator:** Deep Scan Agent  
**Scope:** Storage adapter implementations, file operations, notes storage mechanism

---

## Executive Summary

This investigation provides a comprehensive analysis of the file system operations, storage adapters, and complete lifecycle from project creation → notes usage in the Project Alpha codebase. The architecture follows Clean Architecture principles with clear separation between domain interfaces, infrastructure implementations, and presentation layer concerns.

**Key Findings:**
- Storage selection is properly determined by platform detection (FSA for desktop with Chrome 86+, IndexedDB for mobile/tablet)
- Handle persistence is well-designed with Chrome 122+ silent restore support and Chrome 129+ structuredClone for instant restoration
- Notes storage follows a dual-strategy: FSA (Desktop) saves to `/notes/*.md` files, Mobile saves to IndexedDB
- Bidirectional sync between BlockNote editor and markdown files is implemented via `MarkdownSyncService`

---

## 1. Storage Adapters

### 1.1 Storage Type Selection Logic

The storage type is determined by `getOptimalStorageType()` in `platform-detection.ts`:

```
Desktop (Chrome 86+, Edge 86+, Opera 72+, Safari 15.2+) → 'fsa' (File System Access)
Desktop without FSA support → 'indexeddb' (fallback)
Mobile/Tablet → 'indexeddb' (no file system access)
WebContainer → 'indexeddb' (preview only)
```

**Platform Detection Functions:**
- `isFSASupported()`: Checks for `showDirectoryPicker` in window
- `isMobileDevice()`: User agent pattern matching
- `isTabletDevice()`: User agent pattern matching for tablets
- `isDesktopDevice()`: Returns true if not mobile or tablet
- `canWriteToFileSystem()`: FSA supported + desktop

### 1.2 Storage Adapter Implementations

| Adapter | Location | Storage Type | Primary Use |
|---------|----------|--------------|-------------|
| `FSAStorageAdapter` | `fsa-storage-adapter.ts` | File System Access API | Desktop with FSA |
| `IDBAdapter` | `sync/adapters/idb-adapter-core.ts` | IndexedDB (Dexie) | Mobile/Tablet |
| `FSAGateway` | `fsa-gateway.ts` | File System Access API | Desktop file I/O |
| `IDBGateway` | `idb-gateway.ts` | IndexedDB (Dexie) | Mobile file I/O |

**StorageAdapter Interface (Domain Layer):**
```typescript
interface StorageAdapter {
  readonly name: string;
  readFile(path: string): Promise<FileContent>;
  writeFile(path: string, content: Uint8Array): Promise<void>;
  deleteFile(path: string): Promise<void>;
  listFiles(pattern: string): Promise<string[]>;
  getMetadata(path: string): Promise<FileMetadata>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): () => void;
  isAvailable(): boolean;
}
```

**StorageGateway Interface (Domain Layer - New):**
```typescript
interface StorageGateway {
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  delete(path: string): Promise<void>;
  list(path: string): Promise<FileEntry[]>;
  exists(path: string): Promise<boolean>;
  watch(callback: FileChangeCallback): WatchHandle;
  rename(oldPath: string, newPath: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
}
```

### 1.3 Storage Adapter Factory

`StorageAdapterFactory` (`StorageAdapterFactory.ts`) creates the appropriate adapter:

```typescript
createAdapter(options: StorageOptions): StorageAdapter {
  const storageType = explicitType ?? getOptimalStorageType();
  
  switch (storageType) {
    case 'fsa':
      const effectiveHandle = handleGetter ? handleGetter() : handle;
      return this.createFSAAdapter({ projectId, handle: effectiveHandle });
    
    case 'indexeddb':
      return this.createIDBAdapter({ projectId });
  }
}
```

**Key Fix (FSA-006):** Handle is now optional. If handle is not available at creation time, a placeholder adapter is returned that defers operations until handle is provided via ProjectContext.

### 1.4 Issues in Storage Adapters

| Issue | File | Description | Severity |
|-------|------|-------------|----------|
| Duplicate adapter classes | `fsa-storage-adapter.ts` vs `fsa-gateway.ts` | Both implement similar FSA operations. `FSAStorageAdapter` is 673 lines, `FSAGateway` is ~711 lines with overlap | Medium |
| Polling-based watching | Both FSA adapters | Uses 2-second polling interval for file watching. Chrome 129+ has FileSystemObserver but implementation may be incomplete | Low |
| Complex adapter selection | `StorageAdapterFactory.ts` | Multiple code paths for handleGetter vs direct handle | Low |

---

## 2. File Operations & Lifecycle

### 2.1 Project Creation Flow

```
User clicks "Create Project" → pickFolder() [showDirectoryPicker]
                                    ↓
                    handlePersistenceService.persistHandle()
                                    ↓
                    useProjectStore.createProject()
                                    ↓
                    DexieDB.projects.put()
                                    ↓
                    initializeViagentFolder() [creates .viagent/]
                                    ↓
                    gateway.createDirectory('/notes')
```

**Key Files:**
- `lib/workspace/fsa-persistence.ts`: `createProjectFromFolder()`
- `infrastructure/filesystem/handle-persistence.ts`: `HandlePersistenceService`
- `infrastructure/persistence/stores/project/project-crud-slice.ts`: `createProject()`

### 2.2 Handle Persistence & Restoration

**Chrome 129+ Enhancement:**
```typescript
// Store actual handle when structuredClone is available
const handleData = isStructuredCloneSupported()
  ? structuredClone(handle)  // Chrome 129+: Store actual handle
  : null;  // Older browsers: Store metadata only
```

**Silent Restore Flow:**
```
restoreProjectHandle(projectId)
        ↓
handlePersistenceService.restoreHandle()
        ↓
trySilentRestore() [Chrome 122+ with persistent permissions]
        ├── Chrome 129+: structuredClone(handleData)
        └── Chrome 122-128: showDirectoryPicker({ id: projectId })
        ↓
Returns HandleRestoreResult { success, handle, requiresUserInteraction }
```

**HandlePersistenceService Methods:**
- `persistHandle()`: Stores handle metadata in Dexie `fsaHandles` table
- `restoreHandle()`: Attempts silent restore, falls back to user prompt
- `deleteHandle()`: Removes stored handle metadata
- `updatePermissionStatus()`: Updates permission state
- `getPermissionStatus()`: Retrieves current permission state

### 2.3 File Operations (via FSAGateway)

```typescript
// Read file
async read(path: string): Promise<Uint8Array> {
  const result = await fileOps.readFile(this.directoryHandle, path, { encoding: 'binary' });
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}

// Write file
async write(path: string, data: Uint8Array): Promise<void> {
  if (this.isTextFile(path)) {
    const text = decoder.decode(data);
    await fileOps.writeFile(this.directoryHandle, path, text);
  } else {
    await this.writeBinaryFile(path, data);
  }
}

// List directory
async list(path: string): Promise<FileEntry[]> {
  const entries = await this.getAllFiles(this.directoryHandle, path);
  return entries.map(toFileEntry);
}
```

### 2.4 Issues in File Operations

| Issue | File | Description | Severity |
|-------|------|-------------|----------|
| Dead code comments | `file-ops.ts` lines 100-140 | Long comments explaining deleteFile logic that could be simplified | Low |
| TODO markers | Multiple files | 80+ TODO comments throughout codebase | Low |
| Duplicate path parsing | `file-ops.ts`, `fsa-gateway.ts` | Both have similar path segment parsing logic | Low |

---

## 3. Notes Storage Mechanism

### 3.1 Dual Storage Strategy

Per ADR-033 Decision D4:
- **Desktop (FSA)**: Notes stored as `.md` files in `/project/notes/` directory
- **Mobile/Tablet (IndexedDB)**: Notes stored in DexieDB `notes` table

### 3.2 Notes CRUD Flow

```typescript
// loadNotes() in note-crud-slice.ts
async function loadNotes(projectId: string) {
  const platform = getPlatformContract();
  
  if (platform.storageType === 'fsa') {
    const restoreResult = await restoreHandle(projectId);
    const mountedHandle = restoreResult.handle;
    
    if (!mountedHandle) {
      // BUG-013 FIX: Fall back to IndexedDB if no handle
      useIndexedDB = true;
    } else {
      const gateway = createStorageGateway(platform, { directoryHandle: mountedHandle });
      const noteGateway = new NoteGateway(gateway);
      // Read from /notes/*.md files via gateway
    }
  }
  
  if (useIndexedDB) {
    const notes = await db.notes.where('projectId').equals(projectId).sortBy('order');
  }
}
```

### 3.3 Markdown Sync Service

`MarkdownSyncService` (`markdown-sync-service.ts`) provides bidirectional sync:

```typescript
class MarkdownSyncService {
  // Export: Note → Markdown file
  async exportNote(note: NoteRecord): Promise<void> {
    const markdown = noteToMarkdown(note);
    await this.config.gateway.write(filePath, encoder.encode(markdown));
  }
  
  // Import: Markdown file → Note
  async importFile(filePath: string): Promise<ParsedMarkdownFile | null> {
    const markdown = await this.readFileContent(filePath);
    const { title, blocks, frontmatter } = await parseMarkdownFile(markdown);
    return { content: markdown, title, metadata, blocks };
  }
  
  // Watch for file changes
  startWatching(): void {
    this.state.watchHandle = this.config.gateway.watch((event) => {
      this.handleFileChange(event);
    });
  }
}
```

**File Path Format:** `notes/{sanitized-title}-{short-id}.md`

### 3.4 Note Gateway (Domain Service)

`NoteGateway` (`domain/services/note-gateway.ts`) provides domain-level abstraction:

```typescript
class NoteGateway {
  async readNote(noteId: string): Promise<NoteRecord> {
    const content = await this.gateway.read(this.getNoteFilePath(noteId));
    return this.parseNote(noteId, content);
  }
  
  async createNote(note: NoteRecord): Promise<void> {
    const markdown = this.noteToMarkdown(note);
    await this.gateway.write(this.getNoteFilePath(note), encoder.encode(markdown));
  }
  
  async updateNote(noteId: string, updates: Partial<NoteRecord>): Promise<void> {
    const existing = await this.readNote(noteId);
    const merged = { ...existing, ...updates };
    await this.createNote(merged);
  }
  
  async deleteNote(noteId: string): Promise<void> {
    await this.gateway.delete(this.getNoteFilePath(noteId));
  }
}
```

### 3.5 Issues in Notes Storage

| Issue | File | Description | Severity |
|-------|------|-------------|----------|
| BUG-013 fallback complexity | `note-crud-slice.ts` | Complex fallback logic when FSA handle unavailable | Medium |
| BUG-FIX-010 markers | Multiple files | 10+ files marked with BUG-FIX-010 for markdown parser fix | Low |
| Duplicate gateway creation | `note-crud-slice.ts` | Gateway created on every CRUD operation | Medium |
| Inconsistent error handling | `MarkdownSyncService` | Some errors logged but not propagated | Low |

---

## 4. Complete Lifecycle Flow

### 4.1 Creation Flow (Desktop FSA)

```
1. User selects folder via showDirectoryPicker()
2. handlePersistenceService.persistHandle() stores handle (structuredClone if Chrome 129+)
3. useProjectStore.createProject() creates project metadata in Dexie
4. initializeViagentFolder() creates .viagent/ metadata folder
5. gateway.createDirectory('/notes') creates notes folder
6. Project saved to Dexie projects table with storageType='fsa'
```

### 4.2 Revisit Flow (Handle Restoration)

```
1. User navigates to project route
2. useProjectStore.getProject() loads project from Dexie
3. restoreProjectHandle() calls handlePersistenceService.restoreHandle()
4. trySilentRestore() attempts:
   - Chrome 129+: structuredClone(handleData) from IndexedDB
   - Chrome 122-128: showDirectoryPicker({ id: projectId }) with persistent permission
5. If successful, handle is set and stored in memory
6. FSAGateway created with restored handle
```

### 4.3 Notes Access Flow

```
1. User navigates to Notes workspace
2. loadNotes() called with projectId
3. restoreHandle() retrieves FSA handle
4. StorageGateway created via createStorageGateway()
5. NoteGateway created with gateway
6. gateway.list('/notes') enumerates .md files
7. gateway.read() loads each note content
8. BlockNote editor displays notes
```

### 4.4 Notes Modification Flow

```
1. User edits note in BlockNote editor
2. updateNote() called with new blocks
3. NoteGateway.updateNote() merges updates
4. MarkdownSyncService.exportNote() converts blocks to markdown
5. gateway.write() saves to /notes/{title}-{id}.md
6. VFS sync notified via crossWorkspaceEventBus
```

---

## 5. Uncleaned Files & Issues

### 5.1 High Priority Issues

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/lib/notes/slices/note-crud-slice.ts` | Complex fallback logic | Lines 54-145 contain BUG-013 FIX comments and nested if/else for FSA vs IDB | Refactor to use cleaner strategy pattern |
| `src/infrastructure/filesystem/fsa-storage-adapter.ts` | Duplicate adapter | 673 lines with overlapping functionality with FSAGateway | Consolidate to single adapter |

### 5.2 Medium Priority Issues

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/lib/notes/store-facades.ts` | TODO markers | "TODO: After Team A completes import updates, delete" | Clean up after migration complete |
| `src/infrastructure/filesystem/index.ts` | TODO marker | "TODO: Move permission-lifecycle.ts to infrastructure/filesystem" | Complete migration |
| Multiple files | BUG-FIX markers | 50+ BUG-FIX-xxx comments | Consider creating ticket to clean up post-stabilization |

### 5.3 Low Priority Issues

| Path | Issue | Evidence | Recommendation |
|------|-------|----------|----------------|
| `src/infrastructure/filesystem/file-ops.ts` | Long comments | Lines 100-140 explain delete logic verbosely | Simplify comments |
| `src/lib/workspace/fsa-persistence.ts` | Multiple BUG-FIX comments | Lines 173, 183, 191, 220 | Clean up post-stabilization |
| Various files | TODO comments | 80+ TODO comments across filesystem and notes | Prioritize and complete |

---

## 6. Synthesis

### Architecture Overview

The file system architecture follows Clean Architecture with clear separation of concerns:

1. **Domain Layer** (`src/domain/interfaces/`):
   - `StorageAdapter` interface for storage operations
   - `StorageGateway` interface for file I/O
   - `NoteGateway` service for notes CRUD

2. **Infrastructure Layer** (`src/infrastructure/`):
   - `FSAStorageAdapter` / `FSAGateway`: File System Access API implementation
   - `IDBAdapter` / `IDBGateway`: IndexedDB implementation
   - `HandlePersistenceService`: Handle metadata storage and restoration
   - `MarkdownSyncService`: Bidirectional BlockNote ↔ Markdown sync

3. **Presentation Layer** (`src/lib/notes/`, `src/routes/`):
   - `note-crud-slice.ts`: Notes store with FSA/IDB fallback
   - `useVFSSync()`: React hook for file watching state
   - Route components for Notes/IDE/Knowledge workspaces

### Key Strengths

1. **Clean Separation**: Domain interfaces define contracts, infrastructure implements them
2. **Platform Detection**: Robust platform detection with caching (5-second cache)
3. **Handle Persistence**: Sophisticated handle persistence with Chrome 122+ silent restore
4. **Dual Storage Strategy**: Proper handling for Desktop (FSA) vs Mobile (IndexedDB)
5. **Bidirectional Sync**: MarkdownSyncService handles note ↔ file synchronization

### Areas for Improvement

1. **Adapter Consolidation**: `FSAStorageAdapter` and `FSAGateway` have significant overlap
2. **Fallback Complexity**: BUG-013 FIX adds complexity to notes loading
3. **Technical Debt**: 80+ TODO markers and 50+ BUG-FIX comments need cleanup
4. **Watcher Optimization**: Polling-based watching could use FileSystemObserver more fully

### Recommendations

1. **Short-term**: Clean up TODO/BUG-FIX markers post-stabilization
2. **Medium-term**: Consolidate duplicate FSA adapter implementations
3. **Long-term**: Implement FileSystemObserver for native file watching (Chrome 129+)

---

## 7. File Reference Summary

| File | Purpose | Lines |
|------|---------|-------|
| `platform-detection.ts` | Platform detection utilities | 318 |
| `storage-adapter.interface.ts` | Domain storage interface | 161 |
| `StorageAdapterFactory.ts` | Factory for creating adapters | 290 |
| `fsa-storage-adapter.ts` | FSA adapter implementation | 673 |
| `fsa-gateway.ts` | FSA gateway implementation | ~711 |
| `idb-adapter-core.ts` | IndexedDB adapter | 282 |
| `idb-gateway.ts` | IndexedDB gateway | ~457 |
| `handle-persistence.ts` | Handle persistence service | 599 |
| `markdown-sync-service.ts` | Notes ↔ MD sync | 698 |
| `note-crud-slice.ts` | Notes CRUD operations | 482 |
| `project-crud-slice.ts` | Project CRUD operations | 316 |
| `fsa-persistence.ts` | Folder picker & project creation | 278 |
| `storage-gateway-factory.ts` | Gateway factory | 235 |

---

*Report generated: 2026-01-20*  
*Investigation scope: Storage adapters, file operations, notes storage mechanism*
