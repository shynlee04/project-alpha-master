# Artifact Lifecycle Policy

**Version**: 1.0
**Effective**: 2026-01-06
**Owner**: BMAD Governance Module

## description

This policy defines the four-tier artifact lifecycle to prevent context poisoning and ensure AI agents operate with clean, relevant context.

## Four-Tier Classification

### Tier 1: The Unchangeable (Standards)
**Location**: `agent-os/standards/global/`
**Retention**: Permanent (lock on read)
**Update Protocol**: Notify human if outdated, require explicit authorization

**Files**:
- coding-style.md
- commenting.md
- conventions.md
- error-handling.md
- mcp-research.md
- tech-stack.md
- validation.md

### Tier 2: Strictly Controlled (SSOT)
**Location**: Project root, `_bmad/`, `agent-os/`
**Retention**: Permanent, line-based updates only
**Update Protocol**: Replace lines with frontmatter tracking, never file replacement

**Files**:
- AGENTS.md (root)
- AGENTS.md (module-specific)
- agent-os/product/ (PRD, mission, roadmap)
- agent-os/standards/ (architecture decisions)

### Tier 3: Archiving (Medium-live)
**Location**: `_bmad-output/sprint-artifacts/2026-MM/`
**Retention**: 90 days active, then archive
**Naming**: `{artifact-type}-{YYYY-MM-DD}.md`

**Examples**:
- sprint-status-2026-01-05.yaml
- course-correction-2026-01-03.md
- epic-tracking-2026-01-06.md

### Tier 4: Short-live (Artifacts)
**Location**: `_bmad-output/artifacts/YYYY-MM-DD/`
**Retention**: 5 days active, auto-archive after expiry
**Naming**: `{story-id}-{artifact-type}-{YYYY-MM-DD}.md`
**Frontmatter Required**:
```yaml
---
artifact_id: "ARTIFACT-{timestamp}"
parent_story: "{story_id}"
created_at: "{ISO_timestamp}"
expires_at: "{ISO_timestamp + 5 days}"
status: "ACTIVE | ARCHIVED"
---
```

## Daily Archive Cycle

**Schedule**: Midnight (00:00) daily
**Action**: Move artifacts older than 5 days to monthly archive

**Example**: On January 6, archive all artifacts from January 1 and earlier

## Folder Structure

```
_bmad-output/
├── artifacts/                   # Daily artifacts (5-day retention)
│   ├── 2026-01-06/
│   ├── 2026-01-05/
│   └── 2026-01-04/
├── archive/                     # Monthly archives (90-day retention)
│   ├── 2025-12/
│   └── 2025-11/
└── sprint-artifacts/            # Medium-live (90-day retention)
    ├── 2026-01/
    └── 2025-12/
```

## Enforcement

All agents MUST:
1. Check artifact expiry before reading
2. Reject artifacts with status: ARCHIVED
3. Create artifacts in daily folders
4. Include required frontmatter

## Cleanup Criteria

Archive when:
- `expires_at` < current_time
- File not modified in 5+ days
- Parent story status is DONE

Delete permanently when:
- 90+ days old
- No active references in any sprint status

---

*Policy approved by user on 2026-01-06*
*Retention: 5 days active, 90 days archive*
