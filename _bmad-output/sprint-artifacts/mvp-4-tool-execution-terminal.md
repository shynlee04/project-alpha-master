# Story: MVP-4 Tool Execution - Terminal Commands

## Story Context
- **Epic:** MVP (AI Coding Agent Vertical Slice)
- **Platform:** Platform A (Antigravity)
- **Incident:** INC-2025-12-24-001 (browser E2E required)
- **Depends on:** MVP-3 Tool Execution - Files (in-progress)
- **Created:** 2025-12-25T17:57:00+07:00

---

## User Story

**As a** developer using the AI coding agent,  
**I want** the agent to execute terminal commands with user approval,  
**So that** I can leverage AI to run scripts, install packages, and verify code changes while maintaining control over command execution.

---

## Acceptance Criteria

### AC-1: Command Request
**Given** an active chat session with the agent  
**When** the agent requests to execute a terminal command  
**Then** the approval dialog shows:
- Command to execute (with syntax highlighting)
- Arguments (if any)
- Working directory
- Risk level badge ("HIGH")

### AC-2: Command Execution
**Given** the user approves a command execution  
**When** the command runs in WebContainer  
**Then**:
- Output streams in real-time to terminal panel
- stdout and stderr are captured
- Exit code is reported to agent
- Process events emit (`process:started`, `process:output`, `process:exited`)

### AC-3: Terminal Panel Integration
**Given** a command is executing  
**When** user views the terminal panel  
**Then**:
- Command appears in terminal history
- Output displays with proper formatting
- Exit status is visible (✓ success / ✗ failure)

### AC-4: Working Directory
**Given** a project is loaded with path `/project/myapp`  
**When** the agent executes a command  
**Then**:
- Working directory defaults to project path
- Agent can specify alternative cwd if needed
- `npm install` correctly finds `package.json`

### AC-5: Error Handling
**Given** a command fails or times out  
**When** the agent receives the result  
**Then**:
- Error message is surfaced in chat UI
- Agent can retry with different approach
- Timeout default is 2 minutes (configurable)

### AC-6: Denial Flow
**Given** the user denies a command execution  
**When** the denial is processed  
**Then**:
- Agent receives denial notification
- No command is executed
- Agent can acknowledge and continue conversation

---

## Tasks

### Research (T1-T2)
- [ ] T1: Load AGENTS.md and agent architecture guidelines
- [ ] T2: Verify TanStack AI tool approval pattern matches implementation

### Implementation (T3-T7)
- [ ] T3: Wire `execute_command` tool to `AgentChatPanel` with approval UI
- [ ] T4: Implement real-time output streaming to terminal panel  
- [ ] T5: Add cwd (working directory) integration with `WorkspaceContext`
- [ ] T6: Implement denial flow with agent notification
- [ ] T7: Add error handling and timeout UI feedback

### Testing (T8-T10)
- [ ] T8: Unit tests for approval flow wiring
- [ ] T9: Integration test: command → approval → execute → output
- [ ] T10: Browser E2E verification with screenshot (MANDATORY)

### Documentation (T11)
- [ ] T11: Update Dev Agent Record, sprint-status, bmm-workflow-status

---

## Research Requirements

### TanStack AI
- Tool architecture: `toolDefinition().client()` pattern
- Approval flow: `addToolApprovalResponse({ id, approved })`
- Tool states: `approval-requested`, `output`, `output-error`

### WebContainer
- `spawn()` for command execution
- Process output streaming via `WritableStream`
- Exit code handling

### Existing Implementation
- `TerminalToolsFacade` in `src/lib/agent/facades/terminal-tools-impl.ts`
- `execute-command-tool.ts` with `needsApproval: true`
- Events: `process:started`, `process:output`, `process:exited`

---

## Dev Notes

### Architecture Pattern
```
AgentChatPanel → useAgentChatWithTools → execute_command tool
                                              ↓
                                   ApprovalOverlay (HIGH risk)
                                              ↓
                              TerminalToolsFacade.executeCommand()
                                              ↓
                                   WebContainer.spawn()
                                              ↓
                              EventBus → Terminal Panel UI
```

### Key Files
- `src/lib/agent/tools/execute-command-tool.ts` - Tool definition
- `src/lib/agent/facades/terminal-tools-impl.ts` - Execution facade
- `src/components/chat/ApprovalOverlay.tsx` - Approval UI
- `src/lib/webcontainer/manager.ts` - WebContainer spawn

### Existing Tests (verify compatibility)
- `execute-command-tool.test.ts` - 6 test cases
- `terminal-tools.test.ts` - Facade tests

---

## References
- Sprint status: `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`
- Workflow status: `_bmad-output/bmm-workflow-status-consolidated.yaml`
- Agent architecture: `_bmad-output/architecture/agent-architecture-guidelines-2025-12-24.md`
- Epic 29 (post-MVP): `_bmad-output/epics/epic-29-agentic-execution-loop.md`

---

## Dev Agent Record
*(To be filled during development)*

**Agent:** TBD  
**Session:** TBD

### Task Progress
*(Updated as tasks complete)*

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| TBD | TBD | TBD |

### Tests Created
- TBD

### Decisions Made
- TBD

---

## Code Review
*(To be filled during review)*

---

## Status History

| Date | Status | Platform | Notes |
|------|--------|----------|-------|
| 2025-12-25 | drafted | Platform A | Story file created |
