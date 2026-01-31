# MM-03: Unify Tool Execution Across Chat Systems

**Document ID**: MM-03
**Epic**: EPIC-40 (Multimodal Chat Unification)
**Track**: A (Chat Unification)
**Status**: READY_FOR_IMPLEMENTATION
**Priority**: P0 (Critical)
**Effort**: 5 hours
**Dependencies**: MM-02 ✅ (Complete)

**Created**: 2026-01-10T01:15:00+07:00
**Validated At**: 2026-01-10T01:15:00+07:00

---

## Story Summary

Ensure tool execution state is unified across all chat systems and properly persisted via the unified chat store.

**Key Insight**: There are two layers for tool execution:
1. **Agent Layer** (`use-agent-chat-with-tools.ts`): Manages real-time chat with AI provider
2. **Persistence Layer** (`tool-execution-slice.ts`): Stores tool calls and approvals

**Goal**: Ensure agent layer properly persists tool execution state to unified store.

---

## Current State (Post MM-02)

### What MM-02 Delivered
- Unified thread management with single source of truth
- `useActiveThread()` returns thread directly for backward compatibility
- Consumer components working correctly

### Tool Execution State
1. **Persistence Layer** ✅ (Created in MM-01)
   - `tool-execution-slice.ts` (198 lines) with full CRUD operations
   - `createToolCall`, `updateToolCall`, `getToolCallsByMessage`
   - `addPendingApproval`, `approveToolCall`, `denyToolCall`
   - `getPendingApprovals`, `clearPendingApprovals`

2. **Agent Layer** ⚠️ (Needs Verification)
   - `use-agent-chat-with-tools.ts` - Main agent chat hook
   - `useAgentChatApproval.ts` - UI approval hook
   - May not be persisting to unified store

---

## Implementation Tasks

### Task 1: Verify Tool Execution Persistence Integration
**File**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

1. Check how tool calls are currently tracked
2. Verify if they're persisted to unified chat store
3. Add persistence calls if missing

**Key Question**: When a tool call completes, is it persisted via `createToolCall`?

### Task 2: Verify Approval Flow Integration
**Files**: `src/presentation/components/ide/hooks/useAgentChatApproval.ts`

1. Check if `approveToolCall`/`denyToolCall` use unified store methods
2. Verify approval state persistence
3. Ensure UI state matches persisted state

### Task 3: Update Facade Exports (if needed)
**File**: `src/infrastructure/persistence/stores/conversation/useConversationStore.ts`

1. Export tool execution methods from unified store
2. Map between domain types and legacy types
3. Ensure `usePendingApprovals` hook works correctly

---

## Acceptance Criteria

- [ ] Tool calls are persisted via unified chat store
- [ ] Approvals are tracked in `pendingApprovals` state
- [ ] Approval history is maintained in `approvalHistory`
- [ ] `usePendingApprovals()` hook returns current approvals
- [ ] Agent layer integrates with persistence layer
- [ ] TypeScript: Zero new errors
- [ ] Manual test: Execute tool call, verify persistence

---

## Files to Review/Modify

### Primary (Review Only)
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts` - Agent layer
- `src/presentation/components/ide/hooks/useAgentChatApproval.ts` - UI layer

### Secondary (Modify if needed)
- `src/infrastructure/persistence/stores/conversation/useConversationStore.ts` - Facade exports

### Testing
- Create a tool call via agent chat
- Verify it appears in `toolCalls` state
- Verify approval flow works end-to-end

---

## Dependencies

### Completed
- ✅ MM-01: Tool execution slice created
- ✅ MM-02: Thread management unified

### Unblocks
- MM-05 (Voice Input) - Needs tool execution for voice commands
- MM-06 (Voice Output) - Needs tool execution for voice responses

---

## Definition of Done

1. Tool execution state properly persisted
2. Approval flow works end-to-end
3. `usePendingApprovals` hook functional
4. Backward compatibility maintained
5. TypeScript compilation succeeds
6. Manual testing: Tool call → approve → persist

---

## Notes

- **Architecture**: Agent layer (real-time) ↔ Persistence layer (durable)
- **No duplicate state**: Tool calls should only be in unified store
- **Slice limit**: `tool-execution-slice.ts` already ≤200 lines

---

**Story Version**: 1.0.0
**Status**: READY_FOR_IMPLEMENTATION
**Next**: Verify integration and add persistence calls if missing
