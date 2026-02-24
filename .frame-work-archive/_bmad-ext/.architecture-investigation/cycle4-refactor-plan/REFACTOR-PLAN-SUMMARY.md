# Cycle 4: Refactor Surgeon - Unified Refactor Plan Summary

**Generated**: 2026-01-18T15:00:00+07:00  
**Cycle**: 4 of N  
**Output Location**: `_bmad-ext/.architecture-investigation/cycle4-refactor-plan/`

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Issues** | 150 |
| **Critical** | 12 |
| **High** | 38 |
| **Medium** | 65 |
| **Low** | 35 |
| **Estimated Effort** | 8 weeks |
| **PR Count** | 24 |

---

## Source Analysis Summary

### Cycle 1: Architecture Scout
- **8 Bounded Contexts**: notes, knowledge, study, IDE, chat, workspace, providers, hub
- **8 God-Modules**: sync-manager, state-orchestrator, workspace-store-facade, centralized-tool-registry, etc.
- **8 Duplication Zones**: 4 sync implementations, duplicate entities, split provider logic

### Cycle 2: Critical Paths
- **3 Workflows Analyzed**: sync_notes (11 steps), run_tool (20 steps), workspace_switch (12 steps)
- **43 Total Steps** across workflows
- **18 Failure Points** identified

### Cycle 3: Invariants Auditor
- **17 Invariants** documented
- **6 Race Conditions** identified
- **4 Non-Idempotent Writes** identified
- **6 Missing Rollback Paths** identified
- **47 Security Findings** (6 critical, 12 high)
- **37 Performance Issues** (4 high, 23 medium)

---

## Phase Overview

### Phase 1: Immediate (Week 1) - 4 PRs
| PR | Title | Severity | Risk |
|----|-------|----------|------|
| 1 | Remove hardcoded API keys | Critical | Low |
| 2 | Replace eval() and new Function() calls | Critical | Medium |
| 3 | Add error isolation to event bus | High | Medium |
| 4 | Fix non-idempotent workspace switch | Medium | Low |

### Phase 2: Consolidation (Week 2) - 7 PRs
| PR | Title | Severity | Dependency |
|----|-------|----------|------------|
| 5 | Consolidate sync implementations | Critical | 1 |
| 6 | Consolidate entity definitions | High | 2 |
| 7 | Consolidate provider logic | High | 3 |
| 8 | Migrate lib/notes/ → infrastructure/stores/ | High | 4 |
| 9 | Migrate lib/knowledge/ → infrastructure/stores/ | High | 5 |
| 10 | Migrate lib/study/ → infrastructure/stores/ | Medium | 6 |
| 11 | Migrate lib/workspace/ → infrastructure/stores/ | High | 7 |

### Phase 3: Refactoring (Week 3-5) - 9 PRs
| PR | Title | Severity |
|----|-------|----------|
| 12 | Split sync-manager god module | High |
| 13 | Split state-orchestrator god module | High |
| 14 | Split workspace-store-facade | Medium |
| 15 | Split centralized-tool-registry | Medium |
| 16 | Split useTerminalStore god store | High |
| 17 | Split dexie-db.ts helper file | Medium |
| 18 | Implement two-phase dual-write pattern | High |
| 19 | Add workspace transition rollback | High |
| 20 | Enhance batch operation rollback | High |

### Phase 4: Security (Week 6-7) - 4 PRs
| PR | Title | Severity |
|----|-------|----------|
| 21 | Sanitize dangerouslySetInnerHTML usage | High |
| 22 | Fix API key URL exposure | High |
| 23 | Add path validation to all file operations | Medium |
| 24 | Add workspace validation to permission checks | High |

---

## Deletion Targets Summary

### Phase 1
- `src/lib/init/seed-workspace-permissions.ts` - Contains hardcoded API key
- `src/lib/agent/providers/agent-validation-service.ts` - Contains hardcoded API key

### Phase 2
- `lib/sync/` - Duplicated by infrastructure/sync/
- `lib/filesync/` - Duplicated by infrastructure/sync/workspace-services/
- `lib/filesystem/sync-manager/` - Duplicated by infrastructure/sync/
- `core/entities/` - Duplicated by domain/entities/
- `lib/agent/providers/` - Duplicated by domain/services/
- `lib/notes/` - Duplicated by infrastructure/persistence/stores/notes/
- `lib/knowledge/` - Duplicated by infrastructure/persistence/stores/knowledge/
- `lib/study/` - Duplicated by infrastructure/persistence/stores/study/
- `lib/workspace/` - Duplicated by infrastructure/persistence/stores/workspace/

### Phase 3
- `lib/filesystem/sync-manager/sync-manager.ts` - Replaced by split modules
- `infrastructure/persistence/state-orchestrator.ts` - Replaced by hydration-manager and initialization-manager
- `infrastructure/persistence/stores/workspace-store-facade.ts` - Replaced by dedicated facades
- `infrastructure/tools/centralized-tool-registry.ts` - Replaced by split modules
- `infrastructure/persistence/stores/terminal-store.ts` - Replaced by terminal slices
- `infrastructure/persistence/dexie-db.ts` - Replaced by domain-specific helper modules

---

## Module Ownership

| Context | Canonical Location | Forbidden Imports |
|---------|-------------------|-------------------|
| notes | `infrastructure/persistence/stores/notes/` | `lib/notes/*` |
| knowledge | `infrastructure/persistence/stores/knowledge/` | `lib/knowledge/*` |
| study | `infrastructure/persistence/stores/study/` | `lib/study/*` |
| IDE | `infrastructure/persistence/stores/ide/` | `lib/ide/*` |
| workspace | `infrastructure/persistence/stores/workspace/` | `lib/workspace/*` |
| sync | `infrastructure/sync/` | `lib/sync/*`, `lib/filesync/*`, `lib/filesystem/sync-manager/*` |
| providers | `infrastructure/persistence/stores/providers/` | `lib/agent/providers/*` |
| chat | `infrastructure/persistence/stores/chat/` | `lib/chat/*` |

---

## Critical Cross-Context Contracts

1. **notes → workspace**: Workspace must be loaded before notes can be accessed
2. **notes → sync**: FSA sync is optional and non-blocking for core persistence
3. **knowledge → notes**: Source imports can reference note entities
4. **study → knowledge**: Quiz and flashcard generation uses knowledge sources
5. **IDE → workspace**: IDE route depends on workspace being loaded
6. **IDE → chat**: Agent chat panel integrates with IDE
7. **chat → providers**: Chat uses provider adapter for LLM calls
8. **workspace → sync**: Workspace store triggers file sync operations
9. **hub → workspace**: Hub displays project and workspace data

---

## Characterization Tests (10 Tests)

| Test | Would Fail Today | Description |
|------|-----------------|-------------|
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

---

## Performance Recommendations

### High Priority
1. Add React.memo to unmemoized large components
2. Fix state update loops in NotesPage and KnowledgePage

### Medium Priority
1. Implement dynamic imports for Monaco Editor
2. Fix useCallback usage in hooks with event listeners
3. Remove duplicate cleanup in ChatBubbleOverlay

### Low Priority
1. Consider React Compiler for automatic memoization

---

## God Store Refactoring Plan

### Overview

| Metric | Value |
|--------|-------|
| Total God Stores | 3 |
| Current Lines | 1,978 |
| Target Lines | 270 |
| Reduction | **86%** |
| Estimated Effort | 26 hours |

### Target 1: `useConversationStore.ts` (496 lines)

**Status**: Deprecated Facade  
**Priority**: Medium  
**Risk**: High

**Problem**: Maps unified store state to legacy format, technical debt until removed

**Solution**:
1. Audit all consumers of `useConversationStore`
2. Migrate consumers to `useUnifiedChatStore` directly
3. Delete facade after migration complete

**PR Sequence**:
| Step | Action | Effort |
|------|--------|--------|
| 1 | Audit consumers | 1h |
| 2 | Migrate consumers | 4h |
| 3 | Delete facade | 1h |
| 4 | Update exports | 2h |

### Target 2: `terminal-store.ts` (317 lines)

**Status**: God Store  
**Priority**: High  
**Risk**: Medium

**Problem**: Single file >300 lines, no slice pattern, mixed concerns

**Solution**: Extract 5 slices
```
terminal/
├── terminal-types.ts       (40 lines) - Interfaces
├── terminal-tabs-slice.ts  (90 lines) - Tab CRUD
├── terminal-panel-slice.ts (50 lines) - Visibility/height
├── terminal-settings-slice.ts (60 lines) - Settings
└── index.ts                (80 lines) - Combined store
```

### Target 3: `dexie-db.ts` (1,165 lines)

**Status**: God File  
**Priority**: High  
**Risk**: High

**Problem**: 1,165 lines, 100+ helper functions, mixed domains

**Solution**: Split into 9 domain-specific modules
```
helpers/
├── ide-helpers.ts              (50 lines)  - IDE state
├── sync-helpers.ts             (100 lines) - Sync status
├── file-metadata-helpers.ts    (80 lines)  - File metadata
├── tool-execution-helpers.ts   (70 lines)  - Tool execution logs
├── fsa-handle-helpers.ts       (60 lines)  - FSA handles
├── session-snapshot-helpers.ts (50 lines)  - Snapshots
├── conversation-helpers.ts     (60 lines)  - Threads
├── knowledge-helpers.ts        (120 lines) - Sources/Collections
└── index.ts                    (100 lines) - Re-exports
```

### Priority Order

1. **dexie-db.ts** - Highest impact, most functions
2. **useTerminalStore** - Clear slice boundaries
3. **useConversationStore** - Consumer migration required

### Testing Requirements

| Store | Tests Needed |
|-------|-------------|
| useConversationStore | facade_equivalence, consumer_migration, type_mapper_coverage |
| useTerminalStore | tab_crud, panel_visibility, settings_persistence, command_history |
| dexie-db.ts | ide_state_crud, sync_status_operations, file_metadata_crud, tool_execution_logging, fsa_handle_persistence, session_snapshots, conversation_threads, knowledge_sources_collections |

---

## Files Generated

| File | Description |
|------|-------------|
| `god-store-refactor-plan.json` | Complete god store refactor plan |
| `REFACTOR-PLAN-SUMMARY.md` | This summary document |

---

*Generated by Cycle 4: Refactor Surgeon*  
*Input: Cycles 1-3 artifacts*  
*Output: `_bmad-ext/.architecture-investigation/cycle4-refactor-plan/`*