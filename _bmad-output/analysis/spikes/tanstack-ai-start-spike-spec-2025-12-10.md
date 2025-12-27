# TanStack AI + Start Spike Specification

**Created:** 2025-12-10  
**Phase:** 2 - Minimal Spike Validation  
**Status:** ✅ Validated (patterns aligned with spike implementation and retrospective)  
**Prerequisite:** Phase 1 Research (Completed)

---

## 1. Purpose

Before touching the via-gent codebase, create a **minimal standalone app** that validates TanStack AI + TanStack Start integration patterns identified in Phase 1 research.

This spike proves:
1. TanStack Start + TanStack AI streaming works correctly
2. Tool definitions execute correctly (`clientTools` + `serverTools`)
3. Gemini adapter connects properly via `@tanstack/ai-gemini`
4. Agentic cycle completes with tool results flowing back to UI

**Why a spike?**
- The previous remediation failed because integration patterns were understood in theory but not validated in practice
- A separate minimal app prevents code contamination and allows rapid iteration
- Validates understanding before complex refactoring

---

## 2. Scope

### In Scope

| Component | Description |
|-----------|-------------|
| TanStack Start app | Minimal SPA with single route |
| `/api/chat` endpoint | Server route using `chat()` + `toServerSentEventsStream()` |
| `useChat` hook | Client-side chat with `fetchServerSentEvents` |
| Tool definitions | 2-3 simple tools with `toolDefinition()` |
| Server tools | `.server()` implementations that return actual data |
| Client tools | `.client()` implementations for UI-only operations |
| Gemini adapter | `@tanstack/ai-gemini` with real API key |
| Streaming UI | Render streaming messages with tool call/result states |

### Out of Scope

- WebContainers integration (separate spike if needed)
- Monaco editor / xterm
- Domain APIs (AgentAPI, IDEAPI, etc.)
- Persistence / state management
- Authentication / multi-user
- Deployment

---

## 3. Technical Requirements

### 3.1 Dependencies (normalized to validated versions)

```json
{
  "dependencies": {
    "@tanstack/react-start": "^1.140.0",
    "@tanstack/react-router": "^1.140.0",
    "@tanstack/router-plugin": "^1.140.0",
    "@tanstack/ai": "^0.0.3",
    "@tanstack/ai-react": "^0.0.3",
    "@tanstack/ai-client": "^0.0.3",
    "@tanstack/ai-gemini": "^0.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^4.1.11"
  }
}
```

### 3.2 File Structure

```
spike-tanstack-ai/
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx          # Chat UI
│   │   └── api.chat.ts        # Server endpoint
│   └── routeTree.gen.ts
├── lib/
│   └── tools.ts               # Tool definitions
├── components/
│   └── Chat.tsx               # Chat component using useChat
├── app.config.ts
├── package.json
└── tsconfig.json
```

### 3.3 Tool Definitions

Define 2-3 simple tools to validate the pattern:

```typescript
// lib/tools.ts
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

// Server-executed tool
export const getTimeDef = toolDefinition({
  name: 'get_time',
  description: 'Get the current server time',
  inputSchema: z.object({
    timezone: z.string().optional().describe('Timezone (default: UTC)'),
  }),
  outputSchema: z.object({
    time: z.string(),
    timezone: z.string(),
  }),
})

// Client-executed tool
export const showNotificationDef = toolDefinition({
  name: 'show_notification',
  description: 'Show a notification to the user',
  inputSchema: z.object({
    message: z.string(),
    type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  }),
  outputSchema: z.object({
    shown: z.boolean(),
  }),
})

// Tool with user approval
export const dangerousActionDef = toolDefinition({
  name: 'dangerous_action',
  description: 'An action that requires user approval',
  inputSchema: z.object({
    action: z.string(),
  }),
  outputSchema: z.object({
    executed: z.boolean(),
    result: z.string(),
  }),
  needsApproval: true,
})
```

### 3.4 Server Endpoint (validated pattern)

```typescript
// src/routes/api/chat.ts (or api.chat.ts)
import { createFileRoute } from '@tanstack/react-router'
import { chat, toStreamResponse } from '@tanstack/ai'
import { createGemini } from '@tanstack/ai-gemini'
import { getTimeDef, showNotificationDef, dangerousActionDef } from '@/lib/tools'

// Server implementations
const serverTools = [
  getTimeDef.server(async ({ timezone }) => {
    const tz = timezone || 'UTC'
    const time = new Date().toLocaleString('en-US', { timeZone: tz })
    return { time, timezone: tz }
  }),

  // showNotification is client-only, pass definition for client execution
  showNotificationDef,

  dangerousActionDef.server(async ({ action }) => {
    // Simulated dangerous action
    return { executed: true, result: `Executed: ${action}` }
  }),
]

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()
        const apiKey = process.env.GEMINI_API_KEY

        if (!apiKey) {
          return new Response(JSON.stringify({ error: 'Missing API key' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const adapter = createGemini(apiKey)
        const stream = chat({
          adapter,
          model: 'gemini-2.0-flash',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Use tools when appropriate.' },
            ...messages,
          ],
          tools: serverTools,
          maxIterations: 5,
        })

        return toStreamResponse(stream)
      },
    },
  },
})
```

### 3.5 Client Component

```typescript
// components/Chat.tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { clientTools, createChatClientOptions } from '@tanstack/ai-client'
import { showNotificationDef } from '@/lib/tools'

// Client implementation
const showNotification = showNotificationDef.client(({ message, type }) => {
  // In real app, show toast notification
  console.log(`[${type.toUpperCase()}] ${message}`)
  alert(`${type}: ${message}`)
  return { shown: true }
})

const tools = clientTools(showNotification)

const chatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/chat'),
  tools,
})

export function Chat() {
  const { messages, sendMessage, isLoading } = useChat(chatOptions)

  return (
    <div>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}`}>
            <strong>{m.role}:</strong>
            {m.parts.map((part, i) => {
              if (part.type === 'text') return <span key={i}>{part.text}</span>
              if (part.type === 'tool-call') return (
                <div key={i} className="tool-call">
                  🔧 Calling: {part.toolCall.name}
                </div>
              )
              if (part.type === 'tool-result') return (
                <div key={i} className="tool-result">
                  ✅ Result: {JSON.stringify(part.result)}
                </div>
              )
              return null
            })}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement
          const value = input.value.trim()
          if (!value || isLoading) return
          void sendMessage(value)
          input.value = ''
        }}
      >
        <input name="message" placeholder="Ask something..." disabled={isLoading} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
```

---

## 4. Validation Criteria

The spike is successful when ALL of the following pass:

### 4.1 Build & Type Safety

- [ ] `pnpm typecheck` passes with 0 errors
- [ ] `pnpm build` completes successfully
- [ ] All tool inputs/outputs are fully typed

### 4.2 Streaming

- [ ] Chat messages stream incrementally (not all at once)
- [ ] UI updates as chunks arrive
- [ ] No console errors during streaming

### 4.3 Server Tools

- [ ] `get_time` tool is called when user asks for time
- [ ] Tool result appears in message stream
- [ ] Model uses tool result in its response

### 4.4 Client Tools

- [ ] `show_notification` executes on client when model calls it
- [ ] Notification is displayed to user
- [ ] Tool result is sent back to model

### 4.5 Agentic Cycle

- [ ] Model can call multiple tools in sequence
- [ ] Tool results feed back into model reasoning
- [ ] Final response incorporates tool outputs

### 4.6 Tool Approval (optional)

- [ ] `dangerous_action` tool triggers approval flow
- [ ] User can approve/reject
- [ ] Model handles approval response correctly

---

## 5. Test Prompts

Use these prompts to validate the spike:

| # | Prompt | Expected Behavior |
|---|--------|-------------------|
| 1 | "What time is it?" | Calls `get_time`, returns current time |
| 2 | "Show me a success notification saying 'Hello World'" | Calls `show_notification` on client |
| 3 | "What time is it in Tokyo, and show me an info notification with the result" | Calls both tools, chains results |
| 4 | "Execute dangerous action: test" | Triggers approval flow (if implemented) |

---

## 6. Success Criteria

| Criterion | Weight | Status |
|-----------|--------|--------|
| Builds without errors | Required | ⬜ |
| Type-safe end-to-end | Required | ⬜ |
| Server tools execute | Required | ⬜ |
| Client tools execute | Required | ⬜ |
| Streaming works | Required | ⬜ |
| Agentic cycle completes | Required | ⬜ |
| Tool approval works | Optional | ⬜ |

**Spike passes when all Required criteria are met.**

---

## 7. Next Steps After Spike

If spike passes:

1. **Document learnings** in `docs/analysis/spikes/tanstack-ai-start-spike-results-2025-12-XX.md`
2. **Update cluster specs** with validated patterns
3. **Proceed to Cluster 2** (Route Structure Consolidation)
4. **Execute clusters in order:** 2 → 5 → 4 → 3 → 1

If spike fails:

1. **Document blockers** and issues
2. **Research solutions** or file upstream issues
3. **Iterate on spike** until patterns are validated
4. **Do NOT proceed to cluster execution** until spike passes

---

## 8. References

- Phase 1 Research: `docs/analysis/research/technical-via-gent-client-side-agentic-ide-stack-research-2025-12-10.md`
- TanStack AI Tools: `docs/research/tanstack-ai-tools-2025-12-10.md`
- TanStack AI useChat: `docs/research/tanstack-ai-usechat-2025-12-10.md`
- TanStack AI Streaming: `docs/research/tanstack-ai-streaming-2025-12-10.md`
- Remediation Roadmap: `.bmad/custom/src/modules/cham/status/2025-12-09-v2/remediation-roadmap.md`

---

**Spike Author:** BMad Master  
**Review Required:** Apple  
**Estimated Duration:** 1-2 days
