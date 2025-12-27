
# Rescoped E2E Integration Requirements

**Incident ID:** INC-2025-12-24-001  
**Date:** 2025-12-24T09:00:00+07:00  
**Author:** Bob (Scrum Master)  
**Priority:** P0 - Critical  
**Status:** ACTIVE  

---

## Executive Summary

This document rescopes E2E integration requirements following the critical validation failure of 2025-12-24. The E2E validation report claimed **90% readiness**, but manual browser testing revealed **nothing works on the frontend**. 

### Root Cause Summary

The root cause analysis ([root-cause-analysis-e2e-validation-failure-2025-12-24.md](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/critical-incidents/root-cause-analysis-e2e-validation-failure-2025-12-24.md)) identified **7 critical process failures**:

1. **Validation Methodology Failure**: Checked component existence, not integration
2. **Implementation vs. Reality Gap**: Stories marked DONE without manual browser testing
3. **Story Completion Definition Violation**: DoD lacked mandatory E2E verification
4. **Process Breakdown**: No mandatory manual browser testing step
5. **Code Review Process Failure**: Reviews focused on code quality, not integration
6. **Governance Mechanism Failure**: Sprint status not cross-validated
7. **Mock vs. Real Implementation Confusion**: Mock stories treated as real implementations

### Affected Stories (12 Total)

| Epic | Story ID | Story Name | Original Status | Actual Status |
|------|----------|------------|-----------------|---------------|
| 25 | 25-1 | TanStack AI Integration Setup | ❌ done | in-progress |
| 25 | 25-2 | Implement File Tools | ❌ done | in-progress |
| 25 | 25-3 | Implement Terminal Tools | ❌ done | in-progress |
| 25 | 25-4 | Wire Tool Execution to UI | ❌ done | in-progress |
| 25 | 25-5 | Implement Approval Flow | ❌ done | in-progress |
| 25 | 25-6 | Wire Agent UI to Providers | ❌ done | in-progress |
| 28 | 28-16 | Agent Config Flow | ❌ done | in-progress |
| 28 | 28-19 | Chat Tool Call Badge | ❌ done | in-progress |
| 28 | 28-20 | Chat Code Block with Actions | ❌ done | in-progress |
| 28 | 28-21 | Diff Preview Component | ❌ done | in-progress |
| 28 | 28-22 | Approval Overlay Component | ❌ done | in-progress |
| 28 | 28-23 | Streaming Message Container | ❌ done | in-progress |

---

## Updated Definition of Done (DoD)

> [!IMPORTANT]
> The following Definition of Done is **MANDATORY** for all stories. No story may be marked as `done` without completing ALL checklist items.

### Definition of Done Checklist

```markdown
## Definition of Done Checklist

### Code Implementation
- [ ] Code implementation complete
- [ ] TypeScript: No errors (`pnpm build` passes)
- [ ] ESLint: No warnings or errors
- [ ] All edge cases handled with error boundaries

### Testing
- [ ] Unit tests passing (≥80% coverage for new code)
- [ ] Integration tests passing (if applicable)
- [ ] **MANDATORY: Manual Browser E2E Verification** (NEW)
  - [ ] Tested in Chrome/Edge browser
  - [ ] Verified user journey end-to-end
  - [ ] Confirmed integration with dependent components
  - [ ] Screenshot/recording evidence captured

### Code Review
- [ ] Code review approved by peer
- [ ] Code review checklist completed (see below)
- [ ] All review comments addressed

### Documentation
- [ ] Code comments added for complex logic
- [ ] Translation keys added (if UI changes)
- [ ] Story file updated with completion notes

### Governance
- [ ] Story status updated in sprint-status.yaml
- [ ] Dev Agent Record updated (if applicable)
```

---

## Updated Code Review Checklist

> [!WARNING]
> Code reviews MUST include **manual integration verification**. Code-only reviews are no longer sufficient for UI-related stories.

### Code Review Checklist v2.0

```markdown
## Code Review Checklist

### Code Quality
- [ ] Code follows project conventions (file structure, naming)
- [ ] TypeScript: Strict mode, no `any` types without justification
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] No hardcoded values (use constants/config)

### Testing
- [ ] Unit tests cover new functionality
- [ ] Unit tests cover edge cases
- [ ] Mocks are properly cleaned up

### Integration (NEW - MANDATORY FOR UI STORIES)
- [ ] **Manual browser testing performed**
  - [ ] Tested locally with `pnpm dev`
  - [ ] Verified in Chrome/Edge browser
  - [ ] User journey works end-to-end
- [ ] **Integration with dependencies verified**
  - [ ] Import/export chains complete
  - [ ] Event bus subscriptions working
  - [ ] State management connected
- [ ] **No mock implementations in production code**
  - [ ] All `TODO` comments addressed or documented
  - [ ] Mock data replaced with real implementations
  - [ ] Approval flows connected to real handlers

### Localization
- [ ] Translation keys added for all user-facing strings
- [ ] English (en.json) translations present
- [ ] Vietnamese (vi.json) translations present

### Reviewer Sign-off
- [ ] I have manually tested this feature in a browser
- [ ] I confirm integration with dependent components works
- [ ] I have verified no mock implementations remain
```

---

## Integration Testing Scenarios

> [!NOTE]
> These scenarios MUST be executed **manually in a browser** before any E2E readiness claim. Automated E2E tests (Playwright/Cypress) are a future enhancement but do not replace manual verification.

### Scenario 1: Agent Configuration → Connection Test

**User Journey:** Configure OpenRouter API key and test connection

**Prerequisites:**
- Valid OpenRouter API key
- Dev server running (`pnpm dev`)

**Steps:**
1. Open IDE at `http://localhost:3000`
2. Open a project
3. Click on "Agents" in the sidebar
4. Click "Add Agent" or "Configure"
5. Enter OpenRouter API key
6. Select a model from the dropdown
7. Click "Test Connection"
8. Verify: Success message appears within 5 seconds

**Expected Behavior:**
- [ ] API key is saved to IndexedDB (persists across refresh)
- [ ] Model dropdown populates with available models
- [ ] Test connection button shows loading state
- [ ] Success/failure feedback is displayed

**Failure Indicators:**
- API key not persisted after page refresh
- Model dropdown shows empty or error
- Test connection never completes or crashes

---

### Scenario 2: Chat Message → Streaming Response

**User Journey:** Send a message and receive streaming response

**Prerequisites:**
- Agent configured with valid API key (Scenario 1 passed)
- Dev server running

**Steps:**
1. Open IDE and project
2. Navigate to Chat panel
3. Type "Hello, how can you help me?" in the input
4. Press Enter or click Send
5. Observe response streaming in

**Expected Behavior:**
- [ ] Message appears in chat history immediately
- [ ] Loading/typing indicator shows
- [ ] Response streams in token-by-token (not all at once)
- [ ] Response completes and typing indicator disappears

**Failure Indicators:**
- Message not sent (input clears but nothing happens)
- Response appears all at once (not streaming)
- "Mock" or hardcoded response appears
- Error or crash

---

### Scenario 3: Tool Execution → File Operation

**User Journey:** Agent creates a file and user approves

**Prerequisites:**
- Agent configured (Scenario 1 passed)
- Chat working (Scenario 2 passed)

**Steps:**
1. Send message: "Create a file called test.txt with content 'Hello World'"
2. Observe agent planning response
3. Observe ApprovalOverlay appearing for `write_file` tool
4. Click "Approve"
5. Observe file creation confirmation
6. Check FileTree for new file
7. Click file to open in Monaco Editor
8. Verify content is "Hello World"

**Expected Behavior:**
- [ ] Agent calls `write_file` tool (shown in ToolCallBadge)
- [ ] ApprovalOverlay appears with file details
- [ ] Approve/Reject buttons are functional
- [ ] After approval, file appears in FileTree
- [ ] File content is correct in Monaco Editor
- [ ] Event emissions trigger UI updates (no manual refresh needed)

**Failure Indicators:**
- No tool call shown (chat only shows text)
- ApprovalOverlay does not appear or is mock-triggered only
- File not created in FileTree after approval
- Manual refresh required to see changes

---

### Scenario 4: Terminal Command Execution

**User Journey:** Agent runs a terminal command

**Prerequisites:**
- All previous scenarios passed
- Project with valid package.json

**Steps:**
1. Send message: "Run `npm --version` to check npm version"
2. Observe agent planning response
3. Observe ApprovalOverlay for `execute_command` tool
4. Click "Approve"
5. Observe terminal panel showing command execution
6. Observe output appearing in terminal

**Expected Behavior:**
- [ ] Agent calls `execute_command` tool
- [ ] ApprovalOverlay shows command to be executed
- [ ] Terminal shows command running
- [ ] Terminal shows output (npm version number)
- [ ] Agent response includes command result

**Failure Indicators:**
- No terminal output
- Command runs in WebContainer but no UI feedback
- Agent response doesn't include execution result

---

### Scenario 5: State Persistence

**User Journey:** Verify state persists across page refresh

**Prerequisites:**
- Scenario 1 passed (agent configured)

**Steps:**
1. Configure agent with API key and model
2. Refresh page (F5 or Ctrl+R)
3. Open Agent Configuration dialog
4. Verify API key is still configured (shown as masked or "configured")
5. Verify selected model is still selected
6. Test connection to verify key works

**Expected Behavior:**
- [ ] API key persists in IndexedDB
- [ ] Model selection persists
- [ ] Connection test still works after refresh

**Failure Indicators:**
- API key gone after refresh
- Model selection reset to default
- Error messages about missing credentials

---

### Scenario 6: Multi-Tool Workflow

**User Journey:** Agent executes multiple tools in sequence

**Prerequisites:**
- All previous scenarios passed

**Steps:**
1. Send message: "Create a file hello.ts with console.log('Hello') and then run it with ts-node"
2. Observe agent planning multiple steps
3. Approve `write_file` tool execution
4. Observe file creation
5. Approve `execute_command` tool execution
6. Observe terminal output
7. Observe final agent response

**Expected Behavior:**
- [ ] Agent plans multiple tool calls
- [ ] Each tool call gets its own approval
- [ ] File is created successfully
- [ ] Command executes successfully
- [ ] Final response summarizes actions taken

**Failure Indicators:**
- Agent only executes one tool
- Tool calls are not shown in UI
- State inconsistency between tools

---

## Story-Specific Integration Requirements

### Epic 25 Stories: AI Foundation Sprint

#### 25-1: TanStack AI Integration Setup

**Current State:** `/api/chat` route and `useAgentChat` hook exist but are NOT wired to UI.

**Integration Requirements:**
- [ ] `AgentChatPanel.tsx` MUST import and use `useAgentChat` hook
- [ ] Remove all `window.setTimeout` mock responses
- [ ] Connect streaming to `StreamingMessage` component
- [ ] Test: Scenario 2 (Chat Message → Streaming Response) MUST pass

#### 25-2: Implement File Tools

**Current State:** `FileToolsFacade` exists with tests passing, but tool execution not visible in UI.

**Integration Requirements:**
- [ ] `read_file`, `write_file`, `list_files` tools wired to `AgentChatPanel`
- [ ] ToolCallBadge displays for each file tool invocation
- [ ] Events trigger FileTree refresh
- [ ] Test: Scenario 3 (Tool Execution → File Operation) MUST pass

#### 25-3: Implement Terminal Tools

**Current State:** `TerminalToolsFacade` exists with tests passing, but terminal output not visible.

**Integration Requirements:**
- [ ] `execute_command` tool wired to XTerminal component
- [ ] Terminal shows command output in real-time
- [ ] Shell session management working
- [ ] Test: Scenario 4 (Terminal Command Execution) MUST pass

#### 25-4: Wire Tool Execution to UI

**Current State:** Components exist but not connected to real tool execution.

**Integration Requirements:**
- [ ] `useAgentChatWithTools` hook integrated with UI
- [ ] Tool execution lifecycle visible (pending → running → success/error)
- [ ] ToolCallBadge shows accurate status
- [ ] Test: All tool-related scenarios MUST pass

#### 25-5: Implement Approval Flow

**Current State:** `ApprovalOverlay` exists but only triggered by mock button.

**Integration Requirements:**
- [ ] ApprovalOverlay triggered by real tool calls requiring approval
- [ ] Remove `triggerMockApproval` button from production
- [ ] Approve/Reject handlers connected to real tool execution
- [ ] Test: Approval flow in Scenario 3 and 4 MUST work

#### 25-6: Wire Agent UI to Providers

**Current State:** `AgentConfigDialog` has credential vault integration but persistence unverified.

**Integration Requirements:**
- [ ] API key persistence verified in browser (Scenario 5)
- [ ] Model selection connected to real `modelRegistry`
- [ ] Connection test uses real provider adapter
- [ ] Test: Scenario 1 and 5 MUST pass

### Epic 28 Stories: UX Brand Identity (Chat Components)

#### 28-16: Agent Config Flow

**Current State:** Mock implementation, not connected to Epic 25 infrastructure.

**Integration Requirements:**
- [ ] Connect to `credentialVault` for persistent storage
- [ ] Connect to `modelRegistry` for dynamic model loading
- [ ] Connect to `providerAdapter` for connection testing
- [ ] Test: Scenario 1 MUST pass

#### 28-19 to 28-23: Chat UI Components

**Current State:** Components exist but not receiving real data.

**Integration Requirements:**
- [ ] All components receive real data from `useAgentChatWithTools`
- [ ] ToolCallBadge shows real tool calls
- [ ] CodeBlock shows real file content
- [ ] DiffPreview shows real file diffs
- [ ] StreamingMessage shows real streaming tokens
- [ ] ApprovalOverlay connected to real approval flow
- [ ] Test: All scenarios involving chat UI MUST pass

---

## Re-Prioritized E2E Testing Requirements

### Priority 1 (P0) - Critical Path

These must work before ANY E2E testing claim:

1. **Agent Configuration + Persistence** (Scenario 1 + 5)
   - API key storage in IndexedDB
   - Model selection persistence
   - Connection testing

2. **Basic Chat Flow** (Scenario 2)
   - Message sending
   - Streaming response
   - No mock responses

### Priority 2 (P1) - Core Functionality

These must work for "MVP E2E Ready" status:

3. **File Tool Execution** (Scenario 3)
   - `write_file` with approval
   - FileTree auto-refresh
   - Monaco Editor integration

4. **Terminal Tool Execution** (Scenario 4)
   - `execute_command` with approval
   - Terminal output visibility

### Priority 3 (P2) - Full Workflow

These prove complete agentic capability:

5. **Multi-Tool Workflow** (Scenario 6)
   - Sequential tool execution
   - State consistency
   - Final response summarization

6. **State Persistence** (Scenario 5)
   - All settings persist across refresh
   - Conversation history persists

---

## Remediation Timeline

| Phase | Scope | Estimated Effort | Completion Criteria |
|-------|-------|------------------|---------------------|
| **Phase 1** | P0 Integration Fixes | 1 day | Scenario 1, 2, 5 pass |
| **Phase 2** | P1 Tool Wiring | 1 day | Scenario 3, 4 pass |
| **Phase 3** | P2 Full Workflow | 0.5 day | Scenario 6 passes |
| **Phase 4** | Verification & Governance | 0.5 day | All DoD items complete |

**Total Estimated Effort:** 3 days

---

## Next Steps

1. **Immediate (Today):**
   - Share this document with development team
   - Begin Phase 1 integration fixes
   - Set up manual testing environment

2. **Short-term (This Week):**
   - Complete all phase work
   - Execute all integration scenarios
   - Update story files with passing scenarios

3. **Long-term (Next Sprint):**
   - Implement automated E2E tests (Playwright)
   - Add CI/CD integration for E2E tests
   - Create E2E test dashboard

---

## Appendix: Evidence Files

- **Root Cause Analysis:** [root-cause-analysis-e2e-validation-failure-2025-12-24.md](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/critical-incidents/root-cause-analysis-e2e-validation-failure-2025-12-24.md)
- **Flawed Validation Report:** [e2e-testing-readiness-validation-2025-12-24.md](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/validation/e2e-testing-readiness-validation-2025-12-24.md)
- **Emergency Handoff:** [bmad-master-to-sm-pm-emergency-course-correction-2025-12-24.md](file:///c:/Users/Admin/Documents/coding-project/project-alpha-master/project-alpha-master/_bmad-output/handoffs/bmad-master-to-sm-pm-emergency-course-correction-2025-12-24.md)

---

**Document Status:** COMPLETE  
**Next Review:** After Phase 1 completion  
**Owner:** Bob (Scrum Master)  
**Approved By:** Pending BMAD Master review
