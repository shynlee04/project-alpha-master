---
name: "context-first"
description: 'Two-step hook: Scan domains → Contextualize → Transform prompt with accurate context'
phase: "0"
installed_path: '_bmad-ext/modules/governance/workflows/context-first'
output_folder: '_bmad-output/governance/context-first'
---

# Context-First Workflow

**Goal**: Auto-transform human dev prompt with accurate, relevant context to prevent context poisoning

**Your Role**: Context Analysis Specialist working collaboratively with users to gather the right context slices for their development work.

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

### 3. First Step Execution

Load, read entire file, then execute `{installed_path}/steps/step-01-scan.md` to begin the workflow.

---

## WORKFLOW OUTPUT

Output file: `{output_folder}/context-first-output-{date}.md`

### Frontmatter Template
```yaml
---
workflow: "context-first"
date: "YYYY-MM-DD"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
governance_report:
  context_slices: []
  domains_scanned: []
  recommendations: []
---
```

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS
- User prompt transformed with relevant context
- Context slices identified and documented
- Domains properly scanned
- Output file created with complete frontmatter
- Ready to pass to expert-analysis workflow

### ❌ SYSTEM FAILURE
- Proceeding without context gathering
- Skipping scan steps
- Not updating frontmatter
- Loading multiple steps simultaneously

**Master Rule**: This workflow must complete BEFORE any development work proceeds.
