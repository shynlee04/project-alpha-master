# MVP-3 E2E Verification Checklist

**Document ID**: REM-2025-12-26-003
**Created**: 2025-12-26T22:15:00+00:00
**Author**: BMAD PM (bmad-bmm-pm)
**Status**: ✅ COMPLETE

---

## Executive Summary

**Purpose**: Complete E2E verification checklist for MVP-3 (Tool Execution - File Operations)
**Verification Type**: Browser-based E2E testing
**Screenshot Required**: Yes - mandatory for story completion

---

## Prerequisites

### Environment Setup
- [ ] Development server running: `pnpm dev`
- [ ] Browser: Chrome/Edge (File System Access API support)
- [ ] URL: `http://localhost:3000`
- [ ] Cross-origin isolation headers verified (COOP/COEP)

### Project Setup
- [ ] Test project loaded in IDE
- [ ] File system permissions granted
- [ ] WebContainer booted successfully
- [ ] Project synced to WebContainer
- [ ] Agent configured with API credentials

### Blocking Issues Resolved
- [ ] P0-GOV-001: Sprint status consolidated
- [ ] P0-GOV-002: Acceptance criteria defined
- [ ] P0-GOV-003: E2E verification gate enforced
- [ ] P0-AI-001: Duplicate state removed from IDELayout
- [ ] P0-AI-002: Provider config interface defined
- [ ] P0-AI-003: Model registry created
- [ ] P0-TW-001: Tool execution wired to chat hook
- [ ] P0-TW-002: Tool result handling implemented

---

## E2E Verification Steps

### Step 1: Agent Configuration Verification

**Acceptance Criteria**: Agent can be configured and credentials persisted

**Verification Steps**:
1. Open Agent Configuration Dialog
   - [ ] Click "Agents" button in IDE
   - [ ] Click "Configure" button
   - [ ] Dialog opens with provider selection

2. Configure AI Provider
   - [ ] Select provider (e.g., OpenRouter, Anthropic)
   - [ ] Enter API key
   - [ ] API key is masked in UI (•••••••••••)
   - [ ] Select model from dropdown
   - [ ] Click "Save" button

3. Verify Persistence
   - [ ] Refresh page (F5)
   - [ ] Re-open Agent Configuration Dialog
   - [ ] Provider, API key, model selection persisted
   - [ ] Check localStorage for agent configuration

**Screenshot Required**: Capture screenshot of Agent Configuration Dialog with credentials

---

### Step 2: Chat Interface Verification

**Acceptance Criteria**: Chat interface displays streaming messages with tool call badges

**Verification Steps**:
1. Open Chat Panel
   - [ ] Click "Chat" button in IDE
   - [ ] Chat panel opens on right side
   - [ ] Input field visible at bottom
   - [ ] Message history visible

2. Send Test Message
   - [ ] Type: "List all files in the project"
   - [ ] Click "Send" button
   - [ ] Message appears in chat history

3. Verify Streaming
   - [ ] Message appears character-by-character (streaming)
   - [ ] No flickering or layout shifts
   - [ ] Loading indicator visible during streaming
   - [ ] Message completes with "done" status

**Screenshot Required**: Capture screenshot of chat panel with streaming message

---

### Step 3: Tool Execution - File Read

**Acceptance Criteria**: Agent can read files via tool execution

**Verification Steps**:
1. Trigger File Read Tool
   - [ ] Send message: "Read the file src/App.tsx"
   - [ ] Tool call badge appears: "🔧 read_file"
   - [ ] Tool call shows parameters: `{ path: "src/App.tsx" }`

2. Verify Tool Execution
   - [ ] Tool executes successfully (no error)
   - [ ] Tool result appears in chat
   - [ ] File content displayed in code block
   - [ ] Code block has syntax highlighting

3. Verify File Content
   - [ ] File content matches actual file content
   - [ ] No truncation or corruption
   - [ ] File path is clickable (opens in editor)

**Screenshot Required**: Capture screenshot of tool execution with file read result

---

### Step 4: Tool Execution - File Write

**Acceptance Criteria**: Agent can write files via tool execution

**Verification Steps**:
1. Trigger File Write Tool
   - [ ] Send message: "Create a new file test.md with content 'Hello World'"
   - [ ] Tool call badge appears: "🔧 write_file"
   - [ ] Tool call shows parameters: `{ path: "test.md", content: "Hello World" }`

2. Verify Tool Execution
   - [ ] Tool executes successfully (no error)
   - [ ] Tool result appears in chat
   - [ ] Success message: "File written successfully"

3. Verify File Created
   - [ ] File appears in file tree panel
   - [ ] File can be opened in editor
   - [ ] File content matches: "Hello World"
   - [ ] File synced to WebContainer

**Screenshot Required**: Capture screenshot of tool execution with file write result

---

### Step 5: Tool Execution - File List

**Acceptance Criteria**: Agent can list files via tool execution

**Verification Steps**:
1. Trigger File List Tool
   - [ ] Send message: "List all files in src/components"
   - [ ] Tool call badge appears: "🔧 list_files"
   - [ ] Tool call shows parameters: `{ path: "src/components" }`

2. Verify Tool Execution
   - [ ] Tool executes successfully (no error)
   - [ ] Tool result appears in chat
   - [ ] File list displayed in code block
   - [ ] List is formatted (JSON or table)

3. Verify File List
   - [ ] All files in directory listed
   - [ ] File names match actual files
   - [ ] No missing files
   - [ ] No extra files

**Screenshot Required**: Capture screenshot of tool execution with file list result

---

### Step 6: Tool Execution - Error Handling

**Acceptance Criteria**: Agent handles file operation errors gracefully

**Verification Steps**:
1. Trigger Error Condition
   - [ ] Send message: "Read file that doesn't exist: src/missing.tsx"
   - [ ] Tool call badge appears: "🔧 read_file"
   - [ ] Tool executes and returns error

2. Verify Error Handling
   - [ ] Error message appears in chat
   - [ ] Error message is clear and actionable
   - [ ] No crash or console errors
   - [ ] Chat continues to work (not stuck)

3. Verify Error Display
   - [ ] Error shown in red or warning color
   - [ ] Error includes file path and reason
   - [ ] User can retry or correct the path

**Screenshot Required**: Capture screenshot of error handling in chat

---

## Acceptance Criteria

### Functional Requirements
- [ ] All 8 blocking P0 issues resolved
- [ ] Agent configuration persists across page refresh
- [ ] Chat interface displays streaming messages
- [ ] Tool call badges display correctly
- [ ] File read tool executes successfully
- [ ] File write tool executes successfully
- [ ] File list tool executes successfully
- [ ] Tool errors handled gracefully
- [ ] No console errors or warnings
- [ ] No TypeScript errors

### UI/UX Requirements
- [ ] Chat panel responsive (no layout shifts)
- [ ] Tool call badges clearly visible
- [ ] Code blocks have syntax highlighting
- [ ] Error messages are clear and actionable
- [ ] Loading indicators visible during streaming
- [ ] File paths are clickable (open in editor)

### Performance Requirements
- [ ] Streaming starts within 1 second
- [ ] Tool execution completes within 2 seconds
- [ ] No UI freezes or blocking
- [ ] Smooth scrolling in chat history

### Security Requirements
- [ ] API keys masked in UI (••••••••••••)
- [ ] API keys stored in localStorage (encrypted if possible)
- [ ] No API keys in console logs
- [ ] File operations validate paths (no path traversal)

---

## Success Criteria

### Definition of Done
- [ ] All verification steps completed
- [ ] All acceptance criteria met
- [ ] Screenshots captured for all steps
- [ ] No blocking issues remaining
- [ ] Ready to proceed to MVP-4

### E2E Verification Evidence
- [ ] Screenshot: Agent Configuration Dialog
- [ ] Screenshot: Chat Interface with streaming
- [ ] Screenshot: File Read Tool Execution
- [ ] Screenshot: File Write Tool Execution
- [ ] Screenshot: File List Tool Execution
- [ ] Screenshot: Error Handling

---

## Blocking Issues

### If Verification Fails

**Issue**: P0-GOV-001 - Sprint status not consolidated
**Impact**: Cannot track story completion
**Resolution**: Update [`_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`](_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml)

**Issue**: P0-AI-001 - Duplicate state in IDELayout
**Impact**: Tool execution may not work correctly
**Resolution**: Refactor [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) to use Zustand hooks

**Issue**: P0-TW-001 - Tool execution not wired
**Impact**: Agent cannot execute tools
**Resolution**: Wire tool execution in [`use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)

---

## Traceability

All verification steps traceable to:
- [MVP Sprint Plan](../sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- [MVP Story Validation](../sprint-artifacts/mvp-story-validation-2025-12-24.md)
- [Remediation Prioritization Matrix](remediation-prioritization-matrix-2025-12-26.md)
- [Remediation Execution Roadmap](remediation-execution-roadmap-2025-12-26.md)
- [P0 Fixes Implementation](../p0-fixes/p0-fixes-implementation-2025-12-26.md)
- [Tool Wiring Spec](../sprint-artifacts/12-5-wire-facades-to-tanstack-ai-tools.md)
- [Governance Framework](../governance/GOVERNANCE-INDEX-2025-12-26.md)

---

## Notes

### Known Limitations (Temporary MVP Measure)
- **maxIterations(3)**: Agent will terminate after 3 tool execution iterations
- **Full Implementation**: Deferred to Epic 29 (Agentic Execution Loop)
- **Reference**: See [Epic 29 Specification](../epics/epic-29-agentic-execution-loop.md)

### MCP Research Protocol Compliance
All agent features implemented following:
- [ ] Context7: Library documentation queried
- [ ] Deepwiki: Repo wikis checked
- [ ] Tavily/Exa: 2025 best practices researched
- [ ] Repomix: Codebase structure analyzed

### Browser E2E Verification Best Practices
- Test in Chrome or Edge (File System Access API support)
- Clear browser cache before testing
- Use fresh browser window for each verification step
- Capture full-page screenshots (not just UI elements)
- Include console in screenshots (show no errors)
