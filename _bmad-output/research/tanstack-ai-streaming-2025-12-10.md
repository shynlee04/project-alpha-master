# TanStack AI Streaming - Technical Research

**Research Date:** 2025-12-10
**Research Type:** Technical - High Priority
**Purpose:** Implementation guide for streaming responses with fetchServerSentEvents

---

## Executive Summary

TanStack AI provides seamless streaming through `fetchServerSentEvents` and custom stream processors. This enables real-time chat experiences with incremental message updates, tool call streaming, and partial response rendering in via-gent's browser-based environment.

**Key Findings:**
- ✅ Built-in SSE support via `fetchServerSentEvents`
- ✅ Incremental message updates without re-renders
- ✅ Custom stream processing for specialized needs
- ✅ Real-time tool call streaming
- ✅ Error recovery during streams

---

## 1. Streaming Architecture

### 1.1 Server-Sent Events Flow

```
Client (useChat)
    ↓ POST /api/chat
Server (TanStack Start)
    ↓ Stream Response
SSE Connection
    ↓ Incremental Chunks
Client Updates UI
    ↓ Real-time
User Sees Streaming Response
```

### 1.2 Stream Chunk Types

```typescript
interface StreamChunk {
  type: "content" | "tool_call" | "tool_result" | "error" | "done";
  delta?: string;           // Incremental content
  id?: string;              // Message/tool ID
  toolName?: string;        // For tool calls
  content?: any;            // Tool result data
  error?: string;           // Error message
}

// Example chunk processing
for await (const chunk of stream) {
  if (chunk.type === "content") {
    // Update message content incrementally
    updateMessageContent(chunk.id, chunk.delta);
  } else if (chunk.type === "tool_call") {
    // Show tool call in progress
    showToolCall(chunk.toolName, chunk.id);
  } else if (chunk.type === "tool_result") {
    // Display tool result
    showToolResult(chunk.id, chunk.content);
  }
}
```

---

## 2. Basic Streaming Setup

### 2.1 Client-Side Configuration

```typescript
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";

const { messages, sendMessage, isLoading } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
});

// Messages update in real-time as chunks arrive
// No additional configuration needed!
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/streaming.md

### 2.2 Server-Side Implementation

```typescript
// src/routes/api.chat.ts
import { chat, toServerSentEventsStream } from "@tanstack/ai";
import { openai } from "@tanstack/ai-openai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = chat({
    adapter: openai(),
    messages,
    model: "gpt-4o",
    tools: serverTools,
  });

  // Convert to SSE stream
  return toServerSentEventsStream(stream);
}

// Function signature
function toServerSentEventsStream(stream): Response;
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/streaming.md

---

## 3. Custom Stream Processing

### 3.1 Custom Stream Function

```typescript
import { stream } from "@tanstack/ai-react";

const { messages } = useChat({
  connection: stream(async (messages, data, signal) => {
    // Custom streaming implementation
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages, ...data }),
      signal, // Support cancellation
    });

    // Return async iterable for custom processing
    return processCustomStream(response);
  }),
});

// Custom stream processor
async function* processCustomStream(response: Response) {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    
    // Custom processing
    const processed = customProcess(chunk);
    
    yield processed;
  }
}
```

**Source:** https://github.com/tanstack/ai/blob/main/docs/guides/streaming.md

### 3.2 Stream Callbacks

```typescript
const { messages, sendMessage, isLoading, error } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  
  // Stream event callbacks
  onChunk: (chunk) => {
    // Called for each chunk
    console.log("Stream chunk:", chunk);
  },
  
  onResponse: (response) => {
    // Called when response starts
    console.log("Response headers:", response.headers);
  },
  
  onFinish: (message) => {
    // Called when stream completes
    console.log("Stream finished:", message.id);
  },
  
  onError: (error) => {
    // Called on error
    console.error("Stream error:", error);
  },
});
```

---

## 4. Real-Time UI Updates

### 4.1 Incremental Message Rendering

```typescript
function ChatMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="messages">
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.role}`}>
          <div className="message-header">
            <span className="role">{message.role}</span>
            {message.parts?.map((part, idx) => {
              if (part.type === "text") {
                return (
                  <span key={idx} className="content">
                    {part.content}
                  </span>
                );
              }
              if (part.type === "thinking") {
                return (
                  <div key={idx} className="thinking">
                    💭 {part.content}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Messages update automatically as stream arrives
// No manual re-render needed!
```

### 4.2 Streaming Indicator

```typescript
function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  const { isLoading } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
    onChunk: () => setIsStreaming(true),
    onFinish: () => setIsStreaming(false),
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled || isLoading}
        placeholder={
          isStreaming ? "AI is typing..." : "Type a message..."
        }
      />
      {isStreaming && <StreamingIndicator />}
    </form>
  );
}

function StreamingIndicator() {
  return (
    <div className="streaming-indicator">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  );
}
```

---

## 5. Tool Call Streaming

### 5.1 Streaming Tool Calls

```typescript
// Tools execute and stream results in real-time
const stream = chat({
  adapter: openai(),
  messages,
  tools: [weatherTool, databaseTool],
});

for await (const chunk of stream) {
  if (chunk["type"] === "content") {
    // Stream text content
    appendToMessage(chunk.delta);
  } 
  else if (chunk["type"] === "tool_call") {
    // Stream tool call initiation
    console.log(`[Calling: ${chunk['toolCall']['function']['name']}]`);
  }
}
```

**Source:** https://github.com/tanstack/ai/blob/main/packages/python/tanstack-ai/README.md

### 5.2 Tool Result Streaming

```typescript
// Client-side tool execution with streaming
const createFileTool = toolDefinition({
  name: "create_file",
  description: "Create a file",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
}).client(async ({ path, content }) => {
  // Stream progress updates
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue({ progress: 0 });
      
      // Simulate progress
      setTimeout(() => controller.enqueue({ progress: 50 }), 100);
      setTimeout(() => controller.enqueue({ progress: 100 }), 200);
      
      // Complete
      controller.close();
    },
  });
  
  // Execute actual operation
  await webcontainer.fs.writeFile(path, content);
  
  return { success: true, path };
});
```

---

## 6. Error Recovery

### 6.1 Stream Interruption Handling

```typescript
const { messages, sendMessage, stop, isLoading, error } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  
  onError: (error) => {
    console.error("Stream error:", error);
    
    // Attempt recovery
    if (error.message.includes("network")) {
      // Retry after delay
      setTimeout(() => {
        sendMessage("Please continue");
      }, 1000);
    }
  },
});

// Manual stop/resume
<button 
  onClick={() => stop()} 
  disabled={!isLoading}
>
  Stop
</button>

<button 
  onClick={() => reload()} 
  disabled={isLoading}
>
  Resume
</button>
```

### 6.2 Connection Resilience

```typescript
// Auto-reconnect on disconnection
function useResilientChat() {
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const chat = useChat({
    connection: fetchServerSentEvents("/api/chat", {
      // Reconnect configuration
      retry: {
        attempts: 3,
        delay: 1000,
      },
    }),
    
    onError: (error) => {
      if (reconnectAttempts < 3) {
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          chat.reload();
        }, 1000 * Math.pow(2, reconnectAttempts));
      }
    },
  });
  
  return chat;
}
```

---

## 7. Performance Optimization

### 7.1 Message Batching

```typescript
// Batch UI updates for better performance
const batchedChat = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  
  // Custom stream processor for batching
  streamProcessor: {
    batchSize: 5,           // Update UI every 5 chunks
    batchDelay: 16,         // Or every 16ms (60fps)
  },
});
```

### 7.2 Virtual Scrolling for Large Chats

```typescript
import { FixedSizeList as List } from "react-window";

function VirtualizedMessageList({ messages }: { messages: UIMessage[] }) {
  const Item = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  );
  
  return (
    <List
      height={600}              // Container height
      itemCount={messages.length}
      itemSize={80}             // Item height
      width="100%"
    >
      {Item}
    </List>
  );
}
```

---

## 8. WebContainers Integration

### 8.1 Streaming Command Output

```typescript
const runCommandTool = toolDefinition({
  name: "run_command",
  description: "Execute a shell command",
  inputSchema: z.object({
    command: z.string(),
  }),
}).client(async ({ command }) => {
  const process = await webcontainer.spawn("bash", ["-c", command]);
  
  // Stream output in real-time
  const reader = process.output.getReader();
  const decoder = new TextDecoder();
  
  let output = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    output += chunk;
    
    // Emit partial output
    eventBus.emit("command:output", { chunk });
  }
  
  return { output, exitCode: process.exitCode });
});
```

### 8.2 File Write Streaming

```typescript
const writeFileTool = toolDefinition({
  name: "write_file",
  description: "Write content to a file",
  inputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
}).client(async ({ path, content }) => {
  // Stream write progress
  const chunkSize = 1024;
  const chunks = Math.ceil(content.length / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const chunk = content.slice(i * chunkSize, (i + 1) * chunkSize);
    await webcontainer.fs.writeFile(path, chunk);
    
    // Emit progress
    eventBus.emit("file:write-progress", {
      path,
      progress: ((i + 1) / chunks) * 100,
    });
    
    // Yield to event loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return { success: true, path };
});
```

---

## 9. Browser-Specific Considerations

### 9.1 SSE in WebContainers

```typescript
// SSE connection works in WebContainers
const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents("/api/chat"),
  // Additional headers if needed
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});
```

### 9.2 Memory Management

```typescript
// Prevent memory leaks with large streams
function ChatComponent() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  
  // Limit stored messages
  const MAX_MESSAGES = 1000;
  
  const { messages: streamMessages } = useChat({
    connection: fetchServerSentEvents("/api/chat"),
  });
  
  useEffect(() => {
    // Trim old messages
    if (streamMessages.length > MAX_MESSAGES) {
      setMessages(streamMessages.slice(-MAX_MESSAGES));
    } else {
      setMessages(streamMessages);
    }
  }, [streamMessages]);
  
  return <MessageList messages={messages} />;
}
```

---

## 10. Testing Streaming

### 10.1 Stream Testing

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chat } from "./Chat";

test("streams messages in real-time", async () => {
  const user = userEvent.setup();
  
  render(<Chat />);
  
  const input = screen.getByPlaceholderText("Type a message...");
  const sendButton = screen.getByRole("button", { name: "Send" });
  
  await user.type(input, "Hello");
  await user.click(sendButton);
  
  // Wait for streaming indicator
  await waitFor(() => {
    expect(screen.getByText("AI is typing...")).toBeInTheDocument();
  });
  
  // Wait for response
  await waitFor(() => {
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

---

## 11. Source References

1. **Streaming Guide**: https://github.com/tanstack/ai/blob/main/docs/guides/streaming.md
2. **React API**: https://github.com/tanstack/ai/blob/main/docs/api/ai-react.md
3. **Python Streaming**: https://github.com/tanstack/ai/blob/main/packages/python/tanstack-ai/README.md

---

## 12. Next Steps for via-gent Implementation

### Phase 1: Basic Streaming (Week 1)
1. Configure `fetchServerSentEvents` for all agents
2. Implement real-time message updates
3. Add streaming indicators in UI
4. Test stream stability

### Phase 2: Tool Streaming (Week 2)
1. Stream tool call execution
2. Add progress indicators for long operations
3. Implement command output streaming
4. Test file operation streaming

### Phase 3: Optimization (Week 3)
1. Add message batching
2. Implement virtual scrolling
3. Add connection resilience
4. Performance testing

---

**Status:** ✅ Research Complete
**Confidence:** High
**Implementation Ready:** Yes
