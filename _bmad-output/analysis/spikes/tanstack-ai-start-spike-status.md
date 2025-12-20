# Spike Status: TanStack AI + Start Integration

**Date:** 2025-12-10
**Updated:** 2025-12-10T03:00:00+07:00
**Status:** ✅ VALIDATED
**Author:** BMad Master

## Summary

Spike successfully validates TanStack AI 0.0.3 + TanStack Start 1.140.0 integration patterns.

## Validated Configuration

### Package Versions (Latest)
```json
{
  "@tanstack/ai": "^0.0.3",
  "@tanstack/ai-react": "^0.0.3",
  "@tanstack/ai-client": "^0.0.3",
  "@tanstack/ai-gemini": "^0.0.3",
  "@tanstack/react-router": "^1.140.0",
  "@tanstack/react-start": "^1.140.0",
  "@tanstack/router-plugin": "^1.140.0",
  "zod": "^4.1.11",
  "vite": "^7.0.0",
  "vinxi": "^0.5.6"
}
```

### Validated API Patterns

#### 1. Gemini Adapter (0.0.3)
```typescript
import { createGemini } from '@tanstack/ai-gemini'

// Explicit API key (typed correctly)
const adapter = createGemini(apiKey)

// Or use gemini() for auto-detection from GEMINI_API_KEY env var
import { gemini } from '@tanstack/ai-gemini'
const adapter = gemini() // reads from process.env.GEMINI_API_KEY
```

#### 2. Server Route with Handlers
```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // handler logic
        return toStreamResponse(stream)
      },
    },
  },
})
```

#### 3. Tool Definitions
```typescript
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const myToolDef = toolDefinition({
  name: 'my_tool',
  description: 'Tool description',
  inputSchema: z.object({ param: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})

// Server implementation
const myTool = myToolDef.server(async ({ param }) => {
  return { result: '...' }
})
```

#### 4. Chat with Tools
```typescript
import { chat, toStreamResponse } from '@tanstack/ai'

const stream = chat({
  adapter,
  model: 'gemini-2.0-flash',
  messages,
  tools: [myTool],
  systemPrompts: ['You are a helpful assistant'],
})

return toStreamResponse(stream)
```

#### 5. Client useChat
```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'

const { messages, sendMessage, isLoading, error } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
})

// sendMessage takes a string
await sendMessage('Hello')
```

## Validation Results

| Criterion | Status |
|-----------|--------|
| `pnpm typecheck` passes | ✅ |
| Dev server starts | ✅ |
| Route tree generates | ✅ |
| Tool definitions compile | ✅ |
| Gemini adapter types correct | ✅ |

## Key Learnings

1. **Use `createGemini(apiKey)` for explicit key** - The `gemini()` function reads from env vars automatically
2. **Server routes use `server.handlers` pattern** - Not `createAPIFileRoute` (deprecated/removed)
3. **Zod 4.x required** - TanStack AI uses `toJSONSchema` from Zod 4
4. **Vite 7.x required** - TanStack Start 1.140.0 peer dependency
5. **Vinxi used for dev server** - Not direct vite commands

## Next Steps

1. ✅ Spike validation complete
2. ➡️ Port patterns to via-gent main codebase
3. ➡️ Execute remediation clusters in order: 2 → 5 → 4 → 3 → 1

## References

- `/tanstack/ai` Context7 docs
- `/websites/tanstack_start` Context7 docs
- TanStack AI GitHub: https://github.com/tanstack/ai
