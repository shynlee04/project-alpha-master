# API Contracts

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent exposes **3 REST API endpoints** for server-side operations:

1. `/api/chat` - Chat completions with streaming
2. `/api/flashcards/generate` - Flashcard generation
3. `/api/quizzes/generate` - Quiz generation

All endpoints use **TanStack Router** file-based routing and support **SSE (Server-Sent Events)** streaming for AI responses.

---

## Endpoint: Chat Completions

### Route
```
POST /api/chat
```

### Location
`src/routes/api/chat.ts`

### Request

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  agentId: string;
  workspaceId: string;
  stream?: boolean;  // Default: true
}
```

### Response

**Streaming:** SSE (text/event-stream)

**Event Format:**
```
data: {"type":"token","content":"Hello","done":false}
data: {"type":"token","content":" world","done":false}
data: {"type":"done","done":true}
```

**Event Types:**
- `token` - Content chunk from LLM
- `tool_call` - Agent tool invocation
- `tool_result` - Tool execution result
- `error` - Error message
- `done` - Stream complete

### Tool Execution Flow

```
User Message
    ↓
/api/chat (streaming response)
    ↓
Agent analyzes request
    ↓
Tool invocation (if needed)
    ↓
Tool execution
    ↓
Tool result returned
    ↓
Agent response continues
    ↓
Stream complete
```

### Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid request (missing agent, invalid messages) |
| 401 | Unauthorized (missing API key) |
| 500 | Server error (LLM API failure) |

---

## Endpoint: Flashcard Generation

### Route
```
POST /api/flashcards/generate
```

### Location
`src/routes/api/flashcards/generate.ts`

### Request

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
interface FlashcardGenerateRequest {
  source: {
    type: 'notes' | 'knowledge' | 'text';
    content: string;
    sourceId?: string;
  };
  count: number;  // Number of flashcards to generate
  options?: {
    includeFront?: boolean;
    includeBack?: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}
```

### Response

**Status:** 200 OK

**Body:**
```typescript
interface FlashcardGenerateResponse {
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    source?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  }>;
}
```

### Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid source content |
| 500 | Generation failed (LLM error) |

---

## Endpoint: Quiz Generation

### Route
```
POST /api/quizzes/generate
```

### Location
`src/routes/api/quizzes/generate.ts`

### Request

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
interface QuizGenerateRequest {
  source: {
    type: 'notes' | 'knowledge' | 'text';
    content: string;
    sourceId?: string;
  };
  questionCount: number;
  options?: {
    questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}
```

### Response

**Status:** 200 OK

**Body:**
```typescript
interface QuizGenerateResponse {
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      id: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer';
      question: string;
      options?: string[];  // For multiple choice
      correctAnswer: string | number;
      explanation?: string;
    }>;
  };
}
```

### Error Handling

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid source content |
| 500 | Generation failed (LLM error) |

---

## Agent Tool Execution

During chat, agents can execute tools. These are **not direct API endpoints** but are invoked through the chat stream:

### Available Tools

| Tool | Purpose | Workspace Permissions |
|------|---------|------------------------|
| `read_file` | Read file contents | IDE, Knowledge, Notes, Study |
| `write_file` | Write/create files | IDE, Knowledge, Notes |
| `list_files` | List directory | IDE, Knowledge, Notes, Study |
| `execute_command` | Run shell command | IDE only |
| `synthesize` | Knowledge synthesis | Knowledge only |
| `process_pdf` | Process PDF document | Knowledge only |
| `process_url` | Ingest URL content | Knowledge only |
| `process_image` | Process image | Knowledge only |
| `search_notes` | Search notes | Notes only |

### Tool Call Format

```typescript
{
  "type": "tool_call",
  "tool": "read_file",
  "input": {
    "path": "/project/src/App.tsx"
  },
  "id": "call_123"
}
```

### Tool Result Format

```typescript
{
  "type": "tool_result",
  "tool": "read_file",
  "output": "file contents...",
  "error": null,
  "id": "call_123"
}
```

---

## Streaming Implementation

### SSE Event Stream (Client)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Handle event
    }
  }
}
```

---

## Authentication

**Current Status:** No authentication on API endpoints

**Design:** API keys are stored client-side in encrypted Dexie storage. Server-side endpoints run in the browser (via TanStack SSR) and have access to the same encrypted storage.

---

## Rate Limiting

**Current Status:** No rate limiting implemented

**Consideration:** LLM providers have their own rate limits (e.g., Gemini: 60 req/min). The UI respects these limits, but no server-side enforcement exists.

---

## CORS Configuration

**Development:** CORS enabled for local development

**Production:** Same-origin policy applies (deployed together)

**Vite Config:**
```typescript
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
```

---

## Deployment Considerations

### Node.js Deployment
- Uses built-in `fetch` API (Node 18+)
- Streams directly to client

### Cloudflare Workers
- Requires runtime compatibility checks
- May need adapter for WebContainer API

### Vercel Edge Functions
- Compatible with API routes
- Streaming supported

---

## Related Documentation

- [Agent Tool Execution](./state-management.md#agent-integration)
- [WebContainer Integration](./architecture.md#webcontainer-integration)
- [Architecture](./architecture.md)
