# API Standards (Client-Side)

> **Last Updated:** 2025-12-21  
> **Applies to:** Via-Gent (Project Alpha)

---

## Architecture Note

Via-Gent is **100% client-side**. There is no traditional REST API server. This document covers:

1. AI chat endpoint (SSE streaming)
2. Client-side tool definitions
3. External API integrations (LLM providers, GitHub)

---

## AI Chat Endpoint

```typescript
// src/routes/api/chat.ts
export const Route = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    const { messages, model } = await request.json();
    
    return tanstackAIStream({
      model: model || 'gemini-2.0-flash-exp',
      messages,
      tools: toolRegistry,
    });
  },
});
```

---

## Client Tools (TanStack AI)

```typescript
// src/lib/agent/tool-definitions.ts
export const toolRegistry = {
  readFile: {
    description: 'Read file contents from workspace',
    parameters: z.object({
      path: z.string().describe('Relative file path'),
    }),
    execute: async ({ path }) => {
      const content = await localFSAdapter.readFile(path);
      return { success: true, content };
    },
  },
  
  writeFile: {
    description: 'Write content to file',
    parameters: z.object({
      path: z.string(),
      content: z.string(),
    }),
    execute: async ({ path, content }) => {
      await localFSAdapter.writeFile(path, content);
      await syncManager.syncToWebContainer();
      return { success: true };
    },
  },
};
```

---

## Tool Result Format

```typescript
interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## External API Patterns

### LLM Providers (BYOK)

```typescript
// API key stored in localStorage, never server-side
const apiKey = localStorage.getItem('gemini_api_key');
```

### GitHub (PAT)

```typescript
// Personal Access Token for isomorphic-git
const token = await SecureStorage.get('github_pat');
await git.push({
  fs,
  http,
  dir: '/',
  onAuth: () => ({ username: token }),
});
```

---

## General Practices

- **No Traditional REST**: All logic client-side
- **SSE for AI**: Streaming responses via TanStack AI
- **BYOK**: Users provide their own API keys
- **Tool Results**: Consistent `ToolResult<T>` format
- **Zod Validation**: All tool parameters validated
