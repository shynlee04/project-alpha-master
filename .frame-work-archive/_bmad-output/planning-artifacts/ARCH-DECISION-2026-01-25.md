# ARCHITECT DECISION: ARCH-04 Correct-Course + 3-Phase Strategic Alignment

> **Document ID**: ARCH-DECISION-2026-01-25
> **Status**: PENDING_ARCHITECT_APPROVAL
> **Created**: 2026-01-25T22:15:00+07:00
> **Author**: bmad-master (Orchestrator)
> **Urgency**: P0 CRITICAL

---

## Situation Summary

### The Alarming Issue

Dev-team implementation of EPIC-ARCH-04 stories (ARCH-04-01, ARCH-04-02, ARCH-04-03) revealed an **architectural-level flaw**:

> "The missing FSA handle lifecycle and route-to-context handoff breaks the project-centric desktop flow across ALL FSA projects."

**Classification**: Architectural flaw (NOT a local implementation glitch)

**Verdict**: BLOCK - Stories cannot pass validation

### The Gap Matrix

| Component | Required by ADR-034 | Current State | Gap |
|-----------|---------------------|---------------|-----|
| `ProjectContextProvider.initialHandle` prop | YES | ❌ Missing | CRITICAL |
| `handlePersistenceService.restoreHandle()` call | YES | ❌ Never called | CRITICAL |
| `storageAdapterFactory.createAdapter({ handle })` | YES | ❌ handle: undefined | CRITICAL |
| `showPermissionOverlay` trigger in init | YES | ❌ Never set to true | CRITICAL |
| `onPermissionGranted` persist + reinit | YES | ❌ Only hides overlay | CRITICAL |

---

## Root Cause Analysis

### Why EPIC-ARCH-04 Implementation Failed

The stories were designed correctly, but **implementation did not follow the specifications**:

```
EPIC-ARCH-04 Epic Document Says:
├── ARCH-04-01: "Add initialHandle prop, call restoreHandle(), pass handle to factory"
├── ARCH-04-02: "Pass fsaHandle via navigation state to route"
└── ARCH-04-03: "Verify overlay triggers, integrate callbacks"

What Was Actually Implemented:
├── ARCH-04-01: Partial - some logging, but no actual integration
├── ARCH-04-02: Partial - navigation state exists, but provider doesn't accept it
└── ARCH-04-03: Partial - overlay component updated, but provider never shows it
```

### The Missing Wiring

```
Current Code (Broken):
├── Wizard has handle ✅
├── navigate() passes state (claimed) ⚠️ (unverified)
├── Route extracts handle (claimed) ⚠️ (unverified)
└── Provider uses handle ❌ NO - no initialHandle prop, no restore logic

Required Flow (Per ARCH-04-01 Specification):
├── Wizard has handle ✅
├── navigate({ state: { fsaHandle } }) 
├── Route extracts location.state.fsaHandle
├── <ProjectContextProvider initialHandle={fsaHandle}>
├── Provider checks: initialHandle OR restoreHandle()
├── If requiresUserInteraction → showPermissionOverlay = true
├── If success → pass handle to StorageAdapterFactory
└── App works ✅
```

---

## Correct-Course Steps (From Dev-Team Report)

### Step 1: Reconcile ProjectContextProvider with ARCH-04-01 + ADR-034

**Actions**:
1. Add `initialHandle` prop to Props interface
2. Use initialHandle to seed FSA handle state OR call `handlePersistenceService.restoreHandle()`
3. Set `showPermissionOverlay = true` when `restoreResult.requiresUserInteraction`
4. Pass `fsaHandle` into `storageAdapterFactory.createAdapter()`

**Acceptance Criteria**:
- [ ] `initialHandle` prop exists and is passed from route
- [ ] `restoreHandle` is called; successful restore sets handle
- [ ] Overlay is shown when user interaction is required
- [ ] Adapter receives non-null handle for FSA projects

### Step 2: Align PermissionOverlay Behavior with Recovery Flow

**Actions**:
1. Confirm `onPermissionGranted` persists handle via `handlePersistenceService.persistHandle()`
2. Confirm `onPermissionGranted` reinitializes the adapter flow (not just hides overlay)
3. Provide explicit cancel control OR document picker cancel as only path

**Acceptance Criteria**:
- [ ] Permission overlay grants access and reinitializes context
- [ ] Cancel path returns to hub intentionally and is user-visible

### Step 3: Verification and Evidence Capture

**Actions**:
1. Run `pnpm tsc --noEmit` and capture output (no timeout)
2. Manual validation for FSA create/load flows
3. Document evidence in completion report

**Acceptance Criteria**:
- [ ] tsc report captured (no timeout or documented workaround)
- [ ] Manual tests show no "No directory access granted" error
- [ ] Console shows "FSA handle restored successfully" OR overlay appears

---

## Strategic Alignment with 3-Phase Approach

### Your 3-Phase Vision (From `docs/the-3-phase-approach.md`)

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1A** | Non-AI core (Terminal, Monaco, FileTree, Preview) | BLOCKED by ARCH-04 |
| **Phase 1B** | BYOK + Note features | Waiting |
| **Phase 2** | Chat cascade, thread management, agents | Waiting |
| **Phase 3** | Cross-plugin, multi-agentic patterns, RAG | Waiting |

### ARCH-04 is GATE to Phase 1A

```
ARCH-04 (P0 BLOCKER)
    │
    ▼
Phase 1A: Non-AI Core ← Cannot start until FSA works
    │
    ├── Terminal + WebContainer
    ├── Monaco editor + autosave
    ├── FileTree + snapshots
    └── Preview
    │
    ▼
Phase 1B: BYOK + Notes ← Waiting
    │
    ▼
Phase 2: Chat + Agents ← Waiting
    │
    ▼
Phase 3: Advanced Patterns ← Waiting
```

### Your Key Principles (Applied)

1. **Progressive and Complete Refactor**
   - ARCH-04 must be COMPLETE before moving on
   - No partial implementations - full FSA handle lifecycle or nothing

2. **End-to-End with Complete Reworks**
   - Each story must demonstrate complete user journey
   - Current ARCH-04 stories are NOT end-to-end - they're partial patches

3. **Greater Control Over Granular Tasks**
   - ARCH-04 correct-course is an example of needing deeper validation
   - Stories were marked "complete" but validation proved otherwise

---

## Recommended Decision

### Option A: Re-Execute ARCH-04-01/02/03 with Stricter Validation (RECOMMENDED)

**Actions**:
1. Create `ARCH-04-CORRECT-COURSE-SPRINT` with 3 remediation stories
2. Assign to dev-team with explicit verification commands
3. Block all Phase 1A work until ARCH-04 passes E2E validation
4. Require evidence capture (not just "complete" claims)

**Pros**:
- Follows your principle of "complete end-to-end"
- Establishes verification pattern for future work
- Unblocks Phase 1A quickly (estimated 2-4 hours)

**Cons**:
- Delays Phase 1A by ~4 hours
- Dev-team may feel micromanaged

### Option B: Architect Implements ARCH-04 Correct-Course Directly

**Actions**:
1. Architect (you) directly codes the 5 missing integrations
2. Validates immediately
3. Moves to Phase 1A

**Pros**:
- Fastest resolution (1-2 hours)
- Ensures correct implementation

**Cons**:
- Architect doing dev work (role violation)
- Doesn't establish pattern for future

### Option C: Pause and Re-Plan EPIC-ARCH-04

**Actions**:
1. Pause EPIC-ARCH-04 entirely
2. Create more detailed story specifications with step-by-step code
3. Re-assign with more explicit acceptance criteria

**Pros**:
- Better specifications
- Less ambiguity

**Cons**:
- Delays Phase 1A by 1+ days
- May be over-engineering

---

## My Recommendation

**OPTION A with enhanced verification protocol**:

1. Create `ARCH-04-CORRECT-COURSE-SPRINT` with these stories:
   - CC-01: Add initialHandle prop + restore logic (1-2h)
   - CC-02: Wire overlay trigger + persist/reinit (1h)
   - CC-03: Full E2E validation with evidence capture (1h)

2. Require **EVIDENCE BEFORE COMPLETION**:
   - `pnpm tsc --noEmit` output saved to file
   - Console log screenshots showing FSA handle lifecycle
   - Video or screenshot of project creation → file tree display

3. After ARCH-04 passes, immediately begin **Phase 1A Epic Planning**:
   - Focus on Terminal + WebContainer first
   - Monaco integration second
   - FileTree improvements third

---

## Awaiting Your Decision

Please confirm:

- [ ] **APPROVE Option A** - Create ARCH-04-CORRECT-COURSE-SPRINT
- [ ] **APPROVE Option B** - You will implement directly
- [ ] **APPROVE Option C** - Pause and re-plan
- [ ] **MODIFY** - Provide alternative direction

Once approved, I will:
1. Create the correct-course sprint file
2. Update AGENTS.md with new status
3. Delegate to dev-team with explicit constraints
4. Monitor for evidence-based completion

---

## Evidence Links

| Document | Path |
|----------|------|
| Correct-Course Report | `_bmad-output/planning-artifacts/ARCH-04-CORRECT-COURSE-2026-01-25.md` |
| Classification Report | `_bmad-output/handoffs/2026-01-25/ARCH-04-03-CLASSIFICATION-2026-01-25.md` |
| Validation Report | `_bmad-output/handoffs/2026-01-25/ARCH-04-03-VALIDATION-2026-01-25.md` |
| Research Synthesis (Pending) | `_bmad-output/planning-artifacts/RESEARCH-SYNTHESIS-PENDING-2026-01-25.md` |
| 3-Phase Approach | `docs/the-3-phase-approach.md` |
| EPIC-ARCH-04 | `_bmad-output/planning-artifacts/epics/EPIC-ARCH-04-complete-migration-2026-01-25.md` |

---

## Handoff Signature

```yaml
artifact_id: "arch_decision_20260125_v1"
artifact_type: "decision_document"
created_by: "bmad-master"
status: "PENDING_ARCHITECT_APPROVAL"
options: ["A", "B", "C", "MODIFY"]
default_recommendation: "A"
urgency: "P0"
blocks: ["Phase-1A", "Phase-1B", "Phase-2", "Phase-3"]
```
