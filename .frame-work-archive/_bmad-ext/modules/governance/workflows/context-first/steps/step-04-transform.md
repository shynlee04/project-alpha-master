---
outputFile: '{output_folder}/context-first-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
nextWorkflow: 'expert-analysis'
workflowName: 'context-first'
---

# Step 4: Transform and Complete

## STEP GOAL

Finalize the context transformation, create governance report, and prepare for expert-analysis workflow.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 This is the FINAL step of context-first
- 💾 Complete all output tracking
- 🔄 Handoff to next workflow

## SEQUENCE OF INSTRUCTIONS

### 1. Finalize Transformed Prompt

Confirm the transformed prompt from Step 3:
```
═══════════════════════════════════════════════════════════
FINAL TRANSFORMED PROMPT
═══════════════════════════════════════════════════════════

{Transformed prompt content}

This will be used for the next workflow.
```

### 2. Create Governance Report

Generate governance report structure:
```yaml
governance_report:
  workflow: "context-first"
  date: "{date}"
  user: "{user_name}"
  status: "complete"

  original_request: "{user_intent}"

  scan_configuration:
    domains: [from step 1]
    depth: [from step 1]

  scan_results:
    scanners_run: [count]
    files_analyzed: [count]
    findings_count: [count]

  context_package:
    primary_context: [files]
    secondary_context: [files]
    relationships: [relationships]

  transformed_prompt: |
    {The actual transformed prompt}

  recommendations:
    next_workflow: "expert-analysis"
    priority: [determine based on scan findings]
    warnings: [from scan results]

  decision: "proceed" # | "warn" | "stop"
```

### 3. Update Output Document

Finalize `{outputFile}` with:
```yaml
---
workflow: "context-first"
date: "{date}"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
governance_report:
  decision: "proceed"
  next_workflow: "expert-analysis"
  priority: [determined]
---
```

Append final summary.

### 4. Update workflow-status.yaml

Update `{workflowStatus}` with context-first completion:
```yaml
workflow:
  last_governance_check:
    workflow: "context-first"
    date: "{date}"
    status: "complete"
    decision: "proceed"
```

### 5. Present Completion Summary

```
═══════════════════════════════════════════════════════════
CONTEXT-FIRST COMPLETE
═══════════════════════════════════════════════════════════

✓ Domains scanned: {count}
✓ Files analyzed: {count}
✓ Context slices gathered: {count}
✓ Prompt transformed

Output: {outputFile}

Next: Expert Analysis Workflow

This will analyze your request against the codebase
to determine bug/error level and detect potential issues.

Options:
[E] Execute expert-analysis now
[S] Save and continue later
[V] View full governance report
```

### 6. Handle User Choice

**E**: Load `{nextWorkflow}` immediately

**S**: Mark workflow as ready to continue, exit gracefully

**V**: Display full governance report from output document

---

## SUCCESS METRICS

- ✅ All steps completed: [1, 2, 3, 4]
- ✅ Governance report created
- ✅ workflow-status.yaml updated
- ✅ Output document finalized
- ✅ Ready to handoff to expert-analysis

## FAILURE METRICS

- ❌ Incomplete steps in stepsCompleted
- ❌ Missing governance report
- ❌ workflow-status not updated
- ❌ No handoff path defined

**WORKFLOW COMPLETE**

When user selects [E], load `{nextWorkflow}` to continue with expert analysis.
