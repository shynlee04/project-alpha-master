# TanStack AI Tool Definition - Technical Research

**Research Date:** 2025-12-10
**Updated:** 2025-12-10T03:00:00+07:00
**Research Type:** Technical - Critical
**Purpose:** Implementation guide for tool definition with toolDefinition() function

---

## ⚠️ SPIKE VALIDATION UPDATE (2025-12-10)

The following patterns have been **validated** in `spikes/tanstack-ai-spike/`:

```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod' // MUST be Zod 4.x for toJSONSchema

// 1. Define tool with Zod schemas
const getTimeDef = toolDefinition({
  name: 'get_time',
  description: 'Get the current server time',
  inputSchema: z.object({
    timezone: z.string().optional(),
  }),
  outputSchema: z.object({
    time: z.string(),
    timezone: z.string(),
  }),
})

// 2. Create server implementation with .server()
const getTime = getTimeDef.server(async ({ timezone }) => {
  const tz = timezone || 'UTC'
  const time = new Date().toLocaleString('en-US', { timeZone: tz })
  return { time, timezone: tz }
})

// 3. Use in chat() with tools array
import { chat, toStreamResponse } from '@tanstack/ai'
import { createGemini } from '@tanstack/ai-gemini'

const stream = chat({
  adapter: createGemini(apiKey),
  model: 'gemini-2.0-flash',
  messages,
  tools: [getTime], // Pass the server implementation, NOT the definition
})

return toStreamResponse(stream)
```

**Key Insights from Spike:**
- Use `toolDefinition().server(handler)` to create executable server tool
- Pass the **implementation** (not definition) to `chat({ tools: [...] })`
- Zod 4.x is required (Zod 3.x lacks `toJSONSchema` export)

---

## Executive Summary

TanStack AI provides a unified `toolDefinition()` API for defining type-safe tools that can execute on both client and server. This research covers the complete pattern for defining, implementing, and using tools in via-gent's multi-agent system with Zod schema validation.

**Key Findings:**
- ✅ Single definition, dual execution (client/server)
- ✅ Zod 4.x schema validation for inputs/outputs
- ✅ Type inference across the entire tool chain
- ✅ Tool approval workflow support
- ✅ Hybrid tool chaining patterns

---

## 1. Core Tool Definition API

### 1.1 Basic Tool Definition

```typescript
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

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
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/client-tools.md

### 1.2 Complete Definition Interface

```typescript
interface ToolDefinition<TName extends string> {
  name: TName;
  description: string;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
  needsApproval?: boolean;
  metadata?: Record<string, any>;
}

// ToolDefinition function signature
function toolDefinition<TName extends string>(config: {
  name: TName;
  description: string;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
  needsApproval?: boolean;
  metadata?: Record<string, any>;
}): ToolDefinition<TName>;
```

### 1.3 Zod Schema Patterns

```typescript
// Complex input schema
const createFileDef = toolDefinition({
  name: "create_file",
  description: "Create a new file in the project",
  inputSchema: z.object({
    path: z.string()
      .min(1)
      .max(1000)
      .regex(/^[\w\-./]+$/, "Invalid file path"),
    content: z.string().max(1_000_000, "File content exceeds 1MB limit"),
    overwrite: z.boolean().default(false),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    path: z.string(),
    size: z.number(),
  }),
});

// Optional parameters
const searchFilesDef = toolDefinition({
  name: "search_files",
  description: "Search for files in the project",
  inputSchema: z.object({
    query: z.string().min(1),
    type: z.enum(["file", "directory"]).optional(),
    caseSensitive: z.boolean().default(false),
  }),
});
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/reference/interfaces/Tool.md

---

## 2. Server-Side Implementation

### 2.1 Server Tool Execution

```typescript
import { getUserDataDef } from "./definitions";

export const getUserData = getUserDataDef.server(async ({ userId }) => {
  const user = await db.users.findUnique({ where: { id: userId } });
  return { 
    name: user.name, 
    email: user.email 
  };
});

// Usage in chat
const stream = chat({
  adapter: openai(),
  messages,
  model: "gpt-4o",
  tools: [getUserData], // Pass server implementation
});
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/server-tools.md

### 2.2 Server Tool with Database

```typescript
// tools/server.ts
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { db } from "@/lib/db";

const searchProductsDef = toolDefinition({
  name: "search_products",
  description: "Search products in database",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(10),
  }),
  outputSchema: z.object({
    products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    })),
  }),
});

export const searchProducts = searchProductsDef.server(async ({ query, limit }) => {
  const products = await db.products.search({
    where: { name: { contains: query } },
    take: limit,
  });
  return { products };
});
```

---

## 3. Client-Side Implementation

### 3.1 Client Tool Execution

```typescript
import { addToCartDef } from "./definitions";

const addToCartClient = addToCartDef.client((input) => {
  const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
  wishlist.push(input.itemId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  return { success: true, cartId: "local" };
});

// Usage with useChat
const tools = clientTools(addToCartClient);

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/chat"),
  tools,
});
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/client-tools.md

### 3.2 Client-Side File Operations

```typescript
// For via-gent IDE
const createFileDef = toolDefinition({
  name: "create_file",
  description: "Create a new file in the project",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
});

const createFile = createFileDef.client(async ({ path, content }) => {
  // Use WebContainers API
  await webcontainer.fs.writeFile(path, content);
  return { success: true, path };
});

const updateUI = updateUIDef.client((input) => {
  setNotification(input.message);
  return { success: true };
});
```

---

## 4. Hybrid Tool Architecture

### 4.1 Server-Client Tool Chaining

```typescript
// Server: Fetch data
const fetchUserPrefsDef = toolDefinition({
  name: "fetch_user_preferences",
  description: "Get user preferences from server",
  inputSchema: z.object({
    userId: z.string(),
  }),
});

const fetchUserPrefsDef.serverUserPreferences = fetch(async ({ userId }) => {
  const prefs = await db.userPreferences.findUnique({ where: { userId } });
  return prefs;
});

// Client: Apply data
const applyPrefsDef = toolDefinition({
  name: "apply_preferences",
  description: "Apply user preferences to the UI",
  inputSchema: z.object({
    theme: z.string(),
    language: z.string(),
  }),
});

const applyPreferences = applyPrefsDef.client(async ({ theme, language }) => {
  // Update UI state with preferences
  document.body.className = theme;
  i18n.changeLanguage(language);
  return { applied: true };
});

// LLM can chain: fetchUserPreferences → applyPreferences
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/tool-architecture.md

### 4.2 Tool Handoff Pattern

```typescript
// Agent handoff using tools
const handOffToCoderDef = toolDefinition({
  name: "handoff_to_coder",
  description: "Transfer task to Coder agent",
  inputSchema: z.object({
    taskId: z.string(),
    context: z.string(),
    priority: z.enum(["low", "medium", "high"]),
  }),
});

const handOffToCoder = handOffToCoderDef.client(async ({ taskId, context, priority }) => {
  // Emit event to EventBus
  eventBus.emit("agent:handoff", {
    from: "orchestrator",
    to: "coder",
    taskId,
    context,
    priority,
  });
  
  return { 
    success: true, 
    transferredAt: new Date().toISOString() 
  };
});
```

---

## 5. Tool Integration with useChat

### 5.1 Client Tools Array

```typescript
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";

// Create multiple client tools
const tools = clientTools(
  updateUI,
  saveToStorage,
  createFile,
  handOffToCoder
);

// Create typed chat options
const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/chat"),
  tools,
});

// Fully typed messages!
type ChatMessages = InferChatMessages<typeof chatOptions>;

// Messages now include tool call types
const { messages, sendMessage, addToolApprovalResponse } = useChat(chatOptions);
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/tools.md

### 5.2 Tool Approval Workflow

```typescript
// Define tool requiring approval
const deleteFileDef = toolDefinition({
  name: "delete_file",
  description: "Delete a file from the project",
  inputSchema: z.object({
    path: z.string(),
  }),
  needsApproval: true,
});

// Handle approval in UI
<ToolApprovalPanel
  pendingTools={messages
    .flatMap(m => m.parts)
    .filter(p => p.type === "tool_call")
    .map(p => ({ id: p.id, name: p.toolName }))}
  onApprove={(id) => addToolApprovalResponse({ id, approved: true })}
  onReject={(id) => addToolApprovalResponse({ id, approved: false })}
/>
```

---

## 6. via-gent Agent Tools Implementation

### 6.1 Coder Agent Tools

```typescript
// src/lib/agents/coder/tools.ts
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

export const coderTools = {
  readFile: toolDefinition({
    name: "read_file",
    description: "Read file contents from the project",
    inputSchema: z.object({
      path: z.string(),
    }),
    outputSchema: z.object({
      content: z.string(),
      exists: z.boolean(),
    }),
  }).client(async ({ path }) => {
    const content = await webcontainer.fs.readFile(path);
    return { content, exists: true };
  }),

  writeFile: toolDefinition({
    name: "write_file",
    description: "Write content to a file",
    inputSchema: z.object({
      path: z.string(),
      content: z.string(),
    }),
    needsApproval: true,
  }).client(async ({ path, content }) => {
    await webcontainer.fs.writeFile(path, content);
    return { success: true };
  }),

  runCommand: toolDefinition({
    name: "run_command",
    description: "Execute a shell command",
    inputSchema: z.object({
      command: z.string(),
    }),
    needsApproval: true,
  }).client(async ({ command }) => {
    const process = await webcontainer.spawn("bash", ["-c", command]);
    const output = await process.output;
    return { output };
  }),
};
```

### 6.2 Validator Agent Tools

```typescript
// src/lib/agents/validator/tools.ts
export const validatorTools = {
  typeCheck: toolDefinition({
    name: "type_check",
    description: "Run TypeScript type checking",
    inputSchema: z.object({
      files: z.array(z.string()).optional(),
    }),
  }).client(async ({ files }) => {
    const result = await webcontainer.spawn("npx", ["tsc", "--noEmit"]);
    return { passed: result.exitCode === 0 };
  }),

  lintCode: toolDefinition({
    name: "lint_code",
    description: "Run ESLint on code",
    inputSchema: z.object({
      fix: z.boolean().default(false),
    }),
  }).client(async ({ fix }) => {
    const args = fix ? ["eslint", ".", "--fix"] : ["eslint", "."];
    const result = await webcontainer.spawn("npx", args);
    return { passed: result.exitCode === 0 };
  }),

  runTests: toolDefinition({
    name: "run_tests",
    description: "Run test suite",
    inputSchema: z.object({
      coverage: z.boolean().default(false),
    }),
  }).client(async ({ coverage }) => {
    const args = coverage ? ["vitest", "--coverage"] : ["vitest"];
    const result = await webcontainer.spawn("npx", args);
    return { passed: result.exitCode === 0 };
  }),
};
```

---

## 7. Tool Result Formatting

### 7.1 Standard Result Structure

```typescript
// Success result
{
  success: true,
  data: any,
  metadata?: {
    duration: number;
    timestamp: string;
  }
}

// Error result
{
  success: false,
  error: string,
  code?: string;
}

// Tool execution with result
addToolResult({
  toolCallId: "tool_123",
  tool: "create_file",
  output: { success: true, path: "/src/index.ts" },
  state: "output-available",
});
```

### 7.2 Async Tool Execution

```typescript
const readFile = readFileDef.client(async ({ path }) => {
  try {
    // Async operation
    const content = await webcontainer.fs.readFile(path);
    
    return {
      success: true,
      content,
      metadata: {
        size: content.length,
        readAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: "FILE_READ_ERROR",
    };
  }
});
```

---

## 8. Error Handling

### 8.1 Tool Error Patterns

```typescript
const riskyOperation = toolDefinition({
  name: "risky_operation",
  description: "Perform a potentially risky operation",
  inputSchema: z.object({
    force: z.boolean().default(false),
  }),
}).client(async ({ force }) => {
  try {
    const result = await webcontainer.fs.performOperation();
    return { success: true, result };
  } catch (error) {
    // Return error in tool result format
    return {
      success: false,
      error: error.message,
      code: "OPERATION_FAILED",
      details: error.stack,
    };
  }
});
```

### 8.2 Validation Errors

```typescript
// Zod validation happens automatically
const invalidInput = { path: "" }; // Empty path

// This will throw before reaching the client implementation
// Error: "String must contain at least 1 character(s)"
```

---

## 9. Performance Optimization

### 9.1 Tool Batching

```typescript
// Batch multiple file operations
const batchWriteDef = toolDefinition({
  name: "batch_write_files",
  description: "Write multiple files at once",
  inputSchema: z.object({
    files: z.array(z.object({
      path: z.string(),
      content: z.string(),
    })).max(50), // Limit batch size
  }),
}).client(async ({ files }) => {
  const results = await Promise.all(
    files.map(file => 
      webcontainer.fs.writeFile(file.path, file.content)
        .then(() => ({ path: file.path, success: true }))
        .catch(error => ({ path: file.path, success: false, error: error.message }))
    )
  );
  return { results };
});
```

### 9.2 Caching Pattern

```typescript
const cachedReadFile = toolDefinition({
  name: "read_file_cached",
  description: "Read file with caching",
  inputSchema: z.object({
    path: z.string(),
    forceRefresh: z.boolean().default(false),
  }),
}).client(async ({ path, forceRefresh }) => {
  // Check cache first
  if (!forceRefresh && fileCache.has(path)) {
    return { content: fileCache.get(path), cached: true };
  }
  
  // Read from disk
  const content = await webcontainer.fs.readFile(path);
  
  // Update cache
  fileCache.set(path, content);
  
  return { content, cached: false };
});
```

---

## 10. Testing Tools

### 10.1 Tool Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { readFileDef } from "@/tools";

describe("readFile tool", () => {
  it("should read existing file", async () => {
    const readFile = readFileDef.client(async ({ path }) => {
      const content = await webcontainer.fs.readFile(path);
      return { content, exists: true };
    });

    const result = await readFile({ path: "/src/index.ts" });
    
    expect(result.success).toBe(true);
    expect(result.exists).toBe(true);
    expect(typeof result.content).toBe("string");
  });

  it("should handle missing files", async () => {
    const readFile = readFileDef.client(async ({ path }) => {
      try {
        const content = await webcontainer.fs.readFile(path);
        return { content, exists: true };
      } catch {
        return { content: null, exists: false };
      }
    });

    const result = await readFile({ path: "/nonexistent.ts" });
    
    expect(result.success).toBe(true);
    expect(result.exists).toBe(false);
  });
});
```

---

## 11. Source References

1. **Tool Definition Guide**: https://github.com/tanstack/ai/blob/main/docs/guides/client-tools.md
2. **Server Tools**: https://github.com/tanstack/ai/blob/main/docs/guides/server-tools.md
3. **Tool Architecture**: https://github.com/tanstack/ai/blob/main/docs/guides/tool-architecture.md
4. **Tools Overview**: https://github.com/tanstack/ai/blob/main/docs/guides/tools.md
5. **API Reference**: https://github.com/tanstack/ai/blob/main/docs/reference/interfaces/Tool.md

---

## 12. Next Steps for via-gent Implementation

### Phase 1: Core Tools (Week 1)
1. Define file operation tools (read, write, delete, search)
2. Implement WebContainers integration
3. Add tool approval UI
4. Test tool execution flow

### Phase 2: Agent-Specific Tools (Week 2)
1. Coder agent tools (file operations, command execution)
2. Validator agent tools (type checking, linting, testing)
3. Orchestrator tools (agent handoff, task management)
4. Asset-Gen tools (image/video generation)

### Phase 3: Tool Orchestration (Week 3)
1. Tool chaining between agents
2. State synchronization via tools
3. Tool result caching
4. Performance optimization

---

**Status:** ✅ Research Complete
**Confidence:** High
**Implementation Ready:** Yes
