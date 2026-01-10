# Artifact Cleanup Cycle

**Workflow**: Artifact Cleanup Cycle
**Module**: Governance
**Version**: 1.0
**Created**: 2026-01-06

## Purpose

Automated daily cycle that enforces the 5-day active retention policy, archives expired artifacts, and maintains clean context for AI agents.

## Trigger

**Schedule**: Daily at midnight (00:00 +07:00)
**Manual**: Can be triggered via `/governance/artifact-cleanup` command

## Workflow Steps

### Phase 1: Inventory
1. Scan `_bmad-output/artifacts/` for all artifacts
2. Scan `_bmad-output/` root for unorganized artifacts
3. Check `created_at` frontmatter for each artifact
4. Identify artifacts with `expires_at < current_time`

### Phase 2: Archive
1. Create monthly folder if not exists: `_bmad-output/archive/YYYY-MM/`
2. Move expired artifacts to archive folder
3. Update artifact status frontmatter to `ARCHIVED`
4. Log archived artifacts to cleanup log

### Phase 3: Organize
1. Move unorganized artifacts to daily folders
2. Add missing frontmatter to artifacts without it
3. Validate naming convention compliance
4. Report violations for manual review

### Phase 4: Purge (90-day rule)
1. Scan `_bmad-output/archive/` for files >90 days old
2. Check for active references in sprint status files
3. Delete unreferenced files
4. Create backup before deletion

## Configuration

```yaml
retention:
  active_days: 5
  archive_days: 90
  backup_before_delete: true

folders:
  daily: "_bmad-output/artifacts/{YYYY-MM-DD}"
  archive: "_bmad-output/archive/{YYYY-MM}/"
```

## Exit Criteria

- All artifacts >5 days old archived
- Daily folders exist for last 7 days
- Archive count < 200 files
- No artifacts without frontmatter in active folders

## Validation Commands

```bash
# Count active artifacts (should be <50)
find _bmad-output/artifacts -name "*.md" | wc -l

# Check for expired artifacts (should be 0)
find _bmad-output/artifacts -name "*.md" -newermt "5 days ago" | wc -l

# Verify archive folder structure
ls -la _bmad-output/archive/
```

## Handoff

After completion, report to BMAD Master with:
- Number of artifacts archived
- Number of artifacts organized
- Number of files purged
- Any violations found
- Next scheduled run

---

*Workflow created as part of Cycle 1: Governance Foundation*
