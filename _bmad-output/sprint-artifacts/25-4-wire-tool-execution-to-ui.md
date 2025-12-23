# Story 25-4: Wire Tool Execution to UI

**Epic:** 25 - AI Foundation Sprint  
**Story:** 25-4 - Wire Tool Execution to UI  
**Priority:** P0  
**Points:** 5  
**Platform:** Platform A

---

## User Story

**As a** developer using Via-gent IDE  
**I want** AI agents to execute file and terminal operations through their tools  
**So that** I can use conversational AI to modify my codebase

---

## Acceptance Criteria

### AC-25-4-1: Tool Factory with Dependency Injection
**Given** a workspace with WebContainer and LocalFSAdapter available  
**When** the `createAgentToolFactory()` is called  
**Then** it returns configured file and terminal tools with correct dependencies

### AC-25-4-2: Client-Side Tool Execution
**Given** tools configured with `toolDefinition.client()` pattern  
**When** the LLM requests a tool call  
**Then** the tool executes on the client with access to workspace context

### AC-25-4-3: Enhanced useAgentChat Hook
**Given** the `useAgentChatWithTools` hook is used  
**When** a tool executes  
**Then** the hook exposes `toolCalls` state for UI rendering

### AC-25-4-4: Event Bus Integration
**Given** a tool executes successfully  
**When** the operation completes  
**Then** events are emitted to the WorkspaceEventEmitter (`file:modified`, `process:started`, etc.)

### AC-25-4-5: Unit Tests
**Given** the story implementation  
**When** running `pnpm test -- agent`  
**Then** at least 8 new tests pass for factory and hook

---

## Tasks

### T1: Create Tool Factory
- [ ] Create `src/lib/agent/factory.ts`
- [ ] Define `ToolFactoryOptions` interface
- [ ] Implement `createAgentToolFactory()` function
- [ ] Export from `src/lib/agent/index.ts`

### T2: Wire Client Tools to useAgentChat
- [ ] Modify `use-agent-chat.ts` to accept tools option
- [ ] Use TanStack AI `useChat` with client tools pattern
- [ ] Handle tool execution results in hook state

### T3: Create Enhanced Hook with Tool State
- [ ] Create `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- [ ] Add `toolCalls: ToolCallInfo[]` to return type
- [ ] Add `approveToolCall(id)` and `rejectToolCall(id)` functions
- [ ] Wire to event bus for emissions

### T4: Update API Chat Route (Optional Server Hints)
- [ ] Add tool definitions to `/api/chat.ts` for LLM context
- [ ] Note: Execution happens client-side per Option A

### T5: Write Unit Tests
- [ ] `src/lib/agent/__tests__/factory.test.ts` (5 tests)
- [ ] Update `hooks/__tests__/use-agent-chat.test.ts` (3 tests)
- [ ] Run `pnpm test -- agent` to verify

### T6: Update Governance Files
- [ ] Update sprint-status.yaml (25-4: ready-for-dev → in-progress → review)
- [ ] Update bmm-workflow-status.yaml

---

## Dev Notes

### Architecture Pattern (Option A - Client Tools)

```typescript
// Tool definition with client execution
const readFileTool = readFileDef.client(async ({ path }) => {
    const facade = getFileToolsFacade();
    return { content: await facade.readFile(path) };
});

// useChat with client tools
const { messages, toolCalls } = useChat({
    connection: fetchServerSentEvents('/api/chat'),
    tools: [readFileTool, writeFileTool, listFilesTool],
});
```

### Dependencies
- Story 12-1, 12-1B, 12-2: ✅ Facades complete
- Story 25-1, 25-2, 25-3: ✅ API + Tool definitions complete
- WorkspaceContext: Provides WebContainer, LocalFSAdapter

### Integration Points
- `src/lib/workspace/WorkspaceContext.tsx` - Get workspace handles
- `src/lib/events/workspace-events.ts` - Event emission
- `src/lib/agent/facades/` - File and terminal facades

---

## Dev Agent Record

**Agent:** Platform A (Antigravity)  
**Session:** 2025-12-23T21:49:00+07:00

### Task Progress:
<!-- Updated during implementation -->

### Files Changed:
<!-- Updated during implementation -->

### Tests Created:
<!-- Updated during implementation -->

### Decisions Made:
- Using Option A (client-only tools) per user approval
- TanStack AI `toolDefinition.client()` pattern for browser-local operations

---

## Status History

| Timestamp | Status | Actor | Notes |
|-----------|--------|-------|-------|
| 2025-12-23T21:45 | drafted | SM | Plan created, awaiting approval |
| 2025-12-23T21:49 | ready-for-dev | SM | User approved Option A |
