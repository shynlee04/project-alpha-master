---
outputFile: '{output_folder}/research-trigger-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
nextWorkflow: 'correct-course|story-cycle'
workflowName: 'research-trigger'
---

# Step 4: Complete

## STEP GOAL

Finalize research report, update governance records, and determine next steps.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 This is the FINAL step
- 💾 Complete all output tracking
- 🔄 Handoff to next workflow

## SEQUENCE OF INSTRUCTIONS

### 1. Synthesize Full Report

Combine all findings:
```
═══════════════════════════════════════════════════════════
RESEARCH REPORT COMPLETE
═══════════════════════════════════════════════════════════

Research Topics: {count}
Questions Answered: {count}
Recommendations: {count}
```

### 2. Create Final Research Report

```yaml
research_report:
  workflow: "research-trigger"
  date: "{date}"
  user: "{user_name}"
  status: "complete"

  trigger: "{why research was needed}"

  research_conducted:
    topics: [list]
    sources: [count]
    date_range: "{date}"

  findings:
    answers: [to each question]
    recommendations: [for each topic]
    trade_offs: [acknowledged]

  decision:
    overall: "proceed" | "proceed_with_caution" | "reconsider"
    rationale: "{why this decision}"

  next_workflow:
    name: "{determine based on findings}"
    reason: "{why this workflow}"
    context_to_carry: [what to pass along]
```

### 3. Update Output Document

Finalize `{outputFile}`:
```yaml
---
workflow: "research-trigger"
date: "{date}"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
research_report:
  decision: "{overall decision}"
  next_workflow: "{workflow}"
---
```

Append complete report with all findings.

### 4. Update workflow-status.yaml

Update `{workflowStatus}`:
```yaml
workflow:
  last_research:
    workflow: "research-trigger"
    date: "{date}"
    status: "complete"
    decision: "{overall decision}"
    recommendations: [count]
```

### 5. Present Final Report

```
═══════════════════════════════════════════════════════════
RESEARCH TRIGGER COMPLETE
═══════════════════════════════════════════════════════════

Decision: {PROCEED|PROCEED WITH CAUTION|RECONSIDER}

{Explanation}

Recommendations: {count}
{Brief list}

Next Workflow: {next_workflow}
{Why and what to carry forward}

Options:
[E] Execute next workflow now
[S] Save and continue later
[V] View full research report
[D] View detailed recommendations
```

### 6. Handle User Choice

**E**: Load next workflow
- If remediation needed → correct-course
- If clear to proceed → story-cycle

**S**: Mark ready, exit

**V**: Display full report

**D**: Display detailed recommendations

---

## DECISION CRITERIA

**PROCEED** when:
- All concerns are low severity
- Recommendations align with user intent
- Trade-offs are acceptable
- Best practices validated

**PROCEED WITH CAUTION** when:
- Some medium concerns exist
- Trade-offs require monitoring
- Some deviation from best practice (with justification)

**RECONSIDER** when:
- High severity concerns
- Fundamental flaws in approach
- Better alternatives identified
- Research contradicts the approach

---

## SUCCESS METRICS

- ✅ All steps completed: [1, 2, 3, 4]
- ✅ Research report complete
- ✅ Decision clearly justified
- ✅ Next workflow identified
- ✅ workflow-status.yaml updated

## FAILURE METRICS

- ❌ Missing final decision
- ❌ No clear next steps
- ❌ workflow-status not updated

**WORKFLOW COMPLETE**

When user selects [E], load `{nextWorkflow}`.
