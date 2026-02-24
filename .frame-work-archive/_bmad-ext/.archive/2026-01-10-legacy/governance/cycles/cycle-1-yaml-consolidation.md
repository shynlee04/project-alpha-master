---
id: CYCLE-1
title: YAML Consolidation
description: Reduce YAML files in _bmad-output to prevent context poisoning
agent_mode: bmad-bmm-sm
team: A
duration_hours: 1-2
risk_level: HIGH
date: 2026-01-09
---

# CYCLE 1: YAML Consolidation

**Agent Mode:** @bmad-bmm-sm (Scrum Master)
**Team:** A
**Duration:** 1-2 hours
**Context Poisoning Risk:** HIGHEST

## OBJECTIVE

Reduce 44 YAML files in `_bmad-output/` to ≤15 active files via archival and consolidation. This cycle has the highest impact on context poisoning reduction.

## PRECONDITIONS

- [ ] Read current YAML file inventory
- [ ] Identify files older than 24 hours
- [ ] Check sprint-status for stale phases

## ARCHIVE TARGETS

### Sprint Artifacts to Archive

Move to `_bmad-output/.archive/{YYYY-MM-DD}/sprint-artifacts/`:

```yaml
archive_immediately:
  - "phase-1-sprint-status-2026-01-08.yaml"  # Superseded by phase-1.5
  - "course-correction-execution-status-2026-01-07.yaml"  # 2+ days old
  - "course-correction-execution-status-2026-01-08.yaml"  # 1+ day old
  - "diagnostic-remediation-sprint-*.yaml"  # Merge into sprint-status.yaml
```

### Diagnostics to Archive

Move to `_bmad-output/.archive/{YYYY-MM-DD}/diagnostics/`:

```yaml
archive_diagnostics:
  - "codebase-diagnostic-2026-01-08/"  # 32 files, yesterday
  - "routing-deep-scan-2026-01-08/"    # 3 files, yesterday
```

### Handoffs to Archive

Move to `_bmad-output/.archive/{YYYY-MM-DD}/handoffs/`:

```yaml
archive_handoffs:
  - All handoff files with date 2026-01-08 or older
  - Exception: Keep active handoffs for current sprint
```

## EXECUTION COMMANDS

```bash
# 1. Create archive folder structure
mkdir -p _bmad-output/.archive/$(date +%Y-%m-%d)/sprint-artifacts
mkdir -p _bmad-output/.archive/$(date +%Y-%m-%d)/diagnostics
mkdir -p _bmad-output/.archive/$(date +%Y-%m-%d)/handoffs
mkdir -p _bmad-output/.archive/$(date +%Y-%m-%d)/workflow-history

# 2. Archive stale sprint files
mv _bmad-output/sprint-artifacts/phase-1-sprint-status-2026-01-08.yaml \
   _bmad-output/.archive/$(date +%Y-%m-%d)/sprint-artifacts/
mv _bmad-output/sprint-artifacts/course-correction-*.yaml \
   _bmad-output/.archive/$(date +%Y-%m-%d)/sprint-artifacts/

# 3. Archive stale diagnostics (entire folders)
mv _bmad-output/diagnostics/codebase-diagnostic-2026-01-08 \
   _bmad-output/.archive/$(date +%Y-%m-%d)/diagnostics/
mv _bmad-output/diagnostics/routing-deep-scan-2026-01-08 \
   _bmad-output/.archive/$(date +%Y-%m-%d)/diagnostics/

# 4. Archive stale handoffs
mv _bmad-output/handoffs/*-2026-01-08.md \
   _bmad-output/.archive/$(date +%Y-%m-%d)/handoffs/

# 5. Count remaining active YAML files
find _bmad-output -name "*.yaml" -not -path "*/.archive/*" | wc -l
```

## CONSOLIDATION RULES

### Sprint Status Consolidation

If multiple sprint status files exist for the same date:

1. Identify the PRIMARY sprint (latest updated)
2. Extract ACTIVE stories from other files
3. Merge into primary sprint-status.yaml
4. Archive originals with suffix `-merged`

### Maximum Active Files

| Category | Max Active | Current | Action |
|----------|------------|---------|--------|
| Sprint YAML | 4 | Count | Archive oldest |
| Diagnostic folders | 2 | Count | Archive older |
| Continuation capsules | 0 | Count | All to archive |

## VALIDATION CHECKLIST

- [ ] `find _bmad-output -name "*.yaml" -not -path "*/.archive/*" | wc -l` returns ≤15
- [ ] No YAML file older than 24 hours in active folders
- [ ] Maximum 4 sprint status files remain active
- [ ] Archived files are in timestamped folders
- [ ] sprint-status.yaml is the single source of sprint truth

## OUTPUT ARTIFACTS

1. **Archive Log**: `_bmad-output/.archive/{date}/ARCHIVE-LOG.md`
   - List of archived files with original locations
   - Timestamp of archival
   - Reason for archival

2. **Consolidation Report**: `_bmad-output/governance/consolidation-report-{date}.md`
   - Before/after file counts
   - Active sprint files list
   - Any merge conflicts resolved

## HANDOFF

Report completion to @bmad-core-bmad-master with:
- Files archived count
- Files remaining count
- Any issues encountered
- Recommendation for next cycle

## AUTOMATION HOOK

Add to `.claude/hooks/daily-governance.sh`:

```bash
#!/bin/bash
# Daily YAML consolidation check
yaml_count=$(find _bmad-output -name "*.yaml" -not -path "*/.archive/*" | wc -l)
if [ $yaml_count -gt 20 ]; then
  echo "⚠️ GOVERNANCE ALERT: $yaml_count YAML files exceed threshold (20)"
  echo "Run: CYCLE 1 - YAML Consolidation"
fi
```
