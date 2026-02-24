# Auto-Gate - Pre-Work Enforcement Gate

**description:** Final gate before any work proceeds - compiles all three enforcement checks into governance report

**Workflow Type:** Final Gate / Orchestrator

**Integration:** Called by orchestrator before routing to agents/workflows

---

## Overview

Auto-Gate is the final enforcement point that:

1. **Compiles results** from all three enforcement checks
2. **Generates Governance Report** with ALLOW/WARN/BLOCK status
3. **Handles human override** ("I am aware but...")
4. **Routes to appropriate workflow** based on decision

---

## Gate Sequence

```
User Request
     │
     ▼
┌─────────────────────────────────────┐
│  ENFORCEMENT CHECK 1: Context First │
│  - Gather targeted domain context   │
│  - Contextualize prompt             │
└──────────────┬──────────────────────┘
               │ Contextualized Prompt
               ▼
┌─────────────────────────────────────┐
│  ENFORCEMENT CHECK 2: Expert Analysis│
│  - Detect flaws                     │
│  - Categorize error type            │
└──────────────┬──────────────────────┘
               │ Category + Flaws
               ▼
┌─────────────────────────────────────┐
│  ENFORCEMENT CHECK 3: Research      │
│  - Auto-trigger if needed           │
│  - Validate technical decisions     │
└──────────────┬──────────────────────┘
               │ Research (if needed)
               ▼
┌─────────────────────────────────────┐
│         AUTO-GATE (This Workflow)   │
│  - Compile all checks               │
│  - Generate Governance Report       │
│  - Handle override                  │
│  - Route to workflow                │
└──────────────┬──────────────────────┘
               │
               ▼
         [ALLOW/WARN/BLOCK]
               │
               └──────► Proceed to Work
```

---

## Governance Report Generation

### Report Format

```
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE REPORT                        │
├─────────────────────────────────────────────────────────────┤
│ Status: BLOCK / WARN / ALLOW                                │
│                                                              │
│ Context Check:    ✅ PASS (3 domains, 47 files, 2.3K tokens) │
│ Expert Analysis:  ⚠️ WARN  (Architectural conflict detected) │
│ Research Status:  ✅ COMPLETE (2 sources, high confidence)  │
│                                                              │
│ Recommendation:                                             │
│ "This change affects STATE, SYNC, and UX domains.           │
│  Quick patch will create circular dependency.               │
│  Required: Comprehensive remediation via Journey Mapper.    │
│  Estimated: 4-6 hours vs 30 min for quick patch."          │
│                                                              │
│ Human Override: Type "I am aware but..." to proceed anyway. │
└─────────────────────────────────────────────────────────────┘
```

### Report YAML Format

```yaml
governance_report:
  timestamp: "2026-01-10T10:45:00Z"
  request_id: "gov-20260110-104500-abc123"

  status: "WARN"  # ALLOW | WARN | BLOCK

  enforcement_checks:
    context_first:
      status: "PASS"
      domains: 3
      files: 47
      tokens: 2347
      details: "P0 domains loaded: state_persistence, file_structure_governance"

    expert_analysis:
      status: "WARN"
      category: "architectural_conflict"
      affected_domains: ["state_persistence", "sync", "ux_interaction"]
      flaws_detected: []
      reasoning: "Cross-domain impact detected"

    research_required:
      status: "COMPLETE"
      triggers: ["breaking_changes"]
      sources: 2
      confidence: 0.85
      key_finding: "Store refactoring affects 8 consuming components"

  recommendation:
    decision: "WARN"
    message: "Architectural conflict detected - comprehensive remediation recommended"
    estimated_effort: "4-6 hours vs 30 min for quick patch"
    risk_level: "medium"

  next_steps:
    - "Review architectural impact with Journey Mapper"
    - "Consider creating feature branch for isolated development"
    - "Ensure all consumers are tested before refactoring"

  override_allowed: true
  override_message: "Type 'I am aware but...' to proceed anyway"
```

---

## Status Determination Logic

### ALLOW Status

**Conditions:**
- Context: PASS
- Expert Analysis: Quick Patch
- Research: Not required or COMPLETE with high confidence (>0.8)
- No flaws detected

**Behavior:**
- Proceed directly to requested work
- No confirmation required
- Register task in LOOP_STATE

### WARN Status

**Conditions:**
- Context: PASS
- Expert Analysis: Independent Feature OR Quick Patch with minor flaws
- Research: COMPLETE (if required)

**Behavior:**
- Display warning to user
- Require explicit acknowledgment
- Log decision for audit trail

**Warning Template:**
```
⚠️ GOVERNANCE WARNING
─────────────────────────────────────────────────────────────
This request has been categorized as: Independent Feature

Scope: New file-lock-service.ts in domain layer
Impact: Isolated to sync workflow, minimal cross-domain impact

Risks:
- New service without existing test coverage
- Integration with SyncManager requires coordination

To proceed, type: "I acknowledge the scope and accept these risks"
─────────────────────────────────────────────────────────────
```

### BLOCK Status

**Conditions:**
- Context: FAIL (stale, missing) OR
- Expert Analysis: Architectural Conflict OR
- Research: INCOMPLETE (low confidence <0.6)

**Behavior:**
- Stop workflow
- Display full governance report
- Offer "I am aware but..." override

**Block Template:**
```
🔒 GOVERNANCE BLOCK
─────────────────────────────────────────────────────────────
This request has been BLOCKED for the following reasons:

Category: Architectural Conflict
Affected Domains: state_persistence (2 stores), sync (3 services), ux (4 components)

Problem:
This change will modify note-store.ts which is consumed by:
  - NoteListWidget
  - NoteEditor
  - SyncIndicator
  - NoteRoute

A quick fix here will create a cascading update requirement across
all consumers, estimated at 4-6 hours of additional work.

Recommended Approach:
1. Create comprehensive remediation plan
2. Use Journey Mapper to identify all affected flows
3. Coordinate updates across all consumers
4. Test end-to-end before committing

To override this block, type: "I am aware but [reason]"
─────────────────────────────────────────────────────────────
```

---

## Human Override Pattern

### Override Activation

**Trigger:** User types "I am aware but..." or "I acknowledge..."

### Override Processing

```typescript
function processOverride(userMessage: string, report: GovernanceReport): OverrideResult {
  const overridePattern = /I am aware but|I acknowledge|I accept/i;
  if (!overridePattern.test(userMessage)) {
    return { allowed: false };
  }

  // Extract user's reason
  const reason = userMessage.replace(overridePattern, '').trim() || 'No reason provided';

  return {
    allowed: true,
    logged_debt: {
      id: generateUUID(),
      timestamp: Date.now(),
      original_decision: report.status,
      override_reason: reason,
      risk_multiplier: calculateRiskMultiplier(report),
      skipped_stages: identifySkippedStages(report),
      estimated_remediation: estimateRemediation(report)
    }
  };
}
```

### Debt Ticket Generation

When override is activated:

```
⚠️ PROCEED WITH CAUTION - Logged as technical debt
─────────────────────────────────────────────────────────────
Debt Ticket: DEBT-a1b2c3d4
Risk Multiplier: 1.5x (architectural_conflict)
Estimated Remediation: 8-12 hours

Dependencies skipped:
  - Stage 1: Basic Agent Tools
  - Context isolation not established

Known risks:
  - Cross-workspace context leakage
  - No permission boundaries for CRUD
  - Thread storage may conflict with future design

Review required before Stage 2 implementation.
─────────────────────────────────────────────────────────────
```

### Risk Multipliers

| Original Decision | Risk Multiplier | Remediation Estimate |
|-------------------|-----------------|---------------------|
| Quick Patch override | 1.2x | +2-4 hours |
| Independent Feature override | 1.5x | +4-8 hours |
| Architectural Conflict override | 2.0x | +8-16 hours |

---

## Routing Decision Tree

```
┌─────────────────────┐
│ Governance Report   │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Status: ALLOW│
    └──────┬───────┘
           │ Direct route to workflow
           ▼
    [Request Agent/Workflow]

    ┌──────────────┐
    │ Status: WARN │
    └──────┬───────┘
           │ Acknowledge required
           ▼
    [Wait for user input]
           │
           ├─ Acknowledged ──► [Route to workflow]
           │
           └─ Cancel ────────► [Cancel workflow]

    ┌──────────────┐
    │ Status: BLOCK│
    └──────┬───────┘
           │ Override offered
           ▼
    [Wait for user input]
           │
           ├─ "I am aware but" ──► [Log debt] ──► [Route to workflow]
           │
           └─ Accept block ──────► [Cancel workflow]
```

---

## Integration with Orchestrator

### Routing Rule Update

**Before (No Governance):**
```yaml
- rule_id: "REMEDIATION-001"
  if: "story_type == 'god_store_split'"
  workflow: "remediation-cycle"  # Direct execution
```

**After (With Governance):**
```yaml
- rule_id: "GOV-001"
  name: "Governance Enforcement"
  if: "true"  # Always applies first
  agent: "governance-core"
  workflow: "auto-gate"
  priority: "critical"
  timeout_minutes: 5
  description: "Three enforcement checks before any work"

- rule_id: "REMEDIATION-001"
  if: "story_type == 'god_store_split'"
  workflow: "remediation-cycle"  # Only if governance allows
  priority: "high"
  description: "Executes after governance gate"
```

### Gate Hook Point

The orchestrator should call auto-gate before routing:

```typescript
// Orchestrator pseudocode
async function routeToWorkflow(story: Story) {
  // Run governance gate first
  const governanceResult = await runWorkflow('auto-gate', {
    request: story.description,
    story_type: story.type
  });

  // Check governance decision
  if (governanceResult.status === 'BLOCK') {
    return { blocked: true, report: governanceResult.report };
  }

  if (governanceResult.status === 'WARN') {
    await waitForUserAcknowledgment(governanceResult.report);
  }

  // Proceed with original routing
  const workflow = findWorkflow(story.type);
  await runWorkflow(workflow, story);
}
```

---

## Success Criteria

### Gate Success:
- [ ] All three enforcement checks executed
- [ ] Governance report generated
- [ ] Status determination complete
- [ ] Route decision made

### Override Success:
- [ ] Override reason captured
- [ ] Debt ticket generated
- [ ] Risk multiplier assigned
- [ ] Proceeded to workflow

### Gate Block (Success for governance):
- [ ] Block displayed with reasons
- [ ] User understands impact
- [ ] Cancel or override path clear

---

**Workflow Owner:** governance-core
**Integrates With:**
- `_bmad-ext/modules/governance-core/workflows/context-first.md`
- `_bmad-ext/modules/governance-core/workflows/expert-analysis.md`
- `_bmad-ext/modules/governance-core/workflows/research-trigger.md`
- `_bmad-ext/orchestrator/routing-rules.yaml`
- `_bmad-ext/state/LOOP_STATE.yaml`

**Last Updated:** 2026-01-10
