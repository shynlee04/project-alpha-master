# Cycle Prompts for Master Plan: [Objective Name]

**Generated:** [Date/Time]  
**Platform:** [Platform name]

## Usage Instructions

1. Copy the prompt for the current cycle
2. Paste into your platform's chat session
3. The agent/workflow will auto-fetch and execute
4. Report completion or issues back
5. Proceed to next cycle prompt

---

## Cycle 1 Prompt

```
@bmad/cham/agents/[agent-name]

**Context:**
[Previous cycle outputs if any]
[Relevant background information]

**Task:**
[Specific instructions for this cycle]
[Clear objectives]

**Expected Output:**
- Format: [output format]
- Location: [where to save]
- Files: [file names]

**Success Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Handoff:**
When complete, provide feedback in this format:
- Status: [complete/failed/needs-iteration]
- Outputs: [list of outputs]
- Next Cycle Input: [data for next cycle]
- Notes: [any relevant notes]

Proceed to Cycle 2 when ready.
```

---

## Cycle 2 Prompt

```
@bmad/cham/agents/[agent-name]

**Context from Cycle 1:**
[Outputs from Cycle 1]
[Feedback from Cycle 1]

**Task:**
[Specific instructions for this cycle]
[Clear objectives]

**Expected Output:**
- Format: [output format]
- Location: [where to save]
- Files: [file names]

**Success Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Handoff:**
When complete, provide feedback in this format:
- Status: [complete/failed/needs-iteration]
- Outputs: [list of outputs]
- Next Cycle Input: [data for next cycle]
- Notes: [any relevant notes]

Proceed to Cycle 3 when ready.
```

[Continue for all cycles...]

---

## Platform-Specific Notes

### Cursor
Use: `@bmad/cham/agents/[agent-name]`

### Windsurf
Use: `cham-[agent-name]` or reference `.windsurf/rules/agents/cham-[agent-name].md`

### Claude Code
Use: `/cham-[command]` or reference `.claude/agents/cham/[agent-name].md`

### KiloCode
Reference workflow files in `.kilocode/workflows/cham-audit/`

### Gemini Studio
Load config from `.gemini/cham/[phase].toml`

### Agent
Use: `cham-[agent-name]` or reference `.agent/rules/agents/cham-[agent-name].md`
