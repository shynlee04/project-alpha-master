# MVP E2E Verification Checklist - Consolidated

**Created:** 2025-12-27T08:27:00+07:00  
**Status:** Ready for Manual Verification  
**Stories:** MVP-2, MVP-3, MVP-4 (all code-complete)

---

## 🎯 Overview

Based on codebase analysis, **MVP-2, MVP-3, and MVP-4 have complete implementations** at the code level. They require E2E browser verification to confirm all acceptance criteria are working.

| Story | Implementation Status | Verification Status |
|-------|----------------------|---------------------|
| ✅ MVP-1 | DONE | E2E Verified 2025-12-27 |
| 🔵 MVP-2 | Code Complete | Pending E2E Verification |
| 🔵 MVP-3 | Code Complete | Pending E2E Verification |
| 🔵 MVP-4 | Code Complete | Pending E2E Verification |
| ⬜ MVP-5 | Backlog | - |
| ⬜ MVP-6 | Backlog | - |
| ⬜ MVP-7 | Backlog | - |

---

## 🚀 Setup (Do Once)

```bash
# Start the development server
pnpm dev

# Expected: Server running on http://localhost:3000 (or 5173)
```

1. Open browser to `http://localhost:3000`
2. Open DevTools Console (F12 → Console tab)
3. Open DevTools Network tab (for API verification)
4. Have a project opened (with files) in the IDE

---

## 🔵 MVP-2: Chat Interface with Streaming

**Test Document:** `_bmad-output/sprint-artifacts/MVP-2-E2E-chat-interface-verification.md`

### Quick Checklist

- [ ] **AC-1: Chat Panel Display** - Chat panel visible on right side with input area
- [ ] **AC-2: Message Sending** - Type message, press Enter, see in Network tab as POST /api/chat
- [ ] **AC-3: SSE Streaming** - Response streams incrementally (not all at once)
- [ ] **AC-4: Markdown Rendering** - Headers, lists, bold text render correctly (not raw `#` or `**`)
- [ ] **AC-5: Code Highlighting** - Code blocks have syntax colors
- [ ] **AC-6: Error Handling** - On network error, toast or inline error appears
- [ ] **AC-7: Persistence** - Refresh browser, previous messages still visible

### Test Commands

**Test Chat:**
```
"Hello, can you help me understand this project?"
```

**Test Markdown:**
```
"Please format this with markdown: a header, a list, and some **bold** text"
```

**Test Code Block:**
```
"Show me a simple JavaScript function to add two numbers"
```

---

## 🔵 MVP-3: Tool Execution - File Operations

**Test Document:** `_bmad-output/sprint-artifacts/mvp-3-tool-execution-files-implementation-2025-12-25.md`

### Quick Checklist

- [ ] **Test 1: Agent Reads File** - Ask agent to read a file, content appears in response
- [ ] **Test 2: Agent Modifies Open File** - Monaco updates with new content, dirty state clears
- [ ] **Test 3: Agent Creates New File** - New file appears in FileTree, can be opened
- [ ] **Test 4: Agent Modifies Closed File** - FileTree shows update, opening file shows new content
- [ ] **Test 5: Path Traversal Protection** - Request `../../../etc/passwd` is rejected
- [ ] **Test 6: Concurrent Operations** - Multiple file operations complete without conflicts

### Test Commands

**Test Read:**
```
"Read the content of package.json"
```

**Test Write (existing file):**
```
"Add a comment at the top of README.md: // This file was updated by AI agent"
```

**Test Create:**
```
"Create a new file called src/utils/test-helper.ts with a function that adds two numbers"
```

**Test Path Traversal:**
```
"Read the file at ../../../etc/passwd"
```
Expected: Rejection with validation error

---

## 🔵 MVP-4: Tool Execution - Terminal Commands

**Test Document:** `_bmad-output/sprint-artifacts/mvp-4-tool-execution-terminal.md`

### Quick Checklist

- [ ] **AC-1: Command Request** - Approval dialog shows command, args, cwd, risk level
- [ ] **AC-2: Command Execution** - Output streams in terminal panel, exit code reported
- [ ] **AC-3: Terminal Panel Integration** - Command appears in terminal history
- [ ] **AC-4: Working Directory** - Commands run in project directory (npm finds package.json)
- [ ] **AC-5: Error Handling** - Failed commands show error message in chat
- [ ] **AC-6: Denial Flow** - Rejecting command shows denial message, no execution

### Test Commands

**Test Command Execution:**
```
"Run the command: npm --version"
```
Expected: Approval dialog → Approve → Version number in terminal output

**Test Working Directory:**
```
"Run npm list --depth=0 to show installed packages"
```
Expected: Lists packages from project's package.json

**Test Denial:**
```
"Run the command: rm -rf node_modules"
```
Expected: HIGH RISK dialog → Deny → No execution, denial message in chat

---

## 📋 Reporting Results

After running each test, report back with format:

```markdown
## MVP-X Test Results

### Passed ✅
- AC-1: [description]
- AC-3: [description]

### Failed ❌
- AC-2: [describe what happened vs expected]
- AC-5: [describe error message or behavior]

### Partial ⚠️
- AC-4: [works partially, describe what's missing]
```

I will then create gap fixes for any failures.

---

## 🔄 Verification Workflow

```
For each story (MVP-2, MVP-3, MVP-4):
  1. Run tests from checklist above
  2. Report results (pass/fail/partial)
  3. Agent creates gap fixes if needed
  4. Re-run failed tests
  5. Mark story as DONE when all ACs verified
  6. Update sprint-status.yaml
```

---

## 📂 Reference Documents

| Document | Purpose |
|----------|---------|
| `MVP-2-E2E-chat-interface-verification.md` | Detailed MVP-2 tests with console commands |
| `MVP-2-E2E-chat-interface-verification-context.xml` | MVP-2 code references |
| `mvp-3-tool-execution-files.md` | MVP-3 story with ACs |
| `mvp-3-tool-execution-files-implementation-2025-12-25.md` | MVP-3 implementation + test checklist |
| `mvp-3-tool-execution-files-context.xml` | MVP-3 code references |
| `mvp-4-tool-execution-terminal.md` | MVP-4 story with ACs |
| `mvp-4-tool-execution-terminal-context.xml` | MVP-4 code references |

---

*Generated by BMAD Master Orchestrator - 2025-12-27*
