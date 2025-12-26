# Tech Stack Knowledge Synthesis

**Date**: 2025-12-26  
**Research ID**: TSK-2025-12-26-001  
**MCP Tools Used**: Context7, Deepwiki, Tavily

---

## 1. TanStack AI Integration

### 1.1 Client-Side Tool Execution Pattern

From Context7 documentation and Deepwiki analysis:

```typescript
// Define tool with Zod schema
const readFileTool = toolDefinition({
  name: 'readFile',
  description: 'Read file contents from the filesystem',
  inputSchema: z.object({
    path: z.string(),
    encoding: z.enum(['utf-8', 'base64']).default('utf-8')
  })
}).client(async ({ input }) => {
  // Client-side implementation
  const result = await agentFileTools.read(input.path, input.encoding);
  return result;
});
```

**Key Components**:
- `toolDefinition()` - Define tool metadata and Zod schema
- `.client()` - Create browser-side implementation
- `ToolCallManager` - Executes accumulated tool calls
- `clientTools()` - Helper to create typed array of tools

### 1.2 Streaming Pattern

**Server Side**:
```typescript
// src/routes/api/chat.ts
import { toServerSentEventsResponse } from '@tanstack/ai';

export async function POST({ request }) {
  const chat = createChat();
  const stream = chat(request);
  return toServerSentEventsResponse(stream);
}
```

**Client Side**:
```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

const { messages, sendMessage } = useChat({
  api: '/api/chat',
  fetchAdapter: fetchServerSentEvents()
});
```

### 1.3 Tool Execution Lifecycle States

| State | Description |
|-------|-------------|
| `awaiting-input` | Tool called, waiting for user input |
| `input-streaming` | User providing input |
| `input-complete` | Input received |
| `output-available` | Tool result ready |
| `output-error` | Tool execution failed |

---

## 2. WebContainer Patterns

### 2.1 File Operations

```typescript
// Current implementation pattern
const webcontainer = await webcontainerManager.getInstance();

// Write file to WebContainer
await webcontainer.fs.writeFile(path, content);

// Execute command
const process = await webcontainer.spawn('npm', ['install']);
```

### 2.2 Terminal Integration

```typescript
// xterm.js + WebContainer shell
const terminal = new Terminal({ convertEol: true });
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);

const shellProcess = await webcontainer.spawn('jsh', {
  terminal: { cols: terminal.cols, rows: terminal.rows }
});
```

---

## 3. 2025 Best Practices (Tavily Research)

### 3.1 Agentic Coding Platforms

| Platform | Key Features |
|----------|--------------|
| **GitHub Copilot Agent** | Multi-file editing, context awareness |
| **Cursor** | Composer agent, DiffEdit, ChatGPT-4o |
| **Cline** (open-source) | MCP support, file system access |
| **Devin** | Full PR creation, CI/CD integration |
| **QodoAI** | Test generation, code review |

### 3.2 MCP (Model Context Protocol)

- **Fastest adopted standard** in 2025 (Docker-like adoption)
- Enables standardized tool discovery and execution
- Critical for multi-agent interoperability

### 3.3 Multi-Agent Patterns

```
Primary Agent (Orchestrator)
    ├── Subagent A (File Operations)
    ├── Subagent B (Terminal Commands)
    └── Subagent C (Code Review)

Stateless subagents for predictable behavior
Shared context via vector database or file system
```

### 3.4 Enterprise Requirements

- **Human-in-the-loop controls** - Approval workflows
- **Audit logging** - Full conversation replay
- **Rollback/Checkpoint** - Claude Code's `/rewind` pattern
- **Skills** - Reusable, version-controlled workflows

---

## 4. OWASP LLM Top 10 2025

| # | Vulnerability | Mitigation |
|---|---------------|------------|
| LLM01 | Prompt Injection | Input sanitization, context isolation |
| LLM02 | Sensitive Info Disclosure | Output filtering, PII detection |
| LLM03 | Supply Chain | Verify provider, dependency auditing |
| LLM04 | Data Poisoning | Training data validation |
| LLM05 | Improper Output Handling | Schema validation, type checking |
| **LLM06** | **Excessive Agency** | **Tool approval, rate limiting** |
| LLM07 | System Prompt Leakage | Prompt hardening |
| LLM08 | Vector/Embedding Weaknesses | Embedding validation |
| LLM09 | Misinformation | Fact-checking, confidence scores |
| LLM10 | Unbounded Consumption | Token limits, quotas |

**Critical for Via-gent**: LLM06 (Excessive Agency) - Agent tools must have approval workflows

---

## 5. Missing Implementation

| Gap | Status | File |
|-----|--------|------|
| Client-side tool wiring | ⚠️ INCOMPLETE | `use-agent-chat-with-tools.ts` |
| Approval workflow UI | ❌ NOT_STARTED | `ApprovalOverlay.tsx` (partial) |
| Tool execution state | ❌ NOT_STARTED | Missing `ToolCallManager` integration |
| MCP protocol support | ❌ NOT_STARTED | Roadmap item |

---

## 6. Recommendations

1. **Immediate**: Wire client-side tools to `useAgentChatWithTools`
2. **High**: Implement approval workflow before tool execution
3. **Medium**: Add MCP protocol support for extensibility
4. **Low**: Implement audit logging for enterprise compliance

---

**References**:
- [TanStack AI Docs](https://tanstack.com/ai)
- [WebContainer API](https://developer.stackblitz.com/platform/api/webcontainer-api)
- [OWASP LLM Top 10 2025](https://owasp.org/www-project-top-10-for-llm-applications/)
