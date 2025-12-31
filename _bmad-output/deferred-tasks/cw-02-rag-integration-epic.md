# CW-02: Project → Knowledge Sync - Epic Specification

**Status**: DEFERRED to dedicated RAG integration sprint
**Estimated Effort**: 5-7 development days
**Priority**: P1 (High - Knowledge workspace integration)
**Created**: 2025-12-31
**Epic ID**: cw-02-project-knowledge-sync

## Problem Statement

The Knowledge workspace has a complete RAG infrastructure (Orama WASM, chunking, embeddings, hybrid search) but no automated way to sync documents from IDE projects. Users must manually import documents via SourceImportDialog.

**Current State:**
- Knowledge workspace: Manual import only (SourceImportDialog)
- IDE workspace: Full file system access (LocalFSAdapter)
- No connection between IDE projects and Knowledge workspace
- RAG infrastructure complete and operational

**Goal:**
Automatically sync documents from IDE projects to Knowledge workspace and integrate with RAG pipeline for searchable knowledge base.

## Current Architecture

### RAG Infrastructure (Already Complete)

```
Document Import (Manual)
    ↓
Document Chunker (5 strategies)
    ↓
Embedding Service (cached)
    ↓
Orama WASM Index
    ↓
Hybrid Retriever (vector + keyword)
    ↓
Citation Formatter
```

**Key Files:**
- `src/lib/rag/orama-index.ts` (551 LOC) - Vector database
- `src/lib/rag/document-chunker.ts` (408 LOC) - Chunking pipeline
- `src/lib/rag/chunk-strategies/` (5 files) - Chunking algorithms
- `src/lib/rag/embedding-service.ts` (380 LOC) - Embedding generation
- `src/lib/rag/hybrid-retriever.ts` (435 LOC) - Hybrid search
- `src/lib/rag/citation-formatter.ts` (140 LOC) - Citation tracking

**Supported Formats:**
- Text files (.txt, .md, .rst)
- Code files (.ts, .tsx, .js, .jsx, .py, etc.)
- PDF files (via client-side parsing)
- HTML files (via extraction)

## Requirements

### Functional Requirements

1. **Document Discovery**
   - Scan IDE project directory for supported file types
   - Filter by exclusions (.git, node_modules, build artifacts)
   - Detect changes (new, modified, deleted files)

2. **Document Synchronization**
   - Incremental sync (only changed documents)
   - Batch processing for performance
   - Conflict resolution (remote vs local)

3. **RAG Pipeline Integration**
   - Automatic chunking of synced documents
   - Embedding generation
   - Indexing in Orama WASM
   - Citation tracking (source file, line numbers)

4. **User Control**
   - Sync on/off toggle
   - File type filtering
   - Directory inclusion/exclusion rules
   - Manual sync trigger

### Non-Functional Requirements

- **Performance**: Sync 100 docs in <30 seconds
- **Reliability**: Handle sync failures gracefully
- **Usability**: Clear sync status and progress
- **Storage**: Efficient IndexedDB usage

## Proposed Architecture

### Phase 1: Sync Service (Day 1-2)

Create document sync coordinator:

```typescript
// project-knowledge-sync.ts
export class ProjectKnowledgeSync {
    private fileSyncService: FileSyncService; // from cw-01
    private documentChunker: DocumentChunker;
    private embeddingService: EmbeddingService;
    private oramaIndex: OramaIndex;
    private syncStatus: SyncStatus;

    async syncProject(config: SyncConfig): Promise<SyncResult> {
        // 1. Discover documents
        const documents = await this.discoverDocuments(config.projectPath);

        // 2. Filter by sync rules
        const toSync = this.filterDocuments(documents, config);

        // 3. Check for changes
        const changed = await this.getChangedDocuments(toSync);

        // 4. Sync documents
        const results = await this.syncBatch(changed);

        // 5. Process through RAG pipeline
        await this.indexDocuments(results.synced);

        return results;
    }

    private async indexDocuments(documents: Document[]): Promise<void> {
        // Chunk
        const chunks = await this.documentChunker.chunkBatch(documents);

        // Embed
        const withEmbeddings = await this.embeddingService.embedBatch(chunks);

        // Index
        await this.oramaIndex.indexBatch(withEmbeddings);
    }
}
```

### Phase 2: File Watcher (Day 2-3)

Implement file change detection:

```typescript
// project-file-watcher.ts
export class ProjectFileWatcher {
    private watchHandle: FileSystemWatcher | null = null;
    private sync: ProjectKnowledgeSync;

    async watch(projectPath: string, config: WatchConfig): Promise<void> {
        // Use File System Access API's observer pattern
        this.watchHandle = await this.observeDirectory(projectPath, async (changes) => {
            const relevant = changes.filter(c => this.shouldSync(c));
            if (relevant.length > 0) {
                await this.sync.syncProject({
                    projectPath,
                    files: relevant,
                    mode: 'incremental'
                });
            }
        });
    }

    private shouldSync(change: FileChange): boolean {
        // Check file extension
        if (!this.isSupportedFormat(change.path)) return false;

        // Check exclusions
        if (this.isExcluded(change.path)) return false;

        return true;
    }
}
```

### Phase 3: UI Integration (Day 3-4)

Add sync controls to Knowledge workspace:

```typescript
// KnowledgePage.tsx
export function KnowledgePage() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        enabled: false,
        lastSync: null,
        documentCount: 0,
        inProgress: false
    });

    const handleToggleSync = async () => {
        if (syncStatus.enabled) {
            await projectSync.stop();
        } else {
            await projectSync.start(projectId, {
                fileTypes: ['.md', '.txt', '.pdf', '.tsx', '.ts'],
                exclusions: ['node_modules', '.git', 'dist']
            });
        }
    };

    return (
        <MainLayout>
            {/* Sync Controls */}
            <SyncControls
                status={syncStatus}
                onToggle={handleToggleSync}
                onSyncNow={handleManualSync}
            />

            {/* Existing Source Library, Canvas, RAG Chat */}
        </MainLayout>
    );
}
```

### Phase 4: Source Metadata (Day 4-5)

Track document sources for citations:

```typescript
// source-metadata.ts
export interface SourceMetadata {
    documentId: string;
    sourcePath: string; // Original file path in IDE project
    sourceType: 'project' | 'imported';
    lastModified: number;
    chunkCount: number;
    lineRanges: LineRange[]; // For citation linking
}

export class SourceMetadataTracker {
    async trackDocument(doc: Document, sourcePath: string): Promise<void> {
        const metadata: SourceMetadata = {
            documentId: doc.id,
            sourcePath,
            sourceType: 'project',
            lastModified: Date.now(),
            chunkCount: doc.chunks.length,
            lineRanges: this.extractLineRanges(doc)
        };

        await this.db.metadata.put(metadata);
    }

    async getCitationSource(chunkId: string): Promise<CitationSource | null> {
        const metadata = await this.db.metadata
            .where('chunkIds')
            .equals(chunkId)
            .first();

        if (!metadata) return null;

        return {
            filePath: metadata.sourcePath,
            lineRange: this.getLineRange(chunkId, metadata),
            preview: await this.getFilePreview(metadata.sourcePath)
        };
    }
}
```

### Phase 5: Sync Settings (Day 5-6)

User configuration for sync behavior:

```typescript
// sync-settings.ts
export interface SyncSettings {
    enabled: boolean;
    projectPath: string;
    fileTypes: string[];
    exclusions: string[];
    autoSync: boolean;
    syncInterval: number; // minutes
    maxFileSize: number; // bytes
}

export class SyncSettingsManager {
    async saveSettings(projectId: string, settings: SyncSettings): Promise<void> {
        await this.db.settings.put({ projectId, settings });
    }

    async getSettings(projectId: string): Promise<SyncSettings> {
        const record = await this.db.settings.get(projectId);
        return record?.settings || this.getDefaultSettings();
    }
}
```

### Phase 6: Testing & Rollout (Day 6-7)

Comprehensive testing:

1. **Unit Tests**
   - Document discovery logic
   - Change detection
   - Filtering rules
   - Chunk integration

2. **Integration Tests**
   - End-to-end sync flow
   - RAG pipeline integration
   - Citation tracking

3. **UI Tests**
   - Sync controls
   - Progress indicators
   - Settings UI

## Implementation Strategy

### Option A: Full Automation (Recommended)
Implement continuous file watching with automatic sync.

**Pros:**
- Best user experience
- Knowledge base always up-to-date
- Leverages existing RAG infrastructure

**Cons:**
- Higher complexity
- Performance considerations
- Privacy concerns (auto-syncing code)

### Option B: Manual Sync Only
User triggers sync via button.

**Pros:**
- Simpler implementation
- User control
- No performance overhead

**Cons:**
- Knowledge base can become stale
- Requires user action

### Option C: Hybrid (Recommended)
Manual trigger + optional auto-sync with user consent.

**Pros:**
- Balanced approach
- User control + automation option
- Privacy-conscious

**Cons:**
- Slightly more complex UI

## Acceptance Criteria

- [ ] Documents from IDE projects sync to Knowledge workspace
- [ ] Sync respects file type filters
- [ ] Sync respects exclusion rules
- [ ] RAG pipeline automatically indexes synced documents
- [ ] Citations link back to source files
- [ ] User can enable/disable sync
- [ ] Sync status is visible
- [ ] Manual sync trigger works
- [ ] Auto-sync (if enabled) works
- [ ] Build passes
- [ ] Tests pass

## Dependencies

- **Depends on**: cw-01 (Abstract file sync service)
- **Uses**: Complete RAG infrastructure (already done)
- **Related**: cw-03 (unified chatpanel - for consistent UX)

## Success Metrics

- **Automation**: 0-click sync from IDE to Knowledge
- **Performance**: Sync 100 docs in <30s
- **Completeness**: 100% of tracked documents indexed
- **Reliability**: <1% sync failure rate

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|-------|-----------|
| Performance degradation | Medium | High | Batch processing, debouncing |
| Large file handling | Medium | Medium | File size limits, chunking |
| Privacy concerns | High | High | Opt-in only, clear UI |
| Sync conflicts | Low | Medium | Timestamp-based resolution |

## Open Questions

1. **Privacy**: Should code files be synced by default or require opt-in?
2. **Frequency**: How often to auto-sync? (Recommend: on save + debounced)
3. **Scope**: All file types or just documentation? (Recommend: user-configurable)
4. **Storage**: IndexedDB limits for large projects? (Recommend: quota management)

## Handoff

**Assigned To**: RAG Integration Team
**Sprint**: TBD (Future sprint)
**Epic Link**: `_bmad-output/deferred-tasks/cw-02-rag-integration-epic.md`
**Status**: Ready for sprint planning
**Prerequisites**: cw-01 (file sync service)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-31
**Author**: ARC Module Ralph Loop
**Reviewers**: TBD
