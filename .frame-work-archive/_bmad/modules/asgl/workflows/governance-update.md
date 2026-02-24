---
description: Governance Update - Maintains AGENTS.md, CLAUDE.md, and child governance docs
version: 1.0.0
triggers:
  - story_complete_modulo_3
  - story_complete_modulo_5
  - layer_change
  - adr_created
  - manual
---

# Governance Update Workflow

**Module**: `asgl`  
**Workflow ID**: `governance-update`  
**description**: Keep governance documents up-to-date with project state

---

## Trigger Conditions

| Trigger | Document | Sections to Update |
|---------|----------|-------------------|
| Every 3 stories | AGENTS.md | Epic progress, health scores |
| Every 5 stories | CLAUDE.md | File structure, statistics |
| Layer change (>5 files) | Child AGENTS.md | Layer-specific patterns |
| ADR created | AGENTS.md | ADR reference table |
| Epic complete | AGENTS.md | Epic status, milestone |
| Manual | Any | Specified sections |

---

## Workflow Steps

### Step 1: Determine Update Scope

```yaml
action: "determine-scope"
inputs:
  - trigger_type
  - stories_completed
  - files_changed
  - layers_affected
  
outputs:
  - documents_to_update: [list]
  - sections_to_update: [per document]
```

### Step 2: AGENTS.md Update

```yaml
action: "update-agents-md"
condition: "stories_completed % 3 == 0 OR adr_created OR epic_complete"

sections:
  - name: "Epic Progress Tables"
    location: "## Project Overview → Epic tables"
    update_with:
      - "Current story status"
      - "Stories completed count"
      - "Estimated hours remaining"
      
  - name: "Canonical Locations"
    location: "## ADR-024 → Canonical Locations"
    update_with:
      - "Any new canonical paths"
      - "Deprecated path updates"
      
  - name: "Health Scores"
    location: "## Cornerstone Health Scores"
    update_with:
      - "Updated health percentages"
      - "Status indicators"
      
  - name: "ADR References"
    location: "## Definitive Architecture Reference"
    update_with:
      - "New ADR entries"
      - "Updated ADR statuses"
      
  - name: "Module Status"
    location: "## deep-scan / architecture-remediation"
    update_with:
      - "Module health"
      - "Active workflows"

validation:
  - "AGENTS.md size < 4000 lines"
  - "All links valid"
  - "No duplicate sections"
```

### Step 3: CLAUDE.md Update

```yaml
action: "update-claude-md"
condition: "stories_completed % 5 == 0 OR major_refactor"

sections:
  - name: "Epic Progress"
    location: "## ADR-024 → Epic 53 Progress"
    update_with:
      - "Story status updates"
      
  - name: "Key Directories"
    location: "## Key Directories & Files"
    update_with:
      - "New directories"
      - "File count updates"
      
  - name: "Codebase Statistics"
    location: "## Codebase Statistics"
    update_with:
      - "Total files count"
      - "Component counts"
      - "God store counts (if changed)"
      
  - name: "Technical Debt"
    location: "## Critical Technical Debt"
    update_with:
      - "Updated percentages"
      - "Completed items marked"

validation:
  - "CLAUDE.md size < 2500 lines"
  - "Commands are current"
```

### Step 4: Child AGENTS.md Update/Creation

```yaml
action: "update-child-agents-md"
condition: "layer_files_changed > 5"

targets:
  - path: "src/infrastructure/AGENTS.md"
    trigger: "infrastructure layer changes"
    
  - path: "src/presentation/AGENTS.md"
    trigger: "presentation layer changes"
    
  - path: "src/lib/AGENTS.md"
    trigger: "lib layer changes"
    
  - path: "_bmad-output/AGENTS.md"
    trigger: "artifact structure changes"

create_if_missing:
  template: "config/governance.yaml → child_agents_md.template"
  contents:
    - "Layer description"
    - "Key directories"
    - "File conventions"
    - "Import rules"
    - "Dependencies/Dependents"
    
update_if_exists:
  - "Add new file patterns"
  - "Update conventions"
  - "Refresh dependency graph"
```

### Step 5: Cross-Reference Validation

```yaml
action: "validate-cross-refs"
checks:
  - "All document links resolve"
  - "All file paths exist"
  - "No broken ADR references"
  - "No stale epic references"
  
on_broken_ref:
  - "Log warning"
  - "Attempt auto-fix (update path)"
  - "Mark for manual review if unfixable"
```

### Step 6: Commit Governance Update

```yaml
action: "commit-update"
tasks:
  - "Update document headers with new timestamp"
  - "Add session ID to update log"
  - "Register update in artifact-registry"
  
output:
  - "governance_update_complete = true"
  - "documents_updated = [list]"
```

---

## AGENTS.md Update Template

```markdown
## Section Update: {section_name}

**Updated**: {timestamp}
**Session**: {session_id}
**Trigger**: {trigger_type}

### Changes Made
- {change_1}
- {change_2}

### Affected Areas
- {area_1}
- {area_2}
```

---

## Child AGENTS.md Creation Template

```markdown
# {Directory} Layer Patterns

> **Parent**: See `/AGENTS.md` for project-wide patterns.
> **Scope**: This file covers patterns specific to `{path}`.
> **Last Updated**: {date}
> **Session**: {session_id}

## Layer description

{description_description}

## Key Directories

| Directory | description | File Count |
|-----------|---------|------------|
{directory_table}

## File Conventions

| Pattern | Max Lines | Example |
|---------|-----------|---------|
{file_conventions}

## Import Rules

```typescript
// ✅ CORRECT imports for this layer
{correct_imports}

// ❌ AVOID these patterns
{avoid_imports}
```

## Dependencies

This layer depends on:
- `{dep_1}` - {description}
- `{dep_2}` - {description}

## Dependents

The following depend on this layer:
- `{client_1}` - {how}
- `{client_2}` - {how}

---
**Generated by**: ASGL Governance Workflow
**Parent Doc**: /AGENTS.md
```

---

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| AGENTS.md < 4000 lines | WARN if exceeded |
| CLAUDE.md < 2500 lines | WARN if exceeded |
| All links must resolve | BLOCK on broken |
| No duplicate sections | WARN and dedupe |
| Timestamps must be current | Auto-fix |

---

**Workflow Owner**: @bmad-core-bmad-master  
**Version**: 1.0.0  
**Last Updated**: 2026-01-05
