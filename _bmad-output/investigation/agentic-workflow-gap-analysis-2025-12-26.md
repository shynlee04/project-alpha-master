# Agentic Workflow Gap Analysis

**Date**: 2025-12-26  
**Analysis ID**: AWG-2025-12-26-001  
**Reference**: Roo Code patterns, industry best practices

---

## 1. Current Implementation State

### 1.1 Agent Architecture

```
UI Components (AgentChatPanel, AgentConfigDialog)
         ↓
useAgentChat Hook (with tools)
         ↓
AgentFactory (creates adapters)
         ↓
ProviderAdapter (OpenRouter, Anthropic, etc.)
         ↓
TanStack AI (chat streaming)
         ↓
Agent Tools (FileTools, TerminalTools)
         ↓
Facades (abstract over WebContainer/LocalFS)
```

### 1.2 Implemented Components

| Component | Status | File |
|-----------|--------|------|
| Provider Adapter Factory | ✅ DONE | `provider-adapter.ts` |
| Model Registry | ✅ DONE | `model-registry.ts` |
| Credential Vault | ✅ DONE | `credential-vault.ts` |
| Agent File Tools | ✅ DONE | `src/lib/agent/tools/` |
| Agent Terminal Tools | ✅ DONE | `src/lib/agent/tools/` |
| File Facade | ✅ DONE | `src/lib/agent/facades/` |
| Terminal Facade | ✅ DONE | `src/lib/agent/facades/` |
| useAgentChatWithTools | ⚠️ PARTIAL | `use-agent-chat-with-tools.ts` |
| Approval Overlay | ⚠️ PARTIAL | `ApprovalOverlay.tsx` |
| Chat API (/api/chat) | ✅ DONE | `src/routes/api/chat.ts` |

---

## 2. Missing Components

### 2.1 Critical Gaps (P0)

| Gap | Description | Impact |
|-----|-------------|--------|
| **Tool Wiring** | `useAgentChatWithTools` not wired to TanStack AI tool execution | Tools defined but not callable |
| **Approval Workflow** | `ApprovalOverlay` partial, not integrated | No human-in-the-loop control |
| **Tool Call Manager** | Missing integration with TanStack AI `ToolCallManager` | Cannot execute tools from chat |

### 2.2 Important Gaps (P1)

| Gap | Description | Impact |
|-----|-------------|--------|
| Iteration Tracking | No UI for agent loop iterations | User cannot see agent progress |
| Context Management | No persistent context between sessions | Loss of conversation history |
| Tool Result Display | Missing rich tool result rendering | Cannot show file diffs, command output |
| Error Recovery | No retry/revert mechanism | Failures leave system in bad state |

### 2.3 Nice-to-Have Gaps (P2)

| Gap | Description |
|-----|-------------|
| MCP Protocol Support | No Model Context Protocol integration |
| Multi-Agent Orchestration | No subagent delegation pattern |
| Skills Registry | No reusable workflow modules |
| Audit Logging | No conversation replay capability |

---

## 3. Pattern Comparison

### 3.1 Current vs Industry Standard

| Aspect | Via-gent (Current) | Industry Standard (Roo Code/Cursor) |
|--------|-------------------|-------------------------------------|
| Tool Definition | Zod schemas + facade | MCP Protocol + OpenAI schema |
| Tool Execution | Manual `toolDefinition().client()` | `ToolCallManager` automatic |
| Approval UI | Partial `ApprovalOverlay` | Full diff preview + approve/reject |
| Iteration UI | Missing | Progress bar + cancel button |
| Context | In-memory only | Persistent + vector DB |
| Error Recovery | Missing | `/rewind` + checkpoint |

### 3.2 Key Pattern Differences

**Via-gent Pattern**:
```typescript
// Manual tool wiring
const tools = [
  readFileTool,
  writeFileTool,
  executeCommandTool
];
```

**Industry Standard Pattern**:
```typescript
// MCP Protocol + ToolCallManager
const client = createChatClient({
  tools: mcpTools,  // MCP-discovered tools
  maxIterations: 10,
  onToolCall: (tool) => approvalUI.show(tool)
});
```

---

## 4. Workflow Gaps

### 4.1 Complete User Journey (Industry)

```
1. User types prompt
2. Agent analyzes request
3. Agent identifies needed tools
4. Agent presents plan (optional)
5. Tool calls require approval (if destructive)
6. User approves/rejects
7. Tool executes
8. Results displayed (with diffs)
9. Agent continues with new context
10. User can pause/cancel/rewind
11. Final result delivered
12. Context persisted for future sessions
```

### 4.2 Current Via-gent Journey

```
1. User types prompt
2. Agent analyzes request
3. [MISSING] Tool calls not integrated
4. [MISSING] No approval workflow
5. [MISSING] No iteration UI
6. [MISSING] No context persistence
```

---

## 5. Remediation Priorities

### 5.1 Immediate (MVP-3/4)

1. **Wire tools to `useAgentChatWithTools`**
   - Integrate `ToolCallManager` from TanStack AI
   - Connect `toolDefinition().client()` implementations

2. **Complete approval workflow**
   - Wire `ApprovalOverlay` to tool execution
   - Add diff preview before approval

### 5.2 Short-term (MVP-5/6)

3. **Add iteration tracking UI**
   - Progress indicator during tool execution
   - Cancel button for long-running operations

4. **Tool result display**
   - Rich rendering of file diffs
   - Terminal output display
   - Error message formatting

### 5.3 Medium-term (Post-MVP)

5. **Context persistence**
   - Persist conversation history to IndexedDB
   - Load context on session resume

6. **MCP protocol support**
   - Implement MCP client for tool discovery
   - Enable third-party tool integration

---

## 6. Technical Recommendations

### 6.1 Tool Integration Pattern

```typescript
// Recommended pattern for TanStack AI
import { createToolCallManager, toolDefinition } from '@tanstack/ai';

const toolCallManager = createToolCallManager({
  maxIterations: 10,
  onToolCall: async (tool) => {
    const approved = await approvalWorkflow.request(tool);
    return approved;
  }
});

const readFileTool = toolDefinition({
  name: 'readFile',
  inputSchema: z.object({ path: z.string() })
}).client(async ({ input }) => {
  return toolCallManager.execute('readFile', input);
});
```

### 6.2 Approval Workflow Pattern

```typescript
interface ToolApprovalRequest {
  toolName: string;
  input: Record<string, unknown>;
  preview?: {
    type: 'diff' | 'terminal' | 'file';
    content: string;
  };
}

async function requestApproval(request: ToolApprovalRequest): Promise<boolean> {
  const overlay = document.getElementById('approval-overlay');
  overlay.show(request);
  return overlay.waitForDecision();
}
```

---

## 7. Conclusion

**Current State**: Core infrastructure exists (providers, tools, facades) but tool execution is not wired to the chat system.

**Gap Severity**: Critical - Without tool wiring, the agent cannot perform file operations or terminal commands, blocking MVP-3/4 completion.

**Recommended Action**: Prioritize `useAgentChatWithTools` completion before proceeding with other MVP stories.

---

**Related**:
- [`tech-stack-knowledge-synthesis-2025-12-26.md`](tech-stack-knowledge-synthesis-2025-12-26.md)
- [`mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
