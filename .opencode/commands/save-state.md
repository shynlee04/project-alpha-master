---
name: compact
description: Smart context preservation before session reset. Generates state injection block, saves to file, and prepares for NEW session.
aliases: [smart-compact, sc, save-state]
enabled: true
hidden: false
agent: plan
subtask: false
progressMessage: Generating state injection block for new session...
version: "4.0.0"
updated: "2026-01-30T00:42:00+07:00"
---

# 🔄 COMPACT v4.0 - State Preservation for New Session

> **CRITICAL UNDERSTANDING**: This command does NOT reduce tokens in the current conversation. It **GENERATES A STATE FILE** that will be used to **START A NEW SESSION** with preserved context.

---

## HOW THIS ACTUALLY WORKS

### The Reality of Compact

| Action | What Happens | Tokens |
|--------|--------------|--------|
| Running `/compact` as custom command | Appends more content | **INCREASES** |
| OpenCode's native compact | Creates NEW session with summary | **RESETS** |
| This smart-compact | Saves state, then triggers native compact | **RESETS** properly |

### The Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ CURRENT SESSION (High Tokens)                               │
│                                                             │
│  1. User runs /compact                                      │
│  2. Agent generates STATE INJECTION BLOCK                   │
│  3. Agent WRITES to .opencode/state/AGENT-STATE.yaml        │
│  4. Agent outputs: "State saved. Press Ctrl+K to compact."  │
│  5. User presses Ctrl+K (native compact)                    │
│  6. OpenCode creates NEW SESSION                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ NEW SESSION (Fresh Tokens)                                  │
│                                                             │
│  1. User runs /start                                        │
│  2. Agent reads .opencode/state/AGENT-STATE.yaml            │
│  3. Agent is RE-ANCHORED with preserved context             │
│  4. Work continues seamlessly                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## STEP 1: GENERATE STATE INJECTION BLOCK

When this command runs, IMMEDIATELY generate this block:

```yaml
# ═══════════════════════════════════════════════════════════════
# STATE INJECTION BLOCK - PRESERVED FROM PRE-COMPACT
# Session ID: [GENERATE_UUID]
# Captured: [CURRENT_TIMESTAMP]
# ═══════════════════════════════════════════════════════════════

state_injection:
  meta:
    captured_at: "[CURRENT_TIMESTAMP]"
    session_id: "[SESSION_ID]"
    version: "4.0"
    
  # ─────────────────────────────────────────────────────────────
  # ANCHOR: ORIGINAL INTENT (TURN 1-2) - VERBATIM
  # ─────────────────────────────────────────────────────────────
  original_intent:
    turn_1_verbatim: |
      [COPY USER'S FIRST MESSAGE EXACTLY]
    turn_2_understanding: |
      [COPY INITIAL UNDERSTANDING/CLARIFICATION]
    primary_goal: "[ONE LINE SUMMARY]"
    success_criteria: "[WHAT DEFINES DONE]"
    
  # ─────────────────────────────────────────────────────────────
  # RECENT: LAST 4 TURNS - CURRENT STATE
  # ─────────────────────────────────────────────────────────────
  recent_context:
    turn_minus_4: "[ACTOR]: [BRIEF SUMMARY]"
    turn_minus_3: "[ACTOR]: [BRIEF SUMMARY]"
    turn_minus_2: "[ACTOR]: [BRIEF SUMMARY]"
    turn_minus_1: "[ACTOR]: [DETAILED - MOST RECENT]"
    pending_action: "[WHAT WAS JUST REQUESTED]"
    
  # ─────────────────────────────────────────────────────────────
  # ROLE & HIERARCHY
  # ─────────────────────────────────────────────────────────────
  role:
    current: "[ext-master / ext-dev / etc.]"
    type: "[coordinator / executor]"
    constraints: "[WHAT ROLE CAN/CANNOT DO]"
    
  delegation:
    chain: "[master → sprint-manager → dev]"
    pending_handoffs: []
    
  # ─────────────────────────────────────────────────────────────
  # PROJECT STATE
  # ─────────────────────────────────────────────────────────────
  project:
    phase: "[CURRENT PHASE]"
    active_epic: "[EPIC or null]"
    active_story: "[STORY or null]"
    work_type: "[meta-framework / project]"
    
  # ─────────────────────────────────────────────────────────────
  # ARTIFACTS GENERATED THIS SESSION
  # ─────────────────────────────────────────────────────────────
  artifacts:
    created:
      - path: "[FILE PATH]"
        purpose: "[WHY CREATED]"
      - path: "[FILE PATH 2]"
        purpose: "[WHY CREATED]"
    modified:
      - path: "[FILE PATH]"
        changes: "[WHAT CHANGED]"
    key_deliverable: "[MOST IMPORTANT OUTPUT]"
    
  # ─────────────────────────────────────────────────────────────
  # DECISIONS MADE (FINAL, NOT SUPERSEDED)
  # ─────────────────────────────────────────────────────────────
  decisions:
    - decision: "[DECISION 1]"
      rationale: "[WHY]"
    - decision: "[DECISION 2]"
      rationale: "[WHY]"
      
  # ─────────────────────────────────────────────────────────────
  # FILTERED OUT (POISONED - DO NOT RESURRECT)
  # ─────────────────────────────────────────────────────────────
  filtered_out:
    - "[STALE/WRONG APPROACH - WHY]"
    - "[SUPERSEDED DECISION - WHY]"
    
  # ─────────────────────────────────────────────────────────────
  # NEXT ACTION
  # ─────────────────────────────────────────────────────────────
  next_action:
    description: "[WHAT SHOULD HAPPEN NEXT]"
    priority: "[P0/P1/P2]"
    blocker: "[ANY BLOCKERS]"
    
  # ─────────────────────────────────────────────────────────────
  # ACTIVE SKILLS
  # ─────────────────────────────────────────────────────────────
  skills_loaded: ["[LIST OF ACTIVE SKILLS]"]
```

---

## STEP 2: WRITE STATE TO FILE

After generating the block, WRITE it to the state file:

```
Write to: .opencode/state/AGENT-STATE.yaml
```

Also create a backup:
```
Write to: .opencode/state/backups/session-[TIMESTAMP].yaml
```

---

## STEP 3: OUTPUT INSTRUCTIONS TO USER

After saving state, output this message:

```markdown
## ✅ STATE PRESERVED

**State saved to:** `.opencode/state/AGENT-STATE.yaml`
**Backup at:** `.opencode/state/backups/session-[TIMESTAMP].yaml`

### To Complete Compaction:

1. **Press `Ctrl+K`** to open OpenCode command palette
2. **Select "Compact Session"** (or type `compact`)
3. OpenCode will create a NEW session with reduced tokens
4. **In the new session, run `/start`** to re-anchor context

### What Was Preserved:
- ✓ Original user intent (Turn 1-2)
- ✓ Last 4 turns (recent context)
- ✓ Role and delegation chain
- ✓ Project phase and state
- ✓ Artifacts created/modified
- ✓ Key decisions made
- ✓ Next action to take

### What Was Filtered Out:
- ✗ [List filtered items]

---

**⚠️ DO NOT continue working in this session after pressing Ctrl+K.**
**Run `/start` in the new session to restore context.**
```

---

## STEP 4: NEW SESSION STARTUP

In the NEW session, user runs `/start` which:

1. Reads `.opencode/state/AGENT-STATE.yaml`
2. Injects the preserved state
3. Validates the agent knows:
   - Original intent
   - Current role
   - Project phase
   - What to do next
4. Reports ready to continue

---

## ALTERNATIVE: COPY-PASTE METHOD

If the hook method doesn't work, the user can:

1. Run `/compact` to generate state block
2. **COPY** the state block from the output
3. Press `Ctrl+K` to compact (new session)
4. **PASTE** the state block as first message
5. Continue working

---

## CONFIGURATION REQUIRED

User MUST disable auto-compact in `~/.opencode.json`:

```json
{
  "autoCompact": false,
  "contextThreshold": 0.95
}
```

This prevents OpenCode from auto-compacting and losing state.

---

## WHAT TO PRESERVE (Priority Matrix)

| Priority | Content | Action |
|----------|---------|--------|
| **P0 - CRITICAL** | Original intent (Turn 1-2) | Preserve VERBATIM |
| **P0 - CRITICAL** | Last 4 turns | Preserve with detail |
| **P0 - CRITICAL** | Role and constraints | Preserve exactly |
| **P1 - HIGH** | Artifacts created | Paths + purposes |
| **P1 - HIGH** | Key decisions | Final decisions only |
| **P1 - HIGH** | Next action | What to do next |
| **P2 - MEDIUM** | Middle turns | Brief summary only |
| **EXCLUDE** | Debugging dead-ends | Filter out |
| **EXCLUDE** | Superseded decisions | Filter out |
| **EXCLUDE** | Failed approaches | Filter out |
| **EXCLUDE** | Off-topic tangents | Filter out |

---

## POISONED CONTEXT (Filter Out)

Do NOT preserve:
- Stale artifacts (>24h old)
- Contradicted decisions
- Failed debugging attempts
- Approaches that were rejected
- Off-topic discussion
- Hallucinated content (claims without evidence)

---

## EXECUTION CHECKLIST

When `/compact` is invoked:

- [ ] Generate state injection block
- [ ] Fill in all sections from conversation history
- [ ] Identify and list filtered (poisoned) content
- [ ] Write to `.opencode/state/AGENT-STATE.yaml`
- [ ] Create backup in `.opencode/state/backups/`
- [ ] Output user instructions
- [ ] Remind user to press Ctrl+K
- [ ] Remind user to run `/start` in new session

---

*Compact v4.0 | State Preservation for New Session | 2026-01-30*
*This command prepares state; Ctrl+K actually compacts.*
