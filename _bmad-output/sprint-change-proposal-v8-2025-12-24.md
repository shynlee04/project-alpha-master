# Sprint Change Proposal v8: Phase 3 Foundation Fixes

**Date:** 2025-12-24T19:30:00+07:00  
**Type:** Story Completion + Architectural Decision  
**Scope:** Minor (Direct implementation by dev team)

---

## Issue Summary

During Phase 3 foundation fixes, code was implemented without updating existing story artifacts. The changes need to be properly attributed to existing stories:

### Code Changes Made

| File | Change | Lines |
|------|--------|-------|
| `src/lib/agent/system-prompt.ts` | NEW | 94 |
| `src/components/ide/AgentChatPanel.tsx` | MODIFIED | +35 |

### Build Verification
- ✅ `pnpm build` exit code 0 (7.66s)

---

## Impact Analysis

### Epic Impact

| Epic | Impact |
|------|--------|
| Epic 25: AI Foundation Sprint | Story 25-R1 Task T2 completed |
| Epic 12: Agent Tool Interface Layer | No change - 12-5 already done |

### Story Impact

| Story | Current Status | Change |
|-------|----------------|--------|
| 25-R1 | review | Task T2 completed, Task T19-T20 added |

### Architectural Decision

**NEW ADR: System Prompt for Coding Agent**

The `system-prompt.ts` file introduces:
- Agent identity ("senior software engineer")
- Workflow pattern (Understand → Plan → Execute → Verify)
- Tool usage rules
- Output formatting guidelines

This is an **architectural decision** that was not captured in existing stories.

---

## Recommended Approach: Direct Adjustment

### Option A: Extend Story 25-R1 (Recommended)

Add new tasks to Story 25-R1:
- T19: Wire real FileToolsFacade and TerminalToolsFacade to hook ✅
- T20: Create system-prompt.ts with coding agent instructions ✅

**Rationale:** Task T2 originally said "null for now" - these changes complete that task plus add system prompt.

### Option B: Create ADR for System Prompt

Create new ADR document: `ADR-XX-coding-agent-system-prompt.md`

**Rationale:** System prompt is a significant architectural pattern that should be documented.

---

## Detailed Change Proposals

### Story 25-R1 Updates

**Section: Tasks**

```diff
- - [x] T2: Initialize file/terminal tools (null for now - future story)
+ - [x] T2: Initialize file/terminal tools using existing facades ✅
+ - [x] T19: Wire FileToolsFacade and TerminalToolsFacade from WorkspaceContext ✅
+ - [x] T20: Create system-prompt.ts with coding agent identity/workflow/rules ✅
```

**Section: Files Changed**

Add:
```
| src/lib/agent/system-prompt.ts | CREATED | 94 | 4 |
```

**Section: Dev Agent Record - Session 4**

Add new session entry:
```
Session 4: 2025-12-24T19:15:00+07:00 → 2025-12-24T19:25:00+07:00
Platform: A (Antigravity)
```

---

## Implementation Handoff

**Scope Classification:** Minor

**Actions Required:**
1. Update Story 25-R1 with Tasks T19, T20
2. Update 25-R1-context.xml with new files
3. Update sprint-status.yaml with Session 4 notes
4. Update bmm-workflow-status.yaml last_updated

**Assigned to:** Development team (self-update)

**Success Criteria:**
- Story 25-R1 accurately reflects all completed work
- No orphan story artifacts (MVP-3-1 removed)
- sprint-status.yaml reflects current state

---

**Document Status:** DRAFT - Awaiting User Approval
