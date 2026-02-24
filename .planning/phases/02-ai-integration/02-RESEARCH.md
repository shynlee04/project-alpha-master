# Phase 2: AI Integration - Research

**Researched:** 2026-02-01
**Domain:** Tool execution pipeline with approval workflow and multi-provider support
**Confidence:** HIGH

## Summary

Phase 2 implements the AI integration layer using TanStack AI SDK - a provider-agnostic, type-safe framework for AI-powered applications. The project already has TanStack AI packages installed (`@tanstack/ai`, `@tanstack/ai-gemini`, `@tanstack/ai-openai`, `@tanstack/ai-react`) and brownfield tool category definitions (31 tools across 13 categories).

TanStack AI provides:
1. **Isomorphic tool definitions** via `toolDefinition()` - single definition usable on server/client
2. **Built-in approval workflow** via `needsApproval: true` flag with `addToolApprovalResponse()`
3. **Multi-provider adapters** - tree-shakeable imports for Gemini, OpenAI, Anthropic, Ollama
4. **Streaming with AG-UI protocol** - real-time response rendering with tool call states

**Primary recommendation:** Adopt TanStack AI's `toolDefinition()` pattern to replace the brownfield stubbed interfaces. This gives us type-safe tools with built-in approval workflow, automatic execution, and streaming support - directly addressing AI-01 through AI-07 requirements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tanstack/ai` | ^0.2.2 | Core SDK - toolDefinition, chat, streaming | Already installed, type-safe, provider-agnostic |
| `@tanstack/ai-react` | ^0.2.2 | React hooks - useChat, message handling | Already installed, automatic streaming |
| `@tanstack/ai-gemini` | ^0.3.2 | Gemini provider adapter | Already installed, meets AI-04 requirement |
| `@tanstack/ai-openai` | ^0.2.1 | OpenAI/OpenRouter adapter | Already installed, meets AI-05 requirement |
| `zod` | ^4.3.6 | Schema validation for tool inputs/outputs | Already installed, TanStack AI native support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@google/genai` | ^1.34.0 | Direct Gemini API (low-level) | For Gemini-specific features beyond adapter |
| `@tanstack/ai-client` | ^0.2.2 | Client-side tool utilities | For `clientTools()`, `createChatClientOptions()` |
| `@tanstack/ai-anthropic` | 0.2.0 | Anthropic Claude adapter | Future provider expansion |
| `@tanstack/ai-ollama` | 0.3.0 | Ollama local model adapter | For local/offline AI support |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack AI | Vercel AI SDK | Different API, would require migration. TanStack already installed. |
| toolDefinition() | Raw OpenAI tool format | No isomorphic support, no type inference, no built-in approval |
| useChat | Custom fetch + streaming | Would need to implement AG-UI protocol manually |

**Installation:** Already installed in package.json. No new dependencies needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/
│   └── tools/
│       ├── definitions/           # Tool schema definitions (shared)
│       │   ├── file-tools.ts      # read_file, write_file, delete_file
│       │   ├── terminal-tools.ts  # execute_command
│       │   ├── knowledge-tools.ts # search_knowledge, add_to_knowledge
│       │   └── index.ts           # Re-exports all definitions
│       ├── tool-permissions.ts    # Risk levels, approval requirements
│       └── tool-categories.ts     # Category constants (existing)
│
├── infrastructure/
│   └── tools/
│       ├── implementations/       # Server-side tool implementations
│       │   ├── file-tools.server.ts
│       │   ├── terminal-tools.server.ts
│       │   └── knowledge-tools.server.ts
│       ├── tool-registry.ts       # Registry + initialization
│       └── tool-catalog.ts        # Metadata + discovery
│
├── presentation/
│   └── components/
│       └── chat/
│           ├── ChatPanel.tsx           # Main chat component
│           ├── ToolApprovalPrompt.tsx  # Approval UI
│           ├── ToolCallDisplay.tsx     # Tool state rendering
│           └── hooks/
│               └── useChatWithTools.ts # useChat wrapper with tools
│
└── api/                           # TanStack Start API routes
    └── chat/
        └── route.ts               # SSE endpoint for chat
```

### Pattern 1: Isomorphic Tool Definition
**What:** Define tool schema once, implement for server and/or client
**When to use:** Every tool definition
**Example:**
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/guides/server-tools.md
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

// Step 1: Define schema (shared)
export const readFileDef = toolDefinition({
  name: "read_file",
  description: "Read contents of a file from the project",
  inputSchema: z.object({
    path: z.string().describe("Relative path to file"),
  }),
  outputSchema: z.object({
    content: z.string(),
    encoding: z.enum(["utf-8", "binary"]),
  }),
  needsApproval: false, // Read is safe, no approval needed
});

export const writeFileDef = toolDefinition({
  name: "write_file",
  description: "Write or create a file in the project",
  inputSchema: z.object({
    path: z.string().describe("Relative path to file"),
    content: z.string().describe("Content to write"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    bytesWritten: z.number(),
  }),
  needsApproval: true, // AI-02: Write requires approval
});

// Step 2: Server implementation
export const readFile = readFileDef.server(async ({ path }) => {
  const content = await fileService.read(path);
  return { content, encoding: "utf-8" };
});

export const writeFile = writeFileDef.server(async ({ path, content }) => {
  const result = await fileService.write(path, content);
  return { success: true, bytesWritten: result.size };
});
```

### Pattern 2: Approval Workflow
**What:** Tools marked with `needsApproval: true` pause for user confirmation
**When to use:** write_file, delete_file, execute_command, any destructive operation
**Example:**
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/guides/tool-approval.md
// In ChatPanel.tsx
const { messages, addToolApprovalResponse } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools: clientTools, // Client tool implementations
});

// Render approval UI for pending tools
{message.parts.map((part) => {
  if (part.type === "tool-call" && part.state === "approval-requested") {
    return (
      <ToolApprovalPrompt
        key={part.id}
        toolName={part.name}
        args={JSON.parse(part.arguments)}
        onApprove={() => addToolApprovalResponse({ id: part.approval!.id, approved: true })}
        onDeny={() => addToolApprovalResponse({ id: part.approval!.id, approved: false })}
      />
    );
  }
})}
```

### Pattern 3: Multi-Provider Chat
**What:** Provider-agnostic chat with adapter pattern
**When to use:** API route for chat completions
**Example:**
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/reference/functions/chat.md
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { openaiText } from "@tanstack/ai-openai";
import { tools } from "@/infrastructure/tools";

// Provider factory based on user preference
function getAdapter(provider: "gemini" | "openrouter", apiKey: string) {
  if (provider === "gemini") {
    return geminiText({ apiKey, model: "gemini-2.0-flash" });
  }
  // OpenRouter uses OpenAI-compatible API
  return openaiText({ 
    apiKey, 
    baseURL: "https://openrouter.ai/api/v1",
    model: "anthropic/claude-3.5-sonnet"
  });
}

export async function POST(request: Request) {
  const { messages, provider, apiKey } = await request.json();
  
  const stream = chat({
    adapter: getAdapter(provider, apiKey),
    messages,
    tools, // Tool definitions with server implementations
  });

  return toServerSentEventsResponse(stream);
}
```

### Pattern 4: Tool Call State Machine
**What:** Track tool execution lifecycle for UI feedback
**When to use:** Rendering tool calls in chat
**Example:**
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/guides/client-tools.md
function ToolCallDisplay({ part }: { part: ToolCallPart }) {
  switch (part.state) {
    case "awaiting-input":
      return <div>Preparing {part.name}...</div>;
    case "input-streaming":
      return <div>Receiving arguments for {part.name}...</div>;
    case "approval-requested":
      return <ApprovalPrompt part={part} />;
    case "executing":
      return <div>Executing {part.name}...</div>;
    case "output-available":
      return <ToolResult name={part.name} output={part.output} />;
    case "output-error":
      return <ToolError name={part.name} error={part.error} />;
    case "cancelled":
      return <div>Denied: {part.name}</div>;
    default:
      return null;
  }
}
```

### Anti-Patterns to Avoid
- **Hand-rolling tool schemas:** Don't define JSON Schema manually. Use `toolDefinition()` with Zod for type inference and validation.
- **Mixing server/client execution:** Don't execute file operations on client. Server tools for secure operations, client tools for UI updates.
- **Polling for tool results:** Don't poll. Use SSE streaming with `fetchServerSentEvents()`.
- **Global API key storage:** Don't hardcode API keys. Use BYOK vault (AI-06 requirement).
- **Synchronous tool execution:** Don't block. All tools should be async.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tool schema definition | Manual JSON Schema | `toolDefinition()` from @tanstack/ai | Type inference, isomorphic, validation |
| Approval workflow | Custom state machine | `needsApproval: true` + `addToolApprovalResponse()` | Built-in state management, streaming |
| Streaming responses | WebSocket or polling | `toServerSentEventsResponse()` + `fetchServerSentEvents()` | AG-UI protocol, automatic message parsing |
| Tool call lifecycle | Manual tracking | `part.state` from ToolCallPart | States are managed by SDK |
| Provider abstraction | Custom adapters | `geminiText()`, `openaiText()` | Tree-shakeable, tested, maintained |
| Tool execution | Promise chains | `chat()` with tools array | Automatic execution, result handling |

**Key insight:** TanStack AI solves the entire tool execution lifecycle. Custom implementations would need to handle streaming, approval states, error recovery, and message history management - complex problems already solved.

## Common Pitfalls

### Pitfall 1: Confusing Vercel AI SDK with TanStack AI SDK
**What goes wrong:** Using wrong import paths or API patterns from Vercel AI
**Why it happens:** Similar names, both from AI SDK ecosystem
**How to avoid:** Always import from `@tanstack/ai*` packages
**Warning signs:** Imports like `ai`, `useCompletion`, `generateText` - these are Vercel patterns

### Pitfall 2: Not Using Zod for Tool Schemas
**What goes wrong:** Loss of type inference, no runtime validation
**Why it happens:** JSON Schema is also supported, seems simpler
**How to avoid:** Always use Zod schemas for `inputSchema` and `outputSchema`
**Warning signs:** `inputSchema` is a plain object, not a Zod schema

### Pitfall 3: Missing Tool States in UI
**What goes wrong:** User sees frozen UI during tool execution
**Why it happens:** Not rendering intermediate states like `executing`, `approval-requested`
**How to avoid:** Handle all states in ToolCallPart rendering
**Warning signs:** Tool calls appear suddenly complete, no loading states

### Pitfall 4: API Key Exposure
**What goes wrong:** Keys visible in browser console or stored insecurely
**Why it happens:** Passing keys through client-side code
**How to avoid:** Store in secure vault (AI-06), pass to server only via HTTPS
**Warning signs:** API key in localStorage, in URL params, or in client bundle

### Pitfall 5: Tool Result Side Effects Not Tracked
**What goes wrong:** User doesn't know what files were modified
**Why it happens:** Tool returns success/failure without details
**How to avoid:** Return structured side effects in outputSchema (AI-03 requirement)
**Warning signs:** `{ success: true }` without `filesModified`, `bytesWritten`, etc.

## Code Examples

Verified patterns from official sources:

### Core Tool Registry Pattern
```typescript
// Source: Derived from TanStack AI docs + brownfield constants.ts
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import type { ToolCategory } from "@/domain/tools/tool-permissions";

// Central registry of all tool definitions
export const TOOL_DEFINITIONS = {
  // Files category (matches brownfield TOOL_CATEGORIES)
  read_file: toolDefinition({
    name: "read_file",
    description: "Read the contents of a file",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
    }),
    outputSchema: z.object({
      content: z.string(),
      size: z.number(),
      mimeType: z.string(),
    }),
    needsApproval: false,
  }),
  
  write_file: toolDefinition({
    name: "write_file", 
    description: "Write content to a file",
    inputSchema: z.object({
      path: z.string().describe("Path to the file"),
      content: z.string().describe("Content to write"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      bytesWritten: z.number(),
      sideEffects: z.object({
        filesCreated: z.array(z.string()),
        filesModified: z.array(z.string()),
      }),
    }),
    needsApproval: true, // AI-02: Requires approval
  }),
  
  // Terminal category
  execute_command: toolDefinition({
    name: "execute_command",
    description: "Execute a shell command",
    inputSchema: z.object({
      command: z.string().describe("Command to execute"),
      cwd: z.string().optional().describe("Working directory"),
    }),
    outputSchema: z.object({
      stdout: z.string(),
      stderr: z.string(),
      exitCode: z.number(),
    }),
    needsApproval: true, // High risk
  }),
} as const;

export type ToolName = keyof typeof TOOL_DEFINITIONS;
```

### Chat API Route with Tools
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/guides/server-tools.md
// api/chat/route.ts
import { chat, toServerSentEventsResponse } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { openaiText } from "@tanstack/ai-openai";
import { serverTools } from "@/infrastructure/tools/implementations";

export async function POST(request: Request) {
  const { messages, provider, apiKey } = await request.json();
  
  // Select adapter based on provider
  const adapter = provider === "gemini"
    ? geminiText({ apiKey, model: "gemini-2.0-flash-exp" })
    : openaiText({ 
        apiKey, 
        baseURL: "https://openrouter.ai/api/v1",
        model: "anthropic/claude-3.5-sonnet",
      });
  
  const stream = chat({
    adapter,
    messages,
    tools: serverTools, // Array of tool implementations
  });

  return toServerSentEventsResponse(stream);
}
```

### useChat with Tools Hook
```typescript
// Source: https://github.com/TanStack/ai/blob/main/docs/guides/streaming.md
// presentation/hooks/useChatWithTools.ts
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";

export function useChatWithTools(apiKey: string, provider: string) {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey }),
    }),
    onChunk: (chunk) => console.log("Chunk:", chunk.type),
    onFinish: (message) => console.log("Complete:", message.id),
    onError: (error) => console.error("Error:", error),
  });

  return useChat(chatOptions);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `createTool()` (early versions) | `toolDefinition()` | TanStack AI 0.2.x | Isomorphic tools, .server()/.client() methods |
| Manual SSE parsing | `toServerSentEventsResponse()` | TanStack AI 0.2.x | AG-UI protocol built-in |
| Custom tool states | `ToolCallPart.state` enum | TanStack AI 0.2.x | Standardized lifecycle |
| Vercel AI SDK patterns | TanStack-specific patterns | 2024-2025 | Different API, not compatible |

**Deprecated/outdated:**
- Direct OpenAI SDK usage for tools: Use `@tanstack/ai-openai` adapter
- Custom streaming parsers: Use built-in AG-UI protocol
- Manual tool result handling: Automatic with `chat()` + tools array

## Open Questions

Things that couldn't be fully resolved:

1. **OpenRouter specific headers**
   - What we know: OpenRouter uses OpenAI-compatible API
   - What's unclear: Whether `HTTP-Referer` and `X-Title` headers are required
   - Recommendation: Test with basic OpenAI adapter first, add headers if needed

2. **BYOK Vault Implementation**
   - What we know: AI-06 requires secure key storage, client-side app
   - What's unclear: Best encryption approach for browser-based key storage
   - Recommendation: Research SubtleCrypto API for IndexedDB encryption in plan phase

3. **Tool Side Effects Schema (AI-03)**
   - What we know: Results should include files created/modified
   - What's unclear: Exact schema for side effects across all tool types
   - Recommendation: Define `SideEffects` type with union for different operations

## Sources

### Primary (HIGH confidence)
- Context7 `/tanstack/ai` - toolDefinition, useChat, ToolCallPart documentation
- GitHub TanStack/ai raw docs - server-tools.md, client-tools.md, tool-approval.md, streaming.md
- GitHub TanStack/ai README - package overview, adapter list

### Secondary (MEDIUM confidence)
- Project package.json - Confirmed installed versions
- Brownfield src/infrastructure/persistence/stores/permissions/constants.ts - 31 tool definitions, categories

### Tertiary (LOW confidence)
- None - All findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed, docs verified
- Architecture: HIGH - Patterns from official TanStack AI documentation
- Pitfalls: HIGH - Based on API contracts and SDK behavior
- Tool definitions: HIGH - Brownfield categories exist, TanStack patterns verified
- Provider adapters: HIGH - Both Gemini and OpenAI adapters in package.json

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable SDK, documented patterns)

---

## Appendix: Brownfield Tool Inventory

Existing tool categories from `src/infrastructure/persistence/stores/permissions/constants.ts`:

| Category | Tools | Count |
|----------|-------|-------|
| files | read_file, list_files, read_directory, write_file, create_directory, delete_file | 6 |
| terminal | execute_command | 1 |
| knowledge | search_knowledge, add_to_knowledge | 2 |
| vision | analyze_image, capture_screen | 2 |
| search | web_search, search_files | 2 |
| web | fetch_url, browse_web | 2 |
| notes | create_note, read_note, update_note, delete_note, list_notes | 5 |
| unified | read, write, delete, list | 4 |
| composite | research, storyboard, analyze, plan | 4 |
| provider | (reserved) | 0 |
| **Total** | | **31** |

**Note:** The stubbed `CentralizedToolRegistry` interface doesn't match TanStack AI patterns. Replace entirely with `toolDefinition()` pattern.
