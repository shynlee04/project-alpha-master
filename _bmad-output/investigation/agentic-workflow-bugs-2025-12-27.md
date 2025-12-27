# Agentic Workflow Critical Bugs Investigation
**Date:** 2025-12-27
**Status:** CRITICAL - BLOCKING E2E VERIFICATION

## Bug Summary

Based on user-reported issues and screenshot evidence:

### Bug 1: Agent Teaches Instead of Coding
**Severity:** CRITICAL
**Evidence:** Agent responds with "Bước 1: Cài đặt... npm install zustand..." instead of calling write_file

**Root Cause Analysis:**
- The system prompt (`system-prompt.ts`) IS correctly telling the agent to use tools
- However, devstral:free model via OpenRouter may not consistently follow tool instructions
- Need to verify if model supports tool calling OR if prompt needs strengthening

**System Prompt Contains:**
```
**IMPORTANT**: When you need to perform a file or terminal operation, you MUST actually call the tool - do NOT just describe what you would do.

WRONG (describing):
"Let me read the file..."

CORRECT (actually calling):
Call the tool directly using function calling.
```

**Possible Issues:**
1. Model doesn't support function calling properly
2. Temperature too high (0.7) causing model to "think aloud"
3. Tools not being registered with the API call

### Bug 2: Files Written But Not Appearing in FileTree
**Severity:** HIGH
**Evidence:** Screenshot shows "6 tools used" with write_file badges, but FileTree only shows artifact-*.html files

**Root Cause Analysis:**
1. FileTree refresh is triggered by `file:created` event with `source: 'agent'`
2. Hook is correctly wired in `IDELayout.tsx` line 197
3. **LIKELY ISSUE:** The `FileToolsFacade.writeFile()` may NOT be emitting events OR the files are being written to WebContainer without syncing to LocalFS

**Investigation Points:**
- Check if `FileToolsFacade.createAndWriteFile()` at line 120 emits `file:created`
- Check if files are written to WebContainer but not synced to local FS handle
- Check if debounce (300ms) is eating the events

### Bug 3: Empty Messages in Chat
**Severity:** MEDIUM
**Evidence:** Multiple "09:02 AM" entries with no visible content

**Root Cause Analysis:**
1. These are likely `tool-result` messages that have no text content
2. The message rendering is showing empty assistant messages for tool results
3. Need to filter or format these properly

**Code Path:**
- `AgentChatPanel.tsx` renders `allMessages`
- Tool-only messages (with `parts` containing only `tool-result`) show up as empty

### Bug 4: Persistence Lost on Refresh
**Severity:** CRITICAL
**Evidence:** Second screenshot shows "Start a conversation" after page refresh

**Root Cause Analysis:**
1. `threads-store.ts` uses Dexie correctly on `db.threads` table
2. `saveThread()` is called in `AgentChatPanel` useEffect when `isLoading` becomes false
3. **LIKELY ISSUE:** `isLoading` never becomes false if tool calls are pending approval

**Code Path:**
```typescript
// Line 357-359 in AgentChatPanel.tsx
if (!isLoading && currentSessionMessages.length > 0) {
    persist();
}
```

If `isLoading` stays true (stuck in tool approval), persistence never happens.

---

## Recommended Fixes

### Fix 1: Improve System Prompt + Model Selection
```typescript
// In system-prompt.ts, add more emphasis:
## MANDATORY: You are an AI AGENT, not an instructor.
- NEVER write instructions like "run npm install" - USE execute_command tool
- NEVER describe file contents - USE write_file tool
- If user asks you to create something, CREATE IT using tools
- Do NOT ask for permission. Just execute.
```

### Fix 2: Force Save on Tool Activity
```typescript
// In AgentChatPanel.tsx, around line 357:
// CHANGE FROM:
if (!isLoading && currentSessionMessages.length > 0) {

// CHANGE TO:
if (currentSessionMessages.length > 0) {
    // Always persist - streaming still works, we just keep saving
    persist();
}
```

### Fix 3: Filter Empty Messages
```typescript
// In allMessages memo, filter out empty content:
const deduplicated = combined.filter(msg => {
    if (seen.has(msg.id)) return false;
    // Filter out empty tool-result messages
    if (!msg.content && msg.role === 'assistant') return false;
    seen.add(msg.id);
    return true;
});
```

### Fix 4: Debug FileTree Events
Add logging to `FileToolsFacade.writeFile()`:
```typescript
console.log('[FileTools] Emitting file:created event:', { path, source: 'agent' });
this.eventBus.emit('file:created', { path, source: 'agent', ... });
```

---

## Immediate Actions

1. **Add debug logging** to verify tool execution flow
2. **Force save persistence** on any message change (not just when loading stops)
3. **Filter empty messages** in display
4. **Strengthen system prompt** or try a different model (claude, gpt-4)

## Files to Modify

1. `src/components/ide/AgentChatPanel.tsx` - Persistence + empty message filtering
2. `src/lib/agent/system-prompt.ts` - Stronger agentic instructions
3. `src/lib/agent/facades/file-tools-impl.ts` - Add debug logging
4. `src/lib/agent/hooks/use-agent-chat-with-tools.ts` - Debug tool registration
