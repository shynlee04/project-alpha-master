# Command: sprint-planning-wrapper

> **Module**: `_bmad-ext/modules/sprint-planning-wrapper/` | **Version**: 1.0.0

---

## Description

Enhanced sprint planning with **Cohesion Validation**, **Dependency Mapping**, and **Product Reality Gates**. This wrapper wraps the BMAD sprint-planning workflow and adds validation to prevent "Dual Chat" type issues before sprint execution.

---

## Usage

```bash
sprint-plan                    # Start enhanced sprint planning
sprint-plan continue           # Resume from previous step
sprint-plan step=N             # Jump to specific step
```

---

## 7-Step Workflow

| Step | Name | Purpose |
|------|------|---------|
| 01 | Discover Epics | Scan for epic files in planning artifacts |
| 02 | Generate Status | Execute BMAD sprint-planning workflow |
| 03 | Cohesion Check | **NEW**: Movie Script Test for sprint narrative |
| 04 | Dependency Map | **NEW**: Map cross-story dependencies + temporal conflicts |
| 05 | Reality Validation | **NEW**: Nonsense detector (duplicate workflows, contradictions) |
| 06 | Gatekeeping | Auto-validation with loop-back on failures |
| 07 | Handoff | Prepare handoff context for story-cycle |

---

## Product Reality Validation

### Cohesion Scanner (Step 03)
- **Narrative Check**: 30-second demo script for entire sprint
- **Dependency Friction**: Story completion dates vs dependency start dates
- **Ghost Logic**: Missing error/empty/loading state definitions

### Dependency Scanner (Step 04)
- **Explicit**: Declared dependencies in story metadata
- **Implicit**: Shared components, data flow, API changes
- **Temporal**: "Story A finishes Day 4, Story B starts Day 1" = CONFLICT

### Nonsense Detector (Step 05)
| Pattern | Severity | Description |
|---------|----------|-------------|
| duplicate_workflows | high | Multiple ways to achieve same goal |
| contradictory_requirements | critical | Stories that conflict with each other |
| orphan_features | medium | Features with no clear entry point |
| zombie_features | low | Features that will be immediately replaced |

---

## Gating Rules

```yaml
thresholds:
  cohesion_score:
    min: 3
    blocking: false
  validation_score:
    min: 4
    blocking: true
  dependency_conflicts:
    critical:
      max: 0
      blocking: true
```

**Loop-back on failure**: If gates fail, workflow loops back to Step 03 (reorder stories, adjust scope).

---

## Output Artifacts

```
_bmad-output/sprint-artifacts/
├── sprint-status.yaml              # Enhanced with cohesion flags
├── cohesion-report-2026-01-11.md   # Sprint cohesion analysis
├── dependency-map.yaml             # Cross-story dependency graph
└── demo-script.md                  # 30-second sprint narrative
```

---

## Handoff to Story-Cycle

After successful gatekeeping, the wrapper creates handoff with:
- Story keys in priority order
- Journey context for each story
- Agent tool specs (if applicable)
- Blocking stories highlighted
- Dependency map for reference

---

## Configuration Files

- `_bmad-ext/modules/sprint-planning-wrapper/config/gating-rules.yaml`
- `_bmad-ext/modules/sprint-planning-wrapper/config/cohesion-patterns.yaml`
- `_bmad-ext/modules/sprint-planning-wrapper/scanners/`

---

**See Also**: `story-cycle`, `dev-story`, `correct-course`
