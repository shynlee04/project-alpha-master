---
name: "artifact-lifecycle"
type: "governance-policy"
purpose: "Define artifact lifecycle from creation to archival"
version: "1.0.0"
---

# Artifact Lifecycle Policy

**Purpose**: Define the complete lifecycle of governance artifacts from creation to archival.

## Lifecycle Stages

```yaml
stages:
  creation:
    triggers:
      - "Workflow started"
      - "Document generated"
      - "Report created"

    actions:
      - "Generate UUID"
      - "Apply naming convention"
      - "Add date stamps"
      - "Register in registry.yaml"
      - "Set review date"

    output:
      - "New artifact file"
      - "Registry entry"
      - "Initial quality check"

  active:
    condition: "created within freshness threshold"

    maintenance:
      - "Update timestamp on changes"
      - "Refresh review date when accessed"
      - "Check for staleness regularly"

    transitions:
      - to_stale: "when updated_at >= threshold"
      - to_deprecated: "when superseded by new version"

  stale:
    condition: "updated_at >= freshness threshold"

    actions:
      - "Flag in registry"
      - "Consider archival"
      - "Notify if still needed"

    transitions:
      - to_active: "when updated with new content"
      - to_archived: "when confirmed no longer needed"

  archived:
    triggers:
      - "Manual archive request"
      - "Automatic archival (30+ days old)"
      - "Status = complete/superseded"

    actions:
      - "Move to .archive/{date}/"
      - "Add archive metadata"
      - "Update registry status"
      - "Create index entry"

    retention:
      short_term: "90 days (full content)"
      medium_term: "1 year (indexed)"
      long_term: "3+ years (summary only)"

  deprecated:
    triggers:
      - "Superseded by new version"
      - "Approach replaced"
      - "No longer applicable"

    actions:
      - "Mark as deprecated in frontmatter"
      - "Reference replacement"
      - "Archive after grace period"
```

## State Transitions

```yaml
state_diagram:
  creation → active:
    condition: "artifact created"
    automatic: true

  active → stale:
    condition: "age >= threshold"
    automatic: true

  stale → active:
    condition: "content updated"
    automatic: true

  active → archived:
    condition: "manual or automatic (30 days)"
    automatic: false  # requires confirmation

  active → deprecated:
    condition: "superseded"
    automatic: false

  deprecated → archived:
    condition: "grace period expired"
    automatic: true
```

## Lifecycle Events

```yaml
events:
  on_create:
    - validate_naming_convention
    - generate_uuid
    - set_created_at_timestamp
    - calculate_review_date
    - register_in_registry

  on_update:
    - update_timestamp
    - check_staleness
    - update_hash
    - refresh_review_date

  on_access:
    - verify_exists
    - check_status
    - record_access
    - consider_refresh_if_needed

  on_archive:
    - verify_safe_to_archive
    - create_archive_directory
    - add_archive_metadata
    - move_file
    - update_registry
    - create_index_entry

  on_deprecate:
    - mark_deprecated
    - reference_replacement
    - schedule_archive
```

## Responsibility Matrix

```yaml
responsibilities:
  creator:
    - "Follow naming convention"
    - "Include proper frontmatter"
    - "Register in registry"

  maintainer:
    - "Update timestamps"
    - "Refresh content when stale"
    - "Deprecate when superseded"

  archive_scanner:
    - "Detect stale artifacts"
    - "Suggest archival"
    - "Execute archival"
    - "Maintain index"

  workflow:
    - "Check artifact freshness before use"
    - "Update artifacts after changes"
    - "Archive completed workflow artifacts"
```

## Quality Gates

```yaml
lifecycle_gates:
  creation_gate:
    - naming_convention_valid: true
    - frontmatter_complete: true
    - registered: true

  update_gate:
    - timestamp_updated: true
    - registry_updated: true
    - no_conflicts: true

  archival_gate:
    - not_referenced_by_active: true
    - replacement_exists: if deprecated
    - archive_destination_ready: true
```

## Automation Rules

```yaml
automation:
  auto_register:
    trigger: "artifact created in monitored directory"
    action: "add to registry.yaml"

  auto_flag_stale:
    trigger: "artifact age >= threshold"
    action: "set status = stale"

  auto_archive:
    trigger: "artifact age >= 30 days AND status = complete"
    action: "move to archive"

  auto_cleanup:
    trigger: "archive age >= 3 years"
    action: "compress to summary"
```

## Integration

**Implemented By**: artifact-scanner, file-monitor

**Affects**: All artifact creation workflows

**Location**: `_bmad-ext/modules/governance/policies/artifact-lifecycle.md`

---

`★ Insight ─────────────────────────────────────`
1. Clear lifecycle stages prevent artifact ambiguity
2. Automated transitions reduce manual overhead
3. Responsibility matrix ensures accountability
`─────────────────────────────────────────────────`
