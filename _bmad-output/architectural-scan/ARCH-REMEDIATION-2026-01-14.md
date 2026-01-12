# TEAM B Architectural Remediation Framework

**Document ID**: `ARCH-REMEDIATION-2026-01-14`
**Created**: 2026-01-14T16:00:00+07:00
**Author**: EXCALIBUR (Event-Driven Workflow Orchestrator)
**Status**: PHASE 1-2 COMPLETE | AWAITING VALIDATION
**Parent**: Repomix Output ID `9247c0b8d79ef818`

---

## Executive Summary

This document synthesizes **6 sub-agent architectural scans** (1,524 files, 940,967 tokens) into a comprehensive architectural remediation framework. The analysis reveals:

| Metric | Finding | Severity |
|--------|---------|----------|
| **God Components** | 3 components >900 lines | P0 |
| **God Stores** | 5 stores >300 lines | P0 |
| **Direct Store Access** | 47 violations in presentation | P1 |
| **Duplicate Contexts** | 2 workspace contexts active | P0 |
| **Type Safety** | 100+ `as any` casts | P1 |
| **Layer Violations** | 6 clear Clean Architecture breaches | P1 |
| **Data Flow Breaks** | 7 critical wiring issues | P0 |
| **Schema Drift** | 8 identified type mismatches | P1 |

### Key Insight

The architecture is **salvageable** but requires **systematic refactoring** across 4 architecture groups. The issues are not foundational (Zustand, TanStack, Dexie are correct choices) but rather:

1. **Missing abstractions** (facade pattern underutilized)
2. **Layer bleed** (Infrastructure leaking into Domain)
3. **Context proliferation** (duplicate context providers)
4. **Type safety gaps** (`as any` overuse)
5. **Wiring breaks** (tools exist but not connected)

---

## Part 1: Architecture Groups (From Phase 1 Scans)

### Architecture Group A: State & Stores Domain

**Scope**: All Zustand stores, state management, persistence integration

#### A.1 Store Inventory Summary

| Category | Count | Pattern |
|----------|-------|---------|
| **Infrastructure Stores** | 40+ | Slices in `infrastructure/persistence/stores/` |
| **Library Stores** | 15+ | In `lib/notes/`, `lib/workspace/`, `lib/snippets/` |
| **Facade Stores** | 4 | Legacy stores wrapping refactored versions |
| **Slice-Based Stores** | 12 | Properly using `StateCreator<>` pattern |
| **Legacy Stores** | 3 | Direct stores without slices |

#### A.2 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | God store (571 lines) | `useWorkspaceFileSystem.ts` | Mixed: project loading + file ops + Dexie queries |
| **P0** | Credentials with CRUD + migration | `provider-credentials-slice.ts:396` | Security code with migration logic |
| **P0** | Single-file slash command store | `slash-command-store.ts:471` | 471 lines without slice separation |
| **P1** | Direct `getState()` in presentation | 47 violations | Breaks React reactivity |
| **P1** | Duplicate store architecture | `project-store.ts` + refactored | Dual stores, migration incomplete |
| **P1** | Inconsistent persistence | localStorage vs Dexie | Some stores use Dexie, others use localStorage |

#### A.3 Store Dependency Graph

```
                    ┌─────────────────────────┐
                    │      useAppStore        │
                    │ (Agents + Providers)    │
                    └───────────┬─────────────┘
                                │ cross-slice
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ useAgentSelection │  │ useProjectStore  │  │ useConversation  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                    │
         │ uses agents from    │                    │ uses threads from
         │ useAppStore         │                    │ useUnifiedChatStore
         │                     │                    │
         ▼                     ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ useWorkspaceStore│  │ useIDEStore      │  │ useUnifiedChat   │
│ (workspace type) │  │ (project state)  │  │ Store (unified)  │
└────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
         │                     │
         │ sets projectId      │ reads/writes
         │ in IDE store        │ to Dexie
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Dexie DB         │  │ Dexie DB         │
│ (projects, etc)  │  │ (IDE state)      │
└──────────────────┘  └──────────────────┘
```

#### A.4 Fragmentation Issues

| Issue | Duplicated In | Impact |
|-------|---------------|--------|
| **Duplicate Project Stores** | `lib/workspace/project-store.ts` + `infrastructure/persistence/stores/project/*` | Import path confusion |
| **Duplicate Note Stores** | `lib/notes/note-store.ts` + `note-store-refactored.ts` | Dual stores, refactoring incomplete |
| **Duplicate Conversation Stores** | `useConversationStore.ts` + `unified-chat-store.ts` | Migration in progress |
| **Multiple LocalStorage Stores** | `slash-command-store.ts`, `prompt-history-store.ts` | Inconsistent persistence |

---

### Architecture Group B: Context & Runtime Domain

**Scope**: React Context providers, hooks, event systems, runtime wiring

#### B.1 Context Provider Inventory

| Provider | Purpose | Consumers | Re-render Risk |
|----------|---------|-----------|----------------|
| **ToastContext** | Toast notifications | 3+ | LOW |
| **ProjectContext** | Cross-workspace project state | 5+ | MEDIUM |
| **UnifiedWorkspaceContext** | 5 cornerstone stores | 8+ | HIGH |
| **WorkspaceContext** | Legacy (DUPLICATE) | 2+ | HIGH |
| **SidebarContext** | IDE sidebar state | 4 | LOW |
| **ResizableContext** | Panel resize | 6+ | HIGH |

#### B.2 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | Duplicate workspace contexts | `workspace-context.ts` vs `unified-workspace-context.ts` | Conflicting providers |
| **P0** | Memory leak from events | `KnowledgePage.tsx:207-210` | No cleanup on unmount |
| **P1** | Context over-fetching | `UnifiedWorkspaceContext` | All 5 slices to all consumers |
| **P1** | Missing useCallback | `IconSidebar.tsx:90` | Handler not memoized |
| **P2** | Console.log in event path | `cross-workspace-event-bus.ts:220` | Debug logging in prod |

#### B.3 Event System Architecture

| Event Bus | Purpose | Events | Usage |
|-----------|---------|--------|-------|
| **crossWorkspaceEventBus** | Cross-workspace sync | 15+ event types | Global state |
| **eventBus** | IDE workspace events | 50+ event types | Local workspace |
| **storeEvents** | Store-specific | Limited | Internal |

---

### Architecture Group C: Persistence & Data Layer

**Scope**: Dexie databases, storage adapters, sync engine, migrations

#### C.1 Database Schema (v20)

| Database | Tables | Isolation |
|----------|--------|-----------|
| **ViaGentDatabase** | 31 tables | By `workspaceId` |
| **FlashcardDB** | 2 tables | Separate database |
| **StudyDB** | 2 tables | Separate database |

#### C.2 Storage Adapters

| Adapter | Purpose | Status |
|---------|---------|--------|
| **FSAAdapter** | File System Access (Desktop) | ACTIVE |
| **IDBAdapter** | IndexedDB (All platforms) | ACTIVE |
| **UnifiedStorageAdapter** | Bridge pattern | ADDITIONAL LAYER |

#### C.3 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | Conversation store facade performance | `useConversationStore.ts:150-404` | Mapping on every state change |
| **P0** | Multiple Dexie databases | `flashcard-db.ts`, `study-database-slice.ts` | Fragmented persistence |
| **P1** | Conflict detection without hashing | `bidirectional-sync-core.ts:144-151` | Only lastModified comparison |
| **P1** | Migration state in localStorage | `dexie-db-migrations.ts:49-72` | Fails in private browsing |

---

### Architecture Group D: API & Data Flow Wiring

**Scope**: Tool system, facades, services, external API integration

#### D.1 Tool System Inventory

| Category | Count | Status |
|----------|-------|--------|
| **File Tools** | 5 | Properly wired |
| **Terminal Tools** | 2 | Properly wired |
| **Note Tools** | 5 | Content conversion incomplete |
| **Knowledge Tools** | 4 | Lazy initialization |
| **Composite Tools** | 4 | Require service context |
| **Provider Tools** | 3 | Using ModelRegistry |

#### D.2 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | `blocksToMarkdown()` incomplete | `note-tools-impl.ts:58-96` | Complex blocks not handled |
| **P0** | Knowledge tools lazy init dependency | `knowledge-tools-impl.ts:52-65` | Vault must be ready |
| **P1** | Tool catalog missing startup init | `tool-catalog.ts:346-354` | No guarantee initialization |
| **P1** | NoteStoreState lazy dependency | `note-tools-impl.ts:29-33` | Returns null if not available |

---

### Architecture Group E: Schema & Business Contracts

**Scope**: Type definitions, validation, entity relationships, invariants

#### E.1 Type Definition Summary

| Category | Count | Pattern |
|----------|-------|---------|
| Domain Entities | 12 | Well-structured |
| Value Objects | 8 | Well-designed utilities |
| DB Records | 31 tables | Schema v20 with workspaceId |
| Tool Types | 55+ | Interface definitions |

#### E.2 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | `as any` type assertions | `AISlashCommand.tsx:537-1013` | 50+ casts bypassing safety |
| **P0** | Missing `projectId` in tool logs | `dexie-db-session-types.ts:97-115` | Cannot trace to projects |
| **P1** | `Record<string, unknown>` pollution | 15+ locations | No runtime validation |
| **P2** | Event bus type safety gaps | `KnowledgePage.tsx:207-210` | Callbacks typed as `any` |

---

### Architecture Group F: Layers, Boundaries & Dependencies

**Scope**: Clean Architecture layers, module cohesion, dependency direction

#### F.1 Layer Assessment

| Layer | Purpose | Correct? | Violations |
|-------|---------|----------|------------|
| **Domain** | Business entities, value objects | Partially | Imports Infrastructure |
| **Application** | Orchestration services | Partially | Leaks domain types |
| **Infrastructure** | Database, persistence, sync | Partially | Imports from Lib |
| **Lib** | Feature modules, facades | Mixed | God modules (46 files in knowledge) |
| **Presentation** | React components, UI | Partially | Imports Infrastructure directly |
| **Core** | Legacy entities | Deprecated | Duplicated with Domain |

#### F.2 Critical Issues (P0-P2)

| Priority | Issue | Location | Root Cause |
|----------|-------|----------|------------|
| **P0** | Domain depends on Infrastructure | `unified-file-crud.ts:31` | Clean Architecture violation |
| **P0** | God module (46 files) | `lib/knowledge/*` | Single point of failure |
| **P1** | Presentation imports Infrastructure | 100+ matches | Direct DB access |
| **P1** | Duplicate entities (Core vs Domain) | `src/core/entities/` vs `domain/` | Confusion |

---

## Part 2: Architecture → Feature Mapping

### Feature Group 1: BYOK Vault System

**Core Centralized Group**: Manages all API keys for LLM providers

#### 1.1 Feature Components

| Component | Files | Architecture Group | Status |
|-----------|-------|-------------------|--------|
| **CredentialVault** | `credential-vault.ts`, `credential-encryption.ts`, `credential-storage.ts` | D, E | ✅ WORKING |
| **ProviderService** | `ProviderService.ts` (22339 chars) | D | ⚠️ COMPLEX |
| **Provider Credentials Slice** | `provider-credentials-slice.ts:396` | A | ❌ GOD STORE |
| **Provider Adapter Factory** | `provider-adapter.ts` | D | ✅ WORKING |
| **BYOK UI** | `VaultStatusCard.tsx`, `ApiKeyInputSection.tsx` | F | ✅ WORKING |

#### 1.2 Architecture Issues Impacting BYOK

| Issue | Severity | Impact |
|-------|----------|--------|
| Provider credentials slice is a god store | P0 | Migration + CRUD + security mixed |
| Duplicate Dexie databases | P0 | Keys fragmented across databases |
| Type safety gaps (`as any`) | P1 | Potential key mishandling |

#### 1.3 Refactoring Required

| Action | Files | Effort |
|--------|-------|--------|
| Split provider-credentials-slice.ts | 3 files | Medium |
| Consolidate Dexie databases | 5 files | High |
| Add Zod validation for key input | 2 files | Low |

---

### Feature Group 2: Project Space Boundaries

**Core Centralized Group**: FileSystem (Desktop) vs BrowserDB (Mobile/Default)

#### 2.1 Feature Components

| Component | Files | Architecture Group | Status |
|-----------|-------|-------------------|--------|
| **UnifiedStorageAdapter** | `unified-storage-adapter.ts` | C | ⚠️ Additional layer |
| **FSAAdapter** | `fsa-adapter-core.ts:292` | C | ✅ WORKING |
| **IDBAdapter** | `idb-adapter-core.ts:282` | C | ⚠️ Quota issues |
| **Workspace Store** | `workspace-store.ts:215` | A | ⚠️ Mixed concerns |
| **SyncEngine** | `sync-engine-core.ts` | C | ✅ WORKING |
| **ConflictResolver** | `conflict-resolver.ts:284` | C | ⚠️ No content hashing |

#### 2.2 Architecture Issues Impacting Project Space

| Issue | Severity | Impact |
|-------|----------|--------|
| No storage abstraction layer | P0 | User confusion about data flow |
| Sync conflict detection without hashing | P1 | False positives |
| Duplicate Dexie databases | P0 | Fragmented persistence |
| God store useWorkspaceFileSystem (571 lines) | P0 | Multiple responsibilities |
| Project store duplication | P1 | Import path confusion |

#### 2.3 Routing & Entry Points

| Route | Storage Type | Behavior |
|-------|--------------|----------|
| `/ide/$projectId` | FSA (if available) | File System access |
| `/notes/$projectId` | IDB default | Browser database |
| `/knowledge/$projectId` | IDB default | Browser database |
| `/study/$projectId` | IDB default | Browser database |
| `/hub` | IDB | Default workspace |

#### 2.4 Refactoring Required

| Action | Files | Effort |
|--------|-------|--------|
| Create storage abstraction interface | 3 files | High |
| Split useWorkspaceFileSystem.ts | 4 files | High |
| Add content hashing to conflict detection | 2 files | Medium |
| Consolidate Dexie databases | 8 files | High |

---

### Feature Group 3: Agent/LLM Orchestration

**Core Centralized Group**: System prompts, tools, RAG, multimodality

#### 3.1 Feature Components

| Component | Files | Architecture Group | Status |
|-----------|-------|-------------------|--------|
| **System Prompts** | `prompt-orchestrator.ts`, `prompt-composer.ts` | D | ⚠️ Complex |
| **Tool System** | `tool-catalog.ts`, `centralized-tool-registry.ts` | D | ⚠️ Init issue |
| **Tool Facades** | `file-tools.ts`, `note-tools.ts`, `knowledge-tools.ts` | D | ⚠️ Wiring issues |
| **RAG Pipeline** | `lib/rag/*` (30 files) | F | ❌ GOD MODULE |
| **Multimodality** | `ai-image-service.ts`, `ai-vision-service.ts` | A, D | ⚠️ Scattered |

#### 3.2 Architecture Issues Impacting Agent Orchestration

| Issue | Severity | Impact |
|-------|----------|--------|
| RAG module is a god module (30 files) | P0 | Single point of failure |
| Tool catalog missing startup init | P1 | Silent failure |
| Note tools content conversion incomplete | P0 | AI receives incomplete content |
| Knowledge tools lazy init dependency | P0 | Fails if vault not ready |
| Knowledge module is a god module (46 files) | P0 | Single point of failure |

#### 3.3 RAG Sub-Components (Should Be Split)

| Sub-Component | Current Location | Should Be |
|---------------|------------------|-----------|
| Chunking strategies | `lib/rag/chunk-strategies/` | Separate package |
| Embedding service | `lib/rag/embedding-service.ts` | Separate package |
| Orama index | `lib/rag/orama-index.ts` | Separate package |
| Hybrid retriever | `lib/rag/hybrid-retriever.ts` | Separate package |
| Query optimizer | `lib/rag/query-optimizer.ts` | Separate package |

#### 3.4 Refactoring Required

| Action | Files | Effort |
|--------|-------|--------|
| Split RAG module | 8 files | High |
| Split Knowledge module | 10 files | High |
| Enhance blocksToMarkdown() | 1 file | Medium |
| Add vault-ready check | 2 files | Low |
| Add tool registry init guarantee | 2 files | Medium |

---

### Feature Group 4: Cascade Chat Flow

**Core Centralized Group**: Conversation → Thread → Messages → Tools → RAG

#### 4.1 Feature Components

| Component | Files | Architecture Group | Status |
|-----------|-------|-------------------|--------|
| **UnifiedChatStore** | `unified-chat-store.ts:447` | A | ✅ SLICE PATTERN |
| **Conversation Store** | `useConversationStore.ts:495` | A | ❌ GOD STORE + FACADE |
| **Thread Management** | `thread-management-slice.ts` | A | ✅ WORKING |
| **Message CRUD** | `message-crud-slice.ts` | A | ✅ WORKING |
| **Context Window** | `context-window-slice.ts` | A | ✅ WORKING |
| **Chat UI** | `UnifiedChatPanel.tsx`, `AgentChatPanel.tsx` | F | ⚠️ Direct store access |

#### 4.2 Architecture Issues Impacting Chat Flow

| Issue | Severity | Impact |
|-------|----------|--------|
| Conversation store facade (495 lines) | P0 | Performance degradation |
| Direct store access in chat UI | P1 | Breaks reactivity |
| Duplicate conversation stores | P1 | Migration incomplete |
| Event subscription memory leak | P0 | KnowledgePage.tsx |

#### 4.3 Refactoring Required

| Action | Files | Effort |
|--------|-------|--------|
| Replace conversation store facade | 3 files | Medium |
| Convert getState() in chat UI | 5 files | Medium |
| Fix event subscription cleanup | 2 files | Low |
| Remove legacy migration code | 3 files | Low |

---

### Feature Group 5: Cross-Workspace Features

**Scope**: Features that span multiple workspaces (IDE, Notes, Knowledge, Study)

#### 5.1 Feature Components

| Component | Files | Architecture Group | Status |
|-----------|-------|-------------------|--------|
| **Cross-Workspace Event Bus** | `cross-workspace-event-bus.ts` | B | ⚠️ Duplicate with eventBus |
| **Workspace Switcher** | `WorkspaceEnhancedSwitcher.tsx` | F | ✅ WORKING |
| **Unified Workspace Context** | `unified-workspace-context.ts:368` | B | ⚠️ Over-fetching |
| **Project Context** | `ProjectContext.tsx` | B | ✅ WORKING |

#### 5.2 Architecture Issues Impacting Cross-Workspace

| Issue | Severity | Impact |
|-------|----------|--------|
| Duplicate event bus instances | P2 | Event fragmentation |
| UnifiedWorkspaceContext over-fetching | P1 | All slices to all consumers |
| Duplicate workspace contexts | P0 | Conflicting providers |

#### 5.3 Refactoring Required

| Action | Files | Effort |
|--------|-------|--------|
| Consolidate event bus | 4 files | Medium |
| Split UnifiedWorkspaceContext | 5 files | High |
| Deprecate legacy WorkspaceContext | 2 files | Low |

---

### Feature Group 6: Workspace-Specific Features

**Scope**: Features unique to each workspace type

| Workspace | Unique Features | Issues |
|-----------|-----------------|--------|
| **IDE** | Monaco editor, File tree, Terminal, Agent chat | Monaco (772 lines) - should split |
| **Notes** | BlockNote editor, AI commands, Slash commands | God component (946 lines) |
| **Knowledge** | RAG indexing, Collections, Sources | God module (46 files) |
| **Study** | Flashcards, Quiz, SRS | Separate Dexie DB - should consolidate |

---

## Part 3: Conflict & Hybrid Detection

### P0 Conflicts (Architecture vs Feature)

| Conflict | Architecture Issue | Feature Impact | Fix |
|----------|-------------------|----------------|-----|
| God stores + Agent tools | `slash-command-store.ts:471` | AI commands broken | Split store into slices |
| Duplicate contexts + BYOK | `workspace-context.ts` duplicate | Vault state inconsistent | Consolidate contexts |
| Missing vault-ready check + Knowledge tools | Lazy init dependency | Knowledge tools fail | Add health check |
| Conversation facade + Chat flow | Performance degradation | Chat lags on updates | Replace facade |
| Multiple Dexie databases + Project space | Fragmented persistence | Data inconsistency | Consolidate databases |

### P1 Conflicts (Architecture vs Feature)

| Conflict | Architecture Issue | Feature Impact | Fix |
|----------|-------------------|----------------|-----|
| Direct store access + Chat UI | 47 violations | React render issues | Create hooks |
| RAG module + Multimodality | God module (30 files) | Feature bloat | Split RAG into sub-modules |
| Type safety gaps + BYOK | 100+ `as any` casts | Key mishandling risk | Add Zod validation |
| Layer violations + Project space | Domain→Infra import | Clean Architecture broken | Add abstractions |

### P2 Conflicts (Architecture vs Feature)

| Conflict | Architecture Issue | Feature Impact | Fix |
|----------|-------------------|----------------|-----|
| Event bus duplication + Cross-workspace | 2 event systems | Event fragmentation | Consolidate event bus |
| KnowledgePage memory leak + RAG | Missing cleanup | Browser memory growth | Fix event subscriptions |
| Console.log in prod + All features | Debug logging | Performance impact | Remove or guard logs |

---

## Part 4: Architectural Remediation Grouping

### Remediation Epic 1: Foundation Fixes

**Scope**: Fix critical wiring issues that block feature functionality

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Add vault-ready check to KnowledgeToolsFacade | P0 | 2 | Low |
| Enhance blocksToMarkdown() for complex blocks | P0 | 1 | Medium |
| Fix NoteStoreState lazy dependency | P0 | 1 | Low |
| Add tool catalog startup initialization guarantee | P1 | 2 | Medium |

### Remediation Epic 2: Store Consolidation

**Scope**: Fix god stores and direct access violations

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Split useWorkspaceFileSystem.ts (571 lines) | P0 | 4 | High |
| Split provider-credentials-slice.ts (396 lines) | P0 | 3 | Medium |
| Split slash-command-store.ts (471 lines) | P0 | 4 | Medium |
| Convert 47 getState() violations to hooks | P1 | 10 | Medium |
| Complete conversation store migration | P1 | 3 | Medium |

### Remediation Epic 3: Context & Event Unification

**Scope**: Fix duplicate contexts and event system

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Deprecate legacy WorkspaceContext | P0 | 2 | Low |
| Consolidate event bus architecture | P2 | 4 | Medium |
| Fix event subscription cleanup | P0 | 2 | Low |
| Split UnifiedWorkspaceContext | P1 | 5 | High |

### Remediation Epic 4: Module Refactoring

**Scope**: Split god modules into focused sub-modules

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Split Knowledge module (46 files) | P0 | 10 | High |
| Split RAG module (30 files) | P0 | 8 | High |
| Fix Domain→Infrastructure import | P0 | 2 | Medium |

### Remediation Epic 5: Type Safety

**Scope**: Reduce `as any` casts and add validation

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Remove `as any` in AISlashCommand (50+ casts) | P0 | 1 | High |
| Add `projectId` to ToolExecutionLogRecord | P0 | 2 | Medium |
| Replace `Record<string, unknown>` with typed interfaces | P1 | 8 | High |
| Add Zod validation for domain inputs | P1 | 6 | High |

### Remediation Epic 6: Persistence Consolidation

**Scope**: Consolidate multiple Dexie databases

| Issue | Priority | Files | Effort |
|-------|----------|-------|--------|
| Consolidate FlashcardDB into ViaGentDatabase | P0 | 5 | High |
| Consolidate StudyDB into ViaGentDatabase | P0 | 5 | High |
| Add content hashing to conflict detection | P1 | 2 | Medium |
| Store migration state in Dexie | P1 | 2 | Low |

---

## Part 5: Requirements & User Stories

### For Each Remediation Epic

#### Epic 1: Foundation Fixes

**User Story: Knowledge Tools Must Initialize Gracefully**

```
As a user
I want AI knowledge features to work immediately when accessed
So that I don't see errors when using synthesis, RAG, or import features

Acceptance Criteria:
- [ ] Knowledge tools check vault readiness before use
- [ ] Graceful error message if vault not ready
- [ ] Tools retry initialization once vault is ready
- [ ] No console errors in normal operation

Technical Requirements:
- [ ] Add `credentialVault.isReady()` method
- [ ] Wrap knowledge tool initialization in try/catch
- [ ] Add retry logic with exponential backoff

Edge Cases:
- [ ] User clears vault during active use
- [ ] Multiple tools initializing simultaneously
- [ ] Network failure during credential fetch
```

**User Story: Note Content Must Be Complete for AI**

```
As an AI agent
I want to receive complete note content including all block types
So that I can understand and modify the full note

Acceptance Criteria:
- [ ] Tables converted to markdown
- [ ] Code blocks preserved with language
- [ ] Quotes and callouts retained
- [ ] Nested blocks properly nested

Technical Requirements:
- [ ] Enhance blocksToMarkdown() function
- [ ] Add tests for each block type
- [ ] Document conversion limitations

Edge Cases:
- [ ] Custom block types from plugins
- [ ] Very deep nesting (>5 levels)
- [ ] Blocks with complex attributes
```

#### Epic 2: Store Consolidation

**User Story: Workspace File Operations Must Be Focused**

```
As a developer
I want the workspace filesystem store to have single responsibility
So that I can maintain and test it without understanding 571 lines of mixed concerns

Acceptance Criteria:
- [ ] File loader separated from operations
- [ ] Dexie queries isolated
- [ ] Each slice < 200 lines
- [ ] All tests passing

Technical Requirements:
- [ ] Extract project loader slice
- [ ] Extract file operations slice
- [ ] Extract Dexie adapter slice
- [ ] Write tests for each slice

File Changes:
- CREATE: `use-workspace-file-loader.ts` (~100 lines)
- CREATE: `use-workspace-file-ops.ts` (~120 lines)
- CREATE: `use-workspace-dexie-adapter.ts` (~80 lines)
- MODIFY: `useWorkspaceFileSystem.ts` → orchestrator only (~80 lines)
- DELETE: Old monolithic file after verification
```

**User Story: Provider Credentials Must Be Secure and Maintainable**

```
As a security engineer
I want provider credentials managed in focused slices
So that migration, storage, and validation can be tested independently

Acceptance Criteria:
- [ ] Credentials slice handles only credentials
- [ ] Migration logic in separate slice
- [ ] Vault integration isolated
- [ ] All slices < 300 lines

Technical Requirements:
- [ ] Extract credentials CRUD slice
- [ ] Extract migration logic slice
- [ ] Extract vault integration slice
- [ ] Add integration tests
```

#### Epic 3: Context Unification

**User Story: Workspace Context Must Be Single Source of Truth**

```
As a user
I want workspace switching to be consistent and predictable
So that I never see conflicting state between contexts

Acceptance Criteria:
- [ ] Only one workspace context active at a time
- [ ] No double re-renders on context switch
- [ ] State preserved correctly during switch
- [ ] Loading states clear during transitions

Technical Requirements:
- [ ] Deprecate `workspace-context.ts`
- [ ] Move all functionality to `unified-workspace-context.ts`
- [ ] Add context switch integration tests
- [ ] Remove all imports of deprecated context
```

#### Epic 4: Module Refactoring

**User Story: Knowledge Module Must Be Maintainable**

```
As a maintainer
I want the knowledge module organized by responsibility
So that I can find and modify features without understanding 46 files at once

Acceptance Criteria:
- [ ] Synthesis features in `lib/knowledge/synthesis/`
- [ ] Import features in `lib/knowledge/import/`
- [ ] Graph features in `lib/knowledge/graph/`
- [ ] Each subdirectory < 15 files

Technical Requirements:
- [ ] CREATE: `lib/knowledge/synthesis/` (8 files)
- [ ] CREATE: `lib/knowledge/import/` (6 files)
- [ ] CREATE: `lib/knowledge/graph/` (5 files)
- [ ] CREATE: `lib/knowledge/url/` (3 files)
- [ ] CREATE: `lib/knowledge/pdf/` (4 files)
- [ ] CREATE: `lib/knowledge/flashcard/` (4 files)
- [ ] DELETE: Old `lib/knowledge/*` after migration
```

---

## Part 6: File Change Manifest

### Epic 1: Foundation Fixes (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| ADD | `lib/agent/facades/knowledge-tools-impl.ts` health check | ⏳ | |
| TEST | Knowledge tools initialize gracefully | ⏳ | |
| MODIFY | `note-tools-impl.ts` enhance blocksToMarkdown | ⏳ | |
| TEST | All block types convert correctly | ⏳ | |
| MODIFY | `tool-catalog.ts` add startup init | ⏳ | |
| TEST | Tools registered on app start | ⏳ | |

### Epic 2: Store Consolidation (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| CREATE | `use-workspace-file-loader.ts` | ⏳ | Tests pass |
| CREATE | `use-workspace-file-ops.ts` | ⏳ | Tests pass |
| CREATE | `use-workspace-dexie-adapter.ts` | ⏳ | Tests pass |
| MODIFY | `useWorkspaceFileSystem.ts` | ⏳ | Lines < 200 |
| TEST | File operations work | ⏳ | E2E tests pass |
| CREATE | `provider-credentials-crud.ts` | ⏳ | Tests pass |
| CREATE | `provider-migration-slice.ts` | ⏳ | Tests pass |
| MODIFY | `provider-credentials-slice.ts` | ⏳ | Lines < 300 |
| TEST | Provider CRUD works | ⏳ | Integration tests pass |
| CREATE | `use-note-store.ts` hook | ⏳ | Tests pass |
| MODIFY | Presentation components | ⏳ | getState() removed |
| TEST | React reactivity preserved | ⏳ | No render issues |

### Epic 3: Context Unification (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| MODIFY | `unified-workspace-context.ts` | ⏳ | All slices work |
| DELETE | `workspace-context.ts` | ⏳ | No imports |
| TEST | Workspace switching works | ⏳ | No double renders |
| CONSOLIDATE | Event bus instances | ⏳ | Single source |
| FIX | Event subscription cleanup | ⏳ | No memory leaks |
| TEST | No memory growth | ⏳ | DevTools memory |

### Epic 4: Module Refactoring (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| CREATE | `lib/knowledge/synthesis/` | ⏳ | 8 files |
| CREATE | `lib/knowledge/import/` | ⏳ | 6 files |
| CREATE | `lib/knowledge/graph/` | ⏳ | 5 files |
| DELETE | Old `lib/knowledge/*` | ⏳ | All imports updated |
| TEST | Knowledge features work | ⏳ | All tests pass |
| CREATE | `lib/rag/chunking/` | ⏳ | 5 files |
| CREATE | `lib/rag/retrieval/` | ⏳ | 5 files |
| CREATE | `lib/rag/indexing/` | ⏳ | 4 files |
| DELETE | Old `lib/rag/*` | ⏳ | All imports updated |
| TEST | RAG features work | ⏳ | All tests pass |
| CREATE | `domain/services/filesystem/filesystem-port.ts` | ⏳ | Interface defined |
| MODIFY | `unified-file-crud.ts` | ⏳ | Uses port |
| TEST | File CRUD works | ⏳ | Integration tests |

### Epic 5: Type Safety (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| REMOVE | `as any` in AISlashCommand | ⏳ | Zero remaining |
| ADD | Zod schemas for domain inputs | ⏳ | 6 schemas |
| ADD | `projectId` to ToolExecutionLogRecord | ⏳ | Migration v21 |
| REPLACE | `Record<string, unknown>` in chat.ts | ⏳ | Typed interfaces |
| REPLACE | `Record<string, unknown>` in knowledge.ts | ⏳ | Typed interfaces |
| TEST | Type safety improved | ⏳ | TSC strict mode |

### Epic 6: Persistence Consolidation (Must-Pass Checklist)

| Action | File | Status | Verification |
|--------|------|--------|--------------|
| CREATE | Migration v21: FlashcardDB → ViaGent | ⏳ | Data preserved |
| DELETE | `flashcard-db.ts` | ⏳ | No imports |
| CREATE | Migration v22: StudyDB → ViaGent | ⏳ | Data preserved |
| DELETE | `study-database-slice.ts` | ⏳ | No imports |
| MODIFY | `bidirectional-sync-core.ts` | ⏳ | Content hashing |
| TEST | Conflict detection improved | ⏳ | Fewer false positives |
| MODIFY | `dexie-db-migrations.ts` | ⏳ | State in Dexie |
| TEST | Migration works in private mode | ⏳ | No localStorage |

---

## Part 7: Execution Roadmap

### Phase 1: Quick Wins (1-2 days)

1. **Add vault-ready check** - Low effort, high impact
2. **Fix event subscription cleanup** - Low effort, prevents memory leaks
3. **Deprecate legacy WorkspaceContext** - Low effort, resolves P0

### Phase 2: Foundation (3-5 days)

1. **Enhance blocksToMarkdown()** - Medium effort, fixes AI note understanding
2. **Add tool catalog startup init** - Medium effort, prevents silent failures
3. **Convert getState() violations** - Medium effort, improves React performance

### Phase 3: Consolidation (1-2 weeks)

1. **Split god stores** - High effort, enables maintainability
2. **Consolidate Dexie databases** - High effort, fixes fragmentation
3. **Split knowledge module** - High effort, enables team scaling

### Phase 4: Type Safety (1 week)

1. **Remove `as any` casts** - High effort, improves reliability
2. **Add Zod validation** - High effort, prevents runtime errors
3. **Replace Record types** - Medium effort, improves type safety

---

## Validation Checkpoints

### Before Any Implementation

- [ ] All 6 sub-agent reports reviewed
- [ ] Architecture groups documented
- [ ] Feature mapping complete
- [ ] Conflicts identified and prioritized
- [ ] File change manifest created
- [ ] User stories drafted

### After Each Epic

- [ ] Must-pass checklist complete
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No regressions in existing features
- [ ] User acceptance testing passed

### After All Epics

- [ ] 0 P0 issues remaining
- [ ] All type safety gaps addressed
- [ ] Layer violations resolved
- [ ] Performance improved (measurable)
- [ ] Documentation updated

---

## Conclusion

This architectural remediation framework provides:

1. **Complete inventory** of all architectural issues across 6 domains
2. **Clear mapping** of how architecture issues impact features
3. **Prioritized remediation** grouped into 6 epics
4. **Detailed requirements** with user stories
5. **File change manifest** with verification checklists

**Recommended Next Step**: User review and approval of remediation plan, then proceed with Phase 1 quick wins.

---

*Generated by EXCALIBUR Event-Driven Workflow Orchestrator*
*Architectural Remediation Framework v1.0*
*All sub-agent reports archived in `_bmad-output/architectural-scan/`*
