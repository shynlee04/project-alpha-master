---
outputFile: '{output_folder}/expert-analysis-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
nextWorkflow: 'research-trigger|correct-course'
workflowName: 'expert-analysis'
---

# Step 4: Recommend

## STEP GOAL

Generate final expert recommendation and determine next steps based on analysis.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 This is the FINAL step
- 💾 Complete all output tracking
- 🔄 Handoff to next workflow or remediation

## SEQUENCE OF INSTRUCTIONS

### 1. Synthesize Findings

Combine results from previous steps:
```
═══════════════════════════════════════════════════════════
EXPERT RECOMMENDATION
═══════════════════════════════════════════════════════════

Issue Level: {from step 3}
Codebase Analysis: {summary from step 2}
Comparison: {summary from step 3}
```

### 2. Determine Recommendation

Based on issue level and flaws:

**Proceed** if ALL apply:
- Issue level: Quick Patch or Feature Fix
- No high-severity flaws
- Low to medium risk
- Compatible with existing patterns

**Warn** if ANY apply:
- Medium to high severity flaws
- Some architectural concerns
- Requires breaking changes
- Complexity concerns

**Stop** if ANY apply:
- Architectural conflict detected
- High-severity flaws
- Breaking API contracts
- Overwhelming complexity
- Research needed first

### 3. Create Expert Report

```yaml
expert_report:
  workflow: "expert-analysis"
  date: "{date}"
  user: "{user_name}"
  status: "complete"

  issue_level: "{from step 3}"
  recommendation: "proceed" | "warn" | "stop"

  analysis_summary:
    codebase_understood: true
    patterns_compatible: {yes|no|partial}
    flaws_count: {count}
    high_severity: {yes|no}

  detected_issues:
    - severity: "{level}"
      type: "{flaw type}"
      description: "{details}"
      must_address: {yes|no}

  next_steps:
    if_proceed:
      - {action}
    if_warn:
      - {warning}
      - {recommended action}
    if_stop:
      - {blocking reason}
      - {required action}

  routing:
    next_workflow: "{determine based on analysis}"
    reason: "{why this workflow}"
```

### 4. Update Output Document

Finalize `{outputFile}` with:
```yaml
---
workflow: "expert-analysis"
date: "{date}"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
expert_report:
  recommendation: "{proceed|warn|stop}"
  next_workflow: "{workflow}"
---
```

Append full expert report.

### 5. Update workflow-status.yaml

Update `{workflowStatus}`:
```yaml
workflow:
  last_expert_analysis:
    workflow: "expert-analysis"
    date: "{date}"
    status: "complete"
    recommendation: "{proceed|warn|stop}"
    issue_level: "{level}"
```

### 6. Present Final Recommendation

```
═══════════════════════════════════════════════════════════
EXERT ANALYSIS COMPLETE
═══════════════════════════════════════════════════════════

Recommendation: {PROCEED|WARN|STOP}

{Explanation of recommendation}

{If WARN: What to address before proceeding}
{If STOP: What is blocking and what to do}

Next Workflow: {next_workflow}
Reason: {why this workflow next}

Options:
[E] Execute next workflow now
[S] Save and continue later
[V] View full expert report
[D] View detailed issues
```

### 7. Handle User Choice

**E**: Load next workflow immediately
- If research needed → research-trigger
- If remediation → correct-course

**S**: Mark ready, exit gracefully

**V**: Display full expert report

**D**: Display detailed issues list

---

## SUCCESS METRICS

- ✅ All steps completed: [1, 2, 3, 4]
- ✅ Expert report created
- ✅ Recommendation clear with reasoning
- ✅ Next workflow identified
- ✅ workflow-status.yaml updated

## FAILURE METRICS

- ❌ Missing recommendation
- ❌ No next workflow identified
- ❌ workflow-status not updated

**WORKFLOW COMPLETE**

When user selects [E], load `{nextWorkflow}`.
