# TEAM B Architectural Remediation - Consolidated Investigation Report

**Session ID**: `team-b-architectural-remediation-2026-01-14`  
**Date**: 2026-01-14  
**Phase**: Sub-Agent Deep Investigation Complete

---

## Executive Summary

### Investigation Completed

5 sub-agents dispatched for deep workspace investigation:

| Sub-Agent | Workspace | Files Investigated | Key Findings |
|-----------|-----------|-------------------|--------------|
| IDE-01 | IDE | 47 files | 3 god components, 6 state stores, well-structured |
| NOTES-01 | Notes | 47 files | 4 god components, AI service duplication |
| KNOW-01 | Knowledge | 47 files | 3 god modules (46+30 files), RAG pipeline |
| STUDY-01 | Study | 45 files | No god components, well-architected |
| CROSS-01 | Cross-Workspace | N/A | Event bus duplication, context fragmentation |

### Total Impact

| Metric | Value |
|--------|-------|
| **New God Components Found** | 10 (3 P0, 4 P1, 3 P2) |
| **New Issues Discovered** | 23 (8 P0, 10 P1, 5 P2) |
| **Files Requiring Refactoring** | 45+ files |
| **Total Estimated Effort** | 14-18 days |

---

## IDE Workspace Deep Investigation

### Executive Summary

**Files Investigated**: 47  
**God Components Found**: 3  
**State Stores Found**: 6 slices (well-structured)

### God Components Identified

| Component | Location | Lines | Severity | Issue |
|-----------|----------|-------|----------|-------|
| `MonacoEditor` | `src/presentation/components/ide/MonacoEditor/MonacoEditor.tsx` | 773 | P1 | 12 responsibilities mixed |
| `AgentChatPanel` | `src/presentation/components/ide/AgentChatPanel.tsx` | 685 | P1 | 8 responsibilities: AI, chat, tools |
| `TerminalEmulator` | `src/lib/terminal/terminal-emulator.ts` | 609 | P2 | 7 responsibilities, history growth |

### Key Findings

1. **MonacoEditor** has 12+ responsibilities:
   - Editor instance management
   - Multi-model support
   - Auto-save with debouncing (2000ms)
   - Tab management
   - Code formatting
   - Code navigation
   - Symbols panel
   - Definition tooltips
   - Snippet management
   - Diff viewer integration
   - Sync edit warning
   - Keyboard shortcuts

2. **State Management**: Well-structured with 6-slice pattern:
   - `ide-editor-slice` ✅
   - `ide-explorer-slice` ✅
   - `ide-layout-slice` ✅
   - `ide-terminal-slice` ✅
   - `ide-project-slice` ✅
   - `ide-selectors-slice` (AI context) ✅

3. **Architecture Connections**: All clean
   - Project Space integration ✅
   - Agent/LLM integration ✅
   - BYOK Vault integration ✅
   - Persistence integration ✅

### New Issues Discovered

| Issue | Evidence | Severity | Recommendation |
|-------|----------|----------|----------------|
| AgentChatPanel god component | 685 lines, 8 responsibilities | P1 | Extract useChatStateManager, useThreadManager, useEventBridge |
| Terminal history unlimited | No max limit enforced | P2 | Implement LRU cache with max 1000 entries |
| FileTree missing virtualization | No react-window for large dirs | P2 | Add virtual scrolling for >1000 files |
| No file locking mechanism | EventBus notifies but no UI | P2 | Add edit conflict detection UI |
| Duplicate EditorTabBar files | Legacy vs current version | P3 | Remove deprecated file |

### Refactoring Recommendations (IDE)

| Priority | Issue | Effort | Deliverables |
|----------|-------|--------|--------------|
| P0 | MonacoEditor extraction | 3 days | 5 new hooks + service |
| P1 | File sync coupling | 1 day | EditorContentSync service |
| P1 | AgentChatPanel extraction | 2 days | 4 new hooks |
| P2 | FileTree virtualization | 1 day | useVirtualizedFileTree hook |
| P2 | Terminal history limit | 0.5 day | LRU cache implementation |

---

## Notes Workspace Deep Investigation

### Executive Summary

**Files Investigated**: 47  
**God Components Found**: 4  
**State Stores Found**: Note store (7 slices good), slash-command-store (bad)

### God Components Identified

| Component | Location | Lines | Severity | Issue |
|-----------|----------|-------|----------|-------|
| `AISlashCommand.tsx` | `src/presentation/components/notes/AISlashCommand.tsx` | 1147 | P0 | 18 commands, 50+ `as any` casts |
| `NoteEditor.tsx` | `src/presentation/components/notes/NoteEditor.tsx` | 947 | P0 | 12+ responsibilities, duplicated sanitization |
| `NotesPage.tsx` | `src/presentation/components/notes/NotesPage.tsx` | 877 | P1 | Layout orchestration, 6+ dialogs |
| `slash-command-store.ts` | `src/lib/notes/slash-command-store.ts` | 472 | P1 | Single file, no slices |

### Key Findings

1. **AISlashCommand** - Critical issues:
   - Commands hardcoded without registry pattern
   - 50+ `as any` casts throughout
   - Context extraction mixed with UI
   - 18 command implementations in single file

2. **AI Services Duplication** - 6 separate services with overlapping logic:
   - Image generation service
   - Vision service
   - Storyboard service
   - Video generation service
   - TTS service
   - Note AI service

3. **State Management**:
   - Note store: Well-structured (7 slices) ✅
   - Slash-command-store: Violates pattern ❌

### New Issues Discovered

| Issue | Evidence | Severity | Recommendation |
|-------|----------|----------|----------------|
| Commands hardcoded | No registry pattern | P0 | Extract to CommandRegistry |
| `as any` casts | 50+ throughout file | P0 | Add proper typing |
| NoteEditor sanitization | Duplicated across file | P0 | Extract useContentSanitizer |
| 6 AI services | Duplicate provider selection | P1 | Unify with handler interface |
| Slash-command-store | Single file, no slices | P1 | Split into 3 slices |

### Refactoring Recommendations (Notes)

| Priority | Issue | Effort | Deliverables |
|----------|-------|--------|--------------|
| P0 | AISlashCommand registry | 2 days | CommandRegistry + 18 command files |
| P0 | Remove `as any` casts | 1 day | Proper typing throughout |
| P0 | NoteEditor extraction | 2 days | 6+ hooks from NoteEditor |
| P1 | Slash-command-store | 1 day | 3 slices + persistence |
| P1 | Unify AI services | 2 days | Handler interface pattern |

---

## Knowledge Workspace Deep Investigation

### Executive Summary

**Files Investigated**: 47  
**God Modules Found**: 3 (lib/knowledge - 46 files, lib/rag - 30 files)  
**State Stores Found**: 2 well-structured stores

### God Modules Identified

| Module | Location | Files | Severity | Issue |
|--------|----------|-------|----------|-------|
| `lib/knowledge/` | `src/lib/knowledge/` | 46 | P0 | 6 concerns mixed: synthesis, import, graph, pdf, url, flashcard |
| `lib/rag/` | `src/lib/rag/` | 30 | P0 | 5 concerns: chunking, embedding, indexing, retrieval, query |
| `KnowledgePage.tsx` | `src/presentation/components/knowledge/KnowledgePage.tsx` | 750 | P1 | Mixed RAG init, events, UI |

### Key Findings

1. **lib/knowledge/** - Needs split into subdirectories:
   - `synthesis/` (synthesis-service.ts, prompts, types)
   - `import/` (source-import.ts, handlers, validators)
   - `graph/` (knowledge-graph.ts, already exists)
   - `pdf/` (pdf-parser.ts)
   - `url/` (url-fetcher.ts)
   - `flashcard/` (flashcard-generator.ts)

2. **lib/rag/** - Needs split into subdirectories:
   - `chunking/` (document-chunker.ts, strategies)
   - `embedding/` (embedding-service.ts, cloud-embedder)
   - `indexing/` (orama-index.ts, storage)
   - `retrieval/` (hybrid-retriever.ts, fusion)

3. **State Management** - Well-structured:
   - `knowledge-store.ts`: 6 slices ✅
   - `rag-store.ts`: 5 slices ✅

### Cross-Workspace Integration Status

| Integration | Status | Mechanism |
|-------------|--------|-----------|
| Project Space | ✅ Implemented | projectId parameter |
| Notes Workspace | ⚠️ Partial | Event bus (disabled) |
| Study Workspace | ✅ Implemented | Flashcard export |
| Agent/LLM | ✅ Implemented | Gemini API |
| BYOK Vault | ✅ Implemented | Credential vault |

### New Issues Discovered

| Issue | Location | Severity | Recommendation |
|-------|----------|----------|----------------|
| RAG store methods TODO | KnowledgePage.tsx:401-406 | P2 | Implement IDE→Knowledge RAG |
| Cross-workspace events disabled | KnowledgePage.tsx:107-111 | P2 | Fix infinite loop, re-enable |
| Chunking not auto-triggered | source-import.ts:174 | P1 | Implement chunkSource in RAG |
| Synthesis export incomplete | KnowledgePage.tsx:283-284 | P2 | Implement addNode persistence |
| Collection projectId hardcoded | knowledge-collection-slice.ts:46 | P2 | Pass proper projectId |

### Refactoring Recommendations (Knowledge)

| Priority | Issue | Effort | Deliverables |
|----------|-------|--------|--------------|
| P0 | lib/knowledge/ split | 2 days | 6 subdirectories |
| P0 | lib/rag/ split | 2 days | 5 subdirectories |
| P0 | Consolidate FlashcardDB | 1 day | Merge to ViaGent |
| P1 | KnowledgePage extraction | 1 day | Separate RAG init, events |
| P1 | Chunking integration | 0.5 day | Wire to source-import |

---

## Study Workspace Deep Investigation

### Executive Summary

**Files Investigated**: 45  
**God Components Found**: 0 ✅  
**State Stores Found**: 4 well-structured stores

### State Stores Found

| Store | Slices | Status |
|-------|--------|--------|
| `useFlashcardStore` | 5 (crud, filter, persistence) | ✅ Well-structured |
| `useFlashcardSetStore` | 2 (set-crud, set-persistence) | ✅ Well-structured |
| `useQuizStore` | 4 (management, query, ui) | ✅ Well-structured |
| `useStudyStore` | 4 (session, database, stats) | ✅ Well-structured |

### Key Findings

1. **Study workspace is well-architected** ✅
   - No god components found
   - All stores follow slice pattern
   - SRS algorithm (SM-2 variant) properly tested

2. **Cross-Workspace Integration**:
   - Knowledge → Study: FlashcardExporter ✅
   - Notes → Study: AISlashCommand /flashcards ✅
   - Agent/LLM: QuizGenerator with Gemini ✅

3. **Persistence** - 3 separate Dexie databases:
   - FlashcardDB
   - QuizDatabase
   - StudyDatabase
   - Could be consolidated (P2)

### New Issues Discovered

| Issue | Location | Severity | Recommendation |
|-------|----------|----------|----------------|
| FlashcardRecord missing projectId | flashcard-db.ts:12-21 | MEDIUM | Add projectId to schema |
| BYOK Vault not integrated | quiz-generator.ts:39-40 | LOW | Use credential vault |
| StudyPage size | StudyPage.tsx:399 | LOW | Extract sub-components |

### Refactoring Recommendations (Study)

| Priority | Issue | Effort | Deliverables |
|----------|-------|--------|--------------|
| P1 | FlashcardRecord projectId | 2 hours | Schema migration |
| P2 | Consolidate databases | 1 day | Merge to ViaGent |
| P2 | BYOK Vault integration | 4 hours | Update QuizGenerator |
| P2 | StudyPage extraction | 2 hours | Separate components |

---

## Cross-Workspace Deep Investigation

### Executive Summary

**Issues Found**: 6 critical  
**Event Buses**: 2 (duplicate)  
**Context Providers**: 3+ (fragmented)

### Critical Issues

| Issue | Location | Severity | Recommendation |
|-------|----------|----------|----------------|
| Event bus duplication | `eventBus` vs `crossWorkspaceEventBus` | P0 | Consolidate with namespaces |
| Context fragmentation | 3+ providers | P0 | Single UnifiedWorkspaceContext |
| Debug logging in prod | cross-workspace-event-bus.ts:220 | P1 | Guard with env check |
| Unified search missing | Only IDE-scoped | P1 | Extend SearchIndexer |
| Event subscription leaks | use-cross-workspace-events.ts | P1 | Audit cleanup patterns |

### Cross-Workspace Interconnections

| Connection | Mechanism | Status |
|------------|-----------|--------|
| IDE ↔ Notes | crossWorkspaceEventBus + file sync | ✅ |
| IDE ↔ Knowledge | RAG indexing events | ⚠️ Manual |
| Notes ↔ Knowledge | NOTES_RAG_INDEX_REQUESTED | ✅ |
| Knowledge ↔ Study | Quiz generation | ❌ Source link |
| All ↔ Agent/LLM | useAgentChatWithTools | ✅ |
| All ↔ BYOK Vault | credentialVault singleton | ✅ |

### User Journeys Validated

| Journey | Status | Notes |
|---------|--------|-------|
| Research → Note → Code | ✅ Validated | Works well |
| Study Knowledge Material | ⚠️ Partial | Source linking missing |
| Debug with AI Context | ✅ Validated | Debug session capture |
| Unified Search | ❌ Missing | Not implemented |
| Project Documentation | ✅ Validated | Cross-workspace refs |

### Refactoring Recommendations (Cross-Workspace)

| Priority | Issue | Effort | Deliverables |
|----------|-------|--------|--------------|
| P0 | Consolidate event buses | 8-12h | Unified bus + migration |
| P0 | Unify context providers | 6-8h | UnifiedWorkspaceContext |
| P1 | Remove prod debug logs | 1h | Guard console.log |
| P1 | Unified search | 12-16h | Multi-workspace SearchIndexer |
| P1 | Fix event leaks | 4-6h | Cleanup pattern audit |

---

## Consolidated Findings Summary

### Total God Components (All Workspaces)

| Severity | Count | Components |
|----------|-------|------------|
| P0 | 3 | AISlashCommand (1147 lines), lib/knowledge/ (46 files), lib/rag/ (30 files) |
| P1 | 4 | MonacoEditor (773), AgentChatPanel (685), NotesPage (877), KnowledgePage (750) |
| P2 | 3 | TerminalEmulator (609), slash-command-store (472), StudyPage (399) |

### Total Issues Discovered

| Severity | IDE | Notes | Knowledge | Study | Cross-WS | Total |
|----------|-----|-------|-----------|-------|----------|-------|
| P0 | 0 | 3 | 3 | 0 | 2 | 8 |
| P1 | 3 | 2 | 2 | 1 | 3 | 11 |
| P2 | 3 | 0 | 3 | 3 | 1 | 10 |
| **Total** | 6 | 5 | 8 | 4 | 6 | **29** |

### Estimated Effort Summary

| Area | P0 | P1 | P2 | Total |
|------|-----|-----|-----|-------|
| IDE | 3 days | 3 days | 1.5 days | **7.5 days** |
| Notes | 5 days | 3 days | 0 | **8 days** |
| Knowledge | 5 days | 1.5 days | 1.25 days | **7.75 days** |
| Study | 0 | 0.25 days | 1.5 days | **1.75 days** |
| Cross-WS | 1.5 days | 2.5 days | 0 | **4 days** |
| **Total** | **14.5 days** | **10.25 days** | **4.25 days** | **29 days** |

---

## Next Steps

### Immediate Actions

1. **Consolidate sub-agent reports** into the shard system
   - Update shard-03-05 (IDE) with new findings
   - Update shard-03-06 (Notes) with new findings
   - Update shard-03-07 (Knowledge/Study) with new findings
   - Update shard-03-08 (Cross-Workspace) with new findings

2. **Prioritize P0 issues** for immediate action:
   - AISlashCommand registry pattern
   - lib/knowledge/ and lib/rag/ split
   - Event bus consolidation
   - Context provider unification

3. **Create remediation epics** based on findings

### Recommended Execution Order

1. **Week 1**: Cross-workspace foundations (event bus + context)
2. **Week 2-3**: Knowledge workspace (lib split)
3. **Week 3-4**: Notes workspace (AISlashCommand + NoteEditor)
4. **Week 4-5**: IDE workspace (MonacoEditor + AgentChatPanel)
5. **Week 5**: Study workspace cleanup + final integration

---

## Files Referenced

| File | description |
|------|---------|
| `_bmad-output/architectural-scan/shards/shard-03-05-workspace-ide.md` | IDE preliminary analysis |
| `_bmad-output/architectural-scan/shards/shard-03-06-workspace-notes.md` | Notes preliminary analysis |
| `_bmad-output/architectural-scan/shards/shard-03-07-workspace-knowledge-study.md` | Knowledge/Study preliminary |
| `_bmad-output/architectural-scan/shards/shard-03-08-cross-workspace.md` | Cross-workspace preliminary |
| `_bmad-output/team-b-investigations/ide-workspace-investigation-*.json` | IDE deep dive |
| `_bmad-output/team-b-investigations/notes-workspace-investigation-*.json` | Notes deep dive |
| `_bmad-output/team-b-investigations/knowledge-workspace-investigation-*.json` | Knowledge deep dive |
| `_bmad-output/team-b-investigations/study-workspace-investigation-*.json` | Study deep dive |
| `_bmad-output/team-b-investigations/cross-workspace-investigation-*.json` | Cross-workspace deep dive |

---

**Document**: TEAM B - Consolidated Investigation Report  
**Status**: Complete - Ready for remediation planning
