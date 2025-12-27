# Story 12-5: Wire Facades to TanStack AI Tools

## Story Header

- **Epic:** 12 - Tool Interface Layer
- **Story ID:** 12-5
- **Title:** Wire Facades to TanStack AI Tools
- **Points:** 5
- **Priority:** P0
- **Platform:** Platform A
- **Created:** 2025-12-24T05:21:00+07:00
- **Status:** done

## User Story

**As a** developer using the AI agent chat interface,  
**I want** the tool definitions to be connected to the facade implementations,  
**So that** when the LLM calls a tool, it executes real file/terminal operations locally.

## Acceptance Criteria

### AC-12-5-1: Client Tools Return Real Tool Array
**Given** the `createAgentClientTools()` function is called with facade providers  
**When** `getClientTools()` is invoked  
**Then** it returns a TanStack AI `clientTools()` array with 4 tools (readFile, writeFile, listFiles, executeCommand)

### AC-12-5-2: Tools Execute Facade Methods
**Given** a tool is called by the LLM  
**When** the tool executes in the browser  
**Then** it calls the corresponding facade method (e.g., `fileTools.readFile()`)

### AC-12-5-3: Tools Emit Events
**Given** a write or execute tool is called  
**When** the operation completes  
**Then** the tool emits the appropriate EventBus event (file:modified, process:exited)

### AC-12-5-4: Chat Hook Uses Client Tools
**Given** `useAgentChatWithTools` is called with facade providers  
**When** the hook initializes  
**Then** `createChatClientOptions({ tools: agentTools.getClientTools() })` is used

### AC-12-5-5: Tools Handle Null Facades Gracefully
**Given** facades are null (workspace not loaded)  
**When** a tool is called  
**Then** it returns `{ success: false, error: 'Tools not available' }`

## Tasks

### Implementation Tasks (Completed)
- [x] T1: Create `createClientFileTools()` in factory.ts
- [x] T2: Create `createClientTerminalTools()` in factory.ts
- [x] T3: Create `createAgentClientTools()` wrapper with `getClientTools()` method
- [x] T4: Wire tools into `useAgentChatWithTools` via `createChatClientOptions`
- [x] T5: Implement event emission in write_file and execute_command tools
- [x] T6: Handle null facade gracefully in all tools

### Test Tasks (Completed)
- [x] T7: Unit tests for factory functions (existing in tools/__tests__/)
- [x] T8: Integration tests for useAgentChatWithTools hook

### Governance Tasks (This Session)
- [x] T9: Create story file
- [x] T10: Create context XML
- [x] T11: Update sprint-status.yaml

## Dev Notes

### Key Files
- `src/lib/agent/factory.ts` - Tool factory with `createAgentClientTools()`
- `src/lib/agent/hooks/use-agent-chat-with-tools.ts` - Hook using the tools
- `src/lib/agent/tools/*.ts` - Individual tool definitions

### Pattern Used
```typescript
// factory.ts
export function createAgentClientTools(options: ToolFactoryOptions) {
    const fileTools = createClientFileTools(options);
    const terminalTools = createClientTerminalTools(options);
    
    return {
        getClientTools() {
            return clientTools(
                fileTools.readFile,
                fileTools.writeFile,
                fileTools.listFiles,
                terminalTools.executeCommand
            );
        },
    };
}

// use-agent-chat-with-tools.ts
const agentTools = useMemo(() => {
    if (!toolsAvailable) return null;
    return createAgentClientTools(toolFactoryOptions);
}, [toolsAvailable, toolFactoryOptions]);

const chatOptions = useMemo(() => {
    if (agentTools) {
        return createChatClientOptions({
            connection,
            tools: agentTools.getClientTools(),
        });
    }
    return { connection };
}, [connection, agentTools]);
```

## References

- [factory.ts](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/lib/agent/factory.ts)
- [use-agent-chat-with-tools.ts](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- [TanStack AI Client Tools Docs](https://tanstack.com/ai/latest/docs/guides/client-tools)

## Dev Agent Record

**Agent:** Platform A (Antigravity - Gemini 2.5 Pro)  
**Implementation Date:** 2025-12-24 (as part of Story 25-4)  
**Artifact Creation:** 2025-12-24T05:21:00+07:00

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| `src/lib/agent/factory.ts` | Created | 229 |
| `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Created | 359 |
| `src/lib/agent/tools/read-file-tool.ts` | Modified | +46 (client) |
| `src/lib/agent/tools/write-file-tool.ts` | Modified | +30 (client) |
| `src/lib/agent/tools/list-files-tool.ts` | Modified | +30 (client) |
| `src/lib/agent/tools/execute-command-tool.ts` | Modified | +50 (client) |
| `src/lib/agent/tools/index.ts` | Modified | +40 (exports) |

### Tests
- 48 tests passing in agent tools + hooks

## Status History

| Date | Status | Agent | Notes |
|------|--------|-------|-------|
| 2025-12-24T03:30:00 | implementation-complete | Dev (Platform A) | Implemented with Story 25-4 |
| 2025-12-24T05:21:00 | done | SM (Platform A) | Story artifacts created, verified |
