# Governance Checklists

Gate validation files for workflow enforcement.

## Available Gates

| Gate | File | Triggers |
|------|------|----------|
| Story Start | [story-start-gate.yaml](story-start-gate.yaml) | dev-story, create-story |
| Story Done | [story-done-gate.yaml](story-done-gate.yaml) | code-review, story completion |
| Epic Done | [epic-done-gate.yaml](epic-done-gate.yaml) | epic completion claim |
| Sprint Rotation | [sprint-rotation-gate.yaml](sprint-rotation-gate.yaml) | daily, sprint-planning |
| Artifact Freshness | [artifact-freshness-gate.yaml](artifact-freshness-gate.yaml) | all workflows |

## Usage

Each gate file defines:
- `id`: Unique identifier
- `version`: Semantic version
- `triggers`: Which workflows activate this gate
- `checks`: List of validations with severity

## Severity Levels

| Level | Action |
|-------|--------|
| CRITICAL | Stop workflow, require fix |
| HIGH | Warn, require override justification |
| MEDIUM | Log warning, continue |
| LOW | Informational only |

## Override Protocol

```yaml
# To override a check (requires justification):
GOVERNANCE_OVERRIDE: {check_id}
REASON: {detailed explanation}
```

**Note:** Epic completion gates (`EDG-004`) cannot be overridden.
