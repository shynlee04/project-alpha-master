---
nextStepFile: '{installed_path}/steps/step-03-route.md'
continueFile: '{installed_path}/steps/step-02b-continue.md'
outputFile: '{output_folder}/correct-course-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'correct-course'
---

# Step 2: Categorize

## STEP GOAL

Confirm issue categorization and select appropriate remediation sub-workflow.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Confirm issue category
- 📋 Select sub-workflow
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Issue Categories

```yaml
categories:
  quick_patch:
    description: "Simple fixes, single component"
    characteristics:
      - "Single file or component affected"
      - "Straightforward fix"
      - "No cross-domain impact"
      - "Duration: minutes to hours"

    examples:
      - "Wrong component wiring"
      - "Simple bug fix"
      - "Typo correction"
      - "Missing import"

    sub_workflow: "quick-patch"

  feature_fix:
    description: "Independent feature work"
    characteristics:
      - "Contained feature change"
      - "Multiple related files"
      - "No chained dependencies"
      - "Duration: hours to days"

    examples:
      - "New feature addition"
      - "Feature enhancement"
      - "UI component update"
      - "API endpoint addition"

    sub_workflow: "feature-fix"

  architectural:
    description: "Comprehensive remediation"
    characteristics:
      - "Cross-domain impact"
      - "Requires refactoring"
      - "Affects multiple components"
      - "Duration: days to weeks"

    examples:
      - "God store splitting"
      - "Component breakup"
      - "TypeScript remediation"
      - "Layer violation fix"

    sub_workflow: "architectural-conflict"
```

### 2. Display Categorization

```
═══════════════════════════════════════════════════════════
ISSUE CATEGORIZATION
═══════════════════════════════════════════════════════════

Governance Recommendation: {issue_level}

Analysis:
├─ Files Affected: {count}
├─ Domains Impacted: {list}
├─ Cross-Domain: {yes|no}
└─ Estimated Duration: {time}

Category Breakdown:

[1] QUICK_PATCH - Simple fixes
    ├─ Single component
    ├─ Straightforward fix
    └─ Minutes to hours

[2] FEATURE_FIX - Independent feature
    ├─ Contained change
    ├─ Multiple related files
    └─ Hours to days

[3] ARCHITECTURAL - Comprehensive remediation
    ├─ Cross-domain impact
    ├─ Requires refactoring
    └─ Days to weeks

Recommendation: {governance recommendation}

Options:
[1] Select QUICK_PATCH
[2] Select FEATURE_FIX
[3] Select ARCHITECTURAL
[R] Follow governance recommendation
[V] View detailed analysis
```

### 3. Handle User Choice

**[1-3]**: Select specific category
**R**: Use governance recommendation
**V**: Show detailed analysis

### 4. Confirm Category

```
Selected: {category}

Sub-workflow: {sub_workflow_name}

Characteristics:
{list of characteristics for selected category}

Confirm?
[1] Yes, proceed to routing
[2] No, change selection
```

### 5. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2]
selectedCategory: "{category}"
subWorkflow: "{sub_workflow_name}"
confirmedAt: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ Category confirmed
- ✅ Sub-workflow selected
- ✅ User confirmation received

## FAILURE METRICS

- ❌ Category not selected
- ❌ Sub-workflow unclear
- ❌ No user confirmation

**ONLY WHEN category confirmed, load {nextStepFile}**
