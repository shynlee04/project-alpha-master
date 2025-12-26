# TanStack AI SDK - Knowledge Synthesis
**Date**: 2025-12-27
**Source**: MCP Research (Context7, Brave Search)
**Purpose**: Establish correct patterns for AI agent implementation

---

## Executive Summary

TanStack AI is a **provider-agnostic, type-safe AI SDK** for building AI applications. It provides:
- Unified interface across multiple AI providers (OpenAI, Anthropic, Ollama, Gemini)
- Full TypeScript type safety for tools and responses
- Chat completion with streaming (SSE)
- Isomorphic tools (server and client execution)
- Approval flow for dangerous operations

---

## Core Concepts

### 1. Provider Adapters

TanStack AI uses adapters to connect to different AI providers:

```typescript
import { openaiText } from "@tanstack/ai-openai";
import { anthropicText } from "@tanstack/ai-anthropic";
import { geminiText } from "@tanstack/ai-gemini";

// OpenRouter compatibility (uses OpenAI adapter with custom baseURL)
const adapter = openaiText("gpt-4o", {
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": "https://your-app.com",
    "X-Title": "Your App"
  }
});
```

### 2. The `useChat` Hook (React)

Primary hook for building chat interfaces:

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";

const { 
  messages,           // Array of chat messages
  sendMessage,        // Send user message
  isLoading,          // True while waiting for response
  addToolApprovalResponse  // Approve/reject tool calls
} = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools,  // Client-side tools (optional)
});
```

### 3. Message Structure

Messages contain `parts` that represent different content types:

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  parts: Part[];
}

interface Part {
  type: 'text' | 'tool-call' | 'tool-result';
  // For tool-call:
  name?: string;
  arguments?: Record<string, unknown>;
  state?: 'pending' | 'running' | 'success' | 'error' | 'approval-requested';
  approval?: { id: string };  // When needsApproval: true
}
```

---

## Tool Architecture

### Defining Tools

Tools are defined using `toolDefinition()`:

```typescript
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

const readFileTool = toolDefinition({
  name: 'read_file',
  description: 'Read content from a file in the workspace',
  inputSchema: z.object({
    path: z.string().describe('File path relative to project root')
  }),
  outputSchema: z.object({
    content: z.string(),
    encoding: z.string()
  })
});
```

### Server-Side Tools

Execute on the server (API route):

```typescript
const readFileServer = readFileTool.server(async ({ path }) => {
  const content = await fs.promises.readFile(path, 'utf-8');
  return { content, encoding: 'utf-8' };
});
```

### Client-Side Tools

Execute on the client (browser):

```typescript
const readFileClient = readFileTool.client(async ({ path }) => {
  // Uses LocalFSAdapter in browser
  const result = await localAdapter.readFile(path);
  return { content: result.content, encoding: 'utf-8' };
});
```

### Tools Requiring Approval

For dangerous operations (write, delete, execute):

```typescript
const writeFileTool = toolDefinition({
  name: 'write_file',
  description: 'Write content to a file',
  needsApproval: true,  // <-- CRITICAL: Triggers approval flow
  inputSchema: z.object({
    path: z.string(),
    content: z.string()
  }),
  outputSchema: z.object({
    success: z.boolean()
  })
});
```

---

## Approval Flow

### How It Works

1. AI requests tool that has `needsApproval: true`
2. Tool call enters `state: 'approval-requested'`
3. Client renders approval UI using `part.approval`
4. User clicks Approve/Deny
5. Call `addToolApprovalResponse({ id, approved })`
6. Tool executes (if approved) or returns rejection

### Implementation Pattern

```typescript
function ChatComponent() {
  const { messages, addToolApprovalResponse } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part) => {
            // Check for approval requests
            if (
              part.type === "tool-call" &&
              part.state === "approval-requested" &&
              part.approval
            ) {
              return (
                <ApprovalOverlay
                  key={part.id}
                  toolName={part.name}
                  arguments={part.arguments}
                  onApprove={() =>
                    addToolApprovalResponse({
                      id: part.approval!.id,
                      approved: true,
                    })
                  }
                  onReject={() =>
                    addToolApprovalResponse({
                      id: part.approval!.id,
                      approved: false,
                    })
                  }
                />
              );
            }
            // Render other parts...
          })}
        </div>
      ))}
    </div>
  );
}
```

---

## Server API Route (TanStack Start)

### Pattern for Chat Endpoint

```typescript
// src/routes/api/chat.ts
import { chat, toStreamResponse } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, apiKey, modelId, providerId } = await request.json();
        
        // Create adapter with user's API key
        const adapter = openaiText(modelId, {
          apiKey,
          baseURL: getBaseURL(providerId)  // OpenRouter, OpenAI, etc.
        });

        // Run chat with streaming
        const stream = chat({
          adapter,
          messages,
          tools: [], // Server-side tools if any
        });

        return toStreamResponse(stream);
      }
    }
  }
});
```

### Alternative: createServerFn Pattern

```typescript
import { createServerFn } from "@tanstack/react-start";

const chatFn = createServerFn()
  .inputValidator((data: ChatInput) => data)
  .handler(async function* ({ data }) {
    const { messages, apiKey, modelId } = data;
    
    const adapter = openaiText(modelId, { apiKey });
    
    for await (const chunk of chatStream({ adapter, messages })) {
      yield chunk;
    }
  });
```

---

## Client-Side Integration

### Complete Chat Panel Pattern

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools } from "@tanstack/ai-client";

export function AgentChatPanel() {
  // Get API key from credential vault (client-side storage)
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  useEffect(() => {
    credentialVault.getCredentials('openrouter').then(setApiKey);
  }, []);

  // Define client-side tools
  const readFile = readFileDef.client(async ({ path }) => {
    const adapter = localAdapterRef.current;
    if (!adapter) throw new Error('No workspace');
    const result = await adapter.readFile(path);
    return { content: result.content };
  });

  const writeFile = writeFileDef.client(async ({ path, content }) => {
    const adapter = localAdapterRef.current;
    await adapter.writeFile(path, content);
    eventBus.emit('file:changed', { path });
    return { success: true };
  });

  const tools = clientTools(readFile, writeFile);

  // Connect to chat
  const {
    messages,
    sendMessage,
    isLoading,
    addToolApprovalResponse
  } = useChat({
    connection: fetchServerSentEvents("/api/chat", {
      body: { apiKey, modelId, providerId }  // Pass to server
    }),
    tools,
  });

  return (
    <ChatInterface
      messages={messages}
      onSend={sendMessage}
      isLoading={isLoading}
      onApprove={(id) => addToolApprovalResponse({ id, approved: true })}
      onReject={(id) => addToolApprovalResponse({ id, approved: false })}
    />
  );
}
```

---

## Coding Agent Tools Definition

For Via-gent's AI coding agent, define these tools:

### read_file

```typescript
export const readFileDef = toolDefinition({
  name: 'read_file',
  description: 'Read the content of a file from the project workspace. Use this to understand existing code or configuration.',
  inputSchema: z.object({
    path: z.string().describe('File path relative to project root, e.g., "src/index.ts"')
  }),
  outputSchema: z.object({
    content: z.string(),
    size: z.number(),
    lastModified: z.string().optional()
  })
});
```

### write_file

```typescript
export const writeFileDef = toolDefinition({
  name: 'write_file',
  description: 'Create or update a file in the project workspace. Use this to implement features or fix bugs.',
  needsApproval: true,  // User must approve writes
  inputSchema: z.object({
    path: z.string().describe('File path relative to project root'),
    content: z.string().describe('Complete file content to write')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    bytesWritten: z.number().optional()
  })
});
```

### execute_command

```typescript
export const executeCommandDef = toolDefinition({
  name: 'execute_command',
  description: 'Run a shell command in the project terminal. Use for installing packages, running tests, or building the project.',
  needsApproval: true,  // User must approve commands
  inputSchema: z.object({
    command: z.string().describe('Shell command to execute, e.g., "npm install express"')
  }),
  outputSchema: z.object({
    exitCode: z.number(),
    stdout: z.string(),
    stderr: z.string()
  })
});
```

### list_files

```typescript
export const listFilesDef = toolDefinition({
  name: 'list_files',
  description: 'List files and directories in a path. Use to explore project structure.',
  inputSchema: z.object({
    path: z.string().describe('Directory path to list'),
    recursive: z.boolean().optional().describe('Include subdirectories')
  }),
  outputSchema: z.object({
    entries: z.array(z.object({
      name: z.string(),
      type: z.enum(['file', 'directory']),
      size: z.number().optional()
    }))
  })
});
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Using useChat without connection

```typescript
// DON'T DO THIS
const { messages } = useChat({
  model: 'gpt-4o'  // This doesn't work in TanStack AI
});
```

### ✅ CORRECT: Always specify connection

```typescript
const { messages } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
});
```

### ❌ WRONG: Passing apiKey in connection URL

```typescript
// DON'T DO THIS - Security risk
fetchServerSentEvents("/api/chat?apiKey=" + apiKey)
```

### ✅ CORRECT: Pass in request body

```typescript
fetchServerSentEvents("/api/chat", {
  body: { apiKey, modelId }
})
```

### ❌ WRONG: Accessing IndexedDB on server

```typescript
// Server route - THIS CRASHES
export async function POST() {
  const apiKey = await credentialVault.getCredentials('openrouter');
  // IndexedDB doesn't exist on server!
}
```

### ✅ CORRECT: Client sends apiKey in request

```typescript
// Client
const apiKey = await credentialVault.getCredentials('openrouter');
sendMessage({ content, body: { apiKey } });

// Server
export async function POST({ request }) {
  const { apiKey } = await request.json();
}
```

---

## Integration with Via-gent Architecture

### State Flow

```
User Input
    ↓
useChat.sendMessage()
    ↓
POST /api/chat (with apiKey, modelId)
    ↓
TanStack AI chat() with adapter
    ↓
SSE Stream Response
    ↓
useChat updates messages
    ↓
If tool-call with needsApproval:
    → Render ApprovalOverlay
    → User approves/rejects
    → addToolApprovalResponse()
    → Tool executes on client
    ↓
Result shown in chat
```

### Event Bus Integration

When tools execute, emit events for UI sync:

```typescript
// After write_file tool executes
eventBus.emit('file:changed', { path, size, timestamp });

// FileTree component subscribes
useEffect(() => {
  const unsubscribe = eventBus.on('file:changed', ({ path }) => {
    refreshFolder(dirname(path));
  });
  return unsubscribe;
}, []);
```

---

## References

- [TanStack AI Documentation](https://tanstack.com/ai/latest/docs)
- [TanStack AI GitHub](https://github.com/TanStack/ai)
- [Tool Architecture Guide](https://tanstack.com/ai/latest/docs/guides/tool-architecture)
- [Tool Approval Guide](https://tanstack.com/ai/latest/docs/guides/tool-approval)
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
