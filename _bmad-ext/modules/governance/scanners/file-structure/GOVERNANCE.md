# Governance Scanner - File Structure and Artifact Management

**Scanner Type**: Governance Enforcement  
**Purpose**: Track file/folder changes, enforce naming conventions, manage artifacts systematically  
**Triggered By**: 
- File creation
- File modification
- File deletion
- File rename
- Artifact creation
- Artifact update

---

## Purpose

**File Structure Governance** ensures that:

1. **All Changes Are Tracked**: Every file/folder change is logged
2. **Naming Conventions Are Enforced**: All files follow project standards
3. **Artifacts Are Managed**: All artifacts are registered with proper frontmatter
4. **Context Poisoning Is Prevented**: Stale artifacts are flagged and archived

**Artifact Management** ensures that:

1. **Artifacts Are Systematic**: Created with consistent structure
2. **Artifacts Are Dated**: Every artifact has creation date
3. **Artifacts Are Categorized**: Every artifact has type classification
4. **Artifacts Are Traceable**: Linked to parent artifacts and workflows

---

## 1. File Change Tracking

### Scanner: File Structure Scanner

```yaml
file_structure_scanner:
  purpose: "Track and validate all file/folder changes"
  
  triggers:
    - "file_created"
    - "file_modified"
    - "file_deleted"
    - "file_renamed"
    - "folder_created"
    - "folder_deleted"
  
  checks:
    - "File/folder follows naming convention"
    - "File/folder is in correct location"
    - "File/folder doesn't conflict with existing"
    - "File/folder doesn't violate domain boundaries"
  
  outputs:
    - change_type: "create" | "modify" | "delete" | "rename"
    - file_path: "{path}"
    - file_type: "code" | "documentation" | "artifact" | "config"
    - naming_valid: true | false
    - location_valid: true | false
    - change_logged: true
```

### File Types

```yaml
file_types:
  code:
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"]
    location: "src/"
    naming: "kebab-case"
  
  documentation:
    extensions: [".md", ".txt", ".rst"]
    location: "docs/", "_bmad-output/", "docs/"
    naming: "kebab-case"
  
  artifact:
    extensions: [".yaml", ".yml", ".json"]
    location: "_bmad-ext/", "_bmad-output/", ".claude/"
    naming: "kebab-case-YYYY-MM-DD"
  
  config:
    extensions: [".json", ".yaml", ".yml", ".toml"]
    location: "project root", ".claude/", ".vscode/"
    naming: "kebab-case"
```

### Naming Conventions

```yaml
naming_conventions:
  code_files:
    pattern: "[a-z][a-z0-9-]*\\.[a-z]+"
    example: "user-service.ts, auth-hook.tsx"
    enforce: true
  
  documentation_files:
    pattern: "[a-z][a-z0-9-]*\\.md"
    example: "architecture.md, user-guide.md"
    enforce: true
  
  artifact_files:
    pattern: "[a-z][a-z0-9-]*-[0-9]{4}-[0-9]{2}-[0-9]{2}\\.(yaml|yml|json)"
    example: "LOOP_STATE-2026-01-11.yaml"
    enforce: true
  
  folder_names:
    pattern: "[a-z][a-z0-9-]*"
    example: "user-service, auth-module"
    enforce: true
```

---

## 2. Folder/Change Tracking

### Change Log Schema

```yaml
file_change_log:
  location: "_bmad-ext/state/FILE_CHANGES.yaml"
  
  schema:
    - change_id: "UUID"
    - timestamp: "ISO8601"
    - change_type: "create" | "modify" | "delete" | "rename"
    - file_path: "{path}"
    - file_type: "code" | "documentation" | "artifact" | "config"
    - file_size: number
    - diff: "git diff or summary"
    - author: "user or agent"
    - workflow: "workflow that triggered change"
    - story_id: "if applicable"
    - reason: "why change was made"
```

### Change Tracking Workflow

```yaml
track_change:
  trigger: "file_operation"
  
  steps:
    1. "Capture file state before change"
    2. "Execute file operation"
    3. "Capture file state after change"
    4. "Generate diff"
    5. "Validate naming convention"
    6. "Validate location"
    7. "Log change in FILE_CHANGES.yaml"
    8. "If artifact: register in ARTIFACT_REGISTRY"
    9. "If code: update architecture diagram if needed"
```

### Domain Boundary Enforcement

```yaml
domain_boundaries:
  presentation:
    path: "src/presentation/"
    allowed_subfolders:
      - "components/"
      - "hooks/"
      - "pages/"
      - "layouts/"
    prohibited:
      - "No domain logic here"
      - "No persistence here"
  
  domain:
    path: "src/domain/"
    allowed_subfolders:
      - "entities/"
      - "value-objects/"
      - "services/"
      - "events/"
      - "types/"
    prohibited:
      - "No presentation logic here"
      - "No infrastructure here"
  
  infrastructure:
    path: "src/infrastructure/"
    allowed_subfolders:
      - "persistence/"
      - "api/"
      - "auth/"
      - "sync/"
    prohibited:
      - "No business logic here"
      - "No presentation here"
```

---

## 3. Artifact Management

### Artifact Registration

```yaml
artifact_registration:
  trigger: "artifact_created" | "artifact_updated"
  
  required_fields:
    - id: "UUID"
    - name: "descriptive name"
    - type: "documentation | artifact | handoff | continuation | retrospective"
    - created: "ISO8601 date"
    - updated: "ISO8601 date"
    - creator: "user or agent"
    - workflow: "workflow that created it"
    - parent_artifact: "UUID or null"
    - description: "brief description"
    - tags: [list]
  
  optional_fields:
    - story_id: "if applicable"
    - epic_id: "if applicable"
    - expires: "TTL date"
    - status: "active | archived | stale"
```

### Artifact Frontmatter Template

```yaml
frontmatter_template: |
  ---
  id: "{uuid}"
  name: "{artifact-name}"
  type: "{documentation|artifact|handoff|continuation|retrospective}"
  created: "{YYYY-MM-DD}"
  updated: "{YYYY-MM-DD}"
  creator: "{user|agent}"
  workflow: "{workflow-name}"
  parent_artifact: "{uuid|null}"
  description: "{brief description}"
  tags: [{tag1}, {tag2}]
  status: "active"
  ---
```

### Artifact Types

```yaml
artifact_types:
  documentation:
    description: "Project documentation"
    examples:
      - "architecture.md"
      - "prd.md"
      - "ux-specification.md"
    ttl: "90 days"
    frontmatter: required
  
  artifact:
    description: "Governance artifacts"
    examples:
      - "LOOP_STATE.yaml"
      - "ARTIFACT_REGISTRY.yaml"
      - "DELEGATION_LOG.yaml"
    ttl: "permanent"
    frontmatter: required
  
  handoff:
    description: "Agent-to-agent handoffs"
    examples:
      - "handoff-{uuid}.yaml"
      - "context-handoff-{uuid}.yaml"
    ttl: "7 days"
    frontmatter: required
  
  continuation:
    description: "Session continuation capsules"
    examples:
      - "continuation-{uuid}.yaml"
    ttl: "24 hours"
    frontmatter: required
  
  retrospective:
    description: "Sprint/story retrospectives"
    examples:
      - "retro-{sprint-name}-{YYYY-MM-DD}.md"
    ttl: "permanent"
    frontmatter: required
```

---

## 4. Context Poisoning Prevention

### Stale Artifact Detection

```yaml
stale_artifact_detection:
  trigger: "session_start" | "manual_check" | "artifact_access"
  
  checks:
    - "Artifact timestamp vs current time"
    - "Artifact TTL vs current time"
    - "Artifact status vs actual state"
    - "Artifact vs actual code comparison"
  
  ttl_rules:
    - type: "documentation"
      ttl: "90 days"
      action: "flag as stale"
    
    - type: "artifact"
      ttl: "permanent"
      action: "never stale"
    
    - type: "handoff"
      ttl: "7 days"
      action: "flag as stale"
    
    - type: "continuation"
      ttl: "24 hours"
      action: "flag as stale"
```

### Context Poisoning Indicators

```yaml
context_poisoning_indicators:
  - "Artifact referenced but not in current context"
  - "Artifact timestamp > 6 cycles old"
  - "Artifact says 'As I said before...' (conversation continuity)"
  - "Artifact content doesn't match current code state"
  - "Artifact has been superseded but not archived"
```

### Context Poisoning Response

```yaml
context_poisoning_response:
  trigger: "context_poisoning_detected"
  
  severity_levels:
    - level: "low"
      indicators: ["old artifact referenced"]
      action: "warn user, offer to reload"
    
    - level: "medium"
      indicators: ["content mismatch", "superseded not archived"]
      action: "flag artifact, suggest archival"
    
    - level: "high"
      indicators: ["conversation continuity issue", "major content mismatch"]
      action: "block usage, require reload"
```

---

## 5. File Change Workflow Integration

### With Implementation Workflow

```yaml
implementation_integration:
  trigger: "story_implementation"
  
  actions:
    1. "Track all file changes during implementation"
    2. "Validate naming conventions"
    3. "Validate domain boundaries"
    4. "Register artifacts created"
    5. "Update FILE_CHANGES.yaml"
    6. "At story done: compare vs story requirements"
```

### With Governance Workflow

```yaml
governance_integration:
  trigger: "governance_cycle"
  
  actions:
    1. "Scan FILE_CHANGES.yaml"
    2. "Identify recent changes"
    3. "Check for naming violations"
    4. "Check for boundary violations"
    5. "Flag issues for review"
```

### With Correct-Course Workflow

```yaml
correct_course_integration:
  trigger: "bug_fix"
  
  actions:
    1. "Track files modified during fix"
    2. "Log change reason"
    3. "Validate fix doesn't violate boundaries"
    4. "Register fix-related artifacts"
    5. "Compare before/after with comparison engine"
```

---

## 6. Naming Convention Enforcement

### Enforcement Levels

```yaml
enforcement_levels:
  strict:
    pattern: "Required pattern"
    action: "block if not matching"
    files: ["code", "config"]
  
  advisory:
    pattern: "Recommended pattern"
    action: "warn if not matching"
    files: ["documentation"]
  
  flexible:
    pattern: "No pattern required"
    action: "no enforcement"
    files: ["user files", "temporary files"]
```

### Auto-fix Rules

```yaml
auto_fix_rules:
  - pattern: "Missing frontmatter"
    action: "auto-add and warn"
    files: ["artifacts", "documentation"]
  
  - pattern: "Missing date in artifact"
    action: "auto-add and warn"
    files: ["artifacts"]
  
  - pattern: "Wrong naming (easy fix)"
    action: "suggest rename, don't auto-fix"
    files: ["all"]
  
  - pattern: "Wrong naming (hard fix)"
    action: "log warning, continue"
    files: ["all"]
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `file_changes_logged` | All file changes tracked | 100% |
| `naming_violations` | Naming convention violations | < 5% |
| `boundary_violations` | Domain boundary violations | 0 |
| `artifacts_registered` | Artifacts with frontmatter | 100% |
| `stale_artifacts` | Stale artifacts detected | < 10% |
| `context_poisoning` | Context poisoning incidents | 0 |
| `auto_fixes` | Auto-fixed frontmatter issues | N/A |

---

## Error Handling

### Naming Violation

```yaml
error: "naming_violation"
severity: "P2"
actions:
  1. "Log violation"
  2. "Suggest correct name"
  3. "Ask: 'Rename or continue with warning?'"
  4. "If rename: rename file"
  5. "If continue: log warning and proceed"
```

### Boundary Violation

```yaml
error: "boundary_violation"
severity: "P1"
actions:
  1. "Block operation"
  2. "Explain boundary violation"
  3. "Suggest correct location"
  4. "Ask: 'Move to correct location or continue with warning?'"
  5. "If move: move file"
  6. "If continue: log warning, escalate to governance"
```

### Missing Frontmatter

```yaml
error: "missing_frontmatter"
severity: "P3"
actions:
  1. "Auto-add frontmatter template"
  2. "Warn user about missing frontmatter"
  3. "Suggest updating frontmatter"
  4. "Continue with operation"
```

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `context-first.md` - Context gathering workflow
- `artifact-registration.md` - Artifact registration workflow
- `stale-detection.md` - Stale artifact detection
- `comparison-engine.md` - Compare artifacts to code
- `naming-convention-policy.md` - Naming rules
- `file-structure-policy.md` - File structure rules
