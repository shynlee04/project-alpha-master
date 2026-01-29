---
name: start
description: Context-first reminders + post-compact state restoration
aliases: [ctx, cf, resume]
enabled: true
---

# CONTEXT-FIRST AGENT INITIALIZATION

## STEP 1: CHECK FOR COMPACTED STATE

Look for a structured summary at the START of this conversation that contains:
- `compact_chain:` with `turn_number`
- `anchors:` with `original_intent`
- `artifact_registry:` with file links

**If found**: This is a POST-COMPACT session. Parse and confirm understanding of:
1. Original user intent (from `anchors.original_intent.turn_1_verbatim`)
2. Current phase (from `phase_tracking.current_phase`)
3. Your role (from `agent_hierarchy.current_executor`)
4. Next action (from `next_action.description`)
5. Artifacts to read (from `artifact_registry.handoff_documents`)

---

## STEP 2: CONTEXT-FIRST REMINDERS

1. **ROLE**: Load your profile from `.opencode/agents/` → Act within-scope, fully participate with absolute coverage

2. **CONTEXT ANCHORING**: 
   - Turns 1-2 = Original intent (your primary anchor)
   - Last 4 turns = Most recent context (prioritize)
   - User may be imprecise → Verify, push back on risky assumptions

3. **SKILLS**: Check `.opencode/skills/` → Load appropriate skills for this work type

4. **PLANNING**: If coordinator/orchestrator → Plan and delegate, never execute directly

5. **WORK TYPE**: Know if this is:
   - Meta-framework work (`.opencode/`, `.agent/`, `_bmad/`)
   - Project work (`src/`, features, stories)
   
6. **GOVERNANCE** (if project work):
   - Check `AGENTS.md` constitution
   - Update `bmm-workflow-status.yaml` when completing work
   - Update `sprint-status.yaml` when in story development

7. **VERIFICATION**: Evidence before assertions → Run commands, read outputs, THEN claim success

---

## STEP 3: ARTIFACT HOP-READING (If Post-Compact)

If `artifact_registry.handoff_documents` exists, these are files you MAY need to read:
- Read ONLY if the `read_if` condition applies to current work
- Do NOT load all artifacts upfront - use on-demand

---

## STEP 4: CONFIRM UNDERSTANDING

After processing context, briefly confirm:
- "I understand the primary goal is: [X]"
- "My role is: [Y]"
- "Next action: [Z]"

---

# USER REQUEST BELOW
$ARGUMENTS
