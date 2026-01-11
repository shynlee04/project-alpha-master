---
name: "context-first"
description: 'Three-step hook: Scan domains → Validate code → Contextualize → Transform prompt with accurate context'
phase: "0"
installed_path: '_bmad-ext/modules/governance/workflows/context-first'
output_folder: '_bmad-output/governance/context-first'
version: "1.1.0"
updated: "2026-01-11"
---

# Context-First Workflow (Updated)

**Goal**: Auto-transform human dev prompt with accurate, relevant context + validate code continuity

**Enhanced**: Now includes story continuity check and actual code validation (TypeScript + Vitest)

## Real Timing Standards

| Work Unit | Real Average | Examples |
|-----------|--------------|----------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories/day |

### Velocity Reality
```
✅ NORMAL: 4-8 stories/day, 1-3 epics/day
✅ EXCEPTIONAL: 2-3 epics/day in flow state
```

## WORKFLOW ARCHITECTURE

### Core Principles

- **Micro-file Design**: Each step is a self-contained instruction file
- **Just-In-Time Loading**: Only current step file is loaded/executed at a time
- **Sequential Enforcement**: Steps must complete in order, no skipping
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted`
- **Append-Only Building**: Build documents by appending content as directed

### Step Processing Rules

1. **READ COMPLETELY**: Always read entire step file before taking action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order
3. **WAIT FOR INPUT**: Halt at menus and wait for user selection
4. **CHECK CONTINUATION**: Only proceed when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load entire next step file, then execute

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing
- 🎯 **ALWAYS** follow exact instructions in step files
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps

---

## INITIALIZATION SEQUENCE

### 1. Load Configuration

Load and read full config from {project-root}/_bmad/bmb/config.yaml and resolve:
- `project_name`, `output_folder`, `user_name`, `communication_language`
- ✅ ALWAYS speak output in `{communication_language}`

### 2. Load Workflow State

Check for existing output file at `{output_folder}/{workflow_name}-output-{date}.md`:
- If exists with `stepsCompleted`, handoff to continue step
- If fresh, create new output file from template

### 3. Story Continuity Check (NEW - Pre-Scan)

Before any scanning, validate code and story state:

```yaml
story_continuity_precheck:
  - "Run TypeScript: pnpm tsc --noEmit"
  - "Run Tests: pnpm vitest run"
  - "Check bmm-workflow-status.yaml for current story"
  - "Verify LOOP_STATE is current"

  if_validation_fails:
    - "BLOCK context gathering"
    - "Prompt: Fix code/tests before continuing"
    - "Log to LOOP_STATE.errors"

  if_story_stale:
    - "Prompt: Continue/Defer current story?"
    - "If continue: Load story context"
    - "If defer: Update bmm-workflow-status.yaml"
```

### 4. First Step Execution

Load, read entire file, then execute `{installed_path}/steps/step-01-scan.md` to begin the workflow.

---

## WORKFLOW OUTPUT

Output file: `{output_folder}/context-first-output-{date}.md`

### Frontmatter Template
```yaml
---
workflow: "context-first"
version: "1.1.0"
date: "YYYY-MM-DD"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"

story_continuity:
  current_story: "FS-05"
  story_status: "in_progress"
  time_in_story: "2.5h"
  code_validation:
    typescript: "passing"
    tests: "passing"

governance_report:
  context_slices: []
  domains_scanned: []
  recommendations: []

code_validation:
  typescript:
    status: "passing"
    errors: 0
  tests:
    status: "passing"
    failures: 0
---
```

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS
- Code validation passes (TypeScript + Tests)
- Story continuity verified
- User prompt transformed with relevant context
- Context slices identified and documented
- Domains properly scanned
- Output file created with complete frontmatter
- Ready to pass to expert-analysis workflow

### ❌ SYSTEM FAILURE
- Proceeding without code validation
- Skipping scan steps
- Not updating frontmatter
- Loading multiple steps simultaneously
- Story stale > 4 hours without check

**Master Rule**: Code validation MUST pass BEFORE context gathering begins.

---

## Story Continuity Enforcement

### Before Context Gathering

```yaml
pre_context_gathering:
  1. "Run pnpm tsc --noEmit"
     - If errors > 0: BLOCK, prompt to fix

  2. "Run pnpm vitest run"
     - If failures > 0: BLOCK, prompt to fix

  3. "Check bmm-workflow-status.yaml"
     - Current story: {story_id}
     - Status: {in_progress|done}
     - Time elapsed: {time}

  4. "If story stale > 4 hours:"
     - Prompt: Continue/Defer?
     - If Continue: Load story context
     - If Defer: Update bmm-workflow-status.yaml
```

### After Story Completion

```yaml
post_story_completion:
  1. "Update bmm-workflow-status.yaml"
  2. "Run pnpm tsc --noEmit"
  3. "Run pnpm vitest run"
  4. "Check if governance update needed (every 3 stories)"
  5. "Prepare next story context"

  if_governance_needed:
    - "Update AGENTS.md"
    - "Update CLAUDE.md"
    - "Update _bmad-ext/modules/*/MODULE.md"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-11 | Added story continuity check, code validation, timing governance |
| 1.0.0 | 2026-01-11 | Initial context-first workflow |
