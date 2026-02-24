# Inconsistency and Duplication Catalog

**Generated**: 2026-01-26
**Scanner**: deep-scan-state-scanner
**Strategic Goal**: Reduce from 2000+ files to ~1000 files

---

## Executive Summary

| Metric | Current | Target | Reduction |
|--------|---------|--------|-----------|
| **Total TS/TSX Files** | 1,736 | ~1,000 | ~42% |
| **spike/ Folder Files** | 19,662 | 0 | 100% (archive) |
| **God Files (>300 lines)** | 47+ | 0 | 100% |
| **Barrel Exports (index.ts)** | 152 | ~80 | ~47% |
| **Duplicate Service Impls** | 15+ | 1 each | ~87% |

---

## 1. Type Definition Inconsistencies

| Type Name | Location 1 | Location 2+ | Canonical Location | Action |
|-----------|-----------|-------------|-------------------|--------|
| **PlatformContract** | `infrastructure/filesystem/platform-contract.ts` | `infrastructure/filesystem/storage-types.ts` (re-export) | `platform-contract.ts` | Remove duplicate import in `plugin-registry.ts` |
| **DeviceType** | `lib/filesystem/unified-storage-adapter.ts:26` | `hooks/useMediaQuery.ts` (return type) | `domain/types/platform-types.ts` (NEW) | Create single source |
| **Project** | `domain/entities/project.ts:49` | `spike/src/domain/entities/project.ts:49` | `domain/entities/project.ts` | Delete spike duplicate |
| **StorageAdapter** | `domain/interfaces/storage-adapter.interface.ts` | `spike/src/domain/interfaces/storage-adapter.interface.ts` | `domain/interfaces/storage-adapter.interface.ts` | Delete spike duplicate |
| **FileSyncService** | `infrastructure/sync/workspace-services/file-sync-service.ts` | `spike/src/infrastructure/sync/workspace-services/file-sync-service.ts` | Infrastructure version | Delete spike duplicate |
| **CreateStorageAdapterOptions** | `domain/interfaces/file-operations-adapter.interface.ts` | `spike/src/domain/interfaces/file-operations-adapter.interface.ts` | Domain version | Delete spike duplicate |

### Type Definition Scattered Across Multiple Files

| Type Category | Files Count | Locations | Consolidation Target |
|--------------|-------------|-----------|---------------------|
| Platform Types | 3 | platform-contract.ts, storage-types.ts, unified-storage-adapter.ts | `domain/types/platform-types.ts` |
| Sync Types | 8 | infrastructure/sync/types/*, core/* | `infrastructure/sync/types/index.ts` |
| Chat Types | 4 | chat/unified-chat-types.ts, conversation/types.ts, conversation/event-types.ts | `domain/types/chat-types.ts` |

---

## 2. God Stores (>300 lines)

| Store/File | Lines | Responsibilities | Decomposition Plan |
|------------|-------|------------------|-------------------|
| **ProviderService.ts** | 1,943 | Provider CRUD, validation, testing, models, credentials | Split into 5 slices: provider-crud, provider-validation, provider-test, model-registry, credential-manager |
| **dexie-db-migrations.ts** | 1,746 | All DB migrations | Split by domain: project-migrations, note-migrations, chat-migrations |
| **AISlashCommand.tsx** | 1,674 | Slash command UI, logic, registry | Split into: command-registry, command-ui, command-executor |
| **template-registry.ts** | 1,321 | All templates | Split by category: project-templates, note-templates, workflow-templates |
| **dexie-db.ts** | 1,213 | Schema + helpers | Keep schema, extract helpers to dexie-db-helpers/ |
| **NotesPage.tsx** | 1,102 | Note page layout, state, sync | Split into: NotesLayout, NotesState hook, NotesSyncManager |
| **NoteEditor.tsx** | 1,088 | Editor core, blocks, AI | Split into: EditorCore, BlockRenderer, AIEnhancer |
| **event-bus.ts** | 888 | Event definitions, bus logic | Split into: event-types.ts, event-bus-core.ts |
| **file-tree-scanner.ts** | 833 | Scanning, filtering, caching | Split into: scanner-core, filter-engine, scan-cache |
| **fsa-gateway.ts** | 816 | FSA operations | Split into: read-ops, write-ops, watch-ops |
| **PluginLayout.tsx** | 806 | Layout state, rendering, drag | Split into: LayoutState hook, LayoutRenderer, DragManager |
| **git-client.ts** | 791 | All git operations | Split into: git-basic, git-branch, git-commit, git-diff |
| **MonacoEditor.tsx** | 772 | Editor wrapper, config, events | Split into: EditorWrapper, EditorConfig, EditorEvents |
| **useWorkspaceFileSystem.ts** | 571 | File ops, sync, metadata | Already has slices - complete decomposition |
| **debate-agent.ts** | 752 | Debate workflow agent | Split into: debate-state, debate-turns, debate-resolution |
| **terminal-fs-adapter.ts** | 751 | Terminal FS operations | Split into: terminal-read, terminal-write, terminal-exec |
| **workflow-executor.ts** | 713 | Workflow execution | Split into: executor-core, step-runner, context-manager |
| **markdown-sync-service.ts** | 697 | Markdown sync | Split into: sync-engine, conflict-resolver, cache-manager |
| **symbol-parser.ts** | 696 | Symbol parsing | Split into: parser-core, symbol-extractors, symbol-cache |
| **AgentChatPanel.tsx** | 691 | Chat panel UI | Split into: ChatHeader, ChatMessages, ChatInput |
| **ArtifactGalleryBlock.tsx** | 684 | Artifact gallery | Split into: GalleryGrid, ArtifactCard, GalleryControls |
| **viagent-service.ts** | 672 | ViaGent metadata | Split into: metadata-reader, metadata-writer, metadata-validator |
| **fsa-storage-adapter.ts** | 672 | FSA adapter | Already decomposed - verify slices |
| **plugin-manager.ts** | 659 | Plugin lifecycle | Split into: plugin-loader, plugin-registry, plugin-lifecycle |
| **SlashCommandManager.tsx** | 657 | Slash commands UI | Merge with AISlashCommand or split further |
| **incremental-indexing-service.ts** | 645 | RAG indexing | Split into: index-builder, chunk-processor, index-updater |
| **orama-index.ts** | 644 | Orama search | Split into: index-core, query-engine, index-maintenance |
| **note-commands.ts** | 637 | Note agent tools | Split into: note-read-tools, note-write-tools, note-search-tools |
| **unified-file-crud.ts** | 618 | File CRUD | Split into: file-read, file-write, file-delete |
| **VideoGenerationBlock.tsx** | 617 | Video generation | Split into: VideoPlayer, VideoControls, VideoGenerator |
| **terminal-emulator.ts** | 611 | Terminal emulation | Split into: terminal-core, terminal-io, terminal-ansi |

### Total God Files Summary

| Line Range | Count | Priority |
|------------|-------|----------|
| 1000+ lines | 7 | P0 - CRITICAL |
| 700-999 lines | 8 | P1 - HIGH |
| 500-699 lines | 10 | P2 - MEDIUM |
| 300-499 lines | 22+ | P3 - LOW |

---

## 3. Duplicate Service Implementations

| Service | Legacy Location | Canonical Location | Migration Story |
|---------|-----------------|-------------------|-----------------|
| **useFileSyncService** | `lib/filesync/hooks/use-file-sync-service.ts` | `infrastructure/sync/workspace-services/hooks.ts` | Migrate all imports to infrastructure |
| **NoteFileSyncService** | `lib/notes/note-file-sync.ts` | `infrastructure/sync/workspace-services/notes/notes-file-sync-service.ts` | Merge lib version into infrastructure |
| **UnifiedStorageAdapter** | `lib/filesystem/unified-storage-adapter.ts` | `infrastructure/filesystem/StorageAdapterFactory.ts` | Deprecate lib version |
| **file-snapshot-store** | `lib/filesystem/file-snapshot-store.ts` | `infrastructure/persistence/stores/filesystem/useFileSnapshotStore.ts` | Complete migration |
| **sync-manager** | `lib/filesystem/sync-manager/` | `infrastructure/sync/` | Merge to infrastructure |
| **workspace hooks** | `lib/workspace/hooks/` | `infrastructure/persistence/stores/workspace/` | Complete migration |
| **note-store** | `lib/notes/note-store.ts` | `infrastructure/persistence/stores/notes/` | Verify consolidation |
| **workflow-builder-store** | `lib/workflow/builder/workflow-builder-store.ts` | Should be in infrastructure | Move to infrastructure |
| **cross-workspace-event-bus** | `lib/events/cross-workspace-event-bus.ts` | `infrastructure/events/cross-workspace-event-bus.ts` | Keep infrastructure, deprecate lib |
| **LocalFSAdapter** | `lib/filesystem/local-fs-adapter.ts` | `infrastructure/filesystem/local-fs-adapter.ts` | Deduplicate |

### Service Location Analysis

| Location | File Count | Status | Action |
|----------|-----------|--------|--------|
| `src/lib/` | 350+ | DEPRECATED | Migrate all to domain/infrastructure |
| `src/domain/services/` | 15 | CANONICAL | Keep and expand |
| `src/infrastructure/` | 250+ | CANONICAL | Keep as primary |
| `src/application/services/` | 2 | CANONICAL | Keep for application layer |

---

## 4. Component Duplications

| Component Type | Legacy Location | Plugin Location | Consolidation Plan |
|---------------|-----------------|-----------------|-------------------|
| **Notes Components** | `presentation/components/notes/` (50+ files) | `plugins/notes/NotesPlugin.tsx` | Plugin wraps presentation components - OK |
| **IDE Components** | `presentation/components/ide/` (40+ files) | `plugins/monaco/`, `plugins/filetree/`, `plugins/terminal/` | Plugins wrap presentation - OK |
| **Chat Components** | `presentation/components/chat/` | `plugins/chat/ChatPlugin.tsx` | Plugin wraps presentation - OK |
| **RAG Components** | `components/rag/` (ORPHAN) | `presentation/components/rag/` | Merge orphan to presentation |
| **Terminal Components** | `presentation/components/terminal/` | `plugins/terminal/TerminalPlugin.tsx` | Verify no duplication |

### Orphan Component Directories

| Directory | Files | Status | Action |
|-----------|-------|--------|--------|
| `src/components/rag/` | 4 | ORPHAN | Merge to `presentation/components/rag/` |
| `src/core/entities/` | 5 | DUPLICATE | Facade for domain/entities - verify re-exports |

### Presentation Component Count by Domain

| Domain | File Count | God Components | Needs Split |
|--------|-----------|----------------|-------------|
| `notes/` | 50+ | 3 | NotesPage, NoteEditor, AISlashCommand |
| `ide/` | 40+ | 2 | MonacoEditor, AgentChatPanel |
| `hub/` | 15+ | 0 | None |
| `ui/` | 30+ | 1 | resizable.tsx (763 lines) |
| `chat/` | 10+ | 0 | None |

---

## 5. Naming Convention Violations

| File | Current Name | Recommended | Rule Violated |
|------|--------------|-------------|---------------|
| `core/entities/Project.ts` | PascalCase | `project.ts` | Files should be kebab-case |
| `core/entities/Workspace.ts` | PascalCase | `workspace.ts` | Files should be kebab-case |
| `core/entities/Agent.ts` | PascalCase | `agent.ts` | Files should be kebab-case |
| `core/entities/Conversation.ts` | PascalCase | `conversation.ts` | Files should be kebab-case |
| `core/entities/Provider.ts` | PascalCase | `provider.ts` | Files should be kebab-case |
| `lib/context/NoteContentRetriever.ts` | PascalCase | `note-content-retriever.ts` | Files should be kebab-case |
| `lib/context/ContextInjector.ts` | PascalCase | `context-injector.ts` | Files should be kebab-case |
| `lib/context/RAGQueryService.ts` | PascalCase | `rag-query-service.ts` | Files should be kebab-case |
| `lib/context/ContextEngine.ts` | PascalCase | `context-engine.ts` | Files should be kebab-case |
| `lib/keyboard/KeyboardShortcutManager.ts` | PascalCase | `keyboard-shortcut-manager.ts` | Files should be kebab-case |
| `application/services/AgentService.ts` | PascalCase | `agent-service.ts` | Files should be kebab-case |
| `application/services/ProviderService.ts` | PascalCase | `provider-service.ts` | Files should be kebab-case |
| `infrastructure/filesystem/StorageAdapterFactory.ts` | PascalCase | `storage-adapter-factory.ts` | Files should be kebab-case |
| `domain/services/ProjectRegistry.ts` | PascalCase | `project-registry.ts` | Files should be kebab-case |
| `domain/services/AgentProviderValidator.ts` | PascalCase | `agent-provider-validator.ts` | Files should be kebab-case |

### Naming Pattern Statistics

| Pattern | Count | Standard | Action |
|---------|-------|----------|--------|
| kebab-case files | ~1,600 | CORRECT | Keep |
| PascalCase files | ~40 | INCORRECT | Rename to kebab-case |
| camelCase files | ~96 | MIXED | Evaluate per file |

---

## 6. spike/ Folder Analysis (CRITICAL - 19,662 files!)

The `spike/` folder contains **massive duplication** of the main src/ codebase.

| Category | spike/ Files | src/ Equivalent | Status |
|----------|-------------|-----------------|--------|
| Domain entities | Full copy | `domain/entities/` | DUPLICATE |
| Infrastructure | Full copy | `infrastructure/` | DUPLICATE |
| Presentation | Full copy | `presentation/` | DUPLICATE |
| Lib | Full copy | `lib/` | DUPLICATE |
| Tests | Full copy | Various `__tests__/` | DUPLICATE |

### Recommended Action
```
1. ARCHIVE entire spike/ folder to _bmad-ext/.archive/spike-codebase-2026-01-26/
2. Remove from git tracking
3. Update any imports that reference spike/
4. Estimated reduction: 19,662 files
```

---

## 7. Barrel Export Analysis

| Directory | Has index.ts | Export Pattern | Issue |
|-----------|-------------|----------------|-------|
| `lib/agent/tools/` | Yes | Named exports | OK |
| `lib/notes/` | Yes | Mixed | Needs cleanup |
| `lib/filesystem/` | Yes | Named exports | OK |
| `infrastructure/persistence/stores/` | **No** | Direct imports | **Missing barrel** |
| `infrastructure/sync/` | Yes | Named exports | OK |
| `domain/entities/` | **No** | Direct imports | **Missing barrel** |
| `domain/services/` | Yes | Named exports | OK |
| `presentation/components/` | **No** | Direct imports | **Missing barrel** (too large) |

### Barrel Export Recommendations

| Action | Target | Impact |
|--------|--------|--------|
| ADD | `infrastructure/persistence/stores/index.ts` | Centralize store exports |
| ADD | `domain/entities/index.ts` | Centralize entity exports |
| KEEP | No barrel for presentation/components | Too many files, use direct imports |

---

## Consolidation Impact

| Category | Current | After Consolidation | Reduction |
|----------|---------|---------------------|-----------|
| **spike/ folder** | 19,662 files | 0 (archived) | -19,662 |
| **lib/ folder** | 350+ files | ~50 (essential only) | -300 |
| **God files split** | 47 god files | 47 × 3 slices = 141 | +94 (controlled) |
| **Duplicate services** | 15 duplicates | 0 | -15 |
| **Duplicate types** | 10+ duplicates | 0 | -10 |
| **PascalCase files** | 40 files | 0 (renamed) | 0 (rename only) |

### Final Numbers

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total files | ~21,400 | ~1,500 | **-93%** |
| src/ files | 1,736 | ~1,200 | **-31%** |
| Active code lines | ~358,000 | ~250,000 | **-30%** |

---

## Priority Remediation Stories

### P0 - CRITICAL (Do First)

| Story ID | Title | Impact | Effort |
|----------|-------|--------|--------|
| CLEANUP-01 | Archive spike/ folder | -19,662 files | 1h |
| CLEANUP-02 | Split ProviderService.ts (1943 lines) | Maintainability | 4h |
| CLEANUP-03 | Split dexie-db-migrations.ts (1746 lines) | Maintainability | 3h |

### P1 - HIGH (Next Sprint)

| Story ID | Title | Impact | Effort |
|----------|-------|--------|--------|
| CLEANUP-04 | Split AISlashCommand.tsx (1674 lines) | Component health | 3h |
| CLEANUP-05 | Consolidate FileSyncService implementations | Single source | 2h |
| CLEANUP-06 | Split PluginLayout.tsx (806 lines) | Component health | 2h |

### P2 - MEDIUM (Following Sprint)

| Story ID | Title | Impact | Effort |
|----------|-------|--------|--------|
| CLEANUP-07 | Migrate lib/ services to infrastructure | Clean architecture | 8h |
| CLEANUP-08 | Rename PascalCase files to kebab-case | Consistency | 2h |
| CLEANUP-09 | Add missing barrel exports | Import simplification | 2h |

### P3 - LOW (Backlog)

| Story ID | Title | Impact | Effort |
|----------|-------|--------|--------|
| CLEANUP-10 | Consolidate type definitions | Single source | 4h |
| CLEANUP-11 | Split remaining god files (300-500 lines) | Maintainability | 8h |
| CLEANUP-12 | Merge orphan components | Clean structure | 2h |

---

## Appendix A: Full God File List (>300 lines)

```
1943  src/application/services/ProviderService.ts
1746  src/infrastructure/persistence/dexie-db-migrations.ts
1674  src/presentation/components/notes/AISlashCommand.tsx
1321  src/lib/templates/template-registry.ts
1213  src/infrastructure/persistence/dexie-db.ts
1102  src/presentation/components/notes/NotesPage.tsx
1094  src/lib/agent/__tests__/tool-permission-manager.test.ts
1088  src/presentation/components/notes/NoteEditor.tsx
 906  src/infrastructure/persistence/workflow-persistence.test.ts
 888  src/infrastructure/events/event-bus.ts
 855  src/routes/$__debug__.provider-playground.tsx
 850  src/lib/notes/prompt-templates-data.ts
 833  src/infrastructure/filesystem/file-tree-scanner.ts
 816  src/infrastructure/filesystem/fsa-gateway.ts
 806  src/presentation/layouts/PluginLayout.tsx
 804  src/lib/sync/__tests__/reverse-sync-service.test.ts
 791  src/lib/git/git-client.ts
 772  src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx
 766  src/lib/workflow/builder/workflow-builder-store.test.ts
 763  src/presentation/components/ui/resizable.tsx
 752  src/lib/workflow/agents/debate-agent.ts
 751  src/infrastructure/filesystem/terminal-fs-adapter.ts
 727  src/lib/workflow/executor/workflow-executor.test.ts
 725  src/lib/agent/hooks/use-agent-chat-with-tools.ts
 724  src/domain/services/universal-provider-registry.ts
 713  src/lib/workflow/executor/workflow-executor.ts
 700  src/presentation/components/notes/blocks/MultiStepGenerationBlock.tsx
 697  src/infrastructure/filesystem/markdown-sync-service.ts
 696  src/lib/navigation/symbol-parser.ts
 691  src/presentation/components/ide/AgentChatPanel.tsx
 684  src/presentation/components/notes/blocks/ArtifactGalleryBlock.tsx
 679  src/__tests__/epic-40-integration.test.ts
 677  src/lib/workspace/__tests__/session-snapshot.test.ts
 674  src/e2e/__tests__/epic-e1-cross-workspace-chat.e2e.test.tsx
 672  src/infrastructure/filesystem/viagent-service.ts
 672  src/infrastructure/filesystem/fsa-storage-adapter.ts
 670  src/lib/agent/tools/__tests__/retry-queue.test.ts
 659  src/lib/plugins/plugin-manager.ts
 657  src/presentation/components/notes/SlashCommandManager.tsx
 649  src/routeTree.gen.ts
 645  src/lib/rag/incremental-indexing-service.ts
 644  src/lib/rag/orama-index.ts
 640  src/__tests__/chat.test.ts
 637  src/lib/agent/tools/note-commands.ts
 618  src/domain/services/file-crud/unified-file-crud.ts
 617  src/presentation/components/notes/blocks/VideoGenerationBlock.tsx
 614  src/infrastructure/filesystem/__tests__/platform-routing.integration.test.ts
 611  src/lib/terminal/terminal-emulator.ts
 606  src/application/services/__tests__/provider-service.integration.test.ts
```

---

## Appendix B: Store Duplication Map

| Store Name | lib/ Location | infrastructure/ Location | Canonical |
|------------|--------------|--------------------------|-----------|
| snippet-store | `lib/snippets/snippet-store.ts` | None | Keep in lib (domain-specific) |
| note-store | `lib/notes/note-store.ts` | `infrastructure/persistence/stores/notes/` | Infrastructure |
| file-snapshot-store | `lib/filesystem/file-snapshot-store.ts` | `infrastructure/persistence/stores/filesystem/` | Infrastructure |
| file-sync-status-store | `lib/workspace/file-sync-status-store/` | None | Move to infrastructure |
| workflow-builder-store | `lib/workflow/builder/` | None | Move to infrastructure |
| threads-store | `lib/workspace/threads-store.ts` | `infrastructure/persistence/stores/conversation/` | Infrastructure |
| prompt-suggestion-store | `lib/notes/prompt-suggestion-store.ts` | None | Move to infrastructure |
| slash-command-store | `lib/notes/slash-command-store.ts` | `infrastructure/persistence/stores/notes/slash-commands/` | Infrastructure |
| ai-loading-store | `lib/notes/ai-loading-store.ts` | None | Move to infrastructure |
| note-navigation-store | `lib/notes/note-navigation-store.ts` | None | Move to infrastructure |
| prompt-history-store | `lib/notes/prompt-history-store.ts` | None | Move to infrastructure |
| ai-prompt-store | `lib/notes/ai-prompt-store.ts` | None | Move to infrastructure |
| saved-blocks-store | `lib/notes/saved-blocks-store.ts` | None | Move to infrastructure |
| ai-insertion-store | `lib/notes/ai-insertion-store.ts` | None | Move to infrastructure |

---

**Report Generated By**: deep-scan-state-scanner
**Execution Time**: ~5 minutes
**Evidence Quality**: HIGH (grep + find + wc verification)
