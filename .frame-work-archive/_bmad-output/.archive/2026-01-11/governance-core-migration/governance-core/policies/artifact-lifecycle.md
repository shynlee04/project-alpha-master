# Artifact Lifecycle Policy

**Version:** 1.0.0
**Last Updated:** 2026-01-10

---

## description

Defines the lifecycle of governance artifacts, their freshness requirements, and validation processes.

---

## Artifact Categories

### Tier 1: Critical Artifacts (24-hour freshness)

These artifacts directly guide development and must be current.

| Artifact | Location | Owner | Validation |
|----------|----------|-------|------------|
| CLAUDE.md | `/` | Tech Lead | Codebase comparison |
| AGENTS.md | `/` | Tech Lead | Agent registry comparison |
| bmm-workflow-status.yaml | `_bmad/state/` | PM | Sprint alignment check |
| sprint-status.yaml | `_bmad/state/` | PM | Epic alignment check |

**Validation:**
- File modification time < 24 hours ago
- Content matches actual codebase structure
- No orphaned references

**Stale Action:** Block work with warning

### Tier 2: High Priority Artifacts (48-hour freshness)

These artifacts define architecture and direction.

| Artifact | Location | Owner | Validation |
|----------|----------|-------|------------|
| architecture.md | `_bmad-output/` | Architect | Folder structure check |
| ux-specification.md | `_bmad-output/` | UX Lead | Component usage check |
| epic-tracking.md | `_bmad-output/` | PM | Story completion check |

**Validation:**
- File modification time < 48 hours ago
- Key sections present and populated
- Cross-references resolve

**Stale Action:** Warn, recommend update

### Tier 3: Medium Priority Artifacts (72-hour freshness)

These artifacts track state and progress.

| Artifact | Location | Owner | Validation |
|----------|----------|-------|------------|
| workflow-status.yaml | `_bmad/state/` | Orchestrator | Consistency check |
| LOOP_STATE.yaml | `_bmad-ext/state/` | Orchestrator | Anti-hallucination check |

**Validation:**
- File modification time < 72 hours ago
- YAML syntax valid
- Required fields present

**Stale Action:** Log only

### Tier 4: Reference Artifacts (1-week freshness)

Historical and reference documentation.

| Artifact Type | Location | Owner |
|--------------|----------|-------|
| Completion reports | `_bmad-output/` | Various |
| Historical analyses | `_bmad-output/.archive/` | Various |
| Research outputs | `_bmad-output/research/` | Various |

**Stale Action:** None

---

## Artifact Validation Process

### 1. Freshness Check

```yaml
check:
  artifact: "CLAUDE.md"
  last_modified: "2026-01-10T10:00:00Z"
  current_time: "2026-01-10T14:00:00Z"
  age_hours: 4
  threshold_hours: 24
  status: "fresh"
```

### 2. Content Validation

```yaml
check:
  artifact: "CLAUDE.md"
  validation_type: "codebase_comparison"
  checks:
    - "imports listed exist in codebase"
    - "exports listed exist in codebase"
    - "folder structure matches actual"
    - "patterns referenced are current"
  result: "pass"
```

### 3. Cross-Reference Validation

```yaml
check:
  artifact: "AGENTS.md"
  validation_type: "cross_reference"
  checks:
    - "agent_registry references resolve"
    - "workflow references exist"
    - "artifact references resolve"
  result: "pass"
```

---

## Artifact Creation Process

### When Creating Artifacts

1. **Define Category**: Tier 1-4 based on description
2. **Set Owner**: Person or role responsible
3. **Set Validation**: How to verify freshness
4. **Register**: Add to ARTIFACT_REGISTRY.yaml

### Template

```yaml
id: "artifact-id"
name: "Artifact Name"
category: "tier_1" | "tier_2" | "tier_3" | "tier_4"
location: "path/to/artifact"
owner: "role_or_person"
freshness_threshold_hours: 24
validation_method: "codebase_comparison | cross_reference | syntax_check"
last_validated: "iso_timestamp"
last_updated: "iso_timestamp"
status: "current | stale | deprecated"
```

---

## Stale Artifact Handling

### Detection

- Auto-check on session start
- Check before any work
- Scheduled check every hour

### Actions by Tier

| Tier | Stale Action | Block Work? |
|------|--------------|-------------|
| Tier 1 | Block + require update | Yes |
| Tier 2 | Warn + recommend update | No |
| Tier 3 | Log + note in report | No |
| Tier 4 | No action | No |

### Override

Human can override with "I am aware but..." for Tier 2-4.
Tier 1 artifacts require update unless critical business reason.

---

## Artifact Deprecation

### When to Deprecate

- Artifact no longer relevant
- Functionality moved elsewhere
- Better artifact replaces it

### Deprecation Process

1. Add `deprecated: true` flag
2. Set `deprecation_date`
3. Add `replaced_by` reference
4. Archive after 30 days

### Example

```yaml
id: "old-workflow-status"
status: "deprecated"
deprecated: true
deprecation_date: "2026-01-10"
replaced_by: "bmm-workflow-status"
archive_after: "2026-02-09"
```

---

## Artifact Registry

All artifacts must be registered in `ARTIFACT_REGISTRY.yaml`:

```yaml
artifacts:
  tier_1:
    - "CLAUDE.md"
    - "AGENTS.md"
    - "bmm-workflow-status.yaml"
    - "sprint-status.yaml"
  tier_2:
    - "architecture.md"
    - "ux-specification.md"
    - "epic-tracking.md"
  tier_3:
    - "workflow-status.yaml"
    - "LOOP_STATE.yaml"
```

---

## Governance Enforcement

### Before Work

1. Check artifact freshness
2. Block if Tier 1 stale
3. Warn if Tier 2 stale
4. Log if Tier 3 stale

### During Work

1. Monitor for artifact drift
2. Detect changes that invalidate artifacts
3. Flag when artifact needs update

### After Work

1. Update affected artifacts
2. Validate artifact consistency
3. Register new artifacts if created

---

**Policy Owner:** governance-core
**Review Frequency:** Monthly
**Next Review:** 2026-02-10
