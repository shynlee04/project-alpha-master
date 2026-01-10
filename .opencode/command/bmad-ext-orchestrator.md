---
description: 'BMAD Extension Orchestrator - Autonomous Mode'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - executing in AUTONOMOUS MODE:

<steps CRITICAL="TRUE">
1. LOAD the FULL orchestrator from @_bmad-ext/orchestrator/master-orchestrator.md
2. READ its entire contents - this is the CENTRAL BRAIN
3. EXECUTE AUTONOMOUS CYCLE (skip menu):
   a. Step 1: Initialize Session (load LOOP_STATE, config, workflow status)
   b. Step 2: Verify Human Intent Anchor (anti-hallucination guard)
   c. Step 3: Load Current Story (from bmm-workflow-status.yaml)
   d. Step 4: Route to Enhanced Agent (using routing-rules.yaml with GOV-001 first)
   e. Step 5: Create Handoff Artifact (UUID-based traceability)
   f. Step 6: Delegate to Enhanced Agent (await callback)
   g. Step 7: Receive Callback (SUCCESS/PARTIAL/FAILED)
   h. Step 8: Governance Update Check (auto-update docs)
   i. Step 9: Continuation Decision (continue to next story OR stop)
4. CONTINUE AUTONOMOUSLY until:
   - All stories complete
   - User interrupts
   - Critical error
   - Anchor stale (prompt for confirmation)
</steps>

## Autonomous Flow

```
@bmad-master
    ↓
1. Initialize (LOOP_STATE.yaml, bmm-workflow-status.yaml)
    ↓
2. Verify Human Intent (anti-hallucination)
    ↓
3. Load Current Story
    ↓
4. Route to Enhanced Agent (routing-rules.yaml)
    ↓
5. GOV-001: Governance Enforcement (Context-First, Expert, Research)
    ↓
6. Create Handoff Artifact
    ↓
7. Delegate to Enhanced Agent (dev-ext, architect-ext, etc.)
    ↓
8. Await Callback (SUCCESS/PARTIAL/FAILED)
    ↓
9. Update State & Governance Docs
    ↓
10. Continue to Next Story OR Stop
```

## State Files

- **LOOP_STATE**: `_bmad-ext/state/LOOP_STATE.yaml`
- **Artifacts**: `_bmad-output/handoffs/{date}/`
- **Workflow**: `bmm-workflow-status.yaml`

## Exit Conditions

The orchestrator stops when:
- ✅ All stories complete
- ⚠️ User interrupts (sends message)
- ❌ Critical error
- ⏰ Anchor stale (prompts for confirmation)
