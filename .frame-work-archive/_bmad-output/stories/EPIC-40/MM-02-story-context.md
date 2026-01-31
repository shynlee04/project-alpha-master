# MM-02: Merge Thread Management Systems

**Document ID**: MM-02
**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: A (Chat Unification)
**Status**: READY_FOR_IMPLEMENTATION
**Priority**: P0 (Critical)
**Effort**: 3 hours
**Dependencies**: MM-01 ✅ (Complete)

**Created**: 2026-01-10T01:00:00+07:00
**Validated At**: 2026-01-10T01:00:00+07:00

---

## Story Summary

Merge the two thread management systems into a single unified implementation:
- **System A**: `useConversationStore` thread hierarchy (parent/child relationships)
- **System B**: Agent chat panel's internal thread state
- **Goal**: Single thread management with unified API

---

## Current State (Post MM-01)

### What MM-01 Delivered
- Unified chat store with `thread-management-slice.ts` (154 lines)
- Domain entities: `ChatThread` with hierarchy support
- Backward compatibility facade for legacy consumers

### Thread Management Gaps
1. **Duplicate thread CRUD** - Both systems have create/delete operations
2. **Hierarchy operations** - Some methods only in System A
3. **Thread selection** - Different active thread tracking
4. **Thread-by-conversation** - Different query patterns

---

## Implementation Tasks

### Task 1: Consolidate Thread CRUD Operations
**File**: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`

1. Review all thread methods from both systems
2. Identify duplicates and conflicts
3. Consolidate into single unified API
4. Update backward compatibility facade

**Methods to Unify**:
```typescript
// From System A (useConversationStore)
createThread(conversationId, parentThreadId)
deleteThread(threadId)
setActiveThread(threadId)
getThread(threadId)
getThreadsByConversation(conversationId)
getRootThread(conversationId)
getChildThreads(parentThreadId)
getThreadHierarchy(threadId)

// From System B (AgentChatPanel internal)
// Mostly duplicates of above - consolidate
```

### Task 2: Unify Thread Selection State
**File**: `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts`

1. Ensure `activeThreadId` is single source of truth
2. Remove any duplicate active thread state
3. Update consumers to use unified selection

### Task 3: Update Consumer Components
**Files**:
- `src/presentation/components/ide/AgentChatPanel.tsx`
- `src/presentation/components/chat/ThreadFolderTree.tsx` (if exists)

1. Replace dual thread calls with unified API
2. Remove internal thread state from AgentChatPanel
3. Use `useUnifiedChatStore` directly

---

## Acceptance Criteria

- [ ] Single thread CRUD implementation in `thread-management-slice.ts`
- [ ] No duplicate thread methods across codebase
- [ ] `activeThreadId` is sole source of truth
- [ ] AgentChatPanel delegates all thread operations to unified store
- [ ] Backward compatibility maintained via facade
- [ ] TypeScript: Zero new errors
- [ ] All thread hierarchy operations functional

---

## Files to Modify

### Primary
- `src/infrastructure/persistence/stores/chat/slices/thread-management-slice.ts` (consolidate methods)
- `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` (update if needed)

### Secondary
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` (facade updates)
- `src/presentation/components/ide/AgentChatPanel.tsx` (remove internal thread state)

### Testing
- Verify thread creation with parent/child relationships
- Verify thread deletion cascades correctly
- Verify active thread switching works

---

## Dependencies

### Completed
- ✅ MM-01: Unified chat store with thread-management-slice

### Unblocks
- MM-03: Unify tool execution (needs unified thread operations)

---

## Definition of Done

1. All thread CRUD operations consolidated
2. No duplicate thread state management
3. Consumer components updated
4. Backward compatibility facade passes all existing calls
5. TypeScript compilation succeeds (zero errors)
6. Manual testing: Create, delete, switch threads

---

## Notes

- **Non-breaking**: Use facade pattern to maintain compatibility
- **Slice limit**: Keep `thread-management-slice.ts` ≤ 200 lines
- **Performance**: Thread queries should use live indexes (not filter)

---

**Story Version**: 1.0.0
**Status**: READY_FOR_IMPLEMENTATION
**Next**: Start implementation via Step 06: dev-story
