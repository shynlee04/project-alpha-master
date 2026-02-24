# Research: TanStack AI vs Vercel AI SDK v6
**Date**: 2026-01-28
**Purpose**: Answer user's SDK choice question for Project Alpha client-side agentic AI
**Researcher**: analyst-ext
**Sources**: Context7, Exa, Tavily (real-time 2026 data)

---

## Executive Summary

**TanStack AI is the superior choice for Project Alpha** due to its first-class client-side tool execution, isomorphic tool definitions, built-in approval system, and deep TanStack Start integration. While Vercel AI SDK v6 has improved significantly with multi-step tool execution and human-in-the-loop patterns, its client-side tooling remains server-dependent. TanStack AI's provider-agnostic architecture aligns with Project Alpha's multi-provider goals.

---

## TanStack AI (January 2026)

### Client-Side Tools ⭐ **EXCELLENT**

TanStack AI has **first-class client-side tool execution** as a core feature:

```typescript
// Client-side tool definition - executes in browser
const deleteLocalData = toolDefinition({
  name: "delete_local_data",
  description: "Delete data from local storage",
  inputSchema: z.object({ key: z.string() }),
  outputSchema: z.object({ deleted: z.boolean() }),
  needsApproval: true,
}).client((input) => {
  // Executes on CLIENT after approval
  localStorage.removeItem(input.key);
  return { deleted: true };
});

// Server-side tool definition - executes on server
const fetchWeather = toolDefinition({...}).server(async (input) => {
  return await weatherService.get(input.city);
});

// Same tool can be used in chat with automatic routing
const { messages, addToolApprovalResponse } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools: [deleteLocalData, fetchWeather], // Mix client + server tools
});
```

**Key Client-Side Features:**
1. **`.client()` modifier**: Tools execute directly in browser
2. **Automatic routing**: Framework knows which tools are client vs server
3. **State access**: Client tools can access localStorage, IndexedDB, DOM
4. **No server roundtrip**: True client execution, not server-proxied

### Tool Approval System ⭐ **EXCELLENT**

Built-in approval workflow with `needsApproval: true`:

```typescript
// Tool definition with approval requirement
const sendEmail = toolDefinition({
  name: "send_email",
  needsApproval: true, // Built-in flag
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
});

// UI handling
{message.parts.map((part) => {
  if (part.type === "tool-call" && part.state === "approval-requested") {
    return (
      <div>
        <p>Approve: {part.name}</p>
        <pre>{JSON.stringify(part.arguments, null, 2)}</pre>
        <button onClick={() => addToolApprovalResponse({
          id: part.approval.id,
          approved: true,
        })}>Approve</button>
        <button onClick={() => addToolApprovalResponse({
          id: part.approval.id,
          approved: false,
        })}>Deny</button>
      </div>
    );
  }
})}
```

### Agentic Patterns

**Available Patterns:**
| Pattern | Support | Notes |
|---------|---------|-------|
| Multi-step tool execution | ✅ Yes | Via `maxIterations` config |
| Parallel tool calls | ✅ Yes | Automatic for independent calls |
| Structured output + tools | ✅ Yes | `outputSchema` with `tools` |
| Streaming | ✅ Yes | SSE with chunk types |
| Human-in-the-loop | ✅ Yes | `needsApproval` flag |
| Tool delegation | ⚠️ Manual | No built-in orchestrator |

**Structured Output with Tools Example:**
```typescript
const recommendation = await chat({
  adapter: openaiText("gpt-5.2"),
  messages: [{ role: "user", content: "Recommend a product for a developer" }],
  tools: [getProductPrice],
  outputSchema: z.object({
    productName: z.string(),
    currentPrice: z.number(),
    reason: z.string(),
  }),
});
// AI calls tools first, then returns structured output
```

### Provider Support ⭐ **EXCELLENT**

**First-party adapters:**
- `@tanstack/ai-openai` - OpenAI (GPT-4, GPT-5)
- `@tanstack/ai-anthropic` - Anthropic (Claude)
- `@tanstack/ai-gemini` - Google Gemini
- `@tanstack/ai-ollama` - Local models via Ollama
- `@tanstack/ai-openrouter` - 300+ models unified API

**Runtime Provider Switching:**
```typescript
const adapters = {
  anthropic: () => anthropicText('claude-sonnet-4-5'),
  gemini: () => geminiText('gemini-2.0-flash-exp'),
  ollama: () => ollamaText('mistral:7b'),
  openai: () => openaiText('gpt-5.2'),
};

// Switch at runtime with type safety
const stream = chat({
  adapter: adapters[userSelectedProvider](),
  messages,
});
```

### React Integration

- `@tanstack/ai-react` with `useChat` hook
- Deep TanStack Start integration
- SSE streaming via `fetchServerSentEvents`
- Type-safe message parts rendering

### Strengths

1. **True client-side tool execution** - Not proxied through server
2. **Isomorphic tool definitions** - Same tool works client/server
3. **Built-in approval system** - First-class `needsApproval` flag
4. **Provider-agnostic** - No vendor lock-in
5. **TanStack ecosystem integration** - Router, Query, Start
6. **Type-safe throughout** - Full TypeScript inference

### Weaknesses

1. **Newer library** - Less community resources than Vercel SDK
2. **No built-in agent orchestration** - Manual multi-agent patterns
3. **Smaller ecosystem** - Fewer third-party integrations
4. **Documentation still maturing** - Some gaps in advanced patterns

---

## Vercel AI SDK v6 (January 2026)

### Client-Side Tools ⚠️ **IMPROVED BUT LIMITED**

v6 introduced significant improvements, but client-side tools still follow server-centric patterns:

```typescript
// v6: Client-side tool handling via addToolResult
const { messages, addToolResult, sendMessage } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  onToolCall: async ({ toolCall }) => {
    if (toolCall.toolName === 'getLocation') {
      const result = await getLocationData(); // Client-side execution
      addToolResult({
        tool: 'getLocation',
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    }
  },
});
```

**Key Differences from TanStack AI:**
- Tools are defined on server, results provided from client
- No native `.client()` modifier for tool definitions
- Client execution is callback-based, not declarative
- More manual wiring required

### Tool Approval System ⚠️ **GOOD**

v6 has human-in-the-loop, but more verbose:

```typescript
// Define approval constants
export const APPROVAL = { YES: 'Yes, confirmed.', NO: 'No, denied.' };

// Client handling
if (part.state === 'input-available' && 
    toolsRequiringConfirmation.includes(toolName)) {
  return (
    <div>
      <button onClick={async () => {
        await addToolOutput({
          toolCallId,
          tool: toolName,
          output: APPROVAL.YES,
        });
        sendMessage();
      }}>Yes</button>
    </div>
  );
}
```

**vs TanStack AI:**
- No built-in `needsApproval` flag on tool definitions
- Approval is output-based, not state-based
- Requires more boilerplate

### Agentic Patterns ⭐ **EXCELLENT**

v6 has the best agentic patterns ecosystem:

| Pattern | Support | Implementation |
|---------|---------|----------------|
| Multi-step tool execution | ✅ Yes | `stepCountIs(n)` |
| ToolLoopAgent | ✅ Yes | Built-in agent class |
| Orchestrator-Worker | ✅ Yes | Via ai-sdk-agents patterns |
| Evaluator-Optimizer | ✅ Yes | Built-in pattern |
| Parallel Processing | ✅ Yes | Automatic |
| Human-in-the-Loop | ✅ Yes | Via tool output flow |

**ToolLoopAgent Example (v6 exclusive):**
```typescript
import { Output, ToolLoopAgent, tool } from "ai";

const agent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-4.5",
  tools: {
    weather: tool({
      description: "Get the weather",
      inputSchema: z.object({ city: z.string() }),
      execute: async ({ city }) => ({ temp: 72 }),
    }),
  },
  output: Output.object({
    schema: z.object({
      summary: z.string(),
      temperature: z.number(),
    }),
  }),
});

const { output } = await agent.generate({ prompt: "..." });
```

### Provider Support ⭐ **EXCELLENT**

**First-party packages:**
- `@ai-sdk/openai` - OpenAI
- `@ai-sdk/anthropic` - Anthropic
- `@ai-sdk/google` - Google Gemini
- `@ai-sdk/google-vertex` - Google Vertex AI
- `@ai-sdk/mistral` - Mistral
- `@ai-sdk/cohere` - Cohere
- `@ai-sdk/azure` - Azure OpenAI

**Third-party ecosystem:**
- OpenRouter provider
- Many community providers
- Larger ecosystem overall

### React Integration

- `@ai-sdk/react` with `useChat`, `useCompletion`
- Works with Next.js, TanStack Start, plain React
- `DefaultChatTransport` for custom endpoints
- Generative UI patterns (streaming React components)

### Strengths

1. **Mature ecosystem** - Years of development, large community
2. **Built-in agent patterns** - ToolLoopAgent, orchestration
3. **Generative UI** - Stream React components, not just text
4. **Extensive provider support** - Official packages for major providers
5. **Production-proven** - Used by Vercel, major companies
6. **AI SDK Agents library** - 85+ production patterns

### Weaknesses

1. **Server-centric tools** - Client execution is callback-based
2. **More boilerplate for approval** - No `needsApproval` flag
3. **Vercel ecosystem bias** - Optimized for Vercel deployment
4. **Complex migration** - v5 to v6 breaking changes

---

## Head-to-Head Comparison

| Feature | TanStack AI | Vercel AI SDK v6 | Winner |
|---------|-------------|------------------|--------|
| **Client-side tools** | ✅ First-class `.client()` | ⚠️ Callback-based | **TanStack AI** |
| **Tool approval system** | ✅ `needsApproval` flag | ⚠️ Manual output flow | **TanStack AI** |
| **Agentic patterns** | ⚠️ Manual patterns | ✅ ToolLoopAgent, built-in | **Vercel SDK** |
| **Provider adapters** | ✅ 5 official + OpenRouter | ✅ 7+ official | **Tie** |
| **React integration** | ✅ Deep TanStack | ✅ Universal React | **Tie** |
| **Streaming** | ✅ SSE with typed chunks | ✅ Multiple formats | **Tie** |
| **Structured outputs** | ✅ outputSchema | ✅ Output.object | **Tie** |
| **Maturity** | ⚠️ Newer (2024-2026) | ✅ Established (2022+) | **Vercel SDK** |
| **Documentation** | ⚠️ Growing | ✅ Comprehensive | **Vercel SDK** |
| **TanStack integration** | ✅ Native | ⚠️ Compatible | **TanStack AI** |
| **Generative UI** | ⚠️ Limited | ✅ streamUI | **Vercel SDK** |
| **Multi-agent orchestration** | ⚠️ Manual | ✅ Built-in patterns | **Vercel SDK** |

---

## Recommendation for Project Alpha

### Primary Choice: **TanStack AI** ⭐

### Rationale

1. **User's Core Concern Addressed**: The user specifically mentioned "lacking of client-side tooling system" in Vercel SDK. TanStack AI's `.client()` modifier directly solves this with true browser-side tool execution.

2. **Project Alpha's Stack Alignment**: 
   - Already uses TanStack Router
   - Uses TanStack Start (mentioned in architecture.md)
   - Native integration means less friction

3. **Provider Flexibility**: The user wants to support multiple providers (OpenAI, Anthropic, Gemini). TanStack AI's runtime adapter switching with type safety is ideal.

4. **Approval System**: Project Alpha likely needs user approval for sensitive operations (file operations, API calls). TanStack AI's `needsApproval: true` is cleaner than Vercel's manual approach.

5. **Client-Side Capabilities**: For an IDE-like application with:
   - Local file operations (IndexedDB, localStorage)
   - Browser-based editing
   - Offline-first features
   
   True client-side tool execution is essential.

### When Vercel SDK Would Be Better

Use Vercel AI SDK v6 if:
- You need built-in multi-agent orchestration patterns
- You want Generative UI (streaming React components)
- You're deploying on Vercel and want optimized integration
- You have an existing v5 codebase to migrate

### Migration Path (Not Recommended)

If switching from TanStack AI to Vercel SDK later:
1. Tool definitions need complete rewrite (different API)
2. Client-side tools become server callbacks
3. Approval logic becomes more verbose
4. Would lose TanStack integration benefits

**Recommendation: Stay with TanStack AI for client-side excellence.**

### ADR Needed?

**Yes** - Create ADR-040: AI SDK Selection

Should cover:
1. Decision to use TanStack AI for client-side agentic features
2. Provider strategy (OpenAI, Anthropic, Gemini, local)
3. Tool approval patterns for sensitive operations
4. Client vs server tool execution guidelines
5. Future migration considerations if needed

---

## Code Examples for Project Alpha

### Recommended Tool Architecture

```typescript
// tools/definitions.ts
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

// Client-side file operations (executes in browser)
export const readLocalFile = toolDefinition({
  name: "read_local_file",
  description: "Read a file from the local workspace",
  inputSchema: z.object({ path: z.string() }),
  outputSchema: z.object({ content: z.string() }),
}).client(async ({ path }) => {
  // Access IndexedDB or File System API
  const content = await localFileSystem.read(path);
  return { content };
});

// Server-side AI operations (needs API keys)
export const generateCode = toolDefinition({
  name: "generate_code",
  description: "Generate code using AI",
  inputSchema: z.object({ 
    prompt: z.string(),
    language: z.string() 
  }),
}).server(async ({ prompt, language }) => {
  // Server has API keys
  return await codeGenerator.generate(prompt, language);
});

// Sensitive operation requiring approval
export const deleteFile = toolDefinition({
  name: "delete_file",
  description: "Delete a file from workspace",
  inputSchema: z.object({ path: z.string() }),
  needsApproval: true, // User must confirm
}).client(async ({ path }) => {
  await localFileSystem.delete(path);
  return { deleted: true };
});
```

### Provider Switching for Settings

```typescript
// Based on user settings
const getAdapter = (provider: string, apiKey: string) => {
  switch (provider) {
    case 'openai':
      return openaiText('gpt-5.2', { apiKey });
    case 'anthropic':
      return anthropicText('claude-sonnet-4-5', { apiKey });
    case 'gemini':
      return geminiText('gemini-2.0-flash', { apiKey });
    case 'ollama':
      return ollamaText('mistral:7b', { baseUrl: 'http://localhost:11434' });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};
```

---

## References

- TanStack AI Docs: https://tanstack.com/ai/latest/docs
- Vercel AI SDK v6: https://ai-sdk.dev
- AI SDK Agents Patterns: https://www.aisdkagents.com
- OpenRouter Models: https://openrouter.ai/models
