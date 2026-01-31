# Unified Architecture Diagnosis Report

**Generated**: 2026-01-18  
**Scope**: Full codebase analysis (~1,639 code files)  
**Cycles Analyzed**: 4  
**Report Version**: 1.0.0

---

## Executive Summary

This report consolidates findings from four comprehensive architecture investigation cycles, revealing a codebase with significant structural debt requiring systematic remediation. The analysis identified **150 total issues** across architecture, state management, performance, and security domains.

### Key Findings at a Glance

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Architecture Violations | 2 | 8 | 12 | 8 | 30 |
| State Management Issues | 1 | 4 | 8 | 3 | 16 |
| Security Vulnerabilities | 6 | 12 | 18 | 11 | 47 |
| Performance Issues | 0 | 4 | 23 | 10 | 37 |
| Invariant Violations | 2 | 4 | 6 | 5 | 17 |
| **Grand Total** | **11** | **32** | **67** | **37** | **147** |

### Root Cause Summary

The architecture suffers from three fundamental problems:

1. **Duplication Crisis**: Four separate sync implementations, duplicate entity definitions, and split provider logic create maintenance nightmares
2. **God Modules**: 8 god-modules exceeding 300 lines with multiple responsibilities
3. **Layer Bleeding**: Bidirectional dependencies between lib/, infrastructure/, and domain/ layers violate clean architecture principles

### Estimated Remediation Effort

| Phase | Duration | PRs | Risk Level |
|-------|----------|-----|------------|
| Phase 1: Immediate | Week 1 | 4 | Low-Medium |
| Phase 2: Consolidation | Week 2 | 7 | Medium-High |
| Phase 3: Refactoring | Weeks 3-5 | 9 | Medium-High |
| Phase 4: Security | Weeks 6-7 | 4 | Medium |
| **Total** | **8 weeks** | **24** | - |

---

## Problem Statement

### Architectural Fragmentation

The codebase exhibits severe architectural fragmentation across 8 bounded contexts, with critical issues in three areas:

#### 1. Sync Layer Chaos (CRITICAL)

**Four separate sync implementations exist simultaneously:**

```
lib/sync/                    ← Legacy sync (event bus, reverse sync)
lib/filesync/                ← Legacy file sync services
lib/filesystem/sync-manager/ ← Legacy sync manager (500+ lines god module)
infrastructure/sync/         ← New sync implementation
```

**Impact**: Developers must maintain 4 separate sync codebases with overlapping functionality. Each workspace (notes, knowledge, study, IDE) has duplicate file sync services in both `lib/filesync/` and `infrastructure/sync/workspace-services/`.

#### 2. Entity Definition Duplication

**Three duplicate entity definitions exist:**

```
core/entities/ vs domain/entities/:
  - Project.ts (duplicate)
  - Workspace.ts (duplicate)
  - Agent.ts (duplicate)
```

**Impact**: Source of truth is unclear, imports are inconsistent, and changes must be made in multiple locations.

#### 3. Provider Logic Fragmentation

**Provider logic split across 3 locations:**

```
lib/agent/providers/          ← model-registry.ts, provider-adapter.ts
domain/services/              ← universal-provider-registry.ts, universal-adapter-factory.ts
application/services/         ← ProviderService.ts, AgentService.ts
```

**Impact**: No single source of truth for provider configuration; circular dependencies between layers.

### Layer Boundary Violations

Analysis revealed 12 boundary violations where layers import from inappropriate locations:

| Violation Type | Count | Severity |
|----------------|-------|----------|
| Domain imports from lib | 4 | HIGH |
| Infrastructure imports from lib | 5 | MEDIUM |
| Lib imports from infrastructure | 2 | HIGH |
| Presentation imports into lib | 1 | LOW |

### God Modules

8 god-modules exceed 300 lines with multiple responsibilities:

| File | Lines | Issues |
|------|-------|--------|
| `lib/filesystem/sync-manager/sync-manager.ts` | ~500 | Handles planning, execution, rollback |
| `infrastructure/persistence/state-orchestrator.ts` | ~400 | Multiple store initializations |
| `infrastructure/persistence/stores/workspace-store-facade.ts` | ~300 | God facade |
| `infrastructure/tools/centralized-tool-registry.ts` | ~350 | Registry with too many concerns |
| `lib/agent/tool-permission-manager.ts` | ~300 | Multiple permission types |
| `dexie-db.ts` | 1,165 | 100+ helper functions, mixed domains |
| `useConversationStore.ts` | 496 | Deprecated facade with mapping |
| `useTerminalStore.ts` | ~317 | No slice pattern |

---

## Evidence by Category

### Architecture Violations

#### Sync Layer Duplication (CRITICAL)
- **Files**: `lib/sync/`, `lib/filesync/`, `lib/filesystem/sync-manager/`, `infrastructure/sync/`
- **Evidence**: 4 implementations of file sync for same workspaces
- **Recommendation**: Consolidate to `infrastructure/sync/` only

#### Entity Duplication (HIGH)
- **Files**: `core/entities/Project.ts`, `core/entities/Workspace.ts`, `core/entities/Agent.ts`
- **Evidence**: Duplicate definitions in `core/entities/` and `domain/entities/`
- **Recommendation**: Consolidate to `domain/entities/` only

#### Provider Logic Split (HIGH)
- **Files**: `lib/agent/providers/`, `domain/services/`, `application/services/`
- **Evidence**: Provider registry and adapter logic split across 3 locations
- **Recommendation**: Consolidate to `domain/services/` only

#### Lib Layer Duplication (HIGH)
- **Files**: `lib/notes/`, `lib/knowledge/`, `lib/study/`, `lib/workspace/`
- **Evidence**: Entire directories duplicate `infrastructure/persistence/stores/*`
- **Recommendation**: Migrate all to `infrastructure/persistence/stores/`

#### Layer Boundary Violations (MEDIUM)
- **Files**: 12 files with cross-layer imports
- **Evidence**: Domain imports lib, infrastructure imports lib, lib imports infrastructure
- **Recommendation**: Enforce layer boundaries via ESLint

### State Management Issues

#### God Stores (3 identified)
| Store | Lines | Status | Remediation |
|-------|-------|--------|-------------|
| `useConversationStore.ts` | 496 | Deprecated facade | Remove after migration |
| `useTerminalStore.ts` | 317 | No slice pattern | Split into 5 slices |
| `dexie-db.ts` | 1,165 | Mixed concerns | Split into 9 modules |

#### Persistence Inconsistencies
- **8 stores still use localStorage** (should migrate to Dexie):
  - `useNotificationStore`
  - `useLayoutStore`
  - `useQuizStore`
  - `useAnalyticsStore`
  - `usePluginsStore`
  - `useFileWatcherStore`
  - `useChatSettingsStore`
  - `useNavigationStore`

#### Duplicate Store Implementations
| Entity | Stores | Status |
|--------|--------|--------|
| Conversation | `useUnifiedChatStore`, `useConversationStore` | Facade pattern |
| Study | `useStudyStore`, `useStudyStoreRefactored` | Legacy + refactored |
| Notes | Multiple note stores in `lib/notes/` and `infrastructure/` | Fragmented |

### Performance Issues

#### State Update Loops (HIGH - 4 issues)
| File | Issue | Impact |
|------|-------|--------|
| `NotesPage.tsx` | Cross-workspace navigation loop | Infinite loop risk |
| `KnowledgePage.tsx` | Disabled event listeners | Known issue, cross-workspace sync broken |
| `AgentChatPanel.tsx` | Agent selection effect may cause loops | Medium |
| `use-chat-state-sync.ts` | State update events may trigger loops | High |

#### Render Waste (MEDIUM - 10 issues)
| Component | Lines | Missing |
|-----------|-------|---------|
| `AgentChatPanel.tsx` | 600+ | React.memo |
| `EnhancedChatInterface.tsx` | 400+ | React.memo |
| `NoteEditor.tsx` | 800+ | React.memo |
| `FileTree.tsx` | 300+ | React.memo |
| `SyncStatusPanel.tsx` | 400+ | React.memo |

#### Memory Leaks (MEDIUM - 10 issues)
| File | Issue | Severity |
|------|-------|----------|
| `ChatBubbleOverlay.tsx` | Duplicate cleanup calls | Low |
| `useCommandPalette.ts` | Missing useCallback | Medium |
| `useResponsiveBreakpoint.ts` | Missing useCallback | Low |
| Multiple editors | Complex subscriptions | Medium |

#### Bundle Bloat (MEDIUM - 10 issues)
| Import | Size | Lazy Load Possible? |
|--------|------|---------------------|
| monaco-editor | ~3.5MB | Yes (already using @monaco-editor/react) |
| @xyflow/react | ~500KB | Yes |
| BlockNote/TipTap | ~800KB | Yes |
| pdfjs-dist | ~400KB | Yes |
| chart.js/recharts | ~200KB | Yes |

### Security Vulnerabilities

#### Critical (6 issues)
| ID | Category | File | Issue |
|----|----------|------|-------|
| INJ-001 | Dynamic Code Execution | `lib/plugins/plugin-manager.ts` | `new Function()` allows arbitrary code execution |
| INJ-002 | Dynamic Code Execution | `lib/scheduler/task-scheduler.ts` | `new Function()` in task handler |
| INJ-003 | Dynamic Code Execution | `lib/knowledge/pdf-parser.ts` | `eval()` for CDN-loaded code |
| SEC-001 | Hardcoded API Key | `lib/init/seed-workspace-permissions.ts` | Hardcoded Gemini API key |
| SEC-002 | Hardcoded API Key | `lib/agent/providers/agent-validation-service.ts` | Hardcoded Gemini API key |
| SEC-003 | Process.env Exposure | Multiple files | `process.env.GEMINI_API_KEY` exposed to client |

#### High (12 issues)
| ID | Category | File | Issue |
|----|----------|------|-------|
| INJ-004 | DOM XSS | `DeepThinkUI.tsx` | `dangerouslySetInnerHTML` without sanitization |
| INJ-006 | DOM XSS | `RAGSearchPanel.tsx` | Unsanitized search results |
| SEC-005 | API Key in URL | `ai-image-service.ts` | API key in query parameter |
| SEC-006 | API Key in URL | `content-routing-agent.ts` | API key in query parameter |
| PERM-001 | Tool Execution | `plugin-manager.ts` | No permission check before `new Function()` |
| PERM-004 | Workspace Validation | `agent-validation-service.ts` | No workspace context for API key |

#### Medium (18 issues)
| ID | Category | File | Issue |
|----|----------|------|-------|
| INJ-005 | DOM XSS | `ChartDiagramBlock.tsx` | Unsanitized Mermaid SVG |
| INJ-007 | DOM XSS | `StreamdownRenderer.tsx` | Unsanitized SVG |
| INJ-008 | Command Injection | `command-sanitizer.ts` | Shell metacharacter pattern may miss edge cases |
| FILE-001 | Path Traversal | `path-utils.ts` | Validation needs verification |
| FILE-002 | Path Traversal | `sync-file-ops.ts` | `fs.mkdir` without validation |

### Invariant Violations

#### Race Conditions (6 identified)
| # | Location | Description | Likelihood | Impact |
|---|----------|-------------|------------|--------|
| 1 | `workspace-transition-manager.ts` | Concurrent switches can corrupt state | Medium | High |
| 2 | `cross-workspace-event-bus.ts` | Throwing listener crashes event bus | Medium | High |
| 3 | `sync-manager.ts` | Dual write not atomic | Medium | High |
| 4 | `workspace-store.ts` | setTimeout not cancelable | Low | Medium |
| 5 | `note-sync-slice.ts` | Debounce timers not cleaned on unload | Low | Low |
| 6 | `file-tools-impl.ts` | Concurrent batch operations can interleave | Low | Medium |

#### Non-Idempotent Writes (4 identified)
| # | Location | Function | Issue |
|---|----------|----------|-------|
| 1 | `workspace-store.ts` | `setCurrentWorkspace` | Multiple calls emit duplicate events |
| 2 | `note-sync-slice.ts` | `triggerAutoSave` | Rapid keystrokes create multiple saves |
| 3 | `cross-workspace-event-bus.ts` | `emitWorkspaceChanged` | Duplicate events for same transition |
| 4 | `sync-engine-core.ts` | `sync` | Concurrent calls throw error |

#### Missing Rollback Paths (6 identified)
| # | Location | Operation | Missing Compensation |
|---|----------|-----------|---------------------|
| 1 | `workspace-transition-manager.ts` | Partial transition failure | Revert workspaceStore |
| 2 | `sync-manager.ts` | Local FS succeeds, WebContainer fails | Delete Local FS file |
| 3 | `sync-manager.ts` | Local FS delete succeeds, WebContainer fails | Re-create file |
| 4 | `file-tools-impl.ts` | writeMultiple rollback | Restore pre-existing files |
| 5 | `file-tools-impl.ts` | deleteMultiple rollback | Restore original content |
| 6 | `workspace-store.ts` | Event listener failure | Catch and log errors |

---

## Risk Matrix

| Issue | Severity | Likelihood | Impact | Priority | Remediation |
|-------|----------|------------|--------|----------|-------------|
| Hardcoded API keys | Critical | High | Complete compromise | P0 | Remove immediately |
| eval/new Function usage | Critical | High | Arbitrary code execution | P0 | Replace with safe alternatives |
| Four sync implementations | Critical | High | Maintenance nightmare | P0 | Consolidate to infrastructure/sync |
| Event listener error isolation | High | Medium | Event bus crash | P1 | Wrap listeners in try-catch |
| Dual write not atomic | High | Medium | Data inconsistency | P1 | Implement two-phase commit |
| DOM XSS vulnerabilities | High | Medium | XSS attacks | P1 | Add DOMPurify sanitization |
| API key in URL | High | Medium | Credential leak | P1 | Use Authorization header |
| Workspace transition rollback | High | Medium | State corruption | P1 | Add transaction semantics |
| Batch operation rollback | High | Medium | Data loss | P1 | Track pre-existing files |
| God stores (>300 lines) | High | Medium | Maintenance difficulty | P2 | Split into slices |
| Duplicate entities | Medium | Low | Confusion | P2 | Consolidate to domain/entities |
| Provider logic split | Medium | Low | Confusion | P2 | Consolidate to domain/services |
| Lib layer duplication | Medium | Low | Confusion | P2 | Migrate to infrastructure/stores |
| Layer boundary violations | Medium | Low | Architecture erosion | P3 | Add ESLint rules |
| Performance issues | Medium | Low | UX degradation | P3 | Add React.memo, fix loops |
| Memory leaks | Low | Low | Resource exhaustion | P3 | Fix cleanup patterns |

---

## Refactor Roadmap

### Phase 1: Immediate (Week 1)

**Goal**: Fix critical security issues and stabilize core workflows

| PR | Title | Files | Risk | Tests |
|----|-------|-------|------|-------|
| 1 | Remove hardcoded API keys | `seed-workspace-permissions.ts`, `agent-validation-service.ts` | Low | 0 |
| 2 | Replace eval/new Function | `plugin-manager.ts`, `task-scheduler.ts`, `pdf-parser.ts` | Medium | 2 |
| 3 | Add error isolation to event bus | `cross-workspace-event-bus.ts` | Medium | 1 |
| 4 | Fix non-idempotent workspace switch | `workspace-store.ts` | Low | 1 |

**Deletion Targets**:
- `src/lib/init/seed-workspace-permissions.ts`
- `src/lib/agent/providers/agent-validation-service.ts`

### Phase 2: Consolidation (Week 2)

**Goal**: Eliminate duplication and establish single source of truth

| PR | Title | Files Moved/Removed | Risk | Tests |
|----|-------|---------------------|------|-------|
| 5 | Consolidate sync implementations | `lib/sync/`, `lib/filesync/`, `lib/filesystem/sync-manager/` | High | 5 |
| 6 | Consolidate entity definitions | `core/entities/` → `domain/entities/` | High | 3 |
| 7 | Consolidate provider logic | `lib/agent/providers/` → `domain/services/` | Medium | 2 |
| 8 | Migrate lib/notes/ → infrastructure/stores/ | `lib/notes/` | High | 3 |
| 9 | Migrate lib/knowledge/ → infrastructure/stores/ | `lib/knowledge/` | High | 2 |
| 10 | Migrate lib/study/ → infrastructure/stores/ | `lib/study/` | Medium | 2 |
| 11 | Migrate lib/workspace/ → infrastructure/stores/ | `lib/workspace/` | High | 3 |

**Module Ownership Rules**:
```
notes        → infrastructure/persistence/stores/notes/      (forbidden: lib/notes/*)
knowledge    → infrastructure/persistence/stores/knowledge/  (forbidden: lib/knowledge/*)
study        → infrastructure/persistence/stores/study/      (forbidden: lib/study/*)
IDE          → infrastructure/persistence/stores/ide/        (forbidden: lib/ide/*)
workspace    → infrastructure/persistence/stores/workspace/  (forbidden: lib/workspace/*)
sync         → infrastructure/sync/                          (forbidden: lib/sync/*, lib/filesync/*, lib/filesystem/sync-manager/*)
providers    → infrastructure/persistence/stores/providers/  (forbidden: lib/agent/providers/*)
chat         → infrastructure/persistence/stores/chat/       (forbidden: lib/chat/*)
```

### Phase 3: Refactoring (Weeks 3-5)

**Goal**: Split god modules and implement missing invariants

| PR | Title | Files Created/Removed | Risk | Tests |
|----|-------|----------------------|------|-------|
| 12 | Split sync-manager god module | `sync-planner.ts`, `sync-executor.ts`, `sync-rollback.ts` | High | 4 |
| 13 | Split state-orchestrator | `hydration-manager.ts`, `initialization-manager.ts` | High | 3 |
| 14 | Split workspace-store-facade | `workspace-facade.ts`, `project-facade.ts` | Medium | 2 |
| 15 | Split centralized-tool-registry | `tool-catalog.ts`, `tool-permissions.ts`, `tool-registration.ts` | Medium | 3 |
| 16 | Split useTerminalStore | `terminal-tabs-slice.ts`, `terminal-panel-slice.ts`, etc. | Medium | 2 |
| 17 | Split dexie-db.ts | `ide-helpers.ts`, `sync-helpers.ts`, `file-metadata-helpers.ts`, etc. | High | 5 |
| 18 | Implement two-phase dual-write | `two-phase-commit.ts`, `dual-write-rollback.ts` | High | 4 |
| 19 | Add workspace transition rollback | `workspace-transition-rollback.ts` | Medium | 2 |
| 20 | Enhance batch operation rollback | `batch-rollback-manager.ts` | Medium | 2 |

**God Store Refactoring Details**:

| Store | Current Lines | Target Lines | Reduction | Effort |
|-------|---------------|--------------|-----------|--------|
| `dexie-db.ts` | 1,165 | 150 | 87% | 12 hours |
| `useTerminalStore` | 317 | 120 | 62% | 6 hours |
| `useConversationStore` | 496 | 0 (delete) | 100% | 8 hours |

### Phase 4: Security (Weeks 6-7)

**Goal**: Complete security hardening

| PR | Title | Files Modified | Risk | Tests |
|----|-------|----------------|------|-------|
| 21 | Sanitize dangerouslySetInnerHTML | `CommandPalette.tsx`, `DeepThinkUI.tsx`, `ChartDiagramBlock.tsx`, `RAGSearchPanel.tsx`, `StreamdownRenderer.tsx` | Medium | 3 |
| 22 | Fix API key URL exposure | `ai-image-service.ts`, `content-routing-agent.ts` | Medium | 2 |
| 23 | Add path validation to all file operations | `sync-file-ops.ts`, `sync-batch-writer.ts`, `sync-rollback-executor.ts` | Medium | 2 |
| 24 | Add workspace validation to permission checks | `tool-permission-manager.ts` | Low | 2 |

---

## Success Metrics

### Architecture Metrics

- [ ] **Zero duplicate sync implementations**: Only `infrastructure/sync/` exists
- [ ] **Single source of truth for entities**: All entities in `domain/entities/`
- [ ] **Consolidated provider logic**: All provider logic in `domain/services/`
- [ ] **No lib/ duplication**: All `lib/*/` migrated to `infrastructure/persistence/stores/*/`
- [ ] **Layer boundaries enforced**: ESLint rules prevent cross-layer imports

### State Management Metrics

- [ ] **Zero god stores**: All stores <300 lines
- [ ] **Slice pattern compliance**: All stores use slice pattern (<120 lines per slice)
- [ ] **Single persistence layer**: All stores use Dexie (no localStorage)
- [ ] **No deprecated facades**: `useConversationStore` removed

### Security Metrics

- [ ] **Zero hardcoded API keys**: No API keys in source code
- [ ] **Zero eval/new Function**: No dynamic code execution
- [ ] **Zero XSS vulnerabilities**: All `dangerouslySetInnerHTML` sanitized with DOMPurify
- [ ] **Zero API keys in URLs**: All use Authorization headers
- [ ] **Workspace validation**: All permission checks validate workspace context

### Performance Metrics

- [ ] **Zero state update loops**: NotesPage and KnowledgePage loops fixed
- [ ] **React.memo on all large components**: AgentChatPanel, EnhancedChatInterface, NoteEditor, etc.
- [ ] **Proper useCallback**: All event handlers properly memoized
- [ ] **No memory leaks**: All cleanup functions correct
- [ ] **Lazy loading**: Heavy dependencies dynamically imported

### Invariant Metrics

- [ ] **Event listener error isolation**: Throwing listeners don't crash event bus
- [ ] **Atomic dual write**: Two-phase commit with rollback
- [ ] **Workspace transition rollback**: Partial failures revert state
- [ ] **Comprehensive batch rollback**: Pre-existing files restored on failure
- [ ] **Idempotent operations**: Multiple calls don't cause duplicate work

---

## Appendices

### A. File Inventory

#### Bounded Contexts (8 total)

| Context | Entities | Primary Store | Status |
|---------|----------|---------------|--------|
| notes | Note, Block, Prompt | `infrastructure/persistence/stores/notes/` | Fragmented |
| knowledge | Source, Collection, RAGIndex | `infrastructure/persistence/stores/knowledge/` | Fragmented |
| study | Quiz, Flashcard, StudySession | `infrastructure/persistence/stores/study/` | Fragmented |
| IDE | File, EditorTab, TerminalSession | `infrastructure/persistence/stores/ide/` | Fragmented |
| chat | Conversation, Message, Thread | `infrastructure/persistence/stores/chat/` | Mostly Unified |
| workspace | Project, Workspace, Binding | `infrastructure/persistence/stores/workspace/` | Fragmented |
| providers | Provider, Model, Credentials | `infrastructure/persistence/stores/providers/` | Fragmented |
| hub | DashboardMetrics, Activity | `infrastructure/persistence/stores/hub-store.ts` | Unified |

#### God Modules (8 total)

| File | Lines | Priority |
|------|-------|----------|
| `lib/filesystem/sync-manager/sync-manager.ts` | 500 | P0 |
| `infrastructure/persistence/state-orchestrator.ts` | 400 | P0 |
| `dexie-db.ts` | 1,165 | P0 |
| `infrastructure/tools/centralized-tool-registry.ts` | 350 | P1 |
| `lib/agent/tool-permission-manager.ts` | 300 | P1 |
| `infrastructure/persistence/stores/workspace-store-facade.ts` | 300 | P1 |
| `useConversationStore.ts` | 496 | P1 |
| `useTerminalStore.ts` | 317 | P1 |

#### Duplication Zones (8 total)

| Pattern | Locations | Status |
|---------|-----------|--------|
| sync.* | lib/sync/, lib/filesync/, lib/filesystem/sync-manager/, infrastructure/sync/ | CRITICAL |
| note.*store | lib/notes/, infrastructure/persistence/stores/notes/ | HIGH |
| workspace.*store | lib/workspace/, infrastructure/persistence/stores/workspace/ | HIGH |
| provider.*registry | lib/agent/providers/, domain/services/ | MEDIUM |
| file.*sync.*service | lib/filesync/*, infrastructure/sync/workspace-services/* | CRITICAL |
| entity.*Project | core/entities/, domain/entities/ | MEDIUM |
| entity.*Workspace | core/entities/, domain/entities/ | MEDIUM |
| entity.*Agent | core/entities/, domain/entities/ | MEDIUM |

### B. Test Coverage Gaps

#### Characterization Tests Needed (10 tests)

| Test | Would Fail Today | Description |
|------|------------------|-------------|
| `test_workspace_switch_concurrent` | ✅ Yes | Simultaneous switches should be serialized |
| `test_workspace_switch_partial_failure` | ✅ Yes | Revert on mid-transition failure |
| `test_event_listener_error_isolation` | ✅ Yes | Throwing listener doesn't crash bus |
| `test_dual_write_rollback` | ✅ Yes | Rollback Local FS on WebContainer failure |
| `test_batch_write_rollback_comprehensive` | ✅ Yes | Restore pre-existing files on rollback |
| `test_sync_idempotency` | ✅ Yes | Multiple sync calls don't throw |
| `test_transition_timeout_cleanup` | ✅ Yes | Rapid switches don't leave stale timeouts |
| `test_note_idempotent_save` | ❌ No | Multiple saves work correctly |
| `test_hardcoded_api_keys_removed` | ✅ Yes | No hardcoded API keys in source |
| `test_eval_usage_eliminated` | ✅ Yes | No eval/new Function in production |

#### Store-Specific Tests Needed

| Store | Tests Needed |
|-------|-------------|
| `useConversationStore` | facade_equivalence, consumer_migration, type_mapper_coverage |
| `useTerminalStore` | tab_crud, panel_visibility, settings_persistence, command_history |
| `dexie-db.ts` | ide_state_crud, sync_status_operations, file_metadata_crud, tool_execution_logging, fsa_handle_persistence, session_snapshots, conversation_threads, knowledge_sources_collections |

### C. Migration Artifacts

#### In-Progress Refactoring (7 files)

| Path | Original | Status |
|------|----------|--------|
| `WorkflowBuilder.refactored.tsx` | `WorkflowBuilder.tsx` | In progress |
| `study-store-refactored.ts` | `study-store.ts` | In progress |
| `file-sync-status-store-refactored.ts` | `file-sync-status-store.ts` | In progress |
| `file-snapshot-store-refactored.ts` | `file-snapshot-store.ts` | In progress |
| `workflow-builder-store-refactored.ts` | `workflow-builder-store.ts` | In progress |
| `snippet-store-refactored.ts` | `snippet-store.ts` | In progress |
| `note-store-refactored.ts` | `note-store.ts` | In progress |

#### Backup/Temporary Files

| Path | Original | Status |
|------|----------|--------|
| `routeTree.gen.ts.backup` | `routeTree.gen.ts` | Backup |
| `vi.json.tmp` | `vi.json` | Temporary |

---

## Cross-Context Contracts

### Critical Workflow Invariants

#### Workspace Switch (8 invariants)
**Pre-conditions**:
- Project must be loaded
- Target workspace must be enabled
- At least one agent available
- No concurrent transitions
- Store hydration complete
- Dexie DB open

**Invariants**:
- isTransitioning flag cleared after completion
- currentWorkspace matches target

#### Sync Notes (4 invariants)
**Pre-conditions**:
- Note ID constant throughout lifecycle
- Dexie operations atomic per record
- FSA sync is optional/non-blocking

**Invariants**:
- IndexedDB always has most recent data

#### Run Tool (5 invariants)
**Pre-conditions**:
- ToolPermissionManager singleton initialized
- WebContainer booted for terminal tools
- File locks released even on error

**Invariants**:
- Permission checks before execution
- Execution logged to IndexedDB

### Inter-Context Dependencies

| From | To | Coupling | Contract |
|------|-----|----------|----------|
| notes | workspace | Strong | Workspace must be loaded before notes |
| notes | sync | Strong | FSA sync is optional, non-blocking |
| knowledge | notes | Medium | Source imports can reference note entities |
| study | knowledge | Strong | Quiz/flashcard generation uses knowledge |
| IDE | workspace | Strong | IDE route depends on workspace |
| IDE | chat | Strong | Agent chat panel integrates with IDE |
| chat | providers | Strong | Chat uses provider adapter for LLM |
| workspace | sync | Strong | Workspace store triggers sync |
| hub | workspace | Strong | Hub displays project/workspace data |

---

*Report generated by Unified Architecture Diagnosis System*  
*Input artifacts: Cycles 1-4 architecture investigation files*  
*Output location: `_bmad-ext/.architecture-investigation/consolidated/`*