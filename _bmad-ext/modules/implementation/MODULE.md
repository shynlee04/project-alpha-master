---
name: "implementation"
version: "1.0.0"
status: "active"
phase: "4"
created: "2026-01-11"
updated: "2026-01-11"
tier: "execution"
description: "BMAD Extension Implementation Module - Story execution and bug fix workflows"
---

# Implementation Module

**Purpose**: Execute development work through story-cycle (new features) and correct-course (bug fixes/remediation) workflows.

## Phase Position

**PHASE 4: Implementation** - Execution layer for all development work

```
[PHASE 0] Governance Check → Approve
    ↓
[PHASE 1] Governance Consolidation → Complete
    ↓
[PHASE 3] Orchestrator Update → Routing Active
    ↓
[PHASE 4] Implementation (THIS MODULE)
    ├── Story-Cycle (new features)
    └── Correct-Course (bug fixes, remediation)
    ↓
[PHASE 5] Enhanced Agent Wrappers
```

## Workflows

### 1. Story-Cycle Workflow

**Purpose**: Execute stories from assignment to completion with sprint tracking

**Entry Point**:
- Governance approval for new feature
- User assigns story to current sprint
- Orchestrator routes to story-cycle

**Output**:
- Story completed with tests
- Sprint status updated
- Handoff artifact created

**Steps**:
1. **Init**: Load story context, validate prerequisites
2. **Validate**: Check dependencies, sprint capacity
3. **Implement**: Execute development work
4. **Test**: Run tests, verify coverage
5. **Review**: Code review, quality check
6. **Done**: Update sprint-status, mark complete
7. **Retrospective**: Story completion summary

**Location**: `workflows/story-cycle/`

### 2. Correct-Course Workflow

**Purpose**: Categorize and execute bug fixes and remediation work

**Entry Point**:
- Governance approval for remediation
- Bug/error report filed
- Orchestrator routes to correct-course

**Categorization** (determines sub-workflow):
1. **Quick Patch**: Simple bugs, wrong component wiring
2. **Feature Fix**: Independent feature, no chained impact
3. **Architectural Conflict**: Requires comprehensive remediation

**Steps**:
1. **Receive Report**: Get governance report with issue level
2. **Categorize**: Determine remediation type
3. **Route**: Delegate to appropriate sub-workflow
4. **Complete**: Update status, create handoff

**Sub-Workflows**:
- `quick-patch/`: Simple fixes, single component
- `feature-fix/`: Independent features
- `architectural-conflict/`: Deep remediation, god-store-split, component-split, typescript-fix

**Location**: `workflows/correct-course/`

## Directory Structure

```
implementation/
├── MODULE.md                    # This file
├── workflows/
│   ├── story-cycle/             # Story execution workflow
│   │   ├── workflow.md
│   │   └── steps/
│   │       ├── step-01-init.md
│   │       ├── step-02-validate.md
│   │       ├── step-03-implement.md
│   │       ├── step-04-test.md
│   │       ├── step-05-review.md
│   │       ├── step-06-done.md
│   │       └── step-07-retrospective.md
│   └── correct-course/          # Bug fix/remediation workflow
│       ├── workflow.md
│       ├── steps/
│       │   ├── step-01-receive-report.md
│       │   ├── step-02-categorize.md
│       │   ├── step-03-route.md
│       │   └── step-04-complete.md
│       └── sub-workflows/
│           ├── quick-patch/
│           ├── feature-fix/
│           └── architectural-conflict/
├── agents/                      # Remediation agents
│   ├── store-refactorer.md
│   ├── component-splitter.md
│   └── typescript-fixer.md
├── templates/
│   └── story-template.md
└── config/
    └── categorization-rules.yaml
```

## Integration Points

### Input (from Governance Phase 0)
```yaml
governance_report:
  issue_level: "quick_patch" | "feature_fix" | "architectural"
  context_slices: [list of relevant files]
  recommended_approach: "expert recommendation"
  decision: "proceed"
```

### Output
- **Story-Cycle**: Updated `sprint-status.yaml`, story completion artifact
- **Correct-Course**: Remediation complete, bug resolution artifact

### Updates
- `sprint-status.yaml`: Story status, tests, completion
- `workflow-status.yaml`: Epic tracking

## Dependencies

- **Requires**: Phase 0 (Governance) approval
- **Requires**: Phase 1 (Consolidation) complete
- **Requires**: Phase 3 (Orchestrator) routing
- **Integrates with**: Phase 5 (Enhanced Agent Wrappers)

## Routing Rules

```yaml
routing:
  to_story_cycle:
    - "governance.issue_level == 'new_feature'"
    - "story_key exists and assigned"
    - "sprint has capacity"

  to_correct_course:
    - "governance.issue_level in ['quick_patch', 'feature_fix', 'architectural']"
    - "bug or error report filed"
    - "remediation approved"
```

## Handoff Protocol

When story/fix complete:
1. Create handoff artifact with summary
2. Update sprint-status.yaml
3. Notify orchestrator
4. Option: Handoff to next workflow or complete

---

## History

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | 1.0.0 | Initial Phase 4 implementation module creation |
