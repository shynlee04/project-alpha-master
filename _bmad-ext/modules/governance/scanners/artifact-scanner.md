---
name: "artifact-scanner"
type: "governance-scanner"
purpose: "Scan documents and artifacts with staleness detection"
version: "1.0.0"
---

# Artifact Scanner

**Purpose**: Scan all governance documents and artifacts to detect staleness, inconsistencies, and orphaned files.

## Scan Scope

- **Locations**:
  - `_bmad-output/` - All output artifacts
  - `_bmad-ext/` - Extension layer artifacts
  - `_bmad/modules/` - Module artifacts (if any)

- **File Types**:
  - `.md` - Markdown documents
  - `.yaml` - Configuration files
  - `.xml` - Workflow definitions

## Scan Process

### 1. Discover Artifacts

```
For each directory in scope:
  Find all .md, .yaml, .xml files
  Record: path, size, modified date, frontmatter (if present)
```

### 2. Staleness Detection

Check each artifact for staleness:

```yaml
staleness_criteria:
  - type: "date_check"
    threshold: "48 hours"
    rule: "Frontmatter date > 48 hours ago"

  - type: "orphaned"
    rule: "No references in other files"

  - type: "duplicate"
    rule: "Similar filename and content"

  - type: "inconsistent"
    rule: "Frontmatter data doesn't match reality"
```

### 3. Artifact Categories

```yaml
categories:
  planning:
    - product-brief-*.md
    - module-plan-*.md
    - architecture-*.md

  execution:
    - story-*.md
    - epic-*.md
    - sprint-status-*.yaml

  governance:
    - governance-report-*.md
    - analysis-*.md
    - research-*.md

  reference:
    - CLAUDE.md
    - AGENTS.md
    - README.md
```

### 4. Output Format

```yaml
artifact_scan_results:
  scan_date: "{date}"
  artifacts_found: [count]

  by_category:
    planning: {count}
    execution: {count}
    governance: {count}
    reference: {count}

  stale_artifacts:
    - file: "{path}"
      reason: "{date_check|orphaned|duplicate}"
      last_modified: "{date}"
      recommendation: "{archive|update|keep}"

  issues_found:
    - type: "{issue type}"
      files_affected: [count]
      severity: "{level}"
```

## Integration

**Used By**: context-first workflow (Step 2)

**Output**: Artifact scan results included in context package

**Follow-up**: Creates recommendations for archival or updates
