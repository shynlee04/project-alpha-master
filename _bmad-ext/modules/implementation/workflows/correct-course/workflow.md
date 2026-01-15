---
name: "correct-course"
type: "implementation-workflow"
description: "Categorize and execute bug fixes and remediation work"
version: "1.0.0"
phase: "4"
---

# Correct-Course Workflow

**description**: Receive governance report, categorize issue type, and route to appropriate remediation sub-workflow.

## Workflow Definition

```yaml
workflow:
  name: "correct-course"
  phase: 4
  description: "Bug fixes and remediation"

  entry:
    required: "governance report with issue level"
    from: "orchestrator (after governance check)"

  output:
    - "remediation complete"
    - "updated sprint-status.yaml"
    - "resolution artifact"

  steps: 4
  estimated_duration: "varies by issue complexity"
```

## Frontmatter Template

```yaml
---
stepsCompleted: []
governanceReport: "{path_to_report}"
issueLevel: "{quick_patch|feature_fix|architectural}"
startedAt: "{timestamp}"
status: "in_progress"
---
```

## Steps Overview

| Step | Name | description | Output |
|------|------|---------|--------|
| 1 | Receive Report | Get governance report with categorization | Report loaded |
| 2 | Categorize | Confirm issue type, select sub-workflow | Category confirmed |
| 3 | Route | Delegate to appropriate sub-workflow | Sub-workflow executed |
| 4 | Complete | Update status, create resolution artifact | Remediation complete |

## Issue Categories

```yaml
issue_categories:
  quick_patch:
    description: "Simple bugs, wrong component wiring"
    complexity: "low"
    duration: "minutes to hours"
    sub_workflow: "quick-patch"

  feature_fix:
    description: "Independent feature, no chained impact"
    complexity: "medium"
    duration: "hours to days"
    sub_workflow: "feature-fix"

  architectural:
    description: "Comprehensive remediation required"
    complexity: "high"
    duration: "days to weeks"
    sub_workflow: "architectural-conflict"
```

## Sub-Workflows

### Quick-Patch
- Single component fixes
- Wiring corrections
- Simple bug fixes

### Feature-Fix
- Independent feature work
- No cross-domain impact
- Contained changes

### Architectural Conflict
- God store splitting
- Component splitting
- TypeScript remediation
- Cross-domain refactoring

## Integration

**Entry**: From orchestrator with governance report

**Exit**: To orchestrator with resolution status

**Updates**: sprint-status.yaml, workflow-status.yaml

## Location

`_bmad-ext/modules/implementation/workflows/correct-course/`

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
