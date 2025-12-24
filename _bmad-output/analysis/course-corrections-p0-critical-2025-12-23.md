# Course Corrections - P0 Critical Issues Only

**Task ID**: CC-2025-12-23-002  
**Analysis Date**: 2025-12-23  
**Project**: Via-Gent (Browser-based IDE with AI Agent Capabilities)

---

## Executive Summary

Via-Gent is currently at **35% E2E readiness** with **3 P0 blockers** preventing end-to-end testing of AI agent capabilities. The core AI agent infrastructure (Epic 25) and chat UI components (Epic 28) are implemented but not fully wired together.

**Critical Gaps:**
1. Chat API returns empty tools array - agents cannot execute file/terminal operations
2. Approval flow UI exists but not integrated - security gap for destructive operations
3. Event bus subscriptions incomplete - UI won't update when agents modify files

**Estimated Timeline:** 4-6 days to reach E2E readiness

**Impact:** Without addressing these P0 issues, the AI agent system cannot be tested end-to-end, blocking validation of the core value proposition.

---

## P0 Issues Table

| Issue ID | Location | Impact | Root Cause | Effort | Dependencies |
|----------|----------|--------|------------|--------|--------------|
| CC-P0-001 | `src/routes/api/chat.ts:106-117` | AI agents cannot execute any file/terminal operations | Story 25-4 marked "done" but actual tool wiring incomplete | 2-3 days | WebContainer instance available |
| CC-P0-002 | `src/lib/agent/hooks/use-agent-chat-with-tools.ts:221-248` | Security gap - agents can execute destructive operations without user consent | Story 25-5 in backlog, approval methods exist but UI not integrated | 1-2 days | CC-P0-001 |
| CC-P0-003 | Stories 28-24, 28-25, 28-26 | UI won't update when agents modify files | Event system exists but components don't subscribe | 1-2 days | CC-P0-001 |

---

## Remediation Workflow (P0 Only)

### Phase 1: Wire Tool Facades to Chat API (CC-P0-001)
**Priority:** Highest - Blocks all agent functionality

1. **Initialize WebContainer in API context**
   - Modify `getTools()` to accept WebContainer instance
   - Create facades with WebContainer reference
   - Register tools from `src/lib/agent/tools/index.ts`

2. **Add tool schemas to API response**
   - Export tool definitions from tool registry
   - Format for TanStack AI compatibility
   - Test tool discovery via `/api/chat`

**Success Criteria:**
- `/api/chat` returns non-empty tools array
- Tools include `read`, `write`, `list`, `execute`
- Facades properly initialized with WebContainer

**Dependencies:** None (can start immediately)

---

### Phase 2: Integrate Approval Flow UI (CC-P0-002)
**Priority:** High - Security requirement

1. **Wire ApprovalOverlay to useAgentChatWithTools**
   - Import `ApprovalOverlay` component
   - Add approval state management
   - Show overlay on tool execution requests

2. **Implement approval callbacks**
   - `onApprove`: Execute tool and return result
   - `onReject`: Return error to agent
   - Handle timeout scenarios

**Success Criteria:**
- Approval overlay appears before destructive operations
- User can approve/reject tool execution
- Agent receives approval decision

**Dependencies:** CC-P0-001 (tools must be wired first)

---

### Phase 3: Subscribe Components to Event Bus (CC-P0-003)
**Priority:** Medium - UX completeness

1. **FileTree (Story 28-24)**
   - Subscribe to `file:created`, `file:updated`, `file:deleted`
   - Refresh tree on file changes
   - Maintain selection state

2. **Monaco Editor (Story 28-25)**
   - Subscribe to `file:updated` events
   - Reload content if current file modified
   - Show unsaved changes warning

3. **Terminal (Story 28-26)**
   - Subscribe to `terminal:output` events
   - Update terminal display
   - Handle command completion

**Success Criteria:**
- FileTree updates when agent creates/modifies files
- Monaco reloads content when agent edits current file
- Terminal shows agent command output

**Dependencies:** CC-P0-001 (events fire after tool execution)

---

## Immediate Actions Required

### Action 1: Wire Tool Facades to Chat API (Start Now)
- **File:** `src/routes/api/chat.ts`
- **Change:** Replace empty `getTools()` with actual tool registration
- **Owner:** Dev agent
- **Timeline:** 2-3 days

### Action 2: Integrate Approval Flow UI (After Action 1)
- **File:** `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
- **Change:** Wire `ApprovalOverlay` component to approval methods
- **Owner:** Dev agent
- **Timeline:** 1-2 days

### Action 3: Subscribe Components to Event Bus (After Action 1)
- **Files:** `src/components/ide/FileTree/FileTree.tsx`, `src/components/ide/MonacoEditor/MonacoEditor.tsx`, `src/components/ide/XTerminal.tsx`
- **Change:** Add event subscriptions for file/terminal changes
- **Owner:** Dev agent
- **Timeline:** 1-2 days

---

## Decision Points for Stakeholders

1. **Approval Flow Design:** Should destructive operations require approval for every execution, or allow batch approvals?
2. **Event Bus Granularity:** Should components subscribe to specific file paths or all file events?
3. **Testing Strategy:** Should E2E tests be written after P0 fixes or in parallel?

---

## Next Steps

1. **Immediate:** Assign Dev agent to CC-P0-001 (wire tool facades)
2. **Day 2-3:** Complete CC-P0-001 and begin CC-P0-002 (approval flow)
3. **Day 4-5:** Complete CC-P0-002 and begin CC-P0-003 (event subscriptions)
4. **Day 6:** Complete CC-P0-003 and run E2E validation tests

**Target E2E Readiness:** 100% by end of Day 6

---

**Document Status:** Draft  
**Last Updated:** 2025-12-23  
**Next Review:** After CC-P0-001 completion