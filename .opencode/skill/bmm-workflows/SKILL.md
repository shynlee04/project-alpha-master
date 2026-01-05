# BMM Workflows Integration - OpenCode Skill

> **Master**: `_bmad/bmm/workflows/` | **Version**: 1.0.0 | **Purpose**: Access BMAD workflow definitions

## Workflow Directory Structure

```
_bmad/bmm/workflows/
├── 1-planning/          ← Sprint planning, epic breakdown
├── 2-analysis/          ← Requirements, research
├── 3-design/            ← Architecture, ADRs
├── 4-implementation/    ← Dev, code review, correct course
└── 5-validation/        ← Testing, verification
```

## Most Used: 4-Implementation

### Dev Story Workflow

**Path**: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`

**Phases**:
1. Create Story Context → 2. Research → 3. Implement → 4. Test → 5. Code Review → 6. Complete

**Usage**:
```markdown
@bmad-bmm-dev-story

Story ID: S-001
Title: Debug Model Loading Flow
Type: IMPLEMENTATION
Hours: 4
Acceptance Criteria:
- Models populate after key save
- Works for Gemini, OpenRouter, custom providers
```

### Code Review Workflow

**Path**: `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`

**Checklist**:
- Design compliance (8-bit, no glassmorphism)
- TypeScript (production code only)
- i18n (all strings via t())
- Test coverage ≥80%

**Usage**:
```markdown
@bmad-bmm-code-review

Story: CC-02
Files: src/lib/agent/providers/
Focus: SSR compatibility, error handling
Standards: Check against AGENTS.md
```

### Correct Course Workflow

**Path**: `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml`

**When to use**:
- Significant deviation from story acceptance criteria
- Blocker requires story modification
- Scope creep detected

**Usage**:
```markdown
@bmad-bmm-correct-course

Current Story: S-007
Issue: Note-folder bridge requires additional wire
Impact: +2 hours
Action: Amend story or create follow-up
```

### Sprint Planning Workflow

**Path**: `_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml`

**Inputs**:
- Epic breakdown
- Story points
- Team capacity

**Usage**:
```markdown
@bmad-bmm-sprint-planning

Epic: ARCH-95 (Comprehensive Remediation)
Remaining Stories: 27
Capacity: 15 hours/week
Prioritization: P0 blockers first
```

## Workflow Status Tracking

All workflows update `bmm-workflow-status.yaml`:

```yaml
workflows:
  - id: "dev-story"
    current_story: "S-001"
    status: "IN_PROGRESS"
    stories_completed: 0

  - id: "code-review"
    pending_reviews: 2

  - id: "correct-course"
    active_corrections: 0
```

## Quick Reference Table

| Workflow | Path | Trigger | Output |
|----------|------|---------|--------|
| **dev-story** | 4-implementation/dev-story | Story not started | Implementation complete |
| **code-review** | 4-implementation/code-review | Story complete | Review feedback |
| **correct-course** | 4-implementation/correct-course | Deviation detected | Course correction plan |
| **sprint-planning** | 4-implementation/sprint-planning | Sprint boundary | Sprint plan |
| **create-story** | 4-implementation/create-story | New story needed | Story artifact |
| **retrospective** | 4-implementation/retrospective | Epic complete | Lessons learned |

## Integration with ASGL

ASGL routes stories to appropriate BMM workflow:

```yaml
# From module-integration.yaml
- condition: "story.requires_code_review == true"
  module: "bmad-core"
  workflow: "code-review"
  agent: "dev"

- condition: "story.type == 'IMPLEMENTATION'"
  module: "bmad-core"
  workflow: "dev-story"
  agent: "dev"
```

## Token Optimization

This skill uses **minimal references**. Full workflow definitions are in `_bmad/bmm/workflows/`. This pattern:

- ✅ Ensures consistency (single source)
- ✅ Enables live updates
- ✅ Reduces token count by ~80%

## Related Skills

| Skill | Purpose |
|-------|---------|
| `bmad-core-integration` | Agent access and routing |
| `asgl` | Autonomous loop orchestration |
| `architecture-remediation` | God store/component fixes |

## Command Aliases

| Alias | Maps To |
|-------|---------|
| `@dev-story` | dev-story workflow |
| `@code-review` | code-review workflow |
| `@correct-course` | correct-course workflow |
| `@sprint-plan` | sprint-planning workflow |

---

**Generated**: 2026-01-05 | **Module**: `_bmad/bmm/workflows/`
