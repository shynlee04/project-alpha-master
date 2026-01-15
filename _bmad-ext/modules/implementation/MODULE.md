---
name: "implementation"
version: "2.0.0"
status: "active"
phase: "4"
created: "2026-01-11"
updated: "2026-01-12"
tier: "execution"
description: "BMAD Extension Implementation Module v2.0 - Story execution and bug fix workflows with deep analysis, evidence-based validation, and real code verification."
---

# Implementation Module v2.0

## Description

Execute development work through story-cycle (new features) and correct-course (bug fixes/remediation) workflows with **v2.0 enhancements**.

## v2.0 Key Improvements

| Aspect | v1.0 | v2.0 Enhanced |
|--------|------|---------------|
| **Context Loading** | Read story file | **ENFORCED** grep/glob analysis |
| **Cross-Impact** | None | Full workspace/story mapping |
| **Dead Code Detection** | None | Systematic overlap analysis |
| **Validation** | Basic checklist | **Evidence-based** with file:line |
| **Code Review** | Diff summary | **Real code** path walking |
| **Journey Mapping** | Script only | **Code-verified** journey |
| **Skepticism** | Assumed correct | **Evidence before assertion** |

## Timing Standards (Based on Actual Data)

| Work Unit | Real Average | Examples |
|-----------|--------------|----------|
| **Story (simple)** | 1-2 hours | FS-05: 1.5h, MOBILE stories |
| **Story (complex)** | 2-4 hours | 40-01 Tool Registry: ~3h |
| **Epic (6-8 stories)** | 4-8 hours | EPIC-40: 12 stories/day |
| **Epic (mini 3-4)** | 2-4 hours | EPIC-39: 4 stories/day |

### Velocity Reality

```
✅ NORMAL: 4-8 stories/day, 1-3 epics/day
✅ EXCEPTIONAL: 2-3 epics/day in flow state
```

### Time-Boxing

| Level | Duration | On Timeout |
|-------|----------|------------|
| Step | 15 min | Escalate to story |
| Story | 4 hours max | Split or continue |
| Deep Investigation | 30 min | Split story |

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

## Workflows v2.0

### 1. Story-Cycle Workflow v2.0

**description**: Execute stories from assignment to completion with **deep analysis**, **evidence-based validation**, and **real code verification**.

**v2.0 Enhancements**:
- **Step 1 (Init)**: Deep project analysis via grep/glob
- **Step 1a (Journey)**: Code-verified journey with state machine
- **Step 2 (Validate)**: Evidence-based checklist with file:line
- **Step 3a (Tool Spec)**: Agent tool specifications
- **Step 3 (Implement)**: **ENFORCED** context loading + conflict detection
- **Step 5 (Review)**: Real code path walking + HTML validation
- **Step 6a (Reality)**: Visual regression with journey comparison

**Entry Point**:
- Governance approval for new feature
- User assigns story to current sprint
- Orchestrator routes to story-cycle

**Output**:
- Story completed with tests
- Sprint status updated
- Handoff artifact created

**Steps**:
1. **Init (v2.0)**: Load story + deep project analysis
2. **User Journey (v2.0)**: Code-verified journey simulation
3. **Validate (v2.0)**: Evidence-based prerequisites
4. **Agent Tool Spec**: Define AI/LLM tool specifications
5. **Implement (v2.0)**: TDD with enforced grep/glob + conflict detection
6. **Test**: Run tests, verify coverage
7. **Review (v2.0)**: Real code analysis + journey walking
8. **Done**: Update sprint-status, mark complete
9. **Reality Check (v2.0)**: Visual verification with journey map
10. **Retrospective**: Story completion summary

**Location**: `workflows/story-cycle/`

### 2. Correct-Course Workflow

**description**: Categorize and execute bug fixes and remediation work

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

## Entry Point

### Via EXCALIBUR (Recommended)
```bash
# Activate via ext-master agent
/ext-master
# Then select: [IM] Implementation Module
```

### Direct Entry
```bash
# Load workflow directly
cat _bmad-ext/modules/implementation/workflows/story-cycle/workflow.md
```

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

**Version**: 2.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
