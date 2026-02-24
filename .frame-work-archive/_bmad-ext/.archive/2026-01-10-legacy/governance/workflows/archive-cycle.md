# Archive Cycle Workflow

**Workflow ID**: `@bmad/modules/governance/workflows/archive-cycle`
**Version**: 1.0.0
**Created**: 2026-01-06
**description**: Automated archiving of expired artifacts with orphan detection

---

## Archive Schedule

| Tier | Retention | Archive Trigger | Archive Location |
|------|-----------|-----------------|------------------|
| Tier 4 (Short-live) | 5 days | Daily at midnight | `_bmad-output/handoffs/_archive/YYYY-MM/` |
| Tier 3 (Medium-live) | 90 days | Daily at midnight | `_bmad-output/sprint-artifacts/archive/` |
| Tier 2 (SSOT) | Permanent | Never | N/A |
| Tier 1 (Standards) | Permanent | Never | N/A |

## Archive Process

### Step 1: Identify Expired Artifacts

```bash
# Find Tier 4 artifacts older than 5 days
EXPIRY_TIER4=$(date -d "5 days ago" +%Y-%m-%d)

find _bmad-output/handoffs/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER4"

# Find Tier 3 artifacts older than 90 days
EXPIRY_TIER3=$(date -d "90 days ago" +%Y-%m-%d)

find _bmad-output/sprint-artifacts/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER3"
```

### Step 2: Orphan Check

Before archiving, check for orphans:

```yaml
orphan_checks:
  - artifact has valid parent_id reference
  - artifact sequence is intact (no gaps)
  - artifact file exists at registered path
  - artifact is not referenced by any ACTIVE artifact

if orphan_found:
  action: FLAG for review
  do_not_archive: true
  notify: governance-agent
```

### Step 3: Archive Execution

```bash
#!/bin/bash
# _bmad/modules/governance/scripts/archive-cycle.sh

TODAY=$(date +%Y-%m-%d)
EXPIRY_TIER4=$(date -d "5 days ago" +%Y-%m-%d)
EXPIRY_TIER3=$(date -d "90 days ago" +%Y-%m-%d)
LOG_FILE="_bmad-output/governance/archive-${TODAY}.log"

echo "=== Archive Cycle Started: $(date) ===" >> "$LOG_FILE"

# Archive Tier 4 (Short-live)
echo "Archiving Tier 4 artifacts older than $EXPIRY_TIER4..." >> "$LOG_FILE"
find _bmad-output/handoffs/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER4" | while read dir; do
  # Extract month for archive subfolder
  month=$(basename "$dir" | cut -c1-7)

  # Create archive location
  archive_dir="_bmad-output/handoffs/_archive/$month"
  mkdir -p "$archive_dir"

  # Move artifacts
  echo "Archiving: $dir -> $archive_dir" >> "$LOG_FILE"
  mv "$dir"/* "$archive_dir/" 2>/dev/null
  rmdir "$dir" 2>/dev/null

  # Update artifact registry
  # (handled by governance-agent)
done

# Archive Tier 3 (Medium-live)
echo "Archiving Tier 3 artifacts older than $EXPIRY_TIER3..." >> "$LOG_FILE"
find _bmad-output/sprint-artifacts/ -maxdepth 1 -type d -name "20*" ! -newermt "$EXPIRY_TIER3" | while read dir; do
  archive_dir="_bmad-output/sprint-artifacts/archive"
  mkdir -p "$archive_dir"

  echo "Archiving: $dir -> $archive_dir" >> "$LOG_FILE"
  mv "$dir" "$archive_dir/"
done

# Cleanup old archives (older than 1 year)
OLD_ARCHIVE=$(date -d "1 year ago" +%Y-%m-%d)
echo "Cleaning archives older than $OLD_ARCHIVE..." >> "$LOG_FILE"

find _bmad-output/handoffs/_archive/ -maxdepth 1 -type d -name "20*" ! -newermt "$OLD_ARCHIVE" | while read dir; do
  echo "Removing old archive: $dir" >> "$LOG_FILE"
  rm -rf "$dir"
done

echo "=== Archive Cycle Complete: $(date) ===" >> "$LOG_FILE"
```

### Step 4: Registry Update

After archiving, update artifact registry:

```yaml
registry_update:
  scan_archived_directories:
    - _bmad-output/handoffs/_archive/
    - _bmad-output/sprint-artifacts/archive/

  update_artifacts:
    for each archived artifact:
      - status: ARCHIVED
      - path: updated to archive location
      - archived_at: {timestamp}

  increment_counters:
    tier_3_archived: +{count}
    tier_4_archived: +{count}
```

## Orphan Detection Report

Generated daily during archive cycle:

```yaml
# _bmad-output/governance/orphans-{YYYY-MM-DD}.yaml

date: "2026-01-06"
scan_time: "2026-01-06T00:00:00Z"
total_artifacts_scanned: 150
orphans_found: 3

orphans:
  - id: "ARC-STORE-001-handoff"
    reason: "parent_id E2-STORE not found"
    path: "_bmad-output/handoffs/2026-01-05/ARC-STORE-001-handoff.md"
    action: "flagged for review"

  - id: "E2-MODAL-002-validation"
    reason: "sequence gap: E2-MODAL-001 not found"
    path: "_bmad-output/handoffs/2026-01-04/E2-MODAL-002-validation.md"
    action: "flagged for review"

  - id: "DS-SCAN-005-report"
    reason: "file not found at registered path"
    registered_path: "_bmad-output/reports/deep-scan/DS-SCAN-005-report.md"
    action: "removed from registry"

recommendations:
  - "Review orphaned artifacts and restore or delete"
  - "Update parent references where applicable"
  - "Check for sequence gaps in active stories"
```

## Manual Archive Triggers

Agents can trigger manual archive when:

1. **Story completes**: All Tier 4 artifacts for story moved to archive
2. **Epic completes**: All Tier 3 artifacts for epic moved to archive
3. **Context cleanup**: User explicitly requests cleanup

```bash
# Manual archive command (can be called by agents)
/bmad/governance/archive --story=ARC-STORE-001
/bmad/governance/archive --epic=E2
/bmad/governance/archive --cleanup=all
```

## Success Criteria

- [ ] Tier 4 artifacts auto-archive after 5 days
- [ ] Tier 3 artifacts auto-archive after 90 days
- [ ] Archives older than 1 year deleted
- [ ] Orphan detection runs daily
- [ ] Registry updated after each archive cycle
- [ ] Archive logs generated daily
- [ ] Manual archive triggers work for agents

## File Structure After Archive

```
_bmad-output/
├── handoffs/
│   ├── 2026-01-06/              # Today - active
│   │   └── ARC-STORE-005-handoff.md
│   ├── 2026-01-05/              # Yesterday - active
│   │   └── E2-MODAL-003-report.md
│   └── _archive/
│       ├── 2025-12/              # Last month - archived
│       │   └── ARC-STORE-001-handoff.md
│       └── 2025-11/              # November - archived
│           └── E2-MODAL-001-validation.md
│
├── sprint-artifacts/
│   ├── 2026-01/                 # This month - active
│   │   ├── sprint-status-2026-01-06.yaml
│   │   └── epic-breakdown-2026-01-05.md
│   └── archive/                 # Older than 90 days
│       └── 2025-10/
│           └── sprint-status-2025-10-15.yaml
│
└── governance/
    ├── archive-2026-01-06.log    # Today's archive log
    ├── orphans-2026-01-06.yaml   # Orphan report
    └── artifact-registry.yaml     # Updated registry
```

---

**Workflow Owner**: @bmad/modules/governance
**Last Updated**: 2026-01-06
**Status**: ACTIVE
