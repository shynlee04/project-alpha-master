---
story_key: "CHAT-005-thread-workspace-association"
epic: "EPIC-CHAT"
story: 5
status: "partial"
created_at: "2026-01-12T23:00:00+07:00"
version: "2.0"
points: 16
phase: 2
---

# CHAT-005: Implement Thread Workspace Association

## User Story

**As a** developer working on the chat system
**I want** threads to be properly associated with workspaces at the store layer
**So that** threads can be reliably filtered, queried, and managed per workspace without manual filtering in UI components

### Epic Context

From **EPIC-CHAT: Unified Chat System Remediation**
- Epic Goal: Fix 7 critical problem areas in the chat system (Layout, Controls, Architecture, Thread Management, Input/Output, Design)
- This Story Supports: "Thread Management: No CRUD UI, no workspace association"
- Epic Progress: 32% complete (7/22 stories done)
- Phase: Phase 2 - Thread Management & Message Display (Weeks 4-6, 50h effort)

## Acceptance Criteria

### AC-1: Add getThreadsByWorkspace Method to Store

**Given** the unified chat store with thread management slice
**When** querying threads by workspace type
**Then** threads are filtered by `workspaceType` and excluded by `status === 'deleted'`

#### Implementation Hints
- File: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`
- File: `src/infrastructure/persistence/stores/chat/unified-chat-types.ts`
- Pattern: Follow existing `getConversationsByWorkspace` pattern from chat-metadata-slice.ts:141

#### Edge Cases to Handle
- Threads with `workspaceType = undefined` should be excluded from workspace-scoped queries
- Threads with `status = 'deleted'` should be excluded from active queries
- Threads with `status = 'archived'` should be included (filter separately if needed)

### AC-2: Add Workspace Validation to Thread Creation

**Given** a conversation with `workspaceType = 'ide'`
**When** creating a thread via `createThread(conversationId)`
**Then** the thread's `workspaceType` is set to match the conversation's `workspaceType`

#### Implementation Hints
- File: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`
- Current code already does this at line 68, but needs validation/error handling
- Add console warning if conversation has no `workspaceType`

#### Edge Cases to Handle
- Conversation without `workspaceType` should throw error or log warning
- Thread creation should fail gracefully if conversation doesn't exist

### AC-3: Add Thread Title Update to Store

**Given** an existing thread with title "Old Title"
**When** updating the thread title to "New Title"
**Then** the thread's `title` and `updatedAt` fields are updated and persisted

#### Implementation Hints
- File: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`
- Add method: `updateThread: (threadId: string, updates: Partial<ThreadWithId>) => void`
- Call `get().persistConversation()` after update

#### Edge Cases to Handle
- Thread not found should log warning and return
- Thread with different `workspaceType` should be rejected (workspace validation)
- Thread with `status = 'deleted'` should not allow updates

## Deep Analysis

### Cross-Impact Mapping

| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅ | HIGH | ThreadManager.tsx, AgentChatPanel.tsx |
| Notes | ✅ | HIGH | NoteSidebarChat.tsx, UnifiedChatPanel.tsx |
| Knowledge | ✅ | MEDIUM | KnowledgePage.tsx chat components |
| Study | ✅ | LOW | Future workspace |
| Shared UI | ✅ | HIGH | useThreadManager hook (line 79 filters manually) |

#### Dependencies
- **Depends On**: None
- **Required By**: CHAT-006 (Thread CRUD Operations), CHAT-007 (Collapsible Sections)

#### Architectural Impact
- **Layers Touched**: domain (ChatThread entity), infrastructure (store slice), presentation (hook)
- **Clean Architecture**: ✅ COMPLIANT - extends existing slice, maintains separation
- **Potential Conflicts**: None detected - this is additive work

### Dead Code & Overlap Detection

#### Files to Check
- `src/presentation/hooks/useThreadManager.ts:79` - Manual filtering that could be replaced by store method
- `src/presentation/components/chat/ThreadManager.tsx:62` - Uses hook, will benefit from store method

#### Recommendations
- Keep manual filtering in hook for flexibility (conversationId + workspaceType combo)
- Add store method for workspace-only queries (useful for global thread lists)
- Add updateThread method to complete CRUD operations

## Tasks

- [ ] T1: Add getThreadsByWorkspace method to thread-management-slice.ts (implementation) - 2h
- [ ] T2: Add updateThread method for title changes (implementation) - 2h
- [ ] T3: Add workspace validation to createThread (implementation) - 1h
- [ ] T4: Update CombinedUnifiedChatState type to include new methods (types) - 0.5h
- [ ] T5: Write unit tests for getThreadsByWorkspace (testing) - 2h
- [ ] T6: Write unit tests for updateThread (testing) - 2h
- [ ] T7: Update useThreadManager hook to use store method (refactor) - 1h
- [ ] T8: Integration test with ThreadManager component (testing) - 2h
- [ ] T9: Update documentation and inline comments (documentation) - 0.5h
- [ ] T10: Run TypeScript validation and fix any errors (validation) - 0.5h

## Research Requirements

### Required MCP Research
- [ ] **Context7**: Zustand slice pattern documentation
  - Query: "Zustand slice pattern best practices for selective querying"
  - Expected: Patterns for efficient state filtering

### Codebase Analysis
- [ ] Review `getConversationsByWorkspace` implementation in chat-metadata-slice.ts for pattern reference
- [ ] Check for any existing thread update mechanisms that might conflict

## Architecture Patterns

### Patterns to Follow
- **Pattern**: Zustand Slice with Selective Query Methods
  - Source: `src/infrastructure/persistence/stores/chat/slices/chat-metadata-slice.ts:141`
  - Rationale: Consistent pattern across all store slices
  - Example: `getConversationsByWorkspace: (workspaceType) => state.conversations.filter(c => c.workspaceType === workspaceType)`

### Constraints
- Slice file size: Keep thread-management-slice.ts under 200 lines (currently 176 lines)
- Import order: React → Zustand → Domain types
- Style: 8-bit design for any UI changes

## Dev Notes

### Integration Points
- **Touches**:
  - `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`
  - `src/infrastructure/persistence/stores/chat/unified-chat-types.ts`
  - `src/presentation/hooks/useThreadManager.ts`
- **Breaks**: None - additive changes
- **Shared With**: CHAT-006 (Thread CRUD), CHAT-007 (Collapsible Sections)

### Technical Considerations
- Thread creation already sets `workspaceType` from conversation (line 68 of thread-management-slice.ts)
- Hook does manual filtering - adding store method provides consistency
- Update thread needed for rename functionality in ThreadManager UI
- Workspace validation prevents cross-workspace thread operations

### Current State Analysis

**What Exists:**
1. `ChatThread.workspaceType?: WorkspaceType` property exists in domain entity
2. `ThreadManagementSlice.createThread` sets `workspaceType` from conversation
3. `useThreadManager` hook manually filters by `workspaceType` (line 79)
4. `ThreadManager` UI component passes `workspaceType` prop

**What's Missing:**
1. `getThreadsByWorkspace` method in store (hook does manual filtering)
2. `updateThread` method for title updates (UI has placeholder TODOs)
3. Workspace validation enforcement in operations

**Code Evidence:**
```typescript
// thread-management-slice.ts:68 - Already sets workspaceType
workspaceType: conversation?.workspaceType,

// useThreadManager.ts:79 - Manual filtering (should be in store)
if (thread.workspaceType !== workspaceType) return false

// ThreadManager.tsx:122 - TODO for title update
// TODO: Implement thread title update in store
```

## References

- **Epic**: sprint-status.yaml#epic_chat_status
- **Architecture**: ADR-031 Chat System Unification
- **Related Stories**:
  - CHAT-003: 8-bit Design System (completed)
  - CHAT-006: Thread CRUD Operations (depends on this)
  - CHAT-021: NoteSidebarChat Refactor (completed - shows workspace pattern)

## Pre-Planning Gate Report

**Story:** CHAT-005-thread-workspace-association
**Date:** 2026-01-12T23:30:00+07:00

### Research Summary
| Tool | Queries | Findings |
|------|---------|----------|
| Context7 | 2 | Zustand slice pattern, selector optimization with useShallow |
| Codebase | 3 | getConversationsByWorkspace pattern, thread-management-slice structure, useThreadManager hook |

### Research Executed

#### Context7: Zustand (/pmndrs/zustand)
- **Pattern 1:** Slices use `StateCreator<State, [], [], Slice>` type pattern
- **Pattern 2:** Selectors in components: `useStore((state) => state.property)`
- **Pattern 3:** Multiple properties use `useShallow((state) => ({ prop1, prop2 }))`
- **Reference:** https://github.com/pmndrs/zustand/blob/main/docs/guides/advanced-typescript.md

#### Codebase Pattern Analysis
- **getConversationsByWorkspace** (chat-metadata-slice.ts:141-142):
  ```typescript
  getConversationsByWorkspace: (workspaceType) =>
    get().getAllConversations().filter((c) => c.workspaceType === workspaceType),
  ```
- Pattern: Chain through `getAllConversations()` which already filters deleted items

### Standards Check
| Standard | Status | Notes |
|----------|--------|-------|
| Coding Style | ✅ | TypeScript strict, useShallow for multiple selectors |
| Error Handling | ✅ | Try-catch for async ops, console.warn for validation failures |
| Architecture | ✅ | Clean Architecture: domain → infrastructure → presentation |
| Size Limits | ✅ | Slice <200 lines (current 176), new methods will be ~20 lines |
| Import Pattern | ✅ | React → Zustand → @/domain → @/infrastructure |

### Implementation Plan

#### Approach
Add workspace-scoped query methods to `thread-management-slice.ts` following the exact pattern used in `chat-metadata-slice.ts` for `getConversationsByWorkspace`.

#### Files to Create
- [ ] `src/infrastructure/persistence/stores/chat/slices/__tests__/thread-management-slice.workspace.test.ts` - Unit tests for getThreadsByWorkspace
- [ ] `src/infrastructure/persistence/stores/chat/slices/__tests__/thread-management-slice.update.test.ts` - Unit tests for updateThread

#### Files to Modify
- [ ] `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts` - Add getThreadsByWorkspace, updateThread methods
- [ ] `src/infrastructure/persistence/stores/chat/unified-chat-types.ts` - Add methods to CombinedUnifiedChatState interface
- [ ] `src/presentation/hooks/useThreadManager.ts` - Use new store method, remove TODO comment

#### Integration Strategy
1. **Add getThreadsByWorkspace** method following exact pattern from chat-metadata-slice.ts:141
2. **Add updateThread** method with workspace validation and persistConversation() call
3. **Enhance createThread** validation with console.warning for missing workspaceType
4. **Update types** in unified-chat-types.ts CombinedUnifiedChatState interface
5. **Update hook** to optionally use store method (keep manual filtering for flexibility)

#### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| Slice exceeds 200 lines | LOW | Methods are small (~10-15 lines each), current 176 lines |
| TypeScript errors | LOW | Following exact existing pattern, types will be consistent |
| Breaking changes | LOW | Additive only, no existing APIs changed |

#### Test Strategy
- Unit tests for `getThreadsByWorkspace`: filters by workspaceType, excludes deleted, includes archived
- Unit tests for `updateThread`: updates title, validates workspace, rejects deleted threads
- Integration test: ThreadManager component workspace filtering

### Overall: ✅ PASS

Pre-planning gate passed. Ready for implementation.

## Dev Agent Record
*Populated during development phase*

## Code Review
*Populated during review phase*

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-11 | SM | From epic backlog |
| drafted | 2026-01-12T23:00:00+07:00 | SM | Story file created v2.0 |
| | | | |
| | | | |

---

## ACTUAL CODE REVIEW (Post-Verification 2026-01-13)

### Status: ⚠️ **PARTIALLY IMPLEMENTED (not documented)**

This story is marked as "drafted" but significant implementation exists in the codebase.

### Verification Against Codebase (2026-01-13)

```bash
# Store methods exist
$ grep -n "getThreadsByWorkspace\|updateThread\|createThread" src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts
23:  createThread: (conversationId, parentThreadId) => string;
25:  updateThread: (threadId, updates) => void;
33:  getThreadsByWorkspace: (workspaceType) => ThreadWithId[];
64: createThread: (conversationId, parentThreadId) => {
138: updateThread: (threadId, updates) => {
269: getThreadsByWorkspace: (workspaceType) =>

# Hook uses updateThread
$ grep -n "getThreadsByWorkspace\|updateThread" src/presentation/hooks/useThreadManager.ts
78:  const updateThread = useUnifiedChatStore((state) => state.updateThread)
130:      updateThread(threadId, { title })
198:      updateThread(threadId, updates)

# Hook does NOT use getThreadsByWorkspace (still manual filtering)
$ grep "getThreadsByWorkspace" src/presentation/hooks/useThreadManager.ts
# Result: (empty) - not using the store method
```

### What Was Documented vs What Exists

| Claim | Status | Evidence |
|-------|--------|----------|
| Add getThreadsByWorkspace to store | ✅ IMPLEMENTED | Line 33, 269 in thread-management-slice.ts |
| Add updateThread to store | ✅ IMPLEMENTED | Line 25, 138 in thread-management-slice.ts |
| Workspace validation in createThread | ✅ IMPLEMENTED | Line 68-70 sets workspaceType from conversation |
| Hook uses getThreadsByWorkspace | ❌ NOT IMPLEMENTED | Hook still does manual filtering |
| Tests created | ❌ UNKNOWN | No test files found |
| Story status updated | ❌ INCOMPLETE | Still shows "drafted" |

### Actual Current State (2026-01-13)

1. **Store Methods Implemented**: Both `getThreadsByWorkspace` and `updateThread` exist
2. **Hook Integration Partial**: `updateThread` is used (line 78) but `getThreadsByWorkspace` is not
3. **Manual Filtering Remains**: Hook still filters manually instead of calling store method
4. **TODO Comment Found**: Line 107 in ThreadManager.tsx has TODO for `clearActiveThread`

### Code Quality Issues

**Problem 1: Unused Store Method**
```typescript
// Store has the method (line 269)
getThreadsByWorkspace: (workspaceType) => { /* implementation */ }

// But hook doesn't use it (useThreadManager.ts)
// Still doing manual filtering somewhere
```

**Problem 2: Incomplete Implementation**
The store methods exist but the hook wasn't updated to use them. This creates a disconnect between what the store provides and what the hook uses.

### Recommendation

**This story is PARTIALLY DONE**:

1. ✅ Store methods exist (`getThreadsByWorkspace`, `updateThread`)
2. ❌ Hook not updated to use `getThreadsByWorkspace`
3. ❌ No tests documented
4. ❌ Story status not updated

**Remaining work**:
1. Update `useThreadManager` to use `getThreadsByWorkspace` instead of manual filtering
2. Create unit tests for the new store methods
3. Update story status to reflect partial completion
