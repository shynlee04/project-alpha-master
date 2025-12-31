# CW-01: Abstract File Sync Service - Epic Specification

**Status**: DEFERRED to dedicated architecture sprint
**Estimated Effort**: 3-5 development days
**Priority**: P1 (High - Cross-workspace integration)
**Created**: 2025-12-31
**Epic ID**: cw-01-file-sync-service

## Problem Statement

The codebase has workspace-specific file sync logic tightly coupled to individual components. There is no abstraction for file sync operations across workspaces (IDE, Knowledge, Study, Notes).

**Current State:**
- IDE workspace: Uses LocalFSAdapter + SyncManager directly
- Knowledge workspace: No file sync (imports via dialog only)
- Study workspace: No file sync (quiz/flashcard data only)
- Notes workspace: No file sync (note data only)

**Goal:**
Create an abstract file sync service that can be used by all workspaces with consistent APIs and behavior.

## Current Architecture

### File Sync Infrastructure (IDE Workspace)

```
LocalFSAdapter (File System Access API)
    ↓
SyncManager (coordinates sync to WebContainer)
    ↓
WebContainer FS (in-memory sandbox)
```

**Key Files:**
- `src/lib/filesystem/local-fs-adapter.ts` - Browser FSA wrapper
- `src/lib/filesystem/sync-manager/` - Sync coordination module
  - `sync-batch-sync.ts` - Batch operations
  - `sync-file-ops.ts` - Individual file operations
  - `sync-manager-types.ts` - Type definitions

**Features:**
- Mount local directory to WebContainer
- Incremental sync (changed files only)
- Exclusions (.git, node_modules, .DS_Store)
- Transaction logging with rollback support
- Batch operations for performance

## Requirements

### Functional Requirements

1. **Abstract Interface**
   ```typescript
   interface FileSyncService {
       // Core operations
       readFile(path: string): Promise<string>;
       writeFile(path: string, content: string): Promise<void>;
       deleteFile(path: string): Promise<void>;
       listFiles(path: string, options?: ListOptions): Promise<string[]>;

       // Batch operations
       writeBatch(operations: FileOperation[]): Promise<SyncResult>;

       // Sync management
       mount(source: FileSystemDirectoryHandle): Promise<void>;
       sync(options?: SyncOptions): Promise<SyncResult>;
       getSyncStatus(): SyncStatus;

       // Event handling
       onFileChange(callback: (event: FileChangeEvent) => void): () => void;
   }
   ```

2. **IDE Implementation**
   - Wrap existing LocalFSAdapter + SyncManager
   - Maintain WebContainer compatibility
   - Support tool execution (read, write, execute)

3. **Knowledge Implementation**
   - Import documents from local FS
   - Sync to RAG ingestion pipeline
   - No WebContainer needed
   - Support PDF, text, markdown

4. **Study/Notes Implementation**
   - Persist to IndexedDB (Dexie.js)
   - Export to local FS
   - Sync to/from backup locations

### Non-Functional Requirements

- **Performance**: Batch operations <100ms for 10 files
- **Reliability**: Transaction rollback on failure
- **Usability**: Consistent API across all workspaces
- **Security**: Permission handling (File System Access API)

## Proposed Architecture

### Phase 1: Interface Design (Day 1)

Define abstract interfaces and types:

```typescript
// file-sync-service.ts
export interface FileSyncService {
    // Read operations
    readFile(path: string): Promise<string | Buffer>;
    readFileMetadata(path: string): Promise<FileMetadata>;

    // Write operations
    writeFile(path: string, content: string | Buffer): Promise<void>;
    writeFileMetadata(path: string, metadata: FileMetadata): Promise<void>;

    // Delete operations
    deleteFile(path: string): Promise<void>;
    deleteDirectory(path: string): Promise<void>;

    // List operations
    listFiles(path: string, recursive?: boolean): Promise<string[]>;
    listDirectories(path: string, recursive?: boolean): Promise<string[]>;

    // Sync operations
    sync(source?: string, options?: SyncOptions): Promise<SyncResult>;
    getSyncStatus(): SyncStatus;

    // Event handling
    on(event: FileSyncEvent, handler: EventHandler): () => void;
}

export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

export interface FileSyncOptions {
    workspaceType: WorkspaceType;
    projectId?: string;
    exclusions?: string[];
    batchDebounceMs?: number;
}

export interface SyncResult {
    success: boolean;
    filesProcessed: number;
    errors: SyncError[];
    duration: number;
}
```

### Phase 2: IDE Implementation (Day 2-3)

Wrap existing sync infrastructure:

```typescript
// ide-file-sync-service.ts
export class IDEFileSyncService implements FileSyncService {
    private localAdapter: LocalFSAdapter;
    private syncManager: SyncManager;

    constructor(config: IDESyncConfig) {
        this.localAdapter = new LocalFSAdapter(config.directoryHandle);
        this.syncManager = createSyncManager(this.localAdapter, config.syncOptions);
    }

    async readFile(path: string): Promise<string> {
        return this.localAdapter.readFile(path);
    }

    async writeFile(path: string, content: string): Promise<void> {
        await this.localAdapter.writeFile(path, content);
        await this.syncManager.incrementalSyncToWebContainer();
    }

    // ... other methods
}
```

### Phase 3: Knowledge Implementation (Day 3-4)

Implement document sync for RAG:

```typescript
// knowledge-file-sync-service.ts
export class KnowledgeFileSyncService implements FileSyncService {
    private metadataExtractor: MetadataExtractor;
    private documentChunker: DocumentChunker;
    private embeddingService: EmbeddingService;
    private oramaIndex: OramaIndex;

    async sync(source: string): Promise<SyncResult> {
        // 1. Import documents from local FS
        const documents = await this.importDocuments(source);

        // 2. Extract metadata
        const withMetadata = await Promise.all(
            documents.map(doc => this.metadataExtractor.extract(doc))
        );

        // 3. Chunk documents
        const chunks = await this.documentChunker.chunkBatch(withMetadata);

        // 4. Generate embeddings
        const withEmbeddings = await this.embeddingService.embedBatch(chunks);

        // 5. Index in Orama
        await this.oramaIndex.indexBatch(withEmbeddings);

        return { success: true, filesProcessed: documents.length, errors: [], duration };
    }
}
```

### Phase 4: Study/Notes Implementation (Day 4-5)

IndexedDB-based sync:

```typescript
// indexeddb-file-sync-service.ts
export class IndexedDBFileSyncService implements FileSyncService {
    private db: Dexie;

    constructor(workspaceType: 'study' | 'notes', projectId: string) {
        this.db = new Dexie(`${workspaceType}-${projectId}`);
        // Define schema...
    }

    async readFile(path: string): Promise<string> {
        const record = await this.db.files.get(path);
        return record?.content || '';
    }

    async writeFile(path: string, content: string): Promise<void> {
        await this.db.files.put({ path, content, timestamp: Date.now() });
    }

    async exportToLocalFS(directoryHandle: FileSystemDirectoryHandle): Promise<void> {
        const files = await this.db.files.toArray();
        for (const file of files) {
            const fileHandle = await directoryHandle.getFileHandle(file.path, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file.content);
            await writable.close();
        }
    }
}
```

### Phase 5: Factory & Integration (Day 5)

Create factory function:

```typescript
// file-sync-service-factory.ts
export function createFileSyncService(
    workspaceType: WorkspaceType,
    config: FileSyncOptions
): FileSyncService {
    switch (workspaceType) {
        case 'ide':
            return new IDEFileSyncService(config);
        case 'knowledge':
            return new KnowledgeFileSyncService(config);
        case 'study':
        case 'notes':
            return new IndexedDBFileSyncService(workspaceType, config.projectId);
        default:
            throw new Error(`Unknown workspace type: ${workspaceType}`);
    }
}
```

## Implementation Strategy

### Option A: Complete Abstraction (Recommended)
Create full FileSyncService interface with 3 implementations.

**Pros:**
- Clean separation of concerns
- Easy to test
- Future-proof for new workspaces

**Cons:**
- Higher initial effort (3-5 days)
- Requires careful API design

### Option B: Adapter Pattern
Wrap existing sync logic with adapters.

**Pros:**
- Faster to implement
- Lower risk

**Cons:**
- Doesn't reduce complexity
- Leaky abstractions

## Acceptance Criteria

- [ ] FileSyncService interface defined
- [ ] IDEFileSyncService implementation working
- [ ] KnowledgeFileSyncService implementation working
- [ ] IndexedDBFileSyncService implementation working
- [ ] Factory function creates correct service
- [ ] All workspaces use FileSyncService API
- [ ] Build passes
- [ ] No functionality lost
- [ ] Tests pass

## Dependencies

- **Depends on**: Existing sync infrastructure (src/lib/filesystem/)
- **Blocks**: cw-02 (Project → Knowledge sync)

## Success Metrics

- **Code Reuse**: 80% of sync logic shared across workspaces
- **Consistency**: Same API for all file operations
- **Maintainability**: Single interface to update vs workspace-specific code

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|-------|-----------|
| API too generic | Medium | Medium | Workspace-specific extensions |
| Performance regression | Low | High | Benchmark before/after |
| Breaking IDE sync | Medium | High | Comprehensive testing, gradual migration |

## Handoff

**Assigned To**: Backend/Architecture Team
**Sprint**: TBD (Future sprint)
**Epic Link**: `_bmad-output/deferred-tasks/cw-01-file-sync-service-epic.md`
**Status**: Ready for sprint planning

---

**Document Version**: 1.0
**Last Updated**: 2025-12-31
**Author**: ARC Module Ralph Loop
**Reviewers**: TBD
