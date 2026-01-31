---
story_key: "MM-01-unified-chat-store"
epic: 40
story: "MM-01"
status: "validated"
created_at: "2026-01-10T00:00:00+07:00"
points: 8
effort_hours: 4
priority: "P0"
track: "A"
team: "A"
governance:
  constitution: "_bmad/modules/governance/CONSTITUTION.md"
  version: "1.0.0"
  acknowledged_at: "2026-01-10"
  acknowledged_by: "@bmad-core-bmad-master"
  compliance:
    artifact_lifecycle: true
    naming_convention: true
    stale_artifact_protocol: true
    multi_team_coordination: true
---

# MM-01: Create Unified Chat Store

**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: A (Chat Unification - Foundation)
**Priority**: P0 (Critical)
**Effort**: 4 hours
**Dependencies**: None
**Status**: DRAFTED

---

## User Story

**As a** developer working on the chat system

**I want** a single unified Zustand store that combines the conversation hierarchy and tool execution capabilities

**So that** we have one source of truth for chat state, eliminating the dual-system fragmentation that causes data inconsistencies and UX issues

---

## Acceptance Criteria

### AC-1: Single Source of Truth
**Given** the application initializes
**When** any component accesses chat state
**Then** all reads come from `unified-chat-store.ts`

### AC-2: Thread Hierarchy Preserved
**Given** existing conversations with hierarchical thread structure
**When** the unified store is created
**Then** all parent-child relationships are maintained with zero data loss

### AC-3: Tool Execution Functional
**Given** a user invokes a tool via chat
**When** the tool execution completes
**Then** the result is stored in the unified store and visible in AgentChatPanel

### AC-4: IndexedDB Persistence
**Given** chat state changes
**When** the page reloads
**Then** all conversations and threads are restored from Dexie database

### AC-5: TypeScript Zero Errors
**Given** the unified store is created
**When** TypeScript validation runs
**Then** zero type errors in all affected files

---

## Tasks

- [ ] T1: Analyze existing `useConversationStore` and `AgentChatPanel` state structures
- [ ] T2: Design unified store schema combining both systems
- [ ] T3: Create `unified-chat-store.ts` with Zustand v5 patterns
- [ ] T4: Create `types.ts` for chat domain entities
- [ ] T5: Implement Dexie persistence layer
- [ ] T6: Add migration logic from old stores
- [ ] T7: Update `AgentChatPanel.tsx` to use unified store
- [ ] T8: Add backward compatibility facade for `useConversationStore`
- [ ] T9: Write unit tests for store operations
- [ ] T10: Verify TypeScript compliance

---

## Research Requirements

### Required MCP Research
- [ ] Context7: Zustand v5 documentation (combine, devtools, persist patterns)
- [ ] Context7: Dexie.js live queries and React hooks
- [ ] DeepWiki: pmndrs/zustand best practices for large stores

### Architecture Patterns to Follow
- **Pattern**: Clean Architecture - State belongs in infrastructure layer
- **Rationale**: See ADR-031 Section 2 - Chat System Unification
- **Location**: `src/infrastructure/persistence/stores/chat/`

---

## Dev Notes

### Dependencies
- `zustand`: ^5.0.0 - State management (useShallow required for multi-selector)
- `dexie`: ^3.x - IndexedDB wrapper
- `dexie-react-hooks`: ^1.x - React hooks for Dexie

### Integration Points
- **Touches**:
  - `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` (deprecate)
  - `src/presentation/components/ide/AgentChatPanel.tsx` (delegate to unified)
  - `src/infrastructure/persistence/dexie-db.ts` (add chat schema)
- **Breaks**: None (facade pattern for backward compatibility)
- **Tests Required**:
  - Unit: Store operations (add, update, delete conversations)
  - Unit: Thread hierarchy operations
  - Unit: Tool execution state management
  - Integration: Dexie persistence

### Clean Architecture Compliance
```
src/
├── domain/
│   └── types/
│       └── chat.ts          # ChatMessage, Conversation, Thread entities
├── infrastructure/
│   └── persistence/
│       └── stores/
│           └── chat/
│               ├── unified-chat-store.ts  # Main Zustand store
│               ├── types.ts               # Store-specific types
│               └── facade.ts              # Backward compatibility
```

---

## References

- **Epic**: [`epic-40-multimodal-chat-unification.md`](../../planning-artifacts/epics/epic-40-multimodal-chat-unification.md)
- **ADR-031**: [`adr-031-chat-system-unification.md`](../../planning-artifacts/architecture/adr-031-chat-system-unification.md)
- **Architecture**: [`architecture.md`](../../planning-artifacts/architecture.md) Section 4.3 - State Management
- **Related Stories**: MM-02, MM-03 (depend on MM-01)

---

## Dev Agent Record

*This section populated during development phase*

### Agent
- Model: Opus 4.5
- Session: 2026-01-10T00:00:00+07:00

### Task Progress
- [ ] T1: Analyze existing stores - PENDING
- [ ] T2: Design unified schema - PENDING
- [ ] T3: Create unified store - PENDING
- [ ] T4: Create types - PENDING
- [ ] T5: Implement persistence - PENDING
- [ ] T6: Add migration logic - PENDING
- [ ] T7: Update AgentChatPanel - PENDING
- [ ] T8: Add facade - PENDING
- [ ] T9: Write tests - PENDING
- [ ] T10: TypeScript verification - PENDING

### Research Executed

#### Context7 Research
- **Zustand v5 Patterns** (2026-01-09)
  - Pattern: `useShallow` for multi-selectors prevents re-renders
  - Pattern: Slice composition with spread operator
  - Pattern: `persist` middleware with `partialize` for selective persistence
  - Pattern: `create()` with devtools integration
  - Reference: https://zustand.docs.pmnd.rs

- **Dexie.js Live Queries** (2026-01-09)
  - Pattern: `useLiveQuery` hook for reactive IndexedDB queries
  - Pattern: `bulkPut` / `bulkGet` for batch operations
  - Pattern: Atomic transactions with `db.transaction('rw', ...)`
  - Reference: https://dexie.org

#### Codebase Analysis
- **useShallow Pattern** (verified in 3 files)
  - `useProjectStore.ts` Lines 89, 93, 98, 101
  - Pattern: `useStore(useShallow((state) => ({ items: state.items })))`
  - Prevents infinite loops from Object.values() reference changes

- **createDexieStorage Pattern** (verified in 3 files)
  - `dexie-storage.ts` - 237 lines, CANONICAL implementation
  - Pattern: `storage: createDexieStorage('tableName')`
  - Features: Quota handling, automatic cleanup, retry mechanism

### Implementation Plan

#### Approach
Create a unified Zustand store that combines:
1. **Thread hierarchy** from useConversationStore (CC-1.1 through CC-1.6)
2. **Tool execution state** from AgentChatPanel (pendingApprovals, toolExecutions)
3. **Dexie persistence** via createDexieStorage with quota handling
4. **Backward compatibility** via facade pattern for 2-week deprecation

#### Files to Create
- [ ] `src/domain/types/chat.ts` - Domain entities (ChatMessage, Conversation, Thread, ToolExecution)
- [ ] `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` - Main Zustand store (≤300 lines)
- [ ] `src/infrastructure/persistence/stores/chat/types.ts` - Store-specific types
- [ ] `src/infrastructure/persistence/stores/chat/facade.ts` - Backward compatibility facade
- [ ] `src/infrastructure/persistence/stores/chat/slices/` - Individual slices (≤120 lines each):
  - [ ] `chat-metadata-slice.ts` - Conversations, active IDs
  - [ ] `thread-management-slice.ts` - Thread CRUD, hierarchy
  - [ ] `message-crud-slice.ts` - Message operations
  - [ ] `tool-execution-slice.ts` - Tool approval, execution state (NEW)

#### Files to Modify
- [ ] `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` - Convert to facade
- [ ] `src/presentation/components/ide/AgentChatPanel.tsx` - Use unified store
- [ ] `src/infrastructure/persistence/dexie-db.ts` - Reference only (add chat schema if needed)

#### Integration Strategy
1. **Phase 1 (Foundation):** Create domain types and store slices
2. **Phase 2 (Unification):** Compose unified store from slices
3. **Phase 3 (Persistence):** Add Dexie persistence with migration logic
4. **Phase 4 (Migration):** Migrate existing data from conversation-store
5. **Phase 5 (Facade):** Convert useConversationStore to facade (2-week deprecation)
6. **Phase 6 (Component):** Update AgentChatPanel to use unified store

#### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | Critical | Backup before migration, verify counts |
| Breaking AgentChatPanel | High | Facade pattern ensures backward compat |
| Dexie quota exceeded | Medium | createDexieStorage handles cleanup |
| Performance regression | Medium | useShallow prevents unnecessary re-renders |
| Circular dependencies | Low | Clean Architecture paths enforced |

#### Test Strategy
- **Unit tests for:** Store operations (addConversation, createThread, addMessage)
- **Unit tests for:** Tool execution (approveTool, rejectTool, executeTool)
- **Unit tests for:** Thread hierarchy (parent-child relationships)
- **Integration tests for:** Dexie persistence (save → reload → verify)
- **E2E tests for:** User sends message → tool executes → response stored

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| ... | ... | ... |

### Tests Created
- *To be populated*

### Decisions Made
- *To be populated*

---

## Code Review

*This section populated during review phase*

**Reviewer:** TBD
**Date:** TBD

### Checklist
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] useShallow used for multi-selectors
- [ ] Clean Architecture paths followed
- [ ] Facade pattern for backward compatibility

### Issues Found
*Issues and resolutions documented here*

### Sign-off
[ ] APPROVED for merge

---

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-09T23:50:00+07:00 | SM | Created from epic-40 proposal |
| drafted | 2026-01-10T00:00:00+07:00 | BMAD Master | Story file created via 01-create-story |
| validated | 2026-01-10T00:05:00+07:00 | BMAD Master | Step 02 validation complete - 100% pass |

---

**Story Version**: 1.0.0
**Next Step**: Execute `02-validate-story.md`
