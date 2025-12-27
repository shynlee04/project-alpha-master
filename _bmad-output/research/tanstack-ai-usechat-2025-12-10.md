# TanStack AI useChat Integration Patterns

**Date**: 2025-12-10
**Source**: Context7 /tanstack/ai, DeepWiki TanStack/ai
**Status**: MCP-VALIDATED ✅

## Complete useChat Hook Pattern

### Basic Setup
```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { 
  clientTools, 
  createChatClientOptions, 
  type InferChatMessages 
} from "@tanstack/ai-client";

function ChatComponent() {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
    initialMessages: loadedHistory,
  });

  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error,
    setMessages,
    clear,
    addToolApprovalResponse 
  } = useChat(chatOptions);

  return <div>{/* Chat UI */}</div>;
}
```

### Persistence Pattern
```typescript
const { messages, sendMessage } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  initialMessages: loadFromIndexedDB(), // Load on mount
  onFinish: (message) => {
    saveToIndexedDB(messages); // Save after each response
  },
});
```

### Client Tools Pattern
```typescript
// Define tool
const updateUIDef = toolDefinition({
  name: "updateUI",
  description: "Update UI element",
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
});

// Create client implementation
const updateUI = updateUIDef.client((input) => {
  setNotification(input.message);
  return { success: true };
});

// Create tools array
const tools = clientTools(updateUI);

// Pass to useChat
const { messages } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools,
});
```

### Server Endpoint Pattern
```typescript
// api.chat.ts
import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { gemini } from "@tanstack/ai-google";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = chat({
    adapter: gemini(),
    model: "gemini-2.0-flash",
    messages,
    tools: [serverTool1, serverTool2], // .server() implementations
    maxIterations: 10,
  });

  return toServerSentEventsStream(stream);
}
```

## UseChatOptions Interface
```typescript
interface UseChatOptions {
  connection: ConnectionAdapter; // Required
  initialMessages?: UIMessage[];
  id?: string;
  body?: Record<string, any>;
  tools?: ClientTool[];
  
  // Callbacks
  onResponse?: (response?: Response) => void;
  onChunk?: (chunk: StreamChunk) => void;
  onFinish?: (message: UIMessage) => void;
  onError?: (error: Error) => void;
}
```

## UseChatReturn Interface
```typescript
interface UseChatReturn {
  messages: UIMessage[];
  sendMessage: (content: string) => Promise<void>;
  append: (message) => Promise<void>;
  reload: () => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  error: Error | undefined;
  setMessages: (messages) => void;
  clear: () => void;
  addToolApprovalResponse: (toolCallId, result) => void;
}
```

## Via-Gent Implementation Status

**Current**: Custom `useAgentChat.ts` (383 lines)
**Required**: Replace with official `@tanstack/ai-react` useChat

### Migration Plan
1. Create `src/lib/chat-client.ts` with official pattern
2. Update components to use new hook
3. Add IndexedDB persistence via `initialMessages` + `onFinish`
4. Remove custom hook after migration

## References
- [TanStack AI Docs](https://tanstack.com/ai/latest)
- [useChat API](https://tanstack.com/ai/latest/docs/api/ai-react)
- [Tool Architecture](https://tanstack.com/ai/latest/docs/guides/tool-architecture)
