---
nextStepFile: '{installed_path}/steps/step-02-categorize.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/correct-course-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'correct-course'
---

# Step 1: Receive Report

## STEP GOAL

Receive and load governance report with issue categorization.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load governance report
- 📋 Verify issue level provided
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Governance Report

```yaml
governance_report:
  workflow: "governance / expert-analysis"
  date: "{date}"
  decision: "proceed"

  issue_analysis:
    issue_level: "{quick_patch|feature_fix|architectural}"
    confidence: "{high|medium|low}"

  context:
    domains_affected: [list]
    files_to_change: [list]
    estimated_complexity: "{low|medium|high}"

  recommendations:
    approach: "{recommended approach}"
    trade_offs: [acknowledged]
    risks: [identified]
```

### 2. Verify Report Contents

```yaml
verification:
  required_fields:
    - issue_level: present
    - context_slices: present
    - recommended_approach: present

  issue_level_validation:
    quick_patch: "simple bug, single component"
    feature_fix: "independent feature work"
    architectural: "requires comprehensive remediation"
```

### 3. Display Report Summary

```
═══════════════════════════════════════════════════════════
GOVERNANCE REPORT RECEIVED
═══════════════════════════════════════════════════════════

Issue Level: {QUICK_PATCH | FEATURE_FIX | ARCHITECTURAL}
Confidence: {confidence}

Affected Domains:
{list of domains}

Files to Change:
{list of files}

Recommended Approach:
{governance recommendation}

Trade-offs:
{list}

Options:
[C] Continue to categorization
[V] View full report
[R] Request new analysis
```

### 4. Handle User Choice

**C**: Proceed to categorization → Step 2
**V**: Display full governance report
**R**: Request re-analysis (return to governance)

### 5. Update Frontmatter

```yaml
---
stepsCompleted: [1]
governanceReport: "{path}"
issueLevel: "{from_report}"
startedAt: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ Governance report loaded
- ✅ Issue level identified
- ✅ Context slices available
- ✅ Recommendations clear

## FAILURE METRICS

- ❌ Governance report not found
- ❌ Issue level missing
- ❌ No context provided

**ONLY WHEN report loaded, load {nextStepFile}**
