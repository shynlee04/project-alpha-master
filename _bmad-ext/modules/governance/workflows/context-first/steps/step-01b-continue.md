---
outputFile: '{output_folder}/context-first-output-{date}.md'
workflowName: 'context-first'
---

# Step 1b: Continue

## STEP GOAL

Handle continuation from existing context-first workflow output.

## EXECUTION INSTRUCTIONS

### 1. Load Existing Output

Read `{outputFile}` and check:
- `stepsCompleted` array
- Previous `scan_request`
- Current status

### 2. Report Status to User

Display current state:
```
═══════════════════════════════════════════════════════════
EXISTING WORKFLOW FOUND
═══════════════════════════════════════════════════════════

Date: {date}
Status: {status}
Steps Completed: {stepsCompleted}

Scan Configuration:
  Domains: {domains}
  Depth: {depth}
  Intent: {user_intent}
```

### 3. Present Options

```
Options:
[C] Continue from Step {next_step_number}
[R] Restart workflow (will archive current output)
[X] Exit
```

### 4. Handle User Choice

**If C**: Load `{nextStepFile}` where next_step_number = last completed + 1

**If R**: Archive current output, restart from step-01-scan.md

**If X**: Exit workflow gracefully

---

## SUCCESS METRICS

- ✅ Existing state properly loaded
- ✅ User choice handled correctly
- ✅ Continuation routed to correct next step
