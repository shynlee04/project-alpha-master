# Sprint Change Proposal: Epic 29 - Agentic Execution Loop

**Proposal ID:** SCP-2025-12-25-001  
**Date:** 2025-12-25  
**Author:** BMAD Master (Scrum Master persona)  
**Status:** PROPOSED  
**Priority:** P0 - Blocking Feature

---

## 1. Issue Summary

### Problem Statement
During E2E testing of MVP-3 (Tool Execution - File Operations), agents demonstrated inability to perform multi-step tasks autonomously. After executing a single tool call, agents stop and wait for user re-prompting instead of continuing with subsequent operations.

### Discovery Context
- **When:** 2025-12-25 during MVP-3 testing
- **How:** Manual agent testing revealed agents "hanging" after first tool execution
- **Evidence:** User reports from Vietnamese testers showing agent stuck states

### Root Cause
The `use-agent-chat-with-tools.ts` hook passes `tools` to TanStack AI's `useChat()` but **does NOT configure `agentLoopStrategy`**, causing single-shot tool execution instead of iterative agentic behavior.

```typescript
// CURRENT (Broken)
const chatOptions = {
  connection,
  tools: agentTools.getClientTools(),
  // ❌ MISSING: agentLoopStrategy
};

// REQUIRED (Fix)
const chatOptions = {
  connection,
  tools: agentTools.getClientTools(),
  agentLoopStrategy: maxIterations(10),  // ← ENABLES MULTI-STEP
};
```

---

## 2. Impact Analysis

### Epic Impact
| Epic | Impact | Description |
|------|--------|-------------|
| **MVP** | ⚠️ Blocked | Multi-step tool workflows broken |
| Epic-12 | N/A | Tool interface layer complete |
| Epic-25 | N/A | Chat foundation complete |

### Story Impact
| Story | Status | Change Required |
|-------|--------|----------------|
| MVP-3 | In-Progress | Can test single file ops, but not chained |
| MVP-4 | Backlog | Terminal + File combos blocked |
| MVP-5 | Backlog | Approval flow works per-tool but not per-step |
| MVP-7 | Backlog | E2E test will fail multi-step scenarios |

### User Experience Impact
- Users must manually prompt for each operation step
- Agent appears "stuck" after first tool execution
- Autonomous task completion impossible
- Via-gent is inferior to Cursor/Windsurf/Roo Code without this

---

## 3. Recommended Approach

### Direct Adjustment: Create Epic 29 (Post-MVP)

**Rationale:** 
- MVP can continue with single-tool verification
- Epic 29 adds complex iteration logic that should be separately tested
- Phased implementation reduces risk
- Estimated: 10 story points (4 stories)

### Epic 29 Stories

| Story | Title | Points | Description |
|-------|-------|--------|-------------|
| 29-1 | Implement AgentLoopStrategy | 3 | Add `maxIterations(10)` to hook |
| 29-2 | Agent Loop State Tracking | 3 | Emit iteration events, UI progress |
| 29-3 | Smart Termination Strategies | 2 | `combineStrategies()`, stuck detection |
| 29-4 | Error Recovery & Handoff | 2 | Consecutive failure handling |

### Timeline Impact
- **Without Epic 29:** MVP completes with single-tool verification
- **With Epic 29:** Adds ~1 week post-MVP for full agentic capability

### Risk Assessment
| Risk | Level | Mitigation |
|------|-------|-----------|
| Infinite loop | Medium | `maxIterations(15)` hard cap |
| User confusion | Low | Iteration progress UI |
| Tool cascading failures | Low | Error-in-output pattern |

---

## 4. Detailed Change Proposals

### Change 1: Create Epic 29 File

**File:** `_bmad-output/epics/epic-29-agentic-execution-loop.md`

**Action:** CREATE new epic file with 4 stories

---

### Change 2: Update Sprint Status

**File:** `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml`

**Section:** `backlog_epics`

**OLD:**
```yaml
backlog_epics:
  epic-7: "Git Integration [P2]"
  # ...
```

**NEW:**
```yaml
backlog_epics:
  epic-29: "Agentic Execution Loop [P0 - Post-MVP]"
    notes: "Enables multi-step autonomous agent execution"
    priority: P0
    points: 10
    stories: 4
    
  epic-7: "Git Integration [P2]"
  # ...
```

---

### Change 3: Link Research Artifact

**File:** `_bmad-output/research/agentic-execution-loop-deep-research-2025-12-25.md`

**Action:** Already created, contains:
- TanStack AI API signatures
- Industry agentic patterns (ReAct, Reflexion)
- Implementation code snippets
- Validation checklist

---

## 5. Implementation Handoff

### Scope Classification: **Moderate**

The change requires:
1. Creating new epic file (SM)
2. Updating sprint status (SM)
3. Story development after MVP (Dev)

### Handoff Routes

| Recipient | Deliverable |
|-----------|-------------|
| Product Owner | This Sprint Change Proposal for approval |
| Scrum Master | Epic 29 creation + backlog update |
| Development | Story implementation (post-MVP) |

### Success Criteria
- [ ] Epic 29 file created with 4 stories
- [ ] Sprint-status updated with Epic 29 in backlog
- [ ] Research artifact linked to epic
- [ ] User approves proposal

---

## 6. User Decision Required

### Options

**Option A: Add to Post-MVP Backlog (Recommended)**
- Complete MVP-3/4/5 with single-tool verification
- Execute Epic 29 immediately after MVP-7
- Estimated: +1 week post-MVP

**Option B: Pause MVP, Implement Now**
- Block MVP progress
- Higher risk, longer timeline
- Better immediate agent capability

**Option C: Quick-Fix Only**
- Add `maxIterations(3)` without state tracking
- Technical debt for later cleanup
- Fastest path to basic multi-step

---

**Author:** BMAD Master  
**Next Action:** Request user approval for Option A/B/C
