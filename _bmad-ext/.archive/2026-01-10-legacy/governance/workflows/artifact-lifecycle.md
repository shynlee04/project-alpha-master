# Artifact Lifecycle Workflow

**Workflow ID**: `@bmad/modules/governance/workflows/artifact-lifecycle`
**Version**: 1.0.0
**Created**: 2026-01-06
**description**: Define four-tier artifact governance with retention policies and archiving

---

## Four-Tier Governance System

### Tier 1: The Unchangeable (Standards)

**description**: Constitutional documents that define how development happens

**Location**: `agent-os/standards/global/`

**Files**:
- `coding-style.md`
- `commenting.md`
- `conventions.md`
- `error-handling.md`
- `mcp-research.md`
- `tech-stack.md`
- `validation.md`

**Access Policy**: Read-only
- Agents can READ these files
- Agents MUST NOT MODIFY these files directly
- If outdated: Notify human with reasoning why

**Retention**: Permanent

**Update Trigger**: Human decision only

```yaml
# Example: Agent detects outdated standard
agent_action:
  detect: "React 19 concurrent features not in coding-style.md"
  notify_human: |
    Standard coding-style.md is outdated.
    Missing: useTransition, useDeferredValue, useOptimistic patterns
    Please update before proceeding with React 19 development.
```

### Tier 2: Strictly Controlled (SSOT)

**description**: Single Source of Truth for project governance

**Location**: Root level and `agent-os/`

**Files**:
- `AGENTS.md` (root - main SSOT)
- `_bmad/AGENTS.md` (module-specific)
- `agent-os/product/mission.md`
- `agent-os/product/vision.md`
- `agent-os/product/roadmap.md`
- `agent-os/standards/frontend/*.md`
- `agent-os/standards/backend/*.md`

**Access Policy**: Line-based replacement ONLY
- NEVER replace entire file
- Update specific sections with frontmatter versioning
- Full document must be read before any changes

**Retention**: Permanent with version tracking

**Update Frequency** (defined in frontmatter):
- `immediate` - Update on every story completion
- `per-story` - Update after N stories
- `per-epic` - Update after epic completion
- `quarterly` - Update quarterly

```yaml
# Tier 2 Frontmatter Template
---
document_type: "governance"
document_id: "AGENTS"
last_updated: "YYYY-MM-DDTHH:mm:ssZ"
update_frequency: "per-story"  # | immediate | per-epic | quarterly
stakeholder: "team-a"
related_docs:
  - "agent-os/product/roadmap.md"
version_history:
  - {version: "1.2", date: "2026-01-06", changes: "Added Epic 22 stories"}
  - {version: "1.1", date: "2026-01-05", changes: "Updated Epic 21 status"}
---
```

### Tier 3: Medium-live Artifacts

**description**: Sprint-level artifacts with medium-term relevance

**Location**: `_bmad-output/sprint-artifacts/YYYY-MM/`

**Files**:
- Sprint status reports
- Research artifacts
- Epic breakdowns
- Course corrections

**Naming**: `{artifact-type}-{YYYY-MM-DD}.{ext}`

**Examples**:
- `sprint-status-2026-01-06.yaml`
- `course-correction-2026-01-03.md`
- `epic-22-breakdown-2026-01-05.md`

**Access Policy**:
- Agents CREATE these during execution
- Agents UPDATE existing files (line-based when possible)
- Auto-archive after 90 days

**Retention**:
- **Active**: 90 days in `_bmad-output/sprint-artifacts/YYYY-MM/`
- **Archive**: Move to `_bmad-output/sprint-artifacts/archive/` after 90 days
- **Cleanup**: Delete archives older than 1 year

```yaml
# Tier 3 Frontmatter Template
---
artifact_id: "SPRINT-{YYYYMMDD}-{seq}"
artifact_type: "sprint_status" | "research" | "epic_breakdown"
parent_id: null  # No parent for sprint-level
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"  # 90 days from creation
status: "ACTIVE" | "SUPERSEDED" | "ARCHIVED"
tags: ["sprint", "planning"]
---
```

### Tier 4: Short-live Artifacts

**description**: Story-level artifacts with immediate relevance

**Location**: `_bmad-output/handoffs/YYYY-MM-DD/`

**Files**:
- Story handoffs
- Validation reports
- Test reports
- Story completion artifacts

**Naming**: `{story-id}-{type}-{seq}.{ext}`

**Examples**:
- `ARC-STORE-001-handoff.md`
- `ARC-STORE-001-validation.md`
- `E2-MODAL-003-report.md`

**Access Policy**:
- Agents CREATE these during story execution
- Agents can UPDATE to add validation results
- Auto-archive after 5 days (user works daily)

**Retention**:
- **Active**: 5 days in `_bmad-output/handoffs/YYYY-MM-DD/`
- **Archive**: Move to `_bmad-output/handoffs/_archive/YYYY-MM/` after 5 days
- **Cleanup**: Delete archives older than 90 days

```yaml
# Tier 4 Frontmatter Template
---
artifact_id: "{prefix}-{domain}-{seq}"
artifact_type: "handoff" | "validation" | "report"
parent_id: "{epic-or-story-id}"
sequence_number: {int}
created_at: "YYYY-MM-DDTHH:mm:ssZ"
expires_at: "YYYY-MM-DDTHH:mm:ssZ"  # 24h for short-live
status: "DRAFT" | "ACTIVE" | "SUPERSEDED" | "ARCHIVED"
related_artifacts: ["prev-id", "next-id"]
tags: []
last_validated: "YYYY-MM-DDTHH:mm:ssZ"
---
```

## Archive Cycle Workflow

### Daily Archive (Auto-runs at midnight)

```bash
# _bmad/modules/governance/scripts/daily-archive.sh

#!/bin/bash
TODAY=$(date +%Y-%m-%d)
EXPIRY_TIER4=$(date -d "5 days ago" +%Y-%m-%d)
EXPIRY_TIER3=$(date -d "90 days ago" +%Y-%m-%d)

# Archive Tier 4 artifacts older than 5 days
find _bmad-output/handoffs/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER4" | while read dir; do
  month=$(basename "$dir" | cut -c1-7)
  mkdir -p "_bmad-output/handoffs/_archive/$month"
  mv "$dir"/* "_bmad-output/handoffs/_archive/$month/"
  rmdir "$dir"
done

# Archive Tier 3 artifacts older than 90 days
find _bmad-output/sprint-artifacts/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER3" | while read dir; do
  mkdir -p "_bmad-output/sprint-artifacts/archive"
  mv "$dir" "_bmad-output/sprint-artifacts/archive/"
done
```

### Orphan Detection

Artifacts without valid parent references or broken sequences:

```yaml
orphan_detection:
  scan_frequency: daily
  action:
    - Find artifacts where parent_id not found
    - Find artifacts where sequence_number has gaps
    - Find artifacts with expires_at < now and status != ARCHIVED
  alert:
    - Log to _bmad-output/governance/orphans-{YYYY-MM-DD}.yaml
    - Notify human if orphan count > threshold
```

## Artifact Creation Checklist

Before creating ANY artifact, agent must:

1. **Determine Tier** (1-4)
2. **Apply Naming Convention** for that tier
3. **Add Frontmatter** with all required fields
4. **Register** in artifact-registry.yaml
5. **Set expires_at** based on tier retention policy
6. **Link** to parent/related artifacts

## Success Criteria

- [ ] All artifacts follow four-tier system
- [ ] Tier 1 (Standards) are read-only
- [ ] Tier 2 (SSOT) uses line-based updates
- [ ] Tier 3 (Medium-live) auto-archives after 90 days
- [ ] Tier 4 (Short-live) auto-archives after 5 days
- [ ] All artifacts have required frontmatter
- [ ] Orphan detection runs daily
- [ ] Artifact registry tracks all creations

---

**Workflow Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE
