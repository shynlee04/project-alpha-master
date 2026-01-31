---
name: "date-stamping-policy"
type: "governance-policy"
description: "Define date stamping requirements for artifact freshness"
version: "1.0.0"
---

# Date Stamping Policy

**description**: Ensure all artifacts have accurate, parseable date stamps for staleness detection and archival.

## Date Format

```yaml
format: "YYYY-MM-DD"
examples:
  - "2026-01-11"
  - "2025-12-25"

iso_8601_extended: "YYYY-MM-DDTHH:MM:SS+TZ:TZ"
example: "2026-01-11T14:30:00+07:00"
```

## Required Date Stamps

### Frontmatter Dates

All markdown artifacts MUST include dates in frontmatter:

```yaml
---
title: "{artifact_title}"
date: "2026-01-11"
created_at: "2026-01-11T10:00:00+07:00"
updated_at: "2026-01-11T14:30:00+07:00"
---
```

### YAML File Dates

YAML artifacts must include date fields:

```yaml
artifact:
  created: "2026-01-11"
  updated: "2026-01-11"
  last_reviewed: "2026-01-11"
```

## Staleness Thresholds

```yaml
staleness:
  planning_artifacts:
    threshold: "7 days"
    rationale: "Plans become outdated quickly"

  execution_artifacts:
    threshold: "48 hours"
    rationale: "Rapid development requires fresh context"

  governance_artifacts:
    threshold: "30 days"
    rationale: "Policies and workflows change slowly"

  reference_artifacts:
    threshold: "90 days"
    rationale: "Standards and templates are relatively stable"
```

## Date Update Triggers

```yaml
update_triggers:
  content_changes:
    - "Any modification to artifact body"
    - "New sections added"
    - "Decisions or approaches changed"

  status_changes:
    - "Status changes (wip → review → complete)"
    - "Approval or rejection"
    - "Archival or deprecation"

  dependency_changes:
    - "Referenced artifacts updated"
    - "Related decisions changed"
    - "Parent workflow progressed"
```

## Automated Date Updates

```yaml
automation:
  on_save:
    - check_updated_at_field
    - set_to_current_timestamp

  on_workflow_transition:
    - update_workflow_completion_date
    - set_next_review_date

  on_status_change:
    - update_status_change_date
    - calculate_next_check_date
```

## Date Parsing and Validation

```yaml
validation:
  required_fields:
    - "date or created_at"
    - "updated_at (if different from created)"

  parse_rules:
    - "Must be valid ISO 8601 format"
    - "Must not be in future (except planned dates)"
    - "Must be consistent with file timestamps"

  error_handling:
    - "If missing: use file modification time"
    - "If invalid: flag for manual review"
    - "If inconsistent: log warning"
```

## Date Display

```yaml
display:
  short: "YYYY-MM-DD"
  long: "Month DD, YYYY"
  relative: "{time_ago} (e.g., '2 days ago')"

  examples:
    short: "2026-01-11"
    long: "January 11, 2026"
    relative: "today"
```

## Review Dates

```yaml
review_schedule:
  calculation: "created_at + freshness_threshold"

  reminders:
    - "48 hours before review date"
    - "at review date"
    - "7 days past review date"

  actions:
    on_review_due:
      - "mark as stale in registry"
      - "notify responsible agent"
      - "create review task"

    on_overdue:
      - "escalate to human"
      - "consider auto-archive"
```

## Archival Dates

```yaml
archival:
  date_format: "{YYYY-MM-DD} (in archive path)"

  archive_structure:
    - ".archive/{YYYY-MM-DD}/{artifact-name}"
    - ".archive/{category}/{YYYY-MM-DD}/{artifact-name}"

  date_preservation:
    - "keep original created_at"
    - "add archived_at timestamp"
    - "record archive_reason"
```

## Integration

**Applied By**: All artifact creation workflows

**Validated By**: artifact-scanner

**Monitored By**: governance-report workflow

## Quick Reference

```yaml
quick_reference:
  always_include: "date: YYYY-MM-DD"
  on_update: "update updated_at field"
  format: "ISO 8601 (YYYY-MM-DD)"
  staleness: "artifact specific (48h - 90 days)"
```

---

`★ Insight ─────────────────────────────────────`
1. Date stamps are the foundation of staleness detection
2. Consistent format enables automated parsing
3. Multiple date fields track artifact lifecycle
`─────────────────────────────────────────────────`
