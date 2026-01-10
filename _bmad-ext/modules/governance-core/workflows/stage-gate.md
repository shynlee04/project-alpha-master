# Stage Gate - Development Stage Enforcement

**Purpose:** Enforce stage-gated development for Agent/AI/RAG/Multimodality features

**Workflow Type:** Gate / Progress Tracker

**Integration:** Works alongside auto-gate to block premature feature requests

---

## Overview

Stage Gate enforces the principle that **complex features require solid foundations**. Before requesting advanced Agent/AI features, the foundational stages must be complete.

**Five-Stage Roadmap:**

| Stage | Focus | Status | Entry Criteria |
|-------|-------|--------|----------------|
| 0 | Governance Foundation | 🟢 Current | None |
| 1 | Basic Agent Tools | 🔒 Locked | All 6 P0 scanners operational |
| 2 | RAG Context Management | 🔒 Locked | Read-only + CRUD tools tested |
| 3 | Multimodal I/O | 🔒 Locked | Context isolation verified |
| 4 | Advanced AI Features | 🔒 Locked | Multimodal routing tested |

---

## Stage Definitions

### Stage 0: Governance Foundation

**Focus:** Establish governance infrastructure

**Components:**
- [x] governance-core module structure
- [x] Configuration files (domains, artifact-manager, context-poisoning)
- [x] Policy files (stage-gating, remediation-ongoing)
- [ ] P0 scanners (6 total)
  - [x] agent-ai-rag-scanner (P0)
  - [x] file-structure-scanner (P0)
  - [ ] state-scanner (P0)
  - [ ] sync-scanner (P0)
  - [ ] ux-scanner (P0)
  - [ ] security-scanner (P0)

**Exit Criteria:** All 6 P0 scanners operational

**Current Status:** 2/6 scanners complete (33%)

### Stage 1: Basic Agent Tools

**Focus:** Read and write capabilities for agents

**Features:**
- Read-only tool (file access, context loading)
- CRUD tools (create, update, delete)
- Tool execution framework
- Error handling and logging

**Dependencies:**
- Stage 0 complete
- FileLockService functional
- Artifact registry integration

**Exit Criteria:** Read-only + CRUD tools tested

### Stage 2: RAG Context Management

**Focus:** Retrieval Augmented Generation for agents

**Features:**
- Context ingestion and indexing
- Semantic search over codebase
- Context window management
- Relevance scoring

**Dependencies:**
- Stage 1 complete
- Read tools mature
- Context isolation verified

**Exit Criteria:** Context isolation verified

### Stage 3: Multimodal I/O

**Focus:** Multi-modal input/output handling

**Features:**
- Image input processing
- Audio transcription (if applicable)
- Multi-modal response generation
- Media storage and retrieval

**Dependencies:**
- Stage 2 complete
- RAG system stable
- Bandwidth considerations addressed

**Exit Criteria:** Multimodal routing tested

### Stage 4: Advanced AI Features

**Focus:** Multi-agent orchestration

**Features:**
- Agent-to-agent communication
- Collaborative problem solving
- Task delegation
- Result synthesis

**Dependencies:**
- Stage 3 complete
- All previous stages stable
- Security boundaries established

**Exit Criteria:** Multi-agent orchestration safe

---

## Gate Enforcement

### Gate Check Logic

```typescript
function checkStageGate(request: string, currentStage: StageInfo): GateDecision {
  // Extract stage requirements from request
  const requiredStage = extractRequiredStage(request);

  if (requiredStage <= currentStage.number) {
    return {
      allowed: true,
      message: `Request within current stage (${currentStage.name})`
    };
  }

  // Request is for future stage - BLOCK
  const requiredStageInfo = STAGES[requiredStage];

  return {
    allowed: false,
    currentStage: currentStage,
    requiredStage: requiredStageInfo,
    blockers: identifyBlockers(currentStage, requiredStage),
    message: `Stage ${requiredStage} feature requested but currently at Stage ${currentStage.number}`
  };
}
```

### Stage Detection

```typescript
function extractRequiredStage(request: string): number {
  const lowerRequest = request.toLowerCase();

  // Stage 4 keywords
  if (/\b(multi.?agent|agent.?collaboration|agent.?delegation)\b/.test(lowerRequest)) {
    return 4;
  }

  // Stage 3 keywords
  if (/\b(image|audio|video|multimodal|transcri)\b/.test(lowerRequest)) {
    return 3;
  }

  // Stage 2 keywords
  if (/\b(rag|context.?management|semantic.?search|retrieval)\b/.test(lowerRequest)) {
    return 2;
  }

  // Stage 1 keywords
  if (/\b(crud|read.?write|file.?access|tool.?execution)\b/.test(lowerRequest)) {
    return 1;
  }

  // Stage 0 - governance work
  return 0;
}
```

---

## Gate Response Format

### BLOCK Response Example

```
🔒 BLOCKED - Stage 2 feature requested
─────────────────────────────────────────────────────────────
  Current Stage: 0 (Governance Foundation)
  Required: Complete Stage 1 (Basic Agent Tools) first

  Stage 0 Progress:
  ✅ governance-core module structure
  ✅ config files (8 files)
  ✅ policy files (4 files)
  ⏳ P0 scanners (2/6 complete)
    ✅ agent-ai-rag-scanner
    ✅ file-structure-scanner
    ⬜ state-scanner
    ⬜ sync-scanner
    ⬜ ux-scanner
    ⬜ security-scanner

  To unlock Stage 1, complete Stage 0 scanners first.

  Type 'I am aware but...' to proceed with warning (logged as debt).
─────────────────────────────────────────────────────────────
```

### ALLOW Response Example

```
✅ ALLOWED - Within current stage
─────────────────────────────────────────────────────────────
  Current Stage: 0 (Governance Foundation)
  Request: Create state-scanner

  This request is within current stage scope.

  Proceeding with workflow...
─────────────────────────────────────────────────────────────
```

---

## Stage Transition Criteria

### Transition Request

When all exit criteria for current stage are met:

```yaml
stage_transition:
  from_stage: 0
  to_stage: 1
  requested_by: "user"
  timestamp: "2026-01-15T10:00:00Z"

  exit_criteria_check:
    - criterion: "All 6 P0 scanners operational"
      status: "PASS"
      evidence:
        - "agent-ai-rag-scanner: operational"
        - "file-structure-scanner: operational"
        - "state-scanner: operational"
        - "sync-scanner: operational"
        - "ux-scanner: operational"
        - "security-scanner: operational"

  decision: "APPROVE"
  new_stage: 1
  unlocked_features:
    - "Basic Agent Tools (read-only)"
    - "Basic Agent Tools (CRUD)"
```

### Transition Gatekeeping

```typescript
function evaluateStageTransition(
  currentStage: number,
  targetStage: number
): TransitionDecision {
  if (targetStage !== currentStage + 1) {
    return {
      allowed: false,
      reason: "Can only advance to next sequential stage"
    };
  }

  const stageInfo = STAGES[currentStage];
  const unmetCriteria = stageInfo.exit_criteria.filter(
    c => !checkCriterion(c)
  );

  if (unmetCriteria.length > 0) {
    return {
      allowed: false,
      reason: "Exit criteria not met",
      unmet_criteria
    };
  }

  return {
    allowed: true,
    message: `Transitioning from Stage ${currentStage} to Stage ${targetStage}`
  };
}
```

---

## Progress Tracking

### Stage State File

```yaml
# _bmad-ext/modules/governance-core/state/stage-progress.yaml
current_stage: 0
started_at: "2026-01-10T00:00:00Z"

stages:
  0:
    name: "Governance Foundation"
    status: "in_progress"
    started_at: "2026-01-10T00:00:00Z"
    exit_criteria:
      - name: "All 6 P0 scanners operational"
        status: "in_progress"
        progress: "2/6 complete"
        items:
          agent-ai-rag-scanner: "complete"
          file-structure-scanner: "complete"
          state-scanner: "pending"
          sync-scanner: "pending"
          ux-scanner: "pending"
          security-scanner: "pending"

  1:
    name: "Basic Agent Tools"
    status: "locked"
    unlocked_at: null

  2:
    name: "RAG Context Management"
    status: "locked"
    unlocked_at: null

  3:
    name: "Multimodal I/O"
    status: "locked"
    unlocked_at: null

  4:
    name: "Advanced AI Features"
    status: "locked"
    unlocked_at: null
```

---

## Integration with Auto-Gate

### Combined Gate Logic

Auto-gate runs first, then stage-gate:

```typescript
async function runFullGates(request: string): Promise<GateResult> {
  // First: Auto-gate (context, expert, research)
  const autoGateResult = await runAutoGate(request);
  if (autoGateResult.status === 'BLOCK' && !autoGateResult.overridden) {
    return autoGateResult;
  }

  // Second: Stage-gate
  const stageGateResult = await runStageGate(request);
  if (!stageGateResult.allowed) {
    return {
      status: 'BLOCK',
      reason: 'stage_gate',
      report: stageGateResult
    };
  }

  // Both gates passed
  return {
    status: 'ALLOW',
    auto_gate: autoGateResult,
    stage_gate: stageGateResult
  };
}
```

---

## Override Behavior

When user overrides a stage block:

```
⚠️ STAGE OVERRIDE - Logged as technical debt
─────────────────────────────────────────────────────────────
Debt Ticket: DEBT-stage-override-abc123
Risk Level: HIGH

Skipped Stages:
  - Stage 0: Governance Foundation (67% complete)

Missing Foundations:
  - state-scanner (P0)
  - sync-scanner (P0)
  - ux-scanner (P0)
  - security-scanner (P0)

Known Risks:
  - No safety net for state operations
  - Sync issues may go undetected
  - UX violations may accumulate
  - Security vulnerabilities unmonitored

Estimated Remediation: 16-24 hours to complete Stage 0

Proceeding with request: [original request]
─────────────────────────────────────────────────────────────
```

---

## Success Criteria

### Gate Success:
- [ ] Stage level correctly identified
- [ ] Current stage verified
- [ ] Comparison made against requirements
- [ ] Decision (ALLOW/BLOCK) made

### Transition Success:
- [ ] All exit criteria verified
- [ ] Stage state file updated
- [ ] New stage features unlocked
- [ ] Progress communicated

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/modules/governance-core/workflows/auto-gate.md`
- `_bmad-ext/modules/governance-core/policies/stage-gating.md`
- `_bmad-ext/modules/governance-core/state/stage-progress.yaml`

**Last Updated:** 2026-01-10
