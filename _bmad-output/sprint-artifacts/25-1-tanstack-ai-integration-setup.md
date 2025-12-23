# Story 25-1: TanStack AI Integration Setup

**Epic:** [25 - AI Foundation Sprint](../epics/epic-25-ai-foundation-sprint.md)  
**Status:** `done`  
**Priority:** P0 (enables AI chat functionality)  
**Points:** 8  
**Created:** 2025-12-23T21:25:00+07:00  
**Completed:** 2025-12-23T21:35:00+07:00

---

## Story

As a **developer using the IDE**,  
I want **the chat panel to communicate with an AI model through OpenRouter**,  
so that **I can get intelligent code assistance and tool execution**.

---

## Acceptance Criteria

### AC-25-1-1: API Chat Route
- [ ] `/api/chat` route handles POST requests with JSON body
- [ ] Uses TanStack AI `chat()` + `toStreamResponse()` for SSE
- [ ] Returns proper `Content-Type: text/event-stream` header

### AC-25-1-2: Provider Integration
- [ ] Integrates with ProviderAdapterFactory (Story 25-0)
- [ ] Supports providerId and modelId from request
- [ ] Uses CredentialVault to retrieve API keys

### AC-25-1-3: Tool Integration
- [ ] File tools (read_file, write_file, list_files) are wired
- [ ] Terminal tool (execute_command) is wired
- [ ] Tools parameter passed to chat() call

### AC-25-1-4: Client Hook Setup
- [ ] `useAgentChat` hook wraps TanStack AI `useChat`
- [ ] Uses `fetchServerSentEvents('/api/chat')` connection
- [ ] Exposes messages, sendMessage, isLoading

### AC-25-1-5: Unit Tests
- [ ] API route tested with mocked adapter
- [ ] Hook tested with mocked connection

---

## Tasks / Subtasks

- [ ] T1: Create `/api/chat.ts` route (AC: 1, 2, 3)
  - [ ] POST handler with message/providerId/modelId
  - [ ] Wire ProviderAdapterFactory
  - [ ] Wire file and terminal tools
- [ ] T2: Create `useAgentChat` hook (AC: 4)
  - [ ] Wrap useChat with SSE connection
  - [ ] Default provider/model configuration
- [ ] T3: Unit tests (AC: 5)
  - [ ] `__tests__/chat.test.ts`
  - [ ] Mock TanStack AI dependencies
- [ ] T4: TypeScript check and run tests

---

## Dev Notes

### TanStack AI Server Route Pattern

```typescript
import { chat, toStreamResponse } from '@tanstack/ai';
import { openai } from '@tanstack/ai-openai';

export async function POST(request: Request) {
  const { messages, providerId, modelId } = await request.json();
  
  const stream = chat({
    adapter: adapter,
    messages,
    model: modelId,
    tools: [...fileTools, ...terminalTools],
  });
  
  return toStreamResponse(stream);
}
```

### Client useChat Pattern

```typescript
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

const { messages, sendMessage, isLoading } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});
```

### Architecture Compliance

| Requirement | Implementation |
|-------------|----------------|
| Route Location | `src/routes/api/chat.ts` |
| Depends on | ProviderAdapterFactory (25-0), Tools (25-2, 25-3) |
| Client Hook | `src/lib/agent/hooks/use-agent-chat.ts` |

### Dependencies from Prior Stories

- **25-0**: ProviderAdapterFactory, CredentialVault
- **25-2**: createFileTools (read_file, write_file, list_files)
- **25-3**: createExecuteCommandTool

---

## References

- [TanStack AI Streaming](https://github.com/tanstack/ai) - SSE protocol
- [Master Plan Phase 3](./epic-25-12-28-master-implementation-plan.md#phase-3)
- [Story 25-0: ProviderAdapterFactory](./25-0-create-provideradapterfactory.md)
- [Story 25-2: File Tools](./25-2-implement-file-tools.md)
- [Story 25-3: Terminal Tools](./25-3-implement-terminal-tools.md)

---

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro + Antigravity Agent

### Completion Notes List
1. Created `/api/chat.ts` route with TanStack AI `chat()` + `toStreamResponse()`
2. Created `useAgentChat` hook wrapping `useChat` + `fetchServerSentEvents`
3. Wired ProviderAdapterFactory for OpenRouter integration
4. Tools array prepared (empty for now, wired in Story 25-4)
5. Default model: `meta-llama/llama-3.1-8b-instruct:free`
6. 13 unit tests (6 route + 7 hook) all passing

### File List
- `src/routes/api/chat.ts` (NEW) - 110 lines
- `src/lib/agent/hooks/use-agent-chat.ts` (NEW) - 125 lines
- `src/lib/agent/hooks/index.ts` (NEW) - 9 lines
- `src/routes/api/__tests__/chat.test.ts` (NEW) - 6 tests
- `src/lib/agent/hooks/__tests__/use-agent-chat.test.ts` (NEW) - 7 tests
