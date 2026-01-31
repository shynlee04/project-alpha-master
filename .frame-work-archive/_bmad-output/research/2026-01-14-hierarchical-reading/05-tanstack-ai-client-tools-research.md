# TanStack AI - Client-Side Tools & Agentic Orchestration

**Source**: https://tanstack.com/ai/latest/docs
**Date**: 2026-01-14
**Research Date**: 2026-01-14

---

## Executive Summary

TanStack AI is a **type-safe, provider-agnostic AI SDK** for building agentic applications with:
- **Isomorphic tool system** - Define once, execute on server or client
- **Client-side tools** - Execute in browser for UI updates, local storage, browser APIs
- **Agentic cycle** - Multi-step reasoning with automatic tool continuation
- **Full type safety** - End-to-end TypeScript inference from Zod schemas
- **Automatic execution** - No manual onToolCall callbacks needed

**Status**: **ALPHA** (as of January 2026)

---

## Core Architecture

### The Tool Definition Pattern

TanStack AI uses a **two-step definition process**:

```typescript
// Step 1: Define schema (shared between server/client)
const updateUIDef = toolDefinition({
  name: "update_ui",
  description: "Update the UI with new information",
  inputSchema: z.object({
    message: z.string().describe("Message to display"),
    type: z.enum(["success", "error", "info"]).describe("Message type"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
});

// Step 2a: Server implementation (optional execute function)
const updateUIServer = updateUIDef.server(async (input) => {
  // Server-side logic
  return { success: true };
});

// Step 2b: Client implementation (closures)
const updateUIClient = updateUIDef.client((input) => {
  setNotification({ message: input.message, type: input.type });
  return { success: true };
});
```

### Isomorphic Architecture

| Aspect | Server Tools | Client Tools |
|--------|-------------|--------------|
| **Definition** | Same `toolDefinition()` API | Same `toolDefinition()` API |
| **Implementation** | `.server(async fn)` | `.client(fn)` |
| **Execution** | On server in API route | Automatically in browser |
| **Use Cases** | API calls, DB queries, secrets | UI updates, localStorage, browser APIs |
| **Needs Approval** | Optional `needsApproval: true` | Same |

---

## Client-Side Tool Execution

### How It Works

1. **LLM decides to call a tool** - Based on user input and tool descriptions
2. **Server detects client tool** - Tool has no execute function
3. **Server sends chunk** - `tool-input-available` chunk to browser
4. **Client auto-executes** - Matching implementation runs automatically
5. **Result returned** - Sent back to server and added to conversation
6. **LLM continues** - Uses result to generate response

### Key Difference: No execute() on Server

```typescript
// ❌ Server tool: Has execute function
const getWeather = getWeatherDef.server(async ({ city }) => {
  const response = await fetch(`https://api.weather.com/${city}`);
  return await response.json();
});

// ✅ Client tool: No execute function on server
const updateUI = updateUIDef.client((input) => {
  setNotification(input.message);
  return { success: true };
});

// Server passes definition (not implementation)
chat({ tools: [updateUIDef] }); // Client will execute
```

### Automatic Execution Flow

```typescript
// No manual onToolCall callback needed!
const tools = clientTools(updateUI, saveToStorage);

const { messages } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools, // Automatically executes when LLM calls
});
```

---

## Agentic Cycle (Multi-Step Reasoning)

### The Pattern

The agentic cycle enables **complex multi-step operations**:

```
User Request → Tool Call 1 → Result 1 → Tool Call 2 → Result 2 → ... → Final Response
```

### Example: Weather + Clothing Advice

```typescript
// Tool definitions
const getWeatherDef = toolDefinition({
  name: "get_weather",
  description: "Get current weather for a city",
  inputSchema: z.object({ city: z.string() }),
});

const getClothingAdviceDef = toolDefinition({
  name: "get_clothing_advice",
  description: "Get clothing recommendations based on weather",
  inputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
});

// Implementations
const getWeather = getWeatherDef.server(async ({ city }) => {
  const response = await fetch(`https://api.weather.com/v1/${city}`);
  return await response.json();
});

const getClothingAdvice = getClothingAdviceDef.server(async ({ temperature, conditions }) => {
  if (temperature < 50) return { recommendation: "Wear a warm jacket" };
  return { recommendation: "Light clothing is fine" };
});

// Server route
const stream = chat({
  adapter: openai(),
  messages,
  model: "gpt-4o",
  tools: [getWeather, getClothingAdvice],
});
```

**Agentic Flow**:
1. User: "What should I wear in San Francisco today?"
2. **Cycle 1**: LLM calls `get_weather({city: "San Francisco"})` → Returns `{temp: 62, conditions: "cloudy"}`
3. **Cycle 2**: LLM calls `get_clothing_advice({temperature: 62, conditions: "cloudy"})` → Returns `{recommendation: "Light jacket"}`
4. **Cycle 3**: LLM generates: "The weather in San Francisco is 62°F and cloudy. I recommend wearing a light jacket."

### maxIterations Strategy

```typescript
import { maxIterations } from '@tanstack/ai'

const stream = chat({
  adapter: openai(),
  messages,
  tools: [getWeather, getClothingAdvice],
  onStep: maxIterations(5), // Limit to 5 agentic cycles
});
```

---

## Tool States & Lifecycle

### Call States

| State | Description | Client Action |
|-------|-------------|---------------|
| `awaiting-input` | Tool call received, no arguments yet | Show loading |
| `input-streaming` | Partial arguments being received | Show progress |
| `input-complete` | All arguments received | Ready to execute |
| `approval-requested` | Waiting for user approval | Show approval UI |

### Result States

| State | Description | Client Action |
|-------|-------------|---------------|
| `streaming` | Result being streamed | Show progress |
| `complete` | Result is complete | Show result |
| `error` | Error occurred | Show error message |

### Monitoring States in React

```typescript
function ToolCallDisplay({ part }: { part: ToolCallPart }) {
  if (part.state === "awaiting-input") {
    return <div>🔄 Waiting for arguments...</div>;
  }
  if (part.state === "input-streaming") {
    return <div>📥 Receiving arguments...</div>;
  }
  if (part.state === "input-complete") {
    return <div>✓ Arguments received, executing...</div>;
  }
  if (part.output) {
    return <div>✅ Tool completed successfully</div>;
  }
  return null;
}
```

---

## Hybrid Tools (Server + Client)

Tools can have **both implementations** for flexible execution:

```typescript
// Define once
const addToCartDef = toolDefinition({
  name: "add_to_cart",
  description: "Add item to shopping cart",
  inputSchema: z.object({
    itemId: z.string(),
    quantity: z.number(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    cartId: z.string(),
  }),
});

// Server implementation - Store in database
const addToCartServer = addToCartDef.server(async (input) => {
  const cart = await db.carts.create({
    data: { itemId: input.itemId, quantity: input.quantity },
  });
  return { success: true, cartId: cart.id };
});

// Client implementation - Update local wishlist
const addToCartClient = addToCartDef.client((input) => {
  const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
  wishlist.push(input.itemId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  return { success: true, cartId: "local" };
});

// Server: Pass definition for client execution
chat({ tools: [addToCartDef] }); // Client will execute

// Or pass server implementation for server execution
chat({ tools: [addToCartServer] }); // Server will execute
```

---

## Type Safety Benefits

### End-to-End Type Inference

```typescript
// Define with Zod
const updateUIDef = toolDefinition({
  name: "update_ui",
  inputSchema: z.object({
    message: z.string(),
    type: z.enum(["success", "error", "info"]),
  }),
  outputSchema: z.object({ success: z.boolean() }),
});

// Infer message types
type ChatMessages = InferChatMessages<typeof chatOptions>;

// In component - fully typed!
messages.forEach((message) => {
  message.parts.forEach((part) => {
    if (part.type === "tool-call" && part.name === "update_ui") {
      // ✅ TypeScript knows part.name is literally "update_ui"
      // ✅ part.input is { message: string, type: "success" | "error" | "info" }
      // ✅ part.output is { success: boolean } | undefined

      console.log(part.input.message); // Fully typed!
      if (part.output) {
        console.log(part.output.success); // Fully typed!
      }
    }
  });
});
```

---

## Approval Flow

For sensitive operations, tools can require user approval:

```typescript
const sendEmailDef = toolDefinition({
  name: "send_email",
  description: "Send an email",
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  needsApproval: true, // Requires user approval
});

// In client component
const { messages, addToolApprovalResponse } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
});

// Render approval UI
{part.state === "approval-requested" && (
  <div>
    <p>Approve sending email to {part.arguments.to}?</p>
    <button onClick={() => addToolApprovalResponse({
      id: part.approval.id,
      approved: true,
    })}>Approve</button>
    <button onClick={() => addToolApprovalResponse({
      id: part.approval.id,
      approved: false,
    })}>Deny</button>
  </div>
)}
```

---

## Takeaways for HARS Implementation

### Viability Assessment: **HIGHLY VIABLE**

| HARS Requirement | TanStack AI Capability | Viability |
|-----------------|----------------------|-----------|
| **Drill-down** | Client tools can navigate routes, update state | ✅ Fully Viable |
| **Bounce-back** | Agentic cycle enables multi-step continuation | ✅ Fully Viable |
| **Context Economy** | Token streaming, state management | ✅ Fully Viable |
| **Sub-agent delegation** | Tools can call other tools via agentic cycle | ⚠️ Requires architecture |
| **Type safety** | End-to-end TypeScript + Zod | ✅ Excellent |
| **Local state** | Client tools access Zustand, Dexie | ✅ Fully Viable |
| **File System API** | Client tools can invoke FSA operations | ✅ Fully Viable |

### Recommended Tool Architecture for HARS

```typescript
// Client tools for hierarchical navigation
const drillDownDef = toolDefinition({
  name: "drill_down",
  description: "Navigate into a section of the document",
  inputSchema: z.object({
    sectionId: z.string(),
    filePath: z.string(),
  }),
  outputSchema: z.object({
    content: z.string(),
    breadcrumbs: z.array(z.object({
      title: z.string(),
      path: z.string(),
    })),
  }),
});

const bounceBackDef = toolDefinition({
  name: "bounce_back",
  description: "Return to parent section",
  inputSchema: z.object({
    levels: z.number().optional(),
  }),
  outputSchema: z.object({
    sectionId: z.string(),
    content: z.string(),
  }),
});

const searchContextDef = toolDefinition({
  name: "search_context",
  description: "Search within document for relevant context",
  inputSchema: z.object({
    query: z.string(),
    filePath: z.string(),
  }),
  outputSchema: z.object({
    matches: z.array(z.object({
      line: z.number(),
      context: z.string(),
    })),
  }),
});

// Client implementations
const drillDown = drillDownDef.client(async ({ sectionId, filePath }) => {
  // Use TanStack Router navigation
  const navigate = useNavigate();
  await navigate({ to: `/documents/${filePath}#${sectionId}` });

  // Update breadcrumbs context
  const breadcrumbs = useBreadcrumbs();
  const newCrumbs = [...breadcrumbs, { title: sectionId, path: sectionId }];
  setBreadcrumbs(newCrumbs);

  return {
    content: await fetchSectionContent(sectionId),
    breadcrumbs: newCrumbs,
  };
});
```

### Integration with Stack

| Component | Integration Pattern |
|-----------|-------------------|
| **TanStack Router** | Client tools use `useNavigate()` for drill-down |
| **Zustand** | Client tools update stores directly |
| **Dexie** | Client tools query IndexedDB for context |
| **Monaco** | Client tools update editor selection/position |
| **File System API** | Client tools invoke file handles |

### Limitations & Considerations

1. **ALPHA Status** - TanStack AI is still alpha, API may change
2. **No native sub-agent support** - Agentic cycle loops but doesn't spawn new agents
3. **Server required** - Still need API route for LLM communication
4. **Tool approval overhead** - Multi-step workflows require multiple approvals if enabled
5. **Token budgeting** - Must implement custom context compression (not built-in)

---

## Sources

- TanStack AI Docs: https://tanstack.com/ai/latest/docs
- Client Tools Guide: https://tanstack.com/ai/latest/docs/guides/client-tools
- Agentic Cycle: https://tanstack.com/ai/latest/docs/guides/agentic-cycle
- Tool Architecture: https://tanstack.com/ai/latest/docs/guides/tool-architecture
- GitHub Repository: https://github.com/TanStack/ai
- Context7 Research: /tanstack/ai
