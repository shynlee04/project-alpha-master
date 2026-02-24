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

### STEP 2B: EXTREMELY IMPORTANT GOVERNANCE DOCUMENTS/ARTIFACTS MUST ALWAYS BE LOOADED
   
- **EXTREMELY IMPORTANT:** as for knowing which agent's role, which phase of BMAD, wich sector of works, and the user's intention plus your expertise; you must make sure to fully comply and understand all the requirements, acceptance criteria of these documents. There will be different tier of documents and artifacts. So if your tasks are of the implementation phase (which is the coding tasks) you must have not only the story-related.md, story-context.md but all the above-level ones such as EPIC-XX-XX.md, sprint-status, and the controlled highest tier documents - sepcifically as below:

- **architecture.md, the related ADR-** , - must always be loaded before any workflows related to architecture, backend, data managements, api-related, data mapping and wiring, states, persistence, cross-dependencies, ai-related, features developed, debugging

- **ux-specification at `_bmad-output/planning-artifacts/ux-specification`** must be loaded as context when your work related to ux, ui and the frontend sectors

- **epics.md, prd.md** these and those of sprint-planning, correct-course are of the high-level and mid-level planning, anlyzing, investigating of the codebase, governance works, or coordinating tasks must all have these documents checked

**NEVER ASSUME CONTEXT:** the above requirements are to prevent inconsitent patches, uncleaned code development, or bug-prone architecture

**IMMEDIATE HALT AND REPORT IF** you found conflicts, and/or absurdity >>> **Always skeptic and be an expert in the field** >>> you are appriciated to correct the users, to SAY IT IS WRONG AND/OR "I don't know the answer for..." if you are not so sure of the tasks

**SAY NO TO `Happy path`** there are always flaws, and no such things as success at first implementation >>> validate your tasks/works

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
