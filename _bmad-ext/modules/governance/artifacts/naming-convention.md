---
name: "naming-convention"
type: "governance-policy"
description: "Enforce consistent artifact naming conventions"
version: "1.0.0"
---

# Naming Convention Policy

**description**: Enforce consistent naming across all governance artifacts to prevent confusion and enable reliable automation.

## General Principles

1. **Date-stamping required** for all dated artifacts: `YYYY-MM-DD` format
2. **Lowercase with hyphens** for file names
3. **Descriptive prefixes** for quick identification
4. **Version suffixes** when applicable: `-v{major}.{minor}`
5. **Status indicators** for work-in-progress: `-wip`, `-draft`

## Artifact Type Patterns

### Planning Artifacts

```yaml
product_brief:
  pattern: "product-brief-{YYYY-MM-DD}.md"
  example: "product-brief-2026-01-11.md"

module_plan:
  pattern: "module-plan-{module-name}-{YYYY-MM-DD}.md"
  example: "module-plan-governance-2026-01-11.md"

architecture:
  pattern: "architecture-{topic}-{YYYY-MM-DD}.md"
  example: "architecture-file-system-2026-01-11.md"

research_notes:
  pattern: "research-{topic}-{YYYY-MM-DD}.md"
  example: "research-rag-indexing-2026-01-11.md"
```

### Execution Artifacts

```yaml
story_context:
  pattern: "{story-key}-context.{ext}"
  example: "FS-05-context.xml"

epic_status:
  pattern: "epic-{epic-key}-status-{YYYY-MM-DD}.yaml"
  example: "epic-FS-status-2026-01-11.yaml"

governance_report:
  pattern: "governance-report-{YYYY-MM-DD}.md"
  example: "governance-report-2026-01-11.md"

scan_results:
  pattern: "{scanner-type}-scan-{YYYY-MM-DD}.yaml"
  example: "artifact-scan-2026-01-11.yaml"
```

### Governance Artifacts

```yaml
workflow:
  pattern: "workflow.md" (in workflow directory)
  location: "{module}/workflows/{workflow-name}/workflow.md"

step:
  pattern: "step-{n:02d}-{name}.md"
  example: "step-01-init.md"

scanner:
  pattern: "{scanner-name}-scanner.md"
  example: "domain-scanner.md"

policy:
  pattern: "{policy-name}-policy.md"
  example: "context-strategy-policy.md"
```

### Reference Artifacts

```yaml
standard:
  pattern: "{category}-{topic}.md"
  example: "backend-api.md"

template:
  pattern: "template-{name}.{ext}"
  example: "template-story.md"

checklist:
  pattern: "checklist-{description}.yaml"
  example: "checklist-story-done.yaml"
```

## Status Suffixes

```yaml
status_suffixes:
  - "-wip": "Work in progress - actively being developed"
  - "-draft": "Draft - not ready for review"
  - "-review": "Ready for review"
  - "-deprecated": "Replaced, kept for reference"
  - "-archived": "Old version, moved to archive"
```

## Version Suffixes

```yaml
versioning:
  pattern: "-v{major}.{minor}"
  example: "module-plan-governance-v2.1.md"

  major_increment: "breaking changes"
  minor_increment: "additions, non-breaking"
  patch: "fixes, typos (no version suffix)"
```

## Directory Naming

```yaml
directories:
  lowercase_with_hyphens: true

  examples:
    - "_bmad-output/"
    - "_bmad-ext/"
    - "modules/governance/"
    - "workflows/context-first/"
    - "scanners/"

  date_archives:
    pattern: ".archive/{YYYY-MM-DD}/"
    example: ".archive/2026-01-11/"
```

## Forbidden Patterns

```yaml
forbidden:
  - uppercase_file_names: "Use lowercase only"
  - spaces_in_names: "Use hyphens instead"
  - underscores: "Use hyphens for consistency"
  - no_date_stamps: "All dated artifacts must include date"
  - generic_names: "Avoid 'file1.md', 'temp.md', etc."

  examples_of_wrong_names:
    - "MyDocument.md" → "my-document.md"
    - "research notes.md" → "research-notes.md"
    - "governance-report.md" → "governance-report-2026-01-11.md"
    - "temp_file.txt" → "{descriptive-name}-{date}.txt"
```

## Enforcement

```yaml
enforcement:
  at_creation:
    - validate_pattern_match
    - reject_invalid_names
    - suggest_correct_format

  at_scan:
    - flag_non_compliant_artifacts
    - generate_rename_list
    - auto_rename_if_safe

  at_review:
    - check_naming_consistency
    - update_registry
    - archive_old_versions
```

## Quick Reference

```yaml
quick_reference:
  date_format: "YYYY-MM-DD"
  separator: "-"
  case: "lowercase"
  status: "suffix with hyphen"
  version: "-v{major}.{minor}"

  templates:
    planning: "{type}-{name}-{date}.md"
    execution: "{key}-{type}.{ext}"
    governance: "{name}.md" (in structured dirs)
    reference: "{category}-{name}.md"
```

## Integration

**Used By**: All artifact creation workflows

**Enforced By**: artifact-scanner

**Output**: Naming validation reports and rename suggestions

---

`★ Insight ─────────────────────────────────────`
1. Consistent naming enables reliable automation
2. Date stamps prevent artifact ambiguity
3. Lowercase with hyphens works across all platforms
`─────────────────────────────────────────────────`
