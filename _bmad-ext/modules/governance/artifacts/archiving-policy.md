---
name: "archiving-policy"
type: "governance-policy"
description: "Define artifact archival procedures to maintain clean workspace"
version: "1.0.0"
---

# Archiving Policy

**description**: Define when and how to archive artifacts to maintain a clean, working workspace.

## When to Archive

### Automatic Archival Triggers

```yaml
auto_archive_triggers:
  date_based:
    - condition: "updated_at >= 30 days ago"
      action: "move to archive"

    - condition: "updated_at >= 7 days ago AND status = complete"
      action: "consider archive"

  status_based:
    - condition: "status = deprecated"
      action: "archive immediately"

    - condition: "status = superseded"
      action: "archive and reference replacement"

  replacement_based:
    - condition: "newer version exists"
      action: "archive old version"
```

### Manual Archival Criteria

```yaml
manual_archive:
  planning_artifacts:
    - "Epic or story completed"
    - "Decision implemented and verified"
    - "Research findings integrated"

  execution_artifacts:
    - "Story completed and accepted"
    - "Sprint ended and retrospective done"
    - "Report findings addressed"

  governance_artifacts:
    - "Workflow replaced with new version"
    - "Policy superseded by update"
    - "Scanner merged or removed"
```

## Archive Structure

```yaml
archive_structure:
  root: "_bmad-output/.archive/"

  by_date:
    pattern: "{YYYY-MM-DD}/"
    contains: "All artifacts archived on that date"

  by_category:
    pattern: "{category}/{YYYY-MM-DD}/"
    categories: [planning, execution, governance, reference]

  by_type:
    pattern: "{type}/{YYYY-MM-DD}/"
    types: [workflows, scanners, reports, contexts]

  legacy_archives:
    pattern: "legacy/{date}/"
    description: "Old module structures before refactoring"
```

## Archive Process

```yaml
archive_process:
  step_1_evaluate:
    - check_artifact_age
    - verify_artifact_status
    - confirm_not_referenced

  step_2_prepare:
    - create_archive_directory
    - generate_archive_summary
    - update_registry_status

  step_3_archive:
    - move_artifact_to_archive
    - add_archive_metadata
    - create_index_entry

  step_4_update:
    - remove_from_active_registry
    - update_references
    - notify_dependent_artifacts
```

## Archive Metadata

```yaml
archive_metadata:
  frontmatter_addition:
    archived_at: "{timestamp}"
    archived_by: "{agent or workflow}"
    archive_reason: "{why archived}"
    replacement: "{path to replacement if applicable}"

  example:
    ---
    title: "Original Title"
    archived_at: "2026-01-11"
    archived_by: "artifact-scanner"
    archive_reason: "Superseded by v2.0"
    replacement: "_bmad-ext/modules/governance/workflows/context-first/"
    ---
```

## Archive Index

```yaml
archive_index:
  location: "_bmad-output/.archive/index.yaml"

  structure:
    archives:
      - date: "{YYYY-MM-DD}"
        artifacts: [list]
        count: {number}

      - date: "{YYYY-MM-DD}"
        category: "{type}"
        artifacts: [list]
        count: {number}

    search:
      by_name: "Find archived artifact by name"
      by_date: "Find all artifacts archived on date"
      by_category: "Find all archived artifacts of type"
```

## Retrieval

```yaml
retrieval_process:
  request:
    - artifact_name: "{name}"
      archive_date: "{date or approximate}"

  locate:
    - search_archive_index
    - identify_archive_location
    - verify_artifact_exists

  restore:
    - copy_from_archive (keep archived version)
    - update_registry_status
    - mark_as_restored
```

## Retention Policy

```yaml
retention:
  short_term: "90 days"
    - "Full artifact preserved"
    - "Quick retrieval possible"

  medium_term: "1 year"
    - "Artifact preserved"
    - "Indexed for search"

  long_term: "3+ years"
    - "Compress to historical record"
    - "Keep summary and decisions only"

  purging:
    - "After 3 years, compress to decision log"
    - "Keep only key decisions and outcomes"
    - "Delete full artifact content"
```

## Special Cases

```yaml
special_cases:
  never_archive:
    - "CLAUDE.md (always current)"
    - "AGENTS.md (always current)"
    - "workflow-status.yaml (always active)"
    - "sprint-status.yaml (always active)"
    - "MODULE.md files (module manifests)"

  archive_immediately:
    - "Temporary analysis files"
    - "Draft versions after approval"
    - "Superseded workflow files"

  archive_with_review:
    - "Planning artifacts with active references"
    - "Governance policies being replaced"
    - "Scanner definitions being merged"
```

## Integration

**Executed By**: artifact-scanner (staleness detection)

**Triggered By**: governance-report workflow

**Location**: `_bmad-output/.archive/`

## Safety Checks

```yaml
safety_checks:
  before_archive:
    - verify_no_active_references
    - confirm_replacement_exists (if superseded)
    - check_workflow_not_in_progress

  rollback:
    - "If archived in error, can restore"
    - "Archive remains for retention period"
    - "Index tracks all archived artifacts"
```

---

`★ Insight ─────────────────────────────────────`
1. Archival prevents workspace bloat
2. Date-based archival automates cleanup
3. Archive index enables retrieval when needed
`─────────────────────────────────────────────────`
