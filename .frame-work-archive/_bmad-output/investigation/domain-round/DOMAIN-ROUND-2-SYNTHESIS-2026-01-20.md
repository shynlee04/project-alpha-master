---
investigation_id: "DOMAIN-ROUND-2-SYNTHESIS"
created: "2026-01-20T22:00:00+07:00"
scope:
  - "IDE space comprehensive lifecycle analysis"
  - "Notes space comprehensive lifecycle analysis"
  - "Cross-space file inventory consolidation"
  - "Uncleaned, overlapping, conflicting files identification"
  - "Prioritized remediation backlog"
agent: "analyst-ext"
handoff_from: "deep-scan-orchestrator, deep-scan-architecture-scanner, deep-scan-state-scanner, deep-scan-workspace-scanner"
---

# Round 2: Domain & Cross-Domain Investigation Synthesis

## Executive Summary

This synthesis consolidates findings from **8 parallel sub-agents** (4 for IDE space, 4 for Notes space) investigating the complete lifecycle of both workspaces. The investigation reveals **143+ files** involved in IDE/Notes operations, **47 critical issues** (P0-P1), and **5 categories of architectural debt** requiring remediation.

### Key Metrics

| Metric | IDE Space | Notes Space | Combined |
|--------|-----------|-------------|----------|
| **Total Files Analyzed** | 80+ | 60+ | 143+ |
| **God Components (>300 lines)** | 5 | 5 | 10 |
| **Cross-Layer Violations** | 12 | 12 | 24 |
| **Deprecated Imports** | 54+ | 82+ | 136+ |
| **P0 Critical Issues** | 7 | 7 | 14 |
| **P1 High Priority Issues** | 16 | 16 | 32 |

### Critical Findings Overview

| Category | Count | Top Priority Items |
|----------|-------|-------------------|
| Duplicate Adapters | 3 | `fsa-storage-adapter.ts` vs `fsa-gateway.ts` (673 vs 711 lines) |
| God Components | 10 | `MonacoEditor.tsx`: 773, `AgentChatPanel.tsx`: 692, `NotesPage.tsx`: 975, `NoteEditor.tsx`: 1089 |
| Cross-Layer Violations | 24 | Domain importing infrastructure types (e.g., `NoteRecord`) |
| Duplicate Stores | 2 | Note store exists in both `lib/notes/` and `infrastructure/persistence/stores/notes/` |
| Memory Leaks | 8 | Missing cleanup in useEffect, editor disposal |

---

## Part 1: IDE Space Comprehensive Lifecycle

### 1.1 IDE Route/State Lifecycle Flow

```
User Navigation → Route Guard → Loader → Hydration → Store → Components
     ↓              ↓            ↓          ↓          ↓         ↓
/ide/$projectId requireIDE  waitFor   useFile    IDELayout Monaco Editor
              Access()     Hydration Loader    Main     FileTree
```

### 1.2 IDE Files Inventory (80+ files)

#### Routes (2 files)
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/routes/ide.tsx` | 146 | Parent route (empty state) | Platform detection, navigation scattering |
| `src/routes/ide.$projectId.tsx` | 111 | Project-specific IDE route | Imports deprecated ProjectContext |

#### Guards & Loaders (3 files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/infrastructure/filesystem/route-guards.ts` | 36 | Platform validation guard |
| `src/infrastructure/filesystem/platform-contract.ts` | 342 | Platform detection contract |
| `src/infrastructure/persistence/stores/project/wait-for-hydration.ts` | 44 | Hydration utility |

#### State Stores - Infrastructure (12 files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/infrastructure/persistence/stores/project/useProjectStore.ts` | 400+ | Project CRUD store |
| `src/infrastructure/persistence/stores/project/project-crud-slice.ts` | 316 | Project CRUD operations |
| `src/infrastructure/persistence/stores/workspace/workspace-store.ts` | 227 | Workspace state |
| `src/infrastructure/persistence/stores/workspace/unified-workspace-context.ts` | 371 | Unified context provider |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-loader-slice.ts` | 205 | Project loading |
| `src/infrastructure/persistence/stores/workspace/slices/use-file-ops-slice.ts` | 313 | File operations |
| `src/infrastructure/persistence/stores/workspace/slices/use-storage-adapter-slice.ts` | 358 | Sync management |
| `src/infrastructure/persistence/stores/workspace/slices/use-vfs-sync-slice.ts` | ~150 | VFS sync |

#### IDE Components (8 major files)
| Component | Lines | Limit | Issues |
|-----------|-------|-------|--------|
| `MonacoEditor.tsx` | 773 | 300 | 15+ useEffect chains, no disposal, no ErrorBoundary |
| `AgentChatPanel.tsx` | 692 | 300 | Complex conversation management, memory leak risk |
| `IDEResizableLayout.tsx` | ~400 | 300 | Complex state management |
| `FileTree.tsx` | ~400 | 300 | Inline handlers, mixed concerns |
| `IDELayoutMain.tsx` | 359 | 300 | Platform-specific logic mixing |
| `XTerminal.tsx` | ~300 | 300 | Well-structured |
| `IDESidebarPanels.tsx` | ~200 | 300 | Well-structured |
| `StatusBar.tsx` | ~200 | 300 | Well-structured |

#### Infrastructure Adapters (4 files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/infrastructure/filesystem/local-fs-adapter.ts` | ~300 | Local FS adapter |
| `src/infrastructure/filesystem/ide-file-gateway.ts` | ~500 | IDE file gateway |
| `src/infrastructure/webcontainer/fsa-adapter.ts` | ~400 | WebContainer FSA adapter |
| `src/infrastructure/sync/sync-manager.ts` | ~500 | Sync manager |

#### Legacy Lib Files (8 files)
| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `src/lib/workspace/ProjectContext.tsx` | ~200 | Project context | Deprecated |
| `src/lib/filesystem/permission-lifecycle.ts` | ~300 | Permission handling | Deprecated |
| `src/lib/filesystem/unified-storage-adapter.ts` | ~400 | Storage adapter | Duplicate |
| `src/lib/events/workspace-events.ts` | ~200 | Workspace events | Deprecated |
| `src/lib/webcontainer/index.ts` | ~100 | WebContainer utilities | Deprecated |

---

## Part 2: Notes Space Comprehensive Lifecycle

### 2.1 Notes Route/State Lifecycle Flow

```
User Navigation → Route Guard → Loader → Hydration → NotesPage → NoteEditor
     ↓              ↓            ↓          ↓           ↓           ↓
/notes/$projectId Platform   waitFor   useNote    BlockNote    File Tree
               Detection   Hydration Store      Editor      Sidebar
```

### 2.2 Notes Files Inventory (60+ files)

#### Routes (2 files)
| File | Lines | Purpose | Issues |
|------|-------|---------|--------|
| `src/routes/notes.lazy.tsx` | 173 | Redirect route | ~80 BUG-FIX comments, deprecated imports |
| `src/routes/notes.$projectId.tsx` | 101 | Workspace route | Uses deprecated ProjectContext |

#### State Stores - Duplicate Implementations (20+ files)
| Location | File | Lines | Purpose | Status |
|----------|------|-------|---------|--------|
| `lib/notes/` | `note-store-refactored.ts` | 208 | Main store | Active, wrong location |
| `lib/notes/slices/` | `note-crud-slice.ts` | ~442 | CRUD operations | Has P0 violation |
| `lib/notes/slices/` | `note-metadata-slice.ts` | ~137 | Metadata | Has P0 violation |
| `lib/notes/slices/` | `note-indexing-slice.ts` | ~127 | RAG indexing | Has P0 violation |
| `infrastructure/persistence/stores/notes/` | `note-context-tracker.ts` | ~100 | Context tracking | Incomplete |

#### Notes Components (8 major files)
| Component | Lines | Limit | Issues |
|-----------|-------|-------|--------|
| `NoteEditor.tsx` | 1089 | 300 | 7 custom blocks, 5+ useEffect, inline handlers |
| `NotesPage.tsx` | 975 | 300 | 8+ useEffect chains, mobile/desktop mixing |
| `ProjectFilesPanel.tsx` | 429 | 300 | Complex state, memory leak risk |
| `NoteSidebar.tsx` | 411 | 300 | Inline handlers, complex filtering |
| `AIPromptDialog.tsx` | 415 | 300 | Complex dialog state |
| `NoteTree.tsx` | 82 | 300 | Well-structured |
| `NoteTreeItem.tsx` | 163 | 300 | Good structure |
| `NotesMobileLayout.tsx` | 266 | 300 | Good structure |

#### Block Components (20 files)
Custom BlockNote blocks including ImageBlock, CodeFileBlock, AIVisionBlock, StoryboardBlock, VideoBlock, TTSBlock, ArtifactBlock, CalloutBlock, and more.

#### AI Feature Components (12 files)
AISlashCommand, AITransformMenu, AIPromptDialog, and related AI-powered components.

---

## Part 3: Cross-Space Analysis

### 3.1 Shared Dependencies

Both IDE and Notes spaces share the following infrastructure:

| Shared Component | IDE | Notes | Issues |
|------------------|-----|-------|--------|
| `useProjectStore` | ✅ | ✅ | Cross-store dependencies |
| `waitForHydration()` | ✅ | ✅ | Duplicated in routes |
| `StorageGateway` | ✅ | ✅ | Duplicate implementations |
| `ProjectContext` | ✅ | ✅ | Deprecated location |
| `SyncManager` | ✅ | ✅ | Cross-workspace event bus |

### 3.2 Duplicate Files Across Spaces

| Duplicate | IDE | Notes | Recommendation |
|-----------|-----|-------|----------------|
| `fsa-storage-adapter.ts` (673) | ✅ | ✅ | Merge with `fsa-gateway.ts` |
| `fsa-gateway.ts` (~711) | ✅ | ✅ | Keep single implementation |
| `ProjectContext.tsx` | ✅ | ✅ | Migrate to unified context |
| `waitForHydration()` | ✅ | ✅ | Extract to shared middleware |

### 3.3 Cross-Layer Violations (24 total)

#### Domain → Infrastructure (6 violations)
| File | Line | Import | Violation |
|------|------|--------|-----------|
| `note-gateway.ts` | 23 | `NoteRecord` from `dexie-db` | Domain imports infrastructure type |
| `unified-file-crud.ts` | 32-34 | `FileLock`, `WorkspaceEventEmitter` from `lib/` | Domain imports lib types |

#### Infrastructure → Lib (18 violations)
| File | Count | Imports from |
|------|-------|--------------|
| `use-file-ops-slice.ts` | 5 | `@/lib/filesystem/*` |
| `use-file-loader-slice.ts` | 1 | `@/lib/filesystem/*` |
| `use-storage-adapter-slice.ts` | 2 | `@/lib/filesystem/*`, `@/lib/events/*` |
| `note-crud-slice.ts` | 1 | `useProjectStore` from infrastructure |
| `note-metadata-slice.ts` | 1 | `useProjectStore` from infrastructure |
| `note-indexing-slice.ts` | 1 | `useProjectStore` from infrastructure |

---

## Part 4: Uncleaned, Overlapping, Conflicting Files

### 4.1 Uncleaned Files (Technical Debt Markers)

#### Files with BUG-FIX Comments
| File | Count | Examples |
|------|-------|----------|
| `notes.lazy.tsx` | ~10 | BUG-FIX-006, BUG-FIX-010, BUG-015, BUG-019, BUG-021 |
| `note-folder-bridge.ts` | ~5 | BUG-013 FIX |
| `ide.$projectId.tsx` | ~3 | Various fix comments |
| `notes.$projectId.tsx` | ~2 | INF-03 FIX |

#### Files with TODO Comments
| File | Count |
|------|-------|
| `NotesPage.tsx` | ~5 |
| `ProjectCreationWizard.tsx` | ~3 |
| `MonacoEditor.tsx` | ~2 |
| `note-gateway.ts` | ~1 |

### 4.2 Overlapping Files (Duplicate Functionality)

| File A | Lines | File B | Lines | Overlap |
|--------|-------|--------|-------|---------|
| `fsa-storage-adapter.ts` | 673 | `fsa-gateway.ts` | 711 | 85% duplicate FSA operations |
| `local-fs-adapter.ts` | ~300 | `ide-file-gateway.ts` | ~500 | Overlapping file I/O |
| `ProjectContext.tsx` | ~507 | `unified-workspace-context.ts` | 371 | Duplicate context providers |

### 4.3 Conflicting Files (Import Conflicts)

| File | Conflict Type | Resolution |
|------|---------------|------------|
| `lib/notes/note-store.ts` | Duplicate store exports | Delete facade |
| `infrastructure/persistence/stores/notes/` | Incomplete store location | Complete migration |
| `src/lib/filesystem/index.ts` | Facade deadline passed | Remove facade, update 54 consumers |

### 4.4 Files That Block Other Files

| Blocking File | Blocked By | Blocker Issue |
|---------------|------------|---------------|
| `StorageAdapterFactory.ts` | Mobile persistence | Missing DexieStorageAdapter |
| `DexieStorageAdapter` | Mobile IDE | Not implemented |
| `waitForHydration` middleware | Route optimization | No shared middleware |
| `ProjectContext` migration | Route cleanup | Still imported in routes |

---

## Part 5: God Components Analysis

### 5.1 IDE Space God Components

| Component | Lines | Limit | Exceeds By | Primary Issues |
|-----------|-------|-------|------------|----------------|
| `MonacoEditor.tsx` | 773 | 300 | 158% | 15+ useEffect chains, no editor disposal, no ErrorBoundary |
| `AgentChatPanel.tsx` | 692 | 300 | 131% | Complex conversation management, memory leak risk |
| `IDEResizableLayout.tsx` | ~400 | 300 | 33% | Complex state management |
| `FileTree.tsx` | ~400 | 300 | 33% | Inline handlers, mixed concerns |
| `IDELayoutMain.tsx` | 359 | 300 | 20% | Platform-specific logic mixing |

### 5.2 Notes Space God Components

| Component | Lines | Limit | Exceeds By | Primary Issues |
|-----------|-------|-------|------------|----------------|
| `NoteEditor.tsx` | 1089 | 300 | 263% | 7 custom blocks, 5+ useEffect, inline handlers |
| `NotesPage.tsx` | 975 | 300 | 225% | 8+ useEffect chains, mobile/desktop mixing |
| `AIPromptDialog.tsx` | 415 | 300 | 38% | Complex dialog state |
| `NoteSidebar.tsx` | 411 | 300 | 37% | Inline handlers, complex filtering |
| `ProjectFilesPanel.tsx` | 429 | 300 | 43% | Complex useEffect, state management |

### 5.3 God Stores Analysis

| Store | Lines | Limit | Issues |
|-------|-------|-------|--------|
| `useConversationStore.ts` | ~600 | 300 | ~200 lines over limit |
| `note-crud-slice.ts` | ~442 | 300 | Mixed concerns |
| `useIDEStore.ts` | ~300 | 300 | At limit, needs refactoring |
| `useProjectStore.ts` | ~400 | 300 | Project CRUD mixed with state |

---

## Part 6: Priority Remediation Backlog

### P0 - Critical (Must Fix Before Phase 2)

| # | File | Issue | Action | Est. Lines |
|---|------|-------|--------|------------|
| 1 | `fsa-storage-adapter.ts` + `fsa-gateway.ts` | Duplicate adapters (673 + 711 lines) | Merge into single `StorageGateway` implementation | -700 |
| 2 | `note-gateway.ts:23` | Domain imports `NoteRecord` from infrastructure | Move `NoteRecord` to domain layer | 50 |
| 3 | `unified-file-crud.ts:32-34` | Domain imports lib types | Move types to domain layer | 30 |
| 4 | `use-file-ops-slice.ts` (5 imports) | Infrastructure importing lib | Update imports to canonical paths | 20 |
| 5 | `use-file-loader-slice.ts` (1 import) | Infrastructure importing lib | Update imports to canonical paths | 5 |
| 6 | `use-storage-adapter-slice.ts` (2 imports) | Infrastructure importing lib/events | Update imports to canonical paths | 10 |
| 7 | `note-crud-slice.ts:27` | lib/notes importing infrastructure | Move store to infrastructure | 100 |
| 8 | `note-metadata-slice.ts:17` | lib/notes importing infrastructure | Move store to infrastructure | 50 |
| 9 | `note-indexing-slice.ts:19` | lib/notes importing infrastructure | Move store to infrastructure | 50 |
| 10 | `lib/notes/note-store-refactored.ts` | Wrong location (208 lines) | Move to `infrastructure/persistence/stores/notes/` | 0 |
| 11 | `MonacoEditor.tsx` | Memory leak (no disposal) | Add editor disposal on unmount | 20 |
| 12 | `NotesPage.tsx` | God component (975 lines) | Split into hooks and layout | -600 |
| 13 | `NoteEditor.tsx` | God component (1089 lines) | Split into hooks and blocks | -700 |
| 14 | `src/lib/filesystem/index.ts` | Facade deadline passed | Remove facade, update 54 consumers | -200 |

### P1 - High (Sprint 1)

| # | File | Issue | Action | Est. Lines |
|---|------|-------|--------|------------|
| 15 | `DexieStorageAdapter` | Missing implementation | Implement for mobile persistence | 300 |
| 16 | `ProjectContext.tsx` | Duplicate context | Migrate to unified context | 100 |
| 17 | `waitForHydration()` | Duplicated in routes | Extract to shared middleware | -50 |
| 18 | `notes.lazy.tsx` | ~80 BUG-FIX comments | Consolidate to CHANGELOG | -100 |
| 19 | `ProjectCreationWizard.tsx` | Wizard state not extracted | Create `useProjectCreationWizard` hook | -200 |
| 20 | `AgentChatPanel.tsx` | God component (692 lines) | Split into sub-components | -350 |
| 21 | `FileTree.tsx` | God component (~400 lines) | Extract handlers to hooks | -100 |
| 22 | `NoteSidebar.tsx` | God component (411 lines) | Extract handlers to hooks | -100 |
| 23 | `ProjectFilesPanel.tsx` | Memory leak risk | Fix useEffect cleanup | 30 |
| 24 | `useConversationStore.ts` | God store (~600 lines) | Split into focused slices | -200 |
| 25 | `ide.tsx` | Navigation scattering | Create `NavigationService` | 100 |
| 26 | `useContextMenuActions.ts` | Complex hook (368 lines) | Split into focused handlers | -100 |
| 27 | `useLazyFileContent.ts` | Complex hook (363 lines) | Simplify file loading | -50 |
| 28 | `useChatExport.ts` | Complex hook (347 lines) | Extract export logic | -50 |
| 29 | `useFileTreeActions.ts` | Complex hook (284 lines) | Split handlers | -50 |
| 30 | `IDE ResizableLayout.tsx` | God component (~400 lines) | Extract layout logic | -100 |

### P2 - Medium (Sprint 2)

| # | File | Issue | Action |
|---|------|-------|--------|
| 31 | Various | 80+ TODO comments | Move to tracked issues |
| 32 | Various | 50+ BUG-FIX comments | Clean production code |
| 33 | `NotesRAGSearch.tsx` | Missing loading states | Add loading UI |
| 34 | `NoteTree.tsx` | Missing error boundary | Add ErrorBoundary |
| 35 | `IDELayoutMain.tsx` | Platform logic mixing | Separate concerns |
| 36 | `FileSystemObserver` | Hardcoded polling (2s) | Make configurable |
| 37 | `AIPromptDialog.tsx` | God component (415 lines) | Split dialog logic |
| 38 | `unified-workspace-context.ts` | 10+ slices | Consider decomposition |

### P3 - Low (Post-Stabilization)

| # | File | Issue | Action |
|---|------|-------|--------|
| 39 | `WebContainerFSAAdapter.ts` | Large class (480 lines) | Split into modules |
| 40 | `ide-file-gateway.ts` | Overlapping with FSA adapter | Consolidate |
| 41 | `local-fs-adapter.ts` | Overlapping with gateway | Consolidate |
| 42 | BlockNote blocks | 20 custom blocks | Document patterns |
| 43 | AI feature components | 12 components | Standardize patterns |

---

## Part 7: Recommendations Summary

### Immediate Actions (Before Any New Features)

1. **Consolidate Storage Adapters**
   - Merge `fsa-storage-adapter.ts` and `fsa-gateway.ts` into single implementation
   - Implement missing `DexieStorageAdapter` for mobile

2. **Fix Cross-Layer Violations**
   - Move `NoteRecord` type to domain layer
   - Move `FileLock` and `WorkspaceEventEmitter` to domain
   - Update all 136+ deprecated imports

3. **Consolidate Note Stores**
   - Move `lib/notes/note-store-refactored.ts` → `infrastructure/persistence/stores/notes/`
   - Delete duplicate `lib/notes/note-store.ts` facade
   - Update all 82 consumers

4. **Split God Components**
   - `MonacoEditor.tsx`: Extract editor lifecycle hooks, add disposal
   - `NotesPage.tsx`: Extract file sync logic, mobile layout
   - `NoteEditor.tsx`: Extract block sanitization, save logic

### Short-Term (Next Sprint)

1. **Create Shared Middleware**
   - Extract `waitForHydration` to shared module
   - Apply to all routes requiring hydrated state

2. **Clean Technical Debt**
   - Consolidate BUG-FIX comments to CHANGELOG
   - Remove historical fix comments from production code

3. **Implement Missing Features**
   - DexieStorageAdapter for mobile persistence
   - Manual conflict resolution UI

### Medium-Term (Following Sprint)

1. **Refactor State Management**
   - Decompose god stores into focused slices
   - Standardize CRUD patterns across all stores

2. **Improve Error Handling**
   - Add ErrorBoundaries to all god components
   - Implement proper error boundaries in routes

3. **Performance Optimization**
   - Add loading states to lazy-loaded components
   - Optimize file watching with adaptive polling

---

## Appendix A: Complete File Inventory

### IDE Space Files (80+)

```
src/routes/
├── ide.tsx (146)
└── ide.$projectId.tsx (111)

src/infrastructure/filesystem/
├── route-guards.ts (36)
├── platform-contract.ts (342)
├── local-fs-adapter.ts (~300)
├── ide-file-gateway.ts (~500)
└── fsa-storage-adapter.ts (673)

src/infrastructure/webcontainer/
└── fsa-adapter.ts (~400)

src/infrastructure/sync/
└── sync-manager.ts (~500)

src/infrastructure/persistence/stores/
├── project/
│   ├── useProjectStore.ts (400+)
│   ├── project-crud-slice.ts (316)
│   └── wait-for-hydration.ts (44)
└── workspace/
    ├── workspace-store.ts (227)
    ├── unified-workspace-context.ts (371)
    └── slices/
        ├── use-file-loader-slice.ts (205)
        ├── use-file-ops-slice.ts (313)
        ├── use-storage-adapter-slice.ts (358)
        └── use-vfs-sync-slice.ts (~150)

src/presentation/components/ide/
├── MonacoEditor/
│   ├── MonacoEditor.tsx (773)
│   ├── EditorTabBar.tsx (100)
│   └── hooks/*.ts (~500)
├── FileTree/
│   ├── FileTree.tsx (348)
│   ├── FileTreeItem.tsx (374)
│   └── hooks/*.ts (~1000)
├── AgentChatPanel.tsx (692)
├── IDELayout/
│   ├── IDELayoutMain.tsx (359)
│   ├── IDEResizableLayout.tsx (~400)
│   └── IDESidebarPanels.tsx (~200)
└── StatusBar.tsx (~200)

src/lib/workspace/
└── ProjectContext.tsx (~200)

src/lib/filesystem/
├── permission-lifecycle.ts (~300)
├── unified-storage-adapter.ts (~400)
└── index.ts (facade)

src/lib/events/
└── workspace-events.ts (~200)
```

### Notes Space Files (60+)

```
src/routes/
├── notes.lazy.tsx (173)
└── notes.$projectId.tsx (101)

src/presentation/components/notes/
├── NoteEditor.tsx (1089)
├── NotesPage.tsx (975)
├── NoteSidebar.tsx (411)
├── NoteTree.tsx (82)
├── NoteTreeItem.tsx (163)
├── ProjectFilesPanel.tsx (429)
├── NotesMobileLayout.tsx (266)
├── AIPromptDialog.tsx (415)
├── NotesRAGSearch.tsx (~135)
└── blocks/ (20 files)

src/lib/notes/
├── note-store.ts (40)
├── note-store-refactored.ts (208)
└── slices/
    ├── note-crud-slice.ts (~442)
    ├── note-metadata-slice.ts (~137)
    ├── note-query-slice.ts (~38)
    ├── note-sync-slice.ts (~107)
    ├── note-indexing-slice.ts (~127)
    ├── note-events-slice.ts (~81)
    └── note-ui-slice.ts (~26)

src/infrastructure/persistence/stores/notes/
├── index.ts (10)
├── note-context-tracker.ts (~100)
└── slash-commands/ (~200)

src/infrastructure/sync/workspace-services/notes/
├── notes-file-sync-service.ts (~300)
├── note-folder-bridge.ts (~250)
└── note-crud-operations.ts (~150)
```

---

## Appendix B: Investigation Evidence

### Sub-Agents Used

| Agent | Investigation Focus | Files Analyzed |
|-------|--------------------|----------------|
| `deep-scan-orchestrator` | IDE Route/Guard/Loader/State | 42 files |
| `deep-scan-architecture-scanner` | IDE Components (Monaco, FileTree, Tabs, Panels) | 80+ files |
| `deep-scan-state-scanner` | IDE Hooks/Services | 32+ files |
| `deep-scan-workspace-scanner` | IDE Persistence (WebContainer, FSA, Dexie) | 48 files |
| `deep-scan-orchestrator` | Notes Route/Guard/Loader/State | 105+ files |
| `deep-scan-architecture-scanner` | Notes Components (Editor, Sidebar, Tree, Panels) | 60+ files |
| `deep-scan-state-scanner` | Notes Hooks/Services | 32+ files |
| `deep-scan-workspace-scanner` | Notes Persistence (FSA, Dexie, BlockNote Sync) | 48 files |

### Tools Used

- **grep**: Pattern matching for imports, exports, function definitions
- **glob**: File discovery by pattern
- **read**: Deep investigation of specific code sections
- **Symbol analysis**: TypeScript type hierarchy analysis

---

*Report generated as part of Round 2 Domain & Cross-Domain Investigation*
*Investigation ID: DOMAIN-ROUND-2-SYNTHESIS*
*Date: 2026-01-20*
