# MVP E2E Verification Guide
## Stories MVP-2, MVP-3, MVP-4

**Date**: 2025-12-27  
**Epic**: MVP (AI Coding Agent Vertical Slice)  
**Status**: Ready for Execution  
**Estimated Time**: 30-45 minutes

---

## Prerequisites

### Setup
```bash
# Start dev server
pnpm dev

# Expected: Server running on http://localhost:3000
```

### Required
- Chrome/Edge browser (File System Access API support)
- DevTools open (F12)
- Network tab ready
- Console ready
- Screenshot tool ready (Windows: Win+Shift+S, Mac: Cmd+Shift+4)

---

## MVP-2: Chat Interface with Streaming

### Test 1: Chat Panel Visibility (AC-1)
**Steps**:
1. Open `http://localhost:3000`
2. Navigate to IDE (create/open project)
3. Locate chat panel on right side

**Expected**:
- ✅ Chat panel visible with input area
- ✅ Agent selector at top
- ✅ Message list (empty or populated)

**Console Check**:
```javascript
document.querySelector('[data-testid="agent-chat-panel"]') !== null
```

**Screenshot**: `mvp-2-test1-chat-panel.png`

---

### Test 2: Message Sending (AC-2)
**Steps**:
1. Type "Hello, can you help me?" in chat input
2. Press Enter or click Send
3. Open Network tab, filter by "chat"

**Expected**:
- ✅ Message appears as user bubble
- ✅ POST `/api/chat` request initiated
- ✅ Loading indicator shows

**Network Check**:
- Request body contains: `{ messages: [...], model: "...", agentId: "..." }`

**Screenshot**: `mvp-2-test2-message-sent.png`

---

### Test 3: SSE Streaming (AC-3)
**Steps**:
1. After sending message, watch response area
2. Observe text appearing incrementally

**Expected**:
- ✅ Response streams word-by-word (not all at once)
- ✅ Loading indicator during streaming
- ✅ Complete response when done

**Network Check**:
- Response headers: `Content-Type: text/event-stream`
- Response: `Transfer-Encoding: chunked`

**Screenshot**: `mvp-2-test3-streaming.png`

---

### Test 4: Markdown Rendering (AC-4)
**Steps**:
1. Send: "Format with markdown: a header, a list, and **bold** text"
2. Observe response rendering

**Expected**:
- ✅ Headers rendered as larger text
- ✅ Lists with bullets/numbers
- ✅ Bold text as `<strong>`
- ✅ Links as clickable `<a>`

**Visual Check**:
- NO raw markdown like `# Header` or `**bold**`

**Screenshot**: `mvp-2-test4-markdown.png`

---

### Test 5: Code Block Highlighting (AC-5)
**Steps**:
1. Send: "Show me a JavaScript function to add two numbers"
2. Observe code block

**Expected**:
- ✅ Code block has distinct background
- ✅ Syntax highlighting visible
- ✅ Copy button present

**Console Check**:
```javascript
document.querySelector('pre code[class*="language-"]') !== null
```

**Screenshot**: `mvp-2-test5-code-highlighting.png`

---

### Test 6: Error Handling (AC-6)
**Steps**:
1. Open DevTools Network tab
2. Enable "Offline" mode
3. Try sending a message
4. Observe error handling

**Expected**:
- ✅ Toast notification OR inline error message
- ✅ Error indicator on message bubble

**Alternative**: Use invalid API key in agent config

**Screenshot**: `mvp-2-test6-error-handling.png`

---

### Test 7: Chat History Persistence (AC-7)
**Steps**:
1. Send 2-3 messages
2. Note messages displayed
3. Refresh browser (F5)
4. Wait for page load

**Expected**:
- ✅ Previous messages restored
- ✅ Same conversation thread visible
- ✅ Message order preserved

**Console Check**:
```javascript
indexedDB.databases().then(dbs => console.log(dbs))
// Should show "via-gent-threads" database
```

**Screenshot**: `mvp-2-test7-persistence.png`

---

## MVP-3: Tool Execution - File Operations

### Test 1: Agent Reads File (AC-1)
**Steps**:
1. Open project with multiple files
2. Open `src/App.tsx` in MonacoEditor
3. Ask agent: "Read the content of src/App.tsx"
4. Approve tool call

**Expected**:
- ✅ Agent responds with file content
- ✅ No file changes in FileTree
- ✅ No changes in MonacoEditor

**Screenshot**: `mvp-3-test1-read-file.png`

---

### Test 2: Agent Modifies Open File (AC-2, AC-4)
**Steps**:
1. Open `src/App.tsx` in MonacoEditor
2. Make manual edit to see dirty state
3. Ask agent: "Add a comment at the top of src/App.tsx"
4. Approve tool call

**Expected**:
- ✅ FileTree shows updated file
- ✅ MonacoEditor content updates with new comment
- ✅ Dirty state cleared (agent changes not dirty)
- ✅ Cursor position preserved

**Screenshot**: `mvp-3-test2-modify-open-file.png`

---

### Test 3: Agent Creates New File (AC-3)
**Steps**:
1. Ask agent: "Create src/utils/helper.ts with a simple function"
2. Approve tool call

**Expected**:
- ✅ New file appears in FileTree
- ✅ File can be opened in MonacoEditor
- ✅ File content matches specification

**Screenshot**: `mvp-3-test3-create-file.png`

---

### Test 4: Agent Modifies Closed File (AC-4)
**Steps**:
1. Ensure `src/main.tsx` is NOT open
2. Ask agent: "Add console.log to src/main.tsx"
3. Approve tool call

**Expected**:
- ✅ FileTree shows updated file
- ✅ Opening file shows new content
- ✅ No MonacoEditor updates (file was closed)

**Screenshot**: `mvp-3-test4-modify-closed-file.png`

---

### Test 5: Path Traversal Protection (AC-5)
**Steps**:
1. Ask agent: "Read the file at ../../../etc/passwd"
2. Observe response

**Expected**:
- ✅ Tool call rejected with validation error
- ✅ No file read
- ✅ Error message explains restriction

**Screenshot**: `mvp-3-test5-path-protection.png`

---

### Test 6: Concurrent File Operations (AC-5)
**Steps**:
1. Ask agent: "Modify src/App.tsx and src/main.tsx simultaneously"
2. Approve both tool calls

**Expected**:
- ✅ Both files modified correctly
- ✅ No race conditions
- ✅ File locking ensures sequential execution

**Screenshot**: `mvp-3-test6-concurrent-ops.png`

---

## MVP-4: Tool Execution - Terminal Commands

### Test 1: Command Request & Approval (AC-1, AC-6)
**Steps**:
1. Ask agent: "Run `ls -la` in the terminal"
2. Observe approval dialog

**Expected**:
- ✅ Approval dialog shows command
- ✅ Command has syntax highlighting
- ✅ Working directory displayed
- ✅ "HIGH" risk badge visible

**Screenshot**: `mvp-4-test1-command-approval.png`

---

### Test 2: Command Execution (AC-2, AC-3)
**Steps**:
1. Approve the `ls -la` command
2. Watch terminal panel

**Expected**:
- ✅ Command appears in terminal history
- ✅ Output streams in real-time
- ✅ Exit status visible (✓ success / ✗ failure)

**Screenshot**: `mvp-4-test2-command-execution.png`

---

### Test 3: Working Directory (AC-4)
**Steps**1. Ensure project loaded at `/project/myapp`
2. Ask agent: "Run `npm install`"
3. Approve command

**Expected**:
- ✅ Working directory defaults to project path
- ✅ `npm install` finds `package.json`
- ✅ Packages install successfully

**Screenshot**: `mvp-4-test3-working-directory.png`

---

### Test 4: Error Handling (AC-5)
**Steps**:
1. Ask agent: "Run `nonexistent-command-12345`"
2. Approve command
3. Observe error handling

**Expected**:
- ✅ Error message surfaced in chat UI
- ✅ Agent receives error result
- ✅ Exit status shows failure (✗)

**Screenshot**: `mvp-4-test4-error-handling.png`

---

### Test 5: Denial Flow (AC-6)
**Steps**:
1. Ask agent: "Run `rm -rf /`" (dangerous command)
2. Deny the command
3. Observe agent response

**Expected**:
- ✅ Agent receives denial notification
- ✅ No command executed
- ✅ Agent acknowledges and continues

**Screenshot**: `mvp-4-test5-denial-flow.png`

---

## Verification Checklist

### MVP-2: Chat Interface
- [ ] AC-1: Chat panel visible
- [ ] AC-2: Message sending works
- [ ] AC-3: SSE streaming works
- [ ] AC-4: Markdown rendering works
- [ ] AC-5: Code block highlighting works
- [ ] AC-6: Error handling works
- [ ] AC-7: Chat history persists

### MVP-3: File Operations
- [ ] AC-1: Agent can read files
- [ ] AC-2: Agent can write files
- [ ] AC-3: Agent can create files
- [ ] AC-4: File sync & events work
- [ ] AC-5: Path validation & locking work

### MVP-4: Terminal Commands
- [ ] AC-1: Command approval works
- [ ] AC-2: Command execution works
- [ ] AC-3: Working directory works
- [ ] AC-4: Error handling works
- [ ] AC-5: Denial flow works
- [ ] AC-6: Terminal integration works

---

## Results Recording

### MVP-2 Results
**Status**: ⬜ PASS / ❌ FAIL  
**Issues Found**:  
**Screenshots Captured**: 7/7

### MVP-3 Results
**Status**: ⬜ PASS / ❌ FAIL  
**Issues Found**:  
**Screenshots Captured**: 6/6

### MVP-4 Results
**Status**: ⬜ PASS / ❌ FAIL  
**Issues Found**:  
**Screenshots Captured**: 5/5

---

## Next Steps

### If All Tests Pass
1. Update [`sprint-status.yaml`](_bmad-output/sprint-status.yaml):
   - Set MVP-2, MVP-3, MVP-4 status to "done"
   - Add completion timestamps
   - Update epic progress

2. Update [`bmm-workflow-status.yaml`](_bmad-output/bmm-workflow-status.yaml):
   - Mark stories as completed
   - Update next actions to MVP-5

3. Proceed to MVP-5: Approval Workflow

### If Tests Fail
1. Document each failure in this guide
2. Create gap fix tickets
3. Re-test after fixes
4. Update status accordingly

---

## References

- **MVP-2 Framework**: [`MVP-2-E2E-chat-interface-verification.md`](_bmad-output/sprint-artifacts/MVP-2-E2E-chat-interface-verification.md)
- **MVP-3 Framework**: [`mvp-3-tool-execution-files-implementation-2025-12-25.md`](_bmad-output/sprint-artifacts/mvp-3-tool-execution-files-implementation-2025-12-25.md)
- **MVP-4 Framework**: [`mvp-4-tool-execution-terminal.md`](_bmad-output/sprint-artifacts/mvp-4-tool-execution-terminal.md)
- **Sprint Status**: [`sprint-status.yaml`](_bmad-output/sprint-status.yaml)

---

**End of Verification Guide**