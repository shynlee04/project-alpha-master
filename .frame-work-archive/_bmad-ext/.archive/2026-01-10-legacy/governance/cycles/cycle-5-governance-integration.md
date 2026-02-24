---
id: CYCLE-5
title: Governance Enforcement Integration
description: Inject governance checkpoints into all workflow entry points
agent_mode: workflow-builder
team: B
duration_hours: 2-3
risk_level: LOW
date: 2026-01-09
---

# CYCLE 5: Governance Enforcement Integration

**Agent Mode:** Workflow Builder
**Team:** B
**Duration:** 2-3 hours
**Context Poisoning Risk:** LOW (adding guards, not consuming stale data)

## OBJECTIVE

Inject governance validation checkpoints into ALL workflow entry points to prevent:
- Stories starting without proper artifacts
- Epics claiming completion without gates
- Stale artifacts being consumed
- Numbering violations

## PRECONDITIONS

- [ ] CYCLE 2 completed (sprint regulation)
- [ ] CYCLE 3 completed (standards update)
- [ ] CYCLE 4 completed (workflow-status schema)

## GOVERNANCE CHECKLIST FILES TO CREATE

### Location: `_bmad/modules/governance/checklists/`

```
_bmad/modules/governance/checklists/
├── story-start-gate.yaml
├── story-done-gate.yaml
├── epic-done-gate.yaml
├── sprint-rotation-gate.yaml
├── artifact-freshness-gate.yaml
└── README.md
```

## GATE DEFINITIONS

### 1. Story Start Gate

```yaml
# story-start-gate.yaml
id: "STORY-START-GATE"
version: "1.0.0"
triggers:
  - workflow: "dev-story"
  - workflow: "create-story"

checks:
  - id: "SSG-001"
    name: "Story file exists"
    validation: |
      file_exists("_bmad-output/sprint-artifacts/stories/{story_id}.md")
    action_on_fail: "Create story file first via create-story workflow"
    
  - id: "SSG-002"
    name: "Context file exists"
    validation: |
      file_exists("_bmad-output/sprint-artifacts/stories/{story_id}-context.xml")
    action_on_fail: "Generate context file before development"
    
  - id: "SSG-003"
    name: "Sprint linkage"
    validation: |
      grep -q "{story_id}" sprint-status.yaml
    action_on_fail: "Add story to sprint-status.yaml first"
    
  - id: "SSG-004"
    name: "Epic ordering"
    validation: |
      epic_status("{story_epic}") in ["IN_PROGRESS", "READY"]
    action_on_fail: "Story's epic is BLOCKED - complete blocking epic first"
    
  - id: "SSG-005"
    name: "Story not already DONE"
    validation: |
      story_status("{story_id}") != "DONE"
    action_on_fail: "Story already completed - create new story if more work needed"
```

### 2. Story Done Gate

```yaml
# story-done-gate.yaml
id: "STORY-DONE-GATE"
version: "1.0.0"
triggers:
  - workflow: "code-review"
  - event: "story_completion_claim"

checks:
  - id: "SDG-001"
    name: "Code changes exist"
    validation: |
      git diff --name-only HEAD~5 | grep -q "src/"
    action_on_fail: "No code changes detected - story may not be complete"
    
  - id: "SDG-002"
    name: "TypeScript passes"
    validation: |
      pnpm tsc --noEmit
    action_on_fail: "TypeScript errors exist - fix before marking done"
    severity: "CRITICAL"
    
  - id: "SDG-003"
    name: "Code review completed"
    validation: |
      file_contains("{story_id}.md", "code_review: PASSED")
    action_on_fail: "Run code-review workflow first"
    
  - id: "SDG-004"
    name: "Tests pass"
    validation: |
      pnpm vitest run --reporter=json 2>&1 | grep -q '"success":true'
    action_on_fail: "Unit tests failing - fix before completion"
    severity: "HIGH"
    
  - id: "SDG-005"
    name: "Story file updated"
    validation: |
      file_contains("{story_id}.md", "status: DONE")
    action_on_fail: "Update story status to DONE in story file"
```

### 3. Epic Done Gate

```yaml
# epic-done-gate.yaml
id: "EPIC-DONE-GATE"
version: "1.0.0"
triggers:
  - event: "epic_completion_claim"

checks:
  - id: "EDG-001"
    name: "100% story completion"
    validation: |
      all_stories_in_epic("{epic_id}").status == "DONE"
    action_on_fail: "Not all stories complete - check STORY-INDEX.md"
    severity: "CRITICAL"
    
  - id: "EDG-002"
    name: "E2E test suite exists"
    validation: |
      file_exists("tests/e2e/{epic_id}/*.spec.ts")
    action_on_fail: "Create Playwright E2E tests for epic"
    severity: "CRITICAL"
    
  - id: "EDG-003"
    name: "E2E tests pass 100%"
    validation: |
      pnpm test:e2e --grep "{epic_id}" --reporter=json | grep '"passed"' | wc -l
    action_on_fail: "E2E tests failing - fix all before epic completion"
    severity: "CRITICAL"
    
  - id: "EDG-004"
    name: "Human approval"
    validation: |
      user_confirmed("APPROVED: {epic_id}")
    action_on_fail: "Await human approval with 'APPROVED: {epic_id}'"
    severity: "CRITICAL"
    bypass: false
    
  - id: "EDG-005"
    name: "Retrospective completed"
    validation: |
      file_exists("_bmad-output/sprint-artifacts/retrospectives/{epic_id}-retrospective.md")
    action_on_fail: "Run retrospective workflow before closing epic"
    severity: "HIGH"

human_approval:
  format: "APPROVED: {epic_id}"
  must_contain: ["APPROVED", "EPIC-"]
  documented_in: "sprint-status.yaml"
```

### 4. Sprint Rotation Gate

```yaml
# sprint-rotation-gate.yaml
id: "SPRINT-ROTATION-GATE"
version: "1.0.0"
triggers:
  - schedule: "daily"
  - workflow: "sprint-planning"

checks:
  - id: "SRG-001"
    name: "Max sprint files"
    validation: |
      count_files("_bmad-output/sprint-artifacts/*-sprint-*.yaml") <= 4
    action_on_fail: "Too many sprint files - archive completed sprints"
    
  - id: "SRG-002"
    name: "Sprint freshness"
    validation: |
      youngest_file("_bmad-output/sprint-artifacts/*-sprint-*.yaml").age < 24h
    action_on_fail: "No recent sprint updates - verify sprint is active"
    
  - id: "SRG-003"
    name: "Stale sprint detection"
    validation: |
      no_file_older_than("_bmad-output/sprint-artifacts/*-sprint-*.yaml", 7d, status="COMPLETE")
    action_on_fail: "Completed sprint older than 7 days - archive it"
    
  - id: "SRG-004"
    name: "Single source of truth"
    validation: |
      file_exists("_bmad-output/sprint-artifacts/sprint-status.yaml")
    action_on_fail: "Main sprint-status.yaml missing - critical error"
    severity: "CRITICAL"
```

### 5. Artifact Freshness Gate

```yaml
# artifact-freshness-gate.yaml
id: "ARTIFACT-FRESHNESS-GATE"
version: "1.0.0"
triggers:
  - workflow: "*"  # All workflows

tier_definitions:
  tier_1:
    name: "Constitution"
    ttl: "permanent"
    validation: "read_only_check"
    examples: ["AGENTS.md", "CLAUDE.md"]
    
  tier_2:
    name: "Controlled"
    ttl: "permanent"
    validation: "full_consumption_required"
    examples: ["architecture.md", "prd.md", "epics.md"]
    
  tier_3:
    name: "Archival"
    ttl: "90d"
    validation: "archive_if_stale"
    examples: ["sprint-artifacts/*", "diagnostics/*"]
    
  tier_4:
    name: "Ephemeral"
    ttl: "24h"
    validation: "ignore_if_stale"
    examples: ["handoffs/*", "temp/*"]

checks:
  - id: "AFG-001"
    name: "No stale Tier 3 consumption"
    validation: |
      for_each_consumed_artifact:
        if tier == 3 and age > 90d:
          FAIL("Stale Tier 3 artifact: {path}")
    action_on_fail: "Archive stale artifact or validate before use"
    
  - id: "AFG-002"
    name: "No stale Tier 4 consumption"
    validation: |
      for_each_consumed_artifact:
        if tier == 4 and age > 24h:
          WARN("Stale Tier 4 artifact: {path}")
    action_on_fail: "Ephemeral artifact may be outdated - verify"
```

## WORKFLOW INTEGRATION POINTS

### Workflows to Update:

| Workflow | Gate to Add | Priority |
|----------|-------------|----------|
| `dev-story` | `story-start-gate` | HIGH |
| `code-review` | `story-done-gate` | HIGH |
| `create-story` | `story-start-gate` (partial) | MEDIUM |
| `sprint-planning` | `sprint-rotation-gate` | MEDIUM |
| `retrospective` | `epic-done-gate` (checker) | MEDIUM |
| `correct-course` | `artifact-freshness-gate` | LOW |

### Integration Pattern:

```markdown
# In workflow file, add at STEP 0:

## Step 0: Governance Gate

Before proceeding, validate governance requirements:

1. Load applicable gate: `_bmad/modules/governance/checklists/{gate}.yaml`
2. Run all checks with severity >= HIGH
3. On CRITICAL failure: STOP and report
4. On HIGH failure: WARN and require override
5. On MEDIUM failure: LOG and continue

Bypass command (requires justification):
```
GOVERNANCE_OVERRIDE: {check_id}
REASON: {justification}
```
```

## VALIDATION CHECKLIST

- [ ] All 5 gate files created in checklists/
- [ ] README.md documents gate usage
- [ ] dev-story workflow updated with story-start-gate
- [ ] code-review workflow updated with story-done-gate
- [ ] sprint-planning workflow updated with sprint-rotation-gate
- [ ] All gates have version numbers
- [ ] Human approval bypass is NEVER allowed for epic completion

## OUTPUT ARTIFACTS

1. `_bmad/modules/governance/checklists/story-start-gate.yaml`
2. `_bmad/modules/governance/checklists/story-done-gate.yaml`
3. `_bmad/modules/governance/checklists/epic-done-gate.yaml`
4. `_bmad/modules/governance/checklists/sprint-rotation-gate.yaml`
5. `_bmad/modules/governance/checklists/artifact-freshness-gate.yaml`
6. `_bmad/modules/governance/checklists/README.md`
7. Updated workflow files with gate integration

## HANDOFF

Report completion to orchestrator with:
- List of gate files created
- List of workflows updated
- Any gates that couldn't be automated
- Recommendation for enforcement testing
