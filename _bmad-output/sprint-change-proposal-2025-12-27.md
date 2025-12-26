# Sprint Change Proposal - Course Correction
**Date**: 2025-12-27
**Severity**: P0 - Critical
**Scope**: MAJOR - Fundamental Replan Required
**Author**: BMAD Master Orchestrator

---

## Issue Summary

### Problem Statement
The project has experienced complete development stagnation due to systemic failures across:
1. **Governance**: Status inconsistencies, false completion reports, context poisoning from 137+ artifact files
2. **Architecture**: State management confusion (Zustand/TanStack Store/Context), incomplete component wiring
3. **Knowledge**: Superficial understanding of TanStack AI SDK, WebContainers, coding agent patterns
4. **Implementation**: Components exist but aren't wired, dead code throughout, mock implementations

### Evidence
- Build error on startup (`setOpenFiles is not defined`) - FIXED
- Chat API returning 404/500 errors
- Agent configuration not persisting
- Tool execution facades exist but not connected to UI
- 137 artifact files in sprint-artifacts folder causing context poisoning
- Governance documents contradict each other

---

## Impact Analysis

### Epic Impact
| Epic | Status | Impact |
|------|--------|--------|
| MVP | IN_PROGRESS | All 7 stories blocked by foundation issues |
| Epic 12, 25, 28 | SUPERSEDED | Dead code remains in codebase |
| Epic 7, 11, 21, 23, 26, 27 | BACKLOG | Indefinitely blocked |

### Story Impact
| Story | Status | Issue |
|-------|--------|-------|
| MVP-1 | in-progress | 2/7 criteria implemented, marked as complete prematurely |
| MVP-2 | backlog | No E2E verification despite claims |
| MVP-3-7 | backlog | Dependency violations |

### Artifact Conflicts
- `sprint-status-consolidated.yaml` vs `bmm-workflow-status-consolidated.yaml` - Status mismatch
- 137 files in sprint-artifacts - Context poisoning
- Multiple overlapping epic files

### Technical Impact
- State management: 3 different systems (Zustand, TanStack Store, Context)
- Persistence: 2 systems (IndexedDB raw, Dexie)
- Event bus: Partial integration
- Component wiring: Many components not connected

---

## Recommended Approach

### Path: **Fundamental Replan + Implementation Sprint**

**Rationale**: The issues are too systemic for incremental fixes. A structured sprint targeting specific objectives is required.

### Sprint Structure

#### DAY 1: Foundation Research & Governance Cleanup
- [x] Execute TanStack AI SDK research (MCP tools)
- [ ] Archive dead artifacts (move 100+ files)
- [ ] Create single MVP governance file
- [ ] Document state management architecture

#### DAY 2-3: Core Implementation Fixes
- [ ] Fix Chat API route configuration
- [ ] Wire AgentChatPanel to real hooks
- [ ] Wire Agent Config to persistence
- [ ] Wire Tool facades to UI

#### DAY 4-5: Integration & Verification
- [ ] E2E testing of full workflow
- [ ] Screenshot evidence capture
- [ ] Documentation updates

### Effort Estimate
- **Duration**: 5 days intensive
- **Risk**: Medium (requires focused execution)
- **Success Criteria**: Full E2E workflow working

---

## Detailed Change Proposals

### 1. Governance Cleanup

**OLD**:
```
_bmad-output/sprint-artifacts/
├── 137 files (context poisoning)
├── Multiple conflicting status files
└── Dead epic artifacts
```

**NEW**:
```
_bmad-output/sprint-artifacts/
├── sprint-status.yaml (single source of truth)
├── mvp-epic.md (consolidated epic)
├── mvp-1-agent-configuration.md
├── mvp-2-chat-interface.md
├── ... (only active stories)
└── archive/ (historical artifacts)
```

**Rationale**: Reduce context load, eliminate contradictions

---

### 2. State Management Consolidation

**OLD**:
- Zustand stores (partial)
- TanStack Store (legacy)
- React Context (scattered)
- Raw IndexedDB
- Dexie

**NEW**:
- Zustand for runtime state
- Dexie for persistence
- Event bus for cross-component communication

**Files to Modify**:
- `src/lib/state/` - Consolidate stores
- `src/hooks/` - Update hooks to use Zustand
- `src/lib/workspace/` - Migrate to Dexie

---

### 3. Component Wiring

**Components to Wire**:

| Component | Backend Hook | Status |
|-----------|--------------|--------|
| AgentChatPanel | useAgentChatWithTools | Partial |
| AgentConfigDialog | useAgents + credentialVault | Broken |
| ApprovalOverlay | pendingApprovals from hook | Not wired |
| ToolCallBadge | toolCalls from hook | Not wired |
| FileTree | workspace events | Partial |
| Monaco | file change events | Partial |
| Terminal | webcontainer events | Working |

---

### 4. TanStack AI Integration Fix

**Current Issue**: Wrong API patterns, incorrect hook usage

**Correct Pattern** (from MCP research):

```typescript
// CORRECT: TanStack AI useChat with tools
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools, createChatClientOptions } from "@tanstack/ai-client";

const tools = clientTools(readFileTool, writeFileTool, executeCommandTool);

const { messages, sendMessage, addToolApprovalResponse, isLoading } = useChat({
  connection: fetchServerSentEvents("/api/chat"),
  tools,
});

// Tool with approval
const writeFileTool = toolDefinition({
  name: 'write_file',
  description: 'Write content to a file',
  needsApproval: true,  // <-- Triggers approval flow
  inputSchema: z.object({
    path: z.string(),
    content: z.string()
  }),
  outputSchema: z.object({
    success: z.boolean()
  })
}).client(async ({ path, content }) => {
  // Execute on client side (browser)
  await workspace.writeFile(path, content);
  return { success: true };
});
```

---

## Implementation Handoff

### Scope Classification: **MAJOR**

### Route to: PM + Architect + Dev Team

### Handoff Recipients:
1. **BMAD PM Agent**: Update epics, create clean story files
2. **BMAD Architect Agent**: Validate state management consolidation
3. **BMAD Dev Agent**: Execute implementation fixes

### Success Criteria:
1. Single `sprint-status.yaml` as source of truth
2. All MVP stories have clear acceptance criteria
3. Full E2E workflow: Configure → Chat → Execute → Approve → Iterate
4. Screenshot evidence for each completed story
5. No build errors on startup

---

## Approval Status

**Approved by**: Admin (YOLO mode)
**Approval Date**: 2025-12-27T02:33:00+07:00
**Execution Mode**: Immediate

---

## Next Actions

1. ✅ Execute MCP research (TanStack AI SDK) - COMPLETED
2. 🔄 Create knowledge synthesis document
3. 🔄 Archive dead artifacts
4. 🔄 Fix component wiring
5. 🔄 Verify E2E workflow
