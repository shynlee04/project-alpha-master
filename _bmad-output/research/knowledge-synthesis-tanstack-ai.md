# TanStack AI SDK Knowledge Synthesis

**Date:** 2025-12-24  
**Source:** Context7 MCP (tanstack/ai, websites/tanstack_ai)  
**Purpose:** Correct implementation patterns for Via-Gent AI coding agent

---

## Critical Patterns (FROM OFFICIAL DOCS)

### 1. Tool Definition with Approval Flow

```typescript
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

// Define tool with approval requirement
const writeFileDef = toolDefinition({
  name: "write_file",
  description: "Write content to a file",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    path: z.string(),
  }),
  needsApproval: true, // KEY: This triggers approval flow
});

// Server implementation (only executes AFTER approval)
const writeFile = writeFileDef.server(async ({ path, content }) => {
  await fs.writeFile(path, content);
  return { success: true, path };
});

// Client implementation (for client-side tools)
const clientTool = toolDef.client((input) => {
  // Execute on client
  return result;
});
```

### 2. Server-Side API Route

```typescript
import { chat, toStreamResponse } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";

export async function POST(request: Request) {
  const { messages, apiKey } = await request.json();

  const stream = chat({
    adapter: openaiText("gpt-4o", { apiKey }), // Pass API key to adapter
    messages,
    tools: [writeFile, readFile, executeCommand],
  });

  return toStreamResponse(stream); // SSE response
}
```

### 3. Client-Side Hook Usage

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

const { 
  messages, 
  sendMessage, 
  isLoading,
  addToolApprovalResponse // KEY: For approval flow
} = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  onChunk: (chunk) => console.log("Received:", chunk),
  onFinish: (message) => console.log("Complete:", message),
});

// Handle approval
const handleApprove = (toolCallId: string) => {
  addToolApprovalResponse(toolCallId, { approved: true });
};

const handleReject = (toolCallId: string, reason: string) => {
  addToolApprovalResponse(toolCallId, { approved: false, reason });
};
```

---

## GAPS IN CURRENT IMPLEMENTATION

### ⚠️ CRITICAL UPDATE: Hook is Already Correct!

**After code review of `use-agent-chat-with-tools.ts` (377 lines):**

The hook implementation is **well-structured** and aligns with TanStack AI patterns:

| Feature | Status | Line |
|---------|--------|------|
| `fetchServerSentEvents` | ✅ Correct | 14, 192 |
| `addToolApprovalResponse` | ✅ Correct | 225, 264, 278 |
| `pendingApprovals` extraction | ✅ Correct | 292-358 |
| `createChatClientOptions` | ✅ Correct | 209 |
| `apiKey` in body | ✅ Correct | 196-199 |

**The issue is NOT the hook - it's the WIRING.**

**Hypothesis:** `AgentChatPanel.tsx` is NOT using `useAgentChatWithTools` hook - it's using a mock setTimeout.

### Gap 1: AgentChatPanel Wiring (SUSPECTED)

**Current (WRONG):**
```typescript
// Hallucinated implementation
const tools = {
  read_file: { fn: readFile },
  write_file: { fn: writeFile },
};
```

**Correct:**
```typescript
const readFileDef = toolDefinition({
  name: "read_file",
  inputSchema: z.object({ path: z.string() }),
  outputSchema: z.object({ content: z.string() }),
});
const readFile = readFileDef.server(async ({ path }) => {...});
```

### Gap 2: Approval Flow

**Current (WRONG):**
```typescript
// Mock trigger button
<button onClick={() => setPendingApproval(mockApproval)}>
```

**Correct:**
```typescript
// Real approval from hook
const { addToolApprovalResponse } = useChat({...});
// When AI calls tool with needsApproval:true, it pauses
// UI shows approval overlay
// User clicks approve -> addToolApprovalResponse(id, { approved: true })
```

### Gap 3: SSE Connection

**Current (WRONG):**
```typescript
// Direct fetch without SSE adapter
const response = await fetch('/api/chat', {...});
```

**Correct:**
```typescript
const { messages } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
});
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Refactor `src/lib/agent/tools/*.ts` to use `toolDefinition().server()`
- [ ] Add `needsApproval: true` to sensitive tools (write_file, execute_command)
- [ ] Use `fetchServerSentEvents()` in `use-agent-chat-with-tools.ts`
- [ ] Wire `addToolApprovalResponse` to `ApprovalOverlay`
- [ ] Update `/api/chat.ts` to use proper adapter pattern

---

## References

- TanStack AI Tool Approval: https://tanstack.com/ai/latest/docs/guides/tool-approval
- TanStack AI Streaming: https://tanstack.com/ai/latest/docs/guides/streaming
- TanStack AI Tool Architecture: https://tanstack.com/ai/latest/docs/guides/tool-architecture
