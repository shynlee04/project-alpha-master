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

## ⚠️ COURSE CORRECTION (2025-12-24)

**Previous Status**: Marked "done" but `getTools()` returns empty array  
**Finding**: Story marked done without actual tool wiring implementation  
**Required Fix**: Complete the TODO in `chat.ts:106-116`

---

## Acceptance Criteria

### AC-25-4-1: Chat API Returns Actual Tools
**Given** the chat API endpoint `/api/chat`  
**When** a POST request is made  
**Then** `getTools()` returns an array with at least 4 tools (readFile, writeFile, listFiles, executeCommand)

### AC-25-4-2: Client-Side Tool Execution with Facades
**Given** tools configured with `toolDefinition.client()` pattern  
**When** the LLM requests a tool call  
**Then** the tool executes client-side using the workspace facade

### AC-25-4-3: useAgentChatWithTools Provides Facades
**Given** the `useAgentChatWithTools` hook is used  
**When** workspace context provides LocalFS and SyncManager  
**Then** facades are created and passed to client tools

### AC-25-4-4: Event Bus Integration
**Given** a tool executes successfully  
**When** the operation completes  
**Then** events are emitted (`file:modified`, `file:created`, etc.) with `source: 'agent'`

### AC-25-4-5: Unit Tests
**Given** the story implementation  
**When** running `pnpm test -- tools`  
**Then** at least 8 tests pass for tool wiring

---

## Tasks

### T1: Create Client Tool Implementations ✅ COMPLETED (needs revision)
- [x] `read-file-tool.ts` - Uses `.server()` but needs `.client()`
- [x] `write-file-tool.ts` - Same issue
- [x] `list-files-tool.ts` - Same issue
- [x] `execute-command-tool.ts` - Same issue

### T2: Add Client Tool Factory Functions 🔴 NOT DONE
- [ ] Add `createReadFileClientTool(getTools)` to `read-file-tool.ts`
- [ ] Add `createWriteFileClientTool(getTools)` to `write-file-tool.ts`
- [ ] Add `createListFilesClientTool(getTools)` to `list-files-tool.ts`
- [ ] Add `createExecuteCommandClientTool(getTools)` to `execute-command-tool.ts`
- [ ] Export from `tools/index.ts`

### T3: Wire Tools in Chat API 🔴 NOT DONE
- [ ] Import `clientTools` from `@tanstack/ai`
- [ ] Create `getFileToolsFacade()` and `getTerminalToolsFacade()` functions
- [ ] Wire to WorkspaceContext handles (LocalFS, SyncManager, WebContainer)
- [ ] Update `getTools()` to return actual tool array

### T4: Update useAgentChatWithTools Hook 🔴 NOT DONE  
- [ ] Accept workspace handles as props
- [ ] Create facades on first render
- [ ] Pass client tools to useChat options
- [ ] Verify tool execution emits events

### T5: Add Integration Tests 🔴 NOT DONE
- [ ] Test `getTools()` returns 4+ tools
- [ ] Test tool factory with mock facades
- [ ] Test event emission on tool execution
- [ ] Run `pnpm test -- tools` to verify

### T6: Update Governance Files 🔴 NOT DONE
- [ ] Update sprint-status.yaml (25-4: done → in-progress → review → done)
- [ ] Update bmm-workflow-status.yaml

---

## Dev Notes

### Architecture Pattern (Client Tools)

Per TanStack AI documentation, client tools execute in the browser:

```typescript
import { toolDefinition, clientTools } from '@tanstack/ai';

// Define tool with output schema
const readFileDef = toolDefinition({
    name: 'read_file',
    description: 'Read file content',
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({
        success: z.boolean(),
        content: z.string().optional(),
        error: z.string().optional(),
    }),
});

// Create client implementation
function createReadFileClientTool(getTools: () => AgentFileTools) {
    return readFileDef.client(async ({ path }) => {
        const facade = getTools();
        const content = await facade.readFile(path);
        return content !== null 
            ? { success: true, content }
            : { success: false, error: `File not found: ${path}` };
    });
}

// In chat.ts - Wire with actual facades
function getTools() {
    const readFile = createReadFileClientTool(() => fileToolsFacade);
    const writeFile = createWriteFileClientTool(() => fileToolsFacade);
    const listFiles = createListFilesClientTool(() => fileToolsFacade);
    const executeCommand = createExecuteCommandClientTool(() => terminalToolsFacade);
    
    return clientTools(readFile, writeFile, listFiles, executeCommand);
}
```

### Dependencies
- Story 12-1, 12-1B, 12-2: ✅ Facades complete  
- Story 25-1, 25-2, 25-3: ✅ API + Tool definitions complete
- WorkspaceContext: Provides WebContainer, LocalFSAdapter, SyncManager

### Critical Files to Modify
1. `src/lib/agent/tools/read-file-tool.ts` - Add `.client()` export
2. `src/lib/agent/tools/write-file-tool.ts` - Add `.client()` export
3. `src/lib/agent/tools/list-files-tool.ts` - Add `.client()` export
4. `src/lib/agent/tools/execute-command-tool.ts` - Add `.client()` export
5. `src/lib/agent/tools/index.ts` - Update factory functions
6. `src/routes/api/chat.ts` - Wire actual tools in `getTools()`

---

## Dev Agent Record

**Agent:** Platform A (Antigravity)  
**Session:** 2025-12-24T03:10:00+07:00

### Task Progress:
<!-- Updated during implementation -->

### Files Changed:
<!-- Updated during implementation -->

### Tests Created:
<!-- Updated during implementation -->

### Decisions Made:
- Using TanStack AI `toolDefinition.client()` pattern for browser execution
- Tools execute on client-side using workspace facades
- All file tools share the same FileToolsFacade instance
- All terminal tools share the same TerminalToolsFacade instance

---

## Research Notes

### Context7 Query: TanStack AI client tools pattern
```typescript
// Per official docs - client tools use .client() method
const tool = toolDefinition({...}).client(async (input) => {
    // Executes in browser
    return result;
});

// Use clientTools() to create typed array
const tools = clientTools(readFile, writeFile, listFiles);
```

### Key Insight
The existing code uses `.server()` pattern which requires server-side execution. For browser-based IDE with WebContainers, we need `.client()` pattern that executes in the browser with access to LocalFS/WebContainer.

---

## Status History

| Timestamp | Status | Actor | Notes |
|-----------|--------|-------|-------|
| 2025-12-23T21:45 | drafted | SM | Plan created |
| 2025-12-23T21:49 | ready-for-dev | SM | User approved Option A |
| 2025-12-23T22:00 | in-progress | Dev | Started implementation |
| 2025-12-23T22:40 | done | Dev | ⚠️ PREMATURE - only API structure, no wiring |
| 2025-12-24T03:10 | in-progress | SM | **COURSE CORRECTION** - T2-T6 not complete |
