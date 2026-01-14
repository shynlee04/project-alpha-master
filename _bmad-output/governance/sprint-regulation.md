# Sprint Artifact Regulation

**Version:** 1.0.0
**Date:** 2026-01-09T20:48:00+07:00
**Updated By:** Team A - CYCLE 2 Governance

---

## Active Sprint Files (Max 4)

| File | description | Created | Status |
|------|---------|---------|--------|
| sprint-status.yaml | Master sprint truth | 2026-01-09 | ACTIVE |
| phase-2-sprint-status-2026-01-09.yaml | Phase 2 FS work | 2026-01-09 | ACTIVE |
| phase-1.5-sprint-status-2026-01-09.yaml | Stabilization | 2026-01-09 | ACTIVE |
| phase-3-marketing-sprint-2026-01-09.yaml | Marketing prep | 2026-01-09 | ACTIVE |

**Count:** 4 (at limit)

---

## Rules Enforced

### 1. Maximum Sprint Files: 4

Only 4 sprint YAML files allowed in active `sprint-artifacts/`:
- Primary `sprint-status.yaml` (always kept)
- Up to 3 phase-specific files

**Enforcement:** Daily rotation check

### 2. 24-Hour Rotation Policy

Sprint files with status `COMPLETE` and age > 24h are automatically archived.

**Archive Location:** `_bmad-output/.archive/{YYYY-MM-DD}/sprint-artifacts/`

### 3. Story Index as Source of Truth

Sprint files reference story index, not inline content:

```yaml
# In sprint-status.yaml
stories:
  index: "_bmad-output/sprint-artifacts/stories/STORY-INDEX.md"
  active_count: 4
  completed_count: 12
```

### 4. Epic Ordering Gate

| Rule | Description |
|------|-------------|
| Monotonic | Epic N must have higher number than Epic N-1 |
| Sequential | Story FS-05 requires FS-04 exists |
| Gated | Epic cannot start until previous epic is 80% complete |

### 5. Story Lifecycle States

```
NOT_STARTED
    ↓
CONTEXT_CREATED (requires: story.md + story-context.xml)
    ↓
IN_PROGRESS (requires: code changes started)
    ↓
CODE_REVIEW (requires: changes committed, review requested)
    ↓
TESTING (requires: code-review passed)
    ↓
DONE (requires: tsc + vitest pass, PR merged)
```

---

## Archived Today (2026-01-09)

- `diagnostic-remediation-sprint-2026-01-09.yaml` → Merged into sprint-status.yaml

---

## Validation Commands

```bash
# Check sprint file count (must be ≤4)
ls _bmad-output/sprint-artifacts/*.yaml | wc -l

# Check for stale sprints (>7 days old)
find _bmad-output/sprint-artifacts -name "*.yaml" -mtime +7

# Verify story index exists
cat _bmad-output/sprint-artifacts/stories/STORY-INDEX.md | head -20
```

---

## Epic Completion Gates

Before marking an epic DONE:

- [ ] 100% stories in DONE state
- [ ] E2E test suite exists (`tests/e2e/{epic}/`)
- [ ] E2E tests pass 100%
- [ ] Human approval: `APPROVED: EPIC-{ID}`
- [ ] Retrospective completed
