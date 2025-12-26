# Tool Wiring Specification - P0 Critical Path

**Date**: 2025-12-26
**Priority**: P0 - IMMEDIATE
**Blocks**: [MVP-3](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md#mvp-3-tool-execution---file-operations)
**Status**: Needs Implementation

## Executive Summary

Agent tools are **defined but not wired** to [`useAgentChatWithTools`](src/lib/agent/hooks/use-agent-chat-with-tools.ts:153). This critical gap blocks MVP-3 (Tool Execution - File Operations). This spec provides the exact steps to wire 4 tools to the chat hook.

## Current State Analysis

### Tools Defined (✓ Complete)
| Tool | File | Status |
|------|------|--------|
| `read_file` | [`src/lib/agent/tools/read-file-tool.ts`](src/lib/agent/tools/read-file-tool.ts) | Defined |
| `write_file` | [`src/lib/agent/tools/write-file-tool.ts`](src/lib/agent/tools/write-file-tool.ts) | Defined |
| `list_files` | [`src/lib/agent/tools/list-files-tool.ts`](src/lib/agent/tools/list-files-tool.ts) | Defined |
| `execute_command` | [`src/lib/agent/tools/execute-command-tool.ts`](src/lib/agent/tools/execute-command-tool.ts) | Defined |

### Hook Interface (✓ Complete)
```typescript
// src/lib/agent/hooks/use-agent-chat-with-tools.ts:24-48
export interface UseAgentChatWithToolsOptions {
    fileTools?: AgentFileTools | null;      // ← NOT WIRED
    terminalTools?: AgentTerminalTools | null; // ← NOT WIRED
    eventBus?: WorkspaceEventEmitter | null;   // ← NOT WIRED
}
```

### Factory Function (✓ Complete)
[`createAgentClientTools`](src/lib/agent/factory.ts) exists and creates typed client tools from facades.

## Wiring Specification

### Step 1: Wire File Tools Facade
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:164)

```typescript
// Around line 164 - useIDEFileHandlers hook call
const { handleFileSelect, handleSave, handleContentChange, handleTabClose } = useIDEFileHandlers({
    // ... existing params
});

// ADD: Create file tools facade
const fileTools = useMemo(() => {
    if (!localAdapterRef.current || !syncManagerRef.current) return null;
    return createFileToolsFacade(localAdapterRef.current, syncManagerRef.current, eventBus);
}, [localAdapterRef.current, syncManagerRef.current, eventBus]);
```

### Step 2: Wire Terminal Tools Facade
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:164)

```typescript
// After fileTools creation
const terminalTools = useMemo(() => {
    if (!syncManagerRef.current) return null;
    return createTerminalToolsFacade(syncManagerRef.current);
}, [syncManagerRef.current]);
```

### Step 3: Pass Tools to ChatPanelWrapper
**File**: [`src/components/layout/IDELayout.tsx`](src/components/layout/IDELayout.tsx:391)

```typescript
// Line 391 - ChatPanelWrapper usage
<ChatPanelWrapper 
    projectId={projectId} 
    projectName={projectMetadata?.name ?? projectId ?? 'Project'} 
    onClose={() => setChatVisible(false)}
    // ADD:
    fileTools={fileTools}
    terminalTools={terminalTools}
    eventBus={eventBus}
/>
```

### Step 4: Wire in ChatPanelWrapper
**File**: [`src/components/ide/AgentChatPanel.tsx`](src/components/ide/AgentChatPanel.tsx) (or similar)

```typescript
// Use useAgentChatWithTools with tools
const {
    messages,
    sendMessage,
    toolCalls,
    toolsAvailable,
    pendingApprovals,
    approveToolCall,
    rejectToolCall,
} = useAgentChatWithTools({
    providerId: selectedProvider,
    modelId: selectedModel,
    apiKey: credentials[selectedProvider],
    fileTools,       // ← WIRED
    terminalTools,   // ← WIRED
    eventBus,        // ← WIRED
});
```

## Facade Integration

### File Tools Facade
**File**: [`src/lib/agent/facades/file-tools.ts`](src/lib/agent/facades/file-tools.ts)

```typescript
export function createFileToolsFacade(
    localAdapter: LocalFSAdapter,
    syncManager: SyncManager,
    eventBus?: WorkspaceEventEmitter
): AgentFileTools {
    return {
        readFile: async (path: string) => {
            // Already implemented - just needs exposure
        },
        writeFile: async (path: string, content: string) => {
            // Already implemented - just needs exposure
        },
        listFiles: async (path: string) => {
            // Already implemented - just needs exposure
        },
    };
}
```

### Terminal Tools Facade
**File**: [`src/lib/agent/facades/terminal-tools.ts`](src/lib/agent/facades/terminal-tools.ts)

```typescript
export function createTerminalToolsFacade(
    syncManager: SyncManager
): AgentTerminalTools {
    return {
        executeCommand: async (command: string, cwd?: string) => {
            // Already implemented - just needs exposure
        },
    };
}
```

## Testing Strategy

### Integration Test Flow
1. **Provider Setup**: User configures API key in [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx)
2. **Tool Availability**: `toolsAvailable` returns `true` when facades are present
3. **Tool Execution**: Agent calls tool → approval UI → execution → result
4. **UI Update**: Results reflected in chat and editor

### E2E Verification Steps
1. Configure OpenRouter provider with valid API key
2. Send message: "Read package.json"
3. Verify tool call appears in chat
4. Approve tool call
5. Verify file content displayed in chat
6. Verify no console errors

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Facade not initialized | Check `toolsAvailable` before execution |
| WebContainer not ready | Boot check before tool calls |
| File lock contention | Use [`FileLock`](src/lib/agent/facades/file-lock.ts) |
| Permission denied | Handle gracefully with user feedback |

## Success Criteria

- [ ] `toolsAvailable` returns `true` when facades are wired
- [ ] Agent can call `read_file`, `write_file`, `list_files`, `execute_command`
- [ ] Tool results appear in chat interface
- [ ] E2E verification passes (browser test)
- [ ] No console errors during tool execution

## References
- [Tool Definitions](src/lib/agent/tools/index.ts)
- [Hook Implementation](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- [MVP Sprint Plan](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- [State Management Audit](_bmad-output/state-management-audit-p1.10-2025-12-26.md)
