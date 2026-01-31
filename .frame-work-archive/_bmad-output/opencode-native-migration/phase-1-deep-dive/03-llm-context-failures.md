# LLM Context Failures Analysis

**Document ID**: PHASE-1.3-CONTEXT-FAILURES-2026-01-28
**Version**: 1.0.0
**Status**: COMPLETE
**Date**: 2026-01-28
**Author**: analyst-ext (self-reflection mode)

---

## Executive Summary

This document is a self-reflection on how LLM agents (including the author) fail to maintain context integrity across conversations. Through analysis of 434 archived files, 59 handoff artifacts, and 2 epic retrospectives, we identify **5 context poisoning mechanisms** and why protocols get forgotten after compact.

**Key Finding**: The fundamental problem is that BMAD's governance is stored in the context window, not in external state. When context compacts, governance disappears.

---

## What Happens After Compact

### The Compact Event

When context window fills to ~80%, the system triggers compact:

```
Before Compact (400k tokens):
├── System Prompt (10k)
├── AGENTS.md loaded (5k)
├── Constitution loaded (3k)
├── Skills loaded (20k)
├── Workflow state (8k)
├── Conversation history (200k)
├── Current file contents (100k)
└── Reasoning space (54k)

After Compact (~100k tokens):
├── System Prompt (10k)
├── Summarized history (30k)
├── Current file contents (40k)
└── Reasoning space (20k)

LOST IN COMPACT:
├── AGENTS.md ❌
├── Constitution ❌
├── Skills ❌
├── Workflow state ❌
└── Detailed history ❌
```

### The Amnesia Effect

Post-compact, the agent:
1. **Forgets governance rules** - No AGENTS.md reference
2. **Loses workflow position** - Doesn't know current step
3. **Drops skill context** - Previously loaded skills unavailable
4. **Misses state files** - LOOP_STATE.yaml not in context
5. **Loses conversation nuance** - Summary loses critical details

---

## 5 Context Poisoning Mechanisms

### Mechanism 1: Protocol Amnesia

**What Happens**: Governance protocols are stored in context, not external state. After compact, agents operate without governance.

**Evidence**:
- 98.9% governance non-compliance
- Agents skip gates post-compact
- No enforcement mechanism survives compact

**Example**:
```
Pre-Compact:
- Agent knows 3-Step Validation Framework
- Agent follows story decomposition rules
- Agent checks architecture alignment

Post-Compact:
- Agent proceeds directly to implementation
- Agent doesn't decompose complex requests
- Agent assumes architecture instead of verifying
```

**Why It's Poisoning**: Agent believes it's following protocol (it remembers it existed) but can't access the actual rules.

### Mechanism 2: State Drift

**What Happens**: LOOP_STATE.yaml and sprint-status.yaml are not reloaded after compact. Agent operates on stale or missing state.

**Evidence**:
- Stories marked complete when still in-progress
- Epic status out of sync with reality
- Agent starts work that's already been done

**Example**:
```yaml
# Pre-Compact state (in context):
current_story: UXUI-03-05
status: IN_PROGRESS
step: implementation

# Actual state (in LOOP_STATE.yaml):
current_story: UXUI-03-07  # Moved on
status: COMPLETE           # Story finished
step: review               # Different step

# Agent's behavior:
- Continues UXUI-03-05 (already complete)
- Creates duplicate work
- Conflicts with actual progress
```

**Why It's Poisoning**: Agent's internal state diverges from external reality.

### Mechanism 3: Skill Orphaning

**What Happens**: Skills loaded pre-compact are lost. Agent can't invoke previously available capabilities.

**Evidence**:
- 31% skill utilization (agents can't find/use skills)
- Same skills re-loaded multiple times per session
- Agents work around missing skills with raw implementation

**Example**:
```
Pre-Compact:
- skill:verification-before-completion loaded
- Agent runs verification before claiming done

Post-Compact:
- skill:verification-before-completion NOT loaded
- Agent claims done without verification
- False completion propagates

# Workaround agent uses:
"I'll just check TypeScript compiles"  # WRONG
```

**Why It's Poisoning**: Capability degradation is invisible to the agent.

### Mechanism 4: Context Fragmentation

**What Happens**: Partial documents are summarized, creating incomplete or misleading context.

**Evidence**:
- Agent references architecture.md but only has summary
- Agent quotes AGENTS.md rules that aren't in summary
- Agent assumes file contents that have changed

**Example**:
```
Pre-Compact (full AGENTS.md):
"8-bit design - No transparent backgrounds, NO hardcoded CSS,
responsive for mobile, Animation 8-bit style - Use steps(N, end)
timing, no smooth easing, respect prefers-reduced-motion"

Post-Compact (summary):
"8-bit design rules apply"

Agent's interpretation:
- Doesn't remember "no transparent backgrounds"
- Doesn't remember "steps(N, end) timing"
- Implements smooth animations (violation)
```

**Why It's Poisoning**: Agent confidently applies rules it doesn't actually have.

### Mechanism 5: Delegation Failure

**What Happens**: Multi-level delegation breaks when parent agents compact.

**Evidence**:
- 85% of governance failures in delegation scenarios
- Child agents complete work, parent doesn't receive
- Handoff artifacts created but never consumed

**Example**:
```
bmad-master delegates to dev-ext:
1. bmad-master sends task
2. dev-ext works for 30 minutes
3. bmad-master compacts
4. dev-ext completes, creates handoff
5. bmad-master doesn't know to look for handoff
6. Work is lost (or orphaned)

Handoff artifact exists at:
_bmad-output/handoffs/2026-01-28/UXUI-03-05-dev-ext-handoff.md

bmad-master's post-compact state:
- Doesn't remember delegating
- Doesn't know handoff location
- Starts fresh (duplicate work or conflicts)
```

**Why It's Poisoning**: Multi-agent coordination requires state that spans compacts.

---

## Why Protocols Get Forgotten

### Root Cause 1: Context-Resident Governance

BMAD stores governance in documents that must be loaded into context:
- AGENTS.md (550 lines)
- Constitution (200 lines)
- Module files (100+ files)
- Skills (82 files)

**Problem**: When context compacts, these documents are evicted.

**Solution Needed**: External state that survives compact.

### Root Cause 2: No Compact Hooks

There's no mechanism to:
- Detect compact is about to happen
- Save critical state before compact
- Reload essential context after compact
- Resume workflow from correct position

**Problem**: Compact is a silent catastrophe.

**Solution Needed**: Pre-compact save, post-compact restore.

### Root Cause 3: No Priority System

All context is treated equally:
- Critical governance rules = nice-to-have features
- Essential skills = unused skills
- Current workflow state = historical conversation

**Problem**: Wrong things survive compact.

**Solution Needed**: Priority-based context management.

### Root Cause 4: Summarization Loses Nuance

Compact summarizes conversation history:
- Exact numbers become "several"
- Specific files become "relevant files"
- Precise rules become "guidelines"

**Problem**: Governance requires precision.

**Solution Needed**: Structured summaries that preserve critical details.

### Root Cause 5: No External Checkpoints

No mechanism to:
- Checkpoint workflow progress
- Store skill state externally
- Persist governance decisions
- Track delegation chains

**Problem**: Everything lives in volatile context.

**Solution Needed**: External checkpoint system.

---

## 5 Principles for OpenCode Native

Based on the context failure analysis, OpenCode Native must follow these principles:

### Principle 1: Compact-Resilient State

All critical state must survive context reset:

```yaml
compact_resilient_state:
  external_storage:
    - AGENT-STATE.yaml  # Current workflow position
    - skill-cache.yaml   # Loaded skills and params
    - governance.yaml    # Active governance rules
    - delegation.yaml    # Parent-child relationships
  
  auto_reload:
    on: "session_start AND post_compact"
    priority_order:
      1. governance.yaml      # Rules first
      2. AGENT-STATE.yaml     # Then position
      3. delegation.yaml      # Then relationships
      4. skill-cache.yaml     # Then capabilities
```

### Principle 2: Context Economy

Every token must earn its place:

```yaml
context_budget:
  total: 400_000
  framework_max: 40_000  # 10% max
  reserved:
    reasoning: 100_000    # 25%
    work_content: 200_000 # 50%
    history: 60_000       # 15%
  
  enforcement:
    on_exceed: "evict_lowest_priority"
    priority_order:
      1. active_skill        # Current operation
      2. governance_rules    # Critical rules only
      3. workflow_state      # Current step
      4. recent_history      # Last 5 messages
      5. everything_else     # Evict first
```

### Principle 3: Skill-on-Demand

Load only what's needed, when needed:

```yaml
skill_loading:
  default_loaded: 0        # Nothing pre-loaded
  max_loaded: 5            # Never more than 5
  
  loading_triggers:
    - intent_match         # User intent → skill suggestion
    - workflow_step        # Step requires specific skill
    - explicit_invoke      # User requests skill
  
  unloading:
    on: "skill_complete OR context_pressure"
    preserve: "skill_output_only"  # Keep results, drop skill
```

### Principle 4: Workflow Checkpointing

Externally persist workflow progress:

```yaml
workflow_checkpoints:
  checkpoint_events:
    - step_complete
    - validation_pass
    - delegation_send
    - user_confirmation
  
  checkpoint_content:
    workflow_id: "story-cycle"
    current_step: 3
    step_status: "COMPLETE"
    artifacts_created: ["story-context.xml"]
    next_step: 4
    blockers: []
  
  restoration:
    on: "session_start"
    action: "resume_from_checkpoint"
```

### Principle 5: Delegation Integrity

Multi-agent coordination must survive compacts:

```yaml
delegation_integrity:
  parent_state:
    stored_in: "AGENT-STATE.yaml"
    contains:
      - task_id
      - child_agent
      - expected_output
      - callback_path
  
  child_handoff:
    stored_in: "_bmad-output/handoffs/"
    contains:
      - parent_id
      - task_id
      - completion_status
      - artifacts
  
  restoration:
    on: "parent_session_resume"
    action: "scan_handoffs_for_parent_id"
    merge: "child_results → parent_state"
```

---

## Implementation Priorities

### Critical (Implement First)

1. **External state file** - AGENT-STATE.yaml that survives compact
2. **Post-compact reload** - Automatic context restoration
3. **Skill caching** - Keep skill outputs without full skill
4. **Delegation tracking** - Parent-child relationships externalized

### High Priority

5. **Context budget** - Track and enforce token limits
6. **Priority eviction** - Smart context trimming
7. **Workflow checkpointing** - Step-by-step persistence
8. **Summarization structure** - Preserve critical details

### Medium Priority

9. **Pre-compact hooks** - Save before compact
10. **Skill suggestions** - Auto-recommend relevant skills
11. **Governance extraction** - Pull rules from docs to state
12. **History compression** - Structured conversation summaries

---

## Conclusion

The 5 context poisoning mechanisms explain why BMAD's governance fails:

1. **Protocol Amnesia** - Rules stored in context, lost in compact
2. **State Drift** - External state not reloaded
3. **Skill Orphaning** - Capabilities lost silently
4. **Context Fragmentation** - Partial docs create confusion
5. **Delegation Failure** - Multi-agent chains break

The 5 principles for OpenCode Native address these directly:

1. **Compact-Resilient State** - External persistence
2. **Context Economy** - Every token earns its place
3. **Skill-on-Demand** - Load only what's needed
4. **Workflow Checkpointing** - Step-by-step persistence
5. **Delegation Integrity** - Multi-agent coordination

**The fundamental insight**: Stop storing governance in context. Externalize everything critical.

---

**Document Version**: 1.0.0
**Created**: 2026-01-28
**Author**: analyst-ext
**Status**: COMPLETE
