# Course Correction: MVP-3 Agentic Execution Loop Issues

**ID:** CC-2025-12-25-002  
**Created:** 2025-12-25T18:52:00+07:00  
**Severity:** P0 (Blocking MVP-3 E2E Validation)  
**Status:** ✅ FIX APPLIED - Awaiting E2E Verification
**Fixed At:** 2025-12-25T18:55:00+07:00
**Related:** CC-2025-12-25-001 (Path Handling) - FIXED, Epic 29 (Agentic Loop)

---

## Incident Summary

During E2E testing of MVP-3, the AI agent says it will call tools but:
1. Never actually calls them (LLM text says "Let me read the file" but no tool invocation)
2. No tool results are returned to the user
3. No error messages displayed when tool execution fails
4. Agent appears stuck without feedback

**User Report:**
> "bạn đã đọc được chưa" → "Chưa bạn ơi, tôi vẫn đang trong quá trình thực hiện!"

(Translation: "Have you read it yet?" → "Not yet, I'm still in the process!")

---

## Root Cause Analysis

### Issue 1: LLM Doesn't Invoke Tools (Just Describes Them)

**Observation:** The LLM says it will call a tool (e.g., "let me read the file") but never actually calls `read_file` tool.

**Possible Causes:**
1. **Model capability** - Free models like `mistralai/devstral-2512:free` may not support function calling
2. **Tool definitions not passed** - Server may not be sending `tools` array to LLM correctly
3. **System prompt issue** - LLM not instructed to USE tools, only that they exist

**Verification:**
- Check `/api/chat.ts` line 147 - tools are passed: `tools,`
- Check if OpenRouter supports function calling with selected model

---

### Issue 2: Client Tools Never Execute

**Observation:** Even if LLM returns tool call in SSE stream, client doesn't execute it.

**Possible Causes:**
1. **Tool call parsing** - `use-agent-chat-with-tools.ts` may not be parsing tool calls from TanStack AI stream correctly
2. **State mismatch** - `agentTools.getClientTools()` returns tools but TanStack AI `useChat` doesn't invoke them
3. **Approval flow blocking** - All tools require approval but approval overlay not shown

**Verification:**
- Check if `tool-call` parts appear in `rawMessages`
- Check if `state === 'approval-requested'` triggers UI
- Verify `pendingApprovals` array is populated

---

### Issue 3: No Error Feedback to User

**Observation:** When tools fail, no error message shown to user or agent.

**Code Path:**
```
factory.ts tool handler → catches error → returns { success: false, error: ... }
```

But this result never reaches the UI.

**Possible Cause:**
- Tool results aren't being streamed back through TanStack AI
- SSE response doesn't include tool output events

---

## Diagnostic Steps Required

### Step 1: Check Console Logs for Tool Calls
Add debugging to verify if tool calls are being received:

```typescript
// In use-agent-chat-with-tools.ts, log rawMessages
useEffect(() => {
    console.log('[DEBUG] rawMessages:', JSON.stringify(rawMessages, null, 2));
}, [rawMessages]);
```

### Step 2: Test Model Function Calling Capability
Use a model known to support function calling:
- `openai/gpt-4o-mini` (OpenRouter)
- `anthropic/claude-3-sonnet`

If the free model doesn't support tools, users will see "let me call X" but no actual call.

### Step 3: Verify SSE Stream Contains Tool Calls
Check browser Network tab for SSE events:
- Look for `tool-call` events
- Look for `tool-result` events

---

## Immediate Fixes

### Fix 1: Add Tool Call Debug Logging

Location: `use-agent-chat-with-tools.ts`

Add console logging to trace tool call flow:
```typescript
// After pendingApprovals calculation
console.log('[Agent] pendingApprovals:', pendingApprovals);
console.log('[Agent] toolsAvailable:', toolsAvailable);
console.log('[Agent] tools count:', agentTools?.all.length);
```

### Fix 2: Update System Prompt for Tool Usage

Location: `src/lib/agent/system-prompt.ts`

Ensure system prompt explicitly tells LLM to USE tools:
```
When asked to perform file operations, you MUST use the provided tools.
Do NOT describe what you will do - just do it using the appropriate tool.
```

### Fix 3: Verify Model Supports Function Calling

Add validation in chat API:
```typescript
const modelsWithFunctionCalling = [
    'gpt-4o', 'gpt-4o-mini', 'claude-3-sonnet', 'claude-3-opus'
];
// Warn if model may not support tools
```

---

## Testing Required

After fixes:
1. Check browser console for tool call logs
2. Look for "approval-requested" state in debug output
3. Verify approval overlay appears when tool is called
4. Test with a paid model that supports function calling

---

## Related Issues

- **CC-2025-12-25-001:** Path handling bugs (FIXED)
- **Epic 29:** Full agentic loop implementation (Post-MVP)
- **Story 29-4:** Error recovery & user handoff

---

## Next Steps

1. [ ] Add debug logging to trace tool call flow
2. [ ] Test with function-calling-capable model
3. [ ] Verify SSE stream contains tool call events
4. [ ] Update system prompt for explicit tool usage
5. [ ] E2E verification after fixes
