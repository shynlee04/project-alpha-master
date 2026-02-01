# Governance Runtime Loader

**Created:** 2026-02-02
**Purpose:** Define what context agents MUST load at runtime for governance compliance
**Authority:** AGENTS.md enforcement

---

## Overview

This document specifies the **mandatory context loading** requirements for agents working on Project Alpha. Without loading the correct context, agents will make decisions without strategic guidance, leading to:

1. Gaps not escalated (violation of bounce-back protocol)
2. Tactical fixes without strategic alignment
3. Conflicts between documents
4. Schema changes without approval

---

## Context Loading Tiers

### Tier 1: ALWAYS LOAD (Every Session)

These documents MUST be loaded at the start of every agent session:

| Document | Purpose | Path |
|----------|---------|------|
| **AGENTS.md** | Constitution, rules | `/AGENTS.md` |
| **STATE.md** | Current position, context | `.planning/STATE.md` |
| **GAPS-TRACKER.yaml** | Unresolved gaps, escalations | `.planning/governance/GAPS-TRACKER.yaml` |

**Enforcement:** Pre-execution hooks check for these in agent context.

### Tier 2: LOAD FOR PHASE WORK

When working on a specific phase, load phase context:

| Work Type | Additional Context |
|-----------|-------------------|
| **Phase A** | `.planning/phases/A-byok-foundation/A-CONTEXT.md` |
| **Phase B** | `.planning/phases/B-ai-gateway/B-CONTEXT.md` |
| **Phase C** | `.planning/phases/C-notes-ai/C-CONTEXT.md` |

### Tier 3: LOAD FOR AI-RELATED WORK

When working on ANY AI-related feature:

| Document | Purpose | Required For |
|----------|---------|--------------|
| **MODEL-STRATEGY.md** | Model loading, fallback, capabilities | Phase A, B, C |
| **SOURCE-OF-TRUTH.md Part 3** | Schema relationships | Schema changes |

### Tier 4: LOAD FOR SCHEMA CHANGES

When ANY schema modification is proposed:

| Document | Purpose |
|----------|---------|
| **SCHEMA-OVERVIEW.md** | Schema inventory |
| **THREAD-V2-DESIGN.md** | Thread schema design |
| **SOURCE-OF-TRUTH.md Part 3** | Entity model |

**Rule:** Schema changes require architect approval before implementation.

---

## Runtime Loading Protocol

### At Session Start

```yaml
# Agent initialization protocol
on_session_start:
  load:
    - AGENTS.md           # Constitution
    - STATE.md            # Current position
    - GAPS-TRACKER.yaml   # Active gaps
  
  check:
    - "Are there HIGH severity unescalated gaps?"
    - "Is current phase blocked?"
    - "What is resume point?"
```

### Before Phase Planning

```yaml
# Phase planning context
on_phase_planning:
  require:
    tier_1: true       # Always required
    tier_2: true       # Phase context
  
  conditional:
    if_ai_related:
      - MODEL-STRATEGY.md
      - B-CONTEXT.md
    if_schema_change:
      - SCHEMA-OVERVIEW.md
      - SOURCE-OF-TRUTH.md Part 3
```

### Before Execution

```yaml
# Execution context
on_plan_execution:
  verify:
    - "All HIGH gaps are escalated"
    - "Phase context is loaded"
    - "High-level design docs loaded (if applicable)"
  
  block_if:
    - "Unescalated HIGH gap in current phase"
    - "Schema change without architect approval"
    - "Breaking change to protected file"
```

---

## Document Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 0: CONSTITUTION                      │
│                        AGENTS.md                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  TIER 1: STRATEGIC (High-Level)              │
│  SOURCE-OF-TRUTH.md │ MODEL-STRATEGY.md │ ROADMAP.md        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  TIER 2: TACTICAL (Mid-Level)                │
│  A-CONTEXT.md │ B-CONTEXT.md │ C-CONTEXT.md                 │
│  GAPS-TRACKER.yaml │ STATE.md                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  TIER 3: OPERATIONAL (Low-Level)             │
│  A-01-PLAN.md │ A-02-PLAN.md │ A-03-PLAN.md │ A-04B-PLAN.md │
│  Execution summaries, commits                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Bounce-Back Triggers

The following conditions trigger immediate escalation (per ROADMAP.md Lines 229-244):

### STOP and Escalate

1. **Schema needs updating**
   - Required context: SCHEMA-OVERVIEW.md, SOURCE-OF-TRUTH.md
   - Escalate to: Architect
   - Document in: GAPS-TRACKER.yaml

2. **Type definition is wrong**
   - Required context: domain/types/, domain/schemas/
   - Escalate to: Architect
   - Document in: GAPS-TRACKER.yaml

3. **Fixing X breaks Y**
   - Required context: STATE.md, relevant CONTEXT.md
   - Escalate to: Architect
   - Document in: GAPS-TRACKER.yaml

### Escalation Format

```yaml
# Add to GAPS-TRACKER.yaml
escalations:
  - id: ESC-XXX
    created_at: "YYYY-MM-DDTHH:MM:SSZ"
    from_gap: GAP-XXX-XXX
    escalated_by: "[agent-name]"
    escalated_to: "architect"
    title: "[Issue Title]"
    severity: high
    status: pending
    context_loaded:
      - "[list of docs loaded]"
```

---

## Integration with AGENTS.md

This document extends AGENTS.md Section 3 (Project Structure) with runtime loading requirements:

### Add to Agent Pre-Execution

```typescript
// Conceptual - agents should check this before work
async function validateContext(workType: WorkType): Promise<boolean> {
  const loaded = getLoadedDocuments();
  const required = getRequiredDocuments(workType);
  
  const missing = required.filter(doc => !loaded.includes(doc));
  if (missing.length > 0) {
    console.error('[Governance] Missing required context:', missing);
    return false;
  }
  
  // Check for blocking gaps
  const gaps = await loadGapsTracker();
  const blockingGaps = gaps.filter(g => 
    g.severity === 'high' && 
    !g.escalated && 
    g.phase === currentPhase
  );
  
  if (blockingGaps.length > 0) {
    console.error('[Governance] Blocking gaps must be escalated first:', blockingGaps);
    return false;
  }
  
  return true;
}
```

---

## Staleness Rules

Per AGENTS.md Section 1.3 (2-Hour Rule):

| Document Type | Max Age | Action if Stale |
|---------------|---------|-----------------|
| STATE.md | 2 hours | Validate against git status |
| GAPS-TRACKER.yaml | 2 hours | Check for new gaps |
| CONTEXT.md files | 48 hours | Review for updates |
| Strategic docs | 7 days | Verify still accurate |

---

## Quick Reference

### For Dev Agents

```yaml
load:
  - AGENTS.md
  - STATE.md
  - GAPS-TRACKER.yaml
  - [Phase]-CONTEXT.md
  - [Plan]-PLAN.md

escalate_if:
  - "I need to change a schema"
  - "I need to modify a protected file"
  - "My fix breaks something else"
```

### For Planner Agents

```yaml
load:
  - AGENTS.md
  - STATE.md
  - ROADMAP.md
  - SOURCE-OF-TRUTH.md
  - GAPS-TRACKER.yaml
  - MODEL-STRATEGY.md (if AI-related)

escalate_if:
  - "Phase scope needs expansion"
  - "New phase needed"
  - "Research conflicts with architecture"
```

### For Architect Agents

```yaml
load:
  - AGENTS.md
  - SOURCE-OF-TRUTH.md
  - ROADMAP.md
  - SCHEMA-OVERVIEW.md
  - GAPS-TRACKER.yaml
  - All pending escalations

decide:
  - "Approve or reject schema changes"
  - "Resolve research-architecture conflicts"
  - "Add new phases if needed"
```

---

*Created: 2026-02-02*
*Authority: Governance Enforcement*
*Consumes: AGENTS.md, ROADMAP.md, SOURCE-OF-TRUTH.md*
