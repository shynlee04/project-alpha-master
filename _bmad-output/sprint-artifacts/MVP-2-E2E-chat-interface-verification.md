# Story: MVP-2 E2E Verification - Chat Interface with Streaming

**Story ID:** MVP-2-E2E  
**Epic:** Epic 25 - AI Foundation Sprint  
**Sprint:** S-2025-12-27 (MVP Completion)  
**Created:** 2025-12-27T08:21:00+07:00  
**Status:** ready-for-dev
**Depends On:** MVP-1 (done ✅)

---

## User Story

**As a** Via-gent developer,  
**I want to** verify that all Chat Interface with Streaming acceptance criteria are working end-to-end,  
**So that** we can confirm MVP-2 is complete and unblock subsequent MVP stories (MVP-3 File Tools).

---

## Acceptance Criteria

### AC-1: Chat Panel Display
**Given** an agent is selected/active  
**When** user views the IDE  
**Then** the chat panel should be visible with message history (if any)

### AC-2: Message Sending
**Given** the chat panel is open  
**When** user types a message and presses Enter or clicks Send  
**Then** the message should be sent to `/api/chat` endpoint

### AC-3: SSE Streaming Response
**Given** a message is sent  
**When** the server responds  
**Then** the response should stream in real-time using Server-Sent Events (not all-at-once)

### AC-4: Rich Text Formatting
**Given** the AI response contains markdown  
**When** the response is displayed  
**Then** markdown should be rendered as rich text (headers, bold, italic, links, lists)

### AC-5: Code Block Syntax Highlighting
**Given** the AI response contains code blocks  
**When** the response is displayed  
**Then** code should have syntax highlighting based on language

### AC-6: Error Handling
**Given** an API request fails (network error, 500, etc.)  
**When** the error occurs  
**Then** an error message should be displayed (toast or inline)

### AC-7: Chat History Persistence
**Given** messages have been sent in a conversation  
**When** the browser page is refreshed  
**Then** previous messages should be restored from Dexie/IndexedDB

---

## Research Requirements

**Codebase Knowledge:**
- `AgentChatPanel.tsx` - 648 lines, main chat UI component
- `use-agent-chat-with-tools.ts` - Chat hook with tool support
- `StreamdownRenderer.tsx` - Markdown streaming renderer
- `api/chat.ts` - TanStack Start API route with SSE
- `threadsDb.ts` - Dexie database for message persistence

**Key Patterns:**
- `useAgentChatWithTools(activeAgentId)` - Hook provides messages, sendMessage, isLoading
- `fetchServerSentEvents` - SSE streaming configuration
- `messages` array - Contains user and assistant messages
- `rawMessages` - Includes tool calls for internal tracking

---

## E2E Test Framework (Manual Execution)

> ⚠️ **Note:** Browser automation is slow/unstable. Use this framework manually.
> Execute steps in browser DevTools console where indicated.

### Setup Commands

```bash
# Start dev server (if not running)
pnpm dev

# Expected output: Server running on localhost:3000 (or 5173)
```

### Test 1: Chat Panel Visibility (AC-1)

**Manual Steps:**
1. Open browser to `http://localhost:3000`
2. Navigate to IDE page (create or open project)
3. Look for chat panel on the right side

**Expected:**
- Chat panel visible with input area at bottom
- Agent name/selector visible at top
- Empty or populated message list

**Console Verification:**
```javascript
// Run in browser console to verify AgentChatPanel is mounted
document.querySelector('[data-testid="agent-chat-panel"]') !== null
// OR check for chat input
document.querySelector('textarea[placeholder*="message"]') !== null
```

---

### Test 2: Message Sending (AC-2)

**Manual Steps:**
1. Type "Hello, can you help me?" in the chat input
2. Press Enter or click Send button
3. Observe network tab for API call

**Expected:**
- Message appears in chat as user bubble
- Network request to `/api/chat` initiated
- Loading indicator appears

**Network Verification:**
```javascript
// Open Network tab, filter by "chat"
// POST /api/chat should appear with request body containing:
// { messages: [...], model: "...", agentId: "..." }
```

---

### Test 3: SSE Streaming (AC-3)

**Manual Steps:**
1. After sending a message, watch the response area
2. Response text should appear word-by-word or chunk-by-chunk
3. Not all at once after a delay

**Expected:**
- Response streams incrementally
- Loading indicator shows during streaming
- Complete response displays when done

**Console Verification:**
```javascript
// Check if streaming is configured
// In Network tab, the /api/chat response should be:
// - Content-Type: text/event-stream
// - Transfer-Encoding: chunked
// OR response comes in multiple chunks (SSE format: data: {...}\n\n)
```

---

### Test 4: Markdown Rendering (AC-4)

**Manual Steps:**
1. Send: "Please format this with markdown: a header, a list, and some **bold** text"
2. Observe the response rendering

**Expected:**
- Headers rendered as larger text (`<h1>`, `<h2>`, etc.)
- Lists rendered with bullets or numbers
- Bold text rendered as `<strong>`
- Links rendered as clickable `<a>` tags

**Visual Check:**
- Response should NOT show raw markdown like `# Header` or `**bold**`
- Should show formatted text

---

### Test 5: Code Block Highlighting (AC-5)

**Manual Steps:**
1. Send: "Show me a simple JavaScript function to add two numbers"
2. Observe the code block in response

**Expected:**
- Code block has distinct background color
- Syntax highlighting visible (keywords colored differently)
- Copy button may be present

**Console Verification:**
```javascript
// Check for highlight.js or prism classes
document.querySelector('pre code[class*="language-"]') !== null
// OR check for syntax-highlighted spans
document.querySelectorAll('pre code span[style]').length > 0
```

---

### Test 6: Error Handling (AC-6)

**Manual Steps (Simulate Error):**
1. Open DevTools Network tab
2. Enable "Offline" mode OR block `/api/chat` request
3. Try sending a message
4. Observe error handling

**Expected:**
- Toast notification appears with error message OR
- Inline error message in chat OR
- Error indicator on message bubble

**Alternative Test:**
```javascript
// Temporarily break the API key (if using OpenRouter)
// 1. Open agent config
// 2. Enter invalid API key
// 3. Save and try to chat
// 4. Should show authentication error
```

---

### Test 7: Chat History Persistence (AC-7)

**Manual Steps:**
1. Send 2-3 messages in a conversation
2. Note the messages displayed
3. Refresh the browser (F5 or Ctrl+R)
4. Wait for page to load completely

**Expected:**
- Previous messages restored after refresh
- Same conversation thread visible
- Message order preserved

**Console Verification:**
```javascript
// Check IndexedDB for stored messages
indexedDB.databases().then(dbs => console.log(dbs))
// Should show "via-gent-threads" or similar database

// Or check Dexie directly (if exposed)
// await db.threads.toArray() in component context
```

---

## Dev Notes

### Architecture Reference

From `architecture.md`:
- **Chat Hook:** `useAgentChatWithTools` wraps TanStack AI's `useChat`
- **Streaming:** Server uses `fetchServerSentEvents` for SSE
- **Persistence:** Dexie.js with `threadsDb` for IndexedDB storage
- **Rendering:** `StreamdownRenderer` handles markdown + code highlighting

### Key Code Locations

| Component | File | Purpose |
|-----------|------|---------|
| Chat Panel | `src/components/ide/AgentChatPanel.tsx` | Main chat UI |
| Chat Hook | `src/lib/agent/hooks/use-agent-chat-with-tools.ts` | Chat state management |
| API Route | `src/routes/api/chat.ts` | SSE streaming endpoint |
| Markdown | `src/components/chat/StreamdownRenderer.tsx` | Rich text rendering |
| DB | `src/lib/db/threadsDb.ts` | Message persistence |

### Expected Behavior Flow:

```
User types message
    ↓
useAgentChatWithTools.sendMessage()
    ↓
POST /api/chat (SSE)
    ↓
Response streams chunk by chunk
    ↓
StreamdownRenderer displays formatted text
    ↓
Messages saved to Dexie on complete
```

---

## References

- **Tech-Spec:** `_bmad-output/sprint-artifacts/tech-spec-mvp-completion-2025-12-27.md`
- **Research:** `_bmad-output/research/agentic-coding-deep-research-2025-12-27.md`
- **MVP-1 Evidence:** `_bmad-output/sprint-artifacts/MVP-1-E2E-agent-config-verification.md`
- **Sprint Status:** `_bmad-output/sprint-status.yaml`

---

## Dev Agent Record

### Agent: (To be filled)
### Session: (To be filled)

#### Task Progress:
(User will execute manual tests and report results)

#### Files Changed:
(Gap fixes will be documented here)

#### Research Executed:
- Codebase investigation of chat components

#### Decisions Made:
(To be filled based on test results)

---

## Code Review

(To be filled after verification complete)

---

## Status History

| Status | Date | Agent | Notes |
|--------|------|-------|-------|
| drafted | 2025-12-27T08:21 | @bmad-core-bmad-master | Story created for E2E verification |
| ready-for-dev | 2025-12-27T08:21 | @bmad-core-bmad-master | Unblocked by MVP-1 completion |
